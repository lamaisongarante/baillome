// Garde-fou : un <Link asChild> transmet son style à l'élément enfant, qui doit
// recevoir un style unique (pas une liste), sinon l'application s'arrête
// avec « You are passing an array of styles to a child of <Slot> ».
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

function fichiers(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(chemin).isDirectory() ? fichiers(chemin) : chemin.endsWith('.tsx') ? [chemin] : [];
  });
}

test('aucun enfant de <Link asChild> ne reçoit une liste de styles', () => {
  const fautifs = [];
  for (const f of fichiers(new URL('../src', import.meta.url).pathname)) {
    const lignes = readFileSync(f, 'utf8').split('\n');
    lignes.forEach((ligne, i) => {
      if (!ligne.includes('asChild')) return;
      // On regarde la balise enfant qui suit (jusqu'à sa fermeture « > »).
      const suite = lignes.slice(i + 1, i + 8).join('\n');
      const balise = suite.slice(0, suite.indexOf('>') + 1);
      if (/style=\{\[/.test(balise) || /style=\{\(\{/.test(balise)) fautifs.push(`${f}:${i + 2}`);
    });
  }
  assert.deepEqual(fautifs, []);
});
