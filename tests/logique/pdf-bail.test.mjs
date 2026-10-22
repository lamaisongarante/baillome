// Bail en PDF : le texte officiel est repris tel quel, seuls les crochets sont remplis.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { htmlBail, mentionsACompleter, traiterContrat } from '../../src/lib/pdf/bail.ts';

const dossier = (autres = {}) => ({
  type: 'nu',
  fichierContrat: 'contrat-type-nu-2026-10-01.md',
  versionContrat: '2026-10-01',
  fichierNotice: 'notice-information-2026-10-18.md',
  bailleur: {
    nom: 'Sarah Exemple',
    adresse: '5 avenue des Pins, 83160 La Valette-du-Var',
    qualite: 'personne_physique',
    sciFamiliale: false,
    telephone: '0612345678',
    email: 'sarah@exemple.test',
    date_naissance: '1985-04-12',
    lieu_naissance: 'Toulon',
    forme_juridique: null,
    siren: null,
    representant_legal: null,
  },
  locataires: [
    {
      prenom: 'Léa',
      nom: 'Martin',
      telephone: '0611111111',
      email: 'lea@exemple.test',
      date_naissance: '1998-02-03',
      lieu_naissance: 'Lyon',
      adresse: '8 rue des Lilas, 69003 Lyon',
    },
  ],
  colocation: false,
  bien: {
    numero: 1,
    adresse: '12 rue Victor Hugo',
    batiment: null,
    etage: '2',
    porte: 'B',
    code_postal: '83130',
    commune: 'La Garde',
    identifiant_fiscal: '830620000123',
    type_habitat: 'collectif',
    regime_juridique: 'copropriete',
    periode_construction: '1975_1989',
    surface_habitable: 48,
    pieces_principales: 2,
    autres_parties: ['balcon'],
    equipements: 'cuisine équipée',
    chauffage_mode: 'individuel',
    chauffage_repartition: null,
    eau_chaude_mode: 'individuelle',
    eau_chaude_repartition: null,
    parties_communes: 'ascenseur, local vélos, espaces verts, interphone',
    dpe_classe: 'D',
    dpe_date: '2022-03-12',
    dpe_depenses_min_euros: 890,
    dpe_depenses_max_euros: 1250,
    dpe_annee_reference_prix: 2021,
    equipements_numeriques: 'fibre optique',
    servitude_residence_principale: false,
    locaux_accessoires: [{ type: 'cave', numero_lot: '14', description: null }],
  },
  bail: {
    date_effet: '2026-11-01',
    duree_mois: 36,
    motif_duree_reduite: null,
    loyer_hc: 700,
    soumis_evolution_relocation: false,
    soumis_loyer_reference: false,
    loyer_reference_m2: null,
    loyer_reference_majore_m2: null,
    complement_loyer: null,
    complement_justification: null,
    precedent_loyer: 690,
    precedent_loyer_verse_le: '2026-09-05',
    precedent_revision_le: '2025-11-01',
    clause_revision: true,
    date_revision: null,
    trimestre_irl: 3,
    mode_charges: 'provisions',
    charges_montant: 50,
    revision_forfait: null,
    contribution_montant: null,
    contribution_duree: null,
    contribution_justification: null,
    assurance_pour_compte: false,
    assurance_montant_annuel: null,
    periodicite: 'mensuelle',
    terme: 'a_echoir',
    jour_paiement: 5,
    lieu_paiement: null,
    travaux_depuis_dernier_bail: null,
    travaux_six_derniers_mois: null,
    majoration_travaux: null,
    diminution_travaux: null,
    depot_garantie: 700,
    clause_solidarite: null,
    clause_resiliation_assurance: true,
    clause_resiliation_troubles: true,
    conditions_particulieres: null,
    niveau_signature: 'avancee',
    lieu_signature: 'La Valette-du-Var',
  },
  annexes: { diagnostics: [{ libelle: 'État des risques et pollutions', date: '2026-09-01' }] },
  projet: true,
  ...autres,
});

const texteRendu = (h) =>
  h.replace(/<[^>]+>/g, '').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('\u00a0', ' ');

