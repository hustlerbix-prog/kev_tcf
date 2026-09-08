import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const notes =
    typeof (body as { notes_user?: unknown }).notes_user === "string"
      ? (body as { notes_user: string }).notes_user
      : null;
  if (notes === null) {
    return NextResponse.json({ error: "notes_user manquant" }, { status: 400 });
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("essais_expression_ecrite")
    .update({ notes_user: notes })
    .eq("id", id);
  if (error) {
    return NextResponse.json(
      { error: "update failed", detail: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, id, notes_user: notes });
}
