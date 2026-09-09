-- ============================================================
--  009 — SEED 21 blocs base_connaissances_tcf · Expression Orale
--  Texte exact 4 fiches PDF HIB TCF Canada Septembre 2026
--  Idempotent : DELETE WHERE slug LIKE 'eo-%' + INSERT
--  Tous strings dollar-quoted $bc$ (apostrophes natives OK)
-- ============================================================

DELETE FROM base_connaissances_tcf WHERE slug LIKE 'eo-%';

-- =====================================================================
--  #1 — Objectif général EO (tache_num=0 : compétence globale)
-- =====================================================================
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (
  0, 'eo-objectif', 'objectif',
  $bc$Objectif · Expression Orale TCF Canada$bc$,
  $bc$Les 3 épreuves orales — durée indicative ~15 min$bc$,
  $bc$## Les 3 épreuves de l'Expression Orale

| Partie | Épreuve | Durée | Objectif
|---|---|---|---|
| 1 | Tâche 1 · Décrire une image | ~2 min | Observer, décrire, commenter 1 document visuel (photo, dessin, affiche)
| 2 | Tâche 2 · Jeu de rôle | ~6 min | Dialoguer 10-12 échanges. L'examinateur joue un rôle (ami, prof, voisin, parent). Tu poses des questions, tu rebondis.
| 3 | Tâche 3 · Exposé-débat | ~6 min | Présenter son opinion sur un sujet d'actualité, puis débattre avec l'examinateur qui prend le contre-pied.

## Barème indicatif (CECRL B2 Cible NCLC 8)
- **Cohérence** : structure claire, connecteurs variés
- **Richesse lexicale** : champ lexical du thème, registre adapté (familier, neutre, formel)
- **Maîtrise grammaticale** : temps verbaux, accord, modes
- **Prononciation** : intonation, liaisons, accent intelligible pour un francophone non familier
- **Interaction** (Tâche 2) : questions pertinentes, écoute active, reformulation, tours de parole équilibrés
- **Argumentation** (Tâche 3) : thèse claire, 2 arguments + exemples concrets, nuance acceptée, conclusion

> Important : l'**interaction compte 40%** de la note orale — ce n'est pas un monologue. N'hésite pas à poser des questions ouvertes à ton interlocuteur !
$bc$,
  100, TRUE, 'EO'
);

-- =====================================================================
--  #2 — Schéma Tâche 2 Jeu de rôle (tache_num=2)
-- =====================================================================
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (
  2, 'eo-t2-schema', 'squelette',
  $bc$Schéma Tâche 2 · Jeu de rôle 6 minutes$bc$,
  $bc$Une conversation réaliste de 10-12 échanges minimum$bc$,
  $bc$## Le déroulé (structure gagnante)

**Étape 1 — Salutation + prise de contact (1-2 échanges)**
- *Salut ! Ça va ? / Bonjour, merci de me recevoir.*
- Raconter une petite phrase d'introduction liée au contexte.

**Étape 2 — Poser 3-4 questions ouvertes principales (4-5 échanges)**
- Utiliser **Quel… ? / Comment… ? / Combien… ? / Où… ? / Pourquoi… ? / Est-ce que tu sais si… ?**
- Interdire les questions fermées oui/non SAUF pour confirmer.

**Étape 3 — Approfondir / Rebondir sur la réponse (3-4 échanges)**
- *Ah tiens, c'est intéressant… tu dis que [X]. Est-ce que [Y] ?*
- *Bon à savoir ! Et concernant [Z], c'est comment ?*
- Reformuler : *Donc, si je t'ai bien compris…* (montre que tu écoutes)

**Étape 4 — Conclusion / Remerciements (1-2 échanges)**
- *Merci pour tes conseils, ça m'aide beaucoup !*
- *Parfait, je vais appliquer ça. À bientôt !*

## 10 Phrases magiques de la Tâche 2
1. **Écoute…** j'aurais besoin de ton avis sur quelque chose.
2. **Dis-moi…** est-ce que ça m'arrivera souvent ?
3. **Justement**, parlons-en un peu plus.
4. **Franchement**, je ne m'y connais pas du tout, tu peux m'expliquer ?
5. **Ah tiens**, je n'avais pas pensé à ça !
6. **Bon**, résumons ce que l'on vient de dire.
7. **Après**, il faut aussi réfléchir au côté pratique, non ?
8. **En même temps**, ce n'est pas évident la première fois…
9. **Est-ce que tu penses que** je devrais [action] ?
10. **Bon ben**, je crois que j'ai toutes les infos. Merci !
$bc$,
  101, TRUE, 'EO'
);

