import type { ConjugaisonVerb, TempsConj, StatsConjugaison } from "@/lib/types/tcf";
export type { ConjugaisonVerb, TempsConj, StatsConjugaison };

export const PRON = ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"];
export const PRON_SUJ = ["je", "tu", "il", "nous", "vous", "ils"];
export const REFL = ["me", "te", "se", "nous", "vous", "se"];
export const F_IMP = ["ais", "ais", "ait", "ions", "iez", "aient"];
export const F_FUT = ["ai", "as", "a", "ons", "ez", "ont"];

export function joindre(rad: string, term: string): string {
  if (/ç$/.test(rad) && /^[ieé]/.test(term)) rad = rad.slice(0, -1) + "c";
  if (/ge$/.test(rad) && /^[ieé]/.test(term)) rad = rad.slice(0, -1);
  if (/c$/.test(rad) && /^[aoâ]/.test(term)) rad = rad.slice(0, -1) + "ç";
  if (/g$/.test(rad) && /^[aoâ]/.test(term)) rad = rad + "e";
  return rad + term;
}
export const voyelle = (s: string) => /^[aeiouyéèêâîôûh]/i.test(s);

export const IRR: ConjugaisonVerb[] = [
  { i: "être", e: "ser / estar", x: "a", pp: "été", f: "ser",
    p: ["suis", "es", "est", "sommes", "êtes", "sont"],
    s: ["sois", "sois", "soit", "soyons", "soyez", "soient"],
    m: "ét", im: ["sois", "soyons", "soyez"],
    tcf: "« Il est essentiel que je sois… » — subjonctif totalement irrégulier, à connaître par cœur." },
  { i: "avoir", e: "haber / tener", x: "a", pp: "eu", f: "aur",
    p: ["ai", "as", "a", "avons", "avez", "ont"],
    s: ["aie", "aies", "ait", "ayons", "ayez", "aient"],
    im: ["aie", "ayons", "ayez"],
    tcf: "Attention : « j'ai 30 ans », jamais « je suis 30 ans »." },
  { i: "aller", e: "ir", x: "e", pp: "allé", f: "ir",
    p: ["vais", "vas", "va", "allons", "allez", "vont"],
    s: ["aille", "ailles", "aille", "allions", "alliez", "aillent"],
    im: ["va", "allons", "allez"],
    tcf: "Auxiliaire être : « je suis allé(e) ». Futur proche : « je vais partir »." },
  { i: "faire", e: "hacer", x: "a", pp: "fait", f: "fer",
    p: ["fais", "fais", "fait", "faisons", "faites", "font"],
    s: ["fasse", "fasses", "fasse", "fassions", "fassiez", "fassent"],
    tcf: "« realizar un viaje » = **faire** un voyage, pas « réaliser »." },
  { i: "pouvoir", e: "poder", x: "a", pp: "pu", f: "pourr",
    p: ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"],
    s: ["puisse", "puisses", "puisse", "puissions", "puissiez", "puissent"],
    tcf: "« Pourriez-vous… » : le conditionnel est la formule de politesse attendue en tâche 1." },
  { i: "vouloir", e: "querer", x: "a", pp: "voulu", f: "voudr",
    p: ["veux", "veux", "veut", "voulons", "voulez", "veulent"],
    s: ["veuille", "veuilles", "veuille", "voulions", "vouliez", "veuillent"],
    im: ["veuille", "veuillons", "veuillez"],
    tcf: "« Je voudrais… » ouvre poliment une demande ; « veuillez agréer » ferme une lettre formelle." },
  { i: "devoir", e: "deber", x: "a", pp: "dû", f: "devr",
    p: ["dois", "dois", "doit", "devons", "devez", "doivent"],
    s: ["doive", "doives", "doive", "devions", "deviez", "doivent"],
    tcf: "« Les autorités devraient… » : conditionnel = suggestion nuancée, très B2 en tâche 3." },
  { i: "savoir", e: "saber", x: "a", pp: "su", f: "saur",
    p: ["sais", "sais", "sait", "savons", "savez", "savent"],
    s: ["sache", "saches", "sache", "sachions", "sachiez", "sachent"],
    im: ["sache", "sachons", "sachez"],
    tcf: "savoir = compétence ; connaître = familiarité avec une personne ou un lieu." },
  { i: "voir", e: "ver", x: "a", pp: "vu", f: "verr",
    p: ["vois", "vois", "voit", "voyons", "voyez", "voient"],
    s: ["voie", "voies", "voie", "voyions", "voyiez", "voient"] },
  { i: "venir", e: "venir", x: "e", pp: "venu", f: "viendr",
    p: ["viens", "viens", "vient", "venons", "venez", "viennent"],
    s: ["vienne", "viennes", "vienne", "venions", "veniez", "viennent"],
    tcf: "« je viens de + infinitif » = passé récent, très utile en tâche 2." },
  { i: "tenir", e: "tener / sostener", x: "a", pp: "tenu", f: "tiendr",
    p: ["tiens", "tiens", "tient", "tenons", "tenez", "tiennent"],
    s: ["tienne", "tiennes", "tienne", "tenions", "teniez", "tiennent"],
    tcf: "« tenir à » = insister sur : « je tiens à vous remercier »." },
  { i: "prendre", e: "tomar / coger", x: "a", pp: "pris", f: "prendr",
    p: ["prends", "prends", "prend", "prenons", "prenez", "prennent"],
    s: ["prenne", "prennes", "prenne", "prenions", "preniez", "prennent"],
    tcf: "Même modèle : apprendre, comprendre, surprendre." },
  { i: "comprendre", e: "comprender", x: "a", pp: "compris", f: "comprendr",
    p: ["comprends", "comprends", "comprend", "comprenons", "comprenez", "comprennent"],
    s: ["comprenne", "comprennes", "comprenne", "comprenions", "compreniez", "comprennent"] },
  { i: "apprendre", e: "aprender", x: "a", pp: "appris", f: "apprendr",
    p: ["apprends", "apprends", "apprend", "apprenons", "apprenez", "apprennent"],
    s: ["apprenne", "apprennes", "apprenne", "apprenions", "appreniez", "apprennent"],
    tcf: "apprendre **à** faire quelque chose ; apprendre quelque chose **à** quelqu'un." },
  { i: "dire", e: "decir", x: "a", pp: "dit", f: "dir",
    p: ["dis", "dis", "dit", "disons", "dites", "disent"],
    s: ["dise", "dises", "dise", "disions", "disiez", "disent"],
    tcf: "« vous dites », pas « vous disez ». Une des trois formes en -tes avec être et faire." },
  { i: "mettre", e: "poner", x: "a", pp: "mis", f: "mettr",
    p: ["mets", "mets", "met", "mettons", "mettez", "mettent"],
    s: ["mette", "mettes", "mette", "mettions", "mettiez", "mettent"],
    tcf: "Même modèle : permettre, promettre, remettre, admettre." },
  { i: "falloir", e: "hacer falta / haber que", x: "a", pp: "fallu", f: "faudr", m: "fall",
    p: ["—", "—", "faut", "—", "—", "—"],
    s: ["—", "—", "faille", "—", "—", "—"], imp: true,
    tcf: "« il faut que » + **subjonctif** : il faut que je sois, que j'aie, que je fasse. Erreur classique de l'espagnol." },
  { i: "croire", e: "creer", x: "a", pp: "cru", f: "croir",
    p: ["crois", "crois", "croit", "croyons", "croyez", "croient"],
    s: ["croie", "croies", "croie", "croyions", "croyiez", "croient"],
    tcf: "Affirmatif : « je crois que c'est » (indicatif). Négatif : « je ne crois pas que ce soit » (subjonctif)." },
  { i: "connaître", e: "conocer", x: "a", pp: "connu", f: "connaîtr",
    p: ["connais", "connais", "connaît", "connaissons", "connaissez", "connaissent"],
    s: ["connaisse", "connaisses", "connaisse", "connaissions", "connaissiez", "connaissent"] },
  { i: "écrire", e: "escribir", x: "a", pp: "écrit", f: "écrir",
    p: ["écris", "écris", "écrit", "écrivons", "écrivez", "écrivent"],
    s: ["écrive", "écrives", "écrive", "écrivions", "écriviez", "écrivent"],
    tcf: "« Je vous écris pour… » : la formule d'ouverture la plus sûre en tâche 1." },
  { i: "lire", e: "leer", x: "a", pp: "lu", f: "lir",
    p: ["lis", "lis", "lit", "lisons", "lisez", "lisent"],
    s: ["lise", "lises", "lise", "lisions", "lisiez", "lisent"] },
  { i: "partir", e: "irse / salir", x: "e", pp: "parti", f: "partir",
    p: ["pars", "pars", "part", "partons", "partez", "partent"],
    s: ["parte", "partes", "parte", "partions", "partiez", "partent"],
    tcf: "Auxiliaire être : « elle est partie » — le participe s'accorde." },
  { i: "sortir", e: "salir", x: "e", pp: "sorti", f: "sortir",
    p: ["sors", "sors", "sort", "sortons", "sortez", "sortent"],
    s: ["sorte", "sortes", "sorte", "sortions", "sortiez", "sortent"],
    tcf: "Faux ami : « salir » en français veut dire rendre sale." },
  { i: "dormir", e: "dormir", x: "a", pp: "dormi", f: "dormir",
    p: ["dors", "dors", "dort", "dormons", "dormez", "dorment"],
    s: ["dorme", "dormes", "dorme", "dormions", "dormiez", "dorment"] },
  { i: "recevoir", e: "recibir", x: "a", pp: "reçu", f: "recevr",
    p: ["reçois", "reçois", "reçoit", "recevons", "recevez", "reçoivent"],
    s: ["reçoive", "reçoives", "reçoive", "recevions", "receviez", "reçoivent"],
    tcf: "La cédille disparaît devant e et i : nous recevons, mais je reçois." },
  { i: "boire", e: "beber", x: "a", pp: "bu", f: "boir",
    p: ["bois", "bois", "boit", "buvons", "buvez", "boivent"],
    s: ["boive", "boives", "boive", "buvions", "buviez", "boivent"] },
  { i: "vivre", e: "vivir", x: "a", pp: "vécu", f: "vivr",
    p: ["vis", "vis", "vit", "vivons", "vivez", "vivent"],
    s: ["vive", "vives", "vive", "vivions", "viviez", "vivent"],
    tcf: "Participe irrégulier : vécu. « J'ai vécu à Montréal pendant deux ans. »" },
  { i: "suivre", e: "seguir", x: "a", pp: "suivi", f: "suivr",
    p: ["suis", "suis", "suit", "suivons", "suivez", "suivent"],
    s: ["suive", "suives", "suive", "suivions", "suiviez", "suivent"],
    tcf: "« je suis » est ambigu : être ou suivre. Le contexte tranche." },
  { i: "ouvrir", e: "abrir", x: "a", pp: "ouvert", f: "ouvrir",
    p: ["ouvre", "ouvres", "ouvre", "ouvrons", "ouvrez", "ouvrent"],
    s: ["ouvre", "ouvres", "ouvre", "ouvrions", "ouvriez", "ouvrent"],
    tcf: "Présent en -er malgré l'infinitif en -ir. Participe : ouvert." },
  { i: "offrir", e: "ofrecer / regalar", x: "a", pp: "offert", f: "offrir",
    p: ["offre", "offres", "offre", "offrons", "offrez", "offrent"],
    s: ["offre", "offres", "offre", "offrions", "offriez", "offrent"] },
  { i: "courir", e: "correr", x: "a", pp: "couru", f: "courr",
    p: ["cours", "cours", "court", "courons", "courez", "courent"],
    s: ["coure", "coures", "coure", "courions", "couriez", "courent"] },
  { i: "mourir", e: "morir", x: "e", pp: "mort", f: "mourr",
    p: ["meurs", "meurs", "meurt", "mourons", "mourez", "meurent"],
    s: ["meure", "meures", "meure", "mourions", "mouriez", "meurent"] },
  { i: "naître", e: "nacer", x: "e", pp: "né", f: "naîtr",
    p: ["nais", "nais", "naît", "naissons", "naissez", "naissent"],
    s: ["naisse", "naisses", "naisse", "naissions", "naissiez", "naissent"] },
  { i: "conduire", e: "conducir", x: "a", pp: "conduit", f: "conduir",
    p: ["conduis", "conduis", "conduit", "conduisons", "conduisez", "conduisent"],
    s: ["conduise", "conduises", "conduise", "conduisions", "conduisiez", "conduisent"],
    tcf: "Même modèle : produire, réduire, construire, traduire, introduire." },
  { i: "produire", e: "producir", x: "a", pp: "produit", f: "produir",
    p: ["produis", "produis", "produit", "produisons", "produisez", "produisent"],
    s: ["produise", "produises", "produise", "produisions", "produisiez", "produisent"] },
  { i: "réduire", e: "reducir", x: "a", pp: "réduit", f: "réduir",
    p: ["réduis", "réduis", "réduit", "réduisons", "réduisez", "réduisent"],
    s: ["réduise", "réduises", "réduise", "réduisions", "réduisiez", "réduisent"],
    tcf: "« réduire les émissions », « réduire la consommation » : lexique de la tâche 3." },
  { i: "craindre", e: "temer", x: "a", pp: "craint", f: "craindr",
    p: ["crains", "crains", "craint", "craignons", "craignez", "craignent"],
    s: ["craigne", "craignes", "craigne", "craignions", "craigniez", "craignent"] },
  { i: "valoir", e: "valer", x: "a", pp: "valu", f: "vaudr",
    p: ["vaux", "vaux", "vaut", "valons", "valez", "valent"],
    s: ["vaille", "vailles", "vaille", "valions", "valiez", "vaillent"],
    tcf: "« il vaudrait mieux que » + subjonctif : formule de recommandation très valorisée." },
  { i: "plaire", e: "gustar", x: "a", pp: "plu", f: "plair",
    p: ["plais", "plais", "plaît", "plaisons", "plaisez", "plaisent"],
    s: ["plaise", "plaises", "plaise", "plaisions", "plaisiez", "plaisent"] },
  { i: "envoyer", e: "enviar", x: "a", pp: "envoyé", f: "enverr",
    p: ["envoie", "envoies", "envoie", "envoyons", "envoyez", "envoient"],
    s: ["envoie", "envoies", "envoie", "envoyions", "envoyiez", "envoient"],
    tcf: "Futur irrégulier : j'enverrai. Même famille : renvoyer." },
  { i: "appeler", e: "llamar", x: "a", pp: "appelé", f: "appeller",
    p: ["appelle", "appelles", "appelle", "appelons", "appelez", "appellent"],
    s: ["appelle", "appelles", "appelle", "appelions", "appeliez", "appellent"],
    tcf: "Double L quand la terminaison est muette : j'appelle, mais nous appelons." },
  { i: "acheter", e: "comprar", x: "a", pp: "acheté", f: "achèter",
    p: ["achète", "achètes", "achète", "achetons", "achetez", "achètent"],
    s: ["achète", "achètes", "achète", "achetions", "achetiez", "achètent"] },
  { i: "préférer", e: "preferir", x: "a", pp: "préféré", f: "préférer",
    p: ["préfère", "préfères", "préfère", "préférons", "préférez", "préfèrent"],
    s: ["préfère", "préfères", "préfère", "préférions", "préfériez", "préfèrent"],
    tcf: "Accent grave devant syllabe muette : je préfère, nous préférons." },
  { i: "espérer", e: "esperar (tener esperanza)", x: "a", pp: "espéré", f: "espérer",
    p: ["espère", "espères", "espère", "espérons", "espérez", "espèrent"],
    s: ["espère", "espères", "espère", "espérions", "espériez", "espèrent"],
    tcf: "« J'espère que » + **indicatif futur** : j'espère que vous pourrez venir." },
  { i: "commencer", e: "empezar", x: "a", pp: "commencé", f: "commencer",
    p: ["commence", "commences", "commence", "commençons", "commencez", "commencent"],
    s: ["commence", "commences", "commence", "commencions", "commenciez", "commencent"],
    tcf: "Cédille devant a et o : nous commençons, je commençais." },
  { i: "manger", e: "comer", x: "a", pp: "mangé", f: "manger",
    p: ["mange", "manges", "mange", "mangeons", "mangez", "mangent"],
    s: ["mange", "manges", "mange", "mangions", "mangiez", "mangent"],
    tcf: "E de liaison devant a et o : nous mangeons, je mangeais. Idem voyager, partager, encourager." },
  { i: "payer", e: "pagar", x: "a", pp: "payé", f: "paier",
    p: ["paie", "paies", "paie", "payons", "payez", "paient"],
    s: ["paie", "paies", "paie", "payions", "payiez", "paient"] },
  { i: "essayer", e: "intentar / probar", x: "a", pp: "essayé", f: "essaier",
    p: ["essaie", "essaies", "essaie", "essayons", "essayez", "essaient"],
    s: ["essaie", "essaies", "essaie", "essayions", "essayiez", "essaient"],
    tcf: "essayer **de** + infinitif. En espagnol l'infinitif est nu : c'est un piège fréquent." },
  { i: "se lever", e: "levantarse", x: "e", pp: "levé", f: "lèver",
    p: ["lève", "lèves", "lève", "levons", "levez", "lèvent"],
    s: ["lève", "lèves", "lève", "levions", "leviez", "lèvent"], pron: true },
  { i: "s'inscrire", e: "inscribirse", x: "e", pp: "inscrit", f: "inscrir",
    p: ["inscris", "inscris", "inscrit", "inscrivons", "inscrivez", "inscrivent"],
    s: ["inscrive", "inscrives", "inscrive", "inscrivions", "inscriviez", "inscrivent"], pron: true,
    tcf: "« Je me suis inscrit à un cours » : auxiliaire être, accord avec le sujet." },
  { i: "se souvenir", e: "acordarse", x: "e", pp: "souvenu", f: "souviendr",
    p: ["souviens", "souviens", "souvient", "souvenons", "souvenez", "souviennent"],
    s: ["souvienne", "souviennes", "souvienne", "souvenions", "souveniez", "souviennent"], pron: true,
    tcf: "se souvenir **de** quelque chose ; se rappeler quelque chose, sans préposition." },
];

