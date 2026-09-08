export const ACCENTS: Record<string, string> = {
  espere: "espère", esperons: "espérons", preference: "préférence", prefere: "préfère",
  probleme: "problème", problemes: "problèmes", tres: "très", apres: "après", deja: "déjà",
  etre: "être", meme: "même", memes: "mêmes", pere: "père", mere: "mère", annee: "année",
  annees: "années", ete: "été", necessaire: "nécessaire", different: "différent",
  differente: "différente", differents: "différents", interessant: "intéressant",
  interessante: "intéressante", experience: "expérience", premiere: "première",
  societe: "société", qualite: "qualité", qualites: "qualités", activite: "activité",
  activites: "activités", possibilite: "possibilité", regle: "règle", regles: "règles",
  eleve: "élève", eleves: "élèves", etudiant: "étudiant", etudiants: "étudiants",
  etude: "étude", etudes: "études", ecole: "école", economie: "économie", energie: "énergie",
  enorme: "énorme", evidemment: "évidemment", evolution: "évolution", emission: "émission",
  electrique: "électrique", developpement: "développement", developper: "développer",
  gouvernement: "gouvernement", generalement: "généralement", general: "général",
  generale: "générale", securite: "sécurité", realite: "réalité", realiser: "réaliser",
  resultat: "résultat", resultats: "résultats", reussir: "réussir", reussite: "réussite",
  reduire: "réduire", reflechir: "réfléchir", repondre: "répondre", reponse: "réponse",
  reunion: "réunion", cout: "coût", gout: "goût", du: "dû", sur: "sûr", theme: "thème",
  systeme: "système", modele: "modèle", college: "collège", siecle: "siècle", celebre: "célèbre",
  complete: "complète", concrete: "concrète", derniere: "dernière", entiere: "entière",
  maniere: "manière", matiere: "matière", carriere: "carrière", frere: "frère", chere: "chère",
  legere: "légère", succes: "succès", progres: "progrès", acces: "accès", proces: "procès",
  exces: "excès", interet: "intérêt", benefice: "bénéfice", consequence: "conséquence",
  frequent: "fréquent", preferer: "préférer", proteger: "protéger", preparer: "préparer",
  presenter: "présenter", precis: "précis", precisement: "précisément", desole: "désolé",
  desolee: "désolée", arrivee: "arrivée", idee: "idée", idees: "idées",
  ecris: "écris", ecrit: "écrit", ecrite: "écrite", ecrire: "écrire", francais: "français",
  francaise: "française", musee: "musée", decide: "décidé", decider: "décider", motive: "motivé",
  grace: "grâce", ameliorer: "améliorer", ameliore: "amélioré", etudier: "étudier",
  etudie: "étudié", esperer: "espérer", developpe: "développé", reference: "référence",
  opportunite: "opportunité", communaute: "communauté", diversite: "diversité",
  priorite: "priorité", responsabilite: "responsabilité", difficulte: "difficulté",
  capacite: "capacité", necessite: "nécessité", verite: "vérité", cinema: "cinéma",
  medecin: "médecin", metro: "métro", quebecois: "québécois", region: "région",
  reseau: "réseau", resoudre: "résoudre", reagir: "réagir", generation: "génération",
  creer: "créer", espece: "espèce", journee: "journée", soiree: "soirée", matinee: "matinée",
  entree: "entrée", sante: "santé", etes: "êtes", etais: "étais", etait: "était",
  etaient: "étaient", etions: "étions", montreal: "Montréal", quebec: "Québec",
  integration: "intégration", serieux: "sérieux", serieuse: "sérieuse", celebrer: "célébrer",
  amenagement: "aménagement", evenement: "événement", benevole: "bénévole",
  voila: "voilà", dela: "delà", tot: "tôt", plutot: "plutôt", bientot: "bientôt",
  hopital: "hôpital", role: "rôle", controle: "contrôle", meteo: "météo", numero: "numéro",
  telephone: "téléphone", television: "télévision", universite: "université",
  liberte: "liberté", egalite: "égalité", salarie: "salarié", employe: "employé",
  cafe: "café", cle: "clé", fevrier: "février", aout: "août",
};

(function () {
  const sup: Record<string, string> = {};
  Object.keys(ACCENTS).forEach((k) => {
    const v = ACCENTS[k];
    if (!/s$/.test(k) && !ACCENTS[k + "s"]) sup[k + "s"] = v + "s";
    if (/é$/.test(v)) {
      if (!ACCENTS[k + "e"]) sup[k + "e"] = v + "e";
      if (!ACCENTS[k + "es"]) sup[k + "es"] = v + "es";
    }
  });
  Object.assign(ACCENTS, sup);
})();

