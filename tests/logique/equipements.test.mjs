import assert from 'node:assert/strict';
import { test } from 'node:test';

import { phraseEquipements } from '../../src/lib/equipements.ts';

const vide = { cuisine_equipements: [], salle_eau_equipements: [], wc: null, cuisine: null, sanitaires: null };

test('phrase des équipements construite à partir des réponses structurées, dans un ordre fixe', () => {
  assert.equal(
    phraseEquipements({ ...vide, cuisine_equipements: ['four', 'plaques', 'hotte', 'evier'], salle_eau_equipements: ['lavabo', 'douche'], wc: 'separe' }),
    'cuisine équipée : évier, plaques de cuisson, four et hotte ; salle d’eau avec douche et lavabo ; WC séparé',
  );
});

test('précisions libres ajoutées à la fin ; rien de renseigné → null', () => {
  assert.equal(phraseEquipements({ ...vide, wc: 'salle_eau', sanitaires: 'sèche-serviettes' }), 'WC dans la salle d’eau ; sèche-serviettes');
  assert.equal(phraseEquipements(vide), null);
});
