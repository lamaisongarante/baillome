import assert from 'node:assert/strict';
import { test } from 'node:test';

import { estMeuble, pourcentage, rubriques } from '../../src/lib/completude.ts';

const vide = {
  type_bien: 'appartement',
  type_location: null,
  situation_locative: 'loue_vide',
  adresse: null,
  code_insee: null,
  identifiant_fiscal: null,
  type_habitat: null,
  regime_juridique: null,
  periode_construction: null,
  surface_habitable: null,
  pieces_principales: null,
  hauteur_sous_plafond: null,
  autres_parties: [],
  dpe_classe: null,
  dpe_date: null,
  dpe_depenses_min_euros: null,
  dpe_depenses_max_euros: null,
  chauffage_mode: null,
  eau_chaude_mode: null,
  cuisine: null,
  sanitaires: null,
  equipements_numeriques: null,
};
const sansComplements = { mobilierCoche: 0, mobilierTotal: 11, assurancePno: false, attestationLocataire: false };

const complet = {
  ...vide,
  adresse: '12 Rue des Oliviers',
  code_insee: '83062',
  identifiant_fiscal: '830123456789',
  type_habitat: 'collectif',
  regime_juridique: 'copropriete',
  periode_construction: '1975_1989',
  surface_habitable: 48,
  pieces_principales: 2,
  hauteur_sous_plafond: 2.5,
  autres_parties: ['balcon'],
  dpe_classe: 'F',
  dpe_date: '2022-03-14',
  dpe_depenses_min_euros: 1200,
  dpe_depenses_max_euros: 1700,
  chauffage_mode: 'individuel',
  eau_chaude_mode: 'individuelle',
  cuisine: 'Équipée',
  sanitaires: 'Salle d’eau, WC séparé',
  equipements_numeriques: 'Fibre',
};

test('fiche vide : 0 %', () => {
  assert.equal(pourcentage(rubriques(vide, sansComplements)), 0);
});

test('appartement loué vide : 5 rubriques, 19 points', () => {
  const r = rubriques(vide, sansComplements);
  assert.deepEqual(
    r.map((e) => [e.code, e.total]),
    [
      ['identite', 5],
      ['surfaces', 4],
      ['energie', 3],
      ['equipements', 5],
      ['assurances', 2],
    ],
  );
});

test('fiche complète avec assurances : 100 %', () => {
  const c = { ...sansComplements, assurancePno: true, attestationLocataire: true };
  assert.equal(pourcentage(rubriques(complet, c)), 100);
});

test('« aucune autre partie » compte comme une réponse', () => {
  const avec = rubriques({ ...vide, autres_parties: ['aucune'] }, sansComplements);
  assert.equal(avec.find((e) => e.code === 'surfaces').remplis, 1);
});

test('meublé : le mobilier obligatoire s’ajoute aux équipements, complet seulement si les 11 sont cochés', () => {
  const meuble = { ...complet, situation_locative: 'loue_meuble' };
  const partiel = rubriques(meuble, { ...sansComplements, mobilierCoche: 10 });
  const eq = partiel.find((e) => e.code === 'equipements');
  assert.deepEqual([eq.remplis, eq.total], [5, 6]);
  const tout = rubriques(meuble, { ...sansComplements, mobilierCoche: 11 });
  assert.equal(tout.find((e) => e.code === 'equipements').remplis, 6);
});

test('garage : pas de surfaces, d’énergie ni d’équipements', () => {
  const r = rubriques({ ...vide, type_bien: 'garage' }, sansComplements);
  assert.deepEqual(r.map((e) => e.code), ['identite', 'assurances']);
  assert.equal(r[0].total, 3);
});

test('bien pas encore loué : seule l’assurance du propriétaire est attendue', () => {
  const r = rubriques({ ...vide, situation_locative: 'pas_encore_loue' }, sansComplements);
  assert.equal(r.find((e) => e.code === 'assurances').total, 1);
});

test('estMeuble', () => {
  assert.equal(estMeuble({ situation_locative: 'loue_meuble', type_location: null }), true);
  assert.equal(estMeuble({ situation_locative: 'loue_vide', type_location: 'meublee' }), true);
  assert.equal(estMeuble({ situation_locative: 'loue_vide', type_location: 'nue' }), false);
});

test('arrondi du pourcentage', () => {
  assert.equal(pourcentage([{ code: 'identite', remplis: 1, total: 3 }]), 33);
  assert.equal(pourcentage([{ code: 'identite', remplis: 2, total: 3 }]), 67);
});
