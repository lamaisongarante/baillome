-- =====================================================================
-- Baillome · Étape 1 · Le socle
-- Source : spec-etape-1-socle.md (décisions validées du 20 au 22/10/2026).
-- Principe : chaque ligne appartient à un bailleur (proprietaire_id) et
-- n'est visible que par lui (sécurité ligne par ligne).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Formules (données de référence, spec § 6). Le nombre de biens autorisé
-- est une donnée, jamais une valeur écrite dans le code.
-- ---------------------------------------------------------------------
create table public.formules (
  code text primary key,
  libelle text not null,
  max_biens integer check (max_biens is null or max_biens > 0), -- null = illimité
  prix_mensuel_centimes integer,
  prix_annuel_centimes integer,
  ordre smallint not null unique
);

insert into public.formules (code, libelle, max_biens, prix_mensuel_centimes, prix_annuel_centimes, ordre) values
  ('decouverte', 'Découverte', 1, 0, 0, 1),
  ('essentiel', 'Essentiel', 3, 590, 5900, 2),
  ('gestion', 'Gestion', 10, 990, 9900, 3),
  ('patrimoine', 'Patrimoine', null, 1990, 19900, 4);

-- ---------------------------------------------------------------------
-- Profil du bailleur (1 par compte)
-- ---------------------------------------------------------------------
create table public.profils (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text,
  nom text,
  formule text not null default 'decouverte' references public.formules (code),
  cree_le timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Consentements : on garde le document, sa version et la date.
-- Jamais modifiés ni supprimés par l'utilisateur (trace).
-- ---------------------------------------------------------------------
create table public.consentements (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  document text not null check (document in ('cgu', 'confidentialite')),
  version text not null,
  accepte_le timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Entités (spec § 2) : nom propre (créé automatiquement), SCI, indivision.
-- ---------------------------------------------------------------------
create table public.entites (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('nom_propre', 'sci', 'indivision')),
  nom text not null,
  -- Qualité du bailleur dans les baux.
  qualite_bailleur text not null default 'personne_physique'
    check (qualite_bailleur in ('personne_physique', 'personne_morale')),
  -- Société civile familiale jusqu'au quatrième degré (SCI uniquement).
  sci_familiale boolean not null default false,
  siren text check (siren is null or siren ~ '^[0-9]{9}$'),
  cree_le timestamptz not null default now(),
  unique (id, proprietaire_id),
  check (type = 'sci' or sci_familiale = false)
);

-- Un seul « nom propre » par bailleur.
create unique index entites_un_nom_propre on public.entites (proprietaire_id) where type = 'nom_propre';

-- V2 (spec § 2) : associés de SCI pour la déclaration 2072. Modèle seulement, sans écran.
create table public.associes_entite (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entite_id uuid not null,
  nom text not null,
  nombre_parts integer check (nombre_parts is null or nombre_parts > 0),
  foreign key (entite_id, proprietaire_id) references public.entites (id, proprietaire_id) on delete cascade
);

-- ---------------------------------------------------------------------
-- Biens (spec § 3 et § 4)
-- ---------------------------------------------------------------------
create table public.biens (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entite_id uuid not null,
  numero integer not null, -- « Bien n° 01 », attribué automatiquement
  libelle text,

  -- Premier parcours (maquette 14)
  type_bien text not null check (type_bien in ('appartement', 'maison', 'garage', 'autre')),
  situation_locative text check (situation_locative in ('loue_vide', 'loue_meuble', 'pas_encore_loue')),
  type_location text check (type_location in (
    'nue', 'meublee', 'colocation_bail_unique', 'garage_stationnement', 'meuble_tourisme')),

  -- Identité du bien
  adresse text,
  batiment text,
  etage text,
  porte text,
  code_postal text check (code_postal is null or code_postal ~ '^[0-9]{5}$'),
  commune text,
  code_insee text check (code_insee is null or code_insee ~ '^[0-9][0-9AB][0-9]{3}$'),
  latitude double precision,
  longitude double precision,
  -- Identifiant fiscal du logement : 12 chiffres (décision du 21/10/2026 : pas de contrôle du département).
  identifiant_fiscal text check (identifiant_fiscal is null or identifiant_fiscal ~ '^[0-9]{12}$'),
  type_habitat text check (type_habitat in ('collectif', 'individuel')),
  regime_juridique text check (regime_juridique in ('mono_propriete', 'copropriete')),
  periode_construction text check (periode_construction in (
    'avant_1949', '1949_1974', '1975_1989', '1989_2005', 'depuis_2005')),

  -- Surfaces et pièces
  surface_habitable numeric(7, 2) check (surface_habitable is null or surface_habitable > 0),
  pieces_principales smallint check (pieces_principales is null or pieces_principales >= 0),
  hauteur_sous_plafond numeric(4, 2) check (hauteur_sous_plafond is null or hauteur_sous_plafond > 0),
  autres_parties text[] not null default '{}',

  -- Énergie (le DPE donne une fourchette de dépenses)
  dpe_classe text check (dpe_classe in ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  dpe_date date,
  dpe_numero text,
  dpe_depenses_min_euros integer check (dpe_depenses_min_euros is null or dpe_depenses_min_euros >= 0),
  dpe_depenses_max_euros integer check (dpe_depenses_max_euros is null or dpe_depenses_max_euros >= 0),
  dpe_annee_reference_prix smallint,

  -- Équipements
  chauffage_mode text check (chauffage_mode in ('individuel', 'collectif')),
  chauffage_repartition text,
  eau_chaude_mode text check (eau_chaude_mode in ('individuelle', 'collective')),
  cuisine text,
  sanitaires text,
  equipements_numeriques text,

  notes text,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now(),

  unique (id, proprietaire_id),
  unique (proprietaire_id, numero),
  foreign key (entite_id, proprietaire_id) references public.entites (id, proprietaire_id)
);

-- Locaux accessoires privatifs (cave, parking, garage), rattachés à un logement.
-- Un garage loué au locataire du logement par le même bailleur fait partie
-- du bail d'habitation (loi du 6 juillet 1989, art. 2) : il est saisi ici,
-- pas comme un bien autonome.
create table public.locaux_accessoires (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bien_id uuid not null,
  type text not null check (type in ('cave', 'parking', 'garage', 'autre')),
  numero_lot text,
  description text,
  foreign key (bien_id, proprietaire_id) references public.biens (id, proprietaire_id) on delete cascade
);

-- V2 (spec § 2) : démembrement et détention partagée. Modèle seulement, sans écran.
create table public.detentions_bien (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bien_id uuid not null,
  entite_id uuid not null,
  droit text not null check (droit in ('pleine_propriete', 'usufruit', 'nue_propriete')),
  quote_part numeric(5, 4) check (quote_part is null or (quote_part > 0 and quote_part <= 1)),
  foreign key (bien_id, proprietaire_id) references public.biens (id, proprietaire_id) on delete cascade,
  foreign key (entite_id, proprietaire_id) references public.entites (id, proprietaire_id) on delete cascade
);

-- ---------------------------------------------------------------------
-- Personnes (locataires, garants…) : simple socle pour classer le coffre.
-- Les fiches complètes arrivent à l'étape 3.
-- ---------------------------------------------------------------------
create table public.personnes (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role text not null check (role in ('locataire', 'colocataire', 'garant', 'candidat')),
  prenom text,
  nom text not null,
  cree_le timestamptz not null default now(),
  unique (id, proprietaire_id)
);

-- ---------------------------------------------------------------------
-- Coffre (spec § 5)
-- ---------------------------------------------------------------------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type_document text not null check (type_document in (
    'bail_annexes', 'diagnostic', 'assurance', 'etat_des_lieux', 'quittance', 'recu',
    'avis', 'decompte', 'facture_devis', 'extrait_compte', 'fiscal', 'divers')),
  titre text not null,
  bien_id uuid,
  personne_id uuid,
  entite_id uuid,
  date_document date,
  date_validite date, -- sert aux statuts « à renouveler » et « expiré »
  deductible boolean not null default false, -- factures
  statut_envoi text check (statut_envoi in ('envoye', 'ouvert', 'confirme')),
  fichier_chemin text, -- emplacement dans le stockage « coffre »
  fichier_type text,
  fichier_taille integer,
  cree_le timestamptz not null default now(),
  unique (id, proprietaire_id),
  foreign key (bien_id, proprietaire_id) references public.biens (id, proprietaire_id) on delete set null (bien_id),
  foreign key (personne_id, proprietaire_id) references public.personnes (id, proprietaire_id) on delete set null (personne_id),
  foreign key (entite_id, proprietaire_id) references public.entites (id, proprietaire_id) on delete set null (entite_id),
  -- Le fichier est toujours rangé dans le dossier du bailleur.
  check (fichier_chemin is null or split_part(fichier_chemin, '/', 1) = proprietaire_id::text)
);

-- Diagnostics (liste exacte selon R-04, fournie à l'étape 2 : type libre pour l'instant)
create table public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bien_id uuid not null,
  type text not null,
  date_realisation date,
  date_fin_validite date,
  document_id uuid,
  foreign key (bien_id, proprietaire_id) references public.biens (id, proprietaire_id) on delete cascade,
  foreign key (document_id, proprietaire_id) references public.documents (id, proprietaire_id) on delete set null (document_id)
);

