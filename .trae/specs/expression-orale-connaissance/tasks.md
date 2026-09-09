# Tâches — Extension Base Connaissances — Expression Orale (EO)

*Parent spec: `./spec.md`

Dépendances (ordre DAG): T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9.
Tous les TR sont soit `rule` soit `rubric`.

---

## Tâche 1 — Migration 008 : Schema multi-compétences `base_connaissances_tcf`

**Objectif** : Ajouter colonne `competence_code` FK + étendre CHECK `tache_num` + index composite + insert competence 'EO' si abs.

### Modifications cibles
- Nouveau fichier : `supabase/migrations/008_bc_multi_competence.sql`

### TR
| ID | Type | Énoncé | Preuve
|----|------|--------|--------|
| T1-TR1 | rule | Colonne `competence_code TEXT` ajoutée IF NOT EXISTS, DEFAULT `'EE'`, FK REFERENCES `competences(code)` ON DELETE RESTRICT, constraint IF NOT EXISTS | `\d base_connaissances_tcf` Postgres MCP retourne colonne + contraint FK |
| T1-TR2 | rule | CHECK `tache_num IN (0,1,2,3)` — ancien 1-3 étendu à 0 via DROP CONSTRAINT IF EXISTS + ADD IF NOT EXISTS | Postgres tache_num=0 insert OK |
| T1-TR3 | rule | Index `idx_bc_comp_tache_ordre (competence_code, tache_num, ordre)` IF NOT EXISTS ; DROP IF EXISTS vieux `idx_bc_tache_ordre` (optionnel si plus utilisé : plus précis composite) | `\di` Postgres listes index nouveau |
| T1-TR4 | rule | `INSERT IF NOT EXISTS competences(code, nom) VALUES ('EO','Expression Orale','B2',8,TRUE)` → row existe | Supabase select count(code='EO')=1 |
| T1-TR5 | rule | Migration appliquée 2× exit 0 | MCP apply exit 0 success deux runs |

### Blocage démo (DAG)
Aucun (premier DAG).

---

## Tâche 2 — Migration 009 : SEED 21+ blocs EO idempotent

**Objectif** : 21 blocs EO basés sur texte exact des 4 images PDF uploadées. DELETE WHERE slug LIKE 'eo-%' → INSERT dollar-quoted `$bc$`.

### Modifications cibles
- Nouveau fichier : `supabase/migrations/009_bc_seed_expression_orale.sql`

### Blocs obligatoires (21 minimum)
ordre global EO = 100+num bloc suivant pour éviter collision EE 1-12 :
| slug | tache_num | bloc_type | Compet | titre
|---|---|---|---|---|
| eo-objectif | 0 | objectif | EO | Objectif Expression Orale TCF Canada (3 épreuves : image / dialogue / débat)
| eo-t2-schema | 2 | squelette | EO | Schéma Tâche 2 · Jeu de rôle — salutation / 4-5 échanges / approfondissement / conclusion
| eo-t2-scenario-installation | 2 | exemple | EO | Scénario #1 installation ville — logement/démarches/transports/commerces/loisirs
| eo-t2-scenario-sante | 2 | exemple | EO | Scénario #2 tomber malade pays — médecins/hôpitaux/urgences
| eo-t2-scenario-nouvelan | 2 | exemple | EO | Scénario #3 Nouvel An Canada — célébrations/lieux/plats/activités
| eo-t2-scenario-emploi | 2 | exemple | EO | Scénario #4 travailler été Canada — régions/activités/salaires
| eo-t2-scenario-vegetarien | 2 | exemple | EO | Scénario #5 végétarien Canada — restaurants/achats/variété/prix
| eo-t2-scenario-fete-ecole | 2 | exemple | EO | Scénario #6 fête école — horaires/programme/animations
| eo-t2-scenario-logement | 2 | exemple | EO | Scénario #7 louer logement — offres/prix/quartiers
| eo-t2-corrections-installation | 2 | checklist | EO | Corrections 10 questions type · installation ville (1-10 numérotées image 1)
| eo-t2-corrections-sante | 2 | checklist | EO | Corrections 10 questions type · santé (1-10 image 1 2e liste)
| eo-t3-objectif-schema | 3 | squelette | EO | Schéma Tâche 3 · Débat — Annonce → Thèse → 2 arguments → Nuance → Conclusion
| eo-t3-sujet-telephone | 3 | exemple | EO | Sujet #1 · changer souvent téléphone portable
| eo-t3-sujet-autorite | 3 | exemple | EO | Sujet #2 · autorité éduquer enfant
| eo-t3-sujet-immigres | 3 | exemple | EO | Sujet #3 · immigrés connaître pays accueil
| eo-t3-sujet-animaux | 3 | exemple | EO | Sujet #4 · protéger animaux danger
| eo-t3-sujet-bonheur-travail | 3 | exemple | EO | Sujet #5 · heureux au travail
| eo-t3-sujet-lecture | 3 | exemple | EO | Sujet #6 · lire perte de temps
| eo-t3-sujet-vie-seule | 3 | exemple | EO | Sujet #7 · heureux vie seul
| eo-t3-sujet-manger-equilibre | 3 | exemple | EO | Sujet #8 · manger équilibré + **texte intégral 7 paragraphes (image 2 650mots)**
| eo-connecteurs-oraux | 3 | connecteurs | EO | 30 connecteurs oraux organisés (18 EE base + 12 oral spontané hésitations)

