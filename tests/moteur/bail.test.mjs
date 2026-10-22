// Règles du bail (étape 3) : textes applicables, durées, dépôt, contrôles.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CONTRATS_TYPES,
  NOTICES,
  controlerBail,
  dureeProposee,
  plafondDepot,
  qualitePourDuree,
  versionApplicable,
} from '../../supabase/functions/_partage/bail.ts';
import { creerBase } from '../db/base-de-test.mjs';

// Paramètres R-03 réels, lus dans la base après migrations.
const db = await creerBase();
const { rows } = await db.query(`select parametres from regles_versions where regle_code = 'R-03'`);
const R03 = rows[0].parametres;

const bailType = (champs = {}) => ({
  type_bail: 'nu',
  date_effet: '2026-11-01',
  duree_mois: 36,
  motif_duree_reduite: null,
  loyer_hc: 700,
  mode_charges: 'provisions',
  periodicite: 'mensuelle',
  terme: 'a_echoir',
  depot_garantie: 700,
  ...champs,
});
const contexte = (bail, autres = {}) => ({
  bail: bailType(bail),
  bien: { surface_habitable: 48, identifiant_fiscal: '830620000123' },
  qualite: 'personne_physique',
  locataires: { nombre: 1, couple: false, tousEtudiants: false },
  parametresR03: R03,
  ...autres,
});
const codes = (c) => controlerBail(c).map((x) => x.code);

test('textes : contrat type et notice selon la date de signature', () => {
  assert.equal(versionApplicable(CONTRATS_TYPES.nu, '2026-11-01').fichier, 'contrat-type-nu-2026-10-01.md');
  assert.equal(versionApplicable(CONTRATS_TYPES.meuble, '2026-10-01').version, '2026-10-01');
  // Avant le 1er octobre 2026 : ancien contrat type, non stocké.
  assert.equal(versionApplicable(CONTRATS_TYPES.nu, '2026-09-30'), null);
  // Notice : nouvelle version à partir du 18 octobre 2026.
  assert.equal(versionApplicable(NOTICES, '2026-10-18').version, '2026-10-18');
  assert.equal(versionApplicable(NOTICES, '2026-10-17'), null);
});

test('durée : 3 ans pour un particulier, une indivision ou une SCI familiale ; 6 ans pour une SCI non familiale', () => {
  assert.equal(qualitePourDuree({ type: 'nom_propre', sci_familiale: false }), 'personne_physique');
  assert.equal(qualitePourDuree({ type: 'indivision', sci_familiale: false }), 'personne_physique');
  assert.equal(qualitePourDuree({ type: 'sci', sci_familiale: true }), 'personne_physique');
  assert.equal(qualitePourDuree({ type: 'sci', sci_familiale: false }), 'personne_morale');
  assert.equal(dureeProposee('nu', 'personne_physique', false), 36);
  assert.equal(dureeProposee('nu', 'personne_morale', false), 72);
  assert.equal(dureeProposee('meuble', 'personne_physique', false), 12);
  assert.equal(dureeProposee('meuble', 'personne_physique', true), 9);
  assert.equal(dureeProposee('garage', 'personne_physique', false), null);
});

test('R-03 : plafond du dépôt, 1 mois en nu, 2 mois en meublé, aucun pour un garage', () => {
  assert.equal(plafondDepot('nu', 700, R03), 700);
  assert.equal(plafondDepot('meuble', 540, R03), 1080);
  assert.equal(plafondDepot('garage', 95, R03), null);
});

test('R-03 : dépôt de 2 mois en location vide → bloquant, avec le message validé', () => {
  const c = controlerBail(contexte({ depot_garantie: 1400 }));
  const depot = c.find((x) => x.code === 'depot_depasse');
  assert.equal(depot.niveau, 'bloquant');
  assert.equal(depot.aValider, false);
  assert.match(depot.message, /^Petit dépassement repéré/);
});

test('R-03 : dépôt de 2 mois en meublé → accepté ; au-delà → bloquant', () => {
  assert.ok(!codes(contexte({ type_bail: 'meuble', duree_mois: 12, loyer_hc: 540, depot_garantie: 1080 })).includes('depot_depasse'));
  assert.ok(codes(contexte({ type_bail: 'meuble', duree_mois: 12, loyer_hc: 540, depot_garantie: 1080.01 })).includes('depot_depasse'));
});

test('bail conforme : aucun contrôle', () => {
  assert.deepEqual(codes(contexte({})), []);
});

test('identifiant fiscal : 12 chiffres exigés, sauf pour un garage', () => {
  assert.ok(codes(contexte({}, { bien: { surface_habitable: 48, identifiant_fiscal: null } })).includes('identifiant_fiscal'));
  assert.ok(codes(contexte({}, { bien: { surface_habitable: 48, identifiant_fiscal: '12345' } })).includes('identifiant_fiscal'));
  assert.ok(!codes(contexte({ type_bail: 'garage', duree_mois: 12, depot_garantie: 190 }, { bien: { surface_habitable: null, identifiant_fiscal: null } })).length);
});