-- Assurances
create table public.assurances (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bien_id uuid not null,
  nature text not null check (nature in ('proprietaire_non_occupant', 'attestation_locataire')),
  assureur text,
  numero_police text,
  date_echeance date, -- PNO
  annee smallint, -- attestation du locataire
  date_fin_validite date, -- attestation du locataire
  document_id uuid,
  foreign key (bien_id, proprietaire_id) references public.biens (id, proprietaire_id) on delete cascade,
  foreign key (document_id, proprietaire_id) references public.documents (id, proprietaire_id) on delete set null (document_id)
);

-- ---------------------------------------------------------------------
-- Inventaire du mobilier (meublé). La liste des éléments obligatoires
-- (décret n° 2015-981) est une donnée de référence : table vide tant que
-- le texte exact n'a pas été fourni (matrices).
-- ---------------------------------------------------------------------
create table public.elements_mobilier_obligatoires (
  code text primary key,
  libelle text not null, -- formulation du décret, mot pour mot
  ordre smallint not null,
  source text not null,
  date_entree_vigueur date not null
);

create table public.inventaire_mobilier (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bien_id uuid not null,
  element_code text references public.elements_mobilier_obligatoires (code), -- null = élément libre
  libelle text not null,
  quantite smallint not null default 1 check (quantite > 0),
  etat text,
  foreign key (bien_id, proprietaire_id) references public.biens (id, proprietaire_id) on delete cascade
);

