"use client";

import { TACHES, motsDe } from "@/lib/heuristiques/taches";
import type { Tache } from "@/lib/types/tcf";

interface Props {
  tacheActive: 1 | 2 | 3;
  onChange: (n: 1 | 2 | 3) => void;
}

export default function SelecteurTache({ tacheActive, onChange }: Props) {
  const t = TACHES[tacheActive] as Tache;
  return (
    <>
      <div className="taches">
        {(Object.keys(TACHES) as unknown as ("1" | "2" | "3")[]).map((k) => {
          const tk = TACHES[Number(k) as 1 | 2 | 3] as Tache;
          return (
            <button
              key={k}
              className="tache"
              data-t={k}
              aria-pressed={k === String(tacheActive)}
              onClick={() => onChange(Number(k) as 1 | 2 | 3)}
            >
              <b>{tk.titre}</b>
              <span>
                {tk.type} · {tk.min}–{tk.max} mots
              </span>
            </button>
          );
        })}
      </div>
      <div className="consigne-zone">
        <label htmlFor="consigne">Collez ici l'énoncé du sujet</label>
        <textarea
          id="consigne"
          placeholder="Ex. : Vous venez de déménager à Montréal. Vous écrivez à votre ancien voisin pour lui donner de vos nouvelles…"
          defaultValue=""
        />
      </div>
      <span
        style={{ display: "none" }}
        id="rappel-mots"
        data-t-min={t.min}
        data-t-max={t.max}
        data-t-cible={t.cible.join(",")}
        data-t-minutes={t.minutes}
      />
    </>
  );
}

export function ciblePour(tacheNum: 1 | 2 | 3) {
  return {
    t: TACHES[tacheNum] as Tache,
    motsDe,
  };
}