export const REG: [string, string, "er" | "ir" | "re", "a" | "e"][] = [
  ["parler", "hablar", "er", "a"], ["aimer", "gustar / amar", "er", "a"],
  ["penser", "pensar", "er", "a"], ["trouver", "encontrar", "er", "a"],
  ["donner", "dar", "er", "a"], ["demander", "pedir", "er", "a"],
  ["travailler", "trabajar", "er", "a"], ["étudier", "estudiar", "er", "a"],
  ["habiter", "vivir (residir)", "er", "a"], ["écouter", "escuchar", "er", "a"],
  ["regarder", "mirar", "er", "a"], ["chercher", "buscar", "er", "a"],
  ["arriver", "llegar", "er", "e"], ["rester", "quedarse", "er", "e"],
  ["passer", "pasar", "er", "a"], ["aider", "ayudar", "er", "a"],
  ["expliquer", "explicar", "er", "a"], ["proposer", "proponer", "er", "a"],
  ["participer", "participar", "er", "a"], ["améliorer", "mejorar", "er", "a"],
  ["développer", "desarrollar", "er", "a"], ["augmenter", "aumentar", "er", "a"],
  ["diminuer", "disminuir", "er", "a"], ["utiliser", "utilizar", "er", "a"],
  ["créer", "crear", "er", "a"], ["éviter", "evitar", "er", "a"],
  ["favoriser", "favorecer", "er", "a"], ["organiser", "organizar", "er", "a"],
  ["présenter", "presentar", "er", "a"], ["apporter", "aportar", "er", "a"],
  ["montrer", "mostrar", "er", "a"], ["souhaiter", "desear", "er", "a"],
  ["remercier", "agradecer", "er", "a"], ["informer", "informar", "er", "a"],
  ["décider", "decidir", "er", "a"], ["oublier", "olvidar", "er", "a"],
  ["accepter", "aceptar", "er", "a"], ["refuser", "rechazar", "er", "a"],
  ["profiter", "aprovechar", "er", "a"], ["consacrer", "dedicar", "er", "a"],
  ["signaler", "señalar", "er", "a"], ["constater", "constatar", "er", "a"],
  ["finir", "terminar", "ir", "a"], ["choisir", "elegir", "ir", "a"],
  ["réussir", "lograr / aprobar", "ir", "a"], ["réfléchir", "reflexionar", "ir", "a"],
  ["remplir", "rellenar", "ir", "a"], ["agir", "actuar", "ir", "a"],
  ["établir", "establecer", "ir", "a"], ["grandir", "crecer", "ir", "a"],
  ["définir", "definir", "ir", "a"], ["investir", "invertir", "ir", "a"],
  ["avertir", "avisar", "ir", "a"], ["enrichir", "enriquecer", "ir", "a"],
  ["attendre", "esperar (aguardar)", "re", "a"], ["entendre", "oír", "re", "a"],
  ["répondre", "responder", "re", "a"], ["perdre", "perder", "re", "a"],
  ["vendre", "vender", "re", "a"], ["rendre", "devolver", "re", "a"],
  ["descendre", "bajar", "re", "e"], ["défendre", "defender", "re", "a"],
];

