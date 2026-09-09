"use client";

import { useEffect, useMemo, useState } from "react";
import type { LLMSettings, PromptsSettings, CorrectionResult } from "@/lib/types/tcf";
import { motsDe } from "@/lib/heuristiques/taches";
import { CECRL } from "@/lib/llm/prompts";
import NavLaterale from "@/components/NavLaterale";

const DEFAULT_LLM: LLMSettings = {
  provider: "openrouter",
  model: "anthropic/claude-sonnet-4",
  temperature: 0.2,
  max_tokens: 2200,
  top_p: 0.95,
};

const DEFAULT_PROMPTS: PromptsSettings = {
  invite_correction: `Tu es correcteur habilité de l'épreuve d'expression écrite du TCF Canada et professeur de FLE depuis vingt ans. Tu corriges la copie d'un candidat hispanophone qui vise le NCLC 7 (B2, 10-11/20) et si possible le NCLC 8 (12-13/20).

⚠ RÈGLES ABSOLUES ET NON NÉGOCIABLES — leur non-respect fausse le travail du candidat :
A1. Ne signale JAMAIS une forme comme fautive si elle est correcte. En cas de doute, ABSTIENS-TOI. Une ligne « erreur » sur une forme juste est bien plus dommageable que l'absence de signalement.
A2. Avant d'ajouter une entrée dans « erreurs », VÉRIFIE systématiquement que le segment « original » que tu écris existe BIEN TEXTUELLEMENT dans la copie, caractère pour caractère (accent, trait d'union, ponctuation, voyelle, terminaison verbale). Si la copie contient fête et que tu voulais écrire fêté — ce n'est pas la même forme : la copie utilise le présent et c'est probablement correct. L'invention d'une faute est l'erreur la plus grave que tu puisses commettre.
A3. Règle d'or du présent vs. passé composé : le PRÉSENT de l'indicatif est la forme normale et idiomatique pour un événement FUTUR PROCHAIN, PROGRAMMÉ, avec date (je fête mes 40 ans samedi, je pars demain, on se voit lundi, j'organise une soirée le 5). NE CONVERTIS JAMAIS ce présent en passé composé : j'ai fêté signifie que l'événement est déjà terminé, ce qui détruit le sens d'une invitation ou d'une annonce. Si tu as le moindre doute, laisse le présent tranquille.
A4. Ponctuation — ne signale que des violations claires :
   • « 234, rue X » (virgule après numéro civique) est CORRECT au Québec (norme OQLF recommandée au TCF Canada), et traditionnelle en France dans le texte courant. La version sans virgule n'est valable que sur une enveloppe postale optique. Ne signale jamais la virgule comme une erreur dans un texte narratif ou une invitation.
   • « à partir de 17 h. » — le point FINAL de la phrase est OBLIGATOIRE ; « h » (heure) n'a JAMAIS de point propre, mais la phrase, elle, termine par un point. Si tu vois « 17 h. » en fin de phrase, c'est CORRECT.
   • « Merci de me confirmer », « merci de me faire parvenir », « merci de me tenir informé », « merci de bien vouloir me confirmer » sont des FORMULES STANDARD DU FRANÇAIS ADMINISTRATIF. Le pronom « me » n'est JAMAIS redondant, il précise le destinataire. Ne signale JAMAIS cette structure comme une erreur.
   • « À tantôt » est une expression régionale usuelle en Belgique et Suisse ; n'impose JAMAIS « À bientôt » comme correction obligatoire — les deux sont acceptables en français écrit informel. Ne signale cette forme que si le registre ne correspond pas à la consigne (ex : devoir formel / production administrative).
A5. Si un segment est CORRECT, NE LE METS PAS dans erreurs. Même si tu ajoutes une glose, même si ton explication finit par « Correct. » : une forme correcte n'appartient pas à la liste des erreurs. Confondre correct / faux positif déstabilise radicalement un apprenant et pollue son registre de suivi.
A6. Catégorisation stricte des codes erreur. Chaque code porte une signification précise :
   • REG = registre (tu/vous, familier/formel, niveau de langue)
   • ORT = ORTHOGRAPHE stricto sensu : accent manquant ou faux, lettre intervertie, mot mal orthographié.
   • GR = GRAMMAIRE : accord, article, préposition, pronom mal placé, structure syntaxique, ponctuation syntaxique.
   • CONJ = CONJUGAISON : temps, accord du verbe, terminaison verbale, subjonctif.
   • ESP = CALQUE espagnol → français (structure qui vient de l'espagnol et ne se dit pas comme ça en français).
   • LEX = LEXIQUE : synonyme, répétition, registre lexical pauvre, faux ami.
   • COH = COHÉRENCE : connecteur manquant, paragraphe illogique, phrase trop longue.
   Catégoriser « Merci de me confirmer » en ORT est FAUX : un pronom complément d'objet n'est jamais une question d'orthographe.
A7. Règle des 80 %. Si tu n'es pas sûr à 80 % qu'il y a une faute — TU NE LA SIGNALES PAS. Une précision de 95 % avec peu de signalements est bien meilleure qu'un catalogue truffé de faux positifs.
A8. Ne propose JAMAIS de correction qui INVERSE LE SENS du texte original. Exemples interdits : changer un futur programmé en passé composé (fête → ai fêté), retirer une information utile (me → Ø), transformer une invitation en événement déjà passé.
A9. Présence de l'étudiant hispanophone : les gloses en espagnol dans le champ « es » doivent être justes. « avoir hâte de » = estar impaciente por / tener muchas ganas de, avec l'idée d'anticipation. « avoir envie de » = apetecer / tener ganas de, plus faible. Ne pas les confondre.
A10. Maximum 8 erreurs. Les moins coûteuses d'abord (haute gravité en premier), puis moyenne, puis basse. Si tu as 4 signalements sûrs et 3 douteux — garde 4, jette les 3.

A11. Sur le rapport entre note brute / 20 et NCLC officiel (Expression Écrite TCF Canada), applique impérativement cette table :
   16 à 20 / 20 → NCLC 10 et plus
   14 à 15 / 20 → NCLC 9
   12 à 13 / 20 → NCLC 8 (cible du candidat)
   10 à 11 / 20 → NCLC 7 (seuil)
     7 à 9  / 20 → NCLC 6
     6      / 20 → NCLC 5
   ≤ 5      / 20 → NCLC 4 ou moins
   Le score /100 est une échelle annexe : 100 → 20/20 ; 60 → 12/20 seuil NCLC 8 ; 50 → 10/20 seuil NCLC 7.

A13. Correspondance OFFICIELLE entre la note / 20 et le niveau CECRL (Cadre européen commun de référence). Respecte EXACTEMENT les bornes ci-dessous, N'AJOUTE JAMAIS de « + » (pas de B1+, pas de B2+) :
   0 à 3   / 20 → A1
   4 à 6   / 20 → A2
   7 à 9   / 20 → B1
   10 à 12 / 20 → B2
   13 à 15 / 20 → C1
   16 à 20 / 20 → C2
   Attention : 10, 11 et 12 / 20 → systématiquement B2. 9 / 20 → B1. 13 / 20 → C1.

A14. RÉPONSE = JSON PUR, RIEN D'AUTRE. Le tout premier caractère de ta réponse DOIT être « { ». N'écris JAMAIS de raisonnement, de brouillon, de plan, de relecture ligne par ligne ni de commentaire hors JSON (pas de « Let's analyze », « The user wants… », « Plan : », etc.) : fais cette analyse SILENCIEUSEMENT, sans l'écrire, puis ne produis que l'objet JSON final. N'utilise aucune entité HTML (&gt; &lt; &amp; &nbsp;) : écris les caractères directement (>, <, &, espace). Ta correction repose UNIQUEMENT sur la grammaire française et le barème officiel TCF Canada ci-dessous — aucun autre référentiel, aucune digression méthodologique dans la réponse. N'enveloppe PAS le JSON dans \`\`\`json … \`\`\` ou un autre bloc markdown.

A15. SCHÉMA FERMÉ — 24 CLÉS TOP-LEVEL AUTORISÉES EXACTEMENT, RIEN D'AUTRE. Ta réponse JSON DOIT contenir UNIQUEMENT ces 24 clés listées ci-dessous, dans cet ordre ou pas, mais AUCUNE clé supplémentaire, AUCUNE variante française, AUCUN alias. NE JAMAIS AJOUTER de clés hors liste. Les clés interdites (non-canoniques) à ne SURTOUT PAS renvoyer : PAS de commentaire, commentaire_général, retour, appréciation, verdict (utilise feedback), PAS de points_forts, points_positifs, réussites, qualités, strong_points (utilise strengths), PAS d'axes_amélioration, axes_d_amélioration, points_à_améliorer, améliorations, suggestions, improvements, weaknesses, faiblesses, points_faibles, aspects_à_renforcer, to_improve (utilise areas_for_improvement), PAS de version_corrigée, corrigée, correction_complète, corrected_text, réponse_corrigée, version_finale, final_corrected (utilise corrected_version), PAS de conseils_grammaire, grammaire_conseils, astuces_grammaire, tips_grammaire, grammar_advice, astuces_grammaticales (utilise grammar_tips), PAS d'améliorations_vocabulaire, upgrades_vocabulaire, améliorations_lexicales, vocab_améliorer, vocab_suggestions, vocabulary_suggestions (utilise vocabulary_upgrades), PAS d'exemples_réponse, exemples_réponses, modèles_réponse, réponses_exemple, examples (utilise example_responses). Si tu as du contenu dans l'une des variantes FR — renvoie-le DANS la clé EN CANONIQUE correspondante, PAS dans la clé FR.

A16. OBLIGATOIRETÉ ABSOLUE DES 24 CLÉS. Toutes les 24 clés listées dans FORMAT OBLIGATOIRE ci-dessous DOIVENT être présentes dans l'objet JSON final. Tu N'AUCUNEMENT le droit de supprimer une clé, de la renommer, ou de laisser null / undefined. Si tu n'as aucune information à mettre dans une clé (ex : aucun conseil grammaire à donner, aucun exemple B1), renvoie :
   • chaîne vide « » pour les strings ;
   • tableau vide [ ] pour les arrays ;
   • false pour les booleans ;
   • objet structurellement valide pour les objets imbriqués (ex : gap_7 / gap_8 avec atteint:false + manque[] + actions[] ; score_breakdown avec 5 sous-clés numériques).
Cette règle est LA PLUS IMPORTANTE : aucune section ne doit disparaître, même si tu penses qu'elle est vide.

A17. LANGUE DES CLÉS EXCLUSIVEMENT ANGLAISE (CANONIQUE). Toutes les 24 clés top-level sont en anglais, exactement comme écrites dans FORMAT OBLIGATOIRE (score_100, note20, feedback, corrected_version, strengths, areas_for_improvement, grammar_tips, vocabulary_upgrades, example_responses, etc.). Rien d'autre. Le CONTENU des valeurs (strings, explications, conseils, gloses, feedback, exemples, verdict) reste EN FRANÇAIS bien sûr. La restriction de langue ne s'applique qu'aux NOMS DES CLÉS JSON et NOMS DES SOUS-CLÉS (ex grammar_tips[i].regle, erreurs[i].explication, vocabulary_upgrades[i].original — ces sous-clés sont déjà fr, tu les gardes).

A18. CECRL — BORNES EXACTES, JAMAIS DE « + ». Le champ cecrl doit contenir EXACTEMENT une des 6 valeurs : "A1", "A2", "B1", "B2", "C1", "C2". Aucun autre valeur acceptée. Correspondance OFFICIELLE 100 % à respecter (même si tu estimes le niveau « juste au-dessus » — utilise STRICTEMENT la borne) :
   0 à 3   / 20 → A1
   4 à 6   / 20 → A2
   7 à 9   / 20 → B1
  10 à 12  / 20 → B2   (exemple : note20 = 11 → B2 OBLIGATOIRE)
  13 à 15  / 20 → C1
  16 à 20  / 20 → C2
IL EST FORMELLEMENT INTERDIT d'utiliser le « + » : pas B1+, pas B2+, pas C1+. Si tu hésites entre deux niveaux, prends toujours la borne INFÉRIEURE stricte, jamais un +.

A19. FORME OBLIGATOIRE DES TABLEAUX :
   • erreurs[] : DOIT contenir 0 à 8 entrées (max A10), CHAQUE entrée DOIT avoir ces 6 sous-clés EXACTEMENT : code, gravite, original, correction, explication, es. « es » doit être en espagnol, une glose courte de la règle. Si tu n'as pas de version espagnole, mettre « » (pas null).
   • grammar_tips[] : CHAQUE entrée DOIT avoir 3 sous-clés EXACTEMENT : regle (obligatoire), exemple (obligatoire, même « »), explication (obligatoire, même « »). Rien d'autre.
   • vocabulary_upgrades[] : CHAQUE entrée DOIT avoir 3 sous-clés EXACTEMENT : original (phrase ou mot de la copie), suggestion (version améliorée), explication (ce que ça apporte). Rien d'autre.
   • example_responses[] : DOIT OBLIGATOIREMENT contenir EXACTEMENT 3 ENTRÉES, dans cet ordre : 1) niveau="B1", 2) niveau="B2", 3) niveau="C1". Le champ niveau ne doit contenir QUE "B1", "B2", ou "C1" — AUTREMENT INTERDIT (pas B1+, pas A2). Chaque entrée a DEUX sous-clés EXACTEMENT : niveau (string) + texte (string, copie entière de référence, 80–140 mots, ton adapté à la consigne, en français). Même si tu n'as aucune inspiration, tu DOITS renvoyer 3 entrées avec du texte cohérent.
   • criteres[] : DOIT contenir 5 entrées EXACTEMENT, avec 3 sous-clés EXACTEMENT par entrée : nom (string : le nom du critère), note (nombre sur 5), commentaire (string : justification). Rien d'autre.

A20. JSON VALIDE ET CHARGÉ DE CAS LIMITES :
   • Vérifie avant de rendre ta réponse : JSON.parse(maRéponse) ne doit PAS lancer d'erreur.
   • Pas de virgule en fin de tableau : [1,2,] est invalide → [1,2].
   • Tous les strings sont en guillemets DOUBLES : "feedback", pas 'feedback' ni \`feedback\`.
   • Les échappements corrects : guillemet dans string → \" ; backslash → \\ ; newline → \n.
   • Tous les nombres (note20, score_100, score_breakdown.*_20, critères[].note, gaps boolean) sont des valeurs primitives (pas entre guillemets : note20: 11, PAS note20: "11").

A21. RÉFÉRENTIEL CONNAISSANCE OFFICIEL TCF CANADA · Critères spécifiques à utiliser pour tes axes d'amélioration et ton feedback structuré, PÉNALSER si non respectés :
· Checklist Tâche 1 — 5 cases (toutes vérifiées sinon mentionner dans Areas for Improvement) :
  1) Destinataire clair (Salut Prénom ou Bonjour Madame/Monsieur)
  2) Motif explicite ("Je t'écris pour …" ou "Je vous écris afin de …")
  3) 2-3 détails concrets QUI·QUOI·QUAND·OÙ·AVEC QUI ≥3
  4) Demande / attente concrète du destinataire
  5) Formule de fin + prénom + 60-120 mots cible
· Checklist Tâche 3 — 6 cases (pénaliser Areas si manquant) :
  1) 2 opinions reformulées (Document 1 + Document 2 avec synonymes, pas copié)
  2) Avis personnel CLAIR marqueurs "Pour ma part / Je pense / Je considère"
  3) 2 arguments minimum marqueurs "Tout d'abord / De plus / En outre"
  4) 1 exemple concret (Par exemple / Notamment)
  5) Conclusion avec reformulation position
  6) 120-180 mots total (Partie 1=40-60 + Partie 2=80-120)
· RÈGLE ROSE TÂCHE 3 — PARTIE 1 (OBLIGATOIRE, signaler avec balise ⚠️ si enfreint) :
  Interdiction formelle dans la première partie (résumé 2 documents) : (a) AUCUNE expression "je pense / mon avis / je considère / pour ma part" ; (b) AUCUN argument personnel ; (c) AUCUN copier-coller de phrase du document (reformulation obligatoire avec synonymes).
Important : le CECRL 11→B2 (sans +) reste priorité A18, pas A21. Ne pas toucher A15-A20.

A12. La ligne « Objet : » (en-tête de courriel) est EXIGÉE UNIQUEMENT :
   • en REGISTRE FORMEL (demande à une administration, candidature, lettre à un supérieur, TÂCHE 3 ou la consigne précise explicitement « écrivez un courriel FORMEL »),
   • JAMAIS pour un message INFORMEL entre amis ou famille (typique TÂCHE 1). Dans un message comme « Salut Bernard… » adressé à un pote, l'absence de ligne Objet est LA NORME et ne DOIT PAS être mentionnée comme un manque, ni dans Cohérence, ni dans Pertinence. Ne l'invente pas dans la « version corrigée » non plus si la copie originale ne comportait que l'adresse informelle.

TÂCHE {{TACHE_TITRE}} — {{TACHE_TYPE}}. Attendu : {{TACHE_ATTENDU}}
Longueur exigée : {{TACHE_MIN}} à {{TACHE_MAX}} mots. La copie en compte {{NB_MOTS}}.
{{TACHE_PARTIES}}
Plan attendu, à vérifier point par point :
{{TACHE_PLAN}}
Hors des bornes de mots, la tâche peut être évaluée « A1 non atteint » : dis-le sans détour si c'est le cas.

CONSIGNE :
"""{{CONSIGNE}}"""

COPIE :
"""{{COPIE}}"""

BARÈME OFFICIEL TCF CANADA — CINQ CRITÈRES NOTÉS SUR 20 (additionnés → note globale / 100, convertie ensuite en /20) :
1. Grammar & Syntax — Grammaire et Syntax (conjugaison, accord, temps, syntaxe)
2. Vocabulary Range — Gamme Vocabulaire (richesse, précision, registre, absence de répétitions)
3. Coherence & Cohesion — Cohérence et Cohésion (structure, connecteurs, paragraphes, enchaînement logique)
4. Task Completion — Réalisation de la Tâche (respect de la consigne, destinataire, longeur, informations attendues)
5. Style & Register — Style et Registre (formel / neutre / familier approprié, ton, flow naturel)

Faiblesses connues de ce candidat, à traquer en priorité ET VÉRIFIER DEUX FOIS : mélange tu/vous dans un même texte ; accents porteurs de sens (à/a, où/ou) ; élisions (j'espère, d'être) ; contractions (du, au, des, aux) ; calques syntaxiques de l'espagnol (préposition après verbe, subjonctif après « il faut que », « en le » pour « dans le »). Pour chacune, confirme d'abord que la forme originale est BIEN celle que tu notes dans « original ».

FORMAT DE RÉPONSE OBLIGATOIRE — un seul objet JSON, rien d'autre (pas de balises, pas de texte hors JSON, pas de raisonnement affiché, premier caractère = « { »).
⚠ LISTE EXHAUSTIVE DES 24 CLÉS TOP-LEVEL OBLIGATOIRES (APPELLES LES TOUTES EXACTEMENT COMME CI-DESSOUS ; AJOUTER RIEN D'AUTRE) :
{
  "score_100": entier 1..100 OBLIGATOIRE,
  "score_breakdown": {
    "grammaire_syntaxe_20": entier 1..20,
    "gamme_vocabulaire_20": entier 1..20,
    "coherence_cohesion_20": entier 1..20,
    "realisation_tache_20": entier 1..20,
    "style_registre_20": entier 1..20
  },
  "feedback": "Paragraphe général OBLIGATOIRE de 2 à 4 phrases : résumé qualitatif du niveau, ce qui marche, ce qu'il faut améliorer. Exemple : 'Niveau estimé B2 (16/20 = NCLC 8), très bon contrôle global…' Inscrire la conversion note/20 et NCLC selon A11.",
  "note20": entier 1..20 OBLIGATOIRE,
  "cecrl": OBLIGATOIRE "A1"|"A2"|"B1"|"B2"|"C1"|"C2" — JAMAIS de « + », voir A18,
  "verdict": "deux phrases OBLIGATOIRES : 1 phrase sur ce que la copie réussit, 1 phrase sur ce qui la bloque. Vide « » si rien.",
  "longueur_ok": OBLIGATOIRE true/false,
  "criteres": OBLIGATOIRE 5 entrées EXACTEMENT dans cet ordre: [
    {"nom":"Grammaire et syntaxe","note":n/5,"commentaire":"lien avec le score_breakdown"},
    {"nom":"Richesse et précision lexicales","note":n/5,"commentaire":"…"},
    {"nom":"Cohérence et cohésion","note":n/5,"commentaire":"…"},
    {"nom":"Réalisation de la tâche","note":n/5,"commentaire":"…"},
    {"nom":"Style et registre","note":n/5,"commentaire":"…"}
  ],
  "commentaires": OBLIGATOIRE ["string par critère"],
  "erreurs": OBLIGATOIRE tableau 0..8 entrées. SI 0 erreur → [ ] vide. Sinon chaque entrée A 6 SOUS-CLÉS EXACTEMENT : [{"code":"REG|ORT|GR|CONJ|ESP|LEX|COH","gravite":"haute|moyenne|basse","original":"PASSAGE FAUTIF — DOIT EXISTER TEXTUELLEMENT DANS COPIE, SINON NE METS PAS","correction":"version correcte","explication":"la règle en une phrase. Si tu termines par le mot Correct, c'est que tu devrais supprimer l'entrée entière.","es":"la même règle en espagnol, ou « » sinon"}],
  "points_forts": OBLIGATOIRE ["deux à quatre éléments réussis, en français — voir strengths pour la clé canonique anglaise"],
  "corrected_version": OBLIGATOIRE string (copie entière réécrite, corrigée des seules erreurs réelles, lueur naturelle conservée — NE PAS simplifier le niveau, ne PAS transformer en texte de A2 quand le candidat est B2. Garde le message, le ton, les informations. Vide « » si indisponible, mais tu dois renvoyer la clé.),
  "strengths": OBLIGATOIRE ["puces 1–3 réussites du candidat, exemple : 'Description claire et détaillée…' ClÉ CANONIQUE — REMPLIS OBLIGATOIREMENT, même identique à points_forts."],
  "areas_for_improvement": OBLIGATOIRE ["puces 1–3 axes de progression, exemple : 'Faire varier les connecteurs et les structures relatives…' ClÉ CANONIQUE — REMPLIS OBLIGATOIREMENT."],
  "grammar_tips": OBLIGATOIRE [{"regle":"nom de la règle (Accord adjectif pluriel…)", "exemple":"extrait typique avec la règle appliquée", "explication":"explication pédagogique en 1 phrase"}] — minimum 2 entrées ; si vraiment rien, renvoie [ ] VIDE MAIS LA CLÉ DOIT EXISTER,
  "vocabulary_upgrades": OBLIGATOIRE [{"original":"mot ou groupe de la copie", "suggestion":"version plus riche ou nuancée", "explication":"ce que ça apporte (nuance, registre, précision)"}] — minimum 2 entrées ; sinon [ ] vide,
  "example_responses": OBLIGATOIRE EXACTEMENT 3 ENTRÉES DANS CET ORDRE — RIEN D'AUTRE : [
    {"niveau":"B1", "texte":"copie de référence niveau B1 (trame simple, vocabulaire basique, erreurs tolérées)"},
    {"niveau":"B2", "texte":"copie de référence niveau B2 / NCLC 8, cible du candidat"},
    {"niveau":"C1", "texte":"copie de référence niveau C1, tournures subordonnées, connecteurs variés"}
  ],
  "gap_7": OBLIGATOIRE {"atteint": true/false, "manque":["ce qui sépare la copie du NCLC 7"], "actions":["gestes concrets pour la prochaine copie"]},
  "gap_8": OBLIGATOIRE {"atteint": true/false, "manque":["ce qui sépare la copie du NCLC 8"], "actions":["gestes concrets pour la prochaine copie"]}
}

⚠ LISTE DES CLÉS INTERDITES (NE LES ÉCRIS JAMAIS DANS LE JSON, RIEN D'AUTRE QUE LES 24 CI-DESSUS) :
❌ commentaire · commentaire_général · commentaireGlobal · retour · appréciation · general_feedback · overall_comment
❌ points_forts est tolérée en plus MAIS strength DOIT être rempli aussi (canonique). Jamais points_positifs · réussites · qualités · strong_points
❌ axes_amélioration · axes_d_amélioration · points_à_améliorer · améliorations · suggestions · improvements · weaknesses · faiblesses · points_faibles · aspects_à_renforcer · to_improve → renvoie dans areas_for_improvement exclusivement
❌ version_corrigée · corrigée · correction_complète · corrected_text · réponse_corrigée · version_finale · final_corrected → renvoie dans corrected_version exclusivement
❌ conseils_grammaire · grammaire_conseils · astuces_grammaire · tips_grammaire · grammar_advice · astuces_grammaticales → renvoie dans grammar_tips exclusivement
❌ améliorations_vocabulaire · upgrades_vocabulaire · améliorations_lexicales · vocab_améliorer · vocab_suggestions · vocabulary_suggestions → renvoie dans vocabulary_upgrades exclusivement
❌ exemples_réponse · exemples_réponses · modèles_réponse · réponses_exemple · examples → renvoie DANS example_responses exclusivement, avec niveau=B1/B2/C1
Toute information qui aurait dû aller dans une clé FR DOIT être copiée dans la clé EN CANONIQUE correspondante, puis on OUBLIE la clé FR.

CHAMP RECALCULÉ AUTOMATIQUEMENT PAR LE SYSTÈME (tu peux quand même renvoyer) : note20 = arrondi (score_100 * 20 / 100). Les 5 entrées score_breakdown /20 sommées doivent donner score_100. Note : le système écrasera de toute façon cecrl à partir de note20 (pour garantir A18), mais tu DOIS quand même renvoyer cecrl avec la bonne valeur.

Avant d'écrire le JSON final, relis COPIE une dernière fois, puis, POUR CHAQUE entrée de erreurs, confirme : (1) le champ « original » est un sous-ensemble exact de COPIE, (2) l'explication ne se termine pas par « Correct » / « juste » / « OK », (3) le code erreur est dans la bonne catégorie selon A6, (4) la correction ne change pas le sens de la phrase (règle A3 / A8). Si une entrée échoue à l'un de ces quatre tests, TU LA SUPPRIMES.`,
  invite_modele_b2: [
    "Tu es professeur de FLE. Voici la copie d'un candidat hispanophone à la {{TACHE_TITRE}} du TCF Canada ({{TACHE_TYPE}}, {{TACHE_MIN}} à {{TACHE_MAX}} mots).",
    "{{TACHE_PARTIES}}",
    "Plan attendu : {{TACHE_PLAN_CHEVRONS}}",
    "",
    "CONSIGNE : \"\"\"{{CONSIGNE}}\"\"\"",
    "COPIE : \"\"\"{{COPIE}}\"\"\"",
    "",
    "Règle absolue : ne change JAMAIS le sens, le temps (passé / futur / présent programmé) ni l'information. La réécriture amène la copie à B2 solide (vocabulaire, connecteurs, tournures subordonnées), mais LE MESSAGE RESTE LE MÊME. En particulier :",
    "• Présent de l'indicatif pour un futur programmé (je fête samedi, je pars demain) → conserve le présent, c'est correct en français. Pas de j'ai fêté / j'ai parti.",
    "• Formules avec pronom COI (Merci de me confirmer, merci de me tenir informé) → garde le pronom « me », c'est idiomatique.",
    "• Virgule après numéro civique (234, rue X) → garde-la, recommandée OQLF au Canada.",
    "• « h » pour heure, sans point propre, mais phrase terminée par un point → garde tel quel.",
    "",
    "Réponds EXACTEMENT sous cette forme :",
    "=== MODÈLE ===",
    "(texte réécrit)",
    "=== FORMULES ===",
    "- tournure1\\n- tournure2\\n… (6 tournures exactes à réemployer, issues du modèle)",
  ].join("\n"),
};

