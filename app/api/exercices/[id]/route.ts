import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Exercice } from "@/lib/types/tcf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercices_expression_ecrite")
    .select("id, tache_num, consigne, actif, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ erreur: "Exercice introuvable" }, { status: 404 });
  }
  return NextResponse.json(data as Exercice);
}
