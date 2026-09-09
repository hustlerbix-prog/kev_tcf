import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const revalidate = 60;

export type BlocConnaissance = {
  id: string;
  created_at: string;
  tache_num: 0 | 1 | 2 | 3;
  competence_code: "EE" | "EO" | "CE" | "CO";
  slug: string;
  bloc_type:
    | "objectif"
    | "squelette"
    | "connecteurs"
    | "checklist"
    | "exemple"
    | "avertissement";
  titre: string;
  description: string | null;
  contenu_markdown: string;
  ordre: number;
  actif: boolean;
};

const SECRET_PATTERNS: RegExp[] = [
  /eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g,
  /sk-or-v1-[a-fA-F0-9]+/g,
  /SUPABASE_SERVICE_ROLE_KEY|OPENROUTER_API_KEY|ADMIN_PASSWORD/g,
  /SERVICE_ROLE|service_role/i,
];

function sanitiserSortie(texte: string): string {
  if (!texte) return texte;
  let out = texte;
  for (const re of SECRET_PATTERNS) {
    out = out.replace(re, "***");
  }
  return out;
}

function repondreJson<T>(corps: T, init: ResponseInit = {}): NextResponse<T> {
  return NextResponse.json(corps, {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control":
        "public, s-maxage=60, stale-while-revalidate=300, stale-if-error=600",
      Vary: "Accept-Encoding, Accept",
      ...(init.headers ?? {}),
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qTache = searchParams.get("tache");
    const qCompetence = searchParams.get("competence") ?? "EE";

    let tacheFiltre: 0 | 1 | 2 | 3 | null = null;
    if (qTache !== null) {
      const n = Number(qTache);
      if (!Number.isInteger(n) || n < 0 || n > 3) {
        return repondreJson(
          { erreur: "tache invalide: attendu 0 | 1 | 2 | 3" },
          { status: 400 }
        );
      }
      tacheFiltre = n as 0 | 1 | 2 | 3;
    }

    if (!/^(EE|EO|CE|CO)$/.test(qCompetence)) {
      return repondreJson(
        { erreur: "competence invalide: attendu EE | EO | CE | CO" },
        { status: 400 }
      );
    }
    const competenceFiltre = qCompetence as "EE" | "EO" | "CE" | "CO";

    const supabase = await createClient();
    let query = supabase
      .from("base_connaissances_tcf")
      .select("*")
      .eq("actif", true)
      .eq("competence_code", competenceFiltre);
    if (tacheFiltre !== null) query = query.eq("tache_num", tacheFiltre);
    query = query
      .order("tache_num", { ascending: true })
      .order("ordre", { ascending: true });

    const { data, error } = await query;
    if (error) {
      const msg = sanitiserSortie(
        String(error?.message ?? "erreur inconnue")
      );
      return repondreJson(
        { erreur: "serveur", detail: msg },
        { status: 500 }
      );
    }

    const rows = ((data as BlocConnaissance[] | null) ?? []).map((r) => ({
      ...r,
      titre: sanitiserSortie(r.titre),
      description: r.description ? sanitiserSortie(r.description) : null,
      contenu_markdown: sanitiserSortie(r.contenu_markdown),
    }));

    return repondreJson(rows);
  } catch (err) {
    const msg = sanitiserSortie(
      err instanceof Error ? err.message : String(err)
    );
    return repondreJson({ erreur: "serveur", detail: msg }, { status: 500 });
  }
}
