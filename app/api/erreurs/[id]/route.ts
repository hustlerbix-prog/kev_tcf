import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ErreurSuivi } from "@/lib/types/tcf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function prochaineRevision(nbRevisions: number): string {
  const intervalles = [1, 3, 7, 14, 30, 60, 90];
  const j = intervalles[Math.min(nbRevisions, intervalles.length - 1)];
  const d = new Date();
  d.setDate(d.getDate() + j);
  return d.toISOString();
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const id = (await params).id;
  const body = (await req.json().catch(() => null)) as Partial<ErreurSuivi> & { marquer_revision?: boolean } | null;
  if (!body) return NextResponse.json({ error: "corps JSON attendu" }, { status: 400 });

  const modifiable = [
    "code",
    "gravite",
    "original",
    "correction",
    "contexte",
    "explication",
    "traduction_es",
    "notes",
    "ecrit_10x_fois",
    "nb_revisions",
    "derniere_revision",
    "prochaine_revision",
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const k of modifiable) {
    if (k in body && (body as Record<string, unknown>)[k] !== undefined) {
      patch[k] = (body as Record<string, unknown>)[k];
    }
  }

  if (body.marquer_revision === true) {
    // Raccourci utilisateur : "j'ai écrit cette correction 10 fois"
    patch.ecrit_10x_fois = true;
    // Récupère le nb_revisions avant mise à jour (0 si inconnu)
    const { data: avant } = await supabase
      .from("erreurs_suivi")
      .select("nb_revisions")
      .eq("id", id)
      .limit(1)
      .maybeSingle();
    const nb = Math.max(1, (typeof (avant as any)?.nb_revisions === "number" ? (avant as any).nb_revisions : 0) + 1);
    patch.nb_revisions = nb;
    patch.derniere_revision = new Date().toISOString();
    patch.prochaine_revision = prochaineRevision(nb);
  } else if ("ecrit_10x_fois" in patch && patch.ecrit_10x_fois === true) {
    // Même si marquer_revision est absent, basculer le booléen => coche une révision
    if (!("nb_revisions" in patch)) {
      const { data: avant } = await supabase
        .from("erreurs_suivi")
        .select("nb_revisions")
        .eq("id", id)
        .limit(1)
        .maybeSingle();
      const nb = Math.max(1, (typeof (avant as any)?.nb_revisions === "number" ? (avant as any).nb_revisions : 0) + 1);
      patch.nb_revisions = nb;
      patch.derniere_revision = new Date().toISOString();
      patch.prochaine_revision = prochaineRevision(nb);
    }
  } else if ("ecrit_10x_fois" in patch && patch.ecrit_10x_fois === false) {
    // Décocher → reset compteur (permet de re-commencer)
    patch.nb_revisions = 0;
    patch.derniere_revision = null;
    patch.prochaine_revision = prochaineRevision(1);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "aucun champ modifiable fourni" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("erreurs_suivi")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, erreur: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const id = (await params).id;
  const { error } = await supabase.from("erreurs_suivi").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, deleted: id });
}
