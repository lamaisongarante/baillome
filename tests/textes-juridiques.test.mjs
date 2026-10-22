// Les textes juridiques affichés dans l'application doivent être
// strictement identiques aux fichiers fournis (mot pour mot).
// Lancer : npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const genere = readFileSync(new URL('../src/contenus/textes-juridiques.ts', import.meta.url), 'utf8');
const json = genere.slice(genere.indexOf('{', genere.indexOf('textesJuridiques =')), genere.lastIndexOf('} as const') + 1);
const textes = JSON.parse(json);

for (const [document, t] of Object.entries(textes)) {
  test(`${document} ${t.version} : texte identique au fichier ${t.fichier}`, () => {
    const source = readFileSync(new URL(`../contenus/juridique/${t.fichier}`, import.meta.url), 'utf8');
    assert.equal(t.texte, source);
  });

  test(`${document} ${t.version} : marqué « Projet, en cours de validation » tant qu'il est un projet`, () => {
    assert.equal(t.statut, t.texte.includes('**PROJET') ? 'Projet, en cours de validation' : null);
  });
}

test('les trois documents sont présents', () => {
  assert.deepEqual(Object.keys(textes).sort(), ['cgu', 'confidentialite', 'mentions-legales']);
});
