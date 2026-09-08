"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NavLaterale from "@/components/NavLaterale";
import { TACHES } from "@/lib/heuristiques/taches";
import type { ExerciceAvecProgres } from "@/lib/types/tcf";

type FiltreTache = "all" | 1 | 2 | 3;

const MOIS_FR = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function cleMois(iso: string): string {
  const d = new Date(iso);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function libelleMois(cle: string): string {
  const [annee, mois] = cle.split("-").map(Number);
  return MOIS_FR[mois - 1] + " " + annee;
}

export default function PagePrompts() {
  const router = useRouter();
  const [exercices, setExercices] = useState<ExerciceAvecProgres[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [filtreTache, setFiltreTache] = useState<FiltreTache>("all");
  const [anneeActive, setAnneeActive] = useState<number | null>(null);
  const [moisFermes, setMoisFermes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/exercices")
      .then((r) => r.json())
      .then((d) => {
        if (d.erreur) {
          setErreur(d.erreur);
          return;
        }
        setExercices((d.exercices || []) as ExerciceAvecProgres[]);
      })
      .catch((e) => setErreur(e instanceof Error ? e.message : String(e)))
      .finally(() => setChargement(false));
  }, []);

  const annees = useMemo(() => {
    const s = new Set<number>();
    exercices.forEach((e) => s.add(new Date(e.created_at).getFullYear()));
    if (s.size === 0) s.add(new Date().getFullYear());
    return Array.from(s).sort((a, b) => b - a);
  }, [exercices]);

  useEffect(() => {
    if (anneeActive === null && annees.length) setAnneeActive(annees[0]);
  }, [annees, anneeActive]);

  const filtres = useMemo(
    () => exercices.filter((e) => filtreTache === "all" || e.tache_num === filtreTache),
    [exercices, filtreTache]
  );

  const parAnnee = useMemo(
    () => filtres.filter((e) => new Date(e.created_at).getFullYear() === anneeActive),
    [filtres, anneeActive]
  );

  const groupesMois = useMemo(() => {
    const map = new Map<string, ExerciceAvecProgres[]>();
    parAnnee.forEach((e) => {
      const cle = cleMois(e.created_at);
      if (!map.has(cle)) map.set(cle, []);
      map.get(cle)!.push(e);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [parAnnee]);

  const toggleMois = (cle: string) => {
    setMoisFermes((s) => {
      const next = new Set(s);
      if (next.has(cle)) next.delete(cle);
      else next.add(cle);
      return next;
    });
  };

  const choisir = (id: string) => {
    router.push("/expression-ecrite?exo=" + id);
  };

  return (
    <div className="coquille">
      <NavLaterale actif="prompts" />
      <main className="contenu-principal">
      <div className="prompts-page">
        <div className="prompts-head">
          <div>
            <h1>All Writing Prompts</h1>
            <p className="sous">
              {exercices.length} exercises · browse by month
            </p>
          </div>
          <div className="prompts-filtres">
            <div className="prompts-tabs" role="tablist" aria-label="Filtrer par tâche">
              {(["all", 1, 2, 3] as FiltreTache[]).map((f) => (
                <button
                  key={String(f)}
                  role="tab"
                  aria-selected={filtreTache === f}
                  className={filtreTache === f ? "actif" : ""}
                  onClick={() => setFiltreTache(f)}
                >
                  {f === "all" ? "All" : "T" + f}
                </button>
              ))}
            </div>
            <div className="prompts-tabs" role="tablist" aria-label="Filtrer par année">
              {annees.map((a) => (
                <button
                  key={a}
                  role="tab"
                  aria-selected={anneeActive === a}
                  className={anneeActive === a ? "actif" : ""}
                  onClick={() => setAnneeActive(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {chargement && (
          <div className="prompts-vide">Chargement des sujets…</div>
        )}
        {!chargement && erreur && (
          <div className="prompts-vide">Erreur de chargement : {erreur}</div>
        )}
        {!chargement && !erreur && groupesMois.length === 0 && (
          <div className="prompts-vide">
            Aucun sujet pour ce filtre. Essayez une autre tâche ou une autre année.
          </div>
        )}

        {groupesMois.map(([cle, exos]) => {
          const ferme = moisFermes.has(cle);
          const nbTermines = exos.filter((e) => e.termine).length;
          return (
            <section className="mois-carte" key={cle}>
              <button
                type="button"
                className="mois-entete"
                onClick={() => toggleMois(cle)}
                aria-expanded={!ferme}
              >
                <div className="titre-mois">
                  <span className="icone" aria-hidden>
                    📅
                  </span>
                  <span>
                    <b>{libelleMois(cle)}</b>
                    <span className="compte">
                      {exos.length} writing exercise{exos.length > 1 ? "s" : ""} · {nbTermines} done
                    </span>
                  </span>
                </div>
                <span className="toggle">
                  {ferme ? "Expand" : "Collapse"}
                  <span style={{ transform: ferme ? "rotate(180deg)" : "none" }}>⌃</span>
                </span>
              </button>

              {!ferme &&
                exos.map((ex) => {
                  const t = TACHES[ex.tache_num];
                  const pct =
                    ex.termine && typeof ex.meilleure_note_20 === "number"
                      ? Math.round((ex.meilleure_note_20 / 20) * 100)
                      : null;
                  return (
                    <button
                      type="button"
                      key={ex.id}
                      className="exo-ligne"
                      onClick={() => choisir(ex.id)}
                    >
                      <span className={"badge-tache t" + ex.tache_num}>
                        T{ex.tache_num}
                      </span>
                      <span className="contenu">
                        <span className="txt">{ex.consigne}</span>
                        <span className="meta">
                          Task {ex.tache_num} · {t.min}-{t.max} words
                        </span>
                      </span>
                      {pct !== null && <span className="pct">{pct}%</span>}
                      <span className="chevron" aria-hidden>
                        ›
                      </span>
                    </button>
                  );
                })}
            </section>
          );
        })}
      </div>
      </main>
    </div>
  );
}