export const LOC_A = [
  "partir", "cause", "propos", "travers", "nouveau", "peine", "condition", "moins", "savoir",
  "peu", "présent", "distance", "venir", "l'heure", "l'aise", "l'avenir", "l'étranger",
  "l'inverse", "l'écrit", "temps", "court", "long", "défaut", "volonté", "nouveau",
  "juste titre", "mon avis", "votre avis", "son avis", "ce sujet", "cet égard",
  "cette occasion", "ce propos", "la fois", "la maison", "la place", "la suite", "la mienne",
];

export const VERBES_A = [
  "grâce", "grace", "jusqu'", "jusqu", "quant", "face", "rapport", "penser", "pense",
  "pensons", "aider", "aide", "aidons", "réussir", "réussi", "réussis", "réussit",
  "commencer", "commence", "commencé", "continuer", "continue", "continué", "arriver",
  "arrive", "arrivé", "aller", "vais", "vas", "va", "allons", "allez", "vont", "inviter",
  "invite", "invité", "hésiter", "hésite", "apprendre", "apprends", "apprend", "chercher",
  "cherche", "participer", "participe", "participé", "assister", "assiste", "assisté",
  "s'attendre", "renoncer", "renonce", "contribuer", "contribue", "tient", "tenir",
];

export interface Règle {
  re: RegExp;
  code: "REG" | "ORT" | "GR" | "CONJ" | "ESP" | "LEX" | "COH";
  g: "haute" | "moyenne" | "basse";
  m: string;
}

