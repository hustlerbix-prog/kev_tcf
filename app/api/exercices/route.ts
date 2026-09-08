import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Exercice, ExerciceAvecProgres } from "@/lib/types/tcf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const { data: exercices, error } = await supabase
    .from("exercices_expression_ecrite")
    .select("id, tache_num, consigne, actif, created_at")
    .eq("actif", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 });
  }

  const { data: essais } = await supabase
    .from("essais_expression_ecrite")
    .select("exercice_id, note_20")
    .not("exercice_id", "is", null);

  const meilleures = new Map<string, number>();
  (essais || []).forEach((e) => {
    if (!e.exercice_id || typeof e.note_20 !== "number") return;
    const actuel = meilleures.get(e.exercice_id);
    if (actuel === undefined || e.note_20 > actuel) {
      meilleures.set(e.exercice_id, e.note_20);
    }
  });

  const resultat: ExerciceAvecProgres[] = ((exercices || []) as Exercice[]).map(
    (ex) => {
      const meilleure = meilleures.get(ex.id);
      return {
        ...ex,
        meilleure_note_20: meilleure,
        termine: meilleure !== undefined,
      };
    }
  );

  return NextResponse.json({ exercices: resultat });
}
