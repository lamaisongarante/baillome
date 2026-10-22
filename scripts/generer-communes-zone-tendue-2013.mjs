// Génère la migration qui charge la liste des communes de l'annexe, 1°, du
// décret n° 2013-392 dans sa version issue du décret n° 2025-1267 (en vigueur
// du 24 décembre 2025 au 31 décembre 2026, abrogée par le décret n° 2026-831),
// à partir du fichier vérifié supabase/donnees/decret-2013-392-annexe-1-version-2025-1267.tsv.
// Sert à la règle R-09 pour les baux qui prennent effet avant le 1er janvier 2027.
// Lancer : node scripts/generer-communes-zone-tendue-2013.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

export const EMPREINTE_LEGIFRANCE = 'f8c8b0ce1ba8f19344057b13232f162251fbe586b39853101d7aa1240f8ed057';
const SOURCE =
  'Décret n° 2013-392 du 10 mai 2013, annexe, 1°, version issue du décret n° 2025-1267 du 22 décembre 2025 (en vigueur depuis le 24 décembre 2025), relevé sur Légifrance le 22/10/2026';
const DEBUT = '2025-12-24';
const FIN = '2027-01-01'; // exclue : remplacée par le décret n° 2026-831

const fichier = new URL('../supabase/donnees/decret-2013-392-annexe-1-version-2025-1267.tsv', import.meta.url);
const contenu = readFileSync(fichier);
const empreinte = createHash('sha256').update(contenu).digest('hex');
if (empreinte !== EMPREINTE_LEGIFRANCE) {
  throw new Error(`Le fichier ne correspond plus au tableau de Légifrance (empreinte ${empreinte}).`);
}

// Le tableau publié contient une ligne vide : on l'ignore.
const lignes = contenu
  .toString('utf8')
  .split('\n')
  .map((l) => l.split('\t'))
  .filter((c) => c.some((x) => x.trim()));

const sql = (s) => `'${s.replaceAll("'", "''")}'`;
const valeurs = lignes
  .map(([agglo, dep, commune, code]) => `  (${sql(code)}, ${sql(commune)}, ${sql(dep)}, ${sql(agglo)})`)
  .join(',\n');

const migration = `-- =====================================================================
-- Règle R-09 · Communes de l'annexe, 1°, du décret n° 2013-392 (version issue
-- du décret n° 2025-1267), pour les baux prenant effet du ${DEBUT} au 31/12/2026.
-- Fichier généré par scripts/generer-communes-zone-tendue-2013.mjs : ne pas modifier.
-- ${lignes.length} communes, copie vérifiée du tableau publié sur Légifrance
-- (empreinte SHA-256 ${EMPREINTE_LEGIFRANCE}).
-- =====================================================================

insert into public.communes_zone_tendue (code_insee, commune, departement, agglomeration, source, date_entree_vigueur, date_fin)
select v.code_insee, v.commune, v.departement, v.agglomeration, ${sql(SOURCE)}, date '${DEBUT}', date '${FIN}'
from (values
${valeurs}
) as v (code_insee, commune, departement, agglomeration);
`;

writeFileSync(new URL('../supabase/migrations/20261023190000_communes_zone_tendue_2013_392.sql', import.meta.url), migration);
console.log(`${lignes.length} communes écrites dans la migration.`);
