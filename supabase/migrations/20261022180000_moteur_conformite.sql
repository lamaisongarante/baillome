-- =====================================================================
-- Baillome · Étape 2 · Moteur de conformité
-- Source : docs/regles-de-conformite.md (export et compléments du 22/10/2026).
-- Les règles sont des données datées : paramètres, dates d'effet, sources,
-- messages et gravités. Corriger une règle = modifier ces données, sans
-- republier l'application.
-- Les messages sont repris mot pour mot des fiches.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Les règles et leur statut de validation
-- ---------------------------------------------------------------------
create table public.regles (
  code text primary key, -- 'R-01' … 'R-12', 'SCORE'
  titre text not null,
  gravite_defaut text check (gravite_defaut in ('critique', 'important', 'conseil')),
  -- Une règle non validée n'est visible qu'en mode aperçu.
  validee boolean not null default false,
  validee_le date,
  date_verification date not null,
  textes_reference text not null
);

-- Paramètres datés : seuils, durées, dates. Une évolution de la loi = une nouvelle version.
create table public.regles_versions (
  id uuid primary key default gen_random_uuid(),
  regle_code text not null references public.regles (code),
  version text not null,
  date_effet date not null,
  -- Au-delà, la version doit être revue (ex. messages écrits pour une période donnée).
  valable_jusqu_au date,
  parametres jsonb not null default '{}',
  source text not null,
  unique (regle_code, version)
);

-- Situations détectées : gravité, message au bailleur et action proposée.
create table public.regles_situations (
  regle_code text not null references public.regles (code),
  code text not null,
  libelle text not null, -- intitulé de la situation dans la fiche
  titre text, -- titre court affiché sur la carte de résultat (formulations du 22/10/2026)
  gravite text not null check (gravite in ('critique', 'important', 'conseil', 'ok')),
  message text not null,
  action text not null,
  primary key (regle_code, code)
);

-- Réponses du bailleur aux questions du check-up, bien par bien.
create table public.reponses_checkup (
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bien_id uuid not null,
  question text not null,
  valeur text not null,
  repondu_le timestamptz not null default now(),
  primary key (bien_id, question),
  foreign key (bien_id, proprietaire_id) references public.biens (id, proprietaire_id) on delete cascade
);

-- Mode aperçu : affiche les règles non validées et le score. Activé par
-- l'administration seulement (jamais depuis l'application).
alter table public.profils add column apercu_regles boolean not null default false;

-- Énergie de chauffage (R-01, question 4) et résultat d'un diagnostic (CREP : présence ou absence de plomb).
alter table public.biens add column chauffage_energie text
  check (chauffage_energie in ('electrique', 'gaz', 'fioul', 'bois', 'reseau', 'autre'));
grant update (chauffage_energie) on public.biens to authenticated;
-- Surface de la plus grande pièce principale (R-12, décence : art. 4 du décret n° 2002-120).
alter table public.biens add column surface_piece_principale numeric(6, 2)
  check (surface_piece_principale is null or surface_piece_principale > 0);
grant update (surface_piece_principale) on public.biens to authenticated;
alter table public.diagnostics add column resultat text check (resultat in ('presence', 'absence'));

alter table public.regles enable row level security;
alter table public.regles_versions enable row level security;
alter table public.regles_situations enable row level security;
alter table public.reponses_checkup enable row level security;

create policy lecture on public.regles for select to authenticated using (true);
create policy lecture on public.regles_versions for select to authenticated using (true);
create policy lecture on public.regles_situations for select to authenticated using (true);
create policy proprietaire on public.reponses_checkup for all to authenticated
  using (proprietaire_id = (select auth.uid()))
  with check (proprietaire_id = (select auth.uid()));

