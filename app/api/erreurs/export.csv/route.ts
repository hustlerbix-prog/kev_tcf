import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ErreurSuivi } from "@/lib/types/tcf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = [
  "#",
  "Date",
  "Source",
  "Code",
  "Catégorie",
  "Gravité",
  "Forme fautive (original)",
  "Correction",
  "Contexte / phrase",
  "Explication",
  "Écrit 10× ?",
  "Nb révisions",
  "Dernière révision",
  "Prochaine révision",
  "Notes personnelles",
  "id (essai)",
  "id erreur",
];

function escCsv(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  const s = typeof v === "string" ? v : String(v);
  const needs = /[",\n\r;]/.test(s);
  return needs ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function fmtDate(v: unknown): string {
  if (!v) return "";
  try {
    const d = new Date(v as string | number);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toISOString().replace("T", " ").slice(0, 16);
  } catch {
    return String(v);
  }
}

const CATEGORIES: Record<string, string> = {
  CONJ: "Conjugaison / temps verbaux",
  ORT:  "Orthographe / accent / tréma / cédille",
  ACC:  "Accent / diacritique porteur de sens",
  REG:  "Accord / genre / nombre / règle grammaticale",
  GRAM: "Grammaire & syntaxe (phrases, négation, prépositions)",
  GR:   "Grammaire générale / tournures de phrase",
  VOC:  "Vocabulaire / registre / choix de mot",
  LEX:  "Vocabulaire / choix lexical",
  ESP:  "Spécificités de l'écrit (ponctuation, OQLF)",
  COH:  "Cohérence / connecteurs / organisation",
  AUT:  "Autre / à classer",
};
function categorie(code: string | undefined | null): string {
  return CATEGORIES[String(code ?? "").toUpperCase()] ?? "Autre / à classer";
}

function rowsOf(liste: ErreurSuivi[]): (string | number | boolean)[][] {
  return liste.map((e, i) => [
    i + 1,
    fmtDate(e.created_at),
    e.manuel ? "Ajout manuel" : e.essai_id ? "Copie corrigée" : "-",
    e.code ?? "AUT",
    categorie(e.code),
    e.gravite === "haute" ? "Haute" : e.gravite === "basse" ? "Basse" : "Moyenne",
    e.original ?? "",
    e.correction ?? "",
    e.contexte ?? "",
    e.explication ?? "",
    e.ecrit_10x_fois ? "Oui" : "Non",
    e.nb_revisions ?? 0,
    fmtDate(e.derniere_revision),
    fmtDate(e.prochaine_revision),
    e.notes ?? "",
    e.essai_id ?? "",
    e.id ?? "",
  ]);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const qCode = searchParams.get("code");
  const qGravite = searchParams.get("gravite");
  const qEcrites = searchParams.get("ecrites");

  let query = supabase.from("erreurs_suivi").select("*");
  if (qCode && qCode !== "tous") query = query.eq("code", qCode);
  if (qGravite && qGravite !== "toutes") query = query.eq("gravite", qGravite);
  if (qEcrites === "non") query = query.eq("ecrit_10x_fois", false);
  if (qEcrites === "oui") query = query.eq("ecrit_10x_fois", true);
  query = query.order("prochaine_revision", { ascending: true, nullsFirst: false }).order("gravite", { ascending: true }).order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const liste = ((data as ErreurSuivi[]) || []).filter(Boolean);
  const rows = rowsOf(liste);

  const lignes = [HEADERS, ...rows].map((r) => r.map(escCsv).join(","));
  const csv = "\ufeff" + lignes.join("\r\n");   // BOM UTF-8 → reconnaissable par Excel français

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="erreurs-tcf-${stamp}.csv"`,
    },
  });
}
