export type Gravite = "haute" | "moyenne" | "basse";

export type CodeErreur =
  | "REG"
  | "ORT"
  | "GR"
  | "CONJ"
  | "ESP"
  | "LEX"
  | "COH";

export interface ErreurLive {
  i: number;
  l: number;
  code: CodeErreur;
  g: Gravite;
  msg: string;
}

export interface Tache {
  titre: string;
  type: string;
  min: number;
  max: number;
  cible: [number, number];
  minutes: number;
  attendu: string;
  plan: [string, string][];
  formules: string[];
  parties?: [{ nom: string; min: number; max: number }, { nom: string; min: number; max: number }];
}

export interface CritereBarême {
  nom: string;
  note: number;
  commentaire?: string;
}

export interface ErreurDétaillée {
  code: CodeErreur;
  gravite: Gravite;
  original: string;
  correction: string;
  explication: string;
  es?: string;
}

export interface Gap {
  atteint?: boolean;
  manque: string[];
  actions: string[];
}

export interface VocabUpgrade {
  original: string;
  suggestion: string;
  explication: string;
}

export interface GrammarTip {
  regle: string;
  exemple: string;
  explication: string;
}

export interface ExampleResponse {
  niveau: "B1" | "B2" | "C1" | "C2";
  texte: string;
}

export interface CorrectionResult {
  note20: number;
  cecrl: string;
  verdict: string;
  longueur_ok: boolean;
  criteres: CritereBarême[];
  commentaires?: string[];
  erreurs: ErreurDétaillée[];
  points_forts: string[];
  gap_7: Gap;
  gap_8: Gap;

  score_100?: number;
  score_breakdown?: {
    grammaire_syntaxe_20: number;
    gamme_vocabulaire_20: number;
    coherence_cohesion_20: number;
    realisation_tache_20: number;
    style_registre_20: number;
  };
  feedback?: string;
  corrected_version?: string;
  strengths?: string[];
  areas_for_improvement?: string[];
  grammar_tips?: GrammarTip[];
  vocabulary_upgrades?: VocabUpgrade[];
  example_responses?: ExampleResponse[];
}

export interface ModeleB2Result {
  modele: string;
  formules: string[];
}

export interface LLMSettings {
  provider: "openrouter";
  model: string;
  temperature: number;
  max_tokens: number;
  top_p?: number;
}

export interface PromptsSettings {
  invite_correction: string;
  invite_modele_b2: string;
}

export interface ConjugaisonVerb {
  i: string;
  e: string;
  g?: "er" | "ir" | "re";
  x: "a" | "e";
  pp: string;
  f: string;
  m?: string;
  p?: string[];
  s?: string[];
  im?: string[];
  pron?: boolean;
  imp?: boolean;
  tcf?: string;
  nom?: string;
  rad_srch?: string;
}

export type TempsConj =
  | "présent"
  | "passé composé"
  | "imparfait"
  | "plus-que-parfait"
  | "futur simple"
  | "conditionnel présent"
  | "subjonctif présent";

export interface StatsConjugaison {
  n: number;
  ok: number;
  serie: number;
  meilleure: number;
  accent: number;
}

export interface Exercice {
  id: string;
  tache_num: 1 | 2 | 3;
  consigne: string;
  actif: boolean;
  created_at: string;
}

export interface ExerciceAvecProgres extends Exercice {
  meilleure_note_20?: number;
  termine: boolean;
}

export interface EssaiExpressionEcrite {
  id?: string;
  created_at?: string;
  tache_num: 1 | 2 | 3;
  exercice_id?: string;
  consigne?: string;
  copie: string;
  nb_mots: number;
  note_20?: number;
  cecrl?: string;
  nclc?: string;
  longueur_ok?: boolean;
  verdict?: string;
  criteres?: CritereBarême[];
  commentaires?: string[];
  erreurs?: ErreurDétaillée[];
  points_forts?: string[];
  gap_7?: Gap;
  gap_8?: Gap;
  modele_b2?: string;
  formules_b2?: string[];
  heuristiques?: ErreurLive[];
  model_used?: string;

  score_100?: number;
  score_breakdown?: CorrectionResult["score_breakdown"];
  feedback?: string;
  corrected_version?: string;
  notes_user?: string;
  strengths?: string[];
  areas_for_improvement?: string[];
  grammar_tips?: GrammarTip[];
  vocabulary_upgrades?: VocabUpgrade[];
  example_responses?: ExampleResponse[];
}

export interface ProgressionKPI {
  total_essais: number;
  moyenne_note_20: number;
  score_100_moyen: number;
  seuil_nclc7_atteint: number;
  seuil_nclc8_atteint: number;
  pourcentage_nclc8: number;
  note_max_20: number;
  meilleure_par_tache: Record<1 | 2 | 3, number | null>;
  moyenne_par_tache: Record<1 | 2 | 3, number>;
  total_par_tache: Record<1 | 2 | 3, number>;
  tendance: "hausse" | "stable" | "baisse" | null;
}

export interface CritereGap {
  cle: "grammaire_syntaxe_20" | "gamme_vocabulaire_20" | "coherence_cohesion_20" | "realisation_tache_20" | "style_registre_20";
  label: string;
  seuil_nclc8_20: number;
  moyenne_20: number;
  delta_20: number;
  points_manquants_sur_20: number;
}

export interface ProgressionDashboard {
  kpis: ProgressionKPI;
  ecart_nclc8_sur_note_globale: number;
  prochaine_cible_note_20: number;
  ecart_par_critere: CritereGap[];
  derniers_essais: EssaiExpressionEcrite[];
  top_manques_gap8: string[];
  top_actions_gap8: string[];
  codes_erreurs_les_plus_frequents: { code: CodeErreur; count: number; label: string }[];
  tendance_points: { i: number; note_20: number; nclc?: string; created_at?: string }[];
}

export interface ProgressionNote {
  id?: string;
  essai_id: string;
  kind?: "general" | "to_retry" | "grammar_target" | "vocab_target";
  contenu: string;
  created_at?: string;
  updated_at?: string;
}

export type GraviteErreur = "haute" | "moyenne" | "basse";

export interface ErreurSuivi {
  id?: string;
  created_at?: string;
  essai_id?: string | null;
  manuel?: boolean;
  code: CodeErreur | string;
  gravite: GraviteErreur;
  original: string;
  correction: string;
  contexte?: string | null;
  explication?: string | null;
  traduction_es?: string | null;
  notes?: string | null;
  ecrit_10x_fois?: boolean;
  nb_revisions?: number;
  derniere_revision?: string | null;
  prochaine_revision?: string | null;
}

export interface DashboardErreurs {
  total: number;
  non_maitrises: number;
  ecrites_10x: number;
  par_code: { code: CodeErreur | string; label: string; count: number; non_maitrises: number }[];
  par_gravite: { gravite: GraviteErreur; count: number; non_maitrises: number }[];
  erreurs: ErreurSuivi[];
  priorite_revision: ErreurSuivi[];
}
