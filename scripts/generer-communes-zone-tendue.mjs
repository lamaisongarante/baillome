// Génère la migration qui charge la liste des communes de l'annexe, 1°,
// du décret n° 2026-831 (règle R-09), à partir du fichier vérifié
// supabase/donnees/decret-2026-831-annexe-1.tsv.
// Le fichier est la copie exacte du tableau publié sur Légifrance ; son
// empreinte SHA-256 est contrôlée avant toute génération.
// Lancer : node scripts/generer-communes-zone-tendue.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

export const EMPREINTE_LEGIFRANCE = '64bb59c1be77813c938ba9ac0ad2ffce0b976766c703df7159abf7a8754f04c3';
const SOURCE =
  'Décret n° 2026-831 du 25 août 2026, annexe, 1° (JORF n° 0201 du 29 août 2026, NOR VLOL2616753D), relevé sur Légifrance le 22/10/2026';
const DATE_EFFET = '2027-01-01';

const fichier = new URL('../supabase/donnees/decret-2026-831-annexe-1.tsv', import.meta.url);
const contenu = readFileSync(fichier);
const empreinte = createHash('sha256').update(contenu).digest('hex');
if (empreinte !== EMPREINTE_LEGIFRANCE) {
  throw new Error(`Le fichier ne correspond plus au tableau de Légifrance (empreinte ${empreinte}).`);
}

// Le tableau publié contient une ligne vide (après Reignier-Ésery) : on l'ignore.
const lignes = contenu
  .toString('utf8')
  .split('\n')
  .map((l) => l.split('\t'))
  .filter((c) => c.some((x) => x.trim()));

const sql = (s) => `'${s.replaceAll("'", "''")}'`;
const valeurs = lignes
  .map(([agglo, dep, commune, code]) => `  (${sql(code)}, ${sql(commune)}, ${sql(dep)}, ${sql(agglo)}, s.source, s.effet)`)
  .join(',\n');

const migration = `-- =====================================================================
-- Règle R-09 · Communes de l'annexe, 1°, du décret n° 2026-831
-- Fichier généré par scripts/generer-communes-zone-tendue.mjs : ne pas modifier.
-- ${lignes.length} communes, copie vérifiée du tableau publié sur Légifrance
-- (empreinte SHA-256 ${EMPREINTE_LEGIFRANCE}).
-- Date d'effet retenue : ${DATE_EFFET} (spec étape 1 : « applicable au 1er janvier 2027 »).
-- =====================================================================

alter table public.communes_zone_tendue
  add column departement text,
  add column agglomeration text;

with s as (select ${sql(SOURCE)}::text as source, date '${DATE_EFFET}' as effet)
insert into public.communes_zone_tendue (code_insee, commune, departement, agglomeration, source, date_entree_vigueur)
select v.code_insee, v.commune, v.departement, v.agglomeration, v.source, v.effet
from s, lateral (values
${valeurs}
) as v (code_insee, commune, departement, agglomeration, source, effet);
`;

writeFileSync(new URL('../supabase/migrations/20261022160000_communes_zone_tendue_2026_831.sql', import.meta.url), migration);
console.log(`${lignes.length} communes écrites dans la migration.`);
