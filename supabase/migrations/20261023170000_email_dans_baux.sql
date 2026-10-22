-- Adresse électronique du bailleur dans ses baux : mention facultative du
-- contrat type (I. Désignation des parties) ; choix du bailleur, décoché par
-- défaut (décision de Sarah du 22/10/2026).
alter table public.profils add column email_dans_baux boolean not null default false;
grant update (email_dans_baux) on public.profils to authenticated;