-- =====================================================================
--  #3-9 — Les 7 scénarios Tâche 2 (tache_num=2)
-- =====================================================================

--  #3
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (2, 'eo-t2-scenario-installation', 'exemple',
  $bc$Scénario #1 · Conseils installation ville$bc$,
  $bc$Role : Je suis ton ami(e) francophone installé(e) depuis 10 ans. Tu viens d'arriver.$bc$,
  $bc$## Rôle
**Tu es le NOUVEAU / la NOUVELLE VENUE** — tu ne sais rien de la ville, tu poses les questions.
**L'examinateur joue :** l'ami(e) installé(e) depuis longtemps.

## Sujet (texte exact PDF)
> Je suis un(e) ami(e) francophone installé(e) ici depuis longtemps. **Tu viens d'arriver dans ma ville.** Tu me demandes des **conseils pratiques pour votre installation**
> (**logement, démarches administratives, transports, commerces, loisirs**, etc.).

## 4 Questions OPEN obligatoires à poser minimum
1. **Dans quel quartier** est-ce que tu me conseillerais de chercher un logement, pour un budget moyen ?
2. **Quelles démarches administratives** je dois faire en priorité, dans les 15 premiers jours ?
3. **Comment on se déplace** au quotidien ? Est-ce qu'il y a un abonnement transport intéressant ?
4. **Où est-ce que tu fais tes courses** ? Et pour sortir le week-end, où tu vas ?
$bc$,
  102, TRUE, 'EO'
);

--  #4
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (2, 'eo-t2-scenario-sante', 'exemple',
  $bc$Scénario #2 · Tomber malade dans le pays$bc$,
  $bc$Role : Je suis ton ami(e). Tu ne connais pas du tout le système de santé.$bc$,
  $bc$## Rôle
**Tu es le curieux / la curieuse** : tu veux savoir comment fonctionnent les soins dans ce pays.
**L'examinateur joue :** l'ami(e) qui connaît bien le système.

## Sujet (texte exact PDF)
> Je suis un(e) ami(e) francophone. **Tu veux savoir comment cela se passe quand on tombe malade dans mon pays.** Tu me poses des questions sur
> **l'organisation des soins (médecins, hôpitaux, urgences médicales, etc.).**

## 4 Questions OPEN obligatoires
1. **Comment est organisé le système de santé** ici (public, privé, mutuelle) ?
2. **Est-ce qu'il est facile de prendre rendez-vous** avec un médecin généraliste ? Ça prend combien de temps en général ?
3. **Est-ce que les consultations sont payantes** ou remboursées ? Et les médicaments en pharmacie ?
4. **Dans quel cas est-ce qu'on va aux urgences** ? Et si c'est une urgence grave, on compose quel numéro ?
$bc$,
  103, TRUE, 'EO'
);

--  #5
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (2, 'eo-t2-scenario-nouvelan', 'exemple',
  $bc$Scénario #3 · Nouvel An au Canada$bc$,
  $bc$Role : Je suis ton professeur de français. Tu vas fêter le Nouvel An ici pour la 1ère fois.$bc$,
  $bc$## Rôle
**Tu es l'étudiant(e) étranger(e)** : tu demandes comment se passe le Nouvel An au Canada.
**L'examinateur joue :** le/la professeur(e) de français.

## Sujet (texte exact PDF)
> Je suis votre professeur(e) de français. **Vous allez passer le prochain Nouvel An au Canada.** Vous me demandez **comment les Canadiens célèbrent cette fête.**
> Vous me posez des questions pour vous faire une idée
> (**lieux, activités, plats, etc.**).

## 4 Questions OPEN obligatoires
1. **Quels sont les plats traditionnels** qu'on mange pour le Nouvel An ? Est-ce qu'il y a un repas spécial ?
2. **Où est-ce que les gens sortent** le 31 décembre ? Y a-t-il un feu d'artifice dans les villes ?
3. **Est-ce qu'il y a des traditions spéciales** le jour du 1er janvier ? (visites, famille, souhait de bonheur…)
4. **Quelles activités d'hiver** peut-on faire pendant les fêtes de fin d'année à côté de Montréal / Québec ?
$bc$,
  104, TRUE, 'EO'
);

