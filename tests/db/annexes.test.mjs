// Documents du coffre : nature des diagnostics et règlement de copropriété.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { creerBase, creerCompte, enTantQue } from './base-de-test.mjs';

test('coffre : nature du diagnostic réservée aux diagnostics ; type « règlement de copropriété »', async () => {
  const db = await creerBase();
  const alice = await creerCompte(db, 'alice@exemple.test');
  await enTantQue(db, alice, `insert into documents (type_document, titre, nature_diagnostic) values ('diagnostic', 'État des risques', 'erp')`);
  await enTantQue(db, alice, `insert into documents (type_document, titre) values ('reglement_copropriete', 'Règlement de copropriété')`);
  await assert.rejects(enTantQue(db, alice, `insert into documents (type_document, titre, nature_diagnostic) values ('divers', 'x', 'erp')`));
  await assert.rejects(enTantQue(db, alice, `insert into documents (type_document, titre, nature_diagnostic) values ('diagnostic', 'x', 'termites')`));
  const { rows } = await enTantQue(db, alice, `select type_document, nature_diagnostic from documents order by type_document`);
  assert.deepEqual(rows, [
    { type_document: 'diagnostic', nature_diagnostic: 'erp' },
    { type_document: 'reglement_copropriete', nature_diagnostic: null },
  ]);
});