export const NOTES_REG: Record<string, string> = {
  attendre: "Faux ami : « atender » espagnol = s'occuper de. « Attendre » = esperar.",
  entendre: "Faux ami : « entender » = comprendre. « Entendre » = oír.",
  rester: "Faux ami : « restar » = soustraire. « Rester » = quedarse. Auxiliaire être.",
  demander: "demander **à** quelqu'un **de** faire quelque chose.",
  réussir: "réussir **à** + infinitif : « j'ai réussi à obtenir le poste ».",
  décider: "décider **de** + infinitif. Sans « de », c'est un calque de l'espagnol.",
  aider: "aider quelqu'un **à** faire quelque chose.",
  penser: "penser **à** quelque chose = y songer ; penser **de** = avoir une opinion.",
  profiter: "profiter **de** : « profiter de cette occasion pour… ».",
  arriver: "Auxiliaire être : « je suis arrivé(e) ». Aussi impersonnel : « il arrive que » + subjonctif.",
};

export function construire(v: Partial<ConjugaisonVerb> & { i: string; e: string }): ConjugaisonVerb {
  const o: ConjugaisonVerb = Object.assign(
    { pp: "", f: "", x: "a" as "a" | "e" },
    v
  ) as ConjugaisonVerb;
  if (!o.p) {
    const rad = o.i!.slice(0, -2);
    if (o.g === "er") {
      o.p = ["e", "es", "e", "ons", "ez", "ent"].map((t) => joindre(rad, t));
      o.pp = rad + "é";
      o.f = o.i;
    }
    if (o.g === "ir") {
      o.p = [rad + "is", rad + "is", rad + "it", rad + "issons", rad + "issez", rad + "issent"];
      o.pp = rad + "i";
      o.f = o.i;
    }
    if (o.g === "re") {
      o.p = [rad + "s", rad + "s", rad, rad + "ons", rad + "ez", rad + "ent"];
      o.pp = rad + "u";
      o.f = o.i.slice(0, -1);
    }
  }
  o.m = o.m || o.p![3].replace(/ons$/, "");
  if (!o.s) {
    const r3 = o.p![5].replace(/ent$/, "");
    o.s = [
      joindre(r3, "e"), joindre(r3, "es"), joindre(r3, "e"),
      joindre(o.m, "ions"), joindre(o.m, "iez"), joindre(r3, "ent"),
    ];
  }
  if (!o.im) {
    let tu = o.p![1];
    if (
      /es$/.test(tu) &&
      (o.g === "er" ||
        /^(ouvrir|offrir|souffrir|couvrir)$/.test(o.i!) ||
        /e$/.test(o.p![0]))
    )
      tu = tu.slice(0, -1);
    o.im = [tu, o.p![3], o.p![4]];
  }
  o.nom = o.i;
  o.rad_srch = (o.i + " " + o.e).toLowerCase();
  return o;
}