export const CALQUES: Règle[] = [
  { re: /\ben\s+(le|la|les)\s+/gi, code: "ESP", g: "haute",
    m: "« en el / en la » → en français on dit **dans le, dans la, dans les** (ou au, à la, aux)." },
  { re: /\bje suis d'accord avec que\b/gi, code: "ESP", g: "haute",
    m: "« estoy de acuerdo con que » → **je suis d'accord pour dire que** / **avec le fait que**." },
  { re: /\bbeaucoup des\b/gi, code: "ESP", g: "haute",
    m: "« muchas de las » → **beaucoup de** + nom, sans article (beaucoup de gens)." },
  { re: /\bla plupart de (le|la|les)\b/gi, code: "ESP", g: "haute",
    m: "→ **la plupart des** + nom pluriel." },
  { re: /\bje suis\s+\d+\s+ans\b/gi, code: "ESP", g: "haute",
    m: "« tengo X años » → **j'ai X ans**." },
  { re: /\bje suis (faim|froid|chaud|raison|tort|peur|sommeil|besoin)\b/gi, code: "ESP", g: "haute",
    m: "→ **avoir** faim / froid / chaud / raison / tort / peur / besoin." },
  { re: /\bil faut que\s+(je|tu|il|elle|on|nous|vous|ils|elles)\s+(peux|peut|dois|doit|suis|est|ai|a|vais|va|fais|fait|prends|prend|veux|veut)\b/gi,
    code: "CONJ", g: "haute",
    m: "« il faut que » exige le **subjonctif** : que je puisse, que je doive, que je sois, que j'aie, que j'aille, que je fasse…" },
  { re: /\b(pour que|bien que|avant que|afin que|jusqu'à ce que|à condition que)\s+(je|tu|il|elle|on|nous|vous|ils|elles)\s+(peux|peut|dois|doit|suis|est|es|ai|a|as|vais|va|fais|fait|veux|veut)\b/gi,
    code: "CONJ", g: "haute", m: "Cette conjonction impose le **subjonctif**." },
  { re: /\bje pense que\s+[^.!?]{0,40}\b(soit|ait|puisse|fasse|aille|vienne)\b/gi, code: "CONJ", g: "moyenne",
    m: "« je pense que » à la forme affirmative demande l'**indicatif** : je pense que c'est / qu'il peut." },
  { re: /\b(essayer|essaie|essaye|décider|décide|oublier|oublie|refuser|refuse|choisir|choisis|accepter|accepte|éviter|évite|arrêter|arrête|permettre|permet|proposer|propose|mériter|mérite|risquer|risque)\s+(?!de\b|d')([a-zéèêàçûôî]+er|être|avoir|faire|aller|prendre|venir|dire|voir|partir|sortir|mettre|vivre)\b/gi,
    code: "ESP", g: "haute", m: "En espagnol l'infinitif est nu ; en français ces verbes exigent **de** : décider **de** partir, essayer **de** faire." },
  { re: /\b(commencer|commence|aider|aide|réussir|réussis|réussit|apprendre|apprends|apprend|hésiter|hésite|chercher|cherche|continuer|continue|arriver|arrive|encourager|encourage|inviter|invite)\s+(?!à\b|au\b|aux\b|de\b|d')([a-zéèêàçûôî]+er|être|avoir|faire|aller|prendre|venir|dire|voir|partir|sortir|mettre|vivre)\b/gi,
    code: "ESP", g: "haute", m: "Ces verbes exigent **à** devant l'infinitif : réussir **à** faire, aider **à** organiser." },
  { re: /\b(réalis(?:er|e|é|ons|ez))\s+(un|une|des|le|la|les|mon|ma|mes|ce|cette)\s+(voyage|activité|activités|cours|travail|réunion|étude|études|projet|démarche|démarches)\b/gi,
    code: "ESP", g: "moyenne", m: "« realizar » → en français **faire**, **effectuer**, **mener** (faire un voyage, mener un projet). « Réaliser » = se rendre compte." },
  { re: /\bsalir\b/gi, code: "ESP", g: "haute",
    m: "Faux ami : « salir » en français = **rendre sale**. Pour « salir » espagnol → **sortir**." },
  { re: /\bassister\s+(un|une|le|la|les|mon|ma)\b/gi, code: "ESP", g: "moyenne",
    m: "**assister à** un cours. Et « asistir a alguien » = **aider** quelqu'un." },
  { re: /\bquitter\s+(la table|les|la poussière)\b/gi, code: "ESP", g: "basse",
    m: "« quitar » = **enlever, retirer**. « Quitter » = abandonner un lieu ou une personne." },
  { re: /\bsubir\s+(les escaliers|au|à l')\b/gi, code: "ESP", g: "moyenne",
    m: "« subir » espagnol = **monter**. « Subir » français = endurer." },
  { re: /\bactuellement\s+je (suis|travaille|habite)\b/gi, code: "LEX", g: "basse",
    m: "Correct, mais variez : **à l'heure actuelle**, **pour le moment**, **désormais**." },
  { re: /\b(dans|de|à)\s+le\s+(matin|soir|printemps)\b/gi, code: "GR", g: "moyenne",
    m: "→ **le matin**, **le soir**, **au printemps**." },
  { re: /\bdepuis\s+(hier|la semaine dernière|l'année dernière)\b/gi, code: "GR", g: "basse",
    m: "Vérifiez : action ponctuelle passée → **il y a**, action qui dure → **depuis**." },
  { re: /\bplus\s+de\s+que\b/gi, code: "ESP", g: "haute",
    m: "« más de que » → **plus que** ou **plus de** + nombre." },
  { re: /\bpour\s+que\s+(?:je|tu|il|elle|on|nous|vous|ils|elles)?\s*(?:[a-zéèêà]+er)\b/gi, code: "GR", g: "moyenne",
    m: "« para + infinitif » → **pour** + infinitif (sans « que »). « Pour que » veut un sujet différent + subjonctif." },
];

export const PAUVRE: Règle[] = [
  { re: /\btrès bien\b/gi, code: "LEX", g: "basse",
    m: "B2 : **remarquable**, **de grande qualité**, **particulièrement satisfaisant**." },
  { re: /\bil y a beaucoup de\b/gi, code: "LEX", g: "basse",
    m: "B2 : **on constate de nombreux…**, **les … se multiplient**, **un grand nombre de…**" },
  { re: /\bc'est bien\b/gi, code: "LEX", g: "basse",
    m: "B2 : **c'est une initiative pertinente / bénéfique / judicieuse**." },
  { re: /\bbeaucoup de choses\b/gi, code: "LEX", g: "basse",
    m: "Précisez : **de nombreux aspects**, **plusieurs éléments**, **divers points**." },
  { re: /\bles gens pensent\b/gi, code: "LEX", g: "basse",
    m: "B2 : **une partie de l'opinion estime**, **certains observateurs considèrent**." },
  { re: /\bje pense que\b/gi, code: "LEX", g: "basse",
    m: "Variez : **j'estime que**, **à mon sens**, **il me semble que**, **je suis convaincu que**." },
];

export const CONNECTEURS = [
  "d'abord", "tout d'abord", "premièrement", "ensuite", "puis", "enfin", "par ailleurs",
  "de plus", "en outre", "également", "cependant", "toutefois", "néanmoins", "pourtant",
  "en revanche", "au contraire", "alors que", "tandis que", "c'est pourquoi",
  "par conséquent", "donc", "ainsi", "en effet", "car", "parce que", "puisque",
  "étant donné que", "en raison de", "grâce à", "à cause de", "en somme", "en conclusion",
  "pour conclure", "en définitive", "d'une part", "d'autre part", "non seulement",
  "mais aussi", "certes", "or", "bref", "au demeurant",
];

export const MARQ_TU = /\b(tu|te|toi|ton|ta|tes|t'as|t'es|toi-même)\b/gi;
export const MARQ_VOUS = /\b(vous|votre|vos|vous-même)\b/gi;