function verifierFidelite(d) {
  const lignes = traiterContrat(d);
  const rendu = texteRendu(htmlBail(d));
  for (const l of lignes) {
    if (l.rendu === 'omise') continue;
    const s = l.source;
    if (/^Le \[date\]|^Signature du bailleur/.test(s)) continue;
    // Aucun crochet ne reste à remplir.
    if (l.rendu === 'gardee') assert.ok(!s.includes('['), `ligne non remplie : ${s}`);
    // Le texte officiel hors crochets figure tel quel dans le bail.
    const morceaux = l.rendu === 'remplie' ? s.split(/\[[^\[\]]*\]/) : [s];
    for (const m of morceaux) {
      const t = m.trim();
      if (!t) continue;
      if (/^\(\d+\)\s/.test(t)) {
        // Notes : seules les notes appelées sont imprimées, chacune telle quelle.
        for (const note of t.split(/\s(?=\(\d+\)\s)/)) {
          const numero = note.match(/^\((\d+)\)/)[1];
          const appelee = rendu.replace(note, '').includes(`(${numero})`);
          assert.equal(rendu.includes(note), appelee, `note (${numero}) : imprimée ${rendu.includes(note)}, appelée ${appelee}`);
        }
      } else if (/^[IVX]+\.\s/.test(t) && !s.includes('[')) {
        // Titre de partie : numéro et intitulé repris (mise en forme propre).
        const intitule = t.replace(/^[IVX]+\.\s*-?\s*/, '').replace(/\.$/, '');
        assert.ok(rendu.includes(intitule), `titre absent : ${t}`);
      } else {
        assert.ok(rendu.includes(t), `texte officiel absent ou modifié : ${t.slice(0, 80)}`);
      }
    }
  }
  return rendu;
}

test('bail nu complet : texte officiel intact, tous les champs remplis', () => {
  // Bail seul, sans la notice (qui parle elle aussi de servitude, d'honoraires…).
  const rendu = verifierFidelite(dossier({ fichierNotice: null }));
  assert.ok(!rendu.includes('à compléter'));
  assert.ok(rendu.includes('La clause de résiliation de plein droit ne produit effet que six semaines après la date d\'un commandement de payer demeuré infructueux.'));
  assert.ok(rendu.includes('830620000123'));
  assert.ok(rendu.includes('3e trimestre'));
  assert.ok(rendu.includes('loyer 700,00 € + charges récupérables 50,00 € = 750,00 €'));
  // Rubriques sans objet omises : mandataire, honoraires, solidarité, servitude, colocation.
  assert.ok(!rendu.includes('Honoraires de location'));
  assert.ok(!rendu.includes('(3) Mention obligatoire'), 'note (3) non appelée');
  assert.ok(!rendu.includes('représenté par le mandataire'));
  assert.ok(!rendu.includes('Clause de solidarité'));
  assert.ok(!rendu.includes('Servitude de résidence principale'));
  assert.ok(!rendu.includes('assurance pour le compte des colocataires'));
  // Projet : mention sur chaque page.
  assert.ok(rendu.includes('PROJET À RELIRE'));
});

test('bail meublé en colocation : solidarité, forfait, assurance pour compte, servitude', () => {
  const d = dossier({
    type: 'meuble',
    fichierContrat: 'contrat-type-meuble-2026-10-01.md',
    colocation: true,
    locataires: [
      { prenom: 'Léa', nom: 'Martin', telephone: null, email: null, date_naissance: null, lieu_naissance: null, adresse: null },
      { prenom: 'Tom', nom: 'Petit', telephone: null, email: null, date_naissance: null, lieu_naissance: null, adresse: null },
    ],
  });
  d.bien.servitude_residence_principale = true;
  Object.assign(d.bail, {
    duree_mois: 12,
    mode_charges: 'forfait',
    revision_forfait: 'révisé chaque année dans les mêmes conditions que le loyer',
    assurance_pour_compte: true,
    assurance_montant_annuel: 120,
    clause_solidarite: true,
    depot_garantie: 1400,
  });
  const rendu = verifierFidelite(d);
  assert.ok(rendu.includes('CONTRAT TYPE DE LOCATION OU DE COLOCATION DE LOGEMENT MEUBLÉ'));
  assert.ok(rendu.includes('Les colocataires sont tenus solidairement et indivisiblement'));
  assert.ok(rendu.includes('10,00 €')); // douzième de 120 €
  assert.ok(rendu.includes('Le cas échéant, Servitude de résidence principale : le logement objet du présent contrat est soumis'));
  assert.ok(rendu.includes('pour le non-respect de l’obligation de l’occuper exclusivement à titre de résidence principale'));
  assert.ok(rendu.includes('Un état des lieux, un inventaire et un état détaillé du mobilier (42)'));
});

