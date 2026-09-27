import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const WHISPER_MODEL = "whisper-1";
const WHISPER_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
// Must be a model that accepts `input_audio` content on OpenRouter (audio-capable,
// e.g. Gemini) — most text-only models (including anthropic/claude-sonnet-4, used
// elsewhere in this app) reject audio input entirely.
const OPENROUTER_TRANSCRIBE_MODEL = process.env.OPENROUTER_TRANSCRIBE_MODEL?.trim() || "google/gemini-2.5-flash";

type TranscribeResponseOK = {
  text: string;
  duration_sec: number;
  language: string;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens?: number[];
  }>;
  words?: Array<{ word: string; start: number; end: number }>;
  error?: never;
};

type TranscribeResponseErr = {
  text?: never;
  error: {
    code: string;
    message: string;
    httpStatus: number;
  };
};

type EngineResult = { data: TranscribeResponseOK | null; err: TranscribeResponseErr["error"] | null; rawStatus: number };

const PROMPT_HINT =
  "Transcription d'une réponse orale en français (français du Canada / québécois accepté) dans le cadre de l'examen TCF Canada — expression orale. Respectez : accents (é, è, ê, à, â, î, ô, û, ù, ç), nombres écrits en chiffres quand prononcés ('28 ans', '150 $', '3 mois'), dates, noms propres, apostrophes (j', n', c', s'), trait d'union, majuscules en début de phrase et ponctuation (. , ! ? ;). Si silence ou aucun mot audible, renvoyez une chaîne vide.";

/**
 * Decodes the browser's recorded WebM/Opus audio to 16kHz mono WAV, entirely
 * in memory (stdin/stdout pipes — no temp file, same reasoning as the fix
 * that removed the temp-file race from this route: a real file on disk is
 * one more thing that can vanish out from under an in-flight read).
 * OpenRouter's audio input only accepts WAV/MP3/AIFF/AAC/OGG/FLAC/M4A/PCM —
 * WebM isn't in that list, so this conversion is required before the
 * OpenRouter path can be attempted at all. Whisper accepts WebM directly and
 * doesn't need this.
 */