--  #6
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (2, 'eo-t2-scenario-emploi', 'exemple',
  $bc$Scénario #4 · Trouver un emploi d'été au Canada$bc$,
  $bc$Role : Je suis ton prof de français. Tu cherches un job étudiant cet été.$bc$,
  $bc$## Rôle
**Tu es étudiant(e) étranger(e)** : tu cherches un travail saisonnier 3 mois.
**L'examinateur joue :** professeur(e) de français.

## Sujet (texte exact PDF)
> Je suis votre professeur(e) de français. **Vous souhaitez travailler au Canada cet été.** Vous me demandez des
> **conseils pour trouver un emploi**
> (**régions, activités, salaires**, etc.).

## 4 Questions OPEN obligatoires
1. **Dans quelles régions du Canada** est-ce qu'il y a le plus de jobs étudiants l'été ?
2. **Quels types d'emplois** sont faciles à trouver pour un étudiant étranger (hôtellerie, restauration, ferme, camp de vacances…) ?
3. **Quel est le salaire horaire minimum** ? Est-ce qu'il y a des pourboires ?
4. **Est-ce qu'il faut un permis de travail spécial** ? Quelles sont les 3 démarches principales avant de postuler ?
$bc$,
  105, TRUE, 'EO'
);

--  #7
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (2, 'eo-t2-scenario-vegetarien', 'exemple',
  $bc$Scénario #5 · Ami végétarien en voyage d'affaires$bc$,
  $bc$Role : Je suis ton voisin(e) canadien(ne). Ton ami végé doit venir.$bc$,
  $bc$## Rôle
**Tu es le/la soucieux(-se)** : ton ami végétarien vient pour le travail, tu veux savoir s'il sera bien nourri.
**L'examinateur joue :** ton voisin(e) canadien(ne).

## Sujet (texte exact PDF)
> Je suis votre voisin(e) canadien(ne). **Un de vos amis est végétarien, il doit faire un voyage d'affaires au Canada.**
> Vous m'interrogez pour savoir si votre ami pourra se nourrir facilement au Canada ou pas
> (**restaurants et cantines, achats, variété, prix, etc.**).

## 4 Questions OPEN obligatoires
1. **Est-ce qu'il y a beaucoup de restaurants végétaliens ou végés** dans les grandes villes comme Toronto ou Vancouver ?
2. **Dans les supermarchés, trouve-t-on facilement** des produits végé (tofu, protéines végétales, laits végétaux…) ?
3. **Est-ce que la nourriture végé est plus chère** que la nourriture classique ? De combien en pourcentage environ ?
4. **Dans les cantines d'entreprise**, est-ce qu'il y a toujours une option végétarienne clairement indiquée ?
$bc$,
  106, TRUE, 'EO'
);

--  #8
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (2, 'eo-t2-scenario-fete-ecole', 'exemple',
  $bc$Scénario #6 · Première fête de l'école$bc$,
  $bc$Role : Je suis parent d'élève. Ton enfant va à la même école que le mien.$bc$,
  $bc$## Rôle
**Tu es le parent nouvellement arrivé(e)** : c'est ta 1ère kermesse/fête de l'école.
**L'examinateur joue :** parent vétéran qui connaît tout.

## Sujet (texte exact PDF)
> Je suis parent d'élève. **Nos enfants vont à la même école. Vous allez participer à la fête de l'école pour la première fois.**
> Vous me posez des questions sur **l'événement**
> (**horaires, programme, animations**, etc.).

## 4 Questions OPEN obligatoires
1. **Ça commence à quelle heure exactement** et ça dure combien de temps ? Est-ce qu'on peut venir en retard / partir avant la fin ?
2. **Quel est le programme cette année** ? (spectacles, tombola, jeux, ateliers manuels…)
3. **Est-ce qu'il faut apporter quelque chose** — un plat, une boîte pour le pique-nique, des chaises ?
4. **Est-ce qu'il y a une collecte d'argent** ? Et comment on s'inscrit pour aider en tant que parent bénévole ?
$bc$,
  107, TRUE, 'EO'
);

--  #9
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (2, 'eo-t2-scenario-logement', 'exemple',
  $bc$Scénario #7 · Louer un logement dans une grande ville$bc$,
  $bc$Role : Je suis ton ami(e). Tu veux louer un appartement 2 pièces.$bc$,
  $bc$## Rôle
**Tu es la personne à la recherche d'un toit.**
**L'examinateur joue :** l'ami(e) qui habite là-bas depuis des années.

## Sujet (texte exact PDF)
> Je suis votre ami(e). **J'habite dans une grande ville. Vous voulez louer un logement dans cette ville.**
> Vous me posez des questions à ce sujet
> (**offres, prix, quartier, etc.**).

## 4 Questions OPEN obligatoires
1. **Quels sont les prix moyens** pour un appartement 2 pièces dans un quartier sympa, proche transports ?
2. **Sur quels sites internet** est-ce qu'on trouve les meilleures offres ? Est-ce qu'il faut passer par une agence ou particulier ?
3. **Quels documents** est-ce que le propriétaire demande pour signer le bail ? (bulletin de salaire, garant…)
4. **Quels quartiers tu me conseillerais** (calme, bien desservi, commerces près) vs. ceux à éviter ?
$bc$,
  108, TRUE, 'EO'
);

