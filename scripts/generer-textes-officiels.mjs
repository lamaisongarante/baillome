// Recopie les textes officiels (contenus/officiels/*.md : contrats types,
// notice d'information) dans un module TypeScript utilisable pour les PDF.
// Les textes sont repris tels quels ; un test vérifie que le module est
// identique aux fichiers, eux-mêmes contrôlés par leur empreinte.
// Lancer : npm run textes
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const DOSSIER = new URL('../contenus/officiels/', import.meta.url);
const SORTIE = new URL('../src/contenus/textes-officiels.ts', import.meta.url);

const textes = {};
for (const fichier of readdirSync(DOSSIER).sort()) {
  if (!fichier.endsWith('.md') || fichier === 'LISEZ-MOI.md') continue;
  const texte = readFileSync(new URL(fichier, DOSSIER), 'utf8');
  textes[fichier] = { empreinte: createHash('sha256').update(texte).digest('hex'), texte };
}

const contenu = `// Fichier généré par scripts/generer-textes-officiels.mjs : ne pas modifier à la main.
// Source : contenus/officiels/*.md (copies exactes de Légifrance, voir LISEZ-MOI.md).

export type TexteOfficiel = { empreinte: string; texte: string };

export const TEXTES_OFFICIELS: Record<string, TexteOfficiel> = ${JSON.stringify(textes, null, 2)};
`;
writeFileSync(SORTIE, contenu);
console.log(`${Object.keys(textes).length} textes officiels écrits.`);
