import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  CorrectionResult,
  LLMSettings,
  PromptsSettings,
  EssaiExpressionEcrite,
  ErreurDétaillée,
  ErreurLive,
  ErreurSuivi,
  GraviteErreur,
} from "@/lib/types/tcf";
import { TACHES } from "@/lib/heuristiques/taches";
import { analyser } from "@/lib/heuristiques";
import { appelOpenRouter } from "@/lib/llm/openrouter";
import { DEFAULTS, inviteCorrection, NCLC, CECRL } from "@/lib/llm/prompts";
import { lireJSON } from "@/lib/llm/parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function nettoyerEspacesPonctuation(s: string): string {
  return s
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function normaliserSubstring(s: string): string {
  return nettoyerEspacesPonctuation(s.toLowerCase());
}

interface ValideErreurRapport {
  entréesRetirées: number;
  raisons: Record<string, number>;
}

/**
 * Filtre défensif POST-LLM. Même si un modèle ignore les 10 règles A1–A10 du prompt,
 * ce filtre algorithmique retire :
 *  1. les erreurs dont `.original` n'existe PAS TEXTUELLEMENT dans la copie
 *     (défense A2 contre hallucination je fêté vs je fête)
 *  2. les erreurs dont l'explication se termine par Correct / juste / OK
 *     (défense A5 : la ligne erreurs ≠ catalogue de formes justes)
 *  3. proposition passé composé (j'ai X-é) alors que la copie porte présent indicatif
 *     proche futur programmé, avec un marqueur de date (samedi, demain, lundi prochain…)
 *     à proximité → (A3 + A8)
 *  4. signalement de la virgule après numéro civique "234, rue X" comme fautif
 *     → c'est la norme OQLF Québec, recommandée TCF Canada (A4)
 *  5. signalement de "Merci de me confirmer / me faire parvenir / me tenir informé…"
 *     comme fautif (formule admin standard, "me" n'est pas redondant) (A4)
 *  6. temps / préposition / ponctuation syntaxique mal taggés en "ORT" quand ils
 *     devraient être GR / CONJ (A6) — corrige le code plutôt que de supprimer
 */