-- =====================================================================
--  #10-11 — Corrections Tâche 2 (2 listes 10 questions Numérotées)
-- =====================================================================

-- #10
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (2, 'eo-t2-corrections-installation', 'checklist',
  $bc$Corrections 10 Questions · Installation ville$bc$,
  $bc$Pratique intensive. Chaque question doit être posée naturellement en Tâche 2.$bc$,
  $bc$## 10 Questions type « Installation » (réponses à l'oral 1-2 phrases EACH)

1. Depuis quand êtes-vous arrivé(e) dans cette ville, et quelles sont vos premières impressions ?
2. Quel type de logement cherchez-vous ici, et dans quel quartier aimeriez-vous habiter ?
3. Quels conseils pouvez-vous demander pour trouver un appartement rapidement et éviter les mauvaises surprises ?
4. Quelles démarches administratives devez-vous faire en priorité après votre arrivée ?
5. De quels documents avez-vous besoin pour vous installer plus facilement dans la ville ?
6. Comment pouvez-vous vous déplacer au quotidien dans cette ville ?
7. Quels moyens de transport préférez-vous, et pourquoi ?
8. Où pouvez-vous faire vos courses et acheter les choses nécessaires pour votre installation ?
9. Quels commerces ou services de proximité sont les plus utiles quand on vient d'arriver ?
10. Quelles activités de loisirs pouvez-vous faire pour découvrir la ville et rencontrer des gens ?
$bc$,
  109, TRUE, 'EO'
);

-- #11
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (2, 'eo-t2-corrections-sante', 'checklist',
  $bc$Corrections 10 Questions · Santé / Soins$bc$,
  $bc$10 questions possibles pour Tâche 2 Scénario #2 Santé$bc$,
  $bc$## 10 Questions type « Santé & Soins »

1. Comment est organisé le système de santé dans votre pays ?
2. Quand une personne tombe malade, que fait-elle en général en premier ?
3. Est-ce qu'il est facile de prendre rendez-vous chez un médecin dans votre pays ?
4. Quels types de médecins peut-on consulter dans votre pays ?
5. Comment se passe une consultation chez le médecin dans votre pays ?
6. Est-ce que les soins médicaux sont gratuits ou payants dans votre pays ?
7. Comment fonctionne l'hôpital dans votre pays ?
8. Dans quels cas va-t-on aux urgences médicales dans votre pays ?
9. Que faut-il faire en cas d'urgence grave dans votre pays ?
10. Est-ce qu'il y a des pharmacies facilement accessibles dans votre pays ?
$bc$,
  110, TRUE, 'EO'
);

-- =====================================================================
--  #12 — Schéma Tâche 3 Débat (tache_num=3)
-- =====================================================================
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-t3-objectif-schema', 'squelette',
  $bc$Schéma Tâche 3 · Exposé-débat 6 minutes$bc$,
  $bc$Annonce → Thèse → 2 arguments + exemples → Nuance → Conclusion$bc$,
  $bc$## Objectif (texte PDF)
> Tu as 2 minutes pour **présenter ton opinion** à partir d'une affirmation : *« Qu'en pensez-vous ? / Êtes-vous d'accord ? Pourquoi ? »*
> Puis **4 minutes de débat** avec l'examinateur qui joue l'avocat du diable.

## Structure en 5 temps (≈ 2 minutes à l'oral)

1. **Annonce de la réponse** (1 phrase)
   - *« Pour répondre à cette question, personnellement je pense que… »*
   - *« Je suis plutôt d'accord / pas d'accord avec cette idée, et voici pourquoi. »*

2. **Thèse claire** (1 phrase)
   - *« Ma position est la suivante : [1 idée simple] »*

3. **2 arguments SOLIDES, CHACUN suivi d'un EXEMPLE concret**
   - **Argument 1 :** *« Tout d'abord, [idée 1]. Par exemple, [illustration perso / statistique imaginaire mais crédible / exemple Canada] »*
   - **Argument 2 :** *« De plus, [idée 2]. Prenons le cas de [X], on voit bien que [effet]. »*

4. **Nuance** (1 phrase)
   - *« Cependant, je reconnais que [point faible de ma thèse]. Mais ce problème reste mineur car [contre-nuance] »*

5. **Conclusion reformulée** (1 phrase)
   - *« Pour conclure, je dirais donc que [reformulation de la thèse, mots différents] »*

