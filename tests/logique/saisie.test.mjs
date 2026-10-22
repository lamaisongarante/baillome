import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  estDansLeFutur,
  formaterDateEnCours,
  lireDateFrancaise,
  lireEntier,
  lireNombre,
} from '../../src/lib/saisie.ts';

test('date française valide', () => {
  assert.equal(lireDateFrancaise('14/03/2022'), '2022-03-14');
  assert.equal(lireDateFrancaise('1/3/2022'), '2022-03-01');
  assert.equal(lireDateFrancaise('29/02/2024'), '2024-02-29'); // année bissextile
});

test('date française impossible ou mal écrite', () => {
  assert.equal(lireDateFrancaise('31/04/2022'), null); // pas de 31 avril
  assert.equal(lireDateFrancaise('29/02/2023'), null);
  assert.equal(lireDateFrancaise('03/2022'), null);
  assert.equal(lireDateFrancaise('2022-03-14'), null);
  assert.equal(lireDateFrancaise(''), null);
});

test('date dans le futur', () => {
  const ref = new Date('2026-10-22T10:00:00Z');
  assert.equal(estDansLeFutur('2026-10-23', ref), true);
  assert.equal(estDansLeFutur('2026-10-22', ref), false);
  assert.equal(estDansLeFutur('2022-03-14', ref), false);
});

test('les « / » s’ajoutent pendant la frappe', () => {
  assert.equal(formaterDateEnCours('14'), '14');
  assert.equal(formaterDateEnCours('1403'), '14/03');
  assert.equal(formaterDateEnCours('14032022'), '14/03/2022');
  assert.equal(formaterDateEnCours('14/03/2022999'), '14/03/2022');
});

test('nombres saisis à la française', () => {
  assert.equal(lireNombre('48'), 48);
  assert.equal(lireNombre('48,5'), 48.5);
  assert.equal(lireNombre(' 1 048,25 '), 1048.25);
  assert.equal(lireNombre('quarante'), null);
  assert.equal(lireNombre('-3'), null);
  assert.equal(lireNombre(''), null);
  assert.equal(lireEntier('2'), 2);
  assert.equal(lireEntier('2,5'), null);
});
