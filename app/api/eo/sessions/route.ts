import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ModeId } from "@/lib/types/eo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_MODES: ModeId[] = ["drill_text", "drill_voice", "conversation", "full_exam", "review"];

interface PostBody {
  mode?: ModeId;
  user_id?: string;
  target_note_20?: number;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("eo_sessions")
      .select(
        `
        *,
        eo_task_runs (
          id,
          task,
          archetype_id,
          overtime_seconds,
          prep_notes,
          metrics,
          eo_turns (
            id,
            role,
            text,
            start_ms,
            end_ms,
            internal_note
          )
        )
      `
      )
      .order("started_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("eo_sessions GET error:", error);
      return NextResponse.json({ erreur: error.message, sessions: [] }, { status: 500 });
    }

    const sessions = (data ?? []).map((row) => {
      const runs = Array.isArray(row.eo_task_runs) ? row.eo_task_runs : [];
      const tasks = runs.map((r: Record<string, unknown>) => ({
        id: r.id,
        task: r.task,
        archetype_id: r.archetype_id ?? null,
        overtime_seconds: r.overtime_seconds ?? 0,
        prep_notes: r.prep_notes ?? null,
        metrics: (r.metrics ?? null) as unknown,
        turns: Array.isArray(r.eo_turns) ? (r.eo_turns as unknown[]) : [],
      }));
      return {
        id: row.id,
        user_id: row.user_id,
        mode: row.mode,
        started_at: row.started_at,
        ended_at: row.ended_at ?? null,
        credits_spent: row.credits_spent ?? 0,
        evaluation: (row.evaluation ?? null) as unknown,
        incomplete: row.incomplete ?? false,
        target_note_20: row.target_note_20 ?? null,
        tasks,
      };
    });

    return NextResponse.json({ sessions });
  } catch (e) {
    console.error("eo_sessions GET exception:", e);
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : String(e), sessions: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let body: PostBody = {};
  try {
    body = (await req.json()) as PostBody;
  } catch {
    body = {};
  }

  const mode = body.mode ?? "drill_text";
  if (!VALID_MODES.includes(mode as ModeId)) {
    return NextResponse.json(
      { erreur: `mode invalide. Attendu : ${VALID_MODES.join(", ")}` },
      { status: 400 }
    );
  }

  const costs: Record<ModeId, number> = {
    drill_text: 0,
    drill_voice: 1,
    conversation: 3,
    full_exam: 6,
    review: 0,
  };
  const credits_spent = costs[mode as ModeId] ?? 0;

  try {
    const supabase = await createClient();

    const insert: Record<string, unknown> = {
      mode,
      user_id: body.user_id ?? "anon",
      credits_spent,
      incomplete: true,
    };
    if (typeof body.target_note_20 === "number") {
      insert.target_note_20 = Math.max(0, Math.min(20, Math.round(body.target_note_20)));
    }

    const { data, error } = await supabase
      .from("eo_sessions")
      .insert(insert)
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("eo_sessions POST error:", error);
      return NextResponse.json({ erreur: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data }, { status: 201 });
  } catch (e) {
    console.error("eo_sessions POST exception:", e);
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
