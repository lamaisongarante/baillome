-- =====================================================================
-- Baillome · Étape 1f · Mon compte : suppression du compte
-- Le bailleur supprime lui-même son compte. L'application efface d'abord
-- ses fichiers du coffre, puis appelle cette fonction : la suppression du
-- compte efface en cascade toutes ses données (profil, entités, biens,
-- documents, consentements…), et seulement les siennes.
-- =====================================================================

create function public.supprimer_mon_compte() returns void
language plpgsql security definer set search_path = '' as $$
declare
  moi uuid := auth.uid();
begin
  if moi is null then
    raise exception 'NON_CONNECTE' using errcode = 'P0001';
  end if;
  delete from auth.users where id = moi;
end;
$$;

revoke execute on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;
