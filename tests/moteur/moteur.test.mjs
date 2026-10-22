// Tests du moteur de conformité sur des cas réels (étape 2).
// Les règles, paramètres et gravités viennent des vraies migrations.
import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';

import { codeInseeCommune, evaluer, scoreMoyen } from '../../supabase/functions/_partage/moteur.ts';
import { CRITERES_DECENCE } from '../../supabase/functions/_partage/questions.ts';
import { donneesRegles } from './donnees.mjs';

let D;
before(async () => {
  D = await donneesRegles();
});

const AUJ = '2026-10-22';

/** Toutes les réponses « sans problème » : sert de base aux cas de test. */
const REPONSES_OK = {
  dpe_existe: 'oui',
  electricite_plus_15_ans: 'non',
  gaz: 'pas_de_gaz',
  permis_avant_1997: 'non',
  commune_risques: 'non',
  zone_bruit: 'non',
  piece_principale_surface: '12',
  arrete: 'non',
  contraintes_travaux: 'non',
  ...Object.fromEntries(CRITERES_DECENCE.map((c) => [`decence_${c.code}`, 'oui'])),
};

function contexte({ bien = {}, reponses = {}, apercu = false, aujourdhui = AUJ, ...reste } = {}) {
  return {
    aujourdhui,
    bien: {
      id: 'b1',
      type_bien: 'appartement',
      situation_locative: 'loue_vide',
      type_location: null,
      code_insee: '83062',
      identifiant_fiscal: '830123456789',
      type_habitat: 'collectif',
      regime_juridique: 'copropriete',
      periode_construction: '1975_1989',
      hauteur_sous_plafond: 2.5,
      dpe_classe: 'C',
      dpe_date: '2022-03-14',
      chauffage_energie: 'gaz',
      ...bien,
    },
    reponses: { ...REPONSES_OK, ...reponses },
    diagnostics: [],
    assurances: [
      { nature: 'proprietaire_non_occupant', assureur: 'Assureur', date_fin_validite: null },
      { nature: 'attestation_locataire', assureur: null, date_fin_validite: '2027-06-30' },
    ],
    inventaireCodes: [],
    elementsObligatoires: D.elements,
    zoneTendue: false,
    regles: D.regles,
    situations: D.situations,
    apercu,
    ...reste,
  };
}

const ev = (opts) => evaluer(contexte(opts), CRITERES_DECENCE);
const situations = (r, regle) => r.constats.filter((c) => !regle || c.regle === regle).map((c) => c.situation);

