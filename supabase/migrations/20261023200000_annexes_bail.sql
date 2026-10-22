-- Étape 3 · Annexes du bail (relecture du 22/10/2026) : savoir quel document
-- du coffre est quel diagnostic, et ranger le règlement de copropriété (annexe A).

alter table public.documents drop constraint documents_type_document_check;
alter table public.documents add constraint documents_type_document_check check (type_document in (
  'bail_annexes', 'diagnostic', 'assurance', 'etat_des_lieux', 'quittance', 'recu',
  'avis', 'decompte', 'facture_devis', 'extrait_compte', 'fiscal', 'divers', 'reglement_copropriete'));

-- Nature d'un diagnostic rangé au coffre (dossier de diagnostic technique, XI. B).
alter table public.documents
  add column nature_diagnostic text check (nature_diagnostic in ('dpe', 'crep', 'electricite', 'gaz', 'erp', 'bruit', 'amiante')),
  add constraint nature_si_diagnostic check (nature_diagnostic is null or type_document = 'diagnostic');
