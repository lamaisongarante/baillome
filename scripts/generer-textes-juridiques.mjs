// Recopie les textes juridiques (contenus/juridique/<document>-<version>.md)
// dans un module TypeScript que l'application peut afficher.
// Les textes sont repris tels quels, sans aucune modification.
// Lancer : npm run textes
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const DOSSIER = new URL('../contenus/juridique/', import.meta.url);
const SORTIE = new URL('../src/contenus/textes-juridiques.ts', import.meta.url);

/** Statut affiché sur chaque page tant que le texte n'est pas validé. */
const STATUT_PROJET = 'Projet, en cours de validation';

const textes = {};
for (const fichier of readdirSync(DOSSIER).sort()) {
  const m = fichier.match(/^(.+)-(\d+(?:\.\d+)*)\.md$/);
  if (!m) continue;
  const [, document, version] = m;
  const texte = readFileSync(new URL(fichier, DOSSIER), 'utf8');
  const projet = /^\*\*PROJET\b/m.test(texte);
  // On garde la version la plus récente de chaque document.
  if (!textes[document] || comparer(version, textes[document].version) > 0) {
    textes[document] = { version, statut: projet ? STATUT_PROJET : null, fichier, texte };
  }
}

function comparer(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

const contenu = `// Fichier généré par scripts/generer-textes-juridiques.mjs : ne pas modifier à la main.
// Source : contenus/juridique/*.md

export type TexteJuridique = {
  version: string;
  /** « Projet, en cours de validation » tant que le texte n'est pas validé. */
  statut: string | null;
  fichier: string;
  texte: string;
};

export const textesJuridiques = ${JSON.stringify(textes, null, 2)} as const satisfies Record<string, TexteJuridique>;

export type DocumentJuridique = keyof typeof textesJuridiques;
`;

writeFileSync(SORTIE, contenu);
console.log(`Textes juridiques : ${Object.entries(textes).map(([d, t]) => `${d} ${t.version}`).join(', ')}`);