describe('R-01 · DPE (règle validée)', () => {
  test('classe G, logement loué : deux situations critiques', () => {
    const r = ev({ bien: { dpe_classe: 'G' } });
    assert.deepEqual(situations(r, 'R-01'), ['classe_g', 'classe_g_locataire']);
    assert.ok(r.constats.filter((c) => c.regle === 'R-01').every((c) => c.gravite === 'critique'));
  });

  test('classe G, pas encore loué : pas de message « locataire en place »', () => {
    const r = ev({ bien: { dpe_classe: 'G', situation_locative: 'pas_encore_loue' } });
    assert.deepEqual(situations(r, 'R-01'), ['classe_g']);
  });

  test('classe F : important (loyer gelé, échéance 2028)', () => {
    const r = ev({ bien: { dpe_classe: 'F' } });
    assert.deepEqual(r.constats.filter((c) => c.regle === 'R-01').map((c) => [c.situation, c.gravite]), [['classe_f', 'important']]);
  });

  test('classe E : conseil ; classe C : aucune situation', () => {
    assert.deepEqual(situations(ev({ bien: { dpe_classe: 'E' } }), 'R-01'), ['classe_e']);
    assert.deepEqual(situations(ev({}), 'R-01'), []);
  });

  test('pas de DPE : critique', () => {
    const r = ev({ bien: { dpe_date: null, dpe_classe: null }, reponses: { dpe_existe: 'non' } });
    assert.deepEqual(situations(r, 'R-01'), ['dpe_absent_ou_ancien']);
  });

  test('« Je ne sais pas » pour le DPE : traité comme absent', () => {
    const r = ev({ bien: { dpe_date: null, dpe_classe: null }, reponses: { dpe_existe: 'nsp' } });
    assert.deepEqual(situations(r, 'R-01'), ['dpe_absent_ou_ancien']);
  });

  test('DPE de 2019 classé G : DPE à refaire ET classe G (décision du 22/10/2026)', () => {
    const r = ev({ bien: { dpe_date: '2019-05-02', dpe_classe: 'G' } });
    assert.deepEqual(situations(r, 'R-01'), ['dpe_absent_ou_ancien', 'classe_g', 'classe_g_locataire']);
  });

  test('DPE du 1er juillet 2021 : encore valable en 2026, périmé le 1er juillet 2031', () => {
    assert.deepEqual(situations(ev({ bien: { dpe_date: '2021-07-01' } }), 'R-01'), []);
    // On isole la règle des 10 ans : la version actuelle de R-01 est datée jusqu'au 31/12/2027.
    const regles = D.regles.map((r) => (r.code === 'R-01' ? { ...r, version: { ...r.version, valable_jusqu_au: null } } : r));
    const r = evaluer(contexte({ bien: { dpe_date: '2021-07-01' }, aujourdhui: '2031-07-01', regles }), CRITERES_DECENCE);
    assert.ok(situations(r, 'R-01').includes('dpe_plus_10_ans'));
  });

  test('DPE du 30 juin 2021 : antérieur au nouveau DPE, plus valable', () => {
    assert.deepEqual(situations(ev({ bien: { dpe_date: '2021-06-30' } }), 'R-01'), ['dpe_absent_ou_ancien']);
  });

  test('chauffage électrique, classe F, DPE de 2023 : attestation ADEME conseillée', () => {
    const r = ev({ bien: { dpe_classe: 'F', dpe_date: '2023-02-10', chauffage_energie: 'electrique' } });
    assert.deepEqual(situations(r, 'R-01'), ['classe_f', 'attestation_electricite']);
  });

  test('chauffage électrique, DPE de 2026 (nouveau calcul) : pas d\'attestation', () => {
    const r = ev({ bien: { dpe_classe: 'F', dpe_date: '2026-02-10', chauffage_energie: 'electrique' } });
    assert.deepEqual(situations(r, 'R-01'), ['classe_f']);
  });

  test('bornes de l\'attestation : 31/12/2025 oui, 01/01/2026 non', () => {
    const base = { dpe_classe: 'E', chauffage_energie: 'electrique' };
    assert.ok(situations(ev({ bien: { ...base, dpe_date: '2025-12-31' } }), 'R-01').includes('attestation_electricite'));
    assert.ok(!situations(ev({ bien: { ...base, dpe_date: '2026-01-01' } }), 'R-01').includes('attestation_electricite'));
  });

  test('alertes : DPE de 2022 → rappel 6 mois avant le 14/03/2032', () => {
    const r = ev({});
    assert.deepEqual(
      r.echeances.filter((e) => e.regle === 'R-01').map((e) => [e.cle, e.date]),
      [['dpe_bientot_perime', '2031-09-14'], ['dpe_fin_validite', '2032-03-14']],
    );
  });

  test('horizon : classe F → « La classe F ne suffira plus pour louer » au 01/01/2028 ; classe E → 01/01/2034', () => {
    const f = ev({ bien: { dpe_classe: 'F' } }).echeances.find((e) => e.cle === 'classe_insuffisante');
    assert.deepEqual([f.date, f.libelle], ['2028-01-01', 'La classe F ne suffira plus pour louer']);
    assert.equal(ev({ bien: { dpe_classe: 'E' } }).echeances.find((e) => e.cle === 'classe_insuffisante').date, '2034-01-01');
    assert.equal(ev({ bien: { dpe_classe: 'C' } }).echeances.find((e) => e.cle === 'classe_insuffisante'), undefined);
  });

  test('après le 31/12/2027, la version de R-01 doit être revue (messages F et E datés)', () => {
    const r = evaluer(contexte({ aujourdhui: '2028-01-02' }), CRITERES_DECENCE);
    assert.equal(r.etats.find((e) => e.regle === 'R-01').statut, 'version_a_revoir');
  });

  test('garage : non applicable', () => {
    assert.equal(ev({ bien: { type_bien: 'garage' } }).etats.find((e) => e.regle === 'R-01').statut, 'non_applicable');
  });

  test('DPE annoncé sans date : question à compléter', () => {
    const r = ev({ bien: { dpe_date: null }, reponses: { dpe_existe: 'oui' } });
    assert.deepEqual(r.etats.find((e) => e.regle === 'R-01'), { regle: 'R-01', statut: 'a_completer', validee: true, questions: ['dpe_date', 'dpe_classe'] });
  });
});