function filtrerEtValiderErreurs(
  erreurs: ErreurDétaillée[] | undefined,
  copie: string
): { erreurs: ErreurDétaillée[]; rapport: ValideErreurRapport } {
  if (!Array.isArray(erreurs) || erreurs.length === 0) {
    return { erreurs: [], rapport: { entréesRetirées: 0, raisons: {} } };
  }
  const rapport: ValideErreurRapport = { entréesRetirées: 0, raisons: {} };
  const consigner = (r: string) => {
    rapport.entréesRetirées++;
    rapport.raisons[r] = (rapport.raisons[r] || 0) + 1;
  };

  const copieN = normaliserSubstring(copie);
  const marqueursDate = /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|demain|la\s+semaine\s+prochaine|le\s+mois\s+prochain|cet\s+été|cet\s+hiver|l'année\s+prochaine|le\s+\d+|ce\s+soir|ce\s+week-end|prochain)/i;

  const result: ErreurDétaillée[] = [];
  for (const eIn of erreurs) {
    if (!eIn || typeof eIn !== "object") {
      consigner("objet invalide");
      continue;
    }
    const e = { ...eIn };

    if (typeof e.original !== "string" || e.original.trim().length === 0) {
      consigner("original vide");
      continue;
    }

    // Règle 1 — original doit exister textuellement dans la copie
    const origN = normaliserSubstring(e.original);
    const estVerbatim =
      copie.indexOf(e.original) !== -1 ||
      copieN.indexOf(origN) !== -1 ||
      (origN.length >= 3 && copieN.replace(/[.,!?;:"]/g, "").indexOf(origN.replace(/[.,!?;:"]/g, "")) !== -1);
    if (!estVerbatim) {
      consigner(
        "hallucination : «" + e.original + "» absent de la copie"
      );
      continue;
    }

    // Règle 2 — l'explication ne doit pas conclure Correct / OK / juste
    const expl = (e.explication || "") + " " + (e.es || "");
    if (
      /\b(correct|juste|valide|ok\.?|bonne?|bien)\.?\s*$/i.test(e.explication || "") ||
      /\b(correct|juste|valide|ok\.?|bonne?|bien)\.?\s*$/i.test(expl.trim())
    ) {
      consigner("l'explication dit Correct / juste → retrait");
      continue;
    }

    // Règle 3 — présent indicatif programmé vs. suggestion passé composé
    if (
      typeof e.correction === "string" &&
      /\bj'ai\s+\S+(é|ée|és|ées|t)\b/i.test(e.correction)
    ) {
      // la copie porte-t-elle un présent à cette place ?
      const idxCopie = copie.toLowerCase().indexOf(e.original.toLowerCase());
      if (idxCopie !== -1) {
        const contexte = copie.slice(
          Math.max(0, idxCopie - 90),
          Math.min(copie.length, idxCopie + e.original.length + 160)
        );
        if (marqueursDate.test(contexte)) {
          // Présent : terminaison -e, -es, -e, -ons, -ez, -ent ; on vérifie que "j'" ou "ai" n'est PAS dans l'original
          if (
            !/(^|\s)j['’]a[iy]\b/i.test(e.original) &&
            /\S+(e|es|ent|ons|ez)(\s|$|[,.;:!?])/.test(e.original)
          ) {
            consigner(
              "A3 violé : présent programmé → passé composé suggéré malgré marqueur de date"
            );
            continue;
          }
        }
      }
    }

    // Règle 4 — virgule après numéro civique : forme justifiée TCF Canada / OQLF
    if (/\d+\s*,\s*rue\b/i.test(e.original) && /\d+\s*rue\b/i.test(e.correction || "")) {
      consigner("A4 violé : virgule après numéro civique (OQLF) signalée comme erreur");
      continue;
    }

    // Règle 4b — « 17 h. » en fin de phrase
    if (/\d{1,2}\s*h\.?$/i.test(e.original.trim()) || /\d{1,2}\s*h\.?\s*[.!?]$/.test(e.original)) {
      if (/correct|point.*obligatoire|point.*fin|h sans point|h abréviation/.test(expl)) {
        consigner("A4 violé : « N h. » en fin de phrase (point de phrase) signalé à tort");
        continue;
      }
    }

    // Règle 5 — Merci de me … : formule standard, "me" n'est pas redondant
    if (
      /\bmerci\s+de\s+(de\s+)?(m'|me|te|se|nous|vous)\b/i.test(e.original) ||
      /\bmerci\s+de\s+(m'|me|te|se|nous|vous)\b/i.test(e.original + " " + e.correction)
    ) {
      consigner("A4 violé : formule « Merci de me … » signalée incorrectement");
      continue;
    }

    // Règle 6 — réparation catégoriel A6
    const or = (e.original || "").toLowerCase();
    const co = (e.correction || "").toLowerCase();
    if (e.code === "ORT") {
      // conjugaison / temps → CONJ
      if (
        /(é|ée|és|ées|t|ais|ait|aient|erons|erez|eront|isse|issent|asse|èrent|ent|ons|ez)(\s|$|[,.!?])/.test(or) ||
        /(é|ée|és|ées|t|ais|ait|aient|erons|erez|eront|isse|issent|asse|èrent|ent|ons|ez)(\s|$|[,.!?])/.test(co)
      ) {
        if (or !== co) e.code = "CONJ";
      }
      // pronom / préposition / article / accord → GR
      if (
        /\b(le|la|les|un|une|des|du|de|à|au|aux|me|te|se|lui|leur|en|y|je|tu|il|nous|vous|ils|que|dont|où|qui|quoi)\b/.test(or + " " + co) ||
        /(pronom|préposition|article|accord|ponctuation)/i.test(expl)
      ) {
        if (or !== co && /(pronom|préposition|article|accord)/i.test(expl)) {
          e.code = "GR";
        }
      }
    }
    // synonyme / reformulation / répété → LEX
    if (e.code === "ORT" && /répété|synonyme|synonymique|répétition|vocabulaire/i.test(expl)) {
      e.code = "LEX";
    }

    result.push(e);
  }

  return { erreurs: result, rapport };
}

/** Filtre heuristique PanneauLive — retire les faux positifs connus */
function nettoyerHeuristiques(arr: ErreurLive[], copie: string): ErreurLive[] {
  if (!arr || arr.length === 0) return arr;
  return arr.filter((e) => {
    const extrait = (copie.slice(e.i, e.i + (e.l || 0)) || "").trim();
    if (!extrait) return true;

    // Virgule après numéro civique "234, rue X" : valide TCF Canada, ne pas surligner
    if (e.code === "ORT" && /^\d+,$/.test(extrait)) {
      const suite = copie.slice(e.i + e.l, e.i + e.l + 12).trim();
      if (/^rue|boul|av|avenue|boulevard|chemin|route|place|allée|impasse/i.test(suite)) return false;
    }
    // "h" suivi d'un point à la fin d'une phrase : point de la phrase, pas de h.
    if (e.code === "ORT" && /^h\.?$/i.test(extrait)) {
      const av = copie.slice(Math.max(0, e.i - 6), e.i);
      if (/\d{1,2}\s*$/i.test(av)) {
        const apres = copie.slice(e.i + e.l, e.i + e.l + 2);
        if (!apres || /[A-ZÀ-Ý]/.test(apres) || /\s*[A-ZÀ-Ý]/.test(apres)) {
          // le point est un point de phrase
          return false;
        }
      }
    }
    // "à partir de X h" + "les trios à partir de Y $" : ne pas marquer "à partir" comme préposition mauvaise
    if (e.msg && /à partir/i.test(e.msg)) {
      // Rien à retirer pour l'instant (aucune règle heuristique ne déclenche ça — garde la passe)
    }
    // Fausse alerte classique : "afin que nous puissions" contient subjonctif correct
    if (/afin\s+que/i.test(extrait) && /juste|correct/i.test(e.msg)) {
      return false;
    }
    // J'ai hâte de vous voir : correct
    if (/j'ai\s+hâte/i.test(extrait.toLowerCase()) && /correct|juste/.test(e.msg)) {
      return false;
    }
    return true;
  });
}

interface Body {
  tache_num: 1 | 2 | 3;
  consigne?: string;
  copie: string;
  exercice_id?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ erreur: "JSON invalide" }, { status: 400 });
  }
  if (!body || !body.tache_num || !body.copie) {
    return NextResponse.json(
      { erreur: "Champs requis : tache_num, copie" },
      { status: 400 }
    );
  }
  const tache = TACHES[body.tache_num];
  if (!tache) {
    return NextResponse.json({ erreur: "Tâche invalide" }, { status: 400 });
  }
  const copie = body.copie.trim();
  if (copie.length < 50) {
    return NextResponse.json(
      { erreur: "Copie trop courte (min 50 caractères)" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: setLlm } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "llm_main")
    .maybeSingle();
  const { data: setPr } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "prompts_main")
    .maybeSingle();

  const llm = (setLlm?.value as LLMSettings | null) ?? {
    provider: "openrouter",
    model: "anthropic/claude-sonnet-4",
    temperature: 0.2,
    max_tokens: 2200,
    top_p: 1,
  };
  const prompts = (setPr?.value as PromptsSettings | null) ?? {
    invite_correction: DEFAULTS.invite_correction,
    invite_modele_b2: DEFAULTS.invite_modele_b2,
  };

  const nbMots = (copie.match(/[\wÀ-ÿ'’-]+/g) || []).length;
  const prompt = inviteCorrection(prompts.invite_correction, {
    consigne: body.consigne?.trim() || "",
    copie,
    tache,
    tacheNum: body.tache_num,
    nbMots,
  });
  const heuristiquesBrutes = analyser(copie);
  const heuristiques = nettoyerHeuristiques(heuristiquesBrutes, copie);

  let brut = "";
  let modelUtilise = llm.model;
  try {
    const res = await appelOpenRouter(prompt, llm, undefined, {
      response_format: "json_schema",
      json_schema: {
        name: "CorrectionResult",
        strict: true,
        schema: {
          type: "object",
          required: ["note20", "cecrl", "verdict", "longueur_ok", "criteres", "commentaires", "erreurs", "points_forts", "gap_7", "gap_8"],
          properties: {
            score_100: { type: "number", minimum: 0, maximum: 100 },
            score_breakdown: {
              type: "object",
              required: ["grammaire_syntaxe_20", "gamme_vocabulaire_20", "coherence_cohesion_20", "realisation_tache_20", "style_registre_20"],
              properties: {
                grammaire_syntaxe_20: { type: "number", minimum: 0, maximum: 20 },
                gamme_vocabulaire_20: { type: "number", minimum: 0, maximum: 20 },
                coherence_cohesion_20: { type: "number", minimum: 0, maximum: 20 },
                realisation_tache_20: { type: "number", minimum: 0, maximum: 20 },
                style_registre_20: { type: "number", minimum: 0, maximum: 20 },
              },
            },
            feedback: { type: "string" },
            note20: { type: "number", minimum: 0, maximum: 20 },
            cecrl: { type: "string", enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
            verdict: { type: "string" },
            longueur_ok: { type: "boolean" },
            criteres: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                required: ["nom", "note", "commentaire"],
                properties: {
                  nom: { type: "string" },
                  note: { type: "number", minimum: 0, maximum: 5 },
                  commentaire: { type: "string" },
                },
              },
            },
            commentaires: { type: "array", items: { type: "string" } },
            erreurs: {
              type: "array",
              maxItems: 8,
              items: {
                type: "object",
                required: ["code", "gravite", "original", "correction", "explication", "es"],
                properties: {
                  code: { type: "string", enum: ["REG", "ORT", "GR", "CONJ", "ESP", "LEX", "COH"] },
                  gravite: { type: "string", enum: ["haute", "moyenne", "basse"] },
                  original: { type: "string" },
                  correction: { type: "string" },
                  explication: { type: "string" },
                  es: { type: "string" },
                },
              },
            },
            points_forts: { type: "array", items: { type: "string" } },
            corrected_version: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            areas_for_improvement: { type: "array", items: { type: "string" } },
            grammar_tips: {
              type: "array",
              items: {
                type: "object",
                required: ["regle", "exemple", "explication"],
                properties: {
                  regle: { type: "string" },
                  exemple: { type: "string" },
                  explication: { type: "string" },
                },
              },
            },
            vocabulary_upgrades: {
              type: "array",
              items: {
                type: "object",
                required: ["original", "suggestion", "explication"],
                properties: {
                  original: { type: "string" },
                  suggestion: { type: "string" },
                  explication: { type: "string" },
                },
              },
            },
            example_responses: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                required: ["niveau", "texte"],
                properties: {
                  niveau: { type: "string", enum: ["B1", "B2", "C1"] },
                  texte: { type: "string" },
                },
              },
            },
            gap_7: {
              type: "object",
              required: ["atteint", "manque", "actions"],
              properties: {
                atteint: { type: "boolean" },
                manque: { type: "array", items: { type: "string" } },
                actions: { type: "array", items: { type: "string" } },
              },
            },
            gap_8: {
              type: "object",
              required: ["atteint", "manque", "actions"],
              properties: {
                atteint: { type: "boolean" },
                manque: { type: "array", items: { type: "string" } },
                actions: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
    });
    brut = res.texte;
    modelUtilise = res.model_utilisé || modelUtilise;
  } catch (e) {
    return NextResponse.json(
      {
        erreur: "Erreur appel LLM",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 502 }
    );
  }

  const rIn = lireJSON<CorrectionResult>(brut);
  if (!rIn) {
    return NextResponse.json(
      {
        erreur: "Réponse LLM non structurée",
        brut,
        heuristiques,
      },
      { status: 502 }
    );
  }

  // COUCHE DE CONVERSION 100-échelle ↔ /20 + compatibilité descendante
  // Règle: note20 = round(score_100 * 20 / 100)
  // Si le LLM a rempli score_breakdown /20, on fabrique critères[] /5 = score_breakdown÷4
  function normaliserNote(r: CorrectionResult): CorrectionResult {
    const o = { ...r };
    // (A) Remplit note20 s'il manque mais score_100 présent
    if ((!o.note20 || o.note20 < 1 || o.note20 > 20) && typeof o.score_100 === "number") {
      o.note20 = Math.max(1, Math.min(20, Math.round((o.score_100 / 100) * 20)));
    }
    // (B) Remplit score_100 s'il manque mais note20 présent (inverse)
    if (typeof o.score_100 !== "number" && typeof o.note20 === "number") {
      o.score_100 = Math.max(0, Math.min(100, Math.round((o.note20 / 20) * 100)));
    }
    // (C) Fabrique critères[] à 5 entrées si score_breakdown est rempli
    const sb = o.score_breakdown;
    if (sb && typeof sb === "object") {
      const cinq: { cle: keyof typeof sb; nom: string }[] = [
        { cle: "grammaire_syntaxe_20", nom: "Grammaire et syntaxe" },
        { cle: "gamme_vocabulaire_20", nom: "Richesse et précision lexicales" },
        { cle: "coherence_cohesion_20", nom: "Cohérence et cohésion" },
        { cle: "realisation_tache_20", nom: "Réalisation de la tâche" },
        { cle: "style_registre_20", nom: "Style et registre" },
      ];
      const nouveauCriteres = cinq.map(({ cle, nom }, i) => {
        const v = (sb[cle] as number | undefined) || 0;
        const noteSur5 = Math.max(0, Math.min(5, Math.round(v / 4))); // 20 ÷ 4 = 5
        return {
          nom,
          note: noteSur5,
          commentaire: (o.commentaires && o.commentaires[i]) || "",
        };
      });
      // Si les anciens critères n'avaient que 4 lignes (barème 4×/5), on remplace
      if (!o.criteres || o.criteres.length !== 5) {
        o.criteres = nouveauCriteres;
      } else {
        // 5 existent déjà mais on met à jour leurs notes à partir du breakdown
        o.criteres = o.criteres.map((c, i) => ({
          ...c,
          nom: nouveauCriteres[i] ? nouveauCriteres[i].nom : c.nom,
          note: nouveauCriteres[i] ? nouveauCriteres[i].note : c.note,
        }));
      }
    } else if (!o.criteres || o.criteres.length === 0) {
      // (D) Fallback: 5 critères vides /2.5 par défaut (neutre)
      o.criteres = [
        { nom: "Grammaire et syntaxe", note: Math.max(0, Math.min(5, Math.round(o.note20 / 4))) },
        { nom: "Richesse et précision lexicales", note: Math.max(0, Math.min(5, Math.round(o.note20 / 4))) },
        { nom: "Cohérence et cohésion", note: Math.max(0, Math.min(5, Math.round(o.note20 / 4))) },
        { nom: "Réalisation de la tâche", note: Math.max(0, Math.min(5, Math.round(o.note20 / 4))) },
        { nom: "Style et registre", note: Math.max(0, Math.min(5, Math.round(o.note20 / 4))) },
      ];
    }
    // (D2) FALLBACK multi-clés — modèles alternatifs (minimax-m3:free etc.) renvoient
    //      souvent des clés FR ou des variantes EN. Priorité: clé canonique d'abord > alternatifs.
    //      — feedback (1 string)
    if (!o.feedback) {
      const anyStr = (v: unknown) => typeof v === "string" && v.trim().length > 0 ? v.trim() : "";
      o.feedback = anyStr(o.feedback) || anyStr(o.verdict) || anyStr((o as unknown as Record<string, unknown>).commentaire)
        || anyStr((o as unknown as Record<string, unknown>).commentaire_general)
        || anyStr((o as unknown as Record<string, unknown>).commentaireGlobal)
        || anyStr((o as unknown as Record<string, unknown>).retour)
        || anyStr((o as unknown as Record<string, unknown>).appreciation)
        || anyStr((o as unknown as Record<string, unknown>).general_feedback)
        || anyStr((o as unknown as Record<string, unknown>).overall_comment)
        || "";
    }
    //      — corrected_version (1 string : la version entièrement corrigée)
    if (!o.corrected_version) {
      const anyStr = (v: unknown) => typeof v === "string" && v.trim().length > 32 ? v.trim() : "";
      o.corrected_version = anyStr(o.corrected_version)
        || anyStr((o as unknown as Record<string, unknown>).version_corrigee)
        || anyStr((o as unknown as Record<string, unknown>).version_corrigée)
        || anyStr((o as unknown as Record<string, unknown>).correction_complete)
        || anyStr((o as unknown as Record<string, unknown>).corrected_text)
        || anyStr((o as unknown as Record<string, unknown>).reponse_corrigee)
        || anyStr((o as unknown as Record<string, unknown>).version_finale)
        || anyStr((o as unknown as Record<string, unknown>).final_corrected)
        || "";
    }
    //      — areas_for_improvement (string[])
    {
      const arr = (v: unknown): string[] => Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];
      const oR = o as unknown as Record<string, unknown>;
      if (!Array.isArray(o.areas_for_improvement) || o.areas_for_improvement.length === 0) {
        const list = arr(o.areas_for_improvement)
          .concat(arr(oR.axes_amelioration))
          .concat(arr(oR["axes_amélioration"]))
          .concat(arr(oR.axes_d_amelioration))
          .concat(arr(oR["axes_d_amélioration"]))
          .concat(arr(oR.points_a_ameliorer))
          .concat(arr(oR.points_a_améliorer))
          .concat(arr(oR.a_ameliore))
          .concat(arr(oR["a_amélioré"]))
          .concat(arr(oR.améliorations))
          .concat(arr(oR.suggestions))
          .concat(arr(oR.improvements))
          .concat(arr(oR.weaknesses))
          .concat(arr(oR.faiblesses))
          .concat(arr(oR.points_faibles))
          .concat(arr(oR.aspects_a_renforcer))
          .concat(arr(oR["aspects_à_renforcer"]))
          .concat(arr(oR.to_improve));
        o.areas_for_improvement = Array.from(new Set(list));
      }
    }
    //      — strengths ← double sens (F→canonique ET canonique→F si vide)
    {
      const arr = (v: unknown): string[] => Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];
      const oR = o as unknown as Record<string, unknown>;
      if (!Array.isArray(o.strengths) || o.strengths.length === 0) {
        const list = arr(o.strengths)
          .concat(arr(o.points_forts))
          .concat(arr(oR.points_positifs))
          .concat(arr(oR.reussites))
          .concat(arr(oR.positives))
          .concat(arr(oR.qualites))
          .concat(arr(oR.strong_points));
        o.strengths = Array.from(new Set(list));
      }
      if (!Array.isArray(o.points_forts) || o.points_forts.length === 0) {
        o.points_forts = [...(o.strengths || [])];
      }
    }
    //      — grammar_tips GrammarTip[]
    {
      const oR = o as unknown as Record<string, unknown>;
      const isTip = (v: unknown): v is { regle: string; exemple?: string; explication?: string } =>
        !!v && typeof v === "object" && typeof (v as { regle?: unknown }).regle === "string";
      const asTips = (v: unknown) => Array.isArray(v) ? v.filter(isTip) : [];
      if (!Array.isArray(o.grammar_tips) || o.grammar_tips.length === 0) {
        const gathered = ([] as { regle: string; exemple?: string; explication?: string }[])
          .concat(asTips(o.grammar_tips))
          .concat(asTips(oR.conseils_grammaire))
          .concat(asTips(oR.grammaire_conseils))
          .concat(asTips(oR.astuces_grammaire))
          .concat(asTips(oR.tips_grammaire))
          .concat(asTips(oR.grammar_advice));
        o.grammar_tips = gathered.map((g) => ({
          regle: g.regle,
          exemple: g.exemple ?? "",
          explication: g.explication ?? "",
        }));
      }
    }
    //      — vocabulary_upgrades VocabUpgrade[]
    {
      const oR = o as unknown as Record<string, unknown>;
      const isVoc = (v: unknown): v is { original: string; suggestion: string; explication?: string } =>
        !!v && typeof v === "object" && typeof (v as { original?: unknown }).original === "string" && typeof (v as { suggestion?: unknown }).suggestion === "string";
      const asVoc = (v: unknown) => Array.isArray(v) ? v.filter(isVoc) : [];
      if (!Array.isArray(o.vocabulary_upgrades) || o.vocabulary_upgrades.length === 0) {
        const gathered = ([] as { original: string; suggestion: string; explication?: string }[])
          .concat(asVoc(o.vocabulary_upgrades))
          .concat(asVoc(oR.ameliorations_vocabulaire))
          .concat(asVoc(oR["améliorations_vocabulaire"]))
          .concat(asVoc(oR.upgrades_vocabulaire))
          .concat(asVoc(oR.ameliorations_lexicales))
          .concat(asVoc(oR["améliorations_lexicales"]))
          .concat(asVoc(oR.vocab_ameliorer))
          .concat(asVoc(oR["vocab_améliorer"]))
          .concat(asVoc(oR.vocab_suggestions))
          .concat(asVoc(oR.vocabulary_suggestions));
        o.vocabulary_upgrades = gathered.map((v) => ({
          original: v.original,
          suggestion: v.suggestion,
          explication: v.explication ?? "",
        }));
      }
    }
    //      — example_responses ExampleResponse[]
    {
      const oR = o as unknown as Record<string, unknown>;
      const isEx = (v: unknown): v is { niveau: unknown; texte: string } =>
        !!v && typeof v === "object" && typeof (v as { texte?: unknown }).texte === "string" && (v as { niveau?: unknown }).niveau !== undefined;
      const asEx = (v: unknown) => Array.isArray(v) ? v.filter(isEx) : [];
      const VALIDE = new Set<"B1" | "B2" | "C1" | "C2">(["B1", "B2", "C1", "C2"]);
      const coerceNiveau = (n: unknown): "B1" | "B2" | "C1" | "C2" => {
        const s = String(n ?? "").trim().toUpperCase().replace(/\+/g, "");
        if (VALIDE.has(s as "B1" | "B2" | "C1" | "C2")) return s as "B1" | "B2" | "C1" | "C2";
        if (s.startsWith("A")) return "B1";
        if (s === "C") return "C1";
        return "B2";
      };
      if (!Array.isArray(o.example_responses) || o.example_responses.length === 0) {
        const gathered = ([] as { niveau: unknown; texte: string }[])
          .concat(asEx(o.example_responses))
          .concat(asEx(oR.exemples_reponse))
          .concat(asEx(oR["exemples_réponse"]))
          .concat(asEx(oR.exemples_reponses))
          .concat(asEx(oR["exemples_réponses"]))
          .concat(asEx(oR.modeles_reponse))
          .concat(asEx(oR["modèles_réponse"]))
          .concat(asEx(oR.reponses_exemple))
          .concat(asEx(oR["réponses_exemple"]))
          .concat(asEx(oR.examples));
        o.example_responses = gathered.map((ex) => ({
          niveau: coerceNiveau(ex.niveau),
          texte: ex.texte,
        }));
      }
    }
    // (D3) PURGE SCHÉMA FERMÉ — ne garde QUE les 24 clés canoniques
    //      Supprime toute clé FR ou variante qui aurait pu fuir malgré D2.
    {
      const allowedKeys = new Set([
        "note20", "cecrl", "verdict", "longueur_ok", "criteres", "commentaires",
        "erreurs", "points_forts", "gap_7", "gap_8", "score_100", "score_breakdown",
        "feedback", "corrected_version", "strengths", "areas_for_improvement",
        "grammar_tips", "vocabulary_upgrades", "example_responses"
      ]);
      for (const k of Object.keys(o as unknown as Record<string, unknown>)) {
        if (!allowedKeys.has(k)) {
          delete (o as unknown as Record<string, unknown>)[k];
        }
      }
      // Garantit les gaps et score_breakdown existent toujours (objets vides structurels)
      if (!o.gap_7 || typeof o.gap_7 !== "object") {
        o.gap_7 = { atteint: false, manque: [], actions: [] };
      }
      if (!o.gap_8 || typeof o.gap_8 !== "object") {
        o.gap_8 = { atteint: false, manque: [], actions: [] };
      }
      if (!o.score_breakdown || typeof o.score_breakdown !== "object") {
        o.score_breakdown = {
          grammaire_syntaxe_20: 0,
          gamme_vocabulaire_20: 0,
          coherence_cohesion_20: 0,
          realisation_tache_20: 0,
          style_registre_20: 0,
        };
      }
    }
    // (D4) PADDING example_responses → TOUJOURS 3 entrées distinctes B1/B2/C1
    {
      const VALIDE_NIVEAUX = new Set<"B1" | "B2" | "C1">(["B1", "B2", "C1"]);
      const niveauxFournis = new Set(
        (o.example_responses || [])
          .map((ex) => String(ex?.niveau ?? "").trim().toUpperCase().replace(/\+/g, ""))
          .filter((n) => VALIDE_NIVEAUX.has(n as "B1" | "B2" | "C1"))
      );
      const besoinRebuild =
        !Array.isArray(o.example_responses) ||
        o.example_responses.length !== 3 ||
        niveauxFournis.size !== 3;
      if (besoinRebuild) {
        const base =
          (o.corrected_version && o.corrected_version.length > 32)
            ? o.corrected_version
            : copie;
        const B1 = {
          niveau: "B1" as const,
          texte:
            "[Modèle B1 par défaut, LLM n'a pas fourni] : " +
            base.slice(0, Math.min(base.length, Math.floor(base.length * 0.6))),
        };
        const B2 = {
          niveau: "B2" as const,
          texte: base,
        };
        const C1 = {
          niveau: "C1" as const,
          texte:
            base +
            ". Par ailleurs, il convient de souligner que " +
            ((o.areas_for_improvement && o.areas_for_improvement[0]) ||
              "la structure du discours gagne en profondeur grâce à des connecteurs logiques variés et des propositions subordonnées qui introduisent nuances et contraste."),
        };
        // Préserve les entrées existantes valides quand elles correspondent
        const existant = new Map<string, string>();
        for (const ex of o.example_responses || []) {
          if (ex && typeof ex.texte === "string") {
            const n = String(ex.niveau ?? "").trim().toUpperCase().replace(/\+/g, "");
            if (VALIDE_NIVEAUX.has(n as "B1" | "B2" | "C1")) existant.set(n, ex.texte);
          }
        }
        o.example_responses = [
          { niveau: B1.niveau, texte: existant.get("B1") || B1.texte },
          { niveau: B2.niveau, texte: existant.get("B2") || B2.texte },
          { niveau: C1.niveau, texte: existant.get("C1") || C1.texte },
        ];
      }
    }
    // (E) Remplit feedback s'il manque et verdict existe (double guarde)
    if (!o.feedback && o.verdict) {
      o.feedback = o.verdict;
    }
    // (F) Remplit strengths ↔ points_forts (déjà fait en D2; garde pour rétro-compat)
    // (G) CECRL calculé IMPÉRATIVEMENT selon la table A13 (0-3 A1, 4-6 A2, 7-9 B1, 10-12 B2, 13-15 C1, 16+ C2)
    //     On ignore TOTALEMENT la valeur renvoyée par le LLM pour éviter B1+, B2+, seuils faux (11/20 B1+ → DOIT être B2).
    if (typeof o.note20 === "number" && Number.isFinite(o.note20)) {
      o.cecrl = CECRL(Math.max(0, Math.min(20, Math.round(o.note20))));
    }
    return o;
  }

  const rNormalisé = normaliserNote(rIn);
  const filtrage = filtrerEtValiderErreurs(rNormalisé.erreurs, copie);
  const r: CorrectionResult = {
    ...rNormalisé,
    erreurs: filtrage.erreurs,
    commentaires:
      rNormalisé.commentaires && filtrage.rapport.entréesRetirées > 0
        ? [
            ...rNormalisé.commentaires,
            "Note interne : " +
              filtrage.rapport.entréesRetirées +
              " signalement(s) douteux retirés par filtre anti-faux-positifs (" +
              Object.keys(filtrage.rapport.raisons).slice(0,2).join("; ") +
              (Object.keys(filtrage.rapport.raisons).length > 2
                ? "…"
                : "") +
              ").",
          ]
        : rNormalisé.commentaires,
  };
  void filtrage;

  const note = Math.max(1, Math.min(20, r.note20 || 0));
  const nclc = NCLC(note);
  const score100 = typeof r.score_100 === "number"
    ? r.score_100
    : Math.round((note / 20) * 100);
  const essai: EssaiExpressionEcrite = {
    tache_num: body.tache_num,
    exercice_id: body.exercice_id || undefined,
    consigne: body.consigne?.trim() || undefined,
    copie,
    nb_mots: nbMots,
    note_20: note,
    cecrl: r.cecrl,
    nclc,
    longueur_ok: r.longueur_ok,
    verdict: r.verdict,
    criteres: r.criteres,
    commentaires: r.commentaires,
    erreurs: r.erreurs,
    points_forts: r.points_forts,
    gap_7: r.gap_7,
    gap_8: r.gap_8,
    heuristiques,
    model_used: modelUtilise,

    score_100: score100,
    score_breakdown: r.score_breakdown,
    feedback: r.feedback,
    corrected_version: r.corrected_version,
    strengths: r.strengths,
    areas_for_improvement: r.areas_for_improvement,
    grammar_tips: r.grammar_tips,
    vocabulary_upgrades: r.vocabulary_upgrades,
    example_responses: r.example_responses,
  };
  try {
    const { data: inserted, error: insErr } = await supabase
      .from("essais_expression_ecrite")
      .insert(essai)
      .select("id")
      .single();
    if (insErr) throw insErr;
    const essaiId = inserted?.id as string | undefined;

    if (essaiId && Array.isArray(r.erreurs) && r.erreurs.length > 0) {
      try {
        const toInsert: ErreurSuivi[] = r.erreurs
          .filter((e) => e && typeof e.original === "string" && typeof e.correction === "string" && e.original !== e.correction)
          .map((e) => {
            const gravite: GraviteErreur = (
              ["haute", "moyenne", "basse"].includes(e.gravite as string)
                ? e.gravite
                : (e as { gravite?: string }).gravite === "grave"
                  ? "haute"
                  : (e as { gravite?: string }).gravite === "leger" || (e as { gravite?: string }).gravite === "faible"
                    ? "basse"
                    : "moyenne"
            ) as GraviteErreur;
            return {
              essai_id: essaiId,
              manuel: false,
              code: typeof (e as ErreurDétaillée).code === "string" ? (e as ErreurDétaillée).code : "AUT",
              gravite,
              original: e.original,
              correction: e.correction,
              contexte: extraireContexte(copie, e.original),
              explication: typeof (e as ErreurDétaillée).explication === "string" ? (e as ErreurDétaillée).explication : undefined,
              traduction_es: typeof (e as ErreurDétaillée).es === "string" ? (e as ErreurDétaillée).es : undefined,
              prochaine_revision: prochaineRevisionApres(1),
            } as ErreurSuivi;
          });
        if (toInsert.length) {
          await supabase.from("erreurs_suivi").insert(toInsert as any);
        }
      } catch {
        /* erreurs de suivi non critiques — on ne casse pas la correction */
      }
    }
  } catch {
    /* log & continue */
  }
  return NextResponse.json({ ...r, _meta: { nb_mots: nbMots, nclc, model_used: modelUtilise, heuristiques } });
}

function extraireContexte(texte: string, aiguille: string): string | null {
  if (!texte || !aiguille) return null;
  const rayon = 90;
  const t = String(texte).replace(/\s+/g, " ");
  const i = t.indexOf(String(aiguille));
  if (i < 0) return null;
  const start = Math.max(0, i - rayon);
  const end = Math.min(t.length, i + aiguille.length + rayon);
  const before = (start === 0 ? "" : "…") + t.slice(start, i);
  const after = t.slice(i + aiguille.length, end) + (end === t.length ? "" : "…");
  return before + "«" + aiguille + "»" + after;
}

function prochaineRevisionApres(intervalJours: number): string {
  const d = new Date();
  d.setDate(d.getDate() + intervalJours);
  return d.toISOString();
}