test('meublé de 9 mois : réservé aux étudiants (message validé du modèle M-02b)', () => {
  assert.ok(codes(contexte({ type_bail: 'meuble', duree_mois: 9, loyer_hc: 540, depot_garantie: 540 })).includes('meuble_neuf_mois'));
  assert.ok(
    !codes(
      contexte({ type_bail: 'meuble', duree_mois: 9, loyer_hc: 540, depot_garantie: 540 }, {
        locataires: { nombre: 1, couple: false, tousEtudiants: true },
      }),
    ).length,
  );
});

test('location vide : 3 ans minimum ; durée réduite possible seulement avec un motif, pour un particulier, et d’au moins un an', () => {
  assert.ok(codes(contexte({ duree_mois: 24 })).includes('duree_minimale'));
  assert.ok(!codes(contexte({ duree_mois: 24, motif_duree_reduite: 'Mutation professionnelle prévue en 2028' })).includes('duree_minimale'));
  assert.ok(codes(contexte({ duree_mois: 6, motif_duree_reduite: 'Motif' })).includes('duree_minimale'));
  // SCI non familiale : 6 ans, sans durée réduite.
  assert.ok(codes(contexte({ duree_mois: 36 }, { qualite: 'personne_morale' })).includes('duree_minimale'));
  assert.ok(codes(contexte({ duree_mois: 24, motif_duree_reduite: 'Motif' }, { qualite: 'personne_morale' })).includes('duree_minimale'));
});

test('forfait de charges : interdit en location vide hors colocation, possible en colocation et en meublé', () => {
  assert.ok(codes(contexte({ mode_charges: 'forfait' })).includes('forfait_nu'));
  assert.ok(!codes(contexte({ mode_charges: 'forfait' }, { locataires: { nombre: 2, couple: false, tousEtudiants: false } })).includes('forfait_nu'));
  // Un couple marié ou pacsé n'est pas une colocation.
  assert.ok(codes(contexte({ mode_charges: 'forfait' }, { locataires: { nombre: 2, couple: true, tousEtudiants: false } })).includes('forfait_nu'));
  const meuble = controlerBail(contexte({ type_bail: 'meuble', duree_mois: 12, mode_charges: 'forfait', loyer_hc: 540, depot_garantie: 540 }));
  assert.deepEqual(meuble.map((x) => [x.code, x.niveau]), [['forfait_meuble', 'information']]);
});

test('loi, art. 22 : pas de dépôt si le loyer est payé d’avance par trimestre', () => {
  assert.ok(codes(contexte({ periodicite: 'trimestrielle', terme: 'a_echoir' })).includes('depot_paiement_trimestriel'));
  assert.ok(!codes(contexte({ periodicite: 'trimestrielle', terme: 'echu' })).includes('depot_paiement_trimestriel'));
  assert.ok(!codes(contexte({ periodicite: 'trimestrielle', terme: 'a_echoir', depot_garantie: null })).includes('depot_paiement_trimestriel'));
});

test('R-02 : révision avec l’IRL réel publié par l’Insee', async () => {
  const { indicesPourRevision, loyerRevise } = await import('../../supabase/functions/_partage/bail.ts');
  const { rows } = await db.query(`select annee, trimestre, valeur::float as valeur, parution_jo::text from indices_irl where zone = 'metropole'`);
  // Révision au 1er novembre 2026, trimestre de référence T3 : T3 2026 (148,06, paru le 16/10/2026) ÷ T3 2025 (145,77).
  const i = indicesPourRevision(rows, 3, '2026-11-01');
  assert.deepEqual([i.nouveau.annee, i.nouveau.valeur, i.ancien.annee, i.ancien.valeur], [2026, 148.06, 2025, 145.77]);
  assert.equal(loyerRevise(700, i.nouveau.valeur, i.ancien.valeur), 711);
  // Avant la parution du T3 2026, c'est le T3 2025 qui sert.
  const avant = indicesPourRevision(rows, 3, '2026-10-15');
  assert.deepEqual([avant.nouveau.annee, avant.ancien.annee], [2025, 2024]);
  // Trimestre jamais publié à cette date : pas de calcul.
  assert.equal(indicesPourRevision(rows, 4, '2002-12-31'), null);
});

test('R-02 : trimestre proposé par défaut = dernier IRL publié à la signature', async () => {
  const { dernierIrlPublie } = await import('../../supabase/functions/_partage/bail.ts');
  const { rows } = await db.query(`select annee, trimestre, valeur::float as valeur, parution_jo::text from indices_irl`);
  // Signature le 22/10/2026 : le T3 2026 est paru le 16/10/2026.
  assert.deepEqual([dernierIrlPublie(rows, '2026-10-22').annee, dernierIrlPublie(rows, '2026-10-22').trimestre], [2026, 3]);
  // Signature le 15/10/2026 : le T3 n'est pas encore paru, c'est le T2 2026.
  assert.deepEqual([dernierIrlPublie(rows, '2026-10-15').annee, dernierIrlPublie(rows, '2026-10-15').trimestre], [2026, 2]);
});

