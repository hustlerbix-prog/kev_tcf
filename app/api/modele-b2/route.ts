import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LLMSettings, PromptsSettings } from "@/lib/types/tcf";
import { TACHES } from "@/lib/heuristiques/taches";
import { appelOpenRouter } from "@/lib/llm/openrouter";
import { DEFAULTS, inviteModeleB2 } from "@/lib/llm/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  tache_num: 1 | 2 | 3;
  consigne?: string;
  copie: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ erreur: "JSON invalide" }, { status: 400 });
  }
  if (!body || !body.tache_num || !body.copie) {
    return NextResponse.json(
      { erreur: "Champs requis : tache_num, copie" },
      { status: 400 }
    );
  }
  const tache = TACHES[body.tache_num];
  if (!tache) {
    return NextResponse.json({ erreur: "Tâche invalide" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: setLlm } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "llm_main")
    .maybeSingle();
  const { data: setPr } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "prompts_main")
    .maybeSingle();

  const llm = (setLlm?.value as LLMSettings | null) ?? {
    provider: "openrouter",
    model: "anthropic/claude-sonnet-4",
    temperature: 0.7,
    max_tokens: 1200,
    top_p: 1,
  };
  const prompts = (setPr?.value as PromptsSettings | null) ?? {
    invite_correction: DEFAULTS.invite_correction,
    invite_modele_b2: DEFAULTS.invite_modele_b2,
  };

  const prompt = inviteModeleB2(prompts.invite_modele_b2, {
    consigne: body.consigne?.trim() || "",
    copie: body.copie.trim(),
    tache,
  });

  try {
    const res = await appelOpenRouter(prompt, { ...llm, temperature: 0.7 });
    const rep = res.texte;
    const mm = rep.split(/FORMULES/i);
    const modele = mm[0].replace(/^\s*MODÈLE\s*/i, "").trim();
    const formules = (mm[1] || "")
      .split(/\n/)
      .map((l) => l.replace(/^\s*[-•*\d.)\s]+/, "").trim())
      .filter((l) => l.length > 3);
    return NextResponse.json({ modele, formules });
  } catch (e) {
    return NextResponse.json(
      {
        erreur: "Erreur appel LLM",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 502 }
    );
  }
}