## Petits trucs à l'oral
- **Rythme lent** ≈ 120 mots/minute, 2 minutes = ~ 240-280 mots.
- **Marqueurs oraux** : Écoute… / Ben… / Dis donc… / Franchement… / Justement… pour faire naturel.
- Si l'examinateur te contredit : *« C'est un bon point, mais je rétorquerais que… »* — pas d'agressivité, souris.
$bc$,
  111, TRUE, 'EO'
);

-- =====================================================================
--  #13-20 — 8 sujets Tâche 3 (tache_num=3), #20 = exemple COMPLET 650 mots
-- =====================================================================

-- #13
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-t3-sujet-telephone', 'exemple',
  $bc$Sujet #1 · Changer souvent de téléphone portable$bc$,
  $bc$Affirmation : « Certains consommateurs changent souvent de téléphone portable. Que pensez-vous de cette pratique ? »$bc$,
  $bc$## Sujet (texte exact)
> **Tâche 3 :** Certains consommateurs changent souvent de téléphone portable. **Que pensez-vous de cette pratique ?**

## Plan possible (pour t'entraîner)
- **Thèse** : c'est une pratique coûteuse et mauvaise pour la planète, il faudrait décourager l'obsolescence programmée.
- **Arg 1** impact écologique : extraction lithium/cobalt, montagnes de déchets électroniques au Ghana ou Chine. Exemple : un téléphone = 1 tonne de minerais extraits.
- **Arg 2** impact économique : 1200-1500 $ pour un flagship, alors qu'un téléphone 3 ans reste fonctionnel à 95%. Famille monoparentale = 1 mois de loyer.
- **Nuance** : mais l'innovation (caméra, IA, 5G) est réelle pour les pros (journalistes, développeurs). OK pour eux, pas pour tout le monde.
- **Conclusion** : garder son téléphone 5 ans minimum, achat reconditionné = meilleur compromis.
$bc$,
  112, TRUE, 'EO'
);

-- #14
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-t3-sujet-autorite', 'exemple',
  $bc$Sujet #2 · Être autoritaire pour bien éduquer un enfant$bc$,
  $bc$Question : Faut-il être autoritaire pour bien éduquer un enfant ? Pourquoi ?$bc$,
  $bc$## Sujet (texte exact)
> **Tâche 3 :** Faut-il être autoritaire pour bien éduquer un enfant ? **Pourquoi ?**

## Plan possible
- **Thèse** : NON, l'autoritarisme nuisible à long terme ; mieux = fermeté bienveillante.
- **Arg 1** : études sciences éducation (Bateson 2019) : enfants élevés dans la punition corporelle ont QI moyen 5 points plus bas à 10 ans + troubles anxieux 3× plus fréquents.
- **Arg 2** : autoritarisme crée 2 types d'adultes : soit soumis sans opinion, soit rebelles et cassent la loi. Exemple : système scolaire Finlande — zéro punition, 1er rang PISA dans le monde.
- **Nuance** : mais il faut des limites claires (« fermeté bienveillante ») : règle + explication pourquoi. Pas caprice autoritaire, pas laxisme non plus.
- **Conclusion** : meilleur = discuter et expliquer plutôt que d'imposer par la peur.
$bc$,
  113, TRUE, 'EO'
);

-- #15
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-t3-sujet-immigres', 'exemple',
  $bc$Sujet #3 · Les immigrés connaître pays d'accueil$bc$,
  $bc$Question : Les immigrés doivent-ils bien connaître leur pays d'accueil ? Pourquoi ?$bc$,
  $bc$## Sujet (texte exact)
> **Tâche 3 :** Les immigrés doivent-ils bien connaître leur pays d'accueil ? **Pourquoi ?**

## Plan possible
- **Thèse** : OUI, c'est un double bénéfice : pour eux (intégration, emploi) ET pour la société (cohésion).
- **Arg 1** maîtrise de la langue + codes culturels → multiplie par 3 chances d'avoir un emploi stable. Exemple : Statistique Canada (2021) : immigrants ayant suivi des cours de français/anglais + culture — taux d'emploi 78% vs. 54% pour ceux qui n'en ont pas eu.
- **Arg 2** connaître l'histoire et les institutions évite les préjugés réciproques. Exemple : programme « Citoyenneté » Canada — test 20 questions histoire/constitution. 93% des nouveaux citoyens disent se sentir « Canadiens à part entière » après ce test.
- **Nuance** : ça ne doit pas être un examen punitif. Accompagnement linguistique et culturel GRATUIT pendant 2 ans, pas test dès l'arrivée.
- **Conclusion** : Devoir d'accueil de l'État ET devoir d'engagement de l'immigré — les deux mains se serrent.
$bc$,
  114, TRUE, 'EO'
);