test('R-09 : réponse « zone tendue » comparée à la liste officielle applicable à la date du bail', () => {
  const ecart = (reponse, officielle) =>
    codes(contexte({ soumis_evolution_relocation: reponse }, { zoneTendueOfficielle: officielle })).includes('zone_tendue_ecart');
  assert.equal(ecart(true, true), false);
  assert.equal(ecart(false, true), true);
  assert.equal(ecart(true, false), true);
  // Aucune liste stockée pour la date : pas d'avertissement (on ne devine pas).
  assert.equal(ecart(true, null), false);
});

test('avant signature : état des risques absent à La Valette-du-Var → envoi bloqué (R-04)', async () => {
  const { blocagesAvantSignature } = await import('../../supabase/functions/_partage/bail.ts');
  const v = (await db.query(`select version, date_effet::text, valable_jusqu_au::text, parametres, source from regles_versions where regle_code = 'R-04'`)).rows[0];
  const titres = Object.fromEntries((await db.query(`select code, titre from regles_situations where regle_code = 'R-04'`)).rows.map((r) => [r.code, r.titre]));
  const regleR04 = { code: 'R-04', titre: 'Diagnostics', validee: true, version: v };
  const bien = {
    id: 'b', type_bien: 'appartement', situation_locative: 'loue_vide', type_location: 'nue', code_insee: '83144', identifiant_fiscal: '831440000749',
    type_habitat: 'collectif', regime_juridique: 'copropriete', periode_construction: '1975_1989', hauteur_sous_plafond: null, surface_piece_principale: null,
    decence_chauffage: null, decence_cuisine: null, decence_wc: null, decence_salle_eau: null, dpe_classe: 'D', dpe_date: '2022-03-12', chauffage_energie: null,
  };
  const reponses = { electricite_plus_15_ans: 'non', gaz: 'aucun', permis_avant_1997: 'non', zone_bruit: 'non', commune_risques: 'oui' };
  const args = (diagnostics, autres = {}) => ({
    aujourdhui: '2026-10-22', bien, reponses, diagnostics, regleR04, titresR04: titres, libelleQuestion: (q) => q, mentionsACompleter: [], ...autres,
  });
  // Sans état des risques : bloqué, avec le titre validé.
  assert.deepEqual(blocagesAvantSignature(args([])).map((b) => [b.code, b.libelle]), [['erp_absent', 'État des risques manquant']]);
  // État des risques de plus de 6 mois pour un nouveau bail : bloqué.
  assert.deepEqual(blocagesAvantSignature(args([{ type: 'erp', date_realisation: '2026-01-15', resultat: null }])).map((b) => b.code), ['erp_plus_6_mois']);
  // État des risques récent : rien ne bloque.
  assert.deepEqual(blocagesAvantSignature(args([{ type: 'erp', date_realisation: '2026-09-01', resultat: null }])), []);
  // Mention du bail à compléter : bloquée aussi.
  assert.deepEqual(
    blocagesAvantSignature(args([{ type: 'erp', date_realisation: '2026-09-01', resultat: null }], { mentionsACompleter: ['Lieu de signature'] })).map((b) => b.libelle),
    ['À compléter : Lieu de signature'],
  );
});

test('annexes : diagnostics obligatoires selon R-04, et document manquant au coffre → envoi bloqué', async () => {
  const { diagnosticsRequis } = await import('../../supabase/functions/_partage/moteur.ts');
  const { blocagesAvantSignature } = await import('../../supabase/functions/_partage/bail.ts');
  const bien = { type_bien: 'appartement', periode_construction: '1975_1989', type_habitat: 'collectif', dpe_classe: 'D', situation_locative: 'loue_vide' };
  const reponses = { electricite_plus_15_ans: 'oui', gaz: 'aucun', permis_avant_1997: 'non', zone_bruit: 'non', commune_risques: 'oui' };
  assert.deepEqual(diagnosticsRequis({ bien, reponses }), { requis: ['dpe', 'electricite', 'erp'], aRepondre: [] });
  assert.deepEqual(diagnosticsRequis({ bien: { ...bien, periode_construction: 'avant_1949' }, reponses: {} }).aRepondre, [
    'electricite_plus_15_ans', 'gaz', 'zone_bruit', 'commune_risques',
  ]);
  const v = (await db.query(`select version, date_effet::text, valable_jusqu_au::text, parametres, source from regles_versions where regle_code = 'R-04'`)).rows[0];
  const blocages = blocagesAvantSignature({
    aujourdhui: '2026-10-22', bien, reponses,
    diagnostics: [{ type: 'electricite', date_realisation: '2024-05-14', resultat: null }, { type: 'erp', date_realisation: '2026-09-01', resultat: null }],
    regleR04: { code: 'R-04', titre: 'x', validee: true, version: v }, titresR04: {}, libelleQuestion: (q) => q, mentionsACompleter: [],
    naturesAuCoffre: ['dpe', 'electricite'],
  });
  assert.deepEqual(blocages.map((b) => b.libelle), ['État des risques et pollutions : document à ranger dans le coffre']);
});
