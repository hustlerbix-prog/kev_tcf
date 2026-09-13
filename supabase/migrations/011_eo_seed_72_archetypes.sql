-- Migration 011 : Seed des 72 archetypes EO selon EO-001 §8
-- Idempotent : DELETE régulé puis INSERT ... ON CONFLICT DO UPDATE

DELETE FROM eo_archetypes WHERE id ~ '^T[123]-';

INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-IDE-01$bc$, 1, 1, $bc$Identité$bc$,
  $bc$Le candidat se présente personnellement et évoque un événement important de son passé ainsi qu'un projet pour l'avenir.$bc$,
  $bc$Pour commencer, pouvez-vous vous présenter en quelques mots : nom, âge, situation actuelle et ce qui vous amène à passer le TCF Canada ?$bc$,
  120, 0, $bc$quick$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Pouvez-vous préciser où vous habitez et depuis combien de temps ?$bc$, $bc$Quel a été l'événement le plus marquant de votre enfance ou de votre adolescence ?$bc$, $bc$Pourquoi ce projet est-il important pour vous aujourd'hui ?$bc$, $bc$Si tout se passe comme vous l'espérez, où vous voyez-vous dans cinq ans ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-TRA-02$bc$, 1, 2, $bc$Travail$bc$,
  $bc$Le candidat décrit son parcours professionnel, explique une mission qui lui a tenu à cœur et évoque ses perspectives d'évolution de carrière.$bc$,
  $bc$Pourrions-nous commencer par votre parcours professionnel : quels emplois avez-vous occupés jusqu'à présent et pourquoi avoir choisi ce chemin ?$bc$,
  120, 0, $bc$quick$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Quelles compétences avez-vous développées au fil de vos expériences ?$bc$, $bc$Racontez-moi une mission ou un projet professionnel dont vous êtes particulièrement fier/fière.$bc$, $bc$Quelles difficultés avez-vous rencontrées et comment les avez-vous surmontées ?$bc$, $bc$Où voyez-vous votre carrière dans trois à cinq ans, ici au Canada ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-ETU-03$bc$, 1, 3, $bc$Études$bc$,
  $bc$Le candidat relate son parcours d'études, explique son choix de filière et décrit ce qu'il aimerait étudier ou faire par la suite au Canada.$bc$,
  $bc$Parlons de votre parcours d'études : quelles études avez-vous suivies, quels diplômes avez-vous obtenus et pourquoi avoir choisi cette orientation ?$bc$,
  120, 0, $bc$quick$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Quel a été votre moment préféré durant vos études et pourquoi ?$bc$, $bc$Racontez-moi un souvenir marquant, une difficulté scolaire ou une réussite qui vous a marqué(e).$bc$, $bc$Quelles matières vous plaisaient le plus, et pourquoi ?$bc$, $bc$Si vous aviez l'opportunité de poursuivre des études au Canada, quel domaine choisiriez-vous et pour quelles raisons ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-LOG-04$bc$, 1, 4, $bc$Logement$bc$,
  $bc$Le candidat décrit son logement actuel, raconte comment il l'a trouvé et explique quels critères il retiendrait pour un prochain logement au Canada.$bc$,
  $bc$Parlons de votre logement actuel : où habitez-vous, dans quel type de logement et depuis combien de temps ?$bc$,
  120, 0, $bc$quick$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Pouvez-vous me décrire les pièces, l'équipement et les environs ?$bc$, $bc$Comment avez-vous trouvé ce logement et quels ont été les moments clés de votre installation ?$bc$, $bc$Quels avantages et quels inconvénients rencontrez-vous au quotidien ?$bc$, $bc$Si vous deviez chercher un nouveau logement au Canada, quels critères seraient les plus importants pour vous ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-FAM-05$bc$, 1, 5, $bc$Famille$bc$,
  $bc$Le candidat présente sa famille, raconte une récente réunion de famille et évoque ce qu'il aimerait faire avec sa famille une fois installé(e) au Canada.$bc$,
  $bc$Parlons de votre famille : pouvez-vous me décrire votre situation familiale, vos proches et les liens qui vous unissent ?$bc$,
  120, 0, $bc$quick$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Quelles sont les traditions ou les habitudes familiales qui vous tiennent le plus à cœur ?$bc$, $bc$Racontez-moi une récente réunion, un week-end ou une fête en famille qui vous a fait plaisir.$bc$, $bc$Quel rôle jouez-vous au sein de votre famille ?$bc$, $bc$Quand vous serez installé(e) au Canada, que souhaiteriez-vous partager ou faire avec votre famille, sur place ou à distance ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-LOI-06$bc$, 1, 6, $bc$Loisirs$bc$,
  $bc$Le candidat décrit ses loisirs et ses passions, raconte une sortie ou une activité récente, et explique ce qu'il aimerait découvrir comme activité au Canada.$bc$,
  $bc$Parlons de vos loisirs : quelles activités aimez-vous faire pendant votre temps libre, seul(e) ou avec d'autres ?$bc$,
  120, 0, $bc$quick$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Depuis quand pratiquez-vous ces activités et qu'est-ce qui vous plaît chez elles ?$bc$, $bc$Racontez-moi une sortie, un événement sportif ou culturel, ou une rencontre associative qui vous a récemment fait plaisir.$bc$, $bc$Ces activités vous ont-elles permis de rencontrer des gens ou de développer certaines compétences ?$bc$, $bc$Y a-t-il des activités, des sports ou des pratiques culturelles que vous aimeriez découvrir ou reprendre au Canada ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-VOY-07$bc$, 1, 7, $bc$Voyages$bc$,
  $bc$Le candidat raconte un voyage ou un déplacement qui l'a marqué, décrit ce qu'il a découvert et évoque un voyage qu'il aimerait faire au Canada ou ailleurs.$bc$,
  $bc$Parlons de vos voyages et de vos déplacements : quel voyage, quelle région ou quelle ville vous a le plus marqué(e) jusqu'à présent ?$bc$,
  120, 0, $bc$quick$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Quand êtes-vous parti(e), avec qui et dans quel but ?$bc$, $bc$Racontez-moi le déroulement de ce voyage, une anecdote, une rencontre ou un moment fort.$bc$, $bc$Qu'avez-vous appris de cette expérience sur les autres ou sur vous-même ?$bc$, $bc$Quelle région du Canada ou du monde aimeriez-vous découvrir prochainement et pour quelles raisons ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-LAN-13$bc$, 1, 8, $bc$Langues et communication$bc$,
  $bc$Le candidat explique son rapport aux langues, raconte une situation de communication interculturelle et décrit comment il envisage l'apprentissage du français et de l'anglais au Canada.$bc$,
  $bc$Parlons des langues et de la communication : combien de langues parlez-vous, dans quelles contextes et depuis quand apprenez-vous le français ?$bc$,
  120, 0, $bc$quick$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Quels ont été les moments les plus difficiles et les plus encourageants dans votre apprentissage du français ?$bc$, $bc$Racontez-moi une situation de communication interculturelle ou un échange avec quelqu'un d'une autre culture qui vous a marqué(e).$bc$, $bc$Selon vous, quelle place occupent les langues dans votre vie professionnelle, sociale et personnelle ?$bc$, $bc$Comment envisagez-vous de progresser en français et en anglais une fois installé(e) au Canada ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-BEN-08$bc$, 1, 9, $bc$Bénévolat$bc$,
  $bc$Le candidat présente son expérience ou son intérêt pour le bénévolat, raconte une action bénévole ou solidaire et évoque ce qu'il aimerait faire dans ce domaine au Canada.$bc$,
  $bc$Parlons bénévolat et solidarité : avez-vous déjà participé à des actions bénévoles, des associations ou des projets solidaires ? Si oui, lesquelles et dans quel rôle ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Qu'est-ce qui vous a poussé(e) à vous engager, ou qu'est-ce qui vous donnerait envie de vous engager ?$bc$, $bc$Racontez-moi une action, une distribution, une réunion ou une mission qui vous a particulièrement marqué(e).$bc$, $bc$Quelles compétences ou quels liens avez-vous développés grâce à ces engagements ?$bc$, $bc$Au Canada, quelle cause ou quel type d'association aimeriez-vous soutenir et pourquoi ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-CUL-09$bc$, 1, 10, $bc$Culture et médias$bc$,
  $bc$Le candidat décrit ses goûts culturels (cinéma, musique, littérature, médias), raconte un événement culturel récent et explique ce qu'il aimerait découvrir de la culture canadienne.$bc$,
  $bc$Parlons culture, cinéma, musique, lecture et médias : quels sont vos goûts et vos habitudes dans ces domaines ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Avez-vous un artiste, un livre, un film ou un contenu médiatique qui vous accompagne depuis longtemps ?$bc$, $bc$Racontez-moi un concert, une exposition, un festival, un film vu au cinéma ou une émission qui vous a récemment marqué(e).$bc$, $bc$En quoi la culture ou les médias influencent-ils votre façon de voir le monde ?$bc$, $bc$Y a-t-il des aspects de la culture canadienne (musique, cinéma, littérature, théâtre) que vous aimeriez découvrir ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-EMP-10$bc$, 1, 11, $bc$Emploi et recherche$bc$,
  $bc$Le candidat explique sa situation professionnelle actuelle, raconte une expérience de recherche d'emploi et décrit comment il envisage sa recherche d'emploi au Canada.$bc$,
  $bc$Parlons emploi et recherche d'emploi : travaillez-vous actuellement, recherchez-vous un emploi, ou avez-vous récemment changé de poste ? Décrivez-nous cette situation.$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Quelles démarches avez-vous faites et quels outils utilisez-vous (réseaux, candidatures, agences) ?$bc$, $bc$Racontez-moi une candidature, un entretien ou une offre qui vous a particulièrement marqué(e), positivement ou négativement.$bc$, $bc$Quelles sont vos forces et vos points de vigilance en entretien ?$bc$, $bc$Comment allez-vous aborder la recherche d'emploi au Canada : quels secteurs, quelles stratégies et quelles adaptations prévoyez-vous ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-FOR-11$bc$, 1, 12, $bc$Formation continue$bc$,
  $bc$Le candidat explique ses expériences de formation continue ou de perfectionnement, raconte un stage ou une formation marquante, et évoque ce qu'il aimerait apprendre au Canada.$bc$,
  $bc$Parlons formation continue, perfectionnement et apprentissage au quotidien : avez-vous déjà suivi des formations, des stages, des ateliers ou des certifications en dehors de vos études initiales ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Pourquoi avoir choisi ces formations et quels en ont été les bénéfices pour vous ?$bc$, $bc$Racontez-moi une formation, un stage ou un atelier qui a vraiment changé quelque chose dans votre façon de travailler ou de penser.$bc$, $bc$Avez-vous dû faire face à des difficultés (temps, financement, organisation) ? Comment avez-vous fait ?$bc$, $bc$Au Canada, quelles compétences, quelles formations ou quelles certifications aimeriez-vous acquérir et pourquoi ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-COL-12$bc$, 1, 13, $bc$Collège / études supérieures$bc$,
  $bc$Le candidat explique son rapport aux études supérieures ou au système collégial, raconte une étape décisive de son parcours et explique ce qu'il aimerait étudier dans un collège ou une université canadienne.$bc$,
  $bc$Parlons études supérieures, collèges et universités : quelle place occupent les études dans votre projet de vie, et pourquoi vous intéressez-vous au système éducatif canadien ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Comment avez-vous choisi votre filière ou votre domaine d'études actuel ?$bc$, $bc$Racontez-moi une étape décisive : un examen, une année difficile, une rencontre avec un enseignant, un stage déterminant.$bc$, $bc$Qu'attendez-vous d'un établissement d'enseignement supérieur ?$bc$, $bc$Si vous étiez accepté(e) dans un collège ou une université au Canada, quel programme choisiriez-vous et quels résultats en attendez-vous ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-TEC-14$bc$, 1, 14, $bc$Technologie$bc$,
  $bc$Le candidat décrit son rapport aux nouvelles technologies, raconte un moment où la technologie a joué un rôle important et évoque comment il imagine l'avenir avec les technologies au Canada.$bc$,
  $bc$Parlons technologie, outils numériques et usages du quotidien : quelle place occupent les outils numériques (téléphone, ordinateur, applications, IA) dans votre vie personnelle et professionnelle ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Quels sont vos outils ou applications préférés, et pourquoi ?$bc$, $bc$Racontez-moi une situation où la technologie vous a vraiment aidé(e) — ou au contraire vous a compliqué la vie.$bc$, $bc$Selon vous, quels sont les avantages et les limites d'un monde de plus en plus connecté ?$bc$, $bc$Comment pensez-vous utiliser les technologies, y compris l'intelligence artificielle, dans votre travail ou vos études au Canada ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-ENV-15$bc$, 1, 15, $bc$Environnement$bc$,
  $bc$Le candidat décrit ses habitudes écologiques, raconte une action ou un événement lié à l'environnement qui l'a marqué et évoque ce qu'il aimerait faire pour la planète au Canada.$bc$,
  $bc$Parlons environnement, écologie et gestes du quotidien : quelles sont les habitudes écologiques que vous avez déjà prises, ou que vous souhaiteriez mettre en place ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Qu'est-ce qui vous a sensibilisé(e) aux questions écologiques ?$bc$, $bc$Racontez-moi une action, une conférence, un documentaire, un nettoyage ou un projet qui vous a vraiment fait réfléchir ou changer de comportement.$bc$, $bc$Pensez-vous que les individus peuvent vraiment changer les choses, ou faut-il avant tout des mesures collectives ?$bc$, $bc$Au Canada, quels gestes ou quels engagements environnementaux aimeriez-vous prendre dans votre vie quotidienne ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-SAN-16$bc$, 1, 16, $bc$Santé et bien-être$bc$,
  $bc$Le candidat décrit ses habitudes de santé et de bien-être, raconte un moment où il a pris soin de lui ou d'un proche, et évoque comment il envisage sa santé au Canada.$bc$,
  $bc$Parlons santé, alimentation, sport, sommeil et bien-être : quelles sont vos habitudes pour vous sentir bien au quotidien ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Y a-t-il une pratique sportive, une activité relaxante ou une habitude alimentaire qui vous est indispensable ?$bc$, $bc$Racontez-moi un moment où vous avez pris soin de votre santé, ou celle d'un proche, et que ce soit resté dans votre mémoire.$bc$, $bc$Quels sont, selon vous, les facteurs clés d'une vie équilibrée ?$bc$, $bc$Quand vous serez au Canada, comment allez-vous vous organiser pour préserver votre bien-être et votre santé ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-ALI-17$bc$, 1, 17, $bc$Alimentation$bc$,
  $bc$Le candidat décrit ses habitudes alimentaires et ses goûts culinaires, raconte un repas ou une expérience gastronomique marquante, et évoque ce qu'il aimerait goûter ou cuisiner au Canada.$bc$,
  $bc$Parlons alimentation, cuisine et terroirs : aimez-vous cuisiner, quels sont vos plats préférés et quelle place occupe la nourriture dans votre culture ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Avez-vous un plat typique de votre région ou de votre famille que vous aimez particulièrement ?$bc$, $bc$Racontez-moi un repas de fête, une sortie au restaurant, une découverte culinaire ou un échec en cuisine dont vous vous souvenez bien.$bc$, $bc$L'alimentation est-elle pour vous avant tout un plaisir, une nécessité ou un geste de santé ?$bc$, $bc$Au Canada, quels produits, quels plats ou quelles traditions culinaires aimeriez-vous découvrir ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-EDU-18$bc$, 1, 18, $bc$Éducation et famille$bc$,
  $bc$Le candidat parle de l'éducation qu'il a reçue ou qu'il donne, raconte un souvenir d'école ou d'apprentissage familial marquant et évoque ses valeurs éducatives pour sa propre famille au Canada.$bc$,
  $bc$Parlons éducation, apprentissage et transmission : pouvez-vous décrire l'éducation que vous avez reçue, ou celle que vous donnez ou aimeriez donner un jour ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Quelles valeurs, règles ou habitudes ont été importantes dans votre éducation ?$bc$, $bc$Racontez-moi un souvenir scolaire, une leçon de vie donnée par un proche ou un moment où vous avez appris quelque chose d'important.$bc$, $bc$Selon vous, quel rôle doivent jouer les parents, les enseignants et la société dans l'éducation ?$bc$, $bc$Si vous avez ou aurez des enfants, quels aspects de l'éducation canadienne souhaiteriez-vous leur transmettre ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-IMM-19$bc$, 1, 19, $bc$Immigration$bc$,
  $bc$Le candidat raconte son cheminement vers le projet d'immigration au Canada, décrit les étapes déjà franchies et évoque ce qu'il attend de son installation.$bc$,
  $bc$Parlons de votre projet d'immigration au Canada : depuis quand y pensez-vous, et qu'est-ce qui vous a décidé(e) à franchir le pas ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Quelles personnes, quelles rencontres ou quels faits ont influencé votre choix ?$bc$, $bc$Racontez-moi une étape importante de votre parcours : une demande, un entretien, une annonce de résultats, une préparation difficile.$bc$, $bc$Quelles sont vos plus grandes attentes, mais aussi vos craintes, par rapport à l'immigration ?$bc$, $bc$Dans un an, après votre installation, quels petits signes vous permettront de dire que vous commencez à être bien intégré(e) ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T1-MED-20$bc$, 1, 20, $bc$Médias sociaux$bc$,
  $bc$Le candidat décrit son usage des réseaux sociaux, raconte une expérience positive ou négative liée aux réseaux, et explique comment il compte gérer sa présence en ligne au Canada.$bc$,
  $bc$Parlons réseaux sociaux, communautés en ligne et usages numériques : quelles plateformes utilisez-vous, avec quelle fréquence et dans quel but ?$bc$,
  120, 0, $bc$full$bc$,
  ARRAY[$bc$Se présenter soi-même$bc$, $bc$Décrire une situation personnelle$bc$, $bc$Raconter un événement passé$bc$, $bc$Évoquer un projet ou une hypothèse future$bc$],
  ARRAY[$bc$Qu'est-ce qui vous plaît, et au contraire vous déplaît, dans les réseaux sociaux ?$bc$, $bc$Racontez-moi une expérience marquante sur les réseaux : une belle rencontre, un contenu inspirant ou au contraire une situation désagréable.$bc$, $bc$Pensez-vous que les réseaux aident à créer du lien, ou au contraire qu'ils peuvent isoler ?$bc$, $bc$Au Canada, comptez-vous utiliser les réseaux pour retrouver des communautés, créer un réseau professionnel ou partager votre aventure ? Comment ?$bc$],
  $bc$Examinateur habilité TCF Canada, vouvoiement$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-BEN-01$bc$, 2, 1, $bc$Bénévolat$bc$,
  $bc$Le candidat contacte une association d'aide aux personnes âgées pour se renseigner sur les missions de bénévolat, les horaires, les formations et s'inscrire ou non.$bc$,
  $bc$Bonjour ! Je suis bénévole dans l'association Aînés du Cœur depuis un an. Vous avez rempli notre formulaire d'intérêt, pouvez-vous me dire ce qui vous motive à vous engager auprès des personnes âgées ?$bc$,
  210, 120, $bc$quick$bc$,
  ARRAY[$bc$Présenter sa motivation$bc$, $bc$Demander des informations précises$bc$, $bc$Réagir aux contraintes$bc$, $bc$Se positionner sur un engagement$bc$],
  NULL,
  $bc$Ami(e) bénévole dans une association d'aide aux personnes âgées, tutoiement$bc$, $bc$Personne intéressée par le bénévolat$bc$,
  ARRAY[$bc$Association : Aînés du Cœur, bureau rue des Lilas, ouvert lun-ven 9h-17h$bc$, $bc$Missions proposées : visites à domicile, accompagnement aux courses, ateliers mémoire$bc$, $bc$Engagement minimum demandé : 2h par semaine sur 6 mois$bc$, $bc$Formation initiale : 3 samedis matin obligatoires début novembre$bc$, $bc$Coût : pas d'adhésion, assurance responsabilité civile fournie$bc$, $bc$Bénévoles actuels : 42 personnes, âge moyen 38 ans, 60% de femmes$bc$, $bc$Prochaine réunion d'information : jeudi 10 octobre à 18h30$bc$],
  $bc$Au bout de 2 minutes 30, préciser qu'il ne reste plus que 4 places pour la session de novembre et qu'une décision doit être prise avant mardi soir — inciter le candidat à peser le pour et le contre et à se décider vite.$bc$,
  ARRAY[$bc$bénévolat$bc$, $bc$association$bc$, $bc$personnes âgées$bc$, $bc$engagement$bc$, $bc$mission$bc$, $bc$visite$bc$, $bc$accompagnement$bc$, $bc$formation$bc$, $bc$adhésion$bc$, $bc$horaire$bc$, $bc$disponibilité$bc$, $bc$écoute$bc$, $bc$partage$bc$, $bc$solidaire$bc$, $bc$rencontre$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-CUL-02$bc$, 2, 2, $bc$Culture et loisirs$bc$,
  $bc$Le candidat appelle un centre culturel pour renseigner la sortie de sa classe : tarifs, horaires, place pour un groupe de 25 élèves, atelier optionnel et date de réservation.$bc$,
  $bc$Bonjour, ici le centre culturel La Rotonde, service des groupes. Je suis Lise, comment puis-je vous aider pour la sortie scolaire dont vous nous avez parlé ?$bc$,
  210, 120, $bc$quick$bc$,
  ARRAY[$bc$Présenter le contexte et le groupe$bc$, $bc$Obtenir les informations pratiques$bc$, $bc$Choisir une option d'atelier$bc$, $bc$Conclure la réservation$bc$],
  NULL,
  $bc$Chargée de groupes au centre culturel La Rotonde, vouvoiement professionnel$bc$, $bc$Professeur ou accompagnateur de groupe scolaire$bc$,
  ARRAY[$bc$Exposition en cours : « La Mauricie vue par les peintres », jusqu'au 15 novembre$bc$, $bc$Tarif groupe scolaire : 7 $ par élève, gratuité pour 2 accompagnateurs$bc$, $bc$Horaires groupes : mardi et jeudi matin, créneaux 9h30 ou 11h$bc$, $bc$Atelier optionnel 1h : peinture acrylique (10 $ supp) ou médiation papier (6 $ supp)$bc$, $bc$Capacité max par visite groupe : 30 personnes$bc$, $bc$Dépôt de chèque d'arrhes : 20% du total, sous 8 jours$bc$, $bc$Annulation gratuite jusqu'à 7 jours avant$bc$],
  $bc$À mi-parcours, annoncer que le créneau de 9h30 le jeudi est déjà réservé par un autre groupe ; proposer soit 11h le jeudi, soit 9h30 le mardi suivant — obliger le candidat à arbitrer, à vérifier l'emploi du temps des élèves et à proposer une solution de repli.$bc$,
  ARRAY[$bc$centre culturel$bc$, $bc$exposition$bc$, $bc$peinture$bc$, $bc$groupe scolaire$bc$, $bc$réservation$bc$, $bc$tarif$bc$, $bc$horaire$bc$, $bc$atelier$bc$, $bc$accompagnateur$bc$, $bc$élèves$bc$, $bc$annulation$bc$, $bc$arrhes$bc$, $bc$médiation$bc$, $bc$acrylique$bc$, $bc$visite guidée$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-LOG-03$bc$, 2, 3, $bc$Logement$bc$,
  $bc$Le candidat appelle un propriétaire pour visiter un appartement, poser des questions sur le loyer, les charges, l'équipement, le bail, les animaux et tenter de convaincre de retenir sa candidature.$bc$,
  $bc$Bonjour, vous m'avez envoyé un message au sujet de l'annonce de l'appartement du boulevard Saint-Joseph. Merci de m'appeler. Avant de fixer la visite, pouvez-vous d'abord me dire ce que vous recherchez exactement ?$bc$,
  210, 120, $bc$quick$bc$,
  ARRAY[$bc$Présenter sa situation et ses besoins$bc$, $bc$Poser les questions pratiques$bc$, $bc$Négocier certains points$bc$, $bc$Convaincre d'être un bon locataire$bc$],
  NULL,
  $bc$Propriétaire, vouvoiement courtois mais ferme$bc$, $bc$Candidat à la location$bc$,
  ARRAY[$bc$Loyer : 1 250 $ par mois, chauffage et électricité en sus$bc$, $bc$4,5 pièces, 2e étage sans ascenseur, 68 m²$bc$, $bc$Quartier résidentiel et calme, métro à 12 minutes à pied$bc$, $bc$Bail 12 mois reconductible, possibilité de sous-louer 1 mois par an sur accord$bc$, $bc$Logement non meublé ; cuisinière et frigo fournis par le propriétaire, laveuse/sécheuse à acheter soi-même$bc$, $bc$Stationnement extérieur disponible en option : 40 $ par mois$bc$, $bc$Animaux : chats acceptés, chiens refusés quelle que soit la taille$bc$, $bc$Visites possibles uniquement les soirs de semaine entre 18h et 20h$bc$],
  $bc$À mi-parcours, préciser qu'une autre personne a déjà visité et doit répondre sous 48 heures — obliger le candidat à réagir, à négocier ou à se positionner rapidement.$bc$,
  ARRAY[$bc$appartement$bc$, $bc$propriétaire$bc$, $bc$loyer$bc$, $bc$bail$bc$, $bc$visite$bc$, $bc$charges$bc$, $bc$quartier$bc$, $bc$stationnement$bc$, $bc$animaux$bc$, $bc$meublé$bc$, $bc$non meublé$bc$, $bc$ascenseur$bc$, $bc$locataire$bc$, $bc$dossier de location$bc$, $bc$caution$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-EMP-04$bc$, 2, 4, $bc$Emploi$bc$,
  $bc$Le candidat passe un entretien d'embauche pour un poste d'assistant administratif bilingue dans une PME : présenter son parcours, argumenter sur ses points forts et répondre aux objections du recruteur.$bc$,
  $bc$Bonjour et merci d'être venu(e) pour ce poste d'assistant administratif bilingue. Pour commencer, pouvez-vous vous présenter et expliquer pourquoi notre PME spécialisée dans l'import-export vous intéresse plus particulièrement ?$bc$,
  210, 120, $bc$quick$bc$,
  ARRAY[$bc$Se présenter et relier parcours au poste$bc$, $bc$Argumenter sur compétences clés$bc$, $bc$Répondre aux objections du recruteur$bc$, $bc$Poser questions et se positionner salaire$bc$],
  NULL,
  $bc$Recruteur DRH d'une PME d'import-export, vouvoiement professionnel$bc$, $bc$Candidat au poste d'assistant administratif bilingue$bc$,
  ARRAY[$bc$PME Import Nord-Sud, 22 employés, bureaux à Laval$bc$, $bc$Poste : assistant administratif bilingue, remplacement congé maternité 12 mois$bc$, $bc$Mission principale : gestion commandes, suivi clients Canada et Europe, archivage$bc$, $bc$Compétences requises : Word/Excel niveau avancé, anglais courant, rigueur$bc$, $bc$Horaires : lundi-vendredi 9h-17h30, 1 jour télétravail possible après 3 mois$bc$, $bc$Salaire proposé : entre 42 000 $ et 47 000 $ annuels selon expérience$bc$, $bc$Avantages : assurance collective 50% employeur, 3 semaines vacances, formation continue 1 000 $/an$bc$, $bc$Décision attendue sous 10 jours, prise de poste souhaitée début novembre$bc$],
  $bc$À mi-parcours, expliquer qu'un second candidat maîtrise un logiciel SAP que l'entreprise déploiera dans 6 mois et que c'est un point d'attention important — inviter le candidat à rebondir, à valoriser sa capacité d'apprentissage et à proposer une solution concrète (formation rapide, auto-formation).$bc$,
  ARRAY[$bc$entretien d'embauche$bc$, $bc$recruteur$bc$, $bc$CV$bc$, $bc$parcours professionnel$bc$, $bc$compétences$bc$, $bc$bilingue$bc$, $bc$assistant administratif$bc$, $bc$PME$bc$, $bc$salaire$bc$, $bc$avantages sociaux$bc$, $bc$télétravail$bc$, $bc$formation$bc$, $bc$rigueur$bc$, $bc$archivage$bc$, $bc$gestion de commandes$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-FOR-05$bc$, 2, 5, $bc$Formation$bc$,
  $bc$Le candidat s'entretient avec un conseiller en formation continue pour valider son inscription à un AEC en Gestion de projet digital : prérequis, financement, rythme, stages et débouchés.$bc$,
  $bc$Bonjour, je suis votre conseiller formation au Collège de l'Estrie. Merci d'avoir pris rendez-vous au sujet de l'AEC Gestion de projet digital. Avant d'aller plus loin, pouvez-vous me rappeler votre parcours et ce qui vous amène vers cette formation précisément ?$bc$,
  210, 120, $bc$quick$bc$,
  ARRAY[$bc$Présenter parcours et projet professionnel$bc$, $bc$Vérifier prérequis et modalités$bc$, $bc$Mettre en place financement$bc$, $bc$Valider l'inscription ou non$bc$],
  NULL,
  $bc$Conseiller en formation continue, collège public, vouvoiement professionnel$bc$, $bc$Étudiant ou professionnel en reconversion$bc$,
  ARRAY[$bc$Formation : AEC Gestion de projet digital, Collège de l'Estrie, Sherbrooke$bc$, $bc$Durée : 10 mois, rentrée 6 janvier 2026, 28 h/semaine en présentiel$bc$, $bc$Prérequis : DEC ou 2 années d'expérience professionnelle, test de français B2$bc$, $bc$Frais de scolarité : 8 900 $, matériel inclus, logiciels fournis$bc$, $bc$Financement possible : prêt/bourse gouvernemental, crédit d'impôt, chômage-formation, plan individuel RT$bc$, $bc$Stage obligatoire : 6 semaines à mi-parcours, réseau de 38 entreprises partenaires$bc$, $bc$Débouchés déclarés : 82% des diplômés en emploi lié dans les 6 mois, salaire médian 52 k$$bc$, $bc$Date limite dépôt dossier : 30 novembre prochain, places limitées à 32$bc$],
  $bc$Après 2 minutes, annoncer qu'il ne reste plus que 3 places sur les 32 initiales et que le dossier de candidature doit être complet (lettre de motivation + CV + preuve de français) d'ici 15 jours maximum — le candidat doit réagir rapidement, demander les détails du dossier et proposer un plan d'action précis.$bc$,
  ARRAY[$bc$formation continue$bc$, $bc$AEC$bc$, $bc$gestion de projet$bc$, $bc$digital$bc$, $bc$conseiller$bc$, $bc$collège$bc$, $bc$prérequis$bc$, $bc$financement$bc$, $bc$stage$bc$, $bc$débouchés$bc$, $bc$scolarité$bc$, $bc$bourse$bc$, $bc$prêt étudiant$bc$, $bc$reconversion$bc$, $bc$inscription$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-VOY-09$bc$, 2, 6, $bc$Voyages$bc$,
  $bc$Le candidat appelle une agence de voyage pour réserver un forfait Québec-Gaspésie pour 4 adultes en septembre : dates, options, assurances, prix, modalités de paiement et modification.$bc$,
  $bc$Bonjour, ici Évasion Nordique, agence de voyage spécialisée dans le Québec. Je vois que vous avez consulté notre forfait Gaspésie 10 jours. Pouvez-vous me préciser vos dates, le nombre de voyageurs et ce que vous attendez de ce séjour ?$bc$,
  210, 120, $bc$quick$bc$,
  ARRAY[$bc$Présenter projet voyageurs et budget$bc$, $bc$Choisir dates et options$bc$, $bc$Comparer tarifs et assurances$bc$, $bc$Finaliser la réservation$bc$],
  NULL,
  $bc$Conseillère voyages, agence spécialisée Québec, vouvoiement professionnel$bc$, $bc$Client voyageur organisant un séjour pour 4 adultes$bc$,
  ARRAY[$bc$Forfait : Gaspésie 10 jours / 9 nuits, base 4 adultes partageant une chambre double$bc$, $bc$Dates possibles septembre : semaine 1, 2 ou 3 ; prix augmente de 15% semaine de la Fête du Travail$bc$, $bc$Inclus : vol Québec-Montréal aller-retour, hôtels 3 étoiles, petit-déjeuner, transport bus, 2 visites guidées$bc$, $bc$Options : observation des baleines (120 $/pers), dîner homard (75 $/pers), guide francophone privé (+1 000 $ groupe)$bc$, $bc$Assurance annulation : 3,5% du montant, couvre maladie, imprévus travail, catastrophes météo$bc$, $bc$Paiement : 30% à la réservation, solde 45 jours avant départ ; carte de crédit acceptée$bc$, $bc$Politique modification : 1 changement de date gratuit avant 60 jours, sinon 200 $ de frais$bc$],
  $bc$À mi-parcours, préciser qu'un groupe de 6 a réservé la semaine 1 ce matin, donc seule la semaine 2 reste disponible au tarif initial, sinon la semaine 3 au tarif +8% — contraindre le candidat à renégocier, à solliciter une remise sur l'option baleines ou à demander un délai de réflexion.$bc$,
  ARRAY[$bc$agence de voyage$bc$, $bc$forfait$bc$, $bc$Gaspésie$bc$, $bc$Québec$bc$, $bc$séjour$bc$, $bc$hôtel$bc$, $bc$vol$bc$, $bc$option$bc$, $bc$assurance$bc$, $bc$annulation$bc$, $bc$réservation$bc$, $bc$paiement$bc$, $bc$chambre double$bc$, $bc$visite guidée$bc$, $bc$observation baleines$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-COL-19$bc$, 2, 7, $bc$Collège$bc$,
  $bc$Le candidat rencontre un agent d'admission du Collège Maisonneuve à Montréal pour confirmer son dossier de demande d'admission en Techniques de soins infirmiers : documents manquants, entrevue, seuil, cégeps équivalents.$bc$,
  $bc$Bonjour, je suis l'agent d'admission chargé de votre dossier en Techniques de soins infirmiers. Merci d'être venu(e). Faisons le point : pouvez-vous me rappeler votre parcours secondaire et ce qui vous motive pour le métier d'infirmier/infirmière ?$bc$,
  210, 120, $bc$quick$bc$,
  ARRAY[$bc$Présenter parcours et motivation$bc$, $bc$Corriger lacunes dossier$bc$, $bc$Négocier dates et entrevue$bc$, $bc$Planifier suite du parcours$bc$],
  NULL,
  $bc$Agent d'admission collégial, vouvoiement institutionnel$bc$, $bc$Étudiant demandant admission CSI$bc$,
  ARRAY[$bc$Formation : Techniques de soins infirmiers (3 ans DEC), Collège Maisonneuve, Montréal$bc$, $bc$Rentrée : septembre 2026, places 180, 720 demandes l'an dernier$bc$, $bc$Prérequis : DES + maths SN séquence 5 ou TS 5 + chimie 5 + sciences physique 4$bc$, $bc$Documents attendus : copie DES, bulletins, extrait naissance, pièce identité, attestation français$bc$, $bc$Il manque dans le dossier du candidat : attestation d'études secondaires équivalentes et lettre de motivation$bc$, $bc$Seuil 2025 moyenne générale : 82%, entrevue de motivation pour candidatures entre 78% et 82%$bc$, $bc$Dates importantes : 1er mars fin dépôt, entrevues 15-20 mai, réponse 1er juin$bc$, $bc$Logement proximité : résidence étudiante 5 min à pied, 690 $/mois, liste d'attente 3 semaines$bc$],
  $bc$Après deux minutes, préciser que la session d'entrevue du 17 mai est complète et qu'il ne reste que 4 créneaux le 20 mai matin — obliger le candidat à réagir, à vérifier ses disponibilités, à demander une session alternative ou à argumenter pour obtenir une entrevue virtuelle.$bc$,
  ARRAY[$bc$collège$bc$, $bc$admission$bc$, $bc$DEC$bc$, $bc$soins infirmiers$bc$, $bc$agent d'admission$bc$, $bc$prérequis$bc$, $bc$DES$bc$, $bc$bulletin$bc$, $bc$moyenne générale$bc$, $bc$entrevue$bc$, $bc$dossier$bc$, $bc$date limite$bc$, $bc$résidence étudiante$bc$, $bc$formation$bc$, $bc$métiers de la santé$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-IDE-06$bc$, 2, 8, $bc$Identité et projet$bc$,
  $bc$Le candidat rencontre un agent d'accueil francophone dans un organisme d'intégration pour s'inscrire au programme d'accueil : documents, cours de langue, parrainage, orientations professionnelles.$bc$,
  $bc$Bonjour et bienvenue à Accueil Francophonie Plus. Je vais vous aider à préparer votre inscription. D'abord, pouvez-vous me parler un peu de vous, de votre parcours et de ce que vous attendez de nous dans les premiers mois ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Se présenter et décrire son arrivée$bc$, $bc$Lister documents et démarches$bc$, $bc$Choisir service adapté$bc$, $bc$Planifier premières semaines$bc$],
  NULL,
  $bc$Agent d'accueil organisme d'intégration, vouvoiement chaleureux$bc$, $bc$Nouveau résident permanent arrivé il y a 3 semaines$bc$,
  ARRAY[$bc$Organisme : Accueil Francophonie Plus, centre-ville, lundi au vendredi 8h30-16h30$bc$, $bc$Services offerts : cours FLS 6 h/sem, atelier recherche emploi, parrainage citoyen, aide administrative$bc$, $bc$Documents demandés inscription : CSQ, COPR, permis de travail, adresse postale, numéro de téléphone$bc$, $bc$Cours de FLS : 4 niveaux, test de positionnement préalable obligatoire$bc$, $bc$Atelier recherche emploi : 4 séances hebdomadaires, réservation en ligne$bc$, $bc$Parrainage : mise en relation avec famille locale, délai moyen 21 jours$bc$, $bc$Aide sociale : service oriente vers bureau CSSS pour démarches RAMQ et allocation$bc$],
  $bc$Après 2 minutes 30, annoncer que le cours de FLS niveau intermédiaire le matin est complet jusqu'à janvier et qu'il n'y a plus que le soir (18h-20h, 2 soirs/semaine) ou la classe accélérée le samedi (9h-15h) — contraindre le candidat à comparer, à argumenter sur ses disponibilités d'horaire et à proposer un compromis test 2 semaines.$bc$,
  ARRAY[$bc$intégration$bc$, $bc$accueil$bc$, $bc$résident permanent$bc$, $bc$CSQ$bc$, $bc$COPR$bc$, $bc$cours de français$bc$, $bc$FLS$bc$, $bc$parrainage$bc$, $bc$recherche d'emploi$bc$, $bc$démarche administrative$bc$, $bc$test de positionnement$bc$, $bc$allocation$bc$, $bc$RAMQ$bc$, $bc$logement$bc$, $bc$service à la communauté$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-TRA-07$bc$, 2, 9, $bc$Travail et équipe$bc$,
  $bc$Le candidat est convoqué par son supérieur pour un entretien de mi-année : objectifs, charge de travail, tension avec une collègue, demande de télétravail plus régulier, augmentation.$bc$,
  $bc$Bonjour, merci d'avoir accepté ce point mi-parcours. Asseyons-nous. Pourriez-vous commencer par me donner votre ressenti sur les 6 derniers mois, les objectifs atteints et les points de difficulté que vous rencontrez dans l'équipe ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Bilan mi-annuel objectifs atteints$bc$, $bc$Aborder tension collègue$bc$, $bc$Négocier télétravail et charge$bc$, $bc$Demander augmentation$bc$],
  NULL,
  $bc$Supérieur hiérarchique chef de département marketing, vouvoiement professionnel$bc$, $bc$Employé chargé de communication depuis 1 an 8 mois$bc$,
  ARRAY[$bc$Équipe marketing : 6 personnes, bureau Griffintown, Montréal$bc$, $bc$Objectifs début année : 4 campagnes digitales, taux de conversion +15%, satisfaction client >88%$bc$, $bc$Réalisation à 6 mois : 3 campagnes livrées, conversion +11%, satisfaction 91%$bc$, $bc$Contexte tension : collègue senior Julie refuse systématiquement de passer par la relecture créative$bc$, $bc$Télétravail actuel : 1 jour/semaine, contrat prévoit jusqu'à 2 jours après 2 ans$bc$, $bc$Échelle salariale entreprise : augmentation annuelle moyenne 3,5%, 5% pour top 20%$bc$, $bc$Salaire actuel du candidat : 58 000 $, échelon 3$bc$, $bc$Budget équipe augmentation 2026 : 4,1%$bc$],
  $bc$À mi-parcours, annoncer qu'une vague de départs est prévue dans 2 mois (départs 2 personnes) et que la charge va encore augmenter d'ici fin d'année, donc la question du télétravail supplémentaire est suspendue jusqu'à nouvel ordre — obliger le candidat à argumenter contre, proposer un plan B (réunion priorisation) et à chiffrer ses arguments d'augmentation.$bc$,
  ARRAY[$bc$entretien annuel$bc$, $bc$objectifs$bc$, $bc$charge de travail$bc$, $bc$télétravail$bc$, $bc$supérieur$bc$, $bc$équipe$bc$, $bc$augmentation$bc$, $bc$campagne digitale$bc$, $bc$conversion$bc$, $bc$marketing$bc$, $bc$tension$bc$, $bc$collègue$bc$, $bc$bilan$bc$, $bc$performance$bc$, $bc$échelon salarial$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-ETU-08$bc$, 2, 10, $bc$Études$bc$,
  $bc$Le candidat discute avec sa conseillère pédagogique au cégep pour choisir ses cours complémentaires de dernière session, ajuster sa charge et valider l'obtention du DEC en juin.$bc$,
  $bc$Bonjour ! Ravi(e) de vous revoir pour cette dernière session. Faisons d'abord le point sur le bulletin de l'hiver dernier, puis regardons quels cours complémentaires choisir pour terminer votre DEC en juin. Quels objectifs professionnels avez-vous maintenant ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Faire le bilan de la session précédente$bc$, $bc$Choisir cours complémentaires$bc$, $bc$Négocier allègement charge$bc$, $bc$Valider cheminement DEC$bc$],
  NULL,
  $bc$Conseillère pédagogique cégep public, vouvoiement professionnel$bc$, $bc$Étudiant DEC Sciences humaines dernière session$bc$,
  ARRAY[$bc$Programme : DEC Sciences humaines profil administration, cégep Ahuntsic$bc$, $bc$Session hivernale : 4 cours réussis, 1 échec en macroéconomie (note 56)$bc$, $bc$Crédits déjà accumulés : 58/64, il reste 6 crédits obligatoires + 2 complémentaires$bc$, $bc$Cours obligatoires restants : macroéconomie, éthique professionnelle, sociologie du travail$bc$, $bc$Cours complémentaires proposés automne : Cinéma québécois, Développement durable, Initiation au yoga, Philosophie de l'esprit$bc$, $bc$Charge max recommandée session finale : 4 cours ; 5 cours possible avec accord$bc$, $bc$Date limite désistement sans échec : 15 septembre$bc$, $bc$Bourse d'excellence : seuil 80% moyenne cumulative sur les 3 sessions précédentes$bc$],
  $bc$Après 2 minutes 30, annoncer que le cours de macroéconomie ne sera offert qu'à l'hiver prochain à cause d'un départ à la retraite inattendu — le candidat ne peut donc terminer en juin ; il doit réagir, proposer une équivalence, un cours d'été accéléré ou un transfert dans un autre cégep et négocier avec la conseillère.$bc$,
  ARRAY[$bc$cégep$bc$, $bc$DEC$bc$, $bc$conseillère pédagogique$bc$, $bc$cours complémentaire$bc$, $bc$bulletin$bc$, $bc$crédits$bc$, $bc$échec scolaire$bc$, $bc$équivalence$bc$, $bc$sciences humaines$bc$, $bc$macroéconomie$bc$, $bc$session$bc$, $bc$moyenne cumulative$bc$, $bc$boursed'études$bc$, $bc$profil$bc$, $bc$désistement$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-FAM-10$bc$, 2, 11, $bc$Famille et garde d'enfants$bc$,
  $bc$Le candidat appelle un service de garde éducatif en CPE pour inscrire son enfant de 3 ans : places, tarifs subventionnés, horaires, pédagogie, liste d'attente et visite.$bc$,
  $bc$Bonjour, ici le CPE Les Petits Soleils, direction. Merci de votre appel. Votre enfant a bien 3 ans en septembre ? Parfait. Avant toute chose, pouvez-vous me décrire votre situation familiale, votre horaires de travail et ce que vous attendez d'un service de garde ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Présenter situation familiale et horaires$bc$, $bc$Poser questions pratiques$bc$, $bc$Inscrire enfant liste attente$bc$, $bc$Obtenir rendez-vous visite$bc$],
  NULL,
  $bc$Directrice CPE, vouvoiement professionnel et chaleureux$bc$, $bc$Parent d'un enfant de 3 ans, primo-arrivant$bc$,
  ARRAY[$bc$CPE Les Petits Soleils : 48 places, quartier Rosemont, Montréal$bc$, $bc$Tranche d'âge du candidat : 3 ans = groupe 18 enfants, 2 éducatrices$bc$, $bc$Tarif réduit : selon revenu familial, entre 8,05 $ et 20 $/jour, crédit d'impôt provincial$bc$, $bc$Horaires normaux : 7h30 à 18h, accueil prolongé 7h00 moyennant 7 $/jour$bc$, $bc$Approche pédagogique : programme HighScope, sorties hebdomadaires parc, 1 séance éveil musical/semaine$bc$, $bc$Nourriture : 2 collations + repas chaud inclus, menu affiché, accommodements allergies possibles$bc$, $bc$Liste d'attente actuelle : 21 familles dans la tranche 3 ans$bc$, $bc$Visites portes ouvertes : chaque premier mercredi soir du mois 17h30-19h00$bc$],
  $bc$À mi-parcours, préciser qu'une place vient de se libérer pour un enfant de 3 ans mais seulement du lundi au jeudi et que la famille doit prendre sa décision avant 18h ce soir — contraindre le candidat à vérifier l'horaire du conjoint, à imaginer solution le vendredi (grand-parent, halte-garderie) et à argumenter sa priorité sur la liste d'attente.$bc$,
  ARRAY[$bc$CPE$bc$, $bc$service de garde$bc$, $bc$enfant$bc$, $bc$éducatrice$bc$, $bc$tarif subventionné$bc$, $bc$crédit d'impôt$bc$, $bc$pédagogie$bc$, $bc$horaire$bc$, $bc$garde d'enfants$bc$, $bc$allergie alimentaire$bc$, $bc$liste d'attente$bc$, $bc$visite$bc$, $bc$programme HighScope$bc$, $bc$inscription$bc$, $bc$repas chaud$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-LOI-11$bc$, 2, 12, $bc$Loisirs et sport$bc$,
  $bc$Le candidat s'adresse à l'animateur d'un centre sportif municipal pour s'inscrire à un programme mixte course à pied et musculation : niveaux, tarifs, équipements, horaires, accès piscine et période d'essai.$bc$,
  $bc$Salut ! Bienvenue au centre sportif du Plateau. Tu viens t'inscrire au programme mixte course + musculation ? On commence : peux-tu me dire ton niveau actuel de course, tes objectifs sur 3 mois et tes contraintes d'horaires ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Présenter niveau et objectifs$bc$, $bc$Comparer formules abonnement$bc$, $bc$Valider horaires et équipements$bc$, $bc$S'inscrire période d'essai$bc$],
  NULL,
  $bc$Animateur sportif centre municipal plateau montréalais, tutoiement dynamique$bc$, $bc$Adulte débutant-intermédiaire, reprise sportive$bc$,
  ARRAY[$bc$Centre sportif Plateau-Mont-Royal : piscine olympique, gymnase musculation 60 équipements, 2 pistes 2 km extérieures$bc$, $bc$Programme mixte course/musculation : 3 créneaux/semaine, lundi/mercredi/soir + samedi matin$bc$, $bc$Niveaux proposés : Débutant (5 km / mois 1), Intermédiaire (10 km, semi en vue), Confirmé (semi ou marathon)$bc$, $bc$Tarifs résidents : 185 $ trimestre, 520 $ annuel ; non résidents +30%$bc$, $bc$Abonnement inclut : coach 1 séance/sem, plan individuel, accès piscine tous jours$bc$, $bc$Période d'essai : 2 séances consécutives 20 $ remboursables si inscription sous 10 jours$bc$, $bc$Équipements à prévoir : souliers running, vêtements technique, serviette, cadenas$bc$, $bc$Prochaine rentrée programme : lundi 23 septembre, 12 places par niveau$bc$],
  $bc$Au bout de 2 minutes, annoncer que le niveau Intermédiaire est déjà complet mais qu'il reste 5 places Confirmé et 4 places Débutant — proposer de commencer Débutant 1 mois avec une réévaluation gratuite, obliger le candidat à argumenter son niveau réel et à négocier une place sur liste d'attente Intermédiaire.$bc$,
  ARRAY[$bc$centre sportif$bc$, $bc$musculation$bc$, $bc$course à pied$bc$, $bc$abonnement$bc$, $bc$tarif$bc$, $bc$niveau$bc$, $bc$coach$bc$, $bc$semi-marathon$bc$, $bc$piscine$bc$, $bc$équipements$bc$, $bc$résident municipal$bc$, $bc$objectifs sportifs$bc$, $bc$cadenas$bc$, $bc$trimestre$bc$, $bc$réévaluation$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-LAN-12$bc$, 2, 13, $bc$Langue et traduction$bc$,
  $bc$Le candidat téléphone à une agence de traduction pour obtenir un devis officiel : acte de naissance + diplôme universitaire + relevés de notes + lettre de recommandation, délais urgent standard, qualité certifiée.$bc$,
  $bc$Bonjour, ici Traduction Certifiée Nord-Sud, bureau de Québec. Je m'occupe de votre demande de devis. Pour commencer, pouvez-vous me lister précisément les documents à traduire, leur langue de départ et le délai dont vous disposiez ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Présenter documents langues$bc$, $bc$Négocier délais et tarifs$bc$, $bc$Choisir niveau de certification$bc$, $bc$Valider paiement et livraison$bc$],
  NULL,
  $bc$Responsable agence traduction certifiée, vouvoiement professionnel$bc$, $bc$Client nécessitant traductions pour immigration IRCC$bc$,
  ARRAY[$bc$Documents candidature IRCC : acte de naissance, diplôme licence, 2 relevés notes, 1 lettre recommandation$bc$, $bc$Langues : espagnol (documents officiels) → français canadien certifié$bc$, $bc$Tarifs par page standard (250 mots) : 0,31 $/mot standard, 0,48 $/mot urgent, minimum 45 $ par document$bc$, $bc$Délai standard : 48 h ouvrées, délai urgent : 24 h ouvrées +55%, express nuit : sur devis$bc$, $bc$Certification : traducteur agréé OTTIAQ, tampon officiel, lettre d'attestation jointe - OBLIGATOIRE IRCC$bc$, $bc$Livraison : PDF + 2 copies papier envoyées Postes Canada régulière; Xpresspost 2 jours +28 $$bc$, $bc$Moyen paiement : virement bancaire, carte VISA/MC, PayPal (+2,5%)$bc$, $bc$Politique confidentialité : RGPD + Loi sur la protection des renseignements personnels, documents détruits après 12 mois$bc$],
  $bc$Après 2 minutes, préciser qu'une erreur système a doublé les commandes de ce jour et que le délai standard passe à 72 heures, sauf si le candidat accepte l'option express à +25% (au lieu de 55%) parce que le responsable veut lui faire une faveur — obliger le candidat à vérifier, à comparer le coût réel, à argumenter sur l'engagement initial et à demander une compensation (copies gratuites, réduction sur certificat).$bc$,
  ARRAY[$bc$traduction$bc$, $bc$certifiée$bc$, $bc$acte de naissance$bc$, $bc$diplôme$bc$, $bc$relevé de notes$bc$, $bc$IRCC$bc$, $bc$OTTIAQ$bc$, $bc$devis$bc$, $bc$délai$bc$, $bc$urgent$bc$, $bc$tarif$bc$, $bc$langue$bc$, $bc$attestation$bc$, $bc$confidentialité$bc$, $bc$Postes Canada$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-TEC-13$bc$, 2, 14, $bc$Technologie et dépannage$bc$,
  $bc$Le candidat contacte le support d'un FAI pour panne internet à domicile depuis 2 jours : diagnostic, rendez-vous technicien, dédommagement, prêt box 4G et résiliation possible si problème récurrent.$bc$,
  $bc$Bonjour, support technique Vidéotron Express. Je vois votre adresse au 1415 avenue Maple, Montréal. Je comprends que votre connexion est instable depuis mercredi. Pouvez-vous me décrire les symptômes exacts : plus de réseau du tout, coupures fréquentes ou seulement débit très faible ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Décrire panne et symptômes$bc$, $bc$Suivre procédure diagnostic$bc$, $bc$Négocier RDV technicien$bc$, $bc$Obtenir dédommagement$bc$],
  NULL,
  $bc$Technicien support niveau 2 FAI, vouvoiement professionnel$bc$, $bc$Abonné depuis 2 ans, freelance dépendant connexion$bc$,
  ARRAY[$bc$Contrat actuel : Internet 400 illimité + téléphone résidentiel, 79,95 $/mois + tx$bc$, $bc$Symptômes signalés : LED modem rouge clignote toutes les 90 secondes, débit descendant mesuré 2,8 Mbps$bc$, $bc$Diagnostic à distance : port optical -27 dB (seuil OK -8 à -24), suspect câble extérieur endommagé$bc$, $bc$RDV techniciens disponibles : mardi 10-14h OU jeudi 14-18h$bc$, $bc$Prêt box 4G en attente : retirer boutique Langelier avant 20h, caution 50 $ remboursable$bc$, $bc$Politique dédommagement : 1 jour d'interruption = 1/30 mensualité ; problème répété >3 j : crédit 50% du mois$bc$, $bc$Résiliation sans frais : possible si panne >7 jours calendaires et SAV ne peut résoudre$bc$, $bc$Temps moyen résolution câble extérieur : 24 à 72h après passage technicien$bc$],
  $bc$À mi-parcours, expliquer que le premier rendez-vous mardi est pris par un autre client 5 minutes avant, donc seul jeudi reste — en échange, proposer 2 mois gratuits si le candidat accepte, sinon signaler qu'il peut porter plainte CRTC mais délai 3 mois — contraindre le candidat à comparer, négocier 3 mois gratuits + la box 4G livrée gratuitement ou demander à parler au superviseur.$bc$,
  ARRAY[$bc$fournisseur d'accès internet$bc$, $bc$panne$bc$, $bc$modem$bc$, $bc$diagnostic$bc$, $bc$débit$bc$, $bc$technicien$bc$, $bc$rendez-vous$bc$, $bc$dédommagement$bc$, $bc$4G$bc$, $bc$box$bc$, $bc$résiliation$bc$, $bc$CRTC$bc$, $bc$caution$bc$, $bc$câble optique$bc$, $bc$contrat$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-ENV-14$bc$, 2, 15, $bc$Environnement et copropriété$bc$,
  $bc$Le candidat intervient à une assemblée générale de copropriétaires pour présenter un projet de compostage collectif + borne recharge vélo : coûts, subventions, vote, contre-arguments des opposants, mise en œuvre.$bc$,
  $bc$Bonsoir à tous, nous ouvrons l'ordre du jour sur le projet de compostage collectif et de borne de recharge pour vélos électriques. Merci d'avoir pris la parole. Peux-tu présenter ton projet, expliquer ton rôle dans la copropriété et pourquoi tu penses qu'il nous faut passer à l'action maintenant ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Présenter projet environnemental$bc$, $bc$Argumenter coût-bénéfice$bc$, $bc$Répondre contre-arguments$bc$, $bc$Négocier adoption et vote$bc$],
  NULL,
  $bc$Président conseil d'administration copropriété, vouvoiement formel$bc$, $bc$Copropriétaire résident depuis 3 ans, membre comité vert$bc$,
  ARRAY[$bc$Copropriété : Les Terrasses du Parc, 48 logements, construction 2007, arrondissement CDN-NDG$bc$, $bc$Fonds de prévoyance actuel : 41 800 $, contribution annuelle moyenne par condo 780 $$bc$, $bc$Projet 1 : compostage collectif 4 bacs extérieurs abrités, prix fourni pose 3 200 $ + entretien 40 $/mois$bc$, $bc$Projet 2 : borne 6 vélos électriques + 6 places classiques, prix 5 800 $ subventionnable à 50% ville MTL$bc$, $bc$Subventions disponibles : programme « Vert mon quartier » - jusqu'à 60% du coût admissible$bc$, $bc$Étude récente : 32 familles sur 48 ont déclaré vouloir composter leurs déchets$bc$, $bc$Arguments opposants connus : odeur, rats, coût, utilisation faible par locataires$bc$, $bc$Règlement copropriété : projet <8 000 $ adopté à majorité simple 50% + 1 des copropriétaires présents$bc$],
  $bc$Après 3 minutes, un opposant intervient (joué par l'examinateur) : « Moi je suis contre parce que l'an dernier les bacs ont attiré des rats dans mon cabanon. Si vous passez ça, je voterai contre toute rénovation les 2 prochaines années. » — Obliger le candidat à gérer ce veto émotionnel, à proposer une solution conditionnelle (test 6 mois, borne vélo seul d'abord) et à garder l'assemblée constructive.$bc$,
  ARRAY[$bc$copropriété$bc$, $bc$conseil d'administration$bc$, $bc$assemblée générale$bc$, $bc$compostage$bc$, $bc$borne recharge$bc$, $bc$vélo électrique$bc$, $bc$fonds de prévoyance$bc$, $bc$subvention municipale$bc$, $bc$environnement$bc$, $bc$copropriétaire$bc$, $bc$locataire$bc$, $bc$vote$bc$, $bc$rat$bc$, $bc$entretien$bc$, $bc$rénovation$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-SAN-15$bc$, 2, 16, $bc$Santé et consultation$bc$,
  $bc$Le candidat rencontre un nouveau médecin de famille pour sa première consultation : antécédents, symptômes inquiétants de fatigue, examens à prescrire, renouvellement d'une ordonnance et rendez-vous de suivi.$bc$,
  $bc$Bonjour, je suis le Dr. Lefebvre, votre nouveau médecin de famille. Merci d'avoir rempli le formulaire d'antécédents. Pour commencer, pourriez-vous me dire ce qui vous amène aujourd'hui, en décrivant vos symptômes depuis leur apparition ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Décrire motif et symptômes$bc$, $bc$Rappeler antécédents médicaux$bc$, $bc$Comprendre examens ordonnés$bc$, $bc$Négocier plan de suivi$bc$],
  NULL,
  $bc$Médecin de famille GMF, vouvoiement professionnel et empathique$bc$, $bc$Patient nouvellement inscrit, 34 ans$bc$,
  ARRAY[$bc$Patient : 34 ans, non-fumeur, IMC 24, 178 cm, 76 kg, allergie à la pénicilline connue$bc$, $bc$Symptômes principaux depuis 3 semaines : fatigue matinale persistante, maux de tête 2-3x/sem, sommeil entrecoupé$bc$, $bc$Antécédents familiaux : mère hypothyroïdienne, père diabète type 2, grand-père cardiaque$bc$, $bc$Antécédents chirurgicaux : appendicectomie à 12 ans, aucun autre$bc$, $bc$Médicaments actuels : AINS occasionnels, contraception orale (2e génération)$bc$, $bc$Examens suggérés : prise de sang (TSH, glycémie, ferritine), analyse d'urine, ECG de repos$bc$, $bc$GMF : rendez-vous standard 15-20 min, urgence 3h, prises de sang lundi/mercredi matin$bc$, $bc$Renouvellement ordonnance contraception : possible 6 mois après résultats, sous réserve bilan tension$bc$],
  $bc$Après 2 minutes, le médecin ajoute : « Pour être honnête, avec vos antécédents familiaux de diabète et votre profession sédentaire, on devrait aussi faire un test d'effort sous 2 mois, mais ça coûte 220 $ et n'est pas couvert par la RAMQ. » — Obliger le candidat à poser les bonnes questions, à argumenter sur son budget limité et à négocier un échéancier ou une alternative (test en clinique universitaire, ordre d'examens priorisé).$bc$,
  ARRAY[$bc$médecin de famille$bc$, $bc$GMF$bc$, $bc$consultation$bc$, $bc$antécédents médicaux$bc$, $bc$symptôme$bc$, $bc$fatigue$bc$, $bc$prise de sang$bc$, $bc$ordonnance$bc$, $bc$contraception$bc$, $bc$RAMQ$bc$, $bc$diabète$bc$, $bc$thyroïde$bc$, $bc$test d'effort$bc$, $bc$rendez-vous de suivi$bc$, $bc$allergie pénicilline$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-ALI-16$bc$, 2, 17, $bc$Alimentation et restaurant$bc$,
  $bc$Le candidat appelle un restaurant pour réserver un dîner de 14 personnes (retraite de son père) : menu du chef, budget par convive, gâteau anniversaire, possibilité salle privative, accommodements allergies, horaire et confirmation.$bc$,
  $bc$Bonjour, restaurant Bistro Saint-Laurent, ici Sarah. Merci pour votre appel au sujet du dîner du 18 novembre pour les 74 ans de votre père. Peut-on commencer par vous : combien exactement de convives, quelles allergies alimentaires connaissez-vous déjà et quel budget global avez-vous en tête ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Présenter événement et convives$bc$, $bc$Négocier menu et budget$bc$, $bc$Réserver salle privative horaire$bc$, $bc$Valider allergies et gâteau$bc$],
  NULL,
  $bc$Responsable réservation restaurant gastronomique bistrot, vouvoiement professionnel$bc$, $bc$Enfant organisant dîner retraite père$bc$,
  ARRAY[$bc$Restaurant : Bistro Saint-Laurent, 48 couverts, 20 ans, Québec, métro St-André$bc$, $bc$Groupe : 14 personnes, âge moyen 62 ans, 11 francophones, 3 anglophones$bc$, $bc$Budget cible : 70-80 $/pers avant alcool, alcool autorisé cave maison$bc$, $bc$Menu du chef 3 services : 68 $ (potage + filet mignon / saumon + dessert) ou 82 $ 4 services avec amuse-bouche$bc$, $bc$Allergies connues dans le groupe : 2 coeliaques intolérance gluten, 1 allergie crustacés, 1 intolérance lactose$bc$, $bc$Salle privative « La Libellule » : 20 personnes max, 250 $ location, réservation confirmée 70% arrhes$bc$, $bc$Horaires : déjeuner 12h15 (2h30 max) OU dîner 18h30 (3h)$bc$, $bc$Gâteau anniversaire : 60 $ 14 parts, chocolat ou vanille, inscription sur plaque en chocolat incluse$bc$],
  $bc$À mi-parcours, annoncer que la salle privative du 18 novembre 18h30 a été réservée par un mariage ce matin ; le restaurant propose soit le 17 novembre à 18h30, soit le 18 au déjeuner 12h15 avec location privative offerte (250 $ offerts) — contraindre le candidat à contacter sa famille, à négocier un supplément offert (amuse-bouche gratuit) si report au 17, et à proposer une solution raisonnable au groupe.$bc$,
  ARRAY[$bc$restaurant$bc$, $bc$réservation$bc$, $bc$salle privative$bc$, $bc$menu$bc$, $bc$chef$bc$, $bc$budget$bc$, $bc$convives$bc$, $bc$allergie alimentaire$bc$, $bc$gluten$bc$, $bc$crustacés$bc$, $bc$lactose$bc$, $bc$gâteau d'anniversaire$bc$, $bc$amuse-bouche$bc$, $bc$arrhes$bc$, $bc$bistrot gastronomique$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-EDU-17$bc$, 2, 18, $bc$Éducation et réunion parents-profs$bc$,
  $bc$Le candidat rencontre les professeurs de son fils (11 ans, 6e année) en réunion de mi-parcours : résultats en baisse en français, agitation en classe, devoirs non faits, solution de suivi scolaire et communication.$bc$,
  $bc$Bonsoir et merci d'être venus pour cette réunion de mi-parcours avec la professeure de français et moi-même, titulaire de la classe de 6e. D'abord, votre ressenti à la maison sur la motivation et l'organisation de Thomas depuis la rentrée ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Échanger sur climat scolaire$bc$, $bc$Comprendre difficultés français$bc$, $bc$Choisir plan de soutien$bc$, $bc$Conclure protocole communication$bc$],
  NULL,
  $bc$Enseignant titulaire + collègue de français, réunion parents-profs, vouvoiement respectueux$bc$, $bc$Parent d'un élève de 11 ans, 6e année$bc$,
  ARRAY[$bc$Élève : Thomas, 11 ans, 6e année, école primaire Jean-de-la-Fontaine, quartier Saint-Hubert$bc$, $bc$Résultats français : 58% dictées, 64% lecture, 61% production écrite, moyenne classe 75%$bc$, $bc$Comportement signalé : 5 remarques pour bavardages, 3 devoirs non rendus$bc$, $bc$Observation : Thomas semble plus engagé quand on utilise les manuels numériques plutôt que papier$bc$, $bc$Soutien scolaire interne disponible : lundis après-midi 15h30-16h30, bénévoles collégiens$bc$, $bc$Orthopédagogue école : 4 séances évaluations gratuites si recommandation prof titulaire$bc$, $bc$Application classe ClassDojo : utilisée depuis 2 semaines, parent ne l'a pas activée$bc$, $bc$Prochaine étape : conseil d'école 8 décembre puis bulletin intermédiaire le 12$bc$],
  $bc$Après 2 minutes, la professeure de français ajoute : « Dernier point : hier Thomas a dit à ses amis qu'il déteste le français parce que c'est la langue de son père qui est parti. » — obliger le candidat à gérer cette révélation, à ne pas se braquer, à expliquer la situation familiale sans s'excuser et à proposer à l'école des pistes pédagogiques adaptées (poésies, bande dessinée québécoise) pour remotiver l'enfant.$bc$,
  ARRAY[$bc$réunion parents-professeurs$bc$, $bc$école primaire$bc$, $bc$6e année$bc$, $bc$résultats scolaires$bc$, $bc$apprentissage du français$bc$, $bc$devoirs$bc$, $bc$soutien scolaire$bc$, $bc$orthopédagogue$bc$, $bc$comportement$bc$, $bc$bavardage$bc$, $bc$application école$bc$, $bc$parent$bc$, $bc$élève$bc$, $bc$enseignant$bc$, $bc$motivation scolaire$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-IMM-18$bc$, 2, 19, $bc$Immigration et permis$bc$,
  $bc$Le candidat appelle IRCC Montréal pour suivre son dossier de résidence permanente : délais, documents complémentaires demandés (preuve de fonds mis à jour), casier judiciaire et rendez-vous biométrie manquant.$bc$,
  $bc$Bonjour, agent 4812, IRCC service clientèle. Je vois votre numéro de demande EXXXXXXX2026 catégorie Travailleur Qualifié Fédéral. Pouvez-vous d'abord me confirmer votre nom, votre date de naissance et me dire quelle est la raison précise de votre appel aujourd'hui ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Identifier dossier et répondre vérifications$bc$, $bc$Lister documents manquants$bc$, $bc$Comprendre délais et étapes$bc$, $bc$Planifier étapes à venir$bc$],
  NULL,
  $bc$Agent IRCC niveau 2, identification sécuritaire, vouvoiement officiel neutre$bc$, $bc$Demandeur résidence permanente Travailleur Qualifié$bc$,
  ARRAY[$bc$Catégorie : Travailleur Qualifié Fédéral, CRS 482, invité tirage 12 juin$bc$, $bc$Statut actuel : « Examens médicaux reçus, dossier en revue complémentaire » depuis le 28 juillet$bc$, $bc$Documents manquants identifiés : 1) preuve de fonds 2025 actualisée (relevés 6 derniers mois) 2) casier judiciaire pays X (traduit certifié) 3) rendez-vous biométrie (jamais pris)$bc$, $bc$Délais moyen cette catégorie : entre 142 et 204 jours calendaires$bc$, $bc$Preuve de fonds minimum famille de 2 : 21 556 $ CAN, doit être disponible sur compte accessible, pas crypto$bc$, $bc$Biométrie : 4 centres disponibles GVA Montréal (3), Laval (1), premier RDV libre 22 octobre$bc$, $bc$Attention : défaut fournir documents sous 30 jours → refus procédural, pas recours facile$bc$, $bc$Délivrance COPR moyenne après finalisation : 6 semaines$bc$],
  $bc$À mi-parcours, l'agent précise : « Malheureusement, votre demande de 30 jours supplémentaires a été refusée ce matin par l'agent traitant ; vous avez encore 10 jours exactement. » — contraindre le candidat à argumenter (voyage, documents étrangers retard), à solliciter une exception écrite par agent superviseur et à définir un plan précis à 10 jours (biometrie lundi, relevés mercredi, traduction vendredi...).$bc$,
  ARRAY[$bc$IRCC$bc$, $bc$résidence permanente$bc$, $bc$CTQ$bc$, $bc$CRS$bc$, $bc$preuve de fonds$bc$, $bc$biométrie$bc$, $bc$casier judiciaire$bc$, $bc$examen médical$bc$, $bc$COPR$bc$, $bc$demande d'immigration$bc$, $bc$délai$bc$, $bc$document certifié$bc$, $bc$refus$bc$, $bc$agent traitant$bc$, $bc$demandeur$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-MED-20$bc$, 2, 20, $bc$Médias sociaux et image$bc$,
  $bc$Le candidat s'entretient avec un community manager indépendant pour gérer le lancement de sa page professionnelle artisan menuisier : stratégie, plateformes, fréquence, budget pub, calendrier et droits images.$bc$,
  $bc$Salut ! Merci de m'avoir contacté pour ta page artisan menuisier. J'ai bien vu tes 3 photos Instagram brouillon. Pour commencer, quelle clientèle tu veux toucher : particuliers pour cuisine sur mesure, entrepreneurs PME ou les deux ? Et ton budget global sur 3 mois ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Présenter projet professionnel$bc$, $bc$Définir plateformes et cible$bc$, $bc$Élaborer stratégie et budget$bc$, $bc$Signer collaboration 3 mois$bc$],
  NULL,
  $bc$Community manager indépendant, tutoiement sympathique$bc$, $bc$Artisan menuisier indépendant 3 ans$bc$,
  ARRAY[$bc$Client : artisan menuisier, 3 ans expérience, 2 employés, atelier Longueuil$bc$, $bc$Chiffre affaires 2024 : 168 000 $, objectif 2025 +25% grâce nouveau numérique$bc$, $bc$Plateformes proposées : Instagram principal, Facebook Local, LinkedIn BtoB, TikTok 1 vidéo/semaine$bc$, $bc$Forfait CM proposé : 850 $/mois (12 posts/mois, 2 réels, 3 stories journalières + réponses commentaires)$bc$, $bc$Budget publicitaire supplémentaire recommandé : 300 $/mois Meta Ads, ciblage zip code + centres d'intérêt rénovation$bc$, $bc$Calendrier types : lundi réalisation client, mercredi astuce bois, vendredi portrait d'équipe + workshop$bc$, $bc$Droits images : client fournit photos via Dropbox, CM retouche gratuites 30 min/mois max$bc$, $bc$Résultat attendu : +35% abonnés 3 mois, minimum 8 demandes de devis/mois via DM$bc$],
  $bc$À mi-parcours, le community manager annonce : « Attention, depuis les changements Meta mars dernier, les posts artisanaux ont 18% de portée en moyenne sauf si tu paies des Reels boostés minimum 20 $ par publication. Sinon on peut migrer vers TikTok mais ça demande de la vidéo chaque semaine. » — obliger le candidat à négocier un forfait hybride, baisser la fréquence LinkedIn pour booster les Reels, obtenir 2 semaines d'essai garanti sans engagement avant contrat.$bc$,
  ARRAY[$bc$community manager$bc$, $bc$Instagram$bc$, $bc$Facebook$bc$, $bc$TikTok$bc$, $bc$LinkedIn$bc$, $bc$artisan$bc$, $bc$menuiserie$bc$, $bc$publicité ciblée$bc$, $bc$budget$bc$, $bc$plateforme$bc$, $bc$calendrier éditorial$bc$, $bc$réel vidéo$bc$, $bc$abonnés$bc$, $bc$devis$bc$, $bc$réseau social$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-ASS-21$bc$, 2, 21, $bc$Assurance automobile$bc$,
  $bc$Le candidat contacte son assurance auto après un petit accident stationnement : déclaration, franchise, rapport constat, versement indemnitaire, bonus-malus et courtoisie véhicule prêté.$bc$,
  $bc$Bonjour, ici service sinistres Auto-Promutuel, agent Sophie. Je vois votre police 234-AB-978K Peugeot 2019. Merci pour votre appel. Décrivez-moi exactement l'accident : quand, où, circonstances, y a-t-il eu blessés, échangez-vous les constats avec l'autre conducteur ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Déclarer sinistre détailler$bc$, $bc$Comprendre franchise et bonus$bc$, $bc$Obtenir voiture de remplacement$bc$, $bc$Calendrier réparation garage$bc$],
  NULL,
  $bc$Agent sinistres assurance automobile, vouvoiement professionnel$bc$, $bc$Assuré accident stationnement$bc$,
  ARRAY[$bc$Police : Auto-Promutuel Protection Étendue, prime annuelle 1 284 $$bc$, $bc$Bonus-malus actuel : 0,78 (classe 7, pas de sinistre 3 ans)$bc$, $bc$Circonstances accident : arrêt devant supermarché, conducteur autre véhicule a heurté pare-chocs arrière en reculant$bc$, $bc$Éléments fournis : constat amiable signé, 6 photos dégâts, témoignage passant (avec coordonnées)$bc$, $bc$Franchise applicable ce sinistre : 350 $$bc$, $bc$Estimation réparation : expert lundi après-midi, estimation 780 $-920 $ (à confirmer)$bc$, $bc$Véhicule de remplacement : 30 $/jour max assuré, franchise 250 $ en cas d'accident sur prêt$bc$, $bc$Impact sinistre responsable 100% : malus +2 classes, hausse prime estimée 8-11%$bc$],
  $bc$Après 2 minutes, l'agent précise : « Malheureusement, l'autre conducteur a déclaré ce soir à son assurance que c'est VOUS qui avez reculé ; nous sommes donc en litige, délai 4 à 8 semaines, pas de paiement tant que non résolu. » — obliger le candidat à réagir fort, déposer preuve témoignage et images, demander médiation interne, exiger la voiture de prêt quand même sous réserve.$bc$,
  ARRAY[$bc$assurance auto$bc$, $bc$sinistre$bc$, $bc$accident de stationnement$bc$, $bc$constat amiable$bc$, $bc$franchise$bc$, $bc$bonus-malus$bc$, $bc$garage agréé$bc$, $bc$véhicule de remplacement$bc$, $bc$indemnité$bc$, $bc$expertise$bc$, $bc$dégâts matériels$bc$, $bc$litige$bc$, $bc$témoignage$bc$, $bc$prime$bc$, $bc$police d'assurance$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-BAN-22$bc$, 2, 22, $bc$Banque et prêt$bc$,
  $bc$Le candidat rencontre un conseiller bancaire pour demander un prêt personnel 15 000 $ consolidation dettes : justificatifs revenus, taux, mensualités, assurance emprunteur, approbation immédiate ou non.$bc$,
  $bc$Bonjour et bienvenue à la Banque des Cantons. Je vois votre dossier M./Mme XXXXXXX, client depuis 2017. Vous nous avez écrit au sujet d'un prêt personnel de 15 000 $ pour regrouper vos cartes de crédit. Pour commencer, pouvez-vous me préciser la nature exacte des dettes et vos revenus mensuels nets actuels ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Décrire situation dettes revenus$bc$, $bc$Comprendre offre de prêt$bc$, $bc$Négocier taux et assurance$bc$, $bc$Obtenir accord définitif$bc$],
  NULL,
  $bc$Conseiller finance personnel banque régionale, vouvoiement professionnel$bc$, $bc$Client banque prêt consolidation dettes$bc$,
  ARRAY[$bc$Client banque depuis 7 ans, compte chèque + épargne 2 100 $, carte Visa limite 8 000 $$bc$, $bc$Dettes à consolider : carte Visa 6 800 $ (20,4% int), MC 3 700 $ (19,9%), prêt auto restant 3 500 $ (8,9%)$bc$, $bc$Revenu mensuel net : 3 950 $ (salarié), charges fixes déclarées : 2 300 $ + 650 $ dettes actuelles$bc$, $bc$Cote crédit rapportée : 702 (bon score, classe B+)$bc$, $bc$Offre prêt personnel 15 000 $ : 7,49% sur 5 ans OU 6,89% sur 7 ans$bc$, $bc$Mensualités correspondantes : 300,27 $/mois (5 ans) OU 228,74 $/mois (7 ans)$bc$, $bc$Assurance emprunteur : +12,80 $/mois (décès/Invalidité), facultative mais recommandée$bc$, $bc$Réponse de principe : immédiate en agence, fonds versés 48h après retour contrat signé$bc$],
  $bc$À mi-parcours, le conseiller ajoute : « Par contre, vu votre compte découvert 2 fois au dernier trimestre, notre commission exige une garantie supplémentaire : soit un cosignataire avec plus de 760 de cote, soit vous apportez 1 500 $ de fonds propres dès aujourd'hui. » — obliger le candidat à argumenter, à négocier une alternative (prélèvement auto, prise en gage épargne) ou à sortir si possible de l'offre 5 ans sans assurance pour diminuer mensualité.$bc$,
  ARRAY[$bc$banque$bc$, $bc$prêt personnel$bc$, $bc$consolidation de dettes$bc$, $bc$taux d'intérêt$bc$, $bc$mensualité$bc$, $bc$assurance emprunteur$bc$, $bc$cote de crédit$bc$, $bc$revenu$bc$, $bc$carte de crédit$bc$, $bc$cosignataire$bc$, $bc$conseiller bancaire$bc$, $bc$découvert bancaire$bc$, $bc$prêt auto$bc$, $bc$fonds propres$bc$, $bc$épargne$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-TRV-23$bc$, 2, 23, $bc$Transport et location voiture$bc$,
  $bc$Le candidat passe au comptoir d'une agence de location de voitures pour récupérer un véhicule loué 5 jours Québec : catégorie réservée vs disponible, kilométrage illimité, assurance, pneus hiver, carburant et amende contravention.$bc$,
  $bc$Bonsoir et bienvenue chez Louauto Québec aéroport. Votre réservation est bien au nom de M./Mme XXXXX du 12 au 16 octobre 5 jours. La catégorie que vous aviez réservée c'est la compacte économique Hyundai Accent ou équivalent. Votre permis est-il valide ? Puis-je vous proposer quelques options avant la signature ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Vérifier réservation documents$bc$, $bc$Choisir catégorie véhicule$bc$, $bc$Négocier assurance et options$bc$, $bc$Clarifier carburant amendes$bc$],
  NULL,
  $bc$Agent comptoir agence location, vouvoiement commercial$bc$, $bc$Locataire 5 jours Québec aéroport$bc$,
  ARRAY[$bc$Réservation initiale : compacte économique, 5 jours, 2 conducteurs, kilométrage illimité$bc$, $bc$Tarif réservé internet : 48 $/jour, total 240 $ taxes incluses, paiement déjà pris en ligne$bc$, $bc$Problème inventaire : plus aucune compacte disponible, agent propose soit berline intermédiaire +18 $/jour, soit 4x4 +42 $/jour OU remboursement + taxi offert mais retard 4h$bc$, $bc$Assurance complémentaire LDW : 19 $/jour, franchise 0 $ en cas d'accident ; sans assurance franchise reste 1 500 $$bc$, $bc$Pneus hiver : obligatoires 1 déc-15 mars, déjà montés sur véhicule disponible sans surcoût$bc$, $bc$Règle carburant : plein-rendu (payer d'avance 78 $ ou remettre plein vous-même)$bc$, $bc$Contraventions : 35 $ frais de gestion + montant contravention, débit carte directement$bc$],
  $bc$Après 2 minutes, l'agent annonce : « Désolé, la dernière berline intermédiaire est partie il y a 2 minutes, il ne reste plus que le pick-up 4x4. Je peux faire 28 $/jour au lieu de 42 $, c'est mon maximum. » — contraindre le candidat à argumenter, obtenir au minimum la berline 2ème plus 1 jour gratuit, assurance LDW offerte OU préparer une plainte écrite, témoignage photo agence.$bc$,
  ARRAY[$bc$location de voitures$bc$, $bc$réservation$bc$, $bc$véhicule compact$bc$, $bc$kilométrage illimité$bc$, $bc$assurance LDW$bc$, $bc$franchise$bc$, $bc$permis de conduire$bc$, $bc$pneus d'hiver$bc$, $bc$carburant$bc$, $bc$contravention$bc$, $bc$berline$bc$, $bc$4x4$bc$, $bc$aéroport$bc$, $bc$comptoir$bc$, $bc$locataire$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T2-FIN-24$bc$, 2, 24, $bc$Finances et budget$bc$,
  $bc$Le candidat rencontre un conseiller budgétaire OSBL pour se sortir d'une situation de surendettement modéré : dresser bilan, choisir entre plan de remboursement volontaire, proposition consommateur ou faillite, mesures d'accompagnement.$bc$,
  $bc$Bonjour, je suis conseiller budgétaire agréé chez Endettement Zéro OSBL. Merci d'avoir pris ce rendez-vous. D'abord, peux-tu me décrire ta situation : quels sont les événements qui ont conduit à cette situation, et ce que tu cherches à obtenir comme solution à court et moyen terme ?$bc$,
  210, 120, $bc$full$bc$,
  ARRAY[$bc$Dresser bilan financier$bc$, $bc$Comprendre 3 scénarios solutions$bc$, $bc$Choisir stratégie$bc$, $bc$Planifier 12 mois avenir$bc$],
  NULL,
  $bc$Conseiller budgétaire OSBL agréé, tutoiement empathique$bc$, $bc$Personne surendettée modérée 28 900 $$bc$,
  ARRAY[$bc$Dettes totales : 28 900 $ (découvert 3 800, Visa 12 300, prêt perso 8 600, Impôt 4 200)$bc$, $bc$Actifs nets : véhicule 11 000 $ (payé), REER 5 700 $, compte épargne 900 $$bc$, $bc$Revenus : 4 300 $/mois net (CDI temps partiel 32 h)$bc$, $bc$Charges fixes : 1 420 $ loyer, 410 $ nourriture, 380 $ factures, 220 $ transport, 280 $ crédits actuels → reste 1 590 $ mais chaque mois utilise carte crédit 400 $ éco$bc$, $bc$Option 1 : Plan volontaire 48 mois — rembourser 100% dette, aucun impact cote crédit après 2 ans$bc$, $bc$Option 2 : Proposition consommateur — rembourser environ 55-60% dette sur 60 mois, cote R7 pendant durée$bc$, $bc$Option 3 : Faillite personnelle — 9 à 21 mois, cote R9, perte REER 5 700 $ mais véhicule protégé 10 000 $ max$bc$, $bc$Service OSBL : 40 $/mois frais de gestion sur durée du plan, premier rendez-vous gratuit$bc$],
  $bc$Après 3 minutes, le conseiller prévient : « Attention, ton dossier d'impôt 4 200 $ est déjà transmis au bureau de recouvrement ; ils peuvent saisir ton salaire dans 12 jours si tu ne signes pas une des 3 options aujourd'hui avec lettre de confirmation. » — obliger le candidat à gérer l'urgence, à choisir la meilleure option (proposition consommateur), à négocier étalement frais OSBL et à fixer un rendez-vous sous 48h pour formaliser.$bc$,
  ARRAY[$bc$surendettement$bc$, $bc$conseiller budgétaire$bc$, $bc$plan volontaire$bc$, $bc$proposition du consommateur$bc$, $bc$faillite personnelle$bc$, $bc$dette$bc$, $bc$cotation de crédit$bc$, $bc$REER$bc$, $bc$impôt$bc$, $bc$saisie sur salaire$bc$, $bc$budget$bc$, $bc$remboursement$bc$, $bc$actif net$bc$, $bc$charges fixes$bc$, $bc$OSBL$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-TEC-01$bc$, 3, 1, $bc$Technologie$bc$,
  $bc$Le candidat débat : faut-il interdire les écrans aux enfants de moins de 6 ans dans les lieux publics (cafés, salles d'attente) pour favoriser le langage et le lien social ?$bc$,
  $bc$Prenons un sujet de société. Selon vous, est-il souhaitable d'interdire les écrans aux enfants de moins de 6 ans dans les lieux publics, au nom du développement du langage et du lien social ? Justifiez votre point de vue en confrontant les arguments.$bc$,
  270, 0, $bc$quick$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$écran$bc$, $bc$enfance$bc$, $bc$développement$bc$, $bc$langage$bc$, $bc$interdiction$bc$, $bc$lien social$bc$, $bc$éducation$bc$, $bc$numérique$bc$, $bc$application éducative$bc$, $bc$vocabulaire$bc$, $bc$surexposition$bc$, $bc$interaction$bc$, $bc$milieu public$bc$, $bc$pediatrie$bc$, $bc$règle sociale$bc$],
  ARRAY[$bc$La surexposition précoce ralentit l'acquisition du vocabulaire selon plusieurs études développementales$bc$, $bc$L'interdiction incite les familles à converser, à observer leur environnement et à interagir avec autrui$bc$, $bc$Elle crée un cadre égalitaire pour les enfants issus de milieux différents en matière d'éducation numérique$bc$],
  ARRAY[$bc$Une interdiction générale est difficile à appliquer et crée des conflits inutiles entre parents et institutions$bc$, $bc$Les écrans peuvent être un outil pédagogique de qualité (applications éducatives) dans des contextes d'attente longue$bc$, $bc$La décision appartient avant tout aux parents et non à une règle générale autoritaire$bc$],
  ARRAY[$bc$L'étude de l'Université de Laval 2024 montre 38% de retard langagier chez les 4-5 ans exposés plus de 2 h/jour hors contexte éducatif$bc$, $bc$Dans un CHU de Québec, après passage de tablettes éducatives à des jeux de société fournis, les infirmiers ont rapporté 50% moins de pleurs et d'agitation$bc$],
  ARRAY[$bc$Tout d'abord$bc$, $bc$Ensuite$bc$, $bc$En revanche$bc$, $bc$D'une part$bc$, $bc$D'autre part$bc$, $bc$En conclusion$bc$],
  ARRAY[$bc$Thèse : prise de position explicite sur le sujet$bc$, $bc$1er argument POUR : raison principale avec exemple$bc$, $bc$2ème argument POUR + arguments CONTRE avec nuance$bc$, $bc$Conclusion nuancée, compromis ou ouverture$bc$],
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-TRA-04$bc$, 3, 2, $bc$Travail$bc$,
  $bc$Le candidat prend position : le télétravail à temps plein (3 jours et plus) améliore-t-il vraiment la productivité, ou nuit-il à la culture d'équipe et à l'innovation ?$bc$,
  $bc$Le télétravail à temps plein (3 jours et plus par semaine) : selon vous, est-ce une opportunité pour la productivité des salariés, ou un risque pour la culture d'équipe et l'innovation au sein des entreprises ? Donnez un avis argumenté.$bc$,
  270, 0, $bc$quick$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$télétravail$bc$, $bc$productivité$bc$, $bc$entreprise$bc$, $bc$culture d'équipe$bc$, $bc$innovation$bc$, $bc$transport$bc$, $bc$autonomie$bc$, $bc$qualité de vie$bc$, $bc$absentéisme$bc$, $bc$turn-over$bc$, $bc$isolement$bc$, $bc$épuisement professionnel$bc$, $bc$mentorat$bc$, $bc$hybride$bc$, $bc$bureau$bc$],
  ARRAY[$bc$Moins de temps de transport = plus de concentration et réduction de la fatigue pour une meilleure productivité$bc$, $bc$Les employés gagnent en autonomie et en qualité de vie, ce qui réduit l'absentéisme et le turn-over$bc$, $bc$Les entreprises réalisent des économies immobilières importantes à réinvestir dans la formation et les outils$bc$],
  ARRAY[$bc$Le manque d'échanges informels diminue la transmission des savoirs tacites et la création d'idées nouvelles$bc$, $bc$L'isolement social à domicile peut conduire à l'épuisement professionnel et à un sentiment de déliaison$bc$, $bc$Les nouveaux embauchés et les jeunes diplômés peinent à s'intégrer sans mentorat présentiel régulier$bc$],
  ARRAY[$bc$Une entreprise technologique montréalaise a documenté une baisse de 22% des projets interfonctionnels novateurs après 2 ans de télétravail 100%$bc$, $bc$Plusieurs études canadiennes confirment une réduction moyenne de 30% des congés de maladie dans les équipes hybrides bien structurées$bc$],
  ARRAY[$bc$Tout d'abord$bc$, $bc$Ensuite$bc$, $bc$En revanche$bc$, $bc$D'une part$bc$, $bc$D'autre part$bc$, $bc$En conclusion$bc$],
  ARRAY[$bc$Thèse : prise de position explicite sur le sujet$bc$, $bc$1er argument POUR : raison principale avec exemple$bc$, $bc$2ème argument POUR + arguments CONTRE avec nuance$bc$, $bc$Conclusion nuancée, compromis ou ouverture$bc$],
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-ENV-07$bc$, 3, 3, $bc$Environnement$bc$,
  $bc$Le candidat débat : le Canada doit-il rendre obligatoire la composition triée des déchets avec amendes pour les ménages non conformes, à l'instar de certaines villes européennes ?$bc$,
  $bc$Au Canada, les villes auraient-elles intérêt à rendre obligatoire la composition triée des déchets (ordures, recyclage, compost) avec amendes en cas de non-respect, comme en Allemagne ou en Belgique ? Justifiez.$bc$,
  270, 0, $bc$quick$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$environnement$bc$, $bc$déchet$bc$, $bc$recyclage$bc$, $bc$compostage$bc$, $bc$obligation$bc$, $bc$amende$bc$, $bc$enfouissement$bc$, $bc$méthane$bc$, $bc$gaz à effet de serre$bc$, $bc$ménage$bc$, $bc$taxe municipale$bc$, $bc$incitation$bc$, $bc$vie privée$bc$, $bc$tri sélectif$bc$, $bc$économie circulaire$bc$],
  ARRAY[$bc$Une obligation légale avec amendes modérées a déjà prouvé son efficacité : taux de recyclage jusqu'à 65% en Flandre contre 30% en moyenne canadienne$bc$, $bc$Les villes réduisent leurs coûts d'enfouissement et leurs émissions de méthane, principale source de gaz à effet de serre des déchets$bc$, $bc$La mesure crée des emplois locaux dans la collecte, le tri et la transformation des matières$bc$],
  ARRAY[$bc$La mesure est injuste pour les ménages à faible revenu, moins informés et moins bien équipés en tri et compostage$bc$, $bc$Le contrôle des poubelles porte atteinte à la vie privée et génère des tensions entre citoyens et agents$bc$, $bc$Une incitation positive (bonus financier, réduction de la taxe) serait socialement plus acceptable tout aussi efficace$bc$],
  ARRAY[$bc$En 2024, Vancouver a réduit ses ordures résiduelles de 27% en deux ans après avoir instauré des amendes de 50 $ pour bac mal trié (et 2 avertissements gratuits)$bc$, $bc$À l'inverse, Toronto a abandonné en 2022 un système d'amendes trop impopulaire après 14 mois, lui préférant une campagne de porte-à-porte éducative$bc$],
  ARRAY[$bc$Tout d'abord$bc$, $bc$Ensuite$bc$, $bc$En revanche$bc$, $bc$D'une part$bc$, $bc$D'autre part$bc$, $bc$En conclusion$bc$],
  ARRAY[$bc$Thèse : prise de position explicite sur le sujet$bc$, $bc$1er argument POUR : raison principale avec exemple$bc$, $bc$2ème argument POUR + arguments CONTRE avec nuance$bc$, $bc$Conclusion nuancée, compromis ou ouverture$bc$],
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-ENV-09$bc$, 3, 4, $bc$Environnement$bc$,
  $bc$Le candidat débat : faut-il interdire la vente de véhicules à essence neufs d'ici 2035 au Canada, ou cela risque-t-il de pénaliser économiquement les régions rurales et la classe moyenne ?$bc$,
  $bc$Le gouvernement fédéral vise l'interdiction des véhicules à essence et diesel neufs d'ici 2035. Cette mesure est-elle, selon vous, équilibrée : opportunité écologique essentielle ou risque de pénaliser injustement régions rurales et classe moyenne ?$bc$,
  270, 0, $bc$quick$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$véhicule électrique$bc$, $bc$transition énergétique$bc$, $bc$zéro émission$bc$, $bc$transport$bc$, $bc$région rurale$bc$, $bc$borne de recharge$bc$, $bc$subvention$bc$, $bc$classe moyenne$bc$, $bc$industrie automobile$bc$, $bc$lithium$bc$, $bc$investissement$bc$, $bc$innovation$bc$, $bc$autonomie$bc$, $bc$GES$bc$, $bc$objectif climatique$bc$],
  ARRAY[$bc$Une date butoir claire stimule l'innovation de l'industrie automobile canadienne et attire les investissements étrangers$bc$, $bc$La baisse progressive des coûts des batteries rendra d'ici 10 ans les VE plus abordables que les thermiques selon plusieurs analyses$bc$, $bc$La réduction drastique des émissions de GES du transport est indispensable pour atteindre les cibles 2050$bc$],
  ARRAY[$bc$Dans les régions rurales éloignées, le réseau de bornes de recharge est très insuffisant et l'autonomie actuelle des VE reste un problème$bc$, $bc$Un coût d'achat plus élevé prive pendant plusieurs années la classe moyenne qui n'a pas accès aux subventions ou crédits d'impôt$bc$, $bc$La transition oublie la question de la chaîne d'approvisionnement en lithium, cobalt et terres rares$bc$],
  ARRAY[$bc$En Norvège (65% de VE neufs), la moyenne rurale reste à 22% malgré 12 ans de fortes subventions$bc$, $bc$L'Ontario estime que d'ici 2030, il manquerait encore 1 borne publique sur 3 dans les petites municipalités hors grands axes$bc$],
  ARRAY[$bc$Tout d'abord$bc$, $bc$Ensuite$bc$, $bc$En revanche$bc$, $bc$D'une part$bc$, $bc$D'autre part$bc$, $bc$En conclusion$bc$],
  ARRAY[$bc$Thèse : prise de position explicite sur le sujet$bc$, $bc$1er argument POUR : raison principale avec exemple$bc$, $bc$2ème argument POUR + arguments CONTRE avec nuance$bc$, $bc$Conclusion nuancée, compromis ou ouverture$bc$],
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-EDU-11$bc$, 3, 5, $bc$Éducation$bc$,
  $bc$Le candidat prend position : devrait-on rendre l'école secondaire gratuite et obligatoire jusqu'à 18 ans (au lieu de 16 ans) dans tout le Canada, pour lutter contre le décrochage et améliorer l'employabilité ?$bc$,
  $bc$Actuellement, l'âge minimum de fin d'études obligatoires est de 16 ans dans la plupart des provinces. Selon vous, faudrait-il passer à 18 ans et rendre la scolarité gratuite jusqu'à la fin du secondaire, pour lutter contre le décrochage et améliorer l'employabilité des jeunes ?$bc$,
  270, 0, $bc$quick$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$éducation$bc$, $bc$décrochage scolaire$bc$, $bc$jeunesse$bc$, $bc$employabilité$bc$, $bc$obligation scolaire$bc$, $bc$diplôme d'études secondaires$bc$, $bc$inégalité sociale$bc$, $bc$formation professionnelle$bc$, $bc$coût de l'éducation$bc$, $bc$enseignant$bc$, $bc$trouble de comportement$bc$, $bc$revenu$bc$, $bc$marché du travail$bc$, $bc$milieu défavorisé$bc$, $bc$réforme éducative$bc$],
  ARRAY[$bc$Plus d'années d'études = taux de décrochage en baisse et salaires à l'entrée sur le marché du travail significativement plus élevés$bc$, $bc$Un diplôme de fin d'études secondaires est aujourd'hui le minimum requis dans 80% des métiers qualifiés et professions intermédiaires$bc$, $bc$La mesure réduit les inégalités sociales, car les jeunes de milieux défavorisés sont ceux qui décrochent le plus tôt$bc$],
  ARRAY[$bc$Certains jeunes de 16-17 ans sont capables et désireux d'entrer sur le marché du travail ou dans un programme de formation professionnelle courte$bc$, $bc$Le coût pour l'éducation publique est considérable : il faut plus d'enseignants, plus de locaux, plus de services adaptés$bc$, $bc$Contraindre un élève déjà en difficulté à rester 2 années de plus peut augmenter le risque de violence scolaire et de troubles comportementaux$bc$],
  ARRAY[$bc$Au Québec, la réforme qui a relevé l'âge de 16 à 17 ans en 2010 a fait chuter le taux de décrochage de 4,2 pts en 5 ans$bc$, $bc$Plusieurs études américaines montrent qu'un an d'études secondaires supplémentaires apporte +8 à 11% de revenu annuel sur une vie active$bc$],
  ARRAY[$bc$Tout d'abord$bc$, $bc$Ensuite$bc$, $bc$En revanche$bc$, $bc$D'une part$bc$, $bc$D'autre part$bc$, $bc$En conclusion$bc$],
  ARRAY[$bc$Thèse : prise de position explicite sur le sujet$bc$, $bc$1er argument POUR : raison principale avec exemple$bc$, $bc$2ème argument POUR + arguments CONTRE avec nuance$bc$, $bc$Conclusion nuancée, compromis ou ouverture$bc$],
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-IMM-16$bc$, 3, 6, $bc$Immigration$bc$,
  $bc$Le candidat débat : les seuils d'immigration canadiens actuels (500 000 nouveaux PR par an) sont-ils bien calibrés ou sont-ils trop élevés et menacent-ils l'accès au logement et aux services publics ?$bc$,
  $bc$Le Canada accueille aujourd'hui environ 500 000 nouveaux résidents permanents par an. Est-ce un bon rythme pour l'économie et la démographie, ou est-ce trop élevé et met-il en péril l'accès au logement, à la santé et aux services publics ?$bc$,
  270, 0, $bc$quick$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$immigration$bc$, $bc$résident permanent$bc$, $bc$démographie$bc$, $bc$logement$bc$, $bc$santé$bc$, $bc$services publics$bc$, $bc$vieillissement de la population$bc$, $bc$pénurie de main-d'œuvre$bc$, $bc$diversité culturelle$bc$, $bc$rayonnement$bc$, $bc$construction$bc$, $bc$listes d'attente$bc$, $bc$intégration$bc$, $bc$région$bc$, $bc$économie$bc$],
  ARRAY[$bc$Un nombre élevé de nouveaux arrivants compense le vieillissement de la population et alimente les fonds publics (cotisations RRQ/RRPC, impôts)$bc$, $bc$Les secteurs en pénurie (santé, technologie, construction) ont besoin de ces compétences pour survivre et croître$bc$, $bc$L'immigration est un moteur de diversité culturelle, d'ouverture internationale et de rayonnement du Canada$bc$],
  ARRAY[$bc$Le rythme actuel dépasse largement la capacité de construction de logements abordables des grandes villes canadiennes$bc$, $bc$L'afflux dans quelques provinces (ON, QC, BC) surcharge les listes d'attente des CHU, des CPE et des CLSC$bc$, $bc$Des niveaux d'immigration historiques sans stratégie d'installation dans les régions augmentent le risque de ghettos urbains et d'échec d'intégration$bc$],
  ARRAY[$bc$L'augmentation de 65% des demandes de PR entre 2021 et 2024 à Toronto s'est accompagnée d'une augmentation de 41% du prix moyen d'un loyer 3,5 pièces$bc$, $bc$Manitoba, qui applique une politique de dispersion régionale depuis 10 ans, montre un taux d'insertion professionnelle à 5 ans 14 pts supérieur à la moyenne nationale$bc$],
  ARRAY[$bc$Tout d'abord$bc$, $bc$Ensuite$bc$, $bc$En revanche$bc$, $bc$D'une part$bc$, $bc$D'autre part$bc$, $bc$En conclusion$bc$],
  ARRAY[$bc$Thèse : prise de position explicite sur le sujet$bc$, $bc$1er argument POUR : raison principale avec exemple$bc$, $bc$2ème argument POUR + arguments CONTRE avec nuance$bc$, $bc$Conclusion nuancée, compromis ou ouverture$bc$],
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-FAM-20$bc$, 3, 7, $bc$Famille et fécondité$bc$,
  $bc$Le candidat débat : la société québécoise/canadienne doit-elle encourager financièrement (allocations, congés parentaux mieux rémunérés, crèches gratuites) une légère remontée du taux de fécondité, ou doit-elle privilégier l'immigration comme réponse au vieillissement ?$bc$,
  $bc$Le taux de fécondité québécois est l'un des plus bas d'Amérique du Nord. Selon vous, faut-il encourager davantage les familles à avoir plus d'enfants (meilleurs congés parentaux, CPE gratuits, allocations) ou compter presque exclusivement sur l'immigration pour contrer le vieillissement ?$bc$,
  270, 0, $bc$quick$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$fécondité$bc$, $bc$vieillissement démographique$bc$, $bc$politique familiale$bc$, $bc$congé parental$bc$, $bc$allocation$bc$, $bc$liberté de choix$bc$, $bc$service de garde$bc$, $bc$taux d'activité$bc$, $bc$citoyenneté$bc$, $bc$modélisation$bc$, $bc$Statistique Canada$bc$, $bc$contribuable$bc$, $bc$incitation$bc$, $bc$travail$bc$, $bc$société$bc$],
  ARRAY[$bc$Des politiques familiales généreuses sont la voie la plus stable à long terme : elles génèrent des citoyens socialisés et intégrés dès la naissance$bc$, $bc$Plusieurs études montrent que la gratuité des services de garde à 0-5 ans augmente significativement le taux d'activité des mères et la fécondité désirée$bc$, $bc$L'immigration seule ne suffit pas : les pays d'origine ont aussi leur propre crise de vieillissement d'ici 2050$bc$],
  ARRAY[$bc$Les allocations ne font que déplacer le coût du vieillissement sur les contribuables d'aujourd'hui sans garantie de résultats$bc$, $bc$Le droit à la liberté de choix procréatif ne doit pas être instrumentalisé par des incitations financières de l'État$bc$, $bc$Le Canada dispose d'un modèle d'immigration éprouvé, adaptatif et déjà bien rodé pour répondre aux besoins de main-d'œuvre$bc$],
  ARRAY[$bc$La Suède, avec 18 mois de congé parental 80% rémunéré partagé, maintient depuis 20 ans un taux de fécondité stable autour de 1,75 — contre 1,4 au Québec$bc$, $bc$Modélisation 2060 de Statistique Canada : sans aucun redressement de la fécondité, le ratio actifs/retraités passe de 3,2 à 1,9, même avec immigration 500 k/an$bc$],
  ARRAY[$bc$Tout d'abord$bc$, $bc$Ensuite$bc$, $bc$En revanche$bc$, $bc$D'une part$bc$, $bc$D'autre part$bc$, $bc$En conclusion$bc$],
  ARRAY[$bc$Thèse : prise de position explicite sur le sujet$bc$, $bc$1er argument POUR : raison principale avec exemple$bc$, $bc$2ème argument POUR + arguments CONTRE avec nuance$bc$, $bc$Conclusion nuancée, compromis ou ouverture$bc$],
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-MED-24$bc$, 3, 8, $bc$Médecine et soins$bc$,
  $bc$Le candidat débat : faudrait-il légaliser et réglementer strictement l'euthanasie médicale assistée (MAID) pour les personnes souffrant de maladies mentales graves et chroniques, seulement après 2 tentatives de traitement standards ?$bc$,
  $bc$Au Canada, l'aide médicale à mourir (MAID) est accessible depuis peu pour certaines situations. Devrait-elle être étendue aux personnes souffrant de maladies mentales graves, chroniques et résistantes, mais seulement après 2 tentatives de traitement standards ?$bc$,
  270, 0, $bc$quick$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$aide médicale à mourir$bc$, $bc$euthanasie$bc$, $bc$maladie mentale$bc$, $bc$dépression chronique$bc$, $bc$dignité$bc$, $bc$liberté individuelle$bc$, $bc$régulation$bc$, $bc$abus$bc$, $bc$psychiatrie$bc$, $bc$traitement$bc$, $bc$irréversibilité$bc$, $bc$eugénisme$bc$, $bc$vulnérabilité$bc$, $bc$soins$bc$, $bc$évaluation pluridisciplinaire$bc$],
  ARRAY[$bc$Pour des personnes en souffrance psychique incurable et documentée, le droit de disposer de sa propre vie est une question de liberté et de dignité$bc$, $bc$Une régulation stricte (2 tentatives de traitement standards + évaluation pluridisciplinaire) protège contre les abus et les pressions externes$bc$, $bc$La mesure permet aux systèmes de santé canadiens de mieux documenter et améliorer réellement les parcours de soins mentaux existants$bc$],
  ARRAY[$bc$Beaucoup de maladies mentales graves sont fluctuantes et le patient peut reprendre espoir après plusieurs années ; l'irréversibilité pose problème$bc$, $bc$Dans un contexte de sous-financement massif de la psychiatrie, les « 2 tentatives standards » sont souvent de piètre qualité$bc$, $bc$Il existe un risque de dérive eugénique : les personnes socialement vulnérables seront les premières à y être poussées$bc$],
  ARRAY[$bc$Pays-Bas, 15 ans d'expérience : 2% des actes MAID concernent des troubles psychiatriques, 94% des dossiers passent le contrôle externe sans remarque$bc$, $bc$L'OMS rappelle que jusqu'à 40% des patients suicidaires rencontrés en urgence avaient reçu un diagnostic de dépression mal traité par leur médecin généraliste$bc$],
  ARRAY[$bc$Tout d'abord$bc$, $bc$Ensuite$bc$, $bc$En revanche$bc$, $bc$D'une part$bc$, $bc$D'autre part$bc$, $bc$En conclusion$bc$],
  ARRAY[$bc$Thèse : prise de position explicite sur le sujet$bc$, $bc$1er argument POUR : raison principale avec exemple$bc$, $bc$2ème argument POUR + arguments CONTRE avec nuance$bc$, $bc$Conclusion nuancée, compromis ou ouverture$bc$],
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-TRV-28$bc$, 3, 9, $bc$Transports en commun$bc$,
  $bc$Le candidat débat : le gouvernement fédéral devrait-t-il obliger les villes de plus de 500 000 habitants à développer un réseau de transport en commun structurant (métro ou SRB) d'ici 2035, avec financement partagé 50/50, afin de réduire les GES du transport urbain ?$bc$,
  $bc$Le transport urbain est responsable d'environ 30% des émissions de gaz à effet de serre du Canada. Devrait-on obliger les villes de plus de 500 000 habitants à se doter d'un réseau structurant (métro, SRB ou train de banlieue) d'ici 2035, avec un financement partagé 50/50 fédéral/provincial/villes ? Justifiez.$bc$,
  270, 0, $bc$quick$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$transport en commun$bc$, $bc$métro$bc$, $bc$SRB$bc$, $bc$train de banlieue$bc$, $bc$GES$bc$, $bc$voiture individuelle$bc$, $bc$financement$bc$, $bc$contribuable$bc$, $bc$délai de réalisation$bc$, $bc$densité urbaine$bc$, $bc$mobilité$bc$, $bc$REM$bc$, $bc$banlieue$bc$, $bc$foncier$bc$, $bc$infrastructure$bc$],
  ARRAY[$bc$Un réseau structurant fiable permet de diminuer rapidement la place de la voiture individuelle et donc les émissions de GES du secteur$bc$, $bc$Le financement partagé évite de rejeter la facture sur les contribuables municipaux seuls et accélère la réalisation$bc$, $bc$Un bon TC accroît la mobilité des populations vulnérables et rééquilibre les prix du foncier entre ville centre et banlieue$bc$],
  ARRAY[$bc$Certaines villes de 500 000 habitants ont une densité trop faible en dehors du centre pour qu'un TC structurant soit viable$bc$, $bc$Les délais de réalisation (10 à 15 ans typiques) font courir le risque que les coûts explosent et que la date butoir 2035 soit largement manquée$bc$, $bc$Le financement fédéral impose souvent des priorités qui ne correspondent pas aux réalités locales (ex : projet qui favorise banlieue plutôt que noyau pauvre)$bc$],
  ARRAY[$bc$Le REM à Montréal a fait chuter de 18% les temps de trajet domicile-travail sur son axe principal après 1 an de service$bc$, $bc$Calgary, dont la densité moyenne est faible, a vu son projet du Green Line SRB exploser son budget initial de 4,5 à 7,5 milliards à cause du manque d'études géotechniques préalables$bc$],
  ARRAY[$bc$Tout d'abord$bc$, $bc$Ensuite$bc$, $bc$En revanche$bc$, $bc$D'une part$bc$, $bc$D'autre part$bc$, $bc$En conclusion$bc$],
  ARRAY[$bc$Thèse : prise de position explicite sur le sujet$bc$, $bc$1er argument POUR : raison principale avec exemple$bc$, $bc$2ème argument POUR + arguments CONTRE avec nuance$bc$, $bc$Conclusion nuancée, compromis ou ouverture$bc$],
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-IDE-02$bc$, 3, 10, $bc$Identité culturelle$bc$,
  $bc$Le candidat prend position : faut-il imposer dans toutes les écoles québécoises un cours obligatoire d'histoire du Québec et du Canada d'une durée de 2 années au secondaire, pour renforcer l'identité et la cohésion nationale ?$bc$,
  $bc$L'histoire du Québec et du Canada : faut-il en faire un cours obligatoire de 2 années au secondaire dans toutes les écoles québécoises, au nom de l'identité et de la cohésion nationale, ou est-ce un détournement de l'enseignement des savoirs essentiels ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$histoire$bc$, $bc$identité nationale$bc$, $bc$cohésion sociale$bc$, $bc$programme scolaire$bc$, $bc$obligation$bc$, $bc$identité québécoise$bc$, $bc$identité canadienne$bc$, $bc$mémoire collective$bc$, $bc$citoyenneté$bc$, $bc$diversité culturelle$bc$, $bc$savoir essentiel$bc$, $bc$enseignement secondaire$bc$, $bc$école$bc$, $bc$fierté$bc$, $bc$racines$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-TRA-03$bc$, 3, 11, $bc$Travail et syndicat$bc$,
  $bc$Le candidat débat : dans un contexte de pénurie de main-d'œuvre, faut-il faciliter la syndicalisation des secteurs précaires (livraison, service à la clientèle, nettoyage) ou bien renforcer les normes législatives (salaire minimum indexé, congés payés) pour toutes et tous ?$bc$,
  $bc$Face à la précarité croissante dans plusieurs secteurs, quelle est la meilleure solution selon vous : faciliter la syndicalisation des travailleurs précaires ou bien renforcer la législation du travail pour tout le monde (salaire minimum indexé, congés payés plus longs) ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$syndicat$bc$, $bc$travail précaire$bc$, $bc$salaire minimum$bc$, $bc$congés payés$bc$, $bc$pénurie de main-d'œuvre$bc$, $bc$négociation collective$bc$, $bc$justice sociale$bc$, $bc$secteur des services$bc$, $bc$livraison$bc$, $bc$nettoyage$bc$, $bc$clientèle$bc$, $bc$norme du travail$bc$, $bc$loi$bc$, $bc$indexation$bc$, $bc$lutte syndicale$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-ETU-05$bc$, 3, 12, $bc$Études supérieures$bc$,
  $bc$Le candidat débat : faudrait-il rendre entièrement gratuite la scolarité au premier cycle universitaire (baccalauréat) dans les universités publiques québécoises, même si les impôts des revenus supérieurs augmentent ?$bc$,
  $bc$Le Québec a déjà les droits de scolarité universitaires les plus bas au Canada. Selon vous, faudrait-il aller plus loin et rendre totalement gratuite la scolarité du premier cycle universitaire, en contrepartie d'une hausse des impôts sur les hauts revenus ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$université$bc$, $bc$baccalauréat$bc$, $bc$scolarité$bc$, $bc$gratuité$bc$, $bc$droit de scolarité$bc$, $bc$impôt$bc$, $bc$hauts revenus$bc$, $bc$accès aux études$bc$, $bc$égalité des chances$bc$, $bc$éducation supérieur$bc$, $bc$études longues$bc$, $bc$coût$bc$, $bc$financement$bc$, $bc$revenu$bc$, $bc$public$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-LOG-06$bc$, 3, 13, $bc$Logement abordable$bc$,
  $bc$Le candidat débat : pour résoudre la crise du logement, est-ce la bonne stratégie que de forcer les municipalités à construire 10% de logement social ou abordable dans tout nouveau projet immobilier de plus de 15 unités ?$bc$,
  $bc$Face à la crise du logement : faut-il imposer aux promoteurs immobiliers de réserver, dans tout projet de 15 unités et plus, 10% minimum de logements sociaux ou abordables, ou est-ce contre-productif car les promoteurs construisent moins au total ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$logement$bc$, $bc$habitation$bc$, $bc$logement social$bc$, $bc$logement abordable$bc$, $bc$crise du logement$bc$, $bc$promoteur immobilier$bc$, $bc$construction$bc$, $bc$municipalité$bc$, $bc$mixité sociale$bc$, $bc$loyer$bc$, $bc$propriété$bc$, $bc$projet immobilier$bc$, $bc$réglementation$bc$, $bc$ville$bc$, $bc$habitants$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-BEN-08$bc$, 3, 14, $bc$Bénévolat$bc$,
  $bc$Le candidat prend position : faudrait-il instaurer, au niveau du diplôme d'études collégiales, 40 heures de bénévolat obligatoires (associatif, environnemental, social) pour obtenir son diplôme ?$bc$,
  $bc$Plusieurs pays ont testé des heures de bénévolat obligatoires pour obtenir un diplôme. Selon vous, faudrait-il imposer 40 h de bénévolat (associatif, social, environnemental) à tous les finissants d'études collégiales au Québec pour obtenir leur diplôme ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$bénévolat$bc$, $bc$obligation$bc$, $bc$diplôme$bc$, $bc$collège$bc$, $bc$engagement citoyen$bc$, $bc$associatif$bc$, $bc$social$bc$, $bc$environnemental$bc$, $bc$vie associative$bc$, $bc$compétences transversales$bc$, $bc$citoyenneté$bc$, $bc$engagement$bc$, $bc$finissant$bc$, $bc$études$bc$, $bc$formation citoyenne$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-CUL-10$bc$, 3, 15, $bc$Culture et patrimoine$bc$,
  $bc$Le candidat débat : les villes devraient-elles légalement interdire la construction de nouveaux immeubles de grande hauteur dans les quartiers historiques du Vieux-Montréal et du Vieux-Québec pour protéger le patrimoine ?$bc$,
  $bc$Faut-il interdire légalement les immeubles de grande hauteur dans les quartiers historiques (Vieux-Montréal, Vieux-Québec) pour protéger le patrimoine, ou est-ce que cela empêche l'évolution économique et résidentielle des centres-villes ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$patrimoine$bc$, $bc$quartier historique$bc$, $bc$immeuble$bc$, $bc$hauteur$bc$, $bc$Vieux-Montréal$bc$, $bc$Vieux-Québec$bc$, $bc$ville$bc$, $bc$protection du patrimoine$bc$, $bc$construction$bc$, $bc$tourisme$bc$, $bc$résidentiel$bc$, $bc$centre-ville$bc$, $bc$économie urbaine$bc$, $bc$droit urbain$bc$, $bc$paysage$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-LOI-12$bc$, 3, 16, $bc$Loisir et sport professionnel$bc$,
  $bc$Le candidat débat : est-il juste que les athlètes olympiques et paralympiques canadiens touchent des primes au résultat (médaille) mais pas de revenu de base garanti pendant 4 ans pour s'entraîner ?$bc$,
  $bc$Un athlète olympique canadien reçoit une prime pour une médaille mais pas de revenu de base garanti pendant les 4 ans de cycle d'entraînement. Est-ce, selon vous, juste ou faut-il mettre en place un revenu annuel garanti pour les athlètes de haut niveau canadiens ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$sport$bc$, $bc$olympisme$bc$, $bc$paralympisme$bc$, $bc$athlète de haut niveau$bc$, $bc$entraînement$bc$, $bc$prime$bc$, $bc$médaille$bc$, $bc$revenu de base$bc$, $bc$financement$bc$, $bc$soutien$bc$, $bc$résultat$bc$, $bc$cycle olympique$bc$, $bc$Canada$bc$, $bc$performance sportive$bc$, $bc$équité$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-LAN-15$bc$, 3, 17, $bc$Français langue officielle$bc$,
  $bc$Le candidat débat : dans le contexte québécois, faut-il rendre obligatoire un test de français écrit (niveau B2) pour toute personne qui obtient la résidence permanente, à la charge du gouvernement et non du demandeur ?$bc$,
  $bc$Pour renforcer la langue française au Québec, faudrait-il exiger de toute personne qui obtient la résidence permanente de réussir un test de français écrit B2, financé par l'État et non par le demandeur ? Ou est-ce discriminatoire ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$français$bc$, $bc$langue officielle$bc$, $bc$test de langue$bc$, $bc$B2$bc$, $bc$résidence permanente$bc$, $bc$intégration linguistique$bc$, $bc$niveau de français$bc$, $bc$exigence$bc$, $bc$discrimination$bc$, $bc$Québec$bc$, $bc$immigration$bc$, $bc$État$bc$, $bc$financement$bc$, $bc$écrit$bc$, $bc$apprentissage$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-TEC-18$bc$, 3, 18, $bc$Intelligence artificielle$bc$,
  $bc$Le candidat prend position : faut-il imposer, pour tout contenu publié en ligne à caractère informatif (presse, blogues, articles professionnels), un marquage obligatoire s'il a été généré par une intelligence artificielle générative ?$bc$,
  $bc$De plus en plus de textes publiés en ligne sont rédigés partiellement ou totalement par une intelligence artificielle générative. Selon vous, faudrait-il un marquage légal obligatoire « généré par IA » sur tout contenu à caractère informatif, et pourquoi ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$intelligence artificielle$bc$, $bc$IA générative$bc$, $bc$marquage$bc$, $bc$contenu en ligne$bc$, $bc$presse$bc$, $bc$désinformation$bc$, $bc$transparence$bc$, $bc$information$bc$, $bc$rédaction$bc$, $bc$éthique$bc$, $bc$blogue$bc$, $bc$article professionnel$bc$, $bc$détection$bc$, $bc$droit du numérique$bc$, $bc$auteur$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-SAN-19$bc$, 3, 19, $bc$Santé préventive$bc$,
  $bc$Le candidat débat : faudrait-il offrir à tous les Canadiens de 50 à 75 ans un bilan de santé complet gratuit (bilan sanguin, électrocardiogramme, dépistage colorectal) bisannuel, même si le coût est très élevé pour l'assurance-maladie ?$bc$,
  $bc$Le coût de la santé au Canada grimpe chaque année. Investir dans la prévention : faudrait-il offrir gratuitement à tous les 50-75 ans un bilan de santé complet bisannuel (sang, ECG, dépistage colorectal), financé par l'assurance-maladie, ou est-ce trop cher par rapport aux bénéfices démontrés ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$santé$bc$, $bc$prévention$bc$, $bc$bilan de santé$bc$, $bc$dépistage$bc$, $bc$assurance-maladie$bc$, $bc$coût$bc$, $bc$électrocardiogramme$bc$, $bc$dépistage colorectal$bc$, $bc$50 ans$bc$, $bc$75 ans$bc$, $bc$maladie chronique$bc$, $bc$santé publique$bc$, $bc$financement$bc$, $bc$médecine préventive$bc$, $bc$Canada$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-ALI-21$bc$, 3, 20, $bc$Agriculture et alimentation$bc$,
  $bc$Le candidat débat : faudrait-il interdire progressivement d'ici 2040 les pesticides chimiques de synthèse dans l'agriculture québécoise, au profit de solutions biologiques ou agroécologiques, avec un fonds de transition pour les fermes ?$bc$,
  $bc$Plusieurs études lient l'usage intensif des pesticides chimiques à des cancers et à une diminution des insectes pollinisateurs. Faut-il viser l'interdiction totale des pesticides de synthèse au Québec d'ici 2040, avec un fonds de transition financé publiquement pour les fermes ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$agriculture$bc$, $bc$pesticide$bc$, $bc$chimie$bc$, $bc$synthèse$bc$, $bc$biologique$bc$, $bc$agroécologie$bc$, $bc$ferme$bc$, $bc$Québec$bc$, $bc$transition$bc$, $bc$fonds$bc$, $bc$pollinisateur$bc$, $bc$santé publique$bc$, $bc$cancer$bc$, $bc$environnement$bc$, $bc$alimentation$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-EDU-22$bc$, 3, 21, $bc$Scolarité et devoirs$bc$,
  $bc$Le candidat débat : faut-il interdire formellement les devoirs à la maison aux élèves de l'école primaire (1re à 6e année), au nom d'une meilleure santé mentale des enfants et d'une réduction des inégalités familiales ?$bc$,
  $bc$Devoirs à la maison à l'école primaire : faut-il les interdire formellement de la 1re à la 6e année, pour diminuer l'anxiété scolaire des enfants et réduire les inégalités entre familles qui peuvent aider et celles qui ne le peuvent pas ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$devoir$bc$, $bc$maison$bc$, $bc$école primaire$bc$, $bc$élève$bc$, $bc$santé mentale$bc$, $bc$inégalité familiale$bc$, $bc$anxiété scolaire$bc$, $bc$apprentissage$bc$, $bc$6e année$bc$, $bc$parent$bc$, $bc$enseignant$bc$, $bc$niveau scolaire$bc$, $bc$interdiction$bc$, $bc$tâche scolaire$bc$, $bc$consolidation$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-ASS-23$bc$, 3, 22, $bc$Justice et peine$bc$,
  $bc$Le candidat débat : au Canada, faudrait-il éliminer purement et simplement les peines de prison de moins de 6 mois pour les délits non violents, et les remplacer par des travaux d'intérêt général et une supervision ?$bc$,
  $bc$Dans plusieurs pays européens, les peines de prison de moins de 6 mois pour délits non violents ont été presque éliminées au profit de travaux d'intérêt général. Est-ce une piste que le Canada devrait suivre, selon vous ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$justice$bc$, $bc$peine$bc$, $bc$prison$bc$, $bc$délit$bc$, $bc$non violent$bc$, $bc$travaux d'intérêt général$bc$, $bc$supervision$bc$, $bc$justice pénale$bc$, $bc$incarcération$bc$, $bc$Canada$bc$, $bc$europe$bc$, $bc$récidive$bc$, $bc$peine alternative$bc$, $bc$justice réparatrice$bc$, $bc$système judiciaire$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-BAN-25$bc$, 3, 23, $bc$Cryptomonnaie$bc$,
  $bc$Le candidat débat : les grandes banques canadiennes (RBC, TD, BMO...) devraient-elles être autorisées à vendre à leurs clients des portefeuilles et produits d'épargne en cryptomonnaies réglementées, ou est-ce un danger pour la stabilité du système financier ?$bc$,
  $bc$La cryptomonnaie divise. Devrait-on autoriser les grandes banques canadiennes (RBC, TD, BMO...) à vendre des portefeuilles et produits d'épargne en cryptomonnaies réglementées, ou bien faut-il continuer de les considérer comme des actifs spéculatifs trop risqués pour le système bancaire ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$cryptomonnaie$bc$, $bc$banque$bc$, $bc$Bitcoin$bc$, $bc$portefeuille numérique$bc$, $bc$épargne$bc$, $bc$régulation$bc$, $bc$actif$bc$, $bc$risque$bc$, $bc$système financier$bc$, $bc$RBC$bc$, $bc$TD$bc$, $bc$BMO$bc$, $bc$spéculation$bc$, $bc$investisseur$bc$, $bc$stabilité$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-VOY-26$bc$, 3, 24, $bc$Tourisme de masse$bc$,
  $bc$Le candidat débat : dans les villes québécoises très touristiques (Québec, Tadoussac, Percé), faudrait-il introduire une taxe supplémentaire de visite (10 $ par personne par nuit) dont le produit finirait exclusivement la protection des sites naturels et du patrimoine local ?$bc$,
  $bc$Québec, Tadoussac, Percé... Le tourisme est une aubaine mais il use aussi les lieux. Selon vous, faudrait-il une taxe de tourisme de 10 $ par personne et par nuit, dont les recettes serviraient exclusivement à protéger les sites naturels et le patrimoine local ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$tourisme$bc$, $bc$taxe$bc$, $bc$Québec$bc$, $bc$Tadoussac$bc$, $bc$Percé$bc$, $bc$patrimoine$bc$, $bc$site naturel$bc$, $bc$protection$bc$, $bc$hôtel$bc$, $bc$nuitée$bc$, $bc$visiteur$bc$, $bc$impact touristique$bc$, $bc$développement durable$bc$, $bc$recette fiscale$bc$, $bc$résident local$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-COL-27$bc$, 3, 25, $bc$Enseignement supérieur / recherche$bc$,
  $bc$Le candidat prend position : les résultats de recherches scientifiques financées par des fonds publics (CRSH, IRSC, NSERC) devraient-ils être systématiquement mis à disposition en libre accès (gratuit pour tous) immédiatement après publication, sans délai d'embargo payant ?$bc$,
  $bc$Beaucoup de recherches financées sur fonds publics canadiens (CRSH, IRSC, NSERC) sont ensuite vendues aux universités par des éditeurs privés payants. Faut-il rendre obligatoire le libre accès immédiat à tout article issu de recherche publique canadienne, sans délai ni embargo ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$recherche scientifique$bc$, $bc$libre accès$bc$, $bc$CRSH$bc$, $bc$IRSC$bc$, $bc$NSERC$bc$, $bc$fonds public$bc$, $bc$article scientifique$bc$, $bc$éditeur$bc$, $bc$publication$bc$, $bc$université$bc$, $bc$savoir$bc$, $bc$accès ouvert$bc$, $bc$science$bc$, $bc$connaissance$bc$, $bc$embargo$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-FIN-29$bc$, 3, 26, $bc$Économie$bc$,
  $bc$Le candidat débat : faudrait-il tester au Canada un revenu universel garanti (le « revenu de base inconditionnel ») de 12 000 $ par an pour toute personne majeure, financé par une taxe unique sur les 10% des revenus les plus élevés ?$bc$,
  $bc$Le revenu universel garanti est parfois présenté comme la solution au travail précaire et à la pauvreté. Selon vous, devrait-on tester au Canada un revenu de base inconditionnel de 12 000 $ par an et par adulte, financé par une surtaxe sur les 10% de revenus les plus élevés ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$revenu universel$bc$, $bc$revenu de base$bc$, $bc$inconditionnel$bc$, $bc$pauvreté$bc$, $bc$précarité$bc$, $bc$surtaxe$bc$, $bc$hauts revenus$bc$, $bc$10%$bc$, $bc$test$bc$, $bc$Canada$bc$, $bc$financement$bc$, $bc$impôt$bc$, $bc$majeur$bc$, $bc$protection sociale$bc$, $bc$économie$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-EMP-30$bc$, 3, 27, $bc$Semaine de 4 jours$bc$,
  $bc$Le candidat débat : l'expérience de la semaine de 4 jours de travail (32 h) dans plusieurs PME britanniques et européennes ayant donné des résultats très positifs (même productivité, bien-être accru), faudrait-il une loi fédérale qui incite massivement les entreprises canadiennes à l'adopter d'ici 2030 ?$bc$,
  $bc$Les expériences de semaine de 4 jours dans plusieurs PME d'Europe et du Royaume-Uni ont montré une productivité stable et un bien-être beaucoup meilleur. Faudrait-il une loi fédérale incitant massivement les entreprises canadiennes à l'adopter d'ici 2030, selon vous ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$semaine de 4 jours$bc$, $bc$32 heures$bc$, $bc$bien-être au travail$bc$, $bc$productivité$bc$, $bc$PME$bc$, $bc$Europe$bc$, $bc$Royaume-Uni$bc$, $bc$loi fédérale$bc$, $bc$entreprise$bc$, $bc$Canada$bc$, $bc$rémunération$bc$, $bc$réduction du temps de travail$bc$, $bc$équilibre vie privée-vie professionnelle$bc$, $bc$expérience$bc$, $bc$rh$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();


INSERT INTO eo_archetypes (
  id, task, ordre, categorie, consigne, question_ouverture,
  duration_sec, prep_sec, set, required_moves, relances,
  examiner_role, candidate_role, scene_facts, complication,
  lexical_field, arguments_pour, arguments_contre, exemples_concrets,
  connecteurs, plan_4t, created_at, updated_at
) VALUES (
  $bc$T3-ENV-31$bc$, 3, 28, $bc$Biodiversité$bc$,
  $bc$Le candidat débat : au Canada, faudrait-il créer une nouvelle catégorie d'aires protégées « Zones de pleine nature » interdites à toute activité extractive (bois, mines, hydrocarbures) et à toute construction humaine permanente, couvrant 30% du territoire terrestre d'ici 2030 ?$bc$,
  $bc$Le Canada s'est engagé à protéger 30% de ses terres et océans d'ici 2030. Faut-il, pour y parvenir, créer une catégorie stricte « Zones de pleine nature », interdites à toute exploitation extractive (bois, mines, hydrocarbures) et à toute construction permanente ? Ou est-ce que cela prive les régions et les communautés de leurs ressources ?$bc$,
  270, 0, $bc$full$bc$,
  ARRAY[$bc$Prendre position claire$bc$, $bc$2 arguments POUR$bc$, $bc$2 arguments CONTRE$bc$, $bc$Exemple concret$bc$, $bc$Conclusion nuancée$bc$],
  NULL,
  $bc$Examinateur TCF Canada$bc$, $bc$Candidat$bc$,
  NULL,
  NULL,
  ARRAY[$bc$biodiversité$bc$, $bc$aire protégée$bc$, $bc$zone protégée$bc$, $bc$pleine nature$bc$, $bc$exploitation$bc$, $bc$bois$bc$, $bc$mine$bc$, $bc$hydrocarbure$bc$, $bc$construction$bc$, $bc$territoire$bc$, $bc$30%$bc$, $bc$Canada$bc$, $bc$objectif international$bc$, $bc$ressources naturelles$bc$, $bc$communauté$bc$],
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  task = EXCLUDED.task, ordre = EXCLUDED.ordre, categorie = EXCLUDED.categorie,
  consigne = EXCLUDED.consigne, question_ouverture = EXCLUDED.question_ouverture,
  duration_sec = EXCLUDED.duration_sec, prep_sec = EXCLUDED.prep_sec, set = EXCLUDED.set,
  required_moves = EXCLUDED.required_moves, relances = EXCLUDED.relances,
  examiner_role = EXCLUDED.examiner_role, candidate_role = EXCLUDED.candidate_role,
  scene_facts = EXCLUDED.scene_facts, complication = EXCLUDED.complication,
  lexical_field = EXCLUDED.lexical_field, arguments_pour = EXCLUDED.arguments_pour,
  arguments_contre = EXCLUDED.arguments_contre, exemples_concrets = EXCLUDED.exemples_concrets,
  connecteurs = EXCLUDED.connecteurs, plan_4t = EXCLUDED.plan_4t, updated_at = NOW();