describe('R-04 · Diagnostics (règle validée)', () => {
  const diag = (type, date_realisation, resultat = null) => ({ type, date_realisation, resultat });

  test('dossier complet : « Tous les diagnostics valables », affiché en OK', () => {
    const r = ev({});
    assert.deepEqual(r.constats.filter((c) => c.regle === 'R-04').map((c) => [c.situation, c.gravite]), [['tous_valables', 'ok']]);
  });

  test('logement d\'avant 1949 sans CREP : critique', () => {
    assert.deepEqual(situations(ev({ bien: { periode_construction: 'avant_1949' } }), 'R-04'), ['crep_absent']);
  });

  test('CREP négatif de 2010 : valable à vie', () => {
    const r = ev({ bien: { periode_construction: 'avant_1949' }, diagnostics: [diag('crep', '2010-01-01', 'absence')] });
    assert.deepEqual(situations(r, 'R-04'), ['tous_valables']);
  });

  test('CREP positif de 2018 : à refaire (important)', () => {
    const r = ev({ bien: { periode_construction: 'avant_1949' }, diagnostics: [diag('crep', '2018-01-01', 'presence')] });
    assert.deepEqual(r.constats.filter((c) => c.regle === 'R-04').map((c) => [c.situation, c.gravite]), [['crep_positif_perime', 'important']]);
  });

  test('électricité de plus de 15 ans sans diagnostic : critique ; diagnostic de 2019 : important (périmé)', () => {
    assert.deepEqual(situations(ev({ reponses: { electricite_plus_15_ans: 'oui' } }), 'R-04'), ['securite_absent']);
    const r = ev({ reponses: { electricite_plus_15_ans: 'oui' }, diagnostics: [diag('electricite', '2019-06-01')] });
    assert.deepEqual(situations(r, 'R-04'), ['securite_perime']);
  });

  test('« Je ne sais pas » pour le gaz : diagnostic à prévoir', () => {
    assert.deepEqual(situations(ev({ reponses: { gaz: 'nsp' } }), 'R-04'), ['securite_absent']);
  });

  test('commune exposée sans état des risques : critique ; commune non exposée : rien', () => {
    assert.deepEqual(situations(ev({ reponses: { commune_risques: 'oui' } }), 'R-04'), ['erp_absent']);
    assert.deepEqual(situations(ev({ reponses: { commune_risques: 'non' } }), 'R-04'), ['tous_valables']);
  });

  test('location en préparation, état des risques de plus de 6 mois : critique', () => {
    const r = ev({
      bien: { situation_locative: 'pas_encore_loue' },
      reponses: { commune_risques: 'oui' },
      diagnostics: [diag('erp', '2026-03-01')],
    });
    assert.deepEqual(situations(r, 'R-04'), ['erp_plus_6_mois']);
  });

  test('immeuble collectif, permis inconnu, sans dossier amiante : important', () => {
    assert.deepEqual(situations(ev({ reponses: { permis_avant_1997: 'nsp' } }), 'R-04'), ['amiante']);
  });

  test('maison individuelle : pas de question amiante', () => {
    assert.deepEqual(situations(ev({ bien: { type_habitat: 'individuel' }, reponses: { permis_avant_1997: undefined } }), 'R-04'), ['tous_valables']);
  });

  test('garage : seul l\'état des risques est vérifié', () => {
    const r = ev({ bien: { type_bien: 'garage' }, reponses: { commune_risques: 'oui', electricite_plus_15_ans: 'oui' } });
    assert.deepEqual(situations(r, 'R-04'), ['erp_absent']);
  });

  test('question manquante : la règle est à compléter, avec la liste des questions', () => {
    const r = ev({ reponses: { zone_bruit: undefined } });
    const e = r.etats.find((x) => x.regle === 'R-04');
    assert.equal(e.statut, 'a_completer');
    assert.deepEqual(e.questions, ['zone_bruit']);
  });
});

