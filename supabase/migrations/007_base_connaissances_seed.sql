-- =====================================================================
-- 007_base_connaissances_seed.sql
-- Seed 12 blocs (6 T1 · 6 T3) exactement comme les 5 fiches PDF TCF Canada
-- Idempotent : DELETE par slug avant INSERT (pas de doublons au 2e run).
-- Dollar-quoting $bc$ utilisé pour éviter l'échappement des apostrophes
-- dans le contenu markdown (J'espère, Je t'écris, etc.)
-- =====================================================================

-- ---------------------------------------------------------------------
-- TÂCHE 1 — 6 blocs (ordres 1 à 6)
-- ---------------------------------------------------------------------

DELETE FROM base_connaissances_tcf WHERE slug = 't1-objectif';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (1, 't1-objectif', 'objectif',
  $bc$Tâche 1 · Message, courriel ou annonce · 60-120 mots$bc$,
  $bc$Rédiger un message à un ou plusieurs destinataires dont le statut est précisé dans la consigne : décrire, raconter et/ou expliquer.$bc$,
  $bc$## Objectif Tâche 1

- **Type** : Message, courriel ou annonce
- **Longueur** : **60 à 120 mots**
- **Durée** : 15 minutes
- **Registre** : Amical (proche / famille) OU Formel (administration / professionnel)
- **Attendu** : Décrire · Raconter · Expliquer$bc$,
  1, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't1-squelette-amical';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (1, 't1-squelette-amical', 'squelette',
  $bc$Amical · Début / Milieu / Fin$bc$,
  $bc$Squelette apprendre par cœur · registre informel (amis, famille, collègues proches).$bc$,
  $bc$## Squelette AMICAL · 6 cases

| PARTIE | CE QUE TU ÉCRIS |
|---|---|
| **AMICAL · DÉBUT** | Salut [Prénom], |
| | J'espère que tu vas bien. Je t'écris pour **[inviter / raconter / proposer / informer]**… |
| **AMICAL · MILIEU** | D'abord,… Ensuite,… De plus,… |
| **AMICAL · FIN** | Dis-moi si tu es disponible / ce que tu en penses. |
| | À bientôt, [Prénom] |$bc$,
  2, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't1-squelette-formel';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (1, 't1-squelette-formel', 'squelette',
  $bc$Formel · Début / Questions / Fin$bc$,
  $bc$Squelette apprendre par cœur · registre formel (Madame / Monsieur, administration, employeur).$bc$,
  $bc$## Squelette FORMEL · 6 cases

| PARTIE | CE QUE TU ÉCRIS |
|---|---|
| **FORMEL · DÉBUT** | Bonjour Madame, Monsieur, |
| | Je vous écris afin de… |
| **FORMEL · QUESTIONS** | Pourriez-vous m'indiquer… ? |
| | Je souhaiterais également savoir si… ? |
| **FORMEL · FIN** | Je vous remercie par avance pour votre réponse. |
| | Cordialement, [Nom Prénom] |$bc$,
  3, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't1-connecteurs-minimum';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (1, 't1-connecteurs-minimum', 'connecteurs',
  $bc$Connecteurs minimum (4 obligatoires)$bc$,
  $bc$Séquence à utiliser systématiquement pour structurer le milieu du message.$bc$,
  $bc$## Les connecteurs minimum

> Séquence **obligatoire** · 4 mots :

```
D'abord  →  Ensuite  →  De plus  →  Enfin
```

1.  **D'abord** : premier point
2.  **Ensuite** : deuxième point (ou étape)
3.  **De plus** : ajoute un détail concret
4.  **Enfin** : dernier élément (ou formule avant conclusion)$bc$,
  4, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't1-exemples-salutations';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (1, 't1-exemples-salutations', 'exemple',
  $bc$Exemples de salutations Amical vs Formel$bc$,
  $bc$Phrases type à ne plus réfléchir, à placer directement.$bc$,
  $bc$## Exemples · formules de début / milieu / fin

### Formules prêtes (T1)

-   Début amical :
    -   *Salut Ayoub, comment vas-tu ?*
    -   *Courage Léa, ça fait un bail !*
-   Début formel :
    -   *Bonjour Madame Tremblay,*
    -   *Bonjour Monsieur le Directeur,*
-   But du message :
    -   *Je t'écris pour te dire que…*
    -   *Je vous écris afin de vous informer que…*
-   Attente concrète :
    -   *J'aimerais que tu me recommandes quelques endroits.*
    -   *Pourriez-vous m'indiquer la date limite ?*
-   Fin amical :
    -   *À bientôt, · Porte-toi bien, · Amicalement,*
-   Fin formel :
    -   *Je vous remercie par avance.*
    -   *Cordialement, · Bien à vous,*$bc$,
  5, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't1-checklist-officielle';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (1, 't1-checklist-officielle', 'checklist',
  $bc$Vérification · 6 cases obligatoires$bc$,
  $bc$Dernière vérification à faire systématiquement avant de rendre ta copie.$bc$,
  $bc$## ✅ Vérification Tâche 1 · 5 cases

Cocher **toutes** les cases avant de rendre :

1.  **Destinataire** ✔
    (on voit bien à qui le message est adressé)
2.  **Motif** ✔
    (on sait *pourquoi* tu écris — invitation, info, question…)
3.  **2-3 détails concrets** ✔
    (Qui · Quoi · Quand · Où · Avec qui)
4.  **Demande / attente** ✔
    (ce que tu attends du destinataire : réponse, confirmation…)
5.  **Formule de fin** ✔
    (salutation de fin + ton prénom)
6.  **Entre 60 et 120 mots** ✔
    (compte en direct dans l'éditeur Seyes · cible 95-115)$bc$,
  6, TRUE);

-- ---------------------------------------------------------------------
-- TÂCHE 3 — 6 blocs (ordres 7 à 12)
-- ---------------------------------------------------------------------

DELETE FROM base_connaissances_tcf WHERE slug = 't3-objectif';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (3, 't3-objectif', 'objectif',
  $bc$Tâche 3 · Comparer 2 opinions + donner son avis · 120-180 mots$bc$,
  $bc$Article comparant deux points de vue, puis prise de position personnelle sur le thème.$bc$,
  $bc$## Objectif Tâche 3 · 2 parties

Ton texte comporte **2 parties** :

1.  **Partie 1** : Présenter les **deux opinions** des documents **avec tes propres mots** — **40 à 60 mots**.
2.  **Partie 2** : Donner **ta position personnelle** sur le thème avec arguments — **80 à 120 mots**.

**Total** : 120 à 180 mots · Durée : 25 minutes.

---

### Schéma à retenir — 5 colonnes

```
OPINION 1  →  OPINION 2  →  MON AVIS  →  ARGUMENT 1  →  ARGUMENT 2 + FIN
```

### Phrase mémoire — à dire avant de commencer

> **ILS PENSENT  →  ILS NE SONT PAS D'ACCORD  →  MOI JE PENSE  →  POURQUOI 1  →  POURQUOI 2  →  CONCLUSION**$bc$,
  7, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't3-schema-retenir';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (3, 't3-schema-retenir', 'squelette',
  $bc$Schéma à retenir · 7 étapes$bc$,
  $bc$Squelette global des 2 parties · 7 rows.$bc$,
  $bc$## Schéma à retenir · 7 lignes

| PARTIE | CE QUE TU ÉCRIS |
|---|---|
| **Partie 1** | Je présente les deux documents sans donner mon avis. |
| **Document 1** | Le premier document souligne que… |
| **Document 2** | En revanche, le second document estime que… |
| **Partie 2** | Pour ma part, je pense que… |
| **Argument 1** | Tout d'abord,… En effet,… Par exemple,… |
| **Argument 2** | De plus,… / Cependant,… |
| **Conclusion** | Pour conclure, je pense donc que… |$bc$,
  8, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't3-partie1-deux-opinions';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (3, 't3-partie1-deux-opinions', 'avertissement',
  $bc$Partie 1 · Les Deux Opinions (40-60 mots) · ⚠️ TRÈS IMPORTANT · + exemple$bc$,
  $bc$Reformuler les deux points de vue. Ne PAS donner son avis personnel, ne PAS copier-coller.$bc$,
  $bc$## Partie 1 · Les Deux Opinions — 40 à 60 mots

| PARTIE | CE QUE TU ÉCRIS |
|---|---|
| **DÉBUT** | Les deux documents présentent des points de vue différents sur **[thème]**. |
| **OPINION 1** | Le premier document souligne que **[idée principale du doc 1]**. |
| **OPPOSITION** | En revanche / À l'inverse,… |
| **OPINION 2** | Le second document estime que **[idée principale du doc 2]**. |
| **FIN PARTIE 1** | Ainsi, les deux textes montrent des avantages et des limites différents. |

---

### EXEMPLE — Thème : Télétravail

> Les deux documents présentent des avis différents sur le **télétravail**. Le premier souligne qu'il permet de gagner du temps et d'organiser sa journée plus librement. **À l'inverse**, le second insiste sur l'isolement des salariés et sur la difficulté à séparer la vie professionnelle de la vie privée.

---

> ⚠️ **TRÈS IMPORTANT** · Partie 1 :
>
> -   ❌ Pas de *« je pense »*
> -   ❌ Pas d'argument personnel
> -   ❌ Pas de copier-coller des documents

---

### À vérifier

1.  **Aucun marqueur d'avis personnel** dans les 60 premiers mots.
2.  **Synonymes utilisés** (ne pas reprendre 2 phrases identiques des documents).
3.  Compte **40-60 mots** dans Partie 1.$bc$,
  9, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't3-partie2-mon-avis';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (3, 't3-partie2-mon-avis', 'squelette',
  $bc$Partie 2 · Ton Opinion · 80-120 mots · Formule magique verte · exemple$bc$,
  $bc$Position personnelle, arguments, nuance, conclusion. Exemple sur le télétravail.$bc$,
  $bc$## Partie 2 · Ton opinion — 80 à 120 mots

| PARTIE | CE QUE TU ÉCRIS |
|---|---|
| **MON AVIS** | Pour ma part, je pense que le télétravail présente plus d'avantages que d'inconvénients. |
| **ARGUMENT 1** | Tout d'abord, il permet de gagner du temps, car les employés n'ont pas besoin de se déplacer chaque jour. |
| **EXEMPLE 1** | Par exemple, une personne qui passe deux heures dans les transports peut utiliser ce temps pour sa famille ou pour se reposer. |
| **ARGUMENT 2** | De plus, travailler à domicile peut offrir davantage de flexibilité et améliorer l'organisation personnelle. |
| **NUANCE** | Cependant, il est important de garder des contacts réguliers avec les collègues afin d'éviter l'isolement. |
| **CONCLUSION** | Pour conclure, le télétravail est une bonne solution lorsqu'il est bien organisé. |

---

### 🪄 Formule magique verte (à retenir par cœur)

```
MON AVIS   →   ARGUMENT   →   EXEMPLE   →   ARGUMENT   →   NUANCE   →   CONCLUSION
```

*Répète-la 3 fois avant de commencer ta partie 2 : AVIS → ARG → EX → ARG → NUANCE → CONCL.*$bc$,
  10, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't3-connecteurs-6categories';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (3, 't3-connecteurs-6categories', 'connecteurs',
  $bc$Connecteurs à connaître · 6 catégories × 3 = 18$bc$,
  $bc$Grille orange Page 8 fiches PDF · 3 connecteurs par catégorie.$bc$,
  $bc$## Connecteurs à connaître · 18 officiels

### 1 · POUR COMPARER

-   En revanche
-   À l'inverse
-   Tandis que

### 2 · POUR AJOUTER

-   Tout d'abord
-   De plus
-   En outre

### 3 · POUR EXPLIQUER

-   En effet
-   Car
-   Parce que

### 4 · POUR DONNER UN EXEMPLE

-   Par exemple
-   Notamment
-   À savoir

### 5 · POUR NUANCER

-   Cependant
-   Pourtant
-   Néanmoins

### 6 · POUR CONCLURE

-   Pour conclure
-   En somme
-   Finalement$bc$,
  11, TRUE);

DELETE FROM base_connaissances_tcf WHERE slug = 't3-checklist-derniere-verification';
INSERT INTO base_connaissances_tcf
  (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif)
VALUES (3, 't3-checklist-derniere-verification', 'checklist',
  $bc$Dernière vérification · 6 cases vertes · 120-180 mots$bc$,
  $bc$Avant de rendre · toutes les cases doivent être cochées.$bc$,
  $bc$## ✅ Dernière vérification · 6 cases

Toutes cochées :

1.  **2 opinions reformulées** ✔
    (on a bien repris Document 1 + Document 2 avec des synonymes)
2.  **Mon avis clair** ✔
    (*Pour ma part, je pense que…* est écrit sans ambiguïté)
3.  **2 arguments minimum** ✔
    (Tout d'abord,… · De plus,… ou équivalent)
4.  **Un exemple concret** ✔
    (Par exemple, · Notamment · À savoir)
5.  **Une conclusion** ✔
    (Pour conclure · En somme · Finalement)
6.  **120 à 180 mots** ✔
    (cible 150-175 pour B2)

---

### Bonus · Checklist structurelle 7ᵉ case

7.  **Règle rose Partie 1** ✔
    (aucun *je pense*, aucun argument perso, aucun copié-collé dans la première moitié)$bc$,
  12, TRUE);