-- ---------------------------------------------------------------------
-- Communes en zone tendue (règle R-09). Donnée datée : la liste vient
-- de l'annexe, 1°, du décret n° 2026-831 ; elle sera chargée à l'étape 2.
-- ---------------------------------------------------------------------
create table public.communes_zone_tendue (
  code_insee text not null check (code_insee ~ '^[0-9][0-9AB][0-9]{3}$'),
  commune text not null,
  source text not null,
  date_entree_vigueur date not null,
  date_fin date,
  primary key (code_insee, date_entree_vigueur)
);

-- =====================================================================
-- Automatismes
-- =====================================================================

-- À la création d'un compte : profil + entité « nom propre ».
create function public.creer_profil_bailleur() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profils (id) values (new.id);
  insert into public.entites (proprietaire_id, type, nom, qualite_bailleur)
    values (new.id, 'nom_propre', 'En nom propre', 'personne_physique');
  return new;
end;
$$;

create trigger a_la_creation_du_compte
  after insert on auth.users
  for each row execute function public.creer_profil_bailleur();

-- Avant l'ajout d'un bien : limite de la formule et numéro automatique.
create function public.avant_ajout_bien() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  limite integer;
  nombre integer;
begin
  -- Un seul ajout à la fois par bailleur, pour un comptage fiable.
  perform pg_advisory_xact_lock(hashtext(new.proprietaire_id::text));

  select f.max_biens into limite
    from public.profils p join public.formules f on f.code = p.formule
   where p.id = new.proprietaire_id;

  select count(*) into nombre from public.biens where proprietaire_id = new.proprietaire_id;

  if limite is not null and nombre >= limite then
    raise exception 'LIMITE_BIENS'
      using errcode = 'P0001',
            detail = format('Formule limitée à %s bien(s).', limite),
            hint = 'Proposer la formule supérieure.';
  end if;

  select coalesce(max(numero), 0) + 1 into new.numero
    from public.biens where proprietaire_id = new.proprietaire_id;

  return new;
