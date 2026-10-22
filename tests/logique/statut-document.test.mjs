import assert from 'node:assert/strict';
import { test } from 'node:test';

import { alertes, correspond, regrouper, statutDocument } from '../../src/lib/statut-document.ts';

const AUJ = '2026-10-22';
const doc = (champs) => ({
  id: crypto.randomUUID(),
  type_document: 'divers',
  titre: 'Document',
  bien_id: null,
  personne_id: null,
  entite_id: null,
  date_document: null,
  date_validite: null,
  deductible: false,
  fichier_chemin: null,
  fichier_type: null,
  cree_le: '2026-10-01T10:00:00Z',
  ...champs,
});

test('sans date de validité : OK', () => {
  assert.equal(statutDocument(doc({}), AUJ), 'ok');
});

test('validité dépassée : expiré', () => {
  assert.equal(statutDocument(doc({ date_validite: '2026-10-21' }), AUJ), 'expire');
});

test('validité dans moins de 30 jours : à renouveler', () => {
  assert.equal(statutDocument(doc({ date_validite: '2026-10-22' }), AUJ), 'a_renouveler'); // dernier jour
  assert.equal(statutDocument(doc({ date_validite: '2026-11-21' }), AUJ), 'a_renouveler'); // J+30
  assert.equal(statutDocument(doc({ date_validite: '2026-11-22' }), AUJ), 'ok'); // J+31
});

test('facture déductible : marquée déductible, sauf si expirée', () => {
  assert.equal(statutDocument(doc({ deductible: true }), AUJ), 'deductible');
  assert.equal(statutDocument(doc({ deductible: true, date_validite: '2025-01-01' }), AUJ), 'expire');
});

test('alertes : expirés d’abord, puis à renouveler par échéance', () => {
  const a = doc({ titre: 'A', date_validite: '2026-11-10' });
  const b = doc({ titre: 'B', date_validite: '2026-01-01' });
  const c = doc({ titre: 'C', date_validite: '2026-10-30' });
  const d = doc({ titre: 'D' });
  assert.deepEqual(alertes([a, b, c, d], AUJ).map((x) => x.titre), ['B', 'C', 'A']);
});

test('regrouper par bien : documents sans bien à la fin, plus récents d’abord', () => {
  const docs = [
    doc({ titre: 'sans', bien_id: null }),
    doc({ titre: 'ancien', bien_id: 'b1', date_document: '2023-11-01' }),
    doc({ titre: 'récent', bien_id: 'b1', date_document: '2026-10-02' }),
    doc({ titre: 'autre', bien_id: 'b2' }),
  ];
  const g = regrouper(docs, 'bien');
  assert.deepEqual(g.map((x) => x.cle), ['b1', 'b2', 'sans-bien']);
  assert.deepEqual(g[0].documents.map((x) => x.titre), ['récent', 'ancien']);
});

test('regrouper par type', () => {
  const g = regrouper([doc({ type_document: 'quittance' }), doc({ type_document: 'diagnostic' }), doc({ type_document: 'quittance' })], 'type');
  assert.equal(g.find((x) => x.cle === 'quittance').documents.length, 2);
});

test('recherche sans accents ni majuscules', () => {
  assert.equal(correspond('État des risques', 'etat'), true);
  assert.equal(correspond('Facture plombier', 'PLOMB'), true);
  assert.equal(correspond('Bail signé', 'quittance'), false);
});
