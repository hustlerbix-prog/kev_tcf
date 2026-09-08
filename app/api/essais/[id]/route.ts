import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("essais_expression_ecrite")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle();
  if (error) {
    return NextResponse.json(
      { error: "fetch failed", detail: error.message },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json({ error: "non trouvé" }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("essais_expression_ecrite")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json(
      { error: "delete failed", detail: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, deleted: id });
}
