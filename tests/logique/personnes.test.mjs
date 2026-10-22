import assert from 'node:assert/strict';
import { test } from 'node:test';

import { afficherTelephone, estColocation, lireEmail, lireTelephone, typeBailPropose } from '../../src/lib/personnes.ts';

test('téléphone : formes acceptées et refusées', () => {
  assert.equal(lireTelephone('06 12 34 56 78'), '0612345678');
  assert.equal(lireTelephone('06.12.34.56.78'), '0612345678');
  // Numéro français au format international : ramené au format 06… (même format partout).
  assert.equal(lireTelephone('+33 6 12 34 56 78'), '0612345678');
  assert.equal(lireTelephone('0033 6 12 34 56 78'), '0612345678');
  assert.equal(lireTelephone('+44 7911 123456'), '+447911123456');
  assert.equal(lireTelephone(''), null);
  assert.equal(lireTelephone('06 12'), undefined);
  assert.equal(lireTelephone('abc'), undefined);
});

test('téléphone : affichage par paires', () => {
  assert.equal(afficherTelephone('0612345678'), '06 12 34 56 78');
  assert.equal(afficherTelephone('+33689649365'), '06 89 64 93 65');
  assert.equal(afficherTelephone('+447911123456'), '+447911123456');
  assert.equal(afficherTelephone(null), '');
});

test('email : contrôle de forme', () => {
  assert.equal(lireEmail(' lea@exemple.fr '), 'lea@exemple.fr');
  assert.equal(lireEmail(''), null);
  assert.equal(lireEmail('lea@exemple'), undefined);
});

test('type de bail proposé selon la fiche du bien', () => {
  assert.equal(typeBailPropose({ type_bien: 'garage', type_location: null, situation_locative: null }), 'garage');
  assert.equal(typeBailPropose({ type_bien: 'appartement', type_location: 'meublee', situation_locative: null }), 'meuble');
  assert.equal(typeBailPropose({ type_bien: 'appartement', type_location: 'nue', situation_locative: null }), 'nu');
  assert.equal(
    typeBailPropose({ type_bien: 'appartement', type_location: 'colocation_bail_unique', situation_locative: 'loue_meuble' }),
    'meuble',
  );
  assert.equal(typeBailPropose({ type_bien: 'maison', type_location: null, situation_locative: 'loue_vide' }), 'nu');
});

test('colocation : plusieurs locataires, sauf couple marié ou pacsé (article 8-1, I)', () => {
  assert.equal(estColocation(1, false), false);
  assert.equal(estColocation(2, false), true);
  assert.equal(estColocation(2, true), false);
});
