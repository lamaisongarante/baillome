-- Étape 3 · Fiches locataires et garants (cahier des charges, § fiches ;
-- maquette 06), et rattachement minimal au bail : bien, locataires, date
-- d'entrée et cautionnements. Les conditions financières du bail viendront
-- avec la structure complète des baux.

-- ---------------------------------------------------------------------
-- Personnes : coordonnées et situation utiles aux baux
-- ---------------------------------------------------------------------
alter table public.personnes
  add column email text check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- Numéro de téléphone portable (facultatif dans les contrats types, décret n° 2026-596).
  add column telephone text check (telephone is null or telephone ~ '^\+?[0-9]{9,15}$'),
  add column adresse text,
  -- Locataire : durée de 9 mois en meublé (étudiant), cautionnement malgré une
  -- assurance (étudiant ou apprenti), bailleur personne morale (étudiant non boursier).
  add column etudiant boolean not null default false,
  add column apprenti boolean not null default false,
  add column boursier boolean,
  -- Accord exprès du locataire pour recevoir ses documents par email (article 21).
  add column accord_email_le timestamptz,
  -- Renseignée à l'état des lieux de sortie (article 22).
  add column adresse_apres_depart text,
  -- Garant : personne physique, personne morale, ou garantie Visale.
  add column type_garant text check (type_garant in ('personne_physique', 'personne_morale', 'visale')),
  add column visale_reference text,
  add column notes text,
  add constraint garant_type check ((role = 'garant') = (type_garant is not null)),
  add constraint locataire_seulement check (
    role in ('locataire', 'colocataire', 'candidat')
    or (not etudiant and not apprenti and boursier is null and accord_email_le is null and adresse_apres_depart is null)),
  add constraint visale_seulement check (visale_reference is null or type_garant = 'visale'),
  add constraint boursier_si_etudiant check (boursier is null or etudiant);

-- Le rôle d'une personne et son propriétaire ne se modifient pas.
revoke update on public.personnes from authenticated;
grant update (
  prenom, nom, email, telephone, adresse, etudiant, apprenti, boursier,
  accord_email_le, adresse_apres_depart, type_garant, visale_reference, notes
) on public.personnes to authenticated;

-- ---------------------------------------------------------------------
-- Baux : rattachement d'un locataire à un bien
-- ---------------------------------------------------------------------
create table public.baux (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bien_id uuid not null,
  type_bail text not null check (type_bail in ('nu', 'meuble', 'garage')),
  -- « existant » : bail signé hors de Baillome et saisi par le bailleur ;
  -- « baillome » : bail généré par l'application.
  origine text not null default 'existant' check (origine in ('existant', 'baillome')),
  statut text not null default 'en_cours' check (statut in ('brouillon', 'en_cours', 'termine')),
  date_effet date,
  date_fin date,
  -- Plusieurs locataires mariés ou pacsés ensemble : pas une colocation (article 8-1, I).
  locataires_couple boolean not null default false,
  cree_le timestamptz not null default now(),
  unique (id, proprietaire_id),
  foreign key (bien_id, proprietaire_id) references public.biens (id, proprietaire_id) on delete cascade,
  check (statut = 'brouillon' or date_effet is not null),
  check (date_fin is null or date_effet is null or date_fin >= date_effet)
);

-- Un seul bail en cours par bien (la colocation se fait par bail unique en V1).
create unique index baux_un_seul_en_cours on public.baux (bien_id) where statut = 'en_cours';

create table public.baux_locataires (
  bail_id uuid not null,
  personne_id uuid not null,
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ordre smallint not null default 1,
  primary key (bail_id, personne_id),
  foreign key (bail_id, proprietaire_id) references public.baux (id, proprietaire_id) on delete cascade,
  foreign key (personne_id, proprietaire_id) references public.personnes (id, proprietaire_id) on delete cascade
);

-- Cautionnement : un garant, pour un locataire nommément désigné du bail
-- (article 8-1, VI : l'acte identifie le colocataire garanti).
create table public.cautionnements (
  id uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  bail_id uuid not null,
  garant_id uuid not null,
  locataire_id uuid not null,
  signe_le date,
  document_id uuid, -- acte de cautionnement ou certificat Visale, rangé dans le coffre
  cree_le timestamptz not null default now(),
  unique (bail_id, garant_id, locataire_id),
  foreign key (bail_id, proprietaire_id) references public.baux (id, proprietaire_id) on delete cascade,
  foreign key (garant_id, proprietaire_id) references public.personnes (id, proprietaire_id) on delete cascade,
  foreign key (bail_id, locataire_id) references public.baux_locataires (bail_id, personne_id) on delete cascade,
  foreign key (document_id, proprietaire_id) references public.documents (id, proprietaire_id) on delete set null (document_id)
);

-- Les rôles doivent correspondre : un locataire au bail, un garant au cautionnement.
create function public.verifier_role_personne() returns trigger
language plpgsql set search_path = '' as $$
declare
  attendu text := tg_argv[0];
  id_personne uuid := (to_jsonb(new) ->> tg_argv[1])::uuid;
begin
  if not exists (select 1 from public.personnes p where p.id = id_personne and p.role = attendu) then
    raise exception 'La personne % n''a pas le rôle %', id_personne, attendu using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger role_locataire before insert or update on public.baux_locataires
  for each row execute function public.verifier_role_personne('locataire', 'personne_id');
create trigger role_garant before insert or update on public.cautionnements
  for each row execute function public.verifier_role_personne('garant', 'garant_id');

-- Sécurité ligne par ligne : chaque bailleur ne voit que ses lignes.
alter table public.baux enable row level security;
alter table public.baux_locataires enable row level security;
alter table public.cautionnements enable row level security;
do $$
declare t text;
begin
  foreach t in array array['baux', 'baux_locataires', 'cautionnements'] loop
    execute format(
      'create policy proprietaire on public.%I for all to authenticated
         using (proprietaire_id = (select auth.uid()))
         with check (proprietaire_id = (select auth.uid()))', t);
  end loop;
end;
$$;

revoke update on public.baux from authenticated;
grant update (type_bail, statut, date_effet, date_fin, locataires_couple) on public.baux to authenticated;
revoke update on public.baux_locataires from authenticated;
grant update (ordre) on public.baux_locataires to authenticated;
revoke update on public.cautionnements from authenticated;
grant update (signe_le, document_id) on public.cautionnements to authenticated;

create index on public.baux (proprietaire_id);
create index on public.baux_locataires (personne_id);
create index on public.cautionnements (bail_id);