export const VERBES: ConjugaisonVerb[] = IRR.map(construire)
  .concat(REG.map((r) => construire({ i: r[0], e: r[1], g: r[2], x: r[3], tcf: NOTES_REG[r[0]] })))
  .sort((a, b) => a.i!.localeCompare(b.i!, "fr"));

export const ETRE = VERBES.find((v) => v.i === "être")!;
export const AVOIR = VERBES.find((v) => v.i === "avoir")!;

export function refl(v: ConjugaisonVerb, k: number, suivant: string): string {
  if (!v.pron) return "";
  const r = REFL[k];
  return voyelle(suivant) && r === "me" || r === "te" || r === "se" ? r[0] + "'" : r + " ";
}
export function sujet(k: number, forme: string): string {
  if (k === 0) return voyelle(forme) ? "j'" : "je ";
  return PRON_SUJ[k] + " ";
}
export function ppAcc(v: ConjugaisonVerb, k: number): string {
  if (v.x !== "e") return v.pp;
  return k === 3 || k === 4 || k === 5 ? v.pp + "(e)s" : v.pp + "(e)";
}
export function aux(v: ConjugaisonVerb, temps: "pres" | "imp", k: number): string {
  const a = v.x === "e" ? ETRE : AVOIR;
  return temps === "pres" ? a.p![k] : joindre(a.m!, F_IMP[k]);
}

