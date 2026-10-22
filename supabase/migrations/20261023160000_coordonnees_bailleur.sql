-- Étape 3 · Coordonnées du bailleur exigées par le contrat type (I. Désignation
-- des parties) : domicile ou siège social, numéro de téléphone portable
-- (facultatif, décret n° 2026-596) et adresse électronique (facultative,
-- celle du compte).

alter table public.profils
  add column adresse text,
  add column telephone text check (telephone is null or telephone ~ '^\+?[0-9]{9,15}$');
grant update (adresse, telephone) on public.profils to authenticated;

-- Siège social d'une SCI (le domicile du bailleur sert pour le nom propre et l'indivision).
alter table public.entites add column siege text;
grant update (siege) on public.entites to authenticated;
