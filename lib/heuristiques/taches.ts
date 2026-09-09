import type { Tache } from "@/lib/types/tcf";

export const CONNECTEURS_T3_GROUPE: Record<string, [string, string, string]> = {
  "POUR COMPARER": ["En revanche", "À l'inverse", "Tandis que"],
  "POUR AJOUTER": ["Tout d'abord", "De plus", "En outre"],
  "POUR EXPLIQUER": ["En effet", "Car", "Parce que"],
  "POUR DONNER UN EXEMPLE": ["Par exemple", "Notamment", "À savoir"],
  "POUR NUANCER": ["Cependant", "Pourtant", "Néanmoins"],
  "POUR CONCLURE": ["Pour conclure", "En somme", "Finalement"],
};

const _FLAT_CONNECTEURS_T3: string[] = Object.values(CONNECTEURS_T3_GROUPE).reduce(
  (acc: string[], trio) => {
    for (const c of trio) acc.push(c);
    return acc;
  },
  [] as string[]
);

export const CONNECTEURS_ORAUX_GROUPE: Record<string, string[]> = {
  "POUR COMPARER": ["En revanche", "À l'inverse", "Tandis que"],
  "POUR AJOUTER": ["Tout d'abord", "De plus", "En outre"],
  "POUR EXPLIQUER": ["En effet", "Car", "Parce que"],
  "POUR DONNER UN EXEMPLE": ["Par exemple", "Notamment", "À savoir"],
  "POUR NUANCER": ["Cependant", "Pourtant", "Néanmoins"],
  "POUR CONCLURE": ["Pour conclure", "En somme", "Finalement"],
  "MARQUEURS HÉSITATION ORALE": [
    "Écoute…", "Ben…", "Dis donc…", "Franchement…",
    "Justement…", "Après…", "En même temps…", "Enfin bref…",
    "Bon", "Bah…", "Voyons…", "Tiens…"
  ],
};

