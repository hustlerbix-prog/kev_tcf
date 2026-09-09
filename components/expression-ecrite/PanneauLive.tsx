"use client";

import {
  TACHES,
  structure,
  couperT3,
  motsDe,
  checklistOfficielleT1,
  checklistOfficielleT3,
} from "@/lib/heuristiques/taches";
import { CONNECTEURS, MARQ_TU, MARQ_VOUS } from "@/lib/heuristiques";
import type { ErreurLive, CodeErreur } from "@/lib/types/tcf";

interface Props {
  tacheActive: 1 | 2 | 3;
  copie: string;
  erreurs: ErreurLive[];
  totalLive: string;
  onInsertFormule: (f: string) => void;
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const gras = (t: string) =>
  esc(t).replace(
    /\*\*(.+?)\*\*/g,
    '<b style="color:#fff">$1</b>'
  );

export default function PanneauLive({
  tacheActive,
  copie,
  erreurs,
  onInsertFormule,
}: Props) {
  const t = TACHES[tacheActive];
  const txt = copie;
  const par = (code: CodeErreur) => erreurs.filter((e) => e.code === code);
  const conn = CONNECTEURS.filter((c) =>
    new RegExp("\\b" + c.replace(/'/g, "['’]") + "\\b", "i").test(txt)
  );
  const paragraphes = txt.trim()
    ? txt.trim().split(/\n\s*\n/).length
    : 0;
  const phrases = txt.trim()
    ? txt.split(/[.!?]+/).filter((p) => p.trim().length > 1).length
    : 0;
  const nMots = motsDe(txt);
  const moy = phrases ? Math.round(nMots / phrases) : 0;

  const tus = (txt.match(MARQ_TU) || []).length;
  const vs = (txt.match(MARQ_VOUS) || []).length;
  let regClasse: "p-ok" | "p-ko" | "p-am";
  let regTitre: string;
  let regItems: string[] = [];
  if (tus && vs) {
    regClasse = "p-ko";
    regTitre = "Registre mélangé";
    regItems = [
      "<li><span class=\"fleche\">!</span><div>" +
        tus +
        " marque" +
        (tus > 1 ? "s" : "") +
        " de <code>tu</code> et " +
        vs +
        " de <code>vous</code>. Le jury sanctionne immédiatement la pertinence.</div></li>",
    ];
  } else if (tus) {
    regClasse = "p-ok";
    regTitre = "Registre : tutoiement";
    regItems = [
      "<li><span class=\"fleche\">✓</span><div>Cohérent sur " +
        tus +
        " marque" +
        (tus > 1 ? "s" : "") +
        ". Vérifiez que la consigne autorise le <code>tu</code>.</div></li>",
    ];
  } else if (vs) {
    regClasse = "p-ok";
    regTitre = "Registre : vouvoiement";
    regItems = [
      "<li><span class=\"fleche\">✓</span><div>Cohérent sur " +
        vs +
        " marque" +
        (vs > 1 ? "s" : "") +
        ". Gardez aussi les formules soutenues jusqu'à la clôture.</div></li>",
    ];
  } else {
    regClasse = "p-am";
    regTitre = "Registre non marqué";
    regItems = [
      '<li class="vide">Aucun <code>tu</code> ni <code>vous</code> détecté. Adressez-vous explicitement au destinataire.</li>',
    ];
  }

  const bloc = (
    _id: string,
    titre: string,
    classe: "p-ok" | "p-ko" | "p-am",
    n: string | number,
    items: string[]
  ) =>
    '<section class="section-live"><div class="titre"><span class="pastille ' +
    classe +
    '">' +
    n +
    "</span>" +
    titre +
    '</div><ul class="liste-live">' +
    (items.length
      ? items.join("")
      : '<li class="vide">Rien à signaler pour le moment.</li>') +
    "</ul></section>";

  const ligne = (e: ErreurLive) =>
    "<li><span class=\"fleche\">" +
    (e.g === "haute" ? "✕" : e.g === "moyenne" ? "!" : "·") +
    "</span><div><code>" +
    esc(txt.substr(e.i, e.l).trim() || "—") +
    "</code> " +
    gras(e.msg) +
    "</div></li>";

  const ort = par("ORT").concat(par("GR"));
  const esp = par("ESP").concat(par("CONJ"));
  const lex = par("LEX");

  const coh: string[] = [];
  coh.push(
    "<li><span class=\"fleche\">" +
      (conn.length >= 4 ? "✓" : "!") +
      "</span><div><b style=\"color:#fff\">" +
      conn.length +
      "</b> connecteur" +
      (conn.length > 1 ? "s" : "") +
      " logique" +
      (conn.length > 1 ? "s" : "") +
      " repéré" +
      (conn.length > 1 ? "s" : "") +
      (conn.length
        ? " : " +
          conn
            .slice(0, 6)
            .map((c) => "<code>" + c + "</code>")
            .join(" ") +
          "."
        : ".") +
      " Un B2 en articule au moins 4 ou 5.</div></li>"
  );
  coh.push(
    "<li><span class=\"fleche\">·</span><div>" +
      phrases +
      " phrases, " +
      moy +
      " mots par phrase en moyenne, " +
      paragraphes +
      " paragraphe" +
      (paragraphes > 1 ? "s" : "") +
      ". " +
      (moy > 28
        ? "Coupez : au-delà de 25 mots les accords décrochent."
        : moy && moy < 9
        ? "Enchaînez certaines phrases avec un connecteur pour montrer la subordination."
        : "Longueur adaptée au niveau B2.") +
      "</div></li>"
  );
  par("COH").forEach((e) => coh.push(ligne(e)));

  const st = structure(txt, tacheActive);
  const faits = st.filter((x) => x[1]).length;
  const stItems = st.map(
    (x) =>
      "<li><span class=\"fleche\" style=\"color:" +
      (x[1] ? "#6FD3A9" : "var(--color-encre-3)") +
      '">' +
      (x[1] ? "✓" : "○") +
      "</span><div><b style=\"color:" +
      (x[1] ? "#fff" : "#C3CDDA") +
      '">' +
      esc(x[0]) +
      "</b>" +
      (x[1] ? "" : " — " + esc(x[2])) +
      "</div></li>"
  );
  if (t.parties) {
    const c = couperT3(txt);
    const na = motsDe(c.a);
    const nb = motsDe(c.b);
    const jauge = (
      p: { nom: string; min: number; max: number },
      n: number
    ) =>
      "<li><span class=\"fleche\">" +
      (n >= p.min && n <= p.max ? "✓" : "!") +
      "</span><div><b style=\"color:#fff\">" +
      esc(p.nom) +
      "</b> : " +
      n +
      " mots sur " +
      p.min +
      "–" +
      p.max +
      '<div class="barre-mots" style="width:100%;margin-top:5px;background:rgba(255,255,255,.12)"><i style="width:' +
      Math.min(100, (n / p.max) * 100) +
      "%;background:" +
      (n >= p.min && n <= p.max ? "#6FD3A9" : "#E5B549") +
      '"></i></div></div></li>';
    stItems.push(jauge(t.parties[0], na));
    stItems.push(jauge(t.parties[1], nb));
  }
  const formulesHtml =
    '<div style="padding:0 16px 14px" class="tirettes" id="tirettes-formules">' +
    t.formules
      .map(
        (f) =>
          '<span class="tirette" data-f="' +
          esc(f) +
          '" style="background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14);color:#D8E0EA;font-size:12.5px;cursor:pointer">' +
          esc(f.trim()) +
          "</span>"
      )
      .join("") +
    "</div>";

  const h = erreurs.filter((e) => e.g === "haute").length;
  const totalLive = erreurs.length
    ? erreurs.length + " signalements · " + h + " graves"
    : "";

  let checklistItems: string[] = [];
  let checklistFaits = 0;
  let checklistTotal = 0;
  let checklistTitre = "";
  if (tacheActive === 1 || tacheActive === 3) {
    const cl = tacheActive === 1 ? checklistOfficielleT1(txt) : checklistOfficielleT3(txt);
    checklistTitre = tacheActive === 1 ? "Checklist officielle Tâche 1" : "Checklist officielle Tâche 3";
    checklistTotal = cl.length;
    checklistFaits = cl.filter((x) => !!x[1]).length;
    checklistItems = cl.map((x, idx) => {
      const label = x[0];
      const ok = !!x[1];
      const aide = x[2];
      const estRegleRose = tacheActive === 3 && idx === 6;
      const couleurFond = estRegleRose
        ? (ok ? "rgba(60,207,145,.10)" : "rgba(239,143,160,.11)")
        : (ok ? "rgba(60,207,145,.10)" : "rgba(232,168,60,.10)");
      const couleurTexte = estRegleRose
        ? (ok ? "#14532d" : "#A83C14")
        : (ok ? "#14532d" : "#7C4A00");
      const icone = ok ? "✅" : (estRegleRose ? "❌" : "⚠️");
      const bord = estRegleRose
        ? (ok ? "1px solid rgba(60,207,145,.35)" : "1px solid rgba(239,143,160,.28)")
        : (ok ? "1px solid rgba(60,207,145,.30)" : "1px solid rgba(232,168,60,.25)");
      return (
        "<li style=\"margin:0 0 6px;padding:7px 9px;border-radius:8px;background:" + couleurFond + ";color:" + couleurTexte + ";border:" + bord + ";font-size:12.5px;line-height:1.45\"><span style=\"margin-right:6px\">" +
        icone +
        "</span><b>" + esc(label) + "</b>" +
        (ok ? "" : "<br><span style=\"opacity:.85;font-size:11.7px;margin-left:22px\">" + esc(aide) + "</span>") +
        "</li>"
      );
    });
  }
  const checklistBloc =
    checklistTotal === 0
      ? ""
      : bloc(
          "chk",
          checklistTitre,
          checklistFaits === checklistTotal ? "p-ok" : "p-am",
          checklistFaits + "/" + checklistTotal,
          checklistItems
        );

  return (
    <section className="carte sombre">
      <div className="entete-carte">
        <h2>Marge du correcteur · en direct</h2>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-marge)",
          }}
        >
          {totalLive}
        </span>
      </div>
      <div
        id="live"
        onClick={(e) => {
          const el = (e.target as HTMLElement).closest(".tirette") as HTMLElement | null;
          if (!el) return;
          const f = el.dataset.f;
          if (f) onInsertFormule(f);
        }}
        dangerouslySetInnerHTML={{
          __html:
            bloc(
              "str",
              "Structure de la " + t.titre.toLowerCase(),
              faits === st.length ? "p-ok" : "p-am",
              faits + "/" + st.length,
              stItems
            ) +
            '<section class="section-live"><div class="titre"><span class="pastille p-ok">+</span>Formules à insérer</div>' +
            formulesHtml +
            "</section>" +
            bloc(
              "reg",
              regTitre,
              regClasse,
              tus && vs ? "!" : "✓",
              regItems
            ) +
            bloc(
              "ort",
              "Orthographe, accents, articles",
              ort.length ? "p-ko" : "p-ok",
              ort.length || "✓",
              ort.map(ligne)
            ) +
            bloc(
              "esp",
              "Interférences de l'espagnol",
              esp.length ? "p-ko" : "p-ok",
              esp.length || "✓",
              esp.map(ligne)
            ) +
            bloc(
              "lex",
              "Richesse lexicale",
              lex.length ? "p-am" : "p-ok",
              lex.length || "✓",
              lex.map(ligne)
            ) +
            bloc("coh", "Cohérence et structure", "p-am", conn.length, coh) +
            checklistBloc,
        }}
      />
    </section>
  );
}
