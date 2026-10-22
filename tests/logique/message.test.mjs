import assert from 'node:assert/strict';
import { test } from 'node:test';

import { messageAffiche } from '../../src/lib/message.ts';

test('valeurs insérées et typographie française', () => {
  assert.equal(
    messageAffiche('Il manque [élément] à votre inventaire.', { élément: 'luminaires' }),
    'Il manque luminaires à votre inventaire.',
  );
  assert.equal(messageAffiche('La bonne nouvelle ? Un DPE : vite !'), 'La bonne nouvelle ? Un DPE : vite !');
  assert.equal(messageAffiche('la loi le considère comme « non décent »'), 'la loi le considère comme « non décent »');
});

test('valeur absente : le repère reste visible', () => {
  assert.equal(messageAffiche('plafond de [montant] €'), 'plafond de [montant] €');
});
