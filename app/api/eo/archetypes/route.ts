import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Archetype, TaskId, SetKind } from "@/lib/types/eo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskParam = searchParams.get("task");
  const setParam = searchParams.get("set");
  const categorieParam = searchParams.get("categorie");
  const idParam = searchParams.get("id");
  const limitParam = searchParams.get("limit");

  const validTasks: TaskId[] = [1, 2, 3];
  const validSets: SetKind[] = ["quick", "full"];

  if (taskParam !== null) {
    const t = Number(taskParam) as TaskId;
    if (!validTasks.includes(t)) {
      return NextResponse.json(
        { erreur: "Paramètre task invalide. Valeurs attendues : 1, 2 ou 3." },
        { status: 400 }
      );
    }
  }

  if (setParam !== null && !validSets.includes(setParam as SetKind)) {
    return NextResponse.json(
      { erreur: "Paramètre set invalide. Valeurs attendues : quick ou full." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  let query = supabase
    .from("eo_archetypes")
    .select("*")
    .eq("actif", true)
    .order("task", { ascending: true })
    .order("ordre", { ascending: true })
    .order("set", { ascending: true });

  if (taskParam !== null) {
    query = query.eq("task", Number(taskParam));
  }
  if (setParam !== null) {
    query = query.eq("set", setParam);
  }
  if (categorieParam !== null) {
    query = query.eq("categorie", categorieParam);
  }
  if (idParam !== null) {
    query = query.eq("id", idParam);
  }
  if (limitParam !== null) {
    const n = Number(limitParam);
    if (!Number.isNaN(n) && n > 0) {
      query = query.limit(n);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 });
  }

  const results = (data as Archetype[]) || [];

  if (idParam !== null && results.length === 0) {
    return NextResponse.json(
      { erreur: "Archétype introuvable" },
      { status: 404 }
    );
  }

  return NextResponse.json({ archetypes: results });
}