export type FormesVerb = Record<TempsConj, string[]>;

export function formes(v: ConjugaisonVerb): FormesVerb {
  const F: FormesVerb = {
    "présent": [], "passé composé": [], "imparfait": [], "plus-que-parfait": [],
    "futur simple": [], "conditionnel présent": [], "subjonctif présent": [],
  };
  const mettre = (t: TempsConj, k: number, noyau: string) => {
    F[t].push(refl(v, k, noyau) + noyau);
  };
  for (let k = 0; k < 6; k++) {
    if (v.imp && k !== 2) {
      Object.keys(F).forEach((t) => F[t as TempsConj].push("—"));
      continue;
    }
    mettre("présent", k, v.p![k]);
    mettre("passé composé", k, aux(v, "pres", k) + " " + ppAcc(v, k));
    mettre("imparfait", k, joindre(v.m!, F_IMP[k]));
    mettre("plus-que-parfait", k, aux(v, "imp", k) + " " + ppAcc(v, k));
    mettre("futur simple", k, v.f + F_FUT[k]);
    mettre("conditionnel présent", k, v.f + F_IMP[k]);
    mettre("subjonctif présent", k, v.s![k]);
  }
  return F;
}

export const AVEC_SUJET: Record<
  TempsConj,
  (v: ConjugaisonVerb, k: number, f: string) => string