-- #16
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-t3-sujet-animaux', 'exemple',
  $bc$Sujet #4 · Protéger tous les animaux en danger$bc$,
  $bc$Question : Il faut protéger tous les animaux en danger. Êtes-vous d'accord ? Pourquoi ?$bc$,
  $bc$## Sujet (texte exact)
> **Tâche 3 :** Il faut protéger tous les animaux en danger. **Êtes-vous d'accord avec cette affirmation ? Pourquoi ?**

## Plan possible
- **Thèse** : OUI 100% — mais attention à la priorisation (espèces clés écosystème avant l'ours blanc mignon).
- **Arg 1** éthique : 6ème extinction massive en cours (ONU 2023 — 1 million d'espèces menacées). C'est l'homme qui cause 90% des disparitions, donc on a une responsabilité morale. Exemple : rhino blanc du Nord = 3 individus en 2018, braconnage pour corne.
- **Arg 2** économique / santé : pollinisateurs (abeilles) — 75% de nos cultures alimentaires dépendent de leur survie. Disparition = + 25% le prix des aliments + famines. Exemple : en Chine où les abeilles ont disparu, les humains pollinisent à la main les pommiers (10 000 personnes pour un verger).
- **Nuance** : on ne peut pas tout sauver en même temps — stratégie triage (WWF) : 800 espèces « keystone » = priorité absolue, avant les espèces « charismatiques » médiatiques.
- **Conclusion** : OUI protéger tous, mais avec budget priorisé et efficace, pas juste émotionnel.
$bc$,
  115, TRUE, 'EO'
);

-- #17
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-t3-sujet-bonheur-travail', 'exemple',
  $bc$Sujet #5 · Plus important : être heureux au travail$bc$,
  $bc$Question : Le plus important dans la vie, c'est d'être heureux au travail. Qu'en pensez-vous ?$bc$,
  $bc$## Sujet (texte exact)
> **Tâche 3 :** Le plus important dans la vie, c'est d'être heureux au travail. **Qu'en pensez-vous ?**

## Plan possible
- **Thèse** : C'est TRES important, mais pas LE plus important — avant : santé mentale, relations amoureuses/amis, temps libre.
- **Arg 1** temps passé : 40 ans × 1800 h/an = 72 000 heures de travail dans une vie — si c'est misère, on devient malade chronique. Étude Gallup-2024 : employés malheureux 2,3× plus de burn out et maladies cardio. 1 point positif : Canada rang 18 mondial bonheur travail (Danemark 1er).
- **Arg 2** répercussions famille : stress travail → disputes, absentéisme parental, divorce +15% pour les emplois « toxiques ». Exemple : cadre hyper-stressé de Toronto — changement carrière de avocat → menuisier artisan — QCA (Qualité de Vie au Travail) × 3.
- **Nuance** : il faut aussi un minimum d'argent — bonheur travail + salaire médiocre en dessous du seuil pauvreté = impossible. Bonheur au travail **conditionné** au salaire décent + sécurité emploi.
- **Conclusion** : Dans mon top 3, pas numéro 1 : 1) Santé et relations, 2) Temps libre / hobbies, 3) Bonheur travail. Les 3 dépendent.
$bc$,
  116, TRUE, 'EO'
);

-- #18
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-t3-sujet-lecture', 'exemple',
  $bc$Sujet #6 · Lire est une perte de temps$bc$,
  $bc$Question : Lire est une perte de temps. Êtes-vous d'accord ? Pourquoi ?$bc$,
  $bc$## Sujet (texte exact)
> **Tâche 3 :** Lire est une perte de temps. **Êtes-vous d'accord avec cette affirmation ? Pourquoi ?**

## Plan possible
- **Thèse** : ABSOLUMENT PAS D'ACCORD — c'est l'investissement le plus rentable en temps.
- **Arg 1** cerveau : étude neurosciences Emory University 2021 — lire 30 min/jour × 10 ans — démence Alzheimer -32%. Lecture fiction active 14 aires cérébrales à la fois (empathie, mémoire, langage) — plus que le sport.
- **Arg 2** richesse personnelle : 1 livre = 5-10 ans d'expérience condensée de l'auteur. Un bon livre coûte 20 $, les idées dedans valent des millions. Exemple : *L'alchimiste* a changé la vie de 150 millions de lecteurs.
- **Nuance** : lire du contenu vide (titres racloir) — ça peut être une perte de temps, comme les réseaux. La sélection compte. La recommandation : 60% fiction / 40% non-fiction développement personnel.
- **Conclusion** : Lire 15-30 minutes par jour, c'est le cadeau le plus intelligent que tu te fais pour les 30 prochaines années.
$bc$,
  117, TRUE, 'EO'
);

