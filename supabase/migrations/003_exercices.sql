-- ============================================================
--  Pool d'exercices — Expression écrite (T1 / T2 / T3)
--  Permet de parcourir des sujets tout prêts et de suivre
--  la progression (essai lié à un exercice) par mois.
-- ============================================================

CREATE TABLE IF NOT EXISTS exercices_expression_ecrite (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tache_num  INTEGER NOT NULL CHECK (tache_num IN (1,2,3)),
  consigne   TEXT NOT NULL,
  actif      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exo_tache      ON exercices_expression_ecrite (tache_num);
CREATE INDEX IF NOT EXISTS idx_exo_created_at ON exercices_expression_ecrite (created_at DESC);

-- Lien optionnel entre un essai et l'exercice du pool dont il est issu,
-- pour afficher le badge « % / terminé » dans la liste des sujets.
ALTER TABLE essais_expression_ecrite
  ADD COLUMN IF NOT EXISTS exercice_id UUID REFERENCES exercices_expression_ecrite(id);

CREATE INDEX IF NOT EXISTS idx_ee_exercice ON essais_expression_ecrite (exercice_id);

ALTER TABLE exercices_expression_ecrite ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_read_exercices ON exercices_expression_ecrite;
CREATE POLICY anon_read_exercices ON exercices_expression_ecrite FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS service_write_exercices ON exercices_expression_ecrite;
CREATE POLICY service_write_exercices ON exercices_expression_ecrite
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- -----------------------------------------------------------
--  Pool de départ — sujets réalistes T1 / T2 / T3
-- -----------------------------------------------------------
INSERT INTO exercices_expression_ecrite (tache_num, consigne) VALUES
(1, $c$Vous venez de déménager dans un nouvel appartement. Écrivez un message à un(e) ami(e) pour lui raconter votre installation et l'inviter à venir le visiter.$c$),
(1, $c$Un(e) ami(e) va fêter son anniversaire. Écrivez-lui un message pour lui proposer une sortie et lui demander ce qu'il/elle préférerait faire.$c$),
(1, $c$Vous avez passé un week-end à la campagne. Écrivez un message à un(e) collègue pour lui raconter votre séjour et lui recommander l'endroit.$c$),
(1, $c$Vous organisez votre mariage. Écrivez un message à un(e) ami(e) proche pour l'inviter et lui donner les détails pratiques (date, lieu, heure).$c$),
(1, $c$Un(e) ami(e) va passer un week-end dans votre ville. Écrivez-lui un message pour lui proposer un programme de visite.$c$),
(1, $c$Vous avez lu une annonce sur Internet proposant de l'aide aux personnes âgées du quartier. Écrivez un message à l'organisateur pour proposer votre aide.$c$),
(1, $c$Vous cherchez un vélo d'occasion en bon état et bon marché. Rédigez une annonce précisant vos critères et vos coordonnées.$c$),
(1, $c$Vous avez découvert un lieu touristique que vous aimeriez faire connaître à vos amis. Écrivez un message pour les inviter à vous y accompagner.$c$),
(1, $c$Un(e) ami(e) va s'installer dans votre ville pour ses études. Écrivez-lui un message pour lui proposer de l'aide et des conseils pratiques.$c$),
(1, $c$Vous venez de vous inscrire dans une nouvelle salle de sport. Écrivez un message à un(e) ami(e) pour lui en parler et l'inviter à vous accompagner.$c$),
(1, $c$Un(e) ami(e) souhaite se mettre au sport mais ne sait pas par où commencer. Écrivez-lui un message pour lui donner des conseils et l'encourager.$c$),
(1, $c$Vous avez trouvé un festival de musique qui aura bientôt lieu dans votre région. Écrivez à un(e) ami(e) pour l'inviter à y aller avec vous.$c$),
(1, $c$Vous partez en vacances et avez besoin de faire garder votre animal de compagnie. Écrivez un message à un voisin pour lui demander ce service.$c$),
(1, $c$Vous venez de terminer un cours de cuisine. Écrivez un message à un membre de votre famille pour lui raconter cette expérience et partager une recette.$c$),

(2, $c$Rédigez un article de blog racontant votre expérience d'apprentissage du français et donnant des conseils aux lecteurs qui débutent.$c$),
(2, $c$Vous tenez un blog de voyage. Rédigez un article racontant un séjour qui vous a marqué et expliquant pourquoi vous le recommandez.$c$),
(2, $c$Sur un forum de quartier, rédigez un article racontant votre expérience du télétravail et donnant votre avis sur ses avantages et ses inconvénients.$c$),
(2, $c$Rédigez un article de blog sur une activité sportive ou artistique que vous pratiquez depuis longtemps, et expliquez pourquoi vous la recommandez aux lecteurs.$c$),
(2, $c$Sur un forum consacré à l'environnement, rédigez un article racontant les gestes que vous avez adoptés au quotidien et leurs effets.$c$),
(2, $c$Rédigez un article de blog racontant votre expérience de bénévolat dans une association et l'impact que cela a eu sur vous.$c$),
(2, $c$Sur un forum de parents, rédigez un article partageant votre expérience de l'école de vos enfants et vos recommandations.$c$),
(2, $c$Rédigez un article de blog culinaire racontant votre découverte d'une nouvelle cuisine ou d'un nouveau restaurant, et pourquoi vous la recommandez.$c$),
(2, $c$Sur un forum consacré à la vie en appartement, rédigez un article racontant votre expérience de la colocation et ses avantages.$c$),
(2, $c$Rédigez un article de blog sur votre expérience d'un déménagement dans une autre ville ou un autre pays, et les leçons que vous en tirez.$c$),

(3, $c$De nos jours, certains pensent que le télétravail doit devenir la norme, tandis que d'autres estiment que le travail au bureau reste indispensable. Rédigez un article présentant les deux points de vue, puis exprimez votre opinion.$c$),
(3, $c$Certaines personnes pensent que les réseaux sociaux rapprochent les gens, d'autres estiment qu'ils les isolent davantage. Rédigez un article de journal présentant les deux points de vue, puis donnez votre avis.$c$),
(3, $c$Pour certains, l'école doit privilégier les notes et les examens ; pour d'autres, elle doit avant tout développer la créativité des élèves. Présentez les deux points de vue, puis exprimez votre opinion.$c$),
(3, $c$Certains estiment que les grandes villes offrent une meilleure qualité de vie, d'autres préfèrent la vie à la campagne. Rédigez un article comparant les deux points de vue, puis donnez le vôtre.$c$),
(3, $c$Pour certains, la voiture individuelle reste indispensable en ville ; pour d'autres, il faut développer les transports en commun. Présentez les deux points de vue, puis exprimez votre opinion.$c$),
(3, $c$Certaines personnes pensent que les achats en ligne remplaceront bientôt les commerces de quartier, d'autres estiment que ces derniers resteront essentiels. Présentez les deux points de vue, puis donnez votre avis.$c$),
(3, $c$Pour certains, il est préférable d'apprendre une langue seul avec des applications ; pour d'autres, les cours avec un professeur restent irremplaçables. Présentez les deux points de vue, puis exprimez votre opinion.$c$),
(3, $c$Certains estiment que le sport doit rester un loisir, d'autres pensent qu'il devrait être davantage intégré à la vie professionnelle. Présentez les deux points de vue, puis donnez le vôtre.$c$),
(3, $c$Pour certains, les animaux de compagnie n'ont pas leur place en appartement en ville ; pour d'autres, ils y sont parfaitement adaptés. Présentez les deux points de vue, puis exprimez votre opinion.$c$),
(3, $c$Certaines personnes pensent que la lecture papier restera toujours préférable aux livres numériques, d'autres estiment que le numérique est l'avenir de la lecture. Présentez les deux points de vue, puis donnez votre avis.$c$);