test('données manquantes : signalées « à compléter » dans le projet, jamais inventées', () => {
  const d = dossier();
  d.bien.identifiant_fiscal = null;
  d.bailleur.adresse = null;
  const rendu = texteRendu(htmlBail(d));
  assert.ok(rendu.includes('identifiant fiscal du logement : à compléter'));
  assert.ok(rendu.includes('Domicile ou siège social : à compléter'));
  assert.ok(mentionsACompleter(d).includes('Domicile ou siège social du bailleur'));
  assert.ok(mentionsACompleter(d).includes('identifiant fiscal du logement'));
});

test('annexes : la notice d’information et l’extrait du règlement de copropriété figurent toujours', () => {
  const rendu = texteRendu(htmlBail(dossier()));
  assert.ok(rendu.includes('C. Une notice d\'information relative aux droits et obligations des locataires et des bailleurs'));
  assert.ok(rendu.includes('A. Le cas échéant, un extrait du règlement concernant la destination de l\'immeuble'));
  assert.ok(rendu.includes('D. Un état des lieux (21)'));
  // Hors copropriété, l'extrait du règlement est sans objet.
  const d = dossier();
  d.bien.regime_juridique = 'mono_propriete';
  assert.ok(!texteRendu(htmlBail(d)).includes('un extrait du règlement'));
});

test('notice d’information : chaque paragraphe officiel figure tel quel, tableaux compris', async () => {
  const { htmlNotice, paragraphesNotice } = await import('../../src/lib/pdf/notice.ts');
  const fichier = 'notice-information-2026-10-18.md';
  const rendu = texteRendu(htmlNotice(fichier));
  for (const p of paragraphesNotice(fichier)) {
    if (p.startsWith('|')) {
      // Chaque cellule du tableau est reprise.
      for (const cellule of p.split('\n').filter((l) => !/^\|( --- \|)+$/.test(l)).flatMap((l) => l.replace(/^\| /, '').replace(/ \|$/, '').split(' | '))) {
        assert.ok(rendu.includes(cellule), `cellule absente : ${cellule.slice(0, 60)}`);
      }
    } else {
      assert.ok(rendu.includes(p), `paragraphe absent ou modifié : ${p.slice(0, 80)}`);
    }
  }
});

test('documents imprimables : jamais de citron, fond blanc', async () => {
  const { couleurs, couleursDocuments } = await import('../../src/theme/tokens.ts');
  const h = htmlBail(dossier()).toUpperCase();
  assert.ok(!h.includes(couleurs.citron.toUpperCase()));
  assert.ok(!Object.values(couleursDocuments).map((c) => c.toUpperCase()).includes(couleurs.citron.toUpperCase()));
  assert.ok(h.includes(`BACKGROUND: ${couleursDocuments.fond.toUpperCase()}`));
});