-- #19
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-t3-sujet-vie-seule', 'exemple',
  $bc$Sujet #7 · Être heureux quand on vit seul$bc$,
  $bc$Question : On peut être heureux quand on vit seul. Qu'en pensez-vous ?$bc$,
  $bc$## Sujet (texte exact)
> **Tâche 3 :** On peut être heureux quand on vit seul. **Qu'en pensez-vous ?**

## Plan possible
- **Thèse** : OUI — à condition d'avoir un réseau social fort et une activité qui donne du sens. La solitude choisie ≠ l'isolement subi.
- **Arg 1** liberté totale : tu manges ce que tu veux à l'heure que tu veux, tu décores ton appart comme tu l'aimes, tu invites qui tu veux. Statistiques 2023 France : 1 foyer sur 4 habite seul, 71% de ces personnes disent être « satisfaites » (contre 75% en couple). Écart très faible.
- **Arg 2** développement personnel : vie seule force à prendre des décisions soi-même, à gérer l'administratif, à se connaître vraiment. Toutes les personnes qui traversent un divorce / deuil disent après 2 ans : *« j'ai appris à me connaître »*. Exemple : vivre 1 an seul avant de se marier — réduit divorce +22% (étude sociologie Amsterdam 2020).
- **Nuance** : le risque c'est l'isolement non-choisi des personnes âgées. Canada 2023 : 1,2 million aînés vivent seuls, 17% disent se sentir « toujours seuls » → problème santé publique. Mais ce n'est pas la solitude en soi, c'est l'absence de liens.
- **Conclusion** : OUI si c'est un choix. La clé : relations solides dehors (amis, famille, associations) + projet personnel dedans.
$bc$,
  118, TRUE, 'EO'
);

-- #20  —  EXEMPLE COMPLET — 7 paragraphes ~ 650 MOTS — Image 2 (très important PDF exemple)
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-t3-sujet-manger-equilibre', 'exemple',
  $bc$Sujet #8 · Manger équilibré + EXEMPLE COMPLET (7 paragraphes)$bc$,
  $bc$Image 2 PDF HIB TCF Canada — Réponse modèle pour Tâche 3$bc$,
  $bc$## Sujet (texte exact PDF)
> **Tâche 3 :** Pour être en bonne santé, le plus important c'est de manger équilibré. **Qu'en pensez-vous ?**

---

### EXEMPLE DE RÉPONSE (texte intégral PDF 7 paragraphes)

**À mon avis,** manger équilibré est un élément essentiel pour être en bonne santé, mais ce n'est pas le seul facteur important. Il est vrai que l'alimentation joue un rôle central dans notre vie quotidienne, parce qu'elle donne au corps l'énergie et les nutriments dont il a besoin pour bien fonctionner. Cependant, la santé dépend aussi d'autres habitudes, comme l'activité physique, le sommeil et la gestion du stress. **Je pense donc** qu'une alimentation équilibrée est très importante, mais qu'elle doit s'inscrire dans un mode de vie globalement sain.

**D'abord,** manger équilibré permet de prévenir de nombreux problèmes de santé. Quand une personne consomme des fruits, des légumes, des céréales complètes, des protéines de qualité et limite les produits trop gras, trop sucrés ou trop salés, elle réduit le risque de certaines maladies. Par exemple, une alimentation trop riche en fast-food, en boissons sucrées ou en produits industriels peut favoriser l'obésité, le diabète ou les maladies cardiovasculaires. **À l'inverse,** un repas varié et équilibré aide à maintenir un poids stable, à renforcer le système immunitaire et à améliorer le fonctionnement du corps. **On voit donc clairement que** la qualité de l'alimentation a des effets directs sur la santé.

**Ensuite,** bien manger a aussi une influence sur l'énergie et sur le bien-être au quotidien. Une personne qui saute souvent des repas ou qui mange seulement des produits transformés peut se sentir fatiguée, avoir du mal à se concentrer et manquer de motivation. **Au contraire,** une alimentation équilibrée permet d'avoir plus d'énergie pendant la journée. **Par exemple,** prendre un petit-déjeuner complet avec un fruit, un produit céréalier et une source de protéines peut aider un étudiant ou un employé à rester attentif plus longtemps. De plus, certains aliments riches en vitamines, en minéraux et en oméga-3 ont un effet positif sur le cerveau et sur l'humeur. **Cela montre que** manger équilibré ne sert pas seulement à éviter les maladies, mais aussi à vivre mieux chaque jour.

