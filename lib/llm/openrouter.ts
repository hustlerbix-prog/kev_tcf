import type { LLMSettings } from "@/lib/types/tcf";

export interface OpenRouterResponse {
  id?: string;
  model?: string;
  choices?: {
    message?: { role?: string; content?: string };
    delta?: { role?: string; content?: string };
    finish_reason?: string | null;
  }[];
  content?: { type?: string; text?: string }[];
  error?: { message?: string; code?: string };
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface OpenRouterModel {
  id: string;
  name?: string;
  description?: string;
  provider?: string;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  context_length?: number;
  architecture?: {
    modality?: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
}

const ENTITES_HTML: Record<string, string> = {
  "&gt;": ">",
  "&lt;": "<",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/**
 * Filet défensif : certains modèles "raisonneurs" (o1, r1, gemini-thinking…)
 * font fuiter leur chaîne de pensée en tête de réponse au lieu du seul JSON
 * demandé (ex : "The user wants me to..." avant le premier "{"), parfois avec
 * des entités HTML échappées (-&gt; pour ->). On coupe tout ce qui précède la
 * première accolade et on décode les entités courantes avant de renvoyer le
 * texte au parseur JSON.
 */
function nettoyerRaisonnement(texte: string): string {
  let t = texte.replace(/<think>[\s\S]*?<\/think>/gi, "");
  const i = t.indexOf("{");
  if (i > 0) t = t.slice(i);
  for (const [entite, car] of Object.entries(ENTITES_HTML)) {
    t = t.split(entite).join(car);
  }
  return t;
}

export async function appelOpenRouter(
  prompt: string,
  settings: LLMSettings,
  system?: string,
  options?: {
    response_format?: "json_object" | "json_schema";
    json_schema?: Record<string, unknown>;
  }
): Promise<{ texte: string; model_utilisé: string; raw?: OpenRouterResponse }> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY non configurée dans l'environnement");
  }

  const messages: { role: "system" | "user"; content: string }[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const construireBody = (avecResponseFormat: boolean): Record<string, unknown> => {
    const body: Record<string, unknown> = {
      model: settings.model,
      temperature: settings.temperature ?? 0.2,
      max_tokens: settings.max_tokens ?? 1000,
      messages,
      reasoning: { exclude: true },
    };
    if (typeof settings.top_p === "number") body.top_p = settings.top_p;
    if (avecResponseFormat && options?.response_format) {
      if (options.response_format === "json_schema" && options.json_schema) {
        body.response_format = {
          type: "json_schema",
          json_schema: options.json_schema,
        };
      } else if (options.response_format === "json_object") {
        body.response_format = { type: "json_object" };
      }
    }
    return body;
  };

  const referer =
    process.env.NEXT_PUBLIC_OPENROUTER_REFERRER ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://tcf-canada.app";

  const headers = {
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
    "HTTP-Referer": referer,
    "X-Title": "TCF Canada · Expression Écrite",
  };

  const fetchOne = async (body: Record<string, unknown>): Promise<{ brut: string; r: Response; d: OpenRouterResponse }> => {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const brut = await r.text();
    let d: OpenRouterResponse;
    try {
      d = JSON.parse(brut) as OpenRouterResponse;
    } catch {
      d = { error: { message: "parse response JSON failed", code: "parse" } };
    }
    return { brut, r, d };
  };

  // Premier essai AVEC response_format (si demandé)
  let { brut, r, d } = await fetchOne(construireBody(Boolean(options?.response_format)));

  // Fallback silencieux : si 400 et erreur mentionne response_format → retenter SANS
  if (
    options?.response_format &&
    !r.ok &&
    (r.status === 400 || r.status === 422) &&
    (d?.error?.message?.toLowerCase().includes("response_format") ||
      String(brut).toLowerCase().includes("response_format"))
  ) {
    const retry = await fetchOne(construireBody(false));
    brut = retry.brut;
    r = retry.r;
    d = retry.d;
  }

  if (d && d.error) {
    throw new Error(d.error.message || "Erreur OpenRouter");
  }
  if (!r.ok) {
    throw new Error("HTTP " + r.status + " · " + brut.slice(0, 300));
  }

  let texte = "";
  const choice0 = d.choices?.[0];
  if (choice0?.message?.content) {
    texte = choice0.message.content;
  } else if (d.content?.length) {
    texte = d.content
      .filter((c) => c.type === "text")
      .map((c) => c.text || "")
      .join("\n");
  }
  if (!texte) {
    throw new Error("Réponse OpenRouter vide");
  }
  return {
    texte: nettoyerRaisonnement(texte).trim(),
    model_utilisé: d.model || settings.model,
    raw: d,
  };
}

export async function listModelsOpenRouter(): Promise<OpenRouterModel[]> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return [];
  try {
    const r = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: "Bearer " + key },
    });
    if (!r.ok) return [];
    const j = (await r.json()) as { data?: OpenRouterModel[] };
    return j.data || [];
  } catch {
    return [];
  }
}
