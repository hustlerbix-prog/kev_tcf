import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const WHISPER_MODEL = "whisper-1";
const WHISPER_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

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

const PROMPT_HINT =
  "Transcription d'une réponse orale en français (français du Canada / québécois accepté) dans le cadre de l'examen TCF Canada — expression orale. Respectez : accents (é, è, ê, à, â, î, ô, û, ù, ç), nombres écrits en chiffres quand prononcés ('28 ans', '150 $', '3 mois'), dates, noms propres, apostrophes (j', n', c', s'), trait d'union, majuscules en début de phrase et ponctuation (. , ! ? ;). Si silence ou aucun mot audible, renvoyez une chaîne vide.";

async function runWhisper(
  audioFile: { absPath: string; mimeType: string; filename: string; bytes: number },
  opts: {
    language?: string;
    prompt?: string;
    timestampGranularity?: ("segment" | "word")[];
  }
): Promise<{ data: TranscribeResponseOK | null; err: TranscribeResponseErr["error"] | null; rawStatus: number }> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return {
      data: null,
      err: { code: "MISSING_OPENAI_KEY", message: "Clé OpenAI absente (variable OPENAI_API_KEY).", httpStatus: 500 },
      rawStatus: 500,
    };
  }
  const fs = await import("node:fs");
  const form = new FormData();
  const stream = fs.createReadStream(audioFile.absPath);
  form.set("file", stream as unknown as Blob, audioFile.filename);
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

const TMP_DIR = path.join(tmpdir(), "tfc-whisper-tmp");

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

  // 1. Dump to tmp file on disk (Whisper OpenAI API needs a file upload)
  const suffix = randomBytes(4).toString("hex");
  const hash = createHash("sha1").update(new Uint8Array(audioBuffer)).digest("hex").slice(0, 12);
  await mkdir(TMP_DIR, { recursive: true });
  const absPath = path.join(TMP_DIR, `eo_turn_${Date.now()}_${hash}_${suffix}.webm`);
  try {
    await writeFile(absPath, Buffer.from(audioBuffer));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: { code: "DISK", message: `Impossible d'écrire fichier temporaire : ${msg}` } },
      { status: 500 }
    );
  }

  const bytes = audioBuffer.byteLength;
  try {
    const { data, err } = await runWhisper(
      { absPath, mimeType, filename, bytes },
      { language: "fr", prompt: PROMPT_HINT, timestampGranularity: ["segment", "word"] }
    );
    // cleanup tmp file ASAP
    void unlink(absPath).catch(() => {});
    if (err) {
      const statusFwd = err.httpStatus >= 400 && err.httpStatus < 600 ? err.httpStatus : 502;
      return NextResponse.json(
        {
          ok: false,
          fallback_hint:
            "Utilisez la saisie texte ou la reconnaissance vocale native du navigateur en attendant.",
          error: err,
        },
        { status: statusFwd }
      );
    }
    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "EMPTY_WHISPER", message: "Whisper n'a retourné aucune transcription." },
        },
        { status: 502 }
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
      } satisfies {
        ok: true;
        transcription: string;
        language: string;
        duration_sec: number;
        bytes: number;
        segments: TranscribeResponseOK["segments"] | null;
        words: TranscribeResponseOK["words"] | null;
      },
      { status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    void unlink(absPath).catch(() => {});
    return NextResponse.json(
      { ok: false, error: { code: "UNKNOWN", message: `Transcription échouée : ${msg}` } },
      { status: 500 }
    );
  }
}