> = {
  "présent": (v, k, f) => (v.imp ? (k === 2 ? "il " + f : "—") : sujet(k, f) + f),
  "passé composé": (v, k, f) => (v.imp ? (k === 2 ? "il a fallu" : "—") : sujet(k, f) + f),
  "imparfait": (v, k, f) => (v.imp ? (k === 2 ? "il " + f : "—") : sujet(k, f) + f),
  "plus-que-parfait": (v, k, f) => (v.imp ? (k === 2 ? "il avait fallu" : "—") : sujet(k, f) + f),
  "futur simple": (v, k, f) => (v.imp ? (k === 2 ? "il " + f : "—") : sujet(k, f) + f),
  "conditionnel présent": (v, k, f) => (v.imp ? (k === 2 ? "il " + f : "—") : sujet(k, f) + f),
  "subjonctif présent": (v, k, f) => {
    if (f === "—") return "—";
    if (v.imp) return "qu'il " + f;
    const q = k === 2 || k === 5 ? "qu'" : "que ";
    return q + (k === 0 ? (voyelle(f) ? "j'" : "je ") : PRON_SUJ[k] + " ") + f;
  },
};

export const TEMPS_EXO: TempsConj[] = [
  "présent", "passé composé", "imparfait", "plus-que-parfait",
  "futur simple", "conditionnel présent", "subjonctif présent",
];
export const POIDS: Record<TempsConj, number> = {
  "présent": 1, "passé composé": 2, "imparfait": 2, "plus-que-parfait": 2,
  "futur simple": 2, "conditionnel présent": 3, "subjonctif présent": 4,
};
export const TIRAGE: TempsConj[] = (() => {
  const t: TempsConj[] = [];
  TEMPS_EXO.forEach((tp) => {
    for (let n = 0; n < POIDS[tp]; n++) t.push(tp);
  });
  return t;
})();

