// Les listes officielles chargées dans la base doivent rester des copies
// exactes des textes publiés : toute modification du fichier est détectée.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('annexe, 1°, du décret n° 2026-831 : fichier identique au tableau de Légifrance', () => {
  const contenu = readFileSync(new URL('../supabase/donnees/decret-2026-831-annexe-1.tsv', import.meta.url));
  assert.equal(
    createHash('sha256').update(contenu).digest('hex'),
    '64bb59c1be77813c938ba9ac0ad2ffce0b976766c703df7159abf7a8754f04c3',
  );
});
