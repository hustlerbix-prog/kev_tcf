import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LLMSettings } from "@/lib/types/tcf";
import type { ExaminerTurnResult, TaskId } from "@/lib/types/eo";
import { appelOpenRouter } from "@/lib/llm/openrouter";
import { examinerSystems, repairExaminerJson } from "@/lib/llm/examinerPrompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ExaminerTurnRequest {
  task: 1 | 2 | 3;
  archetype: {
    id?: string;
    consigne?: string;
    question_ouverture?: string | null;
    required_moves?: string[] | null;
    examiner_role?: string | null;
    scene_facts?: string[] | null;
    complication?: string | null;
    arguments_pour?: string[] | null;
    arguments_contre?: string[] | null;
  };
  transcript: Array<{ role: "examiner" | "candidate"; text: string }>;
}

export async function POST(req: Request) {
  let body: ExaminerTurnRequest;
  try {
    body = (await req.json()) as ExaminerTurnRequest;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (!body || !body.task || ![1, 2, 3].includes(body.task)) {
    return NextResponse.json(
      { error: "Champ task requis (1|2|3)" },
      { status: 400 }
    );
  }

  const task = body.task as TaskId;
  const systemPrompt = examinerSystems[task];

  const consigne = body.archetype?.consigne?.trim() || "(consigne non fournie)";
  const examinerRole =
    body.archetype?.examiner_role?.trim() || "Examinateur neutre";
  const questionOuverture = body.archetype?.question_ouverture?.trim();
  const requiredMoves = body.archetype?.required_moves || [];
  const sceneFacts = body.archetype?.scene_facts || [];
  const complication = body.archetype?.complication?.trim();
  const argumentsPour = body.archetype?.arguments_pour || [];
  const argumentsContre = body.archetype?.arguments_contre || [];

  const transcriptArr = Array.isArray(body.transcript) ? body.transcript : [];

  const extraContextParts: string[] = [];
  if (questionOuverture) {
    extraContextParts.push(`QUESTION_OUVERTURE:\n${questionOuverture}`);
  }
  if (requiredMoves && requiredMoves.length > 0) {
    extraContextParts.push(
      `REQUIRED_MOVES (questions/actions attendues du CANDIDAT, pas de toi):\n` +
        requiredMoves.map((m, i) => `  ${i + 1}. ${m}`).join("\n")
    );
  }
  if (sceneFacts && sceneFacts.length > 0) {
    extraContextParts.push(
      `SCENE_FACTS (ne dévoiler QUE si le candidat demande):\n` +
        sceneFacts.map((f, i) => `  ${i + 1}. ${f}`).join("\n")
    );
  }
  if (complication) {
    extraContextParts.push(`COMPLICATION (garde SECRÈTE, ne mentionner QUE si candidat demande ou si la situation l'impose):\n  ${complication}`);
  }
  if (argumentsPour && argumentsPour.length > 0) {
    extraContextParts.push(
      `ARGUMENTS_POUR (pour rebonds si candidat en parle):\n` +
        argumentsPour.map((a, i) => `  ${i + 1}. ${a}`).join("\n")
    );
  }
  if (argumentsContre && argumentsContre.length > 0) {
    extraContextParts.push(
      `ARGUMENTS_CONTRE (pour rebonds si candidat en parle):\n` +
        argumentsContre.map((a, i) => `  ${i + 1}. ${a}`).join("\n")
    );
  }

  const historiqueLines = transcriptArr
    .map((t) => `${t.role.toUpperCase()}: ${t.text}`)
    .join("\n");

  const lastCandidateText = [...transcriptArr]
    .reverse()
    .find((t) => t.role === "candidate")?.text;

  const premierTour =
    transcriptArr.length === 0 ||
    transcriptArr.every((t) => t.role !== "candidate");

  const userPrompt = [
    `CONSIGNE:\n${consigne}`,
    ``,
    `ROLE EXAMINATEUR:\n${examinerRole}`,
    ...(extraContextParts.length > 0 ? ["", ...extraContextParts] : []),
    ``,
    `HISTORIQUE:\n${historiqueLines || "(pas encore d'échange)"}`,
    ``,
    `DERNIER MESSAGE CANDIDAT: ${
      lastCandidateText?.trim() ||
      (premierTour ? "(premier tour, ouvrez la conversation)" : "")
    }`,
  ].join("\n");

  let llm: LLMSettings;
  try {
    const supabase = await createClient();
    const { data: setLlm } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "llm_main")
      .maybeSingle();
    llm = (setLlm?.value as LLMSettings | null) ?? {
      provider: "openrouter",
      model: "anthropic/claude-sonnet-4",
      temperature: 0.7,
      max_tokens: 600,
      top_p: 1,
    };
  } catch {
    llm = {
      provider: "openrouter",
      model: "anthropic/claude-sonnet-4",
      temperature: 0.7,
      max_tokens: 600,
      top_p: 1,
    };
  }

  const llmForTurn: LLMSettings = {
    ...llm,
    temperature: 0.7,
    max_tokens: llm.max_tokens ?? 600,
  };

  try {
    const res = await appelOpenRouter(
      userPrompt,
      llmForTurn,
      systemPrompt,
      { response_format: "json_object" }
    );

    const raw = res.texte;
    const repaired = repairExaminerJson(raw);

    const result: ExaminerTurnResult = {
      speech: repaired.speech,
      internalNote: repaired.internalNote,
      shouldAdvance: repaired.shouldAdvance,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Erreur appel examinateur LLM",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