test('mise en page A4, sans ligatures ; préambule en petit sur deux colonnes, sous le bloc titre', () => {
  const h = htmlBail(dossier());
  assert.match(h, /@page \{ size: A4; margin: 19mm; \}/);
  assert.match(h, /font-variant-ligatures: none/);
  assert.ok(!/letter-spacing: 0\.[1-9]/.test(h), 'aucun espacement des lettres');
  const iPreambule = h.indexOf('PRÉAMBULE DU CONTRAT TYPE (TEXTE OFFICIEL)');
  assert.ok(iPreambule > h.indexOf('class="cartouche"'));
  assert.ok(iPreambule < h.indexOf('class="partie"'));
  assert.ok(h.indexOf('Champ du contrat type') > iPreambule);
  assert.match(h, /\.preambule \.colonnes \{ column-count: 2;/);
});

test('retour de relecture n° 2 : notice séparée, notes appelées seulement, lieu de signature', async () => {
  const { htmlNoticeBail } = await import('../../src/lib/pdf/bail.ts');
  const d = dossier();
  d.bien.chauffage_mode = 'collectif';
  d.bien.chauffage_repartition = 'tantièmes';
  d.bien.eau_chaude_mode = 'collective';
  d.bien.eau_chaude_repartition = 'compteur individuel';
  d.bail.soumis_evolution_relocation = true;
  d.bail.lieu_signature = null;
  const rendu = texteRendu(htmlBail(d));
  // Le bail ne contient plus la notice ; elle forme un document séparé.
  assert.ok(!rendu.includes('ANNEXE C · NOTICE D’INFORMATION'));
  assert.ok(rendu.includes('notice d’information, document séparé du même dossier de signature'));
  assert.ok(texteRendu(htmlNoticeBail(d)).includes('CONTENU DE LA NOTICE D\'INFORMATION'));
  // Notes imprimées (cas du bail de test n° 2).
  const notes = [...htmlBail(d).matchAll(/<div class="notes">(.*?)<\/div>/gs)][0][1];
  const numeros = [...notes.matchAll(/<p>\((\d+)\)/g)].map((m) => Number(m[1]));
  assert.deepEqual(numeros, [1, 2, 4, 5, 7, 8, 9, 18, 19, 20, 21]);
  // Plus de « à à compléter ».
  assert.ok(!rendu.includes('à à compléter'));
  assert.ok(rendu.includes('à ……………… (lieu de signature à indiquer)'));
});

test('retour de relecture n° 1 : parties en deux encadrés, avec les compléments hors contrat type', () => {
  const rendu = texteRendu(htmlBail(dossier({ fichierNotice: null })));
  assert.ok(rendu.includes('LE BAILLEUR'));
  assert.ok(rendu.includes('LE LOCATAIRE'));
  assert.ok(rendu.includes('Nom et prénom, ou dénomination du bailleur : Sarah Exemple'));
  assert.ok(rendu.includes('Domicile ou siège social : 5 avenue des Pins'));
  assert.ok(rendu.includes('Adresse électronique (facultatif) : sarah@exemple.test'));
  assert.ok(rendu.includes('COMPLÉMENTS (HORS CONTRAT TYPE)'));
  assert.ok(rendu.includes('Date et lieu de naissance : le 12/04/1985 à Toulon'));
  assert.ok(rendu.includes('Adresse actuelle : 8 rue des Lilas, 69003 Lyon'));
  assert.ok(rendu.includes('(2) désigné (s) ci-après le bailleur ;'));
});

test('retour de relecture n° 1 : répartition en collectif, parties communes, équipements, documents joints, lieu', () => {
  const d = dossier({ fichierNotice: null });
  d.bien.chauffage_mode = 'collectif';
  d.bien.chauffage_repartition = 'tantièmes de copropriété';
  d.bien.eau_chaude_mode = 'collective';
  const rendu = texteRendu(htmlBail(d));
  assert.ok(rendu.includes('collectif ; répartition de la consommation du locataire : tantièmes de copropriété(4)'));
  assert.ok(rendu.includes('collective ; répartition de la consommation du locataire : à compléter (5)'));
  assert.ok(rendu.includes('D. Le cas échéant, Enumération des locaux, parties, équipements et accessoires de l\'immeuble à usage commun : ascenseur, local vélos'));
  assert.ok(rendu.includes('DOCUMENTS JOINTS diagnostic de performance énergétique du 12/03/2022 ; État des risques et pollutions du 01/09/2026'));
  assert.ok(rendu.includes('à La Valette-du-Var'));
  // La mention manquante est signalée : pas d'envoi à la signature.
  assert.deepEqual(mentionsACompleter(d), ['modalité de production d\'eau chaude sanitaire']);
});

test('retour de relecture n° 1 : copropriété sans parties communes renseignées → à compléter', () => {
  const d = dossier({ fichierNotice: null });
  d.bien.parties_communes = null;
  d.bail.lieu_signature = null;
  assert.deepEqual(mentionsACompleter(d), ['D. Le cas échéant, Enumération des locaux, parties, équipements et accessoires de l\'immeuble à usage commun', 'Lieu de signature']);
});
