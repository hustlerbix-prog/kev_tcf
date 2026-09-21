import type { ErreurLive } from "@/lib/types/tcf";
import {
  ACCENTS,
  LOC_A,
  VERBES_A,
  CALQUES,
  PAUVRE,
  CONNECTEURS,
  MARQ_TU,
  MARQ_VOUS,
} from "./regles";

export type { ErreurLive } from "@/lib/types/tcf";

export function analyser(txt: string): ErreurLive[] {
  const out: ErreurLive[] = [];
  const push = (
    i: number,
    l: number,
    code: ErreurLive["code"],
    g: ErreurLive["g"],
    msg: string
  ) => {
    if (l > 0) out.push({ i, l, code, g, msg });
  };
  let m: RegExpExecArray | null;

  const tus: RegExpExecArray[] = [];
  const vs: RegExpExecArray[] = [];
  MARQ_TU.lastIndex = 0;
  while ((m = MARQ_TU.exec(txt))) tus.push(m);
  MARQ_VOUS.lastIndex = 0;
  while ((m = MARQ_VOUS.exec(txt))) vs.push(m);
  if (tus.length && vs.length) {
    const min = tus.length <= vs.length ? tus : vs;
    const autre = tus.length <= vs.length ? "vous" : "tu";
    min.forEach((x) =>
      push(
        x.index,
        x[0].length,
        "REG",
        "haute",
        "Mélange de registres : le reste de la copie utilise **" +
          autre +
          "**. Choisissez-en un et tenez-le du début à la fin."
      )
    );
  }

  const motRe = /[A-Za-zÀ-ÿ']+/g;
  while ((m = motRe.exec(txt))) {
    const bas = m[0].toLowerCase();
    if (
      ACCENTS[bas] &&
      ACCENTS[bas] !== bas &&
      bas !== "du" &&
      bas !== "sur"
    ) {
      push(m.index, m[0].length, "ORT", "haute", "Accent manquant → **" + ACCENTS[bas] + "**");
    }
  }

  const aRe = new RegExp(
    "\\ba\\s+(" + LOC_A.join("|") + ")\\b",
    "gi"
  );
  while ((m = aRe.exec(txt))) {
    const av = txt.slice(Math.max(0, m.index - 16), m.index).toLowerCase();
    if (/\b(il|elle|on|qui|y|n'|ça|cela|ce|il y)\s*$/.test(av)) continue;
    push(
      m.index,
      1,
      "ORT",
      "haute",
      "**à** (préposition) prend un accent. « a » sans accent, c'est le verbe avoir."
    );
  }
  const aRe3 = new RegExp(
    "\\b(" + VERBES_A.join("|") + ")\\s*a\\b",
    "gi"
  );
  while ((m = aRe3.exec(txt)))
    push(
      m.index + m[0].length - 1,
      1,
      "ORT",
      "haute",
      "Après « " + m[1] + " » on écrit **à** avec accent."
    );
  const aRe4 = /\ba\s+(?=[A-ZÀ-Þ][a-zà-ÿ]{2,})/g;
  while ((m = aRe4.exec(txt))) {
    const av = txt.slice(Math.max(0, m.index - 16), m.index).toLowerCase();
    if (/\b(il|elle|on|qui|y|n'|ça|cela|ce)\s*$/.test(av)) continue;
    push(
      m.index,
      1,
      "ORT",
      "moyenne",
      "Devant un nom de lieu ou de personne, c'est la préposition **à** : « à Montréal »."
    );
  }
  const aRe2 = /\b(il|elle|on|qui|y|ça|cela)\s+à\b/gi;
  while ((m = aRe2.exec(txt)))
    push(
      m.index + m[0].length - 1,
      1,
      "ORT",
      "haute",
      "Ici c'est le verbe **avoir** : « a » sans accent."
    );

  const ouRe =
    /\b(là|le jour|au moment|l'endroit|la ville|le pays|la région|le quartier|c'est là)\s+ou\b/gi;
  while ((m = ouRe.exec(txt)))
    push(
      m.index + m[0].length - 2,
      2,
      "ORT",
      "moyenne",
      "Lieu ou moment → **où** avec accent."
    );

  const saRe =
    /\bsa\s+(fait|va|me|te|se|est|serait|dépend|marche|permet|m'|t')/gi;
  while ((m = saRe.exec(txt)))
    push(
      m.index,
      2,
      "ORT",
      "moyenne",
      "→ **ça** (pronom démonstratif). « sa » = possessif."
    );

  const elRe =
    /\b(je|me|te|se|ne|de|le|la|que|jusque|lorsque|puisque|si)\s+(?=(a|e|é|è|ê|i|o|u|â|î|ô|û|y)[a-zà-ÿ])/gi;
  while ((m = elRe.exec(txt))) {
    const mot = m[1].toLowerCase();
    const suite = txt.slice(m.index + m[0].length).split(/\s/)[0];
    if (mot === "si") {
      if (/^il/i.test(suite))
        push(
          m.index,
          m[0].length - 1,
          "ORT",
          "haute",
          "**s'il** / **s'ils** (élision uniquement devant « il »)."
        );
      continue;
    }
    push(
      m.index,
      m[0].length - 1,
      "ORT",
      "haute",
      "Élision obligatoire → **" + mot.slice(0, -1) + "'" + suite + "**"
    );
  }

  const ctRe = /\b(de|à)\s+(le|les)\b/gi;
  while ((m = ctRe.exec(txt))) {
    const p = m[1].toLowerCase();
    const a = m[2].toLowerCase();
    const attendu =
      p === "de"
        ? a === "le"
          ? "du"
          : "des"
        : a === "le"
        ? "au"
        : "aux";
    push(
      m.index,
      m[0].length,
      "GR",
      "moyenne",
      "Contraction → **" +
        attendu +
        "** (sauf si « le / les » est un pronom : « j'essaie de le faire »)."
    );
  }

  [...CALQUES, ...PAUVRE].forEach((r) => {
    r.re.lastIndex = 0;
    while ((m = r.re.exec(txt))) {
      push(m.index, m[0].length, r.code, r.g, r.m);
      if (m[0].length === 0) r.re.lastIndex++;
    }
  });

  const stop = new Set([
    "dans", "pour", "avec", "cette", "leur", "leurs", "nous", "vous", "elle",
    "elles", "ils", "plus", "mais", "aussi", "très", "tout", "tous", "toute",
    "toutes", "être", "avoir", "faire", "sont", "était", "étaient", "avez",
    "avons", "parce", "comme", "bien", "sans", "déjà", "même", "entre", "alors",
    "donc", "peut", "peuvent", "doit", "doivent", "quand", "ainsi", "depuis",
    "chaque", "autre", "autres", "celui", "celle", "ceux", "notre", "nos",
    "votre", "vos", "beaucoup",
  ]);
  const cnt: Record<string, number> = {};
  const pos: Record<string, RegExpExecArray[]> = {};
  motRe.lastIndex = 0;
  while ((m = motRe.exec(txt))) {
    const b = m[0].toLowerCase();
    if (b.length < 5 || stop.has(b)) continue;
    cnt[b] = (cnt[b] || 0) + 1;
    (pos[b] = pos[b] || []).push(m);
  }
  Object.keys(cnt).forEach((b) => {
    if (cnt[b] >= 3)
      pos[b].slice(2).forEach((x) =>
        push(
          x.index,
          x[0].length,
          "LEX",
          "basse",
          "Répété " +
            cnt[b] +
            " fois. Un jury B2 attend une reformulation : synonyme, pronom ou tournure nominale."
        )
      );
  });

  let debut = 0;
  txt.split(/(?<=[.!?])\s+/).forEach((ph) => {
    const nm = ph.trim().split(/\s+/).filter(Boolean).length;
    if (nm > 38)
      push(
        debut,
        Math.min(ph.length, 60),
        "COH",
        "moyenne",
        "Phrase de " +
          nm +
          " mots : coupez-la en deux. Les périodes trop longues font perdre les accords."
      );
    debut += ph.length + 1;
  });

  out.sort((a, b) => a.i - b.i || b.l - a.l);
  const propre: ErreurLive[] = [];
  let fin = -1;
  out.forEach((e) => {
    if (e.i >= fin) {
      propre.push(e);
      fin = e.i + e.l;
    }
  });
  return propre;
}

/**
 * Retire les faux positifs connus du tableau d'erreurs heuristiques.
 * Protège :
 *  · Virgule après numéro civique avant rue / route… (234, rue X → OQLF correct)
 *  · Point de phrase après « N h » (17 h. = fin de phrase, l'abréviation h n'a pas de point)
 *  · Messages heuristiques qui déclarent eux-mêmes la forme "Correct" / "juste"
 *  · Classiques : "afin que nous puissions" (subjonctif correct), "j'ai hâte de X"
 */
export function nettoyerHeuristiques(
  arr: ErreurLive[],
  texte: string
): ErreurLive[] {
  if (!arr || arr.length === 0) return arr;
  return arr.filter((e) => {
    const extrait = (texte.slice(e.i, e.i + (e.l || 0)) || "").trim();
    if (!extrait) return true;

    // 234, rue X
    if (e.code === "ORT" && /^\d+,$/.test(extrait)) {
      const suite = texte
        .slice(e.i + e.l, e.i + e.l + 14)
        .trim();
      if (
        /^rue|boul|bd|av|avenue|boulevard|chemin|route|place|allée|impasse|cours|passage|voie|square|quai/i.test(
          suite
        )
      ) {
        return false;
      }
    }
    // « N h. » fin de phrase
    if (e.code === "ORT" && /^h\.?$/i.test(extrait)) {
      const av = texte.slice(Math.max(0, e.i - 8), e.i);
      if (/\d{1,2}\s*$/.test(av)) {
        const apres = texte.slice(e.i + e.l, e.i + e.l + 4);
        if (!apres || /^\s*[A-ZÀ-Ý.!?]/.test(apres) || !apres.trim()) {
          return false;
        }
      }
    }
    // auto-déclaré Correct / juste
    if (/(^|[\s.!?])(correct|juste|valide|ok\.?|bonne?|bien)([\s.!?]|$)/i.test(e.msg)) {
      const estDeclareCorrect = /(forme\s+)?(correct|juste|valide)/i.test(e.msg);
      if (estDeclareCorrect) return false;
    }
    // afin que nous puissions (subjonctif correct après afin que)
    if (/afin\s+que/i.test(extrait)) {
      return false;
    }
    // j'ai hâte de (forme idiomatique)
    if (/j['’]\s*ai\s+hâte/i.test(extrait.toLowerCase())) {
      return false;
    }
    // "les trios à partir de 15 $" → correct
    if (/(à|a)\s+partir\s+de/i.test(extrait) && /\$\s*$|^\$\s*\d|\d+\s*\$/.test(texte.slice(Math.max(0, e.i - 30), e.i + e.l + 30))) {
      return false;
    }
    return true;
  });
}

/** Analyse puis nettoie (combinaison courante, retourne la liste "propre") */
export function analyserPropre(txt: string): ErreurLive[] {
  const heur = nettoyerHeuristiques(analyser(txt), txt);
  const fromSpell: ErreurLive[] = [];
  try {
    // Import paresseux: spellFR.ts contient 1400+ entrées, arbre lourd.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const spell = require("../utils/spellFR") as typeof import("../utils/spellFR");
    const matches = spell.analyseOrthographe(txt, { includeRule: true });
    for (const m of matches) {
      const rule = m.rule ? ` — ${m.rule}` : "";
      const msg = `Orthographe "${m.wrong}" → correction suggérée : "${m.suggestion}"${rule}`;
      fromSpell.push({
        i: m.start,
        l: m.end - m.start,
        code: "ORT",
        g: "haute",
        msg,
      });
    }
  } catch (_) {
    /* ignore require SSR failures; if spell module unavailable fall back to heuristics only */
  }
  return nettoyerHeuristiques([...heur, ...fromSpell], txt);
}

export { CONNECTEURS, MARQ_TU, MARQ_VOUS };
