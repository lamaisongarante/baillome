-- Étape 3 · Structure complète du bail : les rubriques du contrat type
-- (décret n° 2015-587, annexes 1 et 2, version du 1er octobre 2026) et du
-- bail de garage (contenus/modeles/bail-garage-0.1.md). Toutes les colonnes
-- sont facultatives : un bail saisi par le bailleur (signé hors de Baillome)
-- peut rester incomplet ; les contrôles avant génération exigent le reste.

alter table public.baux
  -- III. Durée
  add column duree_mois smallint check (duree_mois > 0),
  add column motif_duree_reduite text, -- bail nu, durée réduite d'au moins un an (événement précis)

  -- IV. A. Loyer
  add column loyer_hc numeric(10, 2) check (loyer_hc >= 0),
  add column soumis_evolution_relocation boolean, -- décret fixant annuellement le montant maximum d'évolution (zone tendue)
  add column soumis_loyer_reference boolean,      -- loyer de référence majoré fixé par arrêté préfectoral
  add column loyer_reference_m2 numeric(8, 2),
  add column loyer_reference_majore_m2 numeric(8, 2),
  add column complement_loyer numeric(10, 2),
  add column complement_justification text,
  -- Dernier loyer du précédent locataire (mention obligatoire s'il est parti depuis moins de dix-huit mois)
  add column precedent_loyer numeric(10, 2),
  add column precedent_loyer_verse_le date,
  add column precedent_revision_le date,
  -- Révision
  add column clause_revision boolean,
  add column date_revision date, -- vide : date anniversaire du bail
  add column trimestre_irl smallint check (trimestre_irl between 1 and 4),

  -- IV. B. Charges récupérables
  add column mode_charges text check (mode_charges in ('provisions', 'periodique', 'forfait')),
  add column charges_montant numeric(10, 2) check (charges_montant >= 0),
  add column revision_forfait text,
  -- IV. C. (nu) Contribution pour le partage des économies de charges
  add column contribution_montant numeric(10, 2),
  add column contribution_duree text,
  add column contribution_justification text,
  -- Assurance souscrite par le bailleur pour le compte des colocataires
  add column assurance_pour_compte boolean not null default false,
  add column assurance_montant_annuel numeric(10, 2),
  -- Modalités de paiement
  add column periodicite text not null default 'mensuelle' check (periodicite in ('mensuelle', 'trimestrielle')),
  add column terme text check (terme in ('a_echoir', 'echu')),
  add column jour_paiement smallint check (jour_paiement between 1 and 31),
  add column lieu_paiement text,

  -- V. Travaux (textes libres du bailleur)
  add column travaux_depuis_dernier_bail text,
  add column travaux_six_derniers_mois text,
  add column majoration_travaux text,
  add column diminution_travaux text,

  -- VI. Garanties
  add column depot_garantie numeric(10, 2) check (depot_garantie >= 0),
  -- VII. Solidarité (plusieurs locataires)
  add column clause_solidarite boolean,
  -- VIII. Clauses de résiliation de plein droit facultatives
  add column clause_resiliation_assurance boolean not null default true,
  add column clause_resiliation_troubles boolean not null default true,
  -- X. Autres conditions particulières
  add column conditions_particulieres text,

  -- Signature : avancée par défaut, qualifiée en option (décision du 22/10/2026)
  add column niveau_signature text not null default 'avancee' check (niveau_signature in ('avancee', 'qualifiee')),
  -- Traçabilité des textes utilisés (contenus/officiels)
  add column modele_version text,
  add column notice_version text,

  -- Bail de garage seul (projet de clauses, à valider par l'avocat)
  add column vehicule text,
  add column rangement_autorise boolean,
  add column preavis_mois smallint check (preavis_mois > 0),
  add column icc_trimestre smallint check (icc_trimestre between 1 and 4),
  add column icc_annee smallint,
  add column icc_indice numeric(8, 2),
  add column delai_restitution_jours smallint check (delai_restitution_jours > 0),
  add column clause_vente boolean not null default false;

revoke update on public.baux from authenticated;
grant update (
  type_bail, statut, date_effet, date_fin, locataires_couple,
  duree_mois, motif_duree_reduite,
  loyer_hc, soumis_evolution_relocation, soumis_loyer_reference, loyer_reference_m2, loyer_reference_majore_m2,
  complement_loyer, complement_justification, precedent_loyer, precedent_loyer_verse_le, precedent_revision_le,
  clause_revision, date_revision, trimestre_irl,
  mode_charges, charges_montant, revision_forfait,
  contribution_montant, contribution_duree, contribution_justification,
  assurance_pour_compte, assurance_montant_annuel,
  periodicite, terme, jour_paiement, lieu_paiement,
  travaux_depuis_dernier_bail, travaux_six_derniers_mois, majoration_travaux, diminution_travaux,
  depot_garantie, clause_solidarite, clause_resiliation_assurance, clause_resiliation_troubles,
  conditions_particulieres, niveau_signature, modele_version, notice_version,
  vehicule, rangement_autorise, preavis_mois, icc_trimestre, icc_annee, icc_indice,
  delai_restitution_jours, clause_vente
) on public.baux to authenticated;

-- Servitude de résidence principale (code de l'urbanisme, art. L. 151-14-1) :
-- mention au bail (II. B) et clause de résiliation possible (VIII).
alter table public.biens add column servitude_residence_principale boolean not null default false;
grant update (servitude_residence_principale) on public.biens to authenticated;

-- ---------------------------------------------------------------------
-- R-03 · Dépôt de garantie : paramètres datés et situation (fiche validée
-- le 20/10/2026 ; loi n° 89-462, art. 22 et 25-6 ; titre court : docs/formulations-check-up.md)
-- ---------------------------------------------------------------------
insert into public.regles_versions (regle_code, version, date_effet, valable_jusqu_au, parametres, source) values
  ('R-03', '2026-10-23', '2025-01-01', null, $j${"plafond_mois_loyer_hc": {"nu": 1, "meuble": 2}}$j$,
   $s$Fiche R-03 validée le 20/10/2026 ; loi n° 89-462, art. 22 (un mois de loyer en principal) et 25-6 (deux mois en meublé), relus sur Légifrance le 22/10/2026.$s$);

insert into public.regles_situations (regle_code, code, libelle, titre, gravite, message, action) values
  ('R-03', 'depot_depasse', $x$Dépôt supérieur à 1 mois de loyer hors charges (location nue) ou à 2 mois (meublé)$x$,
   $x$Dépôt de garantie trop élevé$x$, 'important',
   $x$Petit dépassement repéré : votre dépôt de garantie est plus élevé que ce que la loi autorise. La partie en trop n'a pas de valeur juridique, et votre locataire pourrait vous la réclamer. Autant régulariser à l'amiable, en toute sérénité.$x$,
   $x$Rembourser le trop-perçu au locataire et en garder la trace dans le coffre du bien.$x$);
