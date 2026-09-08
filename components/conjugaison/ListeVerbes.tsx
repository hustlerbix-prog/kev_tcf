"use client";

import { useMemo, useState } from "react";
import {
  VERBES,
  FILTRES,
  type ConjugaisonVerb,
} from "@/lib/heuristiques/conjug-ui";

interface Props {
  verbeActif: ConjugaisonVerb;
  onSelect: (v: ConjugaisonVerb) => void;
  filtreActif: string;
  onChangeFiltre: (f: string) => void;
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function ListeVerbes({
  verbeActif,
  onSelect,
  filtreActif,
  onChangeFiltre,
}: Props) {
  const [q, setQ] = useState("");

  const sel = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return VERBES.filter((v) => {
      if (qq && !(v.rad_srch || "").includes(qq)) return false;
      if (filtreActif === "irr") return !v.g;
      if (filtreActif === "er") return v.g === "er";
      if (filtreActif === "ir") return v.g === "ir";
      if (filtreActif === "re") return v.g === "re";
      if (filtreActif === "pron") return !!v.pron;
      return true;
    });
  }, [q, filtreActif]);

  return (
    <section className="carte sombre">
      <div className="entete-carte">
        <h2>Verbes du TCF</h2>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-encre-3)",
          }}
        >
          {sel.length} / {VERBES.length}
        </span>
      </div>
      <div className="recherche">
        <input
          id="rech-verbe"
          type="search"
          placeholder="Chercher un verbe ou un mot espagnol…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="filtres">
        {FILTRES.map((f) => (
          <button
            key={f[0]}
            className="filtre"
            data-f={f[0]}
            aria-pressed={f[0] === filtreActif}
            onClick={() => onChangeFiltre(f[0])}
          >
            {f[1]}
          </button>
        ))}
      </div>
      <div className="liste-verbes">
        {sel.length === 0 ? (
          <p
            style={{
              padding: 12,
              color: "var(--color-encre-3)",
              fontSize: 13,
            }}
          >
            Aucun verbe ne correspond.
          </p>
        ) : (
          sel.map((v) => (
            <button
              key={v.i}
              className="verbe-item"
              data-v={v.i}
              aria-current={v.i === verbeActif.i}
              onClick={() => onSelect(v)}
            >
              <span dangerouslySetInnerHTML={{ __html: esc(v.i || "") }} />
              <span
                className="gl"
                dangerouslySetInnerHTML={{ __html: esc(v.e || "") }}
              />
            </button>
          ))
        )}
      </div>
    </section>
  );
}
