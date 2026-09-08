"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  VERBES,
  TEMPS_EXO,
  TIRAGE,
  RAPPELS,
  TOP,
  PHRASES,
  formes,
  AVEC_SUJET,
  PRON,
  type ConjugaisonVerb,
  type TempsConj,
  type StatsConjugaison,
} from "@/lib/heuristiques/verbes";
import type { PhraseExo } from "@/lib/heuristiques/conjug-ui";

interface Props {
  verbeCible: ConjugaisonVerb | null;
  onCibleConsumed: () => void;
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const nettoie = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/\((?:e|s|es)\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(?:qu'|que |j'|je |tu |il |elle |on |nous |vous |ils |elles )+/, "")
    .trim();
const sansAcc = (s: string) =>
  nettoie(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c");
const tirer = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

interface ExoState {
  type: "flash" | "phrase" | "cible";
  v: ConjugaisonVerb;
  t: TempsConj;
  k: number;
  rep: string;
  why: string;
  ph?: string;
}

export default function ExercicesConjugaison({
  verbeCible,
  onCibleConsumed,
}: Props) {
  const [mode, setMode] = useState<"flash" | "phrases" | "cible">("flash");
  const [exo, setExo] = useState<ExoState | null>(null);
  const [stat, setStat] = useState<StatsConjugaison>({
    n: 0,
    ok: 0,
    serie: 0,
    meilleure: 0,
    accent: 0,
  });
  const [reponse, setReponse] = useState("");
  const [verdict, setVerdict] = useState<null | {
    classe: "juste" | "faux" | "presque";
    html: string;
  }>(null);
  const inpRef = useRef<HTMLInputElement>(null);

  const nouveau = (modeOver?: "flash" | "phrases" | "cible") => {
    const m = modeOver || mode;
    let e: ExoState;
    if (m === "phrases") {
      const p = tirer(PHRASES as unknown as PhraseExo[]);
      const v = VERBES.find((x) => x.i === p.v) || VERBES[0];
      const f = formes(v)[p.t][p.k];
      e = {
        type: "phrase",
        v,
        t: p.t,
        k: p.k,
        rep: f,
        why: p.why,
        ph: p.ph,
      };
    } else {
      const v =
        m === "cible"
          ? verbeCible || VERBES.find((x) => x.i === tirer(TOP)) || VERBES[0]
          : VERBES.find((x) => x.i === tirer(TOP)) || VERBES[0];
      let k = Math.floor(Math.random() * 6);
      if (v.imp) k = 2;
      const t = tirer(TIRAGE);
      e = {
        type: m,
        v,
        t,
        k,
        rep: formes(v)[t][k],
        why: RAPPELS[t],
      };
    }
    setExo(e);
    setReponse("");
    setVerdict(null);
    setTimeout(() => inpRef.current?.focus(), 50);
    if (m === "cible" && verbeCible) onCibleConsumed();
  };

  useEffect(() => {
    nouveau(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (verbeCible) {
      setMode("cible");
      nouveau("cible");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verbeCible]);

  const verifier = () => {
    if (!exo || !reponse.trim() || verdict) return;
    const donne = reponse;
    const attendu = exo.rep;
    setStat((s: StatsConjugaison) => ({ ...s, n: s.n + 1 }));
    const juste = nettoie(donne) === nettoie(attendu);
    const presque = !juste && sansAcc(donne) === sansAcc(attendu);
    const t = exo.t as keyof typeof AVEC_SUJET;
    const complet = (AVEC_SUJET[t] as (v: ConjugaisonVerb, k: number, f: string) => string)(exo.v, exo.k, attendu);
    if (juste) {
      setStat((s: StatsConjugaison) => ({
        ...s,
        ok: s.ok + 1,
        serie: s.serie + 1,
        meilleure: Math.max(s.meilleure, s.serie + 1),
      }));
      setVerdict({
        classe: "juste",
        html:
          "<b>" +
          esc(complet) +
          "</b> — exact.<span class=\"astuce\">" +
          esc(exo.why || "") +
          "</span>",
      });
    } else if (presque) {
      setStat((s: StatsConjugaison) => ({ ...s, serie: 0, accent: s.accent + 1 }));
      setVerdict({
        classe: "presque",
        html:
          "<b>" +
          esc(complet) +
          "</b> — la forme est bonne, l'accentuation ne l'est pas." +
          '<span class="astuce">Au TCF, un accent manquant est compté comme une faute d\'orthographe.</span>',
      });
    } else {
      setStat((s: StatsConjugaison) => ({ ...s, serie: 0 }));
      setVerdict({
        classe: "faux",
        html:
          "<b>" +
          esc(complet) +
          "</b>" +
          '<span class="astuce">Vous avez écrit « ' +
          esc(donne.trim()) +
          " ». " +
          esc(exo.why || (RAPPELS as Record<TempsConj, string>)[exo.t] || "") +
          "</span>",
      });
    }
  };

  const taux = stat.n ? Math.round((stat.ok / stat.n) * 100) : 0;
  const serie = (stat.n ? taux + " % · série " + stat.serie : "").toString();

  const tauxLabel = useMemo(() => serie, [serie]);

  return (
    <section className="carte sombre">
      <div className="entete-carte">
        <h2>Entraînement auto-corrigé</h2>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-marge)",
          }}
        >
          {tauxLabel}
        </span>
      </div>
      <div className="exo-tetes">
        {(["flash", "phrases", "cible"] as const).map((m) => (
          <button
            key={m}
            className="exo-tete"
            aria-pressed={mode === m}
            data-mode={m}
            onClick={() => {
              setMode(m);
              nouveau(m);
            }}
          >
            {m === "flash"
              ? "Conjugaison éclair"
              : m === "phrases"
              ? "Phrases TCF (B2)"
              : "Verbe affiché seulement"}
          </button>
        ))}
      </div>
      <div className="exo-corps" id="exo-corps">
        {exo && (
          <>
            {exo.type === "phrase" ? (
              <p
                className="question"
                dangerouslySetInnerHTML={{
                  __html:
                    esc(exo.ph || "")
                      .split("___")
                      .join('<span class="trou"></span>') +
                    "</p>" +
                    '<p class="consigne-exo">' +
                    esc(exo.v.i || "") +
                    " · " +
                    esc(exo.t) +
                    " · " +
                    esc(PRON[exo.k]),
                }}
              />
            ) : (
              <p
                className="question"
                dangerouslySetInnerHTML={{
                  __html:
                    (exo.t === "subjonctif présent"
                      ? exo.k === 2 || exo.k === 5 || exo.v.imp
                        ? "qu'"
                        : "que "
                      : "") +
                    esc(["je", "tu", "il", "nous", "vous", "ils"][exo.k]) +
                    ' <span class="trou"></span> <span class="inf">(' +
                    esc(exo.v.i || "") +
                    ")</span>",
                }}
              />
            )}
            {exo.type !== "phrase" && (
              <p className="consigne-exo">
                {esc(exo.t)} · {esc(exo.v.e || "")}
              </p>
            )}
            <div className="rangee-reponse">
              <input
                ref={inpRef}
                id="reponse-exo"
                autoComplete="off"
                spellCheck={false}
                placeholder="Écrivez la forme conjuguée…"
                value={reponse}
                onChange={(e) => setReponse(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  if (verdict) nouveau();
                  else verifier();
                }}
              />
              <button className="bouton clair" onClick={verifier}>
                Vérifier
              </button>
              <button
                className="bouton clair"
                onClick={() => {
                  setVerdict(null);
                  nouveau();
                }}
              >
                Suivant
              </button>
            </div>
            {verdict && (
              <div
                className={"verdict visible " + verdict.classe}
                dangerouslySetInnerHTML={{ __html: verdict.html }}
              />
            )}
          </>
        )}
      </div>
      <div className="stats" id="stats-exo">
        <div className="stat">
          <b>
            {stat.ok} / {stat.n}
          </b>
          formes justes
        </div>
        <div className="stat">
          <b>{taux} %</b>réussite
        </div>
        <div className="stat">
          <b>{stat.serie}</b>série en cours
        </div>
        <div className="stat">
          <b>{stat.meilleure}</b>meilleure série
        </div>
        <div className="stat">
          <b>{stat.accent}</b>fautes d'accent seules
        </div>
      </div>
    </section>
  );
}
