import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Archetype } from "@/lib/types/eo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("eo_archetypes")
    .select("*")
    .eq("id", id)
    .eq("actif", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { erreur: "Archétype introuvable" },
      { status: 404 }
    );
  }
  return NextResponse.json(data as Archetype);
}