describe('règles non validées et score : visibles seulement en mode aperçu', () => {
  test('hors aperçu : seules R-01 à R-04 sont évaluées, pas de score', () => {
    const r = ev({});
    assert.deepEqual(r.etats.map((e) => e.regle), ['R-01', 'R-02', 'R-03', 'R-04']);
    assert.equal(r.score, null);
  });

  test('en aperçu : toutes les règles, avec leur statut de validation', () => {
    const r = ev({ apercu: true });
    assert.equal(r.etats.length, 12);
    assert.equal(r.etats.find((e) => e.regle === 'R-08').validee, false);
  });

  test('R-02, R-03, R-06, R-07, R-10 attendent le bail', () => {
    const r = ev({ apercu: true });
    for (const code of ['R-02', 'R-03', 'R-06', 'R-07', 'R-10']) assert.equal(r.etats.find((e) => e.regle === code).statut, 'necessite_bail');
  });
});

describe('R-05, R-08, R-09, R-11, R-12 (en aperçu)', () => {
  test('R-05 : identifiant fiscal absent ou mal formé', () => {
    assert.deepEqual(situations(ev({ apercu: true, bien: { identifiant_fiscal: null } }), 'R-05'), ['identifiant_fiscal']);
    assert.deepEqual(situations(ev({ apercu: true, bien: { identifiant_fiscal: '8301234567' } }), 'R-05'), ['identifiant_fiscal']);
    assert.deepEqual(situations(ev({ apercu: true }), 'R-05'), []);
  });

  test('R-08 : copropriété sans assurance propriétaire (important), hors copropriété (conseil)', () => {
    const sansPno = [{ nature: 'attestation_locataire', assureur: null, date_fin_validite: '2027-06-30' }];
    assert.deepEqual(situations(ev({ apercu: true, assurances: sansPno }), 'R-08'), ['pno_copropriete']);
    assert.deepEqual(situations(ev({ apercu: true, assurances: sansPno, bien: { regime_juridique: 'mono_propriete' } }), 'R-08'), ['pno_hors_copropriete']);
  });

  test('R-08 : attestation du locataire expirée depuis plus de 30 jours', () => {
    const assurances = [
      { nature: 'proprietaire_non_occupant', assureur: 'A', date_fin_validite: null },
      { nature: 'attestation_locataire', assureur: null, date_fin_validite: '2026-09-15' },
    ];
    assert.deepEqual(situations(ev({ apercu: true, assurances }), 'R-08'), ['attestation_perimee']);
  });

  test('R-09 : commune en zone tendue → calcul du plafond avec le bail', () => {
    assert.equal(ev({ apercu: true, zoneTendue: true }).etats.find((e) => e.regle === 'R-09').statut, 'necessite_bail');
    assert.equal(ev({ apercu: true }).etats.find((e) => e.regle === 'R-09').statut, 'non_applicable');
  });

  test('R-11 : meublé avec deux éléments manquants → une situation qui les cite', () => {
    const presents = D.elements.map((e) => e.code).filter((c) => c !== 'four' && c !== 'luminaires');
    const r = ev({ apercu: true, bien: { situation_locative: 'loue_meuble' }, inventaireCodes: presents });
    const c = r.constats.find((x) => x.regle === 'R-11');
    assert.equal(c.situation, 'element_manquant');
    assert.equal(c.valeurs['élément'], 'four ou four à micro-ondes, luminaires');
  });

  test('R-11 : inventaire complet → OK', () => {
    const r = ev({ apercu: true, bien: { situation_locative: 'loue_meuble' }, inventaireCodes: D.elements.map((e) => e.code) });
    assert.deepEqual(r.constats.filter((c) => c.regle === 'R-11').map((c) => [c.situation, c.gravite]), [['inventaire_complet', 'ok']]);
  });

  test('R-12 : pièce de 8 m² × 2,40 m = 19,2 m³ → critique ; 8,5 m² × 2,50 m = 21,25 m³ → décent', () => {
    assert.deepEqual(situations(ev({ apercu: true, reponses: { piece_principale_surface: '8' }, bien: { hauteur_sous_plafond: 2.4 } }), 'R-12'), ['surface']);
    assert.deepEqual(situations(ev({ apercu: true, reponses: { piece_principale_surface: '8.5' } }), 'R-12'), []);
  });

  test('R-12 : 9 m² mais 2,10 m sous plafond = 18,9 m³ → critique', () => {
    assert.deepEqual(situations(ev({ apercu: true, reponses: { piece_principale_surface: '9' }, bien: { hauteur_sous_plafond: 2.1 } }), 'R-12'), ['surface']);
  });

  test('R-12 : arrêté d\'insalubrité → critique ; critère « aération » non respecté → important', () => {
    assert.deepEqual(situations(ev({ apercu: true, reponses: { arrete: 'oui' } }), 'R-12'), ['arrete']);
    const r = ev({ apercu: true, reponses: { decence_aeration: 'non' } });
    const c = r.constats.find((x) => x.regle === 'R-12');
    assert.deepEqual([c.situation, c.gravite, c.valeurs['critère']], ['critere', 'important', 'aération']);
  });
});

