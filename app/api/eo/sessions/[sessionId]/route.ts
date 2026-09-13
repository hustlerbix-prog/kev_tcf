import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SessionParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_req: Request, { params }: SessionParams) {
  const { sessionId } = await params;

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
      .eq("id", sessionId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("eo_sessions GET one error:", error);
      return NextResponse.json({ erreur: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ erreur: "Session introuvable" }, { status: 404 });
    }

    const runs = Array.isArray(data.eo_task_runs) ? data.eo_task_runs : [];
    const tasks = runs.map((r: Record<string, unknown>) => ({
      id: r.id,
      task: r.task,
      archetype_id: r.archetype_id ?? null,
      overtime_seconds: r.overtime_seconds ?? 0,
      prep_notes: r.prep_notes ?? null,
      metrics: (r.metrics ?? null) as unknown,
      turns: Array.isArray(r.eo_turns) ? (r.eo_turns as unknown[]) : [],
    }));

    const session = {
      id: data.id,
      user_id: data.user_id,
      mode: data.mode,
      started_at: data.started_at,
      ended_at: data.ended_at ?? null,
      credits_spent: data.credits_spent ?? 0,
      evaluation: (data.evaluation ?? null) as unknown,
      incomplete: data.incomplete ?? false,
      target_note_20: data.target_note_20 ?? null,
      tasks,
    };

    return NextResponse.json({ session });
  } catch (e) {
    console.error("eo_sessions GET one exception:", e);
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

interface PatchBody {
  evaluation?: unknown;
  ended_at?: string | null;
  incomplete?: boolean;
  target_note_20?: number;
}

export async function PATCH(req: Request, { params }: SessionParams) {
  const { sessionId } = await params;

  let body: PatchBody = {};
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    body = {};
  }

  try {
    const supabase = await createClient();

    const update: Record<string, unknown> = {};
    if (body.evaluation !== undefined) update.evaluation = body.evaluation;
    if (body.ended_at !== undefined) update.ended_at = body.ended_at;
    if (body.incomplete !== undefined) update.incomplete = body.incomplete;
    if (body.target_note_20 !== undefined) {
      update.target_note_20 = Math.max(0, Math.min(20, Math.round(body.target_note_20)));
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ erreur: "Aucun champ à mettre à jour." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("eo_sessions")
      .update(update)
      .eq("id", sessionId)
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("eo_sessions PATCH error:", error);
      return NextResponse.json({ erreur: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ erreur: "Session introuvable" }, { status: 404 });
    }

    return NextResponse.json({ session: data });
  } catch (e) {
    console.error("eo_sessions PATCH exception:", e);
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: SessionParams) {
  const { sessionId } = await params;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("eo_sessions")
      .update({ incomplete: true })
      .eq("id", sessionId)
      .select("id, incomplete")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("eo_sessions DELETE (soft) error:", error);
      return NextResponse.json({ erreur: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ erreur: "Session introuvable" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, session: data });
  } catch (e) {
    console.error("eo_sessions DELETE exception:", e);
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