-- =====================================================================
-- Les règles
-- =====================================================================
insert into public.regles (code, titre, gravite_defaut, validee, validee_le, date_verification, textes_reference) values
  ('R-01', 'Performance énergétique (DPE)', 'critique', true, '2026-10-20', '2026-10-22',
   $t$loi n° 89-462 du 6 juillet 1989, art. 6 (décence), art. 20-1 (mise en conformité, pouvoirs du juge), art. 17 II et 17-1 III (gel du loyer F et G) ; décret n° 2002-120 du 30 janvier 2002, art. 3 bis et 3 ter (modifiés par le décret n° 2023-796) ; code de la construction et de l'habitation, art. L. 173-1-1 ; décret n° 2020-1610 du 17 décembre 2020 (nouveau DPE, validité des anciens) ; arrêté du 13 août 2025 (coefficient électricité 1,9, attestation ADEME).$t$),
  ('R-02', 'Révision du loyer', 'important', true, '2026-10-20', '2026-10-20',
   $t$loi n° 89-462, art. 17-1 I (clause, plafond IRL, délai d'un an, absence de rétroactivité), art. 17-1 III (F et G), art. 25-9 (meublé), art. 7-1 (prescription d'un an de l'action en révision).$t$),
  ('R-03', 'Dépôt de garantie', 'important', true, '2026-10-20', '2026-10-20',
   $t$loi n° 89-462, art. 22 (plafond en nu, délais, justificatifs, 20 % en copropriété, majoration de 10 %, vente) ; art. 25-6 (deux mois en meublé) ; dispositions sur le bail mobilité (interdiction).$t$),
  ('R-04', 'Diagnostics annexés au bail', 'critique', true, '2026-10-20', '2026-10-22',
   $t$loi n° 89-462, art. 3-3 ; code de la construction et de l'habitation (plomb, électricité, gaz) ; code de l'environnement, art. L. 125-5 (état des risques, y compris pour un garage seul) ; code de l'urbanisme, art. L. 112-11 (nuisances sonores aériennes).$t$),
  ('R-05', 'Bail conforme au contrat type', 'critique', false, null, '2026-10-22',
   $t$loi n° 89-462, art. 3, 3-3, 4 ; décret n° 2015-587 modifié ; arrêtés de la notice d'information.$t$),
  ('R-06', 'État des lieux', 'important', false, null, '2026-10-22',
   $t$décret n° 2016-382 ; loi n° 89-462, art. 3-2, 4, 7, 22, 25-5 ; décret n° 87-712.$t$),
  ('R-07', 'Dossier de candidature', 'important', false, null, '2026-10-22',
   $t$décret n° 2015-1437 (annexes I et II) ; loi n° 89-462, art. 22-2.$t$),
  ('R-08', 'Assurances', 'important', false, null, '2026-10-22',
   $t$loi n° 89-462, art. 7, g ; loi n° 65-557, art. 9-1.$t$),
  ('R-09', 'Zones tendues et loyer à la relocation', 'important', false, null, '2026-10-22',
   $t$décret n° 2017-1198 (version du 1er août 2026 au 31 juillet 2027) ; loi n° 89-462, art. 18 ; décret n° 2026-831, annexe, 1°.$t$),
  ('R-10', 'Fiscalité', 'conseil', false, null, '2026-10-22',
   $t$CGI, art. 31, 32, 50-0, 156, I, 3°.$t$),
  ('R-11', 'Location meublée', 'important', false, null, '2026-10-22',
   $t$décret n° 2015-981, art. 2.$t$),
  ('R-12', 'Décence du logement', 'critique', false, null, '2026-10-22',
   $t$décret n° 2002-120 (art. 2 à 5) ; loi n° 89-462, art. 6.$t$),
  ('SCORE', 'Calcul du score', null, false, null, '2026-10-22',
   $t$Proposition de calcul, conventions communes des règles de conformité.$t$);

-- =====================================================================
-- Paramètres datés
-- =====================================================================
insert into public.regles_versions (regle_code, version, date_effet, valable_jusqu_au, parametres, source) values
  ('R-01', '2026-10-22', '2025-01-01', '2027-12-31', $j${
     "classes_non_decentes": [
       {"classe": "G", "depuis": "2025-01-01"},
       {"classe": "F", "depuis": "2028-01-01"},
       {"classe": "E", "depuis": "2034-01-01"}
     ],
     "dpe_valables_depuis": "2021-07-01",
     "validite_dpe_ans": 10,
     "calcul_electricite": {"date_effet": "2026-01-01", "dpe_du": "2021-07-01", "dpe_au": "2025-12-31"},
     "alerte_expiration_mois": 6
   }$j$, $s$Fiche R-01 validée le 20/10/2026 ; compléments du 22/10/2026 (arrêté du 13 août 2025, JO du 26 août 2025). Les messages des classes F et E sont écrits pour la période antérieure au 1er janvier 2028.$s$),
  ('R-04', '2026-10-22', '2025-01-01', null, $j${
     "crep_construction_avant": "1949-01-01",
     "crep_validite_ans_si_presence": 6,
     "installation_age_ans": 15,
     "validite_electricite_gaz_ans": 6,
     "validite_etat_risques_mois": 6,
     "amiante_permis_avant": "1997-07-01",
     "alerte_expiration_mois": 3
   }$j$, $s$Fiche R-04 validée le 20/10/2026 ; question amiante du 22/10/2026.$s$),
  ('R-08', '2026-10-22', '2025-01-01', null, $j${"delai_attestation_jours": 30}$j$,
   $s$Fiche R-08 (messages à valider).$s$),
  ('R-12', '2026-10-22', '2025-01-01', null, $j${"piece_surface_min_m2": 9, "piece_hauteur_min_m": 2.2, "piece_volume_min_m3": 20}$j$,
   $s$Décret n° 2002-120, art. 4 (fiche R-12, compléments du 22/10/2026).$s$),
  ('SCORE', '2026-10-22', '2025-01-01', null, $j${"depart": 100, "critique": 25, "important": 12, "conseil": 0, "minimum": 0, "une_deduction_par_regle": true}$j$,
   $s$Proposition à valider : 100, moins 25 (Critique) ou 12 (Important) par règle, en ne retenant que la situation la plus grave de chaque règle ; minimum 0 (correction du 22/10/2026).$s$);

-- =====================================================================
-- Situations, messages et actions (mot pour mot)
-- Décision du 22/10/2026 : les situations positives s'affichent en OK.
-- =====================================================================
insert into public.regles_situations (regle_code, code, libelle, gravite, message, action) values
  -- R-01
  ('R-01', 'dpe_absent_ou_ancien', $x$Pas de DPE, ou DPE réalisé avant le 1er juillet 2021$x$, 'critique',
   $x$Votre DPE a pris sa retraite. Ceux réalisés avant juillet 2021 ne sont plus valables : pour la loi, c'est comme si vous n'en aviez pas. Or c'est lui qui décide si vous pouvez louer, et si votre loyer peut évoluer. La bonne nouvelle ? Un nouveau DPE se fait en une seule visite.$x$,
   $x$Faire réaliser un DPE par un diagnostiqueur certifié avant toute signature ou tout renouvellement de bail.$x$),
  ('R-01', 'dpe_plus_10_ans', $x$DPE de plus de 10 ans$x$, 'critique',
   $x$Votre DPE vient de fêter ses 10 ans… et c'est aussi sa date de péremption. Un nouveau diagnostic s'impose avant votre prochaine signature de bail.$x$,
   $x$Faire réaliser un DPE par un diagnostiqueur certifié avant toute signature ou tout renouvellement de bail.$x$),
  ('R-01', 'classe_g', $x$Classe G$x$, 'critique',
   $x$Votre logement est classé G, la note la plus basse de l'échelle. Depuis le 1er janvier 2025, la loi le considère comme « non décent » : pas de nouveau bail, pas de prolongation du bail en cours, et un loyer bloqué. Ce n'est pas une impasse : il existe des solutions, et nous allons les regarder ensemble.$x$,
   $x$Établir un plan de travaux pour atteindre au moins la classe E avant la prochaine échéance du bail. Proposer un rendez-vous de conseil.$x$),
  ('R-01', 'classe_g_locataire', $x$Classe G, locataire en place$x$, 'critique',
   $x$Bon à savoir : même en cours de bail, votre locataire peut vous demander de rendre le logement conforme. S'il saisit le juge, celui-ci peut fixer les travaux et leur délai, et réduire ou suspendre le loyer jusqu'à leur réalisation. Le bail reste valable, mais mieux vaut prendre les devants.$x$,
   $x$Lancer le plan de travaux sans attendre une demande du locataire ; proposer un rendez-vous de conseil.$x$),
  ('R-01', 'classe_f', $x$Classe F$x$, 'important',
   $x$Votre logement est classé F. Vous pouvez le louer aujourd'hui, mais votre loyer est figé : pas de révision annuelle. Le compte à rebours a commencé : au 1er janvier 2028, la classe F ne suffira plus. Vous avez le temps de vous organiser, à condition de commencer maintenant.$x$,
   $x$Planifier les travaux pour viser au moins la classe E avant la première échéance du bail qui suit le 1er janvier 2028.$x$),
  ('R-01', 'classe_e', $x$Classe E$x$, 'conseil',
   $x$Classe E : vous êtes dans les clous jusqu'en 2034. Une belle avance, que vous pouvez mettre à profit en prévoyant des améliorations au fil des changements de locataire.$x$,
   $x$Anticiper les travaux lors des prochains changements de locataire.$x$),
  ('R-01', 'attestation_electricite', $x$Classe E, F ou G, chauffage électrique, DPE réalisé depuis le 1er juillet 2021 et avant le dernier changement de calcul$x$, 'conseil',
   $x$Votre logement est chauffé à l'électricité ? Le calcul du DPE a évolué en sa faveur. Votre étiquette pourrait s'améliorer sans le moindre travaux, et gratuitement : une attestation mise à jour se télécharge en quelques minutes sur le site de l'ADEME.$x$,
   $x$Aller sur l'Observatoire DPE-Audit de l'ADEME, saisir le numéro à 13 chiffres en haut à droite du DPE, télécharger l'attestation gratuite, puis renseigner la nouvelle classe dans l'application. L'attestation garde la date de validité du DPE d'origine.$x$),
  -- R-04
  ('R-04', 'crep_absent', $x$Logement d'avant 1949 sans CREP$x$, 'critique',
   $x$Votre logement a du caractère, il date d'avant 1949 ! Pour la loi, il faut alors vérifier l'absence de plomb dans les peintures. Un diagnostiqueur s'en charge, et si le résultat est négatif, le constat est valable à vie.$x$,
   $x$Faire réaliser un CREP par un diagnostiqueur certifié.$x$),
  ('R-04', 'crep_positif_perime', $x$CREP positif de plus de 6 ans$x$, 'important',
   $x$Votre constat plomb mentionne du plomb et il a plus de 6 ans : il doit être refait avant votre prochaine signature de bail.$x$,
   $x$Refaire le CREP.$x$),
  ('R-04', 'securite_absent', $x$Électricité ou gaz de plus de 15 ans, sans diagnostic valable$x$, 'critique',
   $x$Une installation de plus de 15 ans mérite un petit contrôle de sécurité : c'est obligatoire pour louer, et rassurant pour tout le monde. Le diagnostic reste valable 6 ans.$x$,
   $x$Faire réaliser le diagnostic électricité ou gaz.$x$),
  ('R-04', 'securite_perime', $x$Diagnostic électricité ou gaz de plus de 6 ans$x$, 'important',
   $x$Votre diagnostic de sécurité a fêté ses 6 ans : il est temps d'en refaire un avant le prochain bail.$x$,
   $x$Refaire le diagnostic.$x$),
  ('R-04', 'erp_plus_6_mois', $x$Nouveau bail ou renouvellement, état des risques de plus de 6 mois$x$, 'critique',
   $x$L'état des risques a une durée de vie très courte : 6 mois seulement. Bonne nouvelle, vous pouvez le générer vous-même, gratuitement, en quelques minutes.$x$,
   $x$Générer un nouvel état des risques sur le site public Géorisques et l'ajouter au coffre.$x$),
  ('R-04', 'erp_absent', $x$Absence d'état des risques au bail$x$, 'critique',
   $x$Sans état des risques, votre locataire pourrait demander l'annulation du bail ou une baisse de loyer. Heureusement, ça se règle vite et gratuitement.$x$,
   $x$Générer l'état des risques et le remettre au locataire.$x$),
  ('R-04', 'bruit', $x$Logement en zone de bruit d'aérodrome$x$, 'important',
   $x$Votre logement se trouve dans une zone de bruit liée à un aérodrome : une information spécifique doit accompagner le bail.$x$,
   $x$Joindre l'état des nuisances sonores aériennes.$x$),
  ('R-04', 'amiante', $x$Immeuble collectif d'avant juillet 1997 sans dossier amiante$x$, 'important',
   $x$Votre immeuble date d'avant juillet 1997 : vous devez pouvoir présenter un dossier amiante des parties privatives si votre locataire le demande. Il n'est pas joint au bail, mais il doit être prêt.$x$,
   $x$Faire réaliser le dossier amiante des parties privatives et le ranger dans le coffre.$x$),
  ('R-04', 'tous_valables', $x$Tous les diagnostics valables$x$, 'ok',
   $x$Votre dossier de diagnostics est complet et à jour. Bravo, c'est un vrai gage de sérieux auprès de votre locataire !$x$,
   $x$Aucune action.$x$),
  -- R-05
  ('R-05', 'identifiant_fiscal', $x$Identifiant fiscal du logement absent ou mal formé$x$, 'critique',
   $x$Le bail doit mentionner l'identifiant fiscal du logement. Il se trouve en quelques clics dans votre espace particulier sur impots.gouv.fr, rubrique « Biens immobiliers ».$x$,
   $x$Bloquer la génération du bail ; afficher l'aide « Où le trouver ? ».$x$),
  -- R-08
  ('R-08', 'attestation_absente', $x$Pas d'attestation du locataire à la remise des clés$x$, 'important',
   $x$Votre locataire doit justifier de son assurance dès la remise des clés. Demandons-lui son attestation.$x$,
   $x$Envoyer la demande.$x$),
  ('R-08', 'attestation_perimee', $x$Attestation annuelle non reçue 30 jours après la date anniversaire$x$, 'important',
   $x$L'attestation d'assurance de votre locataire n'est plus à jour. Vous avez deux options, qui s'excluent l'une l'autre : nous vous les expliquons avant de choisir.$x$,
   $x$Présenter les deux voies.$x$),
  ('R-08', 'pno_copropriete', $x$Bien en copropriété sans assurance propriétaire non occupant enregistrée$x$, 'important',
   $x$En copropriété, votre assurance de propriétaire non occupant est obligatoire. Ajoutez votre contrat à la fiche du bien.$x$,
   $x$Saisir le contrat.$x$),
  ('R-08', 'pno_hors_copropriete', $x$Bien hors copropriété sans assurance propriétaire non occupant$x$, 'conseil',
   $x$Rien ne vous y oblige ici, mais l'assurance de votre locataire ne couvre pas tout : dégâts quand le logement est vide, recours d'un voisin… Une assurance propriétaire non occupant vous protège pour un coût modeste.$x$,
   $x$Information.$x$),
  -- R-09
  ('R-09', 'zone_tendue_relocation', $x$Bien en zone tendue, nouvelle location en préparation$x$, 'important',
   $x$Votre logement est en zone tendue : le loyer du prochain locataire ne pourra pas dépasser [montant] €, sauf exceptions (gros travaux, loyer très inférieur au voisinage).$x$,
   $x$Calculer le plafond ; pré-remplir le bail.$x$),
  -- R-11
  ('R-11', 'element_manquant', $x$Élément obligatoire manquant à l'inventaire$x$, 'important',
   $x$Il manque [élément] à votre inventaire. Sans les onze éléments obligatoires, la location risque d'être requalifiée en location vide, avec une durée de bail et un dépôt de garantie différents.$x$,
   $x$Compléter l'inventaire.$x$),
  ('R-11', 'inventaire_complet', $x$Inventaire complet$x$, 'ok',
   $x$Votre meublé est équipé de tous les éléments obligatoires.$x$,
   $x$Aucune action.$x$),
  -- R-12
  ('R-12', 'surface', $x$Aucune pièce principale de 9 m² avec 2,20 m sous plafond (ou 20 m³)$x$, 'critique',
   $x$La loi exige au moins une pièce principale de 9 m² avec 2,20 m sous plafond (ou 20 m³). Votre logement ne peut pas être loué comme résidence principale en l'état.$x$,
   $x$Bloquer la génération du bail.$x$),
  ('R-12', 'arrete', $x$Arrêté de mise en sécurité ou de traitement de l'insalubrité$x$, 'critique',
   $x$Un logement frappé d'un arrêté de mise en sécurité ou d'insalubrité ne peut pas être loué.$x$,
   $x$Bloquer ; proposer un rendez-vous de conseil.$x$),
  ('R-12', 'critere', $x$Critère d'équipement ou de sécurité déclaré non respecté$x$, 'important',
   $x$Un point de décence est à améliorer : [critère]. Votre locataire peut en demander la mise en conformité à tout moment.$x$,
   $x$Lister les travaux.$x$),
  ('R-12', 'contraintes_travaux', $x$Contraintes techniques ou patrimoniales empêchant les travaux énergétiques (art. 3 ter)$x$, 'conseil',
   $x$Si des contraintes techniques ou patrimoniales empêchent les travaux, le juge ne peut pas les ordonner. Conservez les justificatifs (attestation d'un professionnel, refus d'autorisation).$x$,
   $x$Ranger les justificatifs au coffre.$x$);

-- =====================================================================
-- Titres courts des cartes de résultat (docs/formulations-check-up.md, § 3)
-- =====================================================================
update public.regles_situations s set titre = t.titre
from (values
  ('R-01', 'dpe_absent_ou_ancien', $x$Votre DPE n'est plus valable$x$),
  ('R-01', 'dpe_plus_10_ans', $x$Votre DPE est périmé$x$),
  ('R-01', 'classe_g', $x$Classe G : location interdite$x$),
  ('R-01', 'classe_g_locataire', $x$Votre locataire peut exiger des travaux$x$),
  ('R-01', 'classe_f', $x$Classe F : votre loyer est figé$x$),
  ('R-01', 'classe_e', $x$Classe E : tranquille jusqu'en 2034$x$),
  ('R-01', 'attestation_electricite', $x$Votre étiquette peut s'améliorer gratuitement$x$),
  ('R-04', 'crep_absent', $x$Constat plomb à faire$x$),
  ('R-04', 'crep_positif_perime', $x$Constat plomb à refaire$x$),
  ('R-04', 'securite_absent', $x$Diagnostic de sécurité à faire$x$),
  ('R-04', 'securite_perime', $x$Diagnostic de sécurité à refaire$x$),
  ('R-04', 'erp_plus_6_mois', $x$État des risques à renouveler$x$),
  ('R-04', 'erp_absent', $x$État des risques manquant$x$),
  ('R-04', 'bruit', $x$Information bruit à joindre$x$),
  ('R-04', 'amiante', $x$Dossier amiante à préparer$x$),
  ('R-04', 'tous_valables', $x$Diagnostics à jour$x$),
  ('R-05', 'identifiant_fiscal', $x$Identifiant fiscal manquant$x$),
  ('R-08', 'attestation_absente', $x$Attestation d'assurance à demander$x$),
  ('R-08', 'attestation_perimee', $x$Assurance du locataire à vérifier$x$),
  ('R-08', 'pno_copropriete', $x$Assurance propriétaire obligatoire$x$),
  ('R-08', 'pno_hors_copropriete', $x$Assurance propriétaire conseillée$x$),
  ('R-09', 'zone_tendue_relocation', $x$Zone tendue : loyer encadré à la relocation$x$),
  ('R-11', 'element_manquant', $x$Meublé incomplet$x$),
  ('R-11', 'inventaire_complet', $x$Meublé bien équipé$x$),
  ('R-12', 'surface', $x$Surface trop petite pour louer$x$),
  ('R-12', 'arrete', $x$Logement sous arrêté$x$),
  ('R-12', 'critere', $x$Point de décence à améliorer$x$)
) as t (regle_code, code, titre)
where s.regle_code = t.regle_code and s.code = t.code;