**De plus,** l'alimentation est une habitude que chacun peut améliorer progressivement. Même sans avoir beaucoup de moyens, il est possible de faire de meilleurs choix : cuisiner davantage à la maison, boire plus d'eau, réduire les snacks industriels ou ajouter des légumes à ses repas. **Par exemple,** remplacer les sodas par de l'eau et les chips par des fruits peut déjà faire une différence. Cet aspect est important, car il donne à chacun une certaine responsabilité dans la protection de sa santé. En adoptant des habitudes simples et régulières, on peut obtenir des résultats concrets sur le long terme.

**Cependant,** je ne pense pas que manger équilibré soit à lui seul le facteur le plus important. Une personne peut très bien avoir une alimentation saine, mais si elle ne bouge jamais, dort mal ou vit sous un stress constant, sa santé risque quand même de se dégrader. L'activité physique, **par exemple,** est indispensable pour le cœur, les muscles et l'équilibre mental. Marcher chaque jour, faire du vélo ou pratiquer un sport aide à rester en forme. Le sommeil est également essentiel, car un manque de repos affaiblit le corps et augmente la fatigue. **Enfin,** le stress peut avoir des conséquences graves sur la santé physique et psychologique. **C'est pourquoi** il faut considérer la santé comme un ensemble.

**Enfin,** il faut aussi tenir compte des différences entre les personnes. Certaines ont des contraintes médicales, financières ou professionnelles qui rendent difficile une alimentation parfaite. Quelqu'un qui travaille de nuit ou qui a un petit budget ne peut pas toujours organiser ses repas idéalement. **Dans ce cas,** il ne faut pas culpabiliser, mais chercher un équilibre réaliste. La santé ne repose pas sur la perfection, mais sur des efforts réguliers et adaptés à la situation de chacun.

**Pour conclure,** je dirais que manger équilibré est l'un des piliers les plus importants de la bonne santé, car cela permet de prévenir des maladies, d'avoir plus d'énergie et d'améliorer la qualité de vie. **Cependant,** ce n'est pas l'unique condition pour rester en bonne santé. Il faut aussi faire de l'exercice, dormir suffisamment et limiter le stress. **À mon avis,** la meilleure solution est donc d'adopter un mode de vie équilibré dans son ensemble, où l'alimentation occupe une place essentielle, sans être le seul élément décisif.
$bc$,
  119, TRUE, 'EO'
);

-- =====================================================================
--  #21 — 30 Connecteurs Oraux (EO)
-- =====================================================================
INSERT INTO base_connaissances_tcf (tache_num, slug, bloc_type, titre, description, contenu_markdown, ordre, actif, competence_code)
VALUES (3, 'eo-connecteurs-oraux', 'connecteurs',
  $bc$30 Connecteurs oraux indispensables$bc$,
  $bc$25 réutilisés de EE + 5 marqueurs d'hésitation naturels oraux$bc$,
  $bc$## Les 6 familles × 30 connecteurs (oraux, spontanés)

### POUR COMPARER · 3
- **En revanche** · **À l'inverse** · **Tandis que**

### POUR AJOUTER · 3
- **Tout d'abord** · **De plus** · **En outre**

### POUR EXPLIQUER · 3
- **En effet** · **Car** · **Parce que**

### POUR DONNER UN EXEMPLE · 3
- **Par exemple** · **Notamment** · **À savoir**

### POUR NUANCER · 3
- **Cependant** · **Pourtant** · **Néanmoins**

### POUR CONCLURE · 3
- **Pour conclure** · **En somme** · **Finalement**

### MARQUEURS SPONTANÉS ORAUX · 12 (SPÉCIFIQUES TÂCHE 2 + TÂCHE 3)
> Les expressions ci-dessous rendent l'oral **naturel et fluide** — à utiliser sans modération, mais pas toutes dans la même minute !

1. **Écoute…** — pour commencer / reprendre la parole
2. **Ben…** — pour hésiter gentiment avant une réponse
3. **Dis donc…** — pour introduire une nouvelle question / sujet
4. **Franchement…** — pour donner son opinion sincère
5. **Justement…** — pour rebondir sur ce qui vient d'être dit
6. **Après…** — pour ajouter un point supplémentaire
7. **En même temps…** — pour nuancer en douceur
8. **Enfin bref…** — pour résumer rapidement
9. **Bon** — pour marquer une transition
10. **Bah…** — pour une réponse évidente, un petit doute
11. **Voyons…** — pour réfléchir à voix haute avant de répondre
12. **Tiens…** — pour introduir une remarque ou un exemple qui vient à l'idée

## Petite règle d'or
> **1 marqueur oral par minute maximum** — sinon ça fait l'effet inverse : on paraît nerveux(-se). 2-3 fois en 6 minutes c'est parfait.
$bc$,
  120, TRUE, 'EO'
);
