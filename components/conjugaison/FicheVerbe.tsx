"use client";

import { useEffect, useRef } from "react";
import {
  formes,
  AVEC_SUJET,
  PRON,
  type ConjugaisonVerb,
  type TempsConj,
} from "@/lib/heuristiques/conjug-ui";

interface Props {
  v: ConjugaisonVerb;
  onSEntrainer: () => void;
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const TEMPS: TempsConj[] = [
  "présent",
  "passé composé",
  "imparfait",
  "plus-que-parfait",
  "futur simple",
  "conditionnel présent",
  "subjonctif présent",
];

const RAPPEL: Record<TempsConj, string> = {
  "présent": "",
  "passé composé": "action achevée",
  "imparfait": "décor, habitude",
  "plus-que-parfait": "antériorité",
  "futur simple": "projection",
  "conditionnel présent": "politesse / hypothèse",
  "subjonctif présent": "que…",
};

export default function FicheVerbe({ v, onSEntrainer }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const btn = ref.current?.querySelector<HTMLButtonElement>("#btn-cibler");
    if (!btn) return;
    btn.addEventListener("click", onSEntrainer);
    return () => btn.removeEventListener("click", onSEntrainer);
  }, [v, onSEntrainer]);

  const F = formes(v);
  const groupe =
    v.g === "er"
      ? "1er groupe"
      : v.g === "ir"
      ? "2e groupe"
      : v.g === "re"
      ? "3e groupe (-re)"
      : "irrégulier";

  const blocs = TEMPS.map((t: TempsConj) => {
    const rappel = RAPPEL[t];
    const FArr = (F as unknown as Record<TempsConj, string[]>)[t];
    const avecSujet = AVEC_SUJET[t] as (v: ConjugaisonVerb, k: number, f: string) => string;
    return (
      '<div class="temps"><h4>' +
      esc(t) +
      (rappel ? "<em>" + esc(rappel) + "</em>" : "") +
      "</h4><table>" +
      FArr
        .map(
          (f: string, k: number) =>
            "<tr><td class=\"p\">" +
            esc(PRON[k].split(" / ")[0]) +
            "</td><td class=\"f\">" +
            esc(avecSujet(v, k, f)) +
            "</td></tr>"
        )
        .join("") +
      "</table></div>"
    );
  }).join("");

  const imp = v.imp
    ? ""
    : '<div class="temps"><h4>impératif<em>ordre, conseil</em></h4><table>' +
      ["tu", "nous", "vous"]
        .map(
          (p, k) =>
            "<tr><td class=\"p\">" +
            esc(p) +
            "</td><td class=\"f\">" +
            esc((v.im || [])[k] + (v.pron ? "-" + ["toi", "nous", "vous"][k] : "")) +
            "</td></tr>"
        )
        .join("") +
      "</table></div>";

  return (
    <section
      ref={ref}
      className="carte"
      id="fiche"
      dangerouslySetInnerHTML={{
        __html:
          '<div class="fiche-verbe"><h3>' +
          esc(v.i || "") +
          '</h3><div class="meta">' +
          '<span class="puce">' +
          esc(groupe) +
          "</span>" +
          '<span class="puce">auxiliaire ' +
          (v.x === "e" ? "être" : "avoir") +
          "</span>" +
          '<span class="puce ' +
          (v.g ? "" : "acc") +
          '">participe : ' +
          esc(v.pp || "") +
          "</span>" +
          (v.pron ? '<span class="puce acc">pronominal</span>' : "") +
          '<span class="puce es">' +
          esc(v.e || "") +
          "</span>" +
          "</div></div>" +
          '<div class="tableau-temps">' +
          blocs +
          imp +
          "</div>" +
          (v.tcf
            ? '<p class="note-tcf"><b style="color:var(--color-rouge)">TCF · </b>' +
              esc(v.tcf)
                .replace(
                  /\*\*(.+?)\*\*/g,
                  '<b style="color:var(--color-rouge)">$1</b>'
                ) +
              "</p>"
            : "") +
          '<div style="padding:0 22px 18px"><button class="bouton" id="btn-cibler">S\'entraîner sur ce verbe</button></div>',
      }}
    />
  );
}
