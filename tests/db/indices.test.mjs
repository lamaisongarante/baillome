// Indice de référence des loyers : chargé tel quel, lisible, jamais modifiable par un bailleur.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { creerBase, creerCompte, enTantQue } from './base-de-test.mjs';

test('IRL : 96 trimestres chargés, lisibles par un bailleur, non modifiables', async () => {
  const db = await creerBase();
  const alice = await creerCompte(db, 'alice@exemple.test');
  const { rows } = await enTantQue(db, alice, `select count(*)::int as n, max(annee) as derniere from indices_irl`);
  assert.deepEqual(rows[0], { n: 96, derniere: 2026 });
  const t3 = await enTantQue(db, alice, `select valeur::text, parution_jo::text from indices_irl where annee = 2026 and trimestre = 3`);
  assert.deepEqual(t3.rows[0], { valeur: '148.06', parution_jo: '2026-10-16' });
  await assert.rejects(enTantQue(db, alice, `update indices_irl set valeur = 1`));
  await assert.rejects(enTantQue(db, alice, `insert into indices_irl (zone, annee, trimestre, valeur, source) values ('metropole', 2030, 1, 1, 'x')`));
});
