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

test('notice d’information en vigueur au 18 octobre 2026 : fichier identique au texte de Légifrance', () => {
  const contenu = readFileSync(new URL('../contenus/officiels/notice-information-2026-10-18.md', import.meta.url));
  assert.equal(
    createHash('sha256').update(contenu).digest('hex'),
    '9aea3396c8a9243be5b0da8736b84f507368a8fecb005e52dd1832d48e9996f5',
  );
});

for (const [fichier, empreinte] of [
  ['contrat-type-nu-2026-10-01.md', 'be66dcfd845bf92d8947b0912fd51a7753787181545c93741fadb9910cce3891'],
  ['contrat-type-meuble-2026-10-01.md', '492f86be8081a192c2219c5047177de17774940071f7416c4826575123a17a67'],
]) {
  test(`contrat type en vigueur au 1er octobre 2026 (${fichier}) : fichier identique au texte de Légifrance`, () => {
    const contenu = readFileSync(new URL(`../contenus/officiels/${fichier}`, import.meta.url));
    assert.equal(createHash('sha256').update(contenu).digest('hex'), empreinte);
  });
}

test('contrats types : les cinq modifications du décret n° 2026-596 sont présentes', () => {
  for (const fichier of ['contrat-type-nu-2026-10-01.md', 'contrat-type-meuble-2026-10-01.md']) {
    const texte = readFileSync(new URL(`../contenus/officiels/${fichier}`, import.meta.url), 'utf8');
    assert.ok(!texte.includes('L. 351-2'), `${fichier} : ancienne référence L. 351-2`);
    assert.ok(texte.includes('L. 831-1'));
    assert.equal(texte.match(/numéro de téléphone portable \(facultatif\)/g)?.length, 2);
    assert.ok(texte.includes('Le cas échéant, Servitude de résidence principale : le logement objet du présent contrat est soumis à l\'obligation prévue à l\'article L. 151-14-1 du code de l\'urbanisme'));
    assert.ok(texte.includes('La clause de résiliation de plein droit ne produit effet que six semaines après la date d\'un commandement de payer demeuré infructueux.'));
  }
});

test('IRL (Insee, série 001515333) : fichier identique au tableau publié', () => {
  const contenu = readFileSync(new URL('../supabase/donnees/insee-irl-001515333-2026-10-22.tsv', import.meta.url));
  assert.equal(
    createHash('sha256').update(contenu).digest('hex'),
    '08cbe5aaa5a072aac681df8b57314a958ac3963a4e5b9fca46618994ea019253',
  );
});

test('annexe, 1°, du décret n° 2013-392 (version 2025-1267) : fichier identique au tableau de Légifrance', () => {
  const contenu = readFileSync(new URL('../supabase/donnees/decret-2013-392-annexe-1-version-2025-1267.tsv', import.meta.url));
  assert.equal(
    createHash('sha256').update(contenu).digest('hex'),
    'f8c8b0ce1ba8f19344057b13232f162251fbe586b39853101d7aa1240f8ed057',
  );
});
