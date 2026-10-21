-- =====================================================================
-- Baillome · Étape 1 · Stockage des fichiers du coffre
-- Chaque bailleur range ses fichiers dans un dossier à son identifiant :
-- coffre/<identifiant du bailleur>/<fichier>. Personne d'autre n'y accède.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('coffre', 'coffre', false, 20971520) -- 20 Mo par fichier
on conflict (id) do nothing;

create policy "coffre : lecture de ses fichiers" on storage.objects
  for select to authenticated
  using (bucket_id = 'coffre' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "coffre : ajout dans son dossier" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'coffre' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "coffre : remplacement de ses fichiers" on storage.objects
  for update to authenticated
  using (bucket_id = 'coffre' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'coffre' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "coffre : suppression de ses fichiers" on storage.objects
  for delete to authenticated
  using (bucket_id = 'coffre' and (storage.foldername(name))[1] = (select auth.uid())::text);