const ECHANTILLON: { consigne: string; copie: string; tache: 1 | 2 | 3 } = {
  tache: 1,
  consigne:
    "Vous venez de déménager à Québec. Écrivez un courriel (60–120 mots) à votre ancien voisin de Paris pour lui donner de vos nouvelles et l'inviter à venir vous rendre visite l'été prochain.",
  copie:
    "Salut Thomas ! Ca va ? Je t'ecris pour te dire que je suis demenager a Quebec depuis 3 semaines. La ville est tres belle, il y a beaucoup de parc. Je travail dans un petit cafe du Vieux-Québec. Le travail est bien mais c'est un peu difficile parce que je ne comprend pas tous les clients quand il parle vite. Je pense a toi souvent. Tu dois venir me voir en ete prochain. Je te montre la ville et nous aller manger de la poutine. Attend ta reponse. A bientot, Alex.",
};

const esc = (t: unknown) =>
  String(t ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

interface OpenRouterModele {
  id: string;
  name?: string;
  description?: string;
  pricing?: { prompt?: string; completion?: string };
  context_length?: number;
}

export default function PageParametres() {
  const [llm, setLlm] = useState<LLMSettings>(DEFAULT_LLM);
  const [prompts, setPrompts] = useState<PromptsSettings>(DEFAULT_PROMPTS);
  const [modeles, setModeles] = useState<OpenRouterModele[]>([]);
  const [errModeles, setErrModeles] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [enregistre, setEnregistre] = useState<"idle" | "en cours" | "ok" | "err">("idle");

  const [essaiConsigne, setEssaiConsigne] = useState(ECHANTILLON.consigne);
  const [essaiCopie, setEssaiCopie] = useState(ECHANTILLON.copie);
  const [essaiTache, setEssaiTache] = useState<1 | 2 | 3>(ECHANTILLON.tache);
  const [essaiEnCours, setEssaiEnCours] = useState(false);
  const [essaiResultat, setEssaiResultat] = useState<object | null>(null);
  const [essaiErreur, setEssaiErreur] = useState<string | null>(null);

  const tokenEl =
    typeof document !== "undefined"
      ? (document.querySelector("input[data-admin-token]") as HTMLInputElement | null)
      : null;
  const token = tokenEl?.dataset.adminToken || "";

  const authHeaders = useMemo(
    () =>
      ({
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }) as Record<string, string>,
    [token]
  );

  useEffect(() => {
    let alive = true;
    const go = async () => {
      setChargement(true);
      setErrModeles(null);
      try {
        const [rS, rM] = await Promise.all([
          fetch("/api/admin/settings?pw=" + encodeURIComponent(token), {
            headers: { Authorization: "Bearer " + token },
          }),
          fetch("/api/admin/modeles?pw=" + encodeURIComponent(token), {
            headers: { Authorization: "Bearer " + token },
          }),
        ]);
        if (rS.ok && alive) {
          const d = (await rS.json()) as {
            llm_main?: LLMSettings;
            prompts_main?: PromptsSettings;
          };
          if (d.llm_main) setLlm({ ...DEFAULT_LLM, ...d.llm_main });
          if (d.prompts_main)
            setPrompts({ ...DEFAULT_PROMPTS, ...d.prompts_main });
        }
        if (rM.ok && alive) {
          const dm = (await rM.json()) as { modeles?: OpenRouterModele[] };
          const m = dm.modeles || [];
          setModeles(
            m
              .sort((a, b) => (a.id > b.id ? 1 : -1))
              .slice(0, 120)
          );
        } else if (alive) {
          const dm = await rM.json().catch(() => ({}));
          setErrModeles(
            (dm as { erreur?: string }).erreur ||
              "Impossible de charger la liste des modèles."
          );
        }
      } catch (e) {
        if (alive) setErrModeles(String(e));
      } finally {
        if (alive) setChargement(false);
      }
    };
    void go();
    return () => {
      alive = false;
    };
  }, [token]);

  const sauvegarder = async () => {
    setEnregistre("en cours");
    try {
      const r = await fetch(
        "/api/admin/settings?pw=" + encodeURIComponent(token),
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            llm_main: llm,
            prompts_main: prompts,
          }),
        }
      );
      if (!r.ok) throw new Error("Erreur HTTP " + r.status);
      setEnregistre("ok");
      setTimeout(() => setEnregistre("idle"), 1800);
    } catch (e) {
      setEnregistre("err");
      setTimeout(() => setEnregistre("idle"), 2400);
    }
  };

  const lancerEssai = async () => {
    setEssaiEnCours(true);
    setEssaiResultat(null);
    setEssaiErreur(null);
    try {
      const r = await fetch("/api/corriger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tache_num: essaiTache,
          consigne: essaiConsigne,
          copie: essaiCopie,
        }),
      });
      const d = (await r.json()) as CorrectionResult & {
        erreur?: string;
        brut?: string;
        _meta?: object;
      };
      if (!r.ok || d.erreur) {
        throw new Error(
          d.erreur ||
            "Erreur pendant la correction (HTTP " + r.status + ")."
        );
      }
      setEssaiResultat(d);
    } catch (e) {
      setEssaiErreur(e instanceof Error ? e.message : String(e));
    } finally {
      setEssaiEnCours(false);
    }
  };

  const apercuInvite = (modele: string) => {
    const vars: Record<string, string> = {
      TACHE_TITRE: "Tâche " + essaiTache,
      TACHE_MIN: essaiTache === 1 ? "60" : essaiTache === 2 ? "120" : "120",
      TACHE_MAX: essaiTache === 1 ? "120" : essaiTache === 2 ? "150" : "180",
      CONSIGNE: essaiConsigne,
      COPIE: essaiCopie,
    };
    return modele.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (_, k) => vars[k] || "");
  };

  const res = essaiResultat as (CorrectionResult & {
    _meta?: { note_20?: number; nclc?: string; model_used?: string };
  }) | null;

  return (
    <div className="coquille">
      <NavLaterale actif="admin" />
      <main className="contenu-principal">
      {chargement ? (
        <div className="grille">
          <div className="col-gauche">
            <section className="carte visible">
              <div className="charge">
                <span className="spin" />
                Chargement des paramètres et de la liste des modèles OpenRouter…
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div
          className="grille"
          style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.95fr)" }}
        >
          <div className="col-gauche" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <section className="carte">
              <div className="entete-carte">
                <h2>Moteur d'inférence · OpenRouter</h2>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-encre-3)" }}>
                  {modeles.length ? modeles.length + " modèles" : "hors-ligne"}
                </span>
              </div>
              <div className="bloc">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11.5,
                            marginBottom: 6,
                            color: "var(--color-encre-2)",
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                          }}
                        >
                          Modèle LLM OpenRouter — éditable librement
                        </label>
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: 12,
                            color: "var(--color-encre-3)",
                          }}
                        >
                          Tapez n'importe quel identifiant <code style={{ fontFamily: "var(--font-mono)" }}>fournisseur/nom-du-modèle</code> ou choisissez dans la liste. Les modèles <b style={{ color: "#6FD3A9" }}>gratuits / free-tier</b> sont épinglés en haut.
                        </p>
                      </div>
                      <button
                        className="bouton principal"
                        style={{
                          alignSelf: "flex-end",
                          padding: "7px 14px",
                          fontSize: 12.5,
                          opacity:
                            llm.model && llm.model.trim() ? 1 : 0.5,
                        }}
                        disabled={!llm.model || !llm.model.trim()}
                        onClick={async () => {
                          if (!llm.model?.trim()) return;
                          setEnregistre("en cours");
                          try {
                            const r = await fetch(
                              "/api/admin/settings?pw=" +
                                encodeURIComponent(token),
                              {
                                method: "POST",
                                headers: authHeaders,
                                body: JSON.stringify({ llm_main: llm }),
                              }
                            );
                            if (!r.ok) throw new Error("HTTP " + r.status);
                            setEnregistre("ok");
                            setTimeout(() => setEnregistre("idle"), 1600);
                          } catch {
                            setEnregistre("err");
                            setTimeout(() => setEnregistre("idle"), 2000);
                          }
                        }}
                      >
                        💾 Confirmer ce modèle
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "stretch",
                      }}
                    >
                      <input
                        list="modeles-datalist"
                        type="text"
                        spellCheck={false}
                        autoComplete="off"
                        value={llm.model}
                        placeholder="ex. deepseek/deepseek-r1-distill-qwen-32b : free,  nousresearch/hermes-4-orca-llama-3.3-70b : free,  anthropic/claude-sonnet-4,  etc."
                        onChange={(e) =>
                          setLlm({
                            ...llm,
                            model: (e.target.value || "").trim(),
                          })
                        }
                        onBlur={(e) =>
                          setLlm({
                            ...llm,
                            model: (e.target.value || "").trim(),
                          })
                        }
                        style={{
                          flex: "1 1 auto",
                          minWidth: 0,
                          padding: "10px 12px",
                          borderRadius: 9,
                          border:
                            "1px solid " +
                            (llm.model && modeles.length
                              ? modeles.some((m) => m.id === llm.model)
                                ? "#6FD3A9"
                                : "var(--color-grille)"
                              : "var(--color-grille)"),
                          background:
                            "linear-gradient(180deg, rgba(111,211,169,.035), rgba(255,255,255,0))",
                          color: "var(--color-encre)",
                          fontSize: 13,
                          fontFamily: "var(--font-mono)",
                          outline: "none",
                        }}
                      />
                      <datalist id="modeles-datalist">
                        {[
                          "deepseek/deepseek-r1-distill-qwen-32b-free",
                          "deepseek/deepseek-chat-v3-0324-free",
                          "nousresearch/hermes-4-orca-llama-3.3-70b-free",
                          "mattshummer/reflection-llama-3.1-70b-free",
                          "evopulse/evopulse-v3-nous-15b-free",
                          "liquid/lfm-40b",
                          "gryphe/mythomax-l2-13b",
                          "meta-llama/llama-3.1-8b-instruct",
                          "mistralai/mistral-7b-instruct-v0.3",
                          "qwen/qwen2.5-7b-instruct",
                          "cohere/command-a-03-2025",
                          "google/gemini-2.5-flash-preview-04-17",
                        ].map((id) => (
                          <option
                            key={"free-pinned-" + id}
                            value={id}
                            label={"★ FREE · " + id}
                          >
                            ★ FREE · {id}
                          </option>
                        ))}
                        {modeles.map((m) => {
                          const label =
                            (m.pricing &&
                              (Number(m.pricing.prompt) === 0 ||
                                m.pricing.prompt === "0"))
                              ? "★ GRATUIT"
                              : m.context_length
                              ? Math.round(m.context_length / 1000) + "k ctx"
                              : "";
                          return (
                            <option
                              key={m.id}
                              value={m.id}
                              label={
                                (m.name && m.name !== m.id
                                  ? m.name + " · "
                                  : "") +
                                m.id +
                                (label ? " · " + label : "")
                              }
                            >
                              {m.id}
                              {m.name && m.name !== m.id ? " · " + m.name : ""}
                              {label ? " · " + label : ""}
                            </option>
                          );
                        })}
                        {!modeles.length && !errModeles && llm.model && (
                          <option value={llm.model}>
                            {llm.model} (enregistré)
                          </option>
                        )}
                      </datalist>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginTop: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11.5,
                          color:
                            llm.model &&
                            modeles.length &&
                            modeles.some((m) => m.id === llm.model)
                              ? "#6FD3A9"
                              : "var(--color-encre-3)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {modeles.length
                          ? llm.model
                            ? modeles.some((m) => m.id === llm.model)
                              ? "✓ Modèle trouvé dans la liste OpenRouter"
                              : "⚠ Identifiant libre — il sera envoyé tel quel à OpenRouter (utile pour free tiers non listés ou nouveautés)"
                            : "Suggérés ci-dessus : gratuits en haut, puis tous les " +
                              modeles.length +
                              " disponibles"
                          : errModeles
                          ? "Liste indisponible — saisissez un identifiant à la main."
                          : "Chargement…"}
                      </div>
                      <button
                        className="bouton clair"
                        style={{ padding: "4px 10px", fontSize: 11.5 }}
                        onClick={async () => {
                          setErrModeles(null);
                          setChargement(true);
                          try {
                            const rM = await fetch(
                              "/api/admin/modeles?pw=" +
                                encodeURIComponent(token),
                              {
                                headers: {
                                  Authorization: "Bearer " + token,
                                },
                              }
                            );
                            if (rM.ok) {
                              const dm = (await rM.json()) as {
                                modeles?: OpenRouterModele[];
                              };
                              setModeles(
                                ((dm.modeles || []) as OpenRouterModele[])
                                  .sort((a, b) =>
                                    a.id > b.id ? 1 : -1
                                  )
                                  .slice(0, 120)
                              );
                            } else {
                              setErrModeles(
                                "Impossible de recharger la liste."
                              );
                            }
                          } catch (e) {
                            setErrModeles(String(e));
                          } finally {
                            setChargement(false);
                          }
                        }}
                      >
                        ↻ Recharger la liste
                      </button>
                    </div>
                    {errModeles && (
                      <p
                        style={{
                          color: "#EFC97E",
                          fontSize: 12,
                          margin: "8px 0 0",
                        }}
                      >
                        {esc(errModeles)} · Pas de panique : vous pouvez
                        quand même saisir le modèle à la main dans le champ
                        ci-dessus et cliquer sur <b>Confirmer ce modèle</b>.
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 11.5,
                        marginBottom: 6,
                        color: "var(--color-encre-2)",
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Température · {llm.temperature.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={llm.temperature}
                      onChange={(e) =>
                        setLlm({
                          ...llm,
                          temperature: Number(e.target.value),
                        })
                      }
                      style={{ width: "100%", accentColor: "var(--color-bleu)" }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 11.5,
                        marginBottom: 6,
                        color: "var(--color-encre-2)",
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                      }}
                    >
                      max_tokens
                    </label>
                    <input
                      type="number"
                      min={256}
                      max={32768}
                      step={64}
                      value={llm.max_tokens}
                      onChange={(e) =>
                        setLlm({
                          ...llm,
                          max_tokens: Math.max(256, Number(e.target.value) || 0),
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 9,
                        border: "1px solid var(--color-grille)",
                        background: "var(--color-fond)",
                        color: "var(--color-encre)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 12px",
                    border: "1px dashed var(--color-grille)",
                    borderRadius: 10,
                    fontSize: 12.5,
                    color: "var(--color-encre-2)",
                  }}
                >
                  <b style={{ color: "var(--color-encre)" }}>Variables disponibles</b> · à utiliser sous la forme <code style={{ fontFamily: "var(--font-mono)", background: "rgba(255,255,255,.06)", padding: "1px 5px", borderRadius: 4 }}>{`{{TACHE_TITRE}}`}</code> :
                  <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.8 }}>
                    <code style={{ color: "#EFC97E" }}>TACHE_TITRE</code>,{" "}
                    <code style={{ color: "#EFC97E" }}>TACHE_MIN</code>,{" "}
                    <code style={{ color: "#EFC97E" }}>TACHE_MAX</code>,{" "}
                    <code style={{ color: "#EFC97E" }}>CONSIGNE</code>,{" "}
                    <code style={{ color: "#EFC97E" }}>COPIE</code>
                  </div>
                </div>
              </div>
            </section>

            <section className="carte">
              <div className="entete-carte">
                <h2>Prompt · correction officielle TCF</h2>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-encre-3)" }}>
                  {prompts.invite_correction.split(/\s+/).length} tokens bruts
                </span>
              </div>
              <div className="bloc" style={{ paddingTop: 6 }}>
                <textarea
                  value={prompts.invite_correction}
                  onChange={(e) =>
                    setPrompts({ ...prompts, invite_correction: e.target.value })
                  }
                  spellCheck={false}
                  style={{
                    width: "100%",
                    minHeight: 300,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--color-grille)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0))",
                    color: "var(--color-encre)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    resize: "vertical",
                  }}
                />
                <details style={{ marginTop: 10, fontSize: 12, color: "var(--color-encre-2)" }}>
                  <summary style={{ cursor: "pointer" }}>Aperçu avec l'échantillon actuel</summary>
                  <pre
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid var(--color-grille)",
                      fontSize: 11.5,
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "pre-wrap",
                      maxHeight: 220,
                      overflow: "auto",
                      background: "rgba(255,255,255,.02)",
                    }}
                  >
                    {esc(apercuInvite(prompts.invite_correction))}
                  </pre>
                </details>
              </div>
            </section>

            <section className="carte">
              <div className="entete-carte">
                <h2>Prompt · réécriture B2 (modèle)</h2>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-encre-3)" }}>
                  {prompts.invite_modele_b2.split(/\s+/).length} tokens bruts
                </span>
              </div>
              <div className="bloc" style={{ paddingTop: 6 }}>
                <textarea
                  value={prompts.invite_modele_b2}
                  onChange={(e) =>
                    setPrompts({ ...prompts, invite_modele_b2: e.target.value })
                  }
                  spellCheck={false}
                  style={{
                    width: "100%",
                    minHeight: 220,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--color-grille)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0))",
                    color: "var(--color-encre)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    resize: "vertical",
                  }}
                />
                <details style={{ marginTop: 10, fontSize: 12, color: "var(--color-encre-2)" }}>
                  <summary style={{ cursor: "pointer" }}>Aperçu avec l'échantillon actuel</summary>
                  <pre
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid var(--color-grille)",
                      fontSize: 11.5,
                      fontFamily: "var(--font-mono)",
                      whiteSpace: "pre-wrap",
                      maxHeight: 200,
                      overflow: "auto",
                      background: "rgba(255,255,255,.02)",
                    }}
                  >
                    {esc(apercuInvite(prompts.invite_modele_b2))}
                  </pre>
                </details>
              </div>
            </section>

            <div
              style={{
                position: "sticky",
                bottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                background:
                  "linear-gradient(180deg, rgba(18,22,28,.4), rgba(18,22,28,.92))",
                border: "1px solid var(--color-grille)",
                borderRadius: 12,
                backdropFilter: "blur(6px)",
              }}
            >
              <span style={{ fontSize: 12.5, color: "var(--color-encre-2)" }}>
                Les modifications seront utilisées immédiatement par <code style={{ fontFamily: "var(--font-mono)" }}>/api/corriger</code> et <code style={{ fontFamily: "var(--font-mono)" }}>/api/modele-b2</code>.
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="bouton"
                  onClick={() => {
                    setLlm(DEFAULT_LLM);
                    setPrompts(DEFAULT_PROMPTS);
                  }}
                >
                  Réinitialiser
                </button>
                <button
                  className={"bouton principal" + (enregistre === "ok" ? " principal" : "")}
                  onClick={() => void sauvegarder()}
                  disabled={enregistre === "en cours"}
                  style={{
                    boxShadow:
                      enregistre === "ok"
                        ? "0 0 0 2px #6FD3A9 inset"
                        : enregistre === "err"
                        ? "0 0 0 2px #F2A0AF inset"
                        : undefined,
                  }}
                >
                  {enregistre === "en cours"
                    ? "Enregistrement…"
                    : enregistre === "ok"
                    ? "✓ Enregistré"
                    : enregistre === "err"
                    ? "Échec — réessayer"
                    : "Enregistrer les modifications"}
                </button>
              </div>
            </div>
          </div>

          <div className="col-droite" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <section className="carte sombre">
              <div className="entete-carte">
                <h2>Simulation d'essai</h2>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-marge)" }}>
                  teste les prompts &amp; le modèle ACTUELS (enregistrés)
                </span>
              </div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      className={"tache" + (essaiTache === n ? "" : "")}
                      aria-pressed={essaiTache === (n as 1 | 2 | 3)}
                      onClick={() => setEssaiTache(n as 1 | 2 | 3)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border:
                          "1px solid " +
                          (essaiTache === n
                            ? "var(--color-bleu)"
                            : "var(--color-grille)"),
                        background:
                          essaiTache === n
                            ? "rgba(88,140,240,.12)"
                            : "transparent",
                        color: "var(--color-encre)",
                        fontSize: 13,
                      }}
                    >
                      Tâche {n}
                    </button>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-encre-3)" }}>
                    Consigne
                  </label>
                  <textarea
                    value={essaiConsigne}
                    onChange={(e) => setEssaiConsigne(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--color-grille)",
                      background: "rgba(255,255,255,.02)",
                      color: "var(--color-encre)",
                      fontSize: 13,
                      lineHeight: 1.5,
                      resize: "vertical",
                    }}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <label style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-encre-3)" }}>
                      Copie
                    </label>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-encre-3)" }}>
                      {motsDe(essaiCopie)} mots
                    </span>
                  </div>
                  <textarea
                    value={essaiCopie}
                    onChange={(e) => setEssaiCopie(e.target.value)}
                    rows={10}
                    spellCheck={false}
                    style={{
                      width: "100%",
                      marginTop: 4,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--color-grille)",
                      background:
                        "repeating-linear-gradient(180deg, rgba(255,255,255,.02) 0 31px, rgba(255,255,255,.03) 31px 32px)",
                      color: "var(--color-encre)",
                      fontFamily: "var(--font-serif)",
                      fontSize: 15,
                      lineHeight: "32px",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="bouton principal"
                    onClick={() => void lancerEssai()}
                    disabled={essaiEnCours || !essaiCopie.trim()}
                  >
                    {essaiEnCours ? (
                      <>
                        <span className="spin" style={{ marginRight: 8 }} />
                        Correction en cours…
                      </>
                    ) : (
                      "▶ Lancer la correction"
                    )}
                  </button>
                  <button
                    className="bouton clair"
                    onClick={() => {
                      setEssaiTache(ECHANTILLON.tache);
                      setEssaiConsigne(ECHANTILLON.consigne);
                      setEssaiCopie(ECHANTILLON.copie);
                    }}
                  >
                    Remettre l'échantillon
                  </button>
                </div>
                {essaiErreur && (
                  <div
                    style={{
                      padding: "10px 12px",
                      border: "1px solid #F2A0AF",
                      background: "rgba(242,160,175,.08)",
                      color: "#F2A0AF",
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  >
                    {esc(essaiErreur)}
                  </div>
                )}
                {res && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: 14,
                      border: "1px solid var(--color-grille)",
                      borderRadius: 12,
                      background: "rgba(255,255,255,.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                      <div className="note-grande">
                        <div className="val">
                          {res.note20 ?? 0}
                          <small>/20</small>
                        </div>
                        <div className="lbl">note TCF</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "2px 12px", fontSize: 12.5 }}>
                        <span style={{ color: "var(--color-encre-3)" }}>CECRL</span>
                        <b style={{ fontFamily: "var(--font-mono)" }}>{CECRL(Math.max(0, Math.min(20, Math.round(res.note20 ?? 0))))}</b>
                        <span style={{ color: "var(--color-encre-3)" }}>NCLC</span>
                        <b style={{ fontFamily: "var(--font-mono)", color: (res.note20 ?? 0) >= 12 ? "#6FD3A9" : "inherit" }}>
                          {esc(res._meta?.nclc || "—")}
                        </b>
                        <span style={{ color: "var(--color-encre-3)" }}>Modèle</span>
                        <b style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                          {esc(res._meta?.model_used || "—")}
                        </b>
                        <span style={{ color: "var(--color-encre-3)" }}>Erreurs</span>
                        <b style={{ fontFamily: "var(--font-mono)" }}>{(res.erreurs || []).length}</b>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 10 }}>
                      {(res.criteres || []).map((c, i) => {
                        const pct = Math.max(0, Math.min(100, ((c.note || 0) / 5) * 100));
                        const cl = c.note >= 4 ? "#6FD3A9" : c.note >= 3 ? "#EFC97E" : "#F2A0AF";
                        return (
                          <div
                            key={i}
                            style={{
                              border: "1px solid var(--color-grille)",
                              borderRadius: 8,
                              padding: "4px 6px",
                              fontSize: 10.5,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", color: "var(--color-encre-2)" }}>
                              <span>{esc((c.nom || "").split(" ")[0])}</span>
                              <b style={{ color: cl }}>{c.note ?? 0}/5</b>
                            </div>
                            <div style={{ marginTop: 3, height: 3, background: "rgba(255,255,255,.08)", borderRadius: 999, overflow: "hidden" }}>
                              <i style={{ display: "block", height: "100%", width: pct + "%", background: cl }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <details style={{ fontSize: 12 }}>
                      <summary style={{ cursor: "pointer", color: "var(--color-encre-2)" }}>
                        Réponse JSON brute
                      </summary>
                      <pre
                        style={{
                          marginTop: 8,
                          padding: 10,
                          borderRadius: 8,
                          background: "rgba(0,0,0,.25)",
                          border: "1px solid var(--color-grille)",
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          whiteSpace: "pre-wrap",
                          maxHeight: 260,
                          overflow: "auto",
                        }}
                      >
                        {esc(JSON.stringify(res, null, 2))}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