export const RAPPELS: Record<TempsConj, string> = {
  "présent": "Vérifiez le radical : il change souvent au pluriel (je peux / nous pouvons).",
  "passé composé": "Auxiliaire au présent + participe passé. Avec être, le participe s'accorde avec le sujet.",
  "imparfait": "Radical du « nous » au présent + -ais, -ais, -ait, -ions, -iez, -aient. Une seule exception : être → ét-.",
  "plus-que-parfait": "Auxiliaire à l'imparfait + participe passé. Il marque l'antériorité dans un récit.",
  "futur simple": "Radical du futur + -ai, -as, -a, -ons, -ez, -ont. Le radical se termine toujours par -r.",
  "conditionnel présent": "Radical du futur + terminaisons de l'imparfait. C'est le temps de la politesse et de l'hypothèse.",
  "subjonctif présent": "Radical du « ils » au présent + -e, -es, -e, -ent ; « nous » et « vous » reprennent l'imparfait.",
};

export const TOP = [
  "être", "avoir", "aller", "faire", "pouvoir", "vouloir", "devoir", "savoir",
  "voir", "venir", "prendre", "dire", "mettre", "croire", "connaître", "écrire",
  "lire", "partir", "recevoir", "vivre", "suivre", "ouvrir", "tenir", "falloir",
  "valoir", "envoyer", "appeler", "acheter", "préférer", "espérer", "commencer",
  "manger", "essayer", "parler", "penser", "demander", "choisir", "finir",
  "réussir", "réfléchir", "attendre", "répondre", "rendre", "comprendre",
  "apprendre", "réduire", "améliorer", "participer", "décider", "s'inscrire",
  "se souvenir", "se lever",
];

export interface PhraseExo {
  ph: string; v: string; t: TempsConj; k: number; why: string;
}