function transcodeWebmToWav(input: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ff = spawn(ffmpegPath.path, [
      "-hide_banner",
      "-loglevel", "error",
      "-i", "pipe:0",
      "-ar", "16000",
      "-ac", "1",
      "-f", "wav",
      "pipe:1",
    ]);
    const outChunks: Buffer[] = [];
    const errChunks: Buffer[] = [];
    ff.stdout.on("data", (c: Buffer) => outChunks.push(c));
    ff.stderr.on("data", (c: Buffer) => errChunks.push(c));
    ff.on("error", (e) => reject(new Error(`ffmpeg introuvable ou n'a pas pu démarrer : ${e.message}`)));
    ff.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg a échoué (code ${code}) : ${Buffer.concat(errChunks).toString("utf-8").slice(0, 300)}`));
        return;
      }
      resolve(Buffer.concat(outChunks));
    });
    ff.stdin.on("error", () => {
      // EPIPE if ffmpeg exits before stdin is fully written — the "close"
      // handler above already reports the real failure reason.
    });
    ff.stdin.end(input);
  });
}

async function runOpenRouterTranscribe(
  audioFile: { buffer: ArrayBuffer; mimeType: string },
  opts: { prompt?: string }
): Promise<EngineResult> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    return {
      data: null,
      err: { code: "MISSING_OPENROUTER_KEY", message: "Clé OpenRouter absente (variable OPENROUTER_API_KEY).", httpStatus: 500 },
      rawStatus: 500,
    };
  }

  let wavBuffer: Buffer;
  try {
    wavBuffer = await transcodeWebmToWav(Buffer.from(audioFile.buffer));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      data: null,
      err: { code: "TRANSCODE_FAILED", message: `Conversion audio échouée : ${msg}`, httpStatus: 500 },
      rawStatus: 500,
    };
  }

  const base64 = wavBuffer.toString("base64");
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 55_000);
  try {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://tcf-canada.app",
        "X-Title": "TCF Canada · Expression Orale",
      },
      body: JSON.stringify({
        model: OPENROUTER_TRANSCRIBE_MODEL,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  (opts.prompt ?? PROMPT_HINT) +
                  "\n\nRenvoie UNIQUEMENT la transcription telle quelle, sans commentaire, sans guillemets, sans préambule.",
              },
              { type: "input_audio", input_audio: { data: base64, format: "wav" } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(to);
    const rawStatus = res.status;
    const bodyText = await res.text();
    let json: { choices?: { message?: { content?: string } }[]; error?: { message?: string; code?: string } };
    try {
      json = JSON.parse(bodyText);
    } catch {
      json = { error: { message: "Réponse OpenRouter non-JSON", code: "PARSE" } };
    }
    if (rawStatus < 200 || rawStatus >= 300 || json.error) {
      return {
        data: null,
        err: {
          code: json.error?.code ? String(json.error.code) : `HTTP_${rawStatus}`,
          message: json.error?.message || `OpenRouter a répondu HTTP ${rawStatus}.`,
          httpStatus: rawStatus >= 400 ? rawStatus : 502,
        },
        rawStatus,
      };
    }
    const text = (json.choices?.[0]?.message?.content ?? "").trim();
    return {
      data: { text, duration_sec: 0, language: "fr" },
      err: null,
      rawStatus,
    };
  } catch (err) {
    clearTimeout(to);
    const msg = err instanceof Error ? err.message : String(err);
    const aborted = msg.toLowerCase().includes("abort");
    return {
      data: null,
      err: {
        code: aborted ? "TIMEOUT" : "NETWORK",
        message: aborted ? "OpenRouter a mis trop de temps à répondre (>55s)." : `Erreur réseau OpenRouter : ${msg}`,
        httpStatus: 502,
      },
      rawStatus: 502,
    };
  }
}

async function runWhisper(
  audioFile: { buffer: ArrayBuffer; mimeType: string; filename: string; bytes: number },
  opts: {
    language?: string;
    prompt?: string;
    timestampGranularity?: ("segment" | "word")[];
  }
): Promise<EngineResult> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return {
      data: null,
      err: { code: "MISSING_OPENAI_KEY", message: "Clé OpenAI absente (variable OPENAI_API_KEY).", httpStatus: 500 },
      rawStatus: 500,
    };
  }
  const form = new FormData();
  const blob = new Blob([audioFile.buffer], { type: audioFile.mimeType });
  form.set("file", blob, audioFile.filename);
  form.set("model", WHISPER_MODEL);
  form.set("response_format", "verbose_json");
  form.set("language", opts.language ?? "fr");
  form.set("prompt", opts.prompt ?? PROMPT_HINT);
  if (opts.timestampGranularity?.length) {
    form.set("timestamp_granularities[]", "word");
    form.set("timestamp_granularities[]", "segment");
  }
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 55_000);
  try {
    const res = await fetch(WHISPER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
      },
      body: form as BodyInit,
      signal: controller.signal,
      ...({ duplex: "half" } as { duplex?: "half" | "full" }),
    });
    clearTimeout(to);
    const rawStatus = res.status;
    if (rawStatus >= 200 && rawStatus < 300) {
      const json = (await res.json()) as {
        text?: string;
        language?: string;
        duration?: number;
        segments?: TranscribeResponseOK["segments"];
        words?: TranscribeResponseOK["words"];
      };
      const durationSec =
        json.duration && Number.isFinite(Number(json.duration))
          ? Math.round(Number(json.duration) * 100) / 100
          : 0;
      return {
        data: {
          text: (json.text ?? "").trim(),
          duration_sec: durationSec,
          language: json.language ?? "fr",
          segments: json.segments,
          words: json.words,
        },
        err: null,
        rawStatus,
      };
    }
    const textBody = await res.text().catch(() => "");
    let message = `Whisper a répondu HTTP ${rawStatus}.`;
    let code = `HTTP_${rawStatus}`;
    try {
      const obj = JSON.parse(textBody) as { error?: { message?: string; code?: string } };
      if (obj?.error?.message) message = obj.error.message;
      if (obj?.error?.code) code = String(obj.error.code);
    } catch {
      if (textBody) message += " " + textBody.slice(0, 240);
    }
    return { data: null, err: { code, message, httpStatus: rawStatus }, rawStatus };
  } catch (err) {
    clearTimeout(to);
    const msg = err instanceof Error ? err.message : String(err);
    const aborted = msg.toLowerCase().includes("abort");
    return {
      data: null,
      err: {
        code: aborted ? "TIMEOUT" : "NETWORK",
        message: aborted ? "Whisper a mis trop de temps à répondre (>55s)." : `Erreur réseau Whisper : ${msg}`,
        httpStatus: 502,
      },
      rawStatus: 502,
    };
  }
}

export async function POST(req: Request) {
  let contentType = "";
  try {
    contentType = req.headers.get("content-type") ?? "";
  } catch {
    /* ignore */
  }
  const isMultipart = contentType.includes("multipart/form-data");
  let audioBuffer: ArrayBuffer | null = null;
  let mimeType = "audio/webm;codecs=opus";
  let filename = "voice_note.webm";

  if (isMultipart) {
    try {
      const fd = await req.formData();
      const f = fd.get("audio") as File | null;
      const typeField = (fd.get("mimeType") as string | null)?.trim();
      const nameField = (fd.get("filename") as string | null)?.trim();
      if (!f || typeof f.arrayBuffer !== "function") {
        return NextResponse.json(
          { ok: false, error: { code: "NO_AUDIO", message: "Champ FormData 'audio' (type File) absent." } },
          { status: 400 }
        );
      }
      audioBuffer = await f.arrayBuffer();
      mimeType = typeField || f.type || mimeType;
      filename = nameField || f.name || filename;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        { ok: false, error: { code: "BAD_FORM", message: `FormData invalide : ${msg}` } },
        { status: 400 }
      );
    }
  } else {
    // Fallback: raw body = audio binary (simple)
    try {
      audioBuffer = await req.arrayBuffer();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        { ok: false, error: { code: "NO_BODY", message: `Body binaire absent : ${msg}` } },
        { status: 400 }
      );
    }
  }

  if (!audioBuffer || audioBuffer.byteLength < 1024) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "AUDIO_TOO_SMALL",
          message: `Audio trop court (${audioBuffer?.byteLength ?? 0} octets). Minimum 1 Ko.`,
        },
      },
      { status: 400 }
    );
  }
  if (audioBuffer.byteLength > 26 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: { code: "AUDIO_TOO_BIG", message: "Audio dépasse 26 Mo." } },
      { status: 413 }
    );
  }

  const bytes = audioBuffer.byteLength;

  // OpenRouter first (per user request — lets them verify it works
  // independently of OpenAI account status), Whisper as fallback.
  const attempts: { provider: "openrouter" | "whisper"; run: () => Promise<EngineResult> }[] = [
    {
      provider: "openrouter",
      run: () => runOpenRouterTranscribe({ buffer: audioBuffer!, mimeType }, { prompt: PROMPT_HINT }),
    },
    {
      provider: "whisper",
      run: () =>
        runWhisper(
          { buffer: audioBuffer!, mimeType, filename, bytes },
          { language: "fr", prompt: PROMPT_HINT, timestampGranularity: ["segment", "word"] }
        ),
    },
  ];

  const errors: { provider: string; err: TranscribeResponseErr["error"] }[] = [];

  try {
    for (const attempt of attempts) {
      const { data, err } = await attempt.run();
      if (err) {
        errors.push({ provider: attempt.provider, err });
        continue;
      }
      if (!data || !data.text) {
        // Empty transcription isn't an engine failure — no need to fall
        // back, an empty answer from the fallback engine wouldn't help.
        return NextResponse.json(
          {
            ok: true,
            transcription: "",
            language: data?.language ?? "fr",
            duration_sec: data?.duration_sec ?? 0,
            bytes,
            segments: data?.segments ?? null,
            words: data?.words ?? null,
            provider: attempt.provider,
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        {
          ok: true,
          transcription: data.text,
          language: data.language,
          duration_sec: data.duration_sec,
          bytes,
          segments: data.segments ?? null,
          words: data.words ?? null,
          provider: attempt.provider,
        } satisfies {
          ok: true;
          transcription: string;
          language: string;
          duration_sec: number;
          bytes: number;
          segments: TranscribeResponseOK["segments"] | null;
          words: TranscribeResponseOK["words"] | null;
          provider: string;
        },
        { status: 200 }
      );
    }

    // Every engine failed.
    const last = errors[errors.length - 1]!;
    const statusFwd = last.err.httpStatus >= 400 && last.err.httpStatus < 600 ? last.err.httpStatus : 502;
    return NextResponse.json(
      {
        ok: false,
        fallback_hint: "Utilisez la saisie texte en attendant.",
        error: last.err,
        attempts: errors,
      },
      { status: statusFwd }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: { code: "UNKNOWN", message: `Transcription échouée : ${msg}` } },
      { status: 500 }
    );
  }
}
