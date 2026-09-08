import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LLMSettings, PromptsSettings } from "@/lib/types/tcf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "tcf-admin";

function authOK(req: Request): boolean {
  const h = req.headers.get("authorization") || "";
  const token = h.replace(/^Bearer\s+/i, "");
  if (token === ADMIN_PASSWORD) return true;
  const url = new URL(req.url);
  if (url.searchParams.get("pw") === ADMIN_PASSWORD) return true;
  return false;
}

export async function GET(req: Request) {
  if (!authOK(req)) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_settings")
    .select("key, value, updated_at");
  const out: Record<string, unknown> = {};
  (data || []).forEach((r) => {
    out[r.key as string] = { value: r.value, updated_at: r.updated_at };
  });
  return NextResponse.json(out);
}

export async function POST(req: Request) {
  if (!authOK(req)) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }
  let body: {
    llm_main?: LLMSettings;
    prompts_main?: PromptsSettings;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ erreur: "JSON invalide" }, { status: 400 });
  }
  const supabase = await createClient();
  const ops: Promise<unknown>[] = [];
  if (body.llm_main) {
    ops.push(
      Promise.resolve(
        supabase
          .from("admin_settings")
          .upsert({ key: "llm_main", value: body.llm_main as unknown as object }, { onConflict: "key" })
      )
    );
  }
  if (body.prompts_main) {
    ops.push(
      Promise.resolve(
        supabase
          .from("admin_settings")
          .upsert(
            { key: "prompts_main", value: body.prompts_main as unknown as object },
            { onConflict: "key" }
          )
      )
    );
  }
  await Promise.all(ops);
  return NextResponse.json({ ok: true });
}