export const PHRASES: PhraseExo[] = [
  { ph: "Il faudrait que la municipalité ___ davantage dans les transports en commun.", v: "investir", t: "subjonctif présent", k: 2, why: "« il faut / il faudrait que » impose toujours le subjonctif." },
  { ph: "Bien que le télétravail ___ de nombreux avantages, il isole certains salariés.", v: "avoir", t: "subjonctif présent", k: 2, why: "« bien que » est suivi du subjonctif : la concession la plus rentable en tâche 3." },
  { ph: "Je vous écris afin que vous ___ prendre une décision rapidement.", v: "pouvoir", t: "subjonctif présent", k: 4, why: "« afin que » et « pour que » demandent le subjonctif ; « afin de » + infinitif si le sujet est le même." },
  { ph: "Si j'avais plus de temps, je ___ davantage à ce projet.", v: "consacrer", t: "conditionnel présent", k: 0, why: "Si + imparfait dans la subordonnée, conditionnel présent dans la principale." },
  { ph: "Quand je suis arrivé, la réunion ___ depuis vingt minutes.", v: "commencer", t: "plus-que-parfait", k: 2, why: "Le plus-que-parfait marque ce qui précède un autre passé." },
  { ph: "L'an dernier, nous ___ chaque semaine aux ateliers du quartier.", v: "participer", t: "imparfait", k: 3, why: "Habitude dans le passé : imparfait." },
  { ph: "J'___ que vous accepterez ma proposition.", v: "espérer", t: "présent", k: 0, why: "« espérer que » est suivi de l'indicatif, pas du subjonctif — contrairement à « esperar que » en espagnol." },
  { ph: "Il est possible que cette mesure ___ efficace à long terme.", v: "être", t: "subjonctif présent", k: 2, why: "« il est possible que » exprime le doute : subjonctif." },
  { ph: "D'ici dix ans, la ville ___ ses émissions de moitié.", v: "réduire", t: "futur simple", k: 2, why: "Projection chiffrée : futur simple." },
  { ph: "Vous ___ mieux de consulter un conseiller avant de signer.", v: "faire", t: "conditionnel présent", k: 4, why: "« vous feriez mieux de » : conseil poli, très apprécié au niveau B2." },
  { ph: "Il ___ mieux que nous en discutions de vive voix.", v: "valoir", t: "conditionnel présent", k: 2, why: "« il vaudrait mieux que » + subjonctif dans la suite." },
  { ph: "Avant mon arrivée, je ne ___ personne dans cette ville.", v: "connaître", t: "imparfait", k: 0, why: "État qui dure dans le passé : imparfait." },
  { ph: "Nous ___ ravis de vous accueillir la semaine prochaine.", v: "être", t: "futur simple", k: 3, why: "Formule de clôture courante en tâche 1." },
  { ph: "Je ne crois pas qu'un tel projet ___ aboutir sans financement.", v: "pouvoir", t: "subjonctif présent", k: 2, why: "« croire » à la forme négative bascule au subjonctif." },
  { ph: "Elle ___ à Montréal depuis cinq ans.", v: "vivre", t: "présent", k: 2, why: "« depuis » + présent quand l'action dure encore." },
  { ph: "Hier, les riverains ___ une pétition à la mairie.", v: "envoyer", t: "passé composé", k: 5, why: "Action ponctuelle achevée : passé composé." },
  { ph: "Il faut que je ___ mon dossier d'inscription avant vendredi.", v: "finir", t: "subjonctif présent", k: 0, why: "Subjonctif des verbes du 2e groupe : radical en -iss-." },
  { ph: "Nous ___ de terminer le rapport quand la panne est survenue.", v: "venir", t: "imparfait", k: 3, why: "« venir de » à l'imparfait = passé récent dans un récit." },
  { ph: "Si rien ne change, les habitants ___ à manifester.", v: "commencer", t: "futur simple", k: 5, why: "Si + présent, futur dans la principale." },
  { ph: "Autrefois, les gens ___ le journal tous les matins.", v: "lire", t: "imparfait", k: 5, why: "Habitude révolue : imparfait." },
  { ph: "Je vous ___ de bien vouloir m'excuser pour ce contretemps.", v: "demander", t: "présent", k: 0, why: "Registre formel : « je vous demande de bien vouloir… »" },
  { ph: "Après avoir longuement hésité, elle ___ de déménager.", v: "décider", t: "passé composé", k: 2, why: "décider **de** + infinitif : la préposition est obligatoire." },
  { ph: "À condition que vous ___ à l'heure, nous pourrons commencer.", v: "arriver", t: "subjonctif présent", k: 4, why: "« à condition que » impose le subjonctif." },
  { ph: "Ce matin-là, je ___ à cinq heures pour préparer l'entretien.", v: "se lever", t: "passé composé", k: 0, why: "Verbe pronominal : auxiliaire être et pronom réfléchi obligatoire." },
  { ph: "Les autorités ___ de nouvelles mesures dès l'an prochain.", v: "prendre", t: "futur simple", k: 5, why: "Futur simple pour une décision annoncée." },
  { ph: "Jusqu'à ce que vous ___ une réponse écrite, patientez.", v: "recevoir", t: "subjonctif présent", k: 4, why: "« jusqu'à ce que » est toujours suivi du subjonctif." },
];
