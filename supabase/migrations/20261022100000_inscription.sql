-- =====================================================================
-- Baillome · Étape 1b · Inscription
-- À la création du compte, on enregistre en une seule fois le prénom et
-- les consentements transmis par l'écran d'inscription (document + version).
-- Si un consentement manque (ou si un texte change de version), l'application
-- le redemande avant d'ouvrir l'accueil.
-- =====================================================================

create or replace function public.creer_profil_bailleur() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  c jsonb;
begin
  insert into public.profils (id, prenom)
    values (new.id, nullif(trim(new.raw_user_meta_data ->> 'prenom'), ''));

  insert into public.entites (proprietaire_id, type, nom, qualite_bailleur)
    values (new.id, 'nom_propre', 'En nom propre', 'personne_physique');

  for c in select * from jsonb_array_elements(coalesce(new.raw_user_meta_data -> 'consentements', '[]'::jsonb))
  loop
    insert into public.consentements (proprietaire_id, document, version)
      values (new.id, c ->> 'document', c ->> 'version');
  end loop;

  return new;
end;
$$;
