import { NextResponse } from "next/server";
import { listModelsOpenRouter } from "@/lib/llm/openrouter";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

function autorise(req: Request): boolean {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = new URL(req.url, "http://x");
  const pw = url.searchParams.get("pw");
  const t = bearer || pw || "";
  return !!ADMIN_PASSWORD && !!t && t === ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  if (!autorise(req)) {
    return NextResponse.json(
      { erreur: "Accès refusé : mot de passe admin requis." },
      { status: 401 }
    );
  }
  try {
    const modeles = await listModelsOpenRouter();
    return NextResponse.json({ modeles });
  } catch (e) {
    return NextResponse.json(
      { erreur: "Impossible de lister les modèles OpenRouter.", detail: String(e) },
      { status: 502 }
    );
  }
}