end;
$$;

create trigger avant_ajout_bien
  before insert on public.biens
  for each row execute function public.avant_ajout_bien();

-- Date de dernière modification d'un bien.
create function public.maj_modifie_le() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.modifie_le := now();
  return new;
end;
$$;

create trigger maj_modifie_le
  before update on public.biens
  for each row execute function public.maj_modifie_le();

-- L'entité « nom propre » ne peut pas être supprimée ni changer de type.
create function public.proteger_nom_propre() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' and old.type = 'nom_propre' then
    -- Autorisé seulement quand tout le compte est supprimé (cascade).
    if exists (select 1 from auth.users where id = old.proprietaire_id) then
      raise exception 'NOM_PROPRE_PROTEGE' using errcode = 'P0001';
    end if;
  end if;
  if tg_op = 'UPDATE' and (old.type = 'nom_propre') <> (new.type = 'nom_propre') then
    raise exception 'NOM_PROPRE_PROTEGE' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger proteger_nom_propre
  before update or delete on public.entites
  for each row execute function public.proteger_nom_propre();

-- =====================================================================
-- Sécurité ligne par ligne
-- =====================================================================

alter table public.formules enable row level security;
alter table public.profils enable row level security;
alter table public.consentements enable row level security;
alter table public.entites enable row level security;
alter table public.associes_entite enable row level security;
alter table public.biens enable row level security;
alter table public.locaux_accessoires enable row level security;
alter table public.detentions_bien enable row level security;
alter table public.personnes enable row level security;
alter table public.documents enable row level security;
alter table public.diagnostics enable row level security;
alter table public.assurances enable row level security;
alter table public.elements_mobilier_obligatoires enable row level security;
alter table public.inventaire_mobilier enable row level security;
alter table public.communes_zone_tendue enable row level security;

-- Données de référence : lecture seule pour les utilisateurs connectés.
create policy lecture on public.formules for select to authenticated using (true);
create policy lecture on public.elements_mobilier_obligatoires for select to authenticated using (true);
create policy lecture on public.communes_zone_tendue for select to authenticated using (true);

-- Profil : lecture et modification de son seul profil.
-- La formule ne se change pas depuis l'application (paiement à l'étape 7).
create policy lecture on public.profils for select to authenticated using (id = (select auth.uid()));
create policy modification on public.profils for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profils from authenticated;
grant update (prenom, nom) on public.profils to authenticated;

-- Consentements : lecture et ajout uniquement (jamais modifiés).
create policy lecture on public.consentements for select to authenticated
  using (proprietaire_id = (select auth.uid()));
create policy ajout on public.consentements for insert to authenticated
  with check (proprietaire_id = (select auth.uid()));

-- Toutes les autres tables : le bailleur ne voit et ne modifie que ses lignes.
do $$
declare t text;
begin
  foreach t in array array[
    'entites', 'associes_entite', 'biens', 'locaux_accessoires', 'detentions_bien',
    'personnes', 'documents', 'diagnostics', 'assurances', 'inventaire_mobilier']
  loop
    execute format(
      'create policy proprietaire on public.%I for all to authenticated
         using (proprietaire_id = (select auth.uid()))
         with check (proprietaire_id = (select auth.uid()))', t);
  end loop;
end;
$$;

-- Le numéro d'un bien et son propriétaire ne se modifient pas.
revoke update on public.biens from authenticated;
grant update (
  entite_id, libelle, type_bien, situation_locative, type_location,
  adresse, batiment, etage, porte, code_postal, commune, code_insee, latitude, longitude,
  identifiant_fiscal, type_habitat, regime_juridique, periode_construction,
  surface_habitable, pieces_principales, hauteur_sous_plafond, autres_parties,
  dpe_classe, dpe_date, dpe_numero, dpe_depenses_min_euros, dpe_depenses_max_euros, dpe_annee_reference_prix,
  chauffage_mode, chauffage_repartition, eau_chaude_mode, cuisine, sanitaires, equipements_numeriques,
  notes
) on public.biens to authenticated;

-- Index utiles au coffre et aux listes.
create index on public.biens (proprietaire_id);
create index on public.documents (proprietaire_id, type_document);
create index on public.documents (bien_id);
create index on public.locaux_accessoires (bien_id);