### TR
| ID | Type | Énoncé | Preuve |
|----|------|--------|--------|
| T2-TR1 | rule | DELETE+INSERT 21 blocs EO ; GET /api/connaissance?competence=EO → len ≥21 | MCP SELECT COUNT(*) competence='EO' =21 |
| T2-TR2 | rule | 12 slugs EE seed 007 intactes (competence_code='EE') | MCP SELECT COUNT competence='EE'=12 |
| T2-TR3 | rule | Deux runs consécutifs seed 009 → COUNT eo-% = 21 (DELETE garantit idempotence) | MCP apply 2× exit 0 COUNT constant |
| T2-TR4 | rule | Apostrophes natives (pas `J\'espère`) via $bc$ dollar-quoting) | apply exit 0 0 warning syntax |
| T2-TR5 | rule | `eo-t3-sujet-manger-equilibre.contenu_markdown` 7 paras 650 mots | MCP select length >5500 chars |

### Dépendances DAG
T1 (nécessite colonne competence_code).

---

## Tâche 3 — `GET /api/connaissance` — filtre `competence=EE|EO`
**Modifs** : `app/api/connaissance/route.ts`

### TR
| ID | Type | Énoncé | Preuve |
|----|------|--------|--------|
| T3-TR1 | rule | param `competence` default `'EE'` si absent. Regex `^(EE\|EO)$` sinon 400 `{erreur:'competence invalide'}` | curl ?competence=XX HTTP 400 |
| T3-TR2 | rule | Query Supabase `.eq('competence_code', competence).eq('tache_num',tache)`. Si pas tache → omis | curl len /api/connaissance (sans param)=12 ; ?competence=EO len=21 |
| T3-TR3 | rule | TS `BlocConnaissance` champ `competence_code: 'EE'\|'EO'` optionnel | tsc strict OK |
| T3-TR4 | rule | Sanitizer regex 5 patterns, cache s-maxage 60s, success rows | grep credentials → 0 |
| T3-TR5 | rule | build Next route ƒ /api/connaissance présente | `npm run build` route list count +0 |

### Dépendances DAG
T1 + T2 (seed insérés).

---

## Tâche 4 — Helpers `lib/heuristiques/taches.ts` + nouveau `CONNECTEURS_ORAUX_GROUPE`
**Modifs** : `lib/heuristiques/taches.ts`

- Ajouter `export const CONNECTEURS_ORAUX_GROUPE: Record<string, string[]>` 6 cat.
- 5 cats × 3 = 15 (reuse 18 EE) + 1 cat HÉSITATION × 12 = 30 total.

### TR
| ID | Type | Énoncé | Preuve |
|----|------|--------|--------|
| T4-TR1 | rule | `Object.keys(CONNECTEURS_ORAUX_GROUPE).length===6` | tsc node assert exit0 |
| T4-TR2 | rule | Total flatten unique Set.size===30 | `new Set(flat).size===30` |
| T4-TR3 | rule | 0 régression EE : `TACHES[3].formules.length=18, CONNECTEURS_T3_GROUPE keys 6` (inchangés) | grep longueur |
| T4-TR4 | rule | `checklistOfficielleT1 / checklistOfficielleT3` exports inchangés (PanneauLive EE 0 régression) | node import exit0 |

### Dépendances DAG
Aucune (modif fichier existant).

---

## Tâche 5 — Injection Prompt A22 (Référentiel EO)
**Modifs** : `lib/llm/prompts.ts` + `app/admin/parametres/page.tsx` (byte-for-byte sync).

Position exacte : JUSTE APRÈS A21 (L160) ET JUSTE AVANT A12 (origine L162) → ordre : A15…A20 → A21 (EE KB) → A22 (EO KB) → A12 (ligne objet).

