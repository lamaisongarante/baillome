// Génère la migration qui charge l'indice de référence des loyers (IRL,
// France métropolitaine, série Insee 001515333) à partir du fichier vérifié
// supabase/donnees/insee-irl-001515333-2026-10-22.tsv.
// Le fichier est la copie exacte du tableau publié par l'Insee ; son
// empreinte SHA-256 est contrôlée avant toute génération.
// Lancer : node scripts/generer-indices-irl.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

export const EMPREINTE_INSEE = '08cbe5aaa5a072aac681df8b57314a958ac3963a4e5b9fca46618994ea019253';
const SOURCE =
  'Insee, série 001515333 « Indice de référence des loyers (IRL) », base 100 au 4e trimestre 1998, relevée sur insee.fr le 22/10/2026 (paru le 15/10/2026)';

const fichier = new URL('../supabase/donnees/insee-irl-001515333-2026-10-22.tsv', import.meta.url);
const contenu = readFileSync(fichier);
const empreinte = createHash('sha256').update(contenu).digest('hex');
if (empreinte !== EMPREINTE_INSEE) {
  throw new Error(`Le fichier ne correspond plus au tableau de l'Insee (empreinte ${empreinte}).`);
}

const [, ...lignes] = contenu.toString('utf8').trim().split('\n').map((l) => l.split('\t'));
const date = (jjmmaaaa) => {
  if (!jjmmaaaa) return 'null::date';
  const [j, m, a] = jjmmaaaa.split('/');
  return `date '${a}-${m}-${j}'`;
};
const valeurs = lignes
  .map(([annee, trimestre, valeur, parution]) => {
    const t = trimestre.replace('T', '');
    return `  ('metropole', ${Number(annee)}, ${Number(t)}, ${valeur.replace(',', '.')}, ${date(parution)}, s.source)`;
  })
  .join(',\n');

const migration = `-- =====================================================================
-- Règles R-02 et R-09 · Indice de référence des loyers (IRL)
-- Fichier généré par scripts/generer-indices-irl.mjs : ne pas modifier.
-- ${lignes.length} trimestres, copie vérifiée du tableau publié par l'Insee
-- (empreinte SHA-256 ${EMPREINTE_INSEE}).
-- =====================================================================

create table public.indices_irl (
  zone text not null check (zone in ('metropole')),
  annee smallint not null,
  trimestre smallint not null check (trimestre between 1 and 4),
  valeur numeric(7, 2) not null,
  parution_jo date,
  source text not null,
  primary key (zone, annee, trimestre)
);

alter table public.indices_irl enable row level security;
create policy lecture on public.indices_irl for select to authenticated using (true);
revoke insert, update, delete on public.indices_irl from anon, authenticated;

with s as (select ${`'${SOURCE.replaceAll("'", "''")}'`}::text as source)
insert into public.indices_irl (zone, annee, trimestre, valeur, parution_jo, source)
select v.* from s, lateral (values
${valeurs}
) as v (zone, annee, trimestre, valeur, parution_jo, source);
`;

writeFileSync(new URL('../supabase/migrations/20261023140000_indices_irl.sql', import.meta.url), migration);
console.log(`${lignes.length} trimestres écrits.`);
