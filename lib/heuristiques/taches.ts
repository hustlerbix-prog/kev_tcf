import type { Tache } from "@/lib/types/tcf";

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
    formules: [
      "De nos jours, la question de ",
      "divise l'opinion publique. ",
      "Certains estiment que ",
      "Le premier document soutient que ",
      "Par contre, d'autres trouvent que ",
      "À l'inverse, le second document rappelle que ",
      "À ce sujet, il est important de reconnaître que ",
      "Pour ma part, je considère que ",
      "Voilà pourquoi il est nécessaire de ",
      "En définitive, il me semble que ",
    ],
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
