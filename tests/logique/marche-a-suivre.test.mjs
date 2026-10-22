// Chaque point à traiter doit proposer au moins un raccourci de mise à jour.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CRITERES_DECENCE } from '../../supabase/functions/_partage/questions.ts';
import { boutons } from '../../src/lib/marche-a-suivre.ts';
import { donneesRegles } from '../moteur/donnees.mjs';

test('chaque situation à traiter a au moins un raccourci', async () => {
  const { situations } = await donneesRegles();
  const sansRaccourci = situations
    .filter((s) => s.gravite !== 'ok')
    // La zone tendue se traitera avec le bail (étape 3).
    .filter((s) => !(s.regle_code === 'R-09'))
    .filter((s) => boutons('b1', s.regle_code, s.code, { critère: 'aération' }).length === 0)
    .map((s) => `${s.regle_code}/${s.code}`);
  assert.deepEqual(sansRaccourci, []);
});

test('chaque critère de décence non respecté renvoie vers sa question ou vers les équipements', () => {
  for (const c of CRITERES_DECENCE) {
    const critere = ['Chauffage', 'Cuisine', 'Sanitaires'].includes(c.critere) ? c.critere.toLowerCase() : c.critere.toLowerCase();
    const b = boutons('b1', 'R-12', 'critere', { critère: critere });
    assert.equal(b.length, 1, c.critere);
    const route = JSON.stringify(b[0].cible);
    assert.ok(c.question ? route.includes(`decence_${c.code}`) : route.includes('equipements'), c.critere);
  }
});

test('les liens externes sont les sites officiels cités dans les fiches', () => {
  const liens = [
    ...boutons('b1', 'R-04', 'erp_absent'),
    ...boutons('b1', 'R-01', 'attestation_electricite'),
  ].flatMap((b) => ('lien' in b.cible ? [b.cible.lien] : []));
  assert.deepEqual(liens, ['https://www.georisques.gouv.fr/', 'https://observatoire-dpe-audit.ademe.fr/']);
});
