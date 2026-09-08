export {
  VERBES,
  ETRE,
  AVOIR,
  formes,
  AVEC_SUJET,
  TEMPS_EXO,
  TIRAGE,
  RAPPELS,
  TOP,
  PHRASES,
  PRON,
  PRON_SUJ,
  voyelle,
  type ConjugaisonVerb,
  type TempsConj,
  type PhraseExo,
} from "@/lib/heuristiques/verbes";

export const FILTRES: [string, string][] = [
  ["tous", "Tous"],
  ["irr", "Irréguliers"],
  ["er", "1er groupe"],
  ["ir", "2e groupe"],
  ["re", "3e -re"],
  ["pron", "Pronominaux"],
];