describe('score (proposition à valider, en aperçu)', () => {
  test('logement sans problème : 100', () => {
    assert.equal(ev({ apercu: true }).score, 100);
  });

  test('classe F (−12) et copropriété sans assurance (−12) : 76', () => {
    const r = ev({ apercu: true, bien: { dpe_classe: 'F' }, assurances: [{ nature: 'attestation_locataire', assureur: null, date_fin_validite: '2027-06-30' }] });
    assert.equal(r.score, 76);
  });

  test('classe G louée (−50) et état des risques absent (−25) : 25', () => {
    assert.equal(ev({ apercu: true, bien: { dpe_classe: 'G' }, reponses: { commune_risques: 'oui' } }).score, 25);
  });

  test('jamais en dessous de 0', () => {
    const r = ev({
      apercu: true,
      bien: { dpe_classe: 'G', dpe_date: '2019-01-01', identifiant_fiscal: null },
      reponses: { commune_risques: 'oui', arrete: 'oui', electricite_plus_15_ans: 'oui', gaz: 'nsp' },
    });
    assert.equal(r.score, 0);
  });

  test('les conseils n\'enlèvent rien : classe E → 100', () => {
    assert.equal(ev({ apercu: true, bien: { dpe_classe: 'E' } }).score, 100);
  });

  test('score moyen du patrimoine : moyenne arrondie des biens évalués', () => {
    assert.equal(scoreMoyen([62, 88, 100]), 83);
    assert.equal(scoreMoyen([null, 50]), 50);
    assert.equal(scoreMoyen([]), null);
  });
});

describe('cas particuliers', () => {
  test('outre-mer : hors V1, pas de check-up', () => {
    const r = ev({ bien: { code_insee: '97411' } });
    assert.deepEqual([r.horsV1, r.constats.length, r.score], [true, 0, null]);
  });

  test('codes Insee des arrondissements ramenés à la commune (Paris, Marseille, Lyon)', () => {
    assert.equal(codeInseeCommune('75111'), '75056');
    assert.equal(codeInseeCommune('75120'), '75056');
    assert.equal(codeInseeCommune('13201'), '13055');
    assert.equal(codeInseeCommune('13216'), '13055');
    assert.equal(codeInseeCommune('69381'), '69123');
    assert.equal(codeInseeCommune('83144'), '83144');
  });

  test('R-09 : La Valette-du-Var est dans la liste à partir du 1er janvier 2027, pas avant', () => {
    const l = D.zoneTendue.filter((z) => z.code_insee === '83144');
    assert.deepEqual(l.map((z) => z.debut), ['2027-01-01']);
  });
});