export function checklistOfficielleT1(
  txt: string
): [label: string, ok: boolean, aide: string][] {
  const n = motsDe(txt);
  const qqoqccp = /\b(qui|quoi|quand|où|avec qui|combien|pourquoi|comment|samedi|dimanche|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|rue|avenue|bourg|québec|montréal|toronto|vancouver|ottawa)\b/i;
  const compteQQOQCCP = (txt.match(qqoqccp) || []).length;
  return [
    [
      "Destinataire",
      /(^|\n)\s*(Salut\s+[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜÆŒ]|Bonjour\s+(Madame|Monsieur|Cher\s+[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ]|Chère\s+[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ]|Chers|Mesdames|Messieurs))/i.test(
        txt
      ),
      "Salut [Prénom] / Bonjour Madame, Monsieur",
    ],
    [
      "Motif",
      /(je\s*t['’É]écri[st]|je\s+vous\s+écri[st]|je\s+me\s+permets?\s+de\s+(vous\s+)?écri[st]|je\s+vous\s+adresse)/i.test(
        txt
      ),
      "Je t'écris pour… / Je vous écris afin de…",
    ],
    [
      "2-3 détails concrets",
      n >= 45 && compteQQOQCCP >= 3,
      "Qui · Quoi · Quand · Où · Avec qui (≥3 mots-clés présents)",
    ],
    [
      "Demande / attente",
      /(j['’]aimerais|je\s+souhaiterais|pourrais-tu|pourriez-vous|je\s+te\s+demande|je\s+vous\s+demande|serait-il\s+possible|peux-tu|pouvez-vous|attends\s+de\s+(ta|votre)\s+part|dis-moi|réponds-moi)/i.test(
        txt
      ),
      "J'aimerais que… / Pourriez-vous… / Dis-moi si…",
    ],
    [
      "Formule de fin",
      /(à\s+bientôt|porte-toi\s+bien|amicalement|cordialement|bien\s+à\s+(toi|vous)|salutations|au\s+plaisir|à\s+très\s+vite|je\s+t['’]embrasse|je\s+vous\s+remercie)/i.test(
        txt
      ),
      "À bientôt · Cordialement · Amicalement · Prénom",
    ],
    [
      "60-120 mots",
      n >= 60 && n <= 120,
      `Compte actuel : ${n} mots · cible 95-115`,
    ],
  ];
}

export function checklistOfficielleT3(
  txt: string
): [label: string, ok: boolean, aide: string][] {
  const n = motsDe(txt);
  const { a: part1, b: part2 } = couperT3(txt);
  const n1 = motsDe(part1);
  const n2 = motsDe(part2);
  const argWords = /\b(Tout d'abord|De plus|En outre|En effet|Premièrement|Deuxièmement|Par ailleurs|D'une part|D'autre part)\b/i;
  const argsPart2 = Array.from(part2.matchAll(argWords)).length;
  const marqueursAvis = /\b(le\s+premier\s+document|le\s+second\s+document|premier\s+texte|deuxième\s+texte|certains[^.]{0,80}(par\s+contre|en\s+revanche|à\s+l['’]inverse)[^.]{0,120}d['’]autres)\b/i;
  const deuxDocs = marqueursAvis.test(txt);
  const exPart2 = /\b(Par\s+exemple|Notamment|À\s+savoir)\b/i.test(part2);
  const conclPart2 = /\b(Pour\s+conclure|En\s+somme|Finalement|En\s+définitive|En\s+conclusion)\b/i.test(
    part2
  );
  const prefixe = txt.slice(0, Math.min(80, txt.length));
  const debutJePense =
    /\b(pour\s+ma\s+part|je\s+pense|je\s+considère|à\s+mon\s+sujet|selon\s+moi|personnellement|il\s+me\s+semble|j['’]estime)\b/i;
  const regleRoseOk =
    !debutJePense.test(part1) && !/argument\s+personnel|copier[- ]coller|copié-collé/i.test(txt.slice(0, Math.max(150, n1 * 5)));
  return [
    [
      "2 opinions reformulées",
      deuxDocs ||
        (/\b(Certains|Les\s+uns|Une\s+partie\s+de\s+l['’]opinion|D['’]aucuns)\b/i.test(
          part1
        ) &&
          /\b(Par\s+contre|En\s+revanche|À\s+l['’]inverse|Au\s+contraire|Tandis\s+que)\b/i.test(
            part1
          )),
      "Doc. 1 (Le premier document souligne que…) + Doc. 2 (En revanche, le second estime que…) + synonymes",
    ],
    [
      "Avis clair",
      OPINION_RE.test(part2) ||
        /\b(Pour\s+ma\s+part|À\s+ce\s+sujet|Personnellement|Je\s+considère|Il\s+me\s+semble|J['’]estime|Selon\s+moi|À\s+mon\s+avis)\b/i.test(
          part2
        ),
      "Pour ma part, je pense que… · À ce sujet, il est important de reconnaître que…",
    ],
    [
      "2 arguments minimum",
      argsPart2 >= 2,
      "Tout d'abord,… En effet,… + De plus,… (≥2 marqueurs dans la Partie 2)",
    ],
    [
      "Exemple concret",
      exPart2,
      "Par exemple, · Notamment · À savoir (1 exemple concret dans Partie 2)",
    ],
    [
      "Conclusion",
      conclPart2,
      "Pour conclure · En somme · Finalement · En définitive",
    ],
    [
      "120-180 mots",
      n >= 120 && n <= 180 && n1 >= 30 && n1 <= 70 && n2 >= 70,
      `Total ${n} mots · Partie1 ${n1} (cible 40-60) · Partie2 ${n2} (cible 80-120) · cible globale 150-175`,
    ],
    [
      "⚠️ Règle rose · Partie 1 sans avis personnel",
      regleRoseOk,
      "Partie 1 · 0 « je pense » · 0 argument personnel · 0 copier-coller de phrases des documents",
    ],
  ];
}

export const TACHES: Record<1 | 2 | 3, Tache> = {
  1: {
    titre: "Tâche 1",
    type: "Message, courriel ou annonce",
    min: 60,
    max: 120,
    cible: [95, 115],
    minutes: 15,
    attendu:
      "Message adressé à un ou plusieurs destinataires dont le statut est précisé dans la consigne : décrire, raconter et/ou expliquer.",
    plan: [
      ["Salutations",
        "« Salut Ayoub, comment vas-tu ? » entre amis ; « Bonjour Madame Tremblay, » en contexte formel."],
      ["But du message",
        "« Je t'écris pour te dire que… » / « Je vous écris afin de vous informer que… »"],
      ["Circonstances",
        "Qui ? quoi ? quand ? où ? avec qui ? Deux ou trois détails concrets, pas plus."],
      ["Attente concrète",
        "Ce que vous demandez au destinataire : « J'aimerais que tu me recommandes quelques endroits. »"],
      ["Recommandation, promesse ou remerciement",
        "« Je te promets de… », « Je vous remercie par avance de… »"],
      ["Formule de clôture",
        "À bientôt, porte-toi bien, amicalement, cordialement — puis votre prénom."],
    ],
    formules: [
      "Salut ",
      "Bonjour Madame, ",
      "Je t'écris pour te dire que ",
      "Je vous écris afin de vous informer que ",
      "Il s'agit de ",
      "J'aimerais que tu me recommandes ",
      "Pourriez-vous m'indiquer ",
      "Je te remercie par avance de ",
      "Dans l'attente de ta réponse, ",
      "À bientôt, ",
      "Porte-toi bien, ",
      "Amicalement, ",
      "Cordialement, ",
    ],
  },
  2: {
    titre: "Tâche 2",
    type: "Article de blog ou de forum",
    min: 120,
    max: 150,
    cible: [132, 148],
    minutes: 20,
    attendu:
      "Compte rendu d'expérience ou récit destiné à plusieurs lecteurs, accompagné de commentaires, d'opinions ou d'arguments, en fonction d'un objectif.",
    plan: [
      ["Titre accrocheur", "Court et intrigant : « Un métier de nobles », « Trois raisons de s'y mettre »."],
      ["Présentation succincte",
        "Un paragraphe bref qui présente l'activité et donne envie de lire la suite."],
      ["Votre expérience",
        "Racontez la vôtre avec des connecteurs chronologiques : d'abord, ensuite, puis, enfin."],
      ["Recommandations",
        "Invitez vos lecteurs à s'y intéresser : « je vous recommande vivement de… »"],
    ],
    formules: [
      "De nos jours, ",
      "Passionné(e) depuis ",
      "D'abord, ",
      "Ensuite, ",
      "Puis, ",
      "Enfin, ",
      "Ce qui m'a le plus marqué, c'est ",
      "Au fil du temps, j'ai compris que ",
      "Je vous recommande vivement de ",
      "N'hésitez pas à ",
      "Si vous hésitez encore, sachez que ",
    ],
  },
  3: {
    titre: "Tâche 3",
    type: "Article comparant deux points de vue",
    min: 120,
    max: 180,
    cible: [150, 175],
    minutes: 25,
    attendu:
      "Article de journal ou de site Internet qui compare les deux points de vue exprimés dans les deux documents, puis prise de position personnelle sur le thème.",
    parties: [
      { nom: "Les deux points de vue", min: 40, max: 60 },
      { nom: "Votre point de vue", min: 80, max: 120 },
    ],
    plan: [
      ["Titre", "Une formule courte qui annonce le débat."],
      [
        "Les deux points de vue — 40 à 60 mots",
        "« De nos jours, la question de… divise l'opinion publique. Certains pensent que… Par contre, d'autres trouvent que… »",
      ],
      [
        "Votre point de vue — 80 à 120 mots",
        "« À ce sujet, il est important de reconnaître que… voilà pourquoi il est nécessaire de… »",
      ],
    ],
    formules: _FLAT_CONNECTEURS_T3,
  },
};

export const OPINION_RE =
  /(à ce sujet|selon moi|à mon avis|pour ma part|quant à moi|je considère|il me semble|personnellement|j'estime)/i;

export function motsDe(t: string): number {
  return (String(t).trim().match(/[\wÀ-ÿ'’-]+/g) || []).length;
}

export function couperT3(txt: string) {
  const lignes = txt.trim().split(/\n/);
  let corps = txt.trim();
  let titre = "";
  if (
    lignes.length > 1 &&
    motsDe(lignes[0]) <= 10 &&
    !/[.!?]$/.test(lignes[0].trim())
  ) {
    titre = lignes[0];
    corps = lignes.slice(1).join("\n").trim();
  }
  const m = corps.match(OPINION_RE);
  if (m && (m.index ?? 0) > 20) {
    return {
      titre,
      a: corps.slice(0, m.index),
      b: corps.slice(m.index),
    };
  }
  const par = corps.split(/\n\s*\n/);
  if (par.length > 1) {
    return { titre, a: par[0], b: par.slice(1).join("\n") };
  }
  return { titre, a: corps, b: "" };
}

export function structure(txt: string, n: 1 | 2 | 3): [string, boolean, string][] {
  const tete = txt.slice(0, 120);
  const l0 = txt.trim().split(/\n/)[0] || "";
  const titreOk =
    motsDe(l0) > 0 && motsDe(l0) <= 10 && !/[.!?]$/.test(l0.trim());
  const par = txt.trim() ? txt.trim().split(/\n\s*\n/).length : 0;
  const chrono = [
    "d'abord",
    "tout d'abord",
    "ensuite",
    "puis",
    "enfin",
    "par la suite",
    "au début",
    "finalement",
    "peu à peu",
  ].filter((c) =>
    new RegExp("\\b" + c.replace(/'/g, "['’]") + "\\b", "i").test(txt)
  ).length;

  if (n === 1) {
    return [
      [
        "Salutations",
        /\b(salut|bonjour|bonsoir|cher|chère|chers|madame|monsieur)\b/i.test(tete),
        "« Salut Ayoub, comment vas-tu ? » entre amis ; « Bonjour Madame, » en formel.",
      ],
      [
        "But du message",
        /(je t['’]écris|je vous écris|je me permets de vous écrire|je vous adresse)/i.test(
          txt
        ),
        "« Je t'écris pour te dire que… » / « Je vous écris afin de vous informer que… »",
      ],
      [
        "Circonstances",
        motsDe(txt) >= 45,
        "Qui ? quoi ? quand ? où ? avec qui ? Deux ou trois détails concrets.",
      ],
      [
        "Attente concrète",
        /(j['’]aimerais|je souhaiterais|pourrais-tu|pourriez-vous|je te demande|je vous demande|serait-il possible|peux-tu|pouvez-vous)/i.test(
          txt
        ),
        "Ce que vous attendez du destinataire : « J'aimerais que tu me recommandes… »",
      ],
      [
        "Remerciement ou promesse",
        /(je te remercie|je vous remercie|merci d['’]avance|par avance|je te promets|je vous promets|je te recommande|je vous recommande)/i.test(
          txt
        ),
        "« Je te remercie par avance de… », « Je te promets de… »",
      ],
      [
        "Formule de clôture",
        /(à bientôt|porte-toi bien|amicalement|cordialement|bien à toi|bien à vous|salutations|au plaisir|à très vite|je t['’]embrasse)/i.test(
          txt
        ),
        "À bientôt, porte-toi bien, amicalement, cordialement — puis votre prénom.",
      ],
    ];
  }
  if (n === 2) {
    return [
      [
        "Titre accrocheur",
        titreOk,
        "Court, sans point final : « Un métier de nobles ».",
      ],
      [
        "Présentation de l'activité",
        par >= 2,
        "Un premier paragraphe bref qui présente le sujet et donne envie de lire.",
      ],
      [
        "Récit de votre expérience",
        chrono >= 2,
        "Racontez la vôtre, pas une théorie générale.",
      ],
      [
        "Connecteurs chronologiques",
        chrono >= 3,
        "D'abord, ensuite, puis, enfin, par la suite.",
      ],
      [
        "Recommandation aux lecteurs",
        /(je vous recommande|je vous conseille|n['’]hésitez pas|je vous invite|lancez-vous|essayez|croyez-moi)/i.test(
          txt
        ),
        "« Je vous recommande vivement de… », « N'hésitez pas à… »",
      ],
    ];
  }
  const c = couperT3(txt);
  return [
    [
      "Titre",
      titreOk,
      "Une formule courte qui annonce le débat.",
    ],
    [
      "Résumé du premier document",
      /(certains|les uns|le premier document|selon le premier|d['’]aucuns|une partie de l['’]opinion)/i.test(
        txt
      ),
      "« Certains pensent que… »",
    ],
    [
      "Résumé du second document",
      /(d['’]autres|par contre|en revanche|à l['’]inverse|le second document|le deuxième document|au contraire)/i.test(
        txt
      ),
      "« Par contre, d'autres trouvent que… »",
    ],
    [
      "Prise de position personnelle",
      OPINION_RE.test(txt),
      "« À ce sujet, il est important de reconnaître que… »",
    ],
    [
      "Deux parties distinctes",
      motsDe(c.a) >= 30 && motsDe(c.b) >= 50,
      "40 à 60 mots pour les deux documents, 80 à 120 mots pour votre avis.",
    ],
  ];
}
