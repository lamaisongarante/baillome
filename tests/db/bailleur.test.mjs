// Coordonnées du bailleur pour ses baux.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { creerBase, creerCompte, enTantQue } from './base-de-test.mjs';

test('coordonnées du bailleur : domicile, portable, email dans les baux décoché par défaut', async () => {
  const db = await creerBase();
  const alice = await creerCompte(db, 'alice@exemple.test');
  const { rows } = await enTantQue(db, alice, 'select adresse, telephone, email_dans_baux from profils');
  assert.deepEqual(rows[0], { adresse: null, telephone: null, email_dans_baux: false });
  await enTantQue(db, alice, `update profils set adresse = '5 avenue des Pins, 83160 La Valette-du-Var', telephone = '0612345678', email_dans_baux = true`);
  await assert.rejects(enTantQue(db, alice, `update profils set telephone = '06 12'`));
  // Siège social d'une SCI.
  await enTantQue(db, alice, `insert into entites (type, nom, siege) values ('sci', 'SCI Les Pins', '1 place de la Mairie, 83000 Toulon')`);
  const sci = await enTantQue(db, alice, `select siege from entites where type = 'sci'`);
  assert.equal(sci.rows[0].siege, '1 place de la Mairie, 83000 Toulon');
});
