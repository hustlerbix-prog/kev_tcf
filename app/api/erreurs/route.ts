import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DashboardErreurs, ErreurSuivi } from "@/lib/types/tcf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CodeLabel = { code: string; label: string };
const CODES: CodeLabel[] = [
  { code: "CONJ", label: "Conjugaison / temps verbaux" },
  { code: "ORT",  label: "Orthographe / accent / tréma / cédille" },
  { code: "ACC",  label: "Accent / diacritique porteur de sens" },
  { code: "REG",  label: "Accord / genre / nombre / règle grammaticale" },
  { code: "GRAM", label: "Grammaire & syntaxe (phrases, négation, prépositions)" },
  { code: "GR",   label: "Grammaire générale / tournures de phrase" },
  { code: "VOC",  label: "Vocabulaire / registre / choix de mot" },
  { code: "LEX",  label: "Vocabulaire / choix lexical" },
  { code: "ESP",  label: "Spécificités de l'écrit (ponctuation, OQLF)" },
  { code: "COH",  label: "Cohérence / connecteurs / organisation" },
  { code: "AUT",  label: "Autre / à classer" },
];
const GRAVITES = ["haute", "moyenne", "basse"] as const;
const CODE_LABEL_MAP = new Map(CODES.map((c) => [c.code, c.label]));
function labelCode(code: string): string {
  return CODE_LABEL_MAP.get(code) ?? CODES[CODES.length - 1].label;
}
function trierGravité(a: string, b: string): number {
  const r: Record<string, number> = { haute: 0, moyenne: 1, basse: 2 };
  return (r[a] ?? 3) - (r[b] ?? 3);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const qCode = searchParams.get("code");
  const qGravite = searchParams.get("gravite");
  const qEcrites = searchParams.get("ecrites");   // ""|"toutes"|"non"|"oui"
  const qTri     = searchParams.get("tri") || "prochaine";   // prochaine|date|code|gravite|alpha

  let query = supabase.from("erreurs_suivi").select("*");
  if (qCode && qCode !== "tous") query = query.eq("code", qCode);
  if (qGravite && qGravite !== "toutes") query = query.eq("gravite", qGravite);
  if (qEcrites === "non") query = query.eq("ecrit_10x_fois", false);
  if (qEcrites === "oui") query = query.eq("ecrit_10x_fois", true);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const list = (data as ErreurSuivi[] | null) ?? [];

  // Tri côté serveur (RLS ne permet pas toujours order par prochaine_revision NULLS FIRST)
  list.sort((a: ErreurSuivi, b: ErreurSuivi) => {
    switch (qTri) {
      case "date":
        return +new Date(b.created_at ?? 0) - +new Date(a.created_at ?? 0);
      case "code":
        return (a.code ?? "").localeCompare(b.code ?? "", "fr");
      case "gravite":
        return trierGravité(a.gravite, b.gravite);
      case "alpha":
        return (a.correction ?? "").localeCompare(b.correction ?? "", "fr");
      case "prochaine":
      default: {
        const an = a.prochaine_revision ? +new Date(a.prochaine_revision) : Number.POSITIVE_INFINITY;
        const bn = b.prochaine_revision ? +new Date(b.prochaine_revision) : Number.POSITIVE_INFINITY;
        const g = trierGravité(a.gravite, b.gravite);
        return an - bn || g;
      }
    }
  });

  // Agrégats
  const total = list.length;
  const nonMaitrises = list.filter((e) => !e.ecrit_10x_fois).length;
  const ecrites = list.filter((e) => e.ecrit_10x_fois).length;
  const parCodeMap = new Map<string, { count: number; non_maitrises: number }>();
  for (const e of list) {
    const k = e.code ?? "AUT";
    const cur = parCodeMap.get(k) ?? { count: 0, non_maitrises: 0 };
    cur.count++;
    if (!e.ecrit_10x_fois) cur.non_maitrises++;
    parCodeMap.set(k, cur);
  }
  const parCode = Array.from(parCodeMap.entries())
    .map(([code, v]) => ({ code, label: labelCode(code), ...v }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code, "fr"));

  const parGravMap = new Map<string, { count: number; non_maitrises: number }>();
  for (const g of GRAVITES) parGravMap.set(g, { count: 0, non_maitrises: 0 });
  for (const e of list) {
    const k = GRAVITES.includes(e.gravite as any) ? e.gravite : "moyenne";
    const cur = parGravMap.get(k)!;
    cur.count++;
    if (!e.ecrit_10x_fois) cur.non_maitrises++;
  }
  const parGravite = Array.from(parGravMap.entries()).map(([gravite, v]) => ({
    gravite: gravite as any,
    ...v,
  }));

  // Priorité de révision : hautes gravités non maîtrisées, puis par prochaine_revision la plus proche
  const priorite_revision = list
    .filter((e) => !e.ecrit_10x_fois)
    .sort((a, b) => {
      const g = trierGravité(a.gravite, b.gravite);
      const an = a.prochaine_revision ? +new Date(a.prochaine_revision) : Number.POSITIVE_INFINITY;
      const bn = b.prochaine_revision ? +new Date(b.prochaine_revision) : Number.POSITIVE_INFINITY;
      return g || an - bn;
    })
    .slice(0, 20);

  const out: DashboardErreurs = {
    total,
    non_maitrises: nonMaitrises,
    ecrites_10x: ecrites,
    par_code: parCode,
    par_gravite: parGravite,
    erreurs: list,
    priorite_revision,
  };
  return NextResponse.json(out);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = (await req.json().catch(() => null)) as Partial<ErreurSuivi> | null;
  if (!body) return NextResponse.json({ error: "corps JSON attendu" }, { status: 400 });

  if (!body.original || !body.correction) {
    return NextResponse.json({ error: "original et correction obligatoires" }, { status: 400 });
  }
  const gravite = ["haute", "moyenne", "basse"].includes(body.gravite as any) ? body.gravite : "moyenne";
  const code = typeof body.code === "string" && body.code.length ? body.code.toUpperCase() : "AUT";
  const row: ErreurSuivi = {
    manuel: true,
    essai_id: body.essai_id ?? null,
    code,
    gravite: gravite as any,
    original: body.original,
    correction: body.correction,
    contexte: body.contexte ?? null,
    explication: body.explication ?? null,
    traduction_es: body.traduction_es ?? null,
    notes: body.notes ?? null,
    ecrit_10x_fois: false,
    nb_revisions: 0,
    prochaine_revision: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("erreurs_suivi")
    .insert(row as any)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, erreur: data });
}