Contenu A22 ~20 lignes : objectifs Tâche 2 conversation (7 scénarios) + Tâche 3 débat (8 sujets Sept 2026) + note "ignorer cette section si l'épreuve est EE (Expression Écrite), seulement prendre en compte si EO".

### TR
| ID | Type | Énoncé | Preuve |
|----|------|--------|--------|
| T5-TR1 | rule | Ordre exact : A20 → (newline → A21 → newline → A22 → newline → A12 (aucun A15-A20 supprimé/réordonné) | grep lignes ordre |
| T5-TR2 | rule | prompts.ts A22 byte-for-byte === admin/parametres A22 (diff whitespace 0) | `diff <(sed) <(sed) exit 0` |
| T5-TR3 | rule | A15-A20 blacklist 24 clés intactes | grep outputs même |
| T5-TR4 | rule | tsc strict exit0 + build 0 erreurs | tsc exit0 |

### Dépendances DAG
Aucune (modifications prompts).

---

## Tâche 6 — `BaseConnaissanceSidebar.tsx` props competence=EE/EO

**Modifs** : `components/expression-ecrite/BaseConnaissanceSidebar.tsx`

### Changements
- Props ajoutés : `competence?: 'EE' \| 'EO'` défaut `'EE'`.
- Fetch URL `/api/connaissance?competence=${competence}&tache=${t}`.
- Si `competence === 'EE'` → rendu IDENTIQUE (tâche 1 / 3 onglets T3) → garantit NF7.
- Si `competence === 'EO'` :
  - Tache=2 → onglets (role="tablist") : 7 scénarios cliquables + onglet Corrections 1&2
  - Tache=3 → onglets : Sujet1-8 · Schéma · Connecteurs Oraux (30 grille)
  - Couleur cadre scenarios T2 : `background: rgba(60,207,145,.06)`, 1px solid rgba(60,207,145,.2).
  - Exemple 7 paragraphes manger équilibre : `max-height:320px; overflow-y:auto;`

### TR
| ID | Type | Énoncé | Preuve |
|----|------|--------|--------|
| T6-TR1 | rule | `competence` absent → même HTML length ~= build avant (PanneauLive inject checklist) | tsc exit0 |
| T6-TR2 | rule | 7 onglets T2 3 onglets Corrections | aria-selected=1 affichés |
| T6-TR3 | rule | Sujet manger équilibré rendu scroll | HTML render innerHTML taille >6000 caractères |
| T6-TR4 | rule | Onglet Connecteurs Oraux × 30 grille 6×5 | Object.keys.length=6 |
| T6-TR5 | rule | Palette papier | Vert pâle scenarios T2 | CSS rgba(60,207,145,.06) |
| T6-TR6 | rubric 0-2 ≥1.5 | Ergonomie onglets responsive mobile <768px | snapshot visuel OK |

### Dépendances DAG
T3 + T4.

---

## Tâche 7 — NavLaterale section 🎙 Expression Orale

**Modifs** : `components/NavLaterale.tsx`

- Ajout 3 items après section 🖋 Expression Écrite (avec séparateur `<hr/>` puis H3-like `<div className="marque-laterale"`) puis 2 sous-liens :
  - `└ 📚 Base EO Fiches` → href="/expression-orale?tab=connaissance
  - `└ 💬 Tous les sujets oraux` → href="/expression-orale?tab=sujets
- routeActive match sur `/expression-orale`.

### TR
| ID | Type | Énoncé | Preuve |
|----|------|--------|--------|
| T7-TR1 | rule | 2 nouveaux sous-liens EO affichés aria-current | snapshot HTML |
| T7-TR2 | rule | routeActive="/expression-orale" → aria-current=page sur les 2 | click nav |
| T7-TR3 | rule | Marque latérale Affiche "🎙 Expression Orale" puis NCLC 8 | texte présent |

### Dépendances DAG
Aucune.

---

## Tâche 8 — Page `/expression-orale` placeholder consultatif

**Nouveau** : `app/expression-orale/page.tsx`

Layout 2 colonnes (md: grid-cols-[1fr_minmax(0,480px)] :
- Col gauche : PanneauIntro 3 cartes → Objectif (3 épreuves Tâche1/Tâche2/Tâche3 + durées ~). Pas d'éditeur texte, pas de corriger bouton.
- Col droite : `<BaseConnaissanceSidebar competence="EO" tache=2 ouvert={kbOuvert} onToggle={…} className="lg:!fixed lg:right-6 lg:top-24 lg:bottom-6 lg:w-[480px] z-40"`.
- State `kbOuvert` + useEffect `?tab=connaissance` → true.

### TR
| ID | Type | Énoncé | Preuve |
|----|------|--------|--------|
| T8-TR1 | rule | `ƒ /expression-orale` apparaît dans `npm run build` routes | Next list |
| T8-TR2 | rule | sidebar affiche 7 scenarios Tâche2 onglets 1-7 + manger equilibre | screenshot |
| T8-TR3 | rule | 0 éditeur Seyes, 0 bouton corriger, 0 PanneauLive | JSX tree inspect 0 présence composants |
| T8-TR4 | rule | URL param `?tab=connaissance` → sidebar accordéon auto-open | aria-expanded=true |

### Dépendances DAG
T6 + T7.

---

## Tâche 9 — Qualité, Build, Vérifications

**But** : 00 NF3, TS strict, build Next green, audits.

### TR
| ID | Type | Énoncé | Preuve |
|----|------|--------|--------|
| T9-TR1 | rule | `npx tsc --noEmit` exit 0 strict mode | terminal exit 0 |
| T9-TR2 | rule | `npm run build` 25 routes Next (11 static + 14 ƒ), contient `ƒ /expression-orale` + `ƒ /api/connaissance` | build output |
| T9-TR3 | rule | `git diff --cached package.json dependencies` → 0 `+` lignes ; `npm ls react-markdown remark-gfm marked` → exit 1 | terminal |
| T9-TR4 | rule | Supabase MCP apply 008 + 009 apply 2e run exit 0 0 erreurs | MCP status |
| T9-TR5 | rule | Smoke curls : `?competence=EO` len≥21 ; `?competence=EO&tache=2` len≥9 ; `?competence=EO&tache=3` len≥10 ; `?competence=XX` HTTP 400 ; sans competence len=12 ; credentials 10× grep 0 → ALL OK | curl suite exit0 |
| T9-TR6 | rule | A22 ordre + 1400+ bytes identiques prompts.ts vs admin | `diff` exit 0 |
| T9-TR7 | rule | NavLaterale + page orale 0 erreur 404 | curl HTTP 200 |
| T9-TR8 | rubric 0-2 seuil=2 | Rétrocompat EE 100% — page /expression-ecrite PanneauLive + Sidebar EE 0 changements visuels | diff HTML avant/après |

### Dépendances DAG
Toutes T1..T8.

---

## Tâche 10 — Commit + Push + Audit deploy key 0

**But**: commit message `feat(base-connaissance-orale):` + push origin main + deploy keys count=0.**

### TR
| ID | Type | Énoncé | Preuve |
|----|------|--------|--------|
| T10-TR1 | rule | commit 2 nouveaux fichiers SQL 008 009 + 1 nouvelle page + 4 fichiers modifiés taches/prompts/admin/sidebar/nav/route | `git status --short 11 fichiers modifiés total |
| T10-TR2 | rule | push origin main fast-forward | git push To github |
| T10-TR3 | rule | 0 .github_deploy_keys commités | grep .gitignore exclut → count 0 |
| T10-TR4 | rubric 0-2 seuil ≥ 1.5 | Workflow fidelity Spec Mode 5 phases respectées | spec.md + tasks.md + Review à venir |

### Dépendances DAG
T9.

---

## Matrice de couverture AC → Tâches
| AC  | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 |
|---|---|---|---|---|---|---|---|---|---|---|
| AC-R1 migrations 2x exit0 | ✔ | ✔ | | | | | | | ✔ | |
| AC-R2 curl EO lengths | | | ✔ | | | | | | ✔ | |
| AC-R3 retro EE | | | ✔ | | | | | | ✔ | |
| AC-R4 tsc+build | | | | | | | | | ✔ | |
| AC-R5 0 deps | | | | | | | | | ✔ | |
| AC-R6 credentials 0 | | | ✔ | | | | | | ✔ | |
| AC-R7 slug unique + FK | ✔ | ✔ | | | | | | | ✔ | |
| AC-R8 sidebar retro EE | | | | | | ✔ | | | ✔ | |
| AC-R9 nav 2 liens | | | | | | | ✔ | | ✔ | |
| AC-R10 A22 ordre | | | | | ✔ | | | | ✔ | |
| AC-U1 palette | | | | | | ✔ | | | ✔ | |
| AC-U2 ergonomie | | | | | | ✔ | | ✔ | ✔ | |
| AC-U3 retro EE=2 | | | | | | ✔ | | | ✔ | |
