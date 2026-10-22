-- Étape 3 · Retour de relecture du premier bail de test (docs/retour-bail-test-1.md)

-- C1. Eau chaude collective : modalités de répartition de la consommation du
-- locataire (contrat type, note 5) ; celles du chauffage existent déjà (note 4).
alter table public.biens add column eau_chaude_repartition text;

-- C2. Parties communes de l'immeuble (contrat type, II. D).
alter table public.biens add column parties_communes text;

-- C3. Équipements décrits par des réponses structurées, pour une phrase précise au bail.
alter table public.biens
  add column cuisine_equipements text[] not null default '{}',
  add column salle_eau_equipements text[] not null default '{}',
  add column wc text check (wc in ('separe', 'salle_eau'));

grant update (eau_chaude_repartition, parties_communes, cuisine_equipements, salle_eau_equipements, wc)
  on public.biens to authenticated;

-- B. Désignation des parties : compléments de pratique professionnelle (hors
-- contrat type), facultatifs à la saisie.
alter table public.profils
  add column date_naissance date,
  add column lieu_naissance text;
grant update (date_naissance, lieu_naissance) on public.profils to authenticated;

alter table public.personnes
  add column date_naissance date,
  add column lieu_naissance text;
grant update (date_naissance, lieu_naissance) on public.personnes to authenticated;

-- Bailleur personne morale : forme juridique et représentant légal (le numéro
-- d'immatriculation est le SIREN, déjà saisi).
alter table public.entites
  add column forme_juridique text,
  add column representant_legal text;
grant update (forme_juridique, representant_legal) on public.entites to authenticated;

-- C7. Lieu de signature déclaré par le bailleur (la date sera celle de la signature électronique).
alter table public.baux add column lieu_signature text;
grant update (lieu_signature) on public.baux to authenticated;
