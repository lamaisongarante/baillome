// Garde-fou : toutes les couleurs passent par src/theme/tokens.ts
// (préparation du mode sombre, décision du 22/10/2026).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

function fichiers(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(chemin).isDirectory() ? fichiers(chemin) : /\.(tsx?|mjs)$/.test(chemin) ? [chemin] : [];
  });
}

test('aucune couleur écrite en dehors de la palette', () => {
  const fautifs = [];
  for (const f of fichiers(new URL('../src', import.meta.url).pathname)) {
    if (f.endsWith('theme/tokens.ts')) continue;
    readFileSync(f, 'utf8')
      .split('\n')
      .forEach((ligne, i) => {
        if (/['"`]#[0-9a-f]{3,8}['"`]|rgba?\(|['"]transparent['"]/i.test(ligne)) fautifs.push(`${f}:${i + 1}`);
      });
  }
  assert.deepEqual(fautifs, []);
});
