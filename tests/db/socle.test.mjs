// Tests de la base de données de l'étape 1 (le socle).
// Lancer : npm run test:db
import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';

import { creerBase, creerCompte, enAdmin, enTantQue } from './base-de-test.mjs';

let db;
let alice;
let bruno;

async function entiteNomPropre(id) {
  const { rows } = await enTantQue(db, id, `select id from entites where type = 'nom_propre'`);
  return rows[0].id;
}

async function ajouterBien(id, champs = {}) {
  const entite = champs.entite_id ?? (await entiteNomPropre(id));
  const { rows } = await enTantQue(
    db,
    id,
    `insert into biens (entite_id, type_bien, identifiant_fiscal) values ($1, $2, $3) returning id, numero`,
    [entite, champs.type_bien ?? 'appartement', champs.identifiant_fiscal ?? null],
  );
  return rows[0];
}

beforeEach(async () => {
  db = await creerBase();
  alice = await creerCompte(db, 'alice@exemple.test');
  bruno = await creerCompte(db, 'bruno@exemple.test');
});

describe('création du compte', () => {
  test('crée le profil en formule Découverte et l’entité « en nom propre »', async () => {
    const profil = await enTantQue(db, alice, 'select formule from profils');
    assert.deepEqual(profil.rows, [{ formule: 'decouverte' }]);
    const entites = await enTantQue(db, alice, 'select type, qualite_bailleur from entites');
    assert.deepEqual(entites.rows, [{ type: 'nom_propre', qualite_bailleur: 'personne_physique' }]);
  });
});

describe('inscription', () => {
  test('enregistre le prénom et les consentements avec leur version', async () => {
    const claire = await creerCompte(db, 'claire@exemple.test', {
      prenom: ' Claire ',
      consentements: [
        { document: 'cgu', version: '0.1' },
        { document: 'confidentialite', version: '0.1' },
      ],
    });
    const profil = await enTantQue(db, claire, 'select prenom from profils');
    assert.equal(profil.rows[0].prenom, 'Claire');
    const { rows } = await enTantQue(db, claire, 'select document, version from consentements order by document');
    assert.deepEqual(rows, [
      { document: 'cgu', version: '0.1' },
      { document: 'confidentialite', version: '0.1' },
    ]);
  });

  test('sans consentement transmis, le compte est créé et l’application les redemandera', async () => {
    const { rows } = await enTantQue(db, alice, 'select * from consentements');
    assert.equal(rows.length, 0);
  });

  test('un document de consentement inconnu est refusé', async () => {
    await assert.rejects(
      creerCompte(db, 'x@exemple.test', { consentements: [{ document: 'autre', version: '1' }] }),
      /check constraint/,
    );
  });
});

describe('chaque bailleur ne voit que ses données', () => {
  test('Bruno ne voit ni les biens, ni les entités, ni le profil d’Alice', async () => {
    await ajouterBien(alice);
    assert.equal((await enTantQue(db, bruno, 'select * from biens')).rows.length, 0);
    assert.equal((await enTantQue(db, bruno, 'select * from entites')).rows.length, 1); // la sienne
    assert.equal((await enTantQue(db, bruno, 'select * from profils')).rows.length, 1); // le sien
  });

  test('Bruno ne peut pas créer un bien au nom d’Alice', async () => {
    const entiteAlice = await entiteNomPropre(alice);
    await assert.rejects(
      enTantQue(db, bruno, `insert into biens (proprietaire_id, entite_id, type_bien) values ($1, $2, 'maison')`, [
        alice,
        entiteAlice,
      ]),
      /row-level security/,
    );
  });

  test('Bruno ne peut pas rattacher son bien à l’entité d’Alice', async () => {
    const entiteAlice = await entiteNomPropre(alice);
    await assert.rejects(ajouterBien(bruno, { entite_id: entiteAlice }), /foreign key/);
  });

  test('Bruno ne peut ni modifier ni supprimer le bien d’Alice', async () => {
    const bien = await ajouterBien(alice);
    const maj = await enTantQue(db, bruno, `update biens set notes = 'piraté' where id = $1`, [bien.id]);
    const sup = await enTantQue(db, bruno, 'delete from biens where id = $1', [bien.id]);
    assert.equal(maj.affectedRows, 0);
    assert.equal(sup.affectedRows, 0);
    const { rows } = await enAdmin(db, 'select notes from biens where id = $1', [bien.id]);
    assert.equal(rows[0].notes, null);
  });

  test('un document ne peut pas pointer vers le dossier d’un autre bailleur', async () => {
    await assert.rejects(
      enTantQue(db, bruno, `insert into documents (type_document, titre, fichier_chemin) values ('divers', 'x', $1)`, [
        `${alice}/vol.pdf`,
      ]),
      /check constraint/,
    );
  });
});

describe('limite de biens selon la formule', () => {
  test('Découverte : 1 bien, le 2e est refusé avec un message clair', async () => {
    await ajouterBien(alice);
    await assert.rejects(ajouterBien(alice), /LIMITE_BIENS/);
  });

  test('Essentiel : 3 biens, le 4e est refusé', async () => {
    await enAdmin(db, `update profils set formule = 'essentiel' where id = $1`, [alice]);
    for (let i = 0; i < 3; i++) await ajouterBien(alice);
    await assert.rejects(ajouterBien(alice), /LIMITE_BIENS/);
  });

  test('Patrimoine : pas de limite', async () => {
    await enAdmin(db, `update profils set formule = 'patrimoine' where id = $1`, [alice]);
    for (let i = 0; i < 12; i++) await ajouterBien(alice);
    const { rows } = await enTantQue(db, alice, 'select count(*)::int as n from biens');
    assert.equal(rows[0].n, 12);
  });

  test('la limite d’un bailleur ne dépend pas des biens des autres', async () => {
    await ajouterBien(alice);
    await ajouterBien(bruno); // Bruno a lui aussi droit à son bien
  });

  test('le bailleur ne peut pas changer lui-même de formule', async () => {
    await assert.rejects(
      enTantQue(db, alice, `update profils set formule = 'patrimoine' where id = $1`, [alice]),
      /permission denied/,
    );
  });

  test('il peut en revanche modifier son prénom', async () => {
    const r = await enTantQue(db, alice, `update profils set prenom = 'Alice' where id = $1`, [alice]);
    assert.equal(r.affectedRows, 1);
  });
});

describe('fiche du bien', () => {
  test('numérotation automatique propre à chaque bailleur (n° 01, 02…)', async () => {
    await enAdmin(db, `update profils set formule = 'gestion' where id in ($1, $2)`, [alice, bruno]);
    assert.equal((await ajouterBien(alice)).numero, 1);
    assert.equal((await ajouterBien(alice)).numero, 2);
    assert.equal((await ajouterBien(bruno)).numero, 1);
  });

  test('le numéro d’un bien ne se modifie pas', async () => {
    const bien = await ajouterBien(alice);
    await assert.rejects(
      enTantQue(db, alice, 'update biens set numero = 7 where id = $1', [bien.id]),
      /permission denied/,
    );
  });

  test('identifiant fiscal : 12 chiffres acceptés', async () => {
    const bien = await ajouterBien(alice, { identifiant_fiscal: '830123456789' });
    assert.ok(bien.id);
  });

  for (const invalide of ['83012345678', '8301234567890', '83A123456789', '83 0123456789']) {
    test(`identifiant fiscal refusé : « ${invalide} »`, async () => {
      await assert.rejects(ajouterBien(alice, { identifiant_fiscal: invalide }), /check constraint/);
    });
  }

  test('un local accessoire (garage) se rattache au logement', async () => {
    const bien = await ajouterBien(alice);
    const r = await enTantQue(
      db,
      alice,
      `insert into locaux_accessoires (bien_id, type, numero_lot) values ($1, 'garage', '12') returning id`,
      [bien.id],
    );
    assert.equal(r.rows.length, 1);
  });

  test('Bruno ne peut pas rattacher un local au bien d’Alice', async () => {
    const bien = await ajouterBien(alice);
    await assert.rejects(
      enTantQue(db, bruno, `insert into locaux_accessoires (bien_id, type) values ($1, 'cave')`, [bien.id]),
      /foreign key/,
    );
  });
});

describe('entités', () => {
  test('l’entité « en nom propre » ne peut pas être supprimée', async () => {
    const id = await entiteNomPropre(alice);
    await assert.rejects(enTantQue(db, alice, 'delete from entites where id = $1', [id]), /NOM_PROPRE_PROTEGE/);
  });

  test('un seul « nom propre » par bailleur', async () => {
    await assert.rejects(
      enTantQue(db, alice, `insert into entites (type, nom) values ('nom_propre', 'Bis')`),
      /duplicate key/,
    );
  });

  test('création d’une SCI familiale et rattachement d’un bien', async () => {
    const { rows } = await enTantQue(
      db,
      alice,
      `insert into entites (type, nom, qualite_bailleur, sci_familiale) values ('sci', 'SCI Les Pins', 'personne_morale', true) returning id`,
    );
    const bien = await ajouterBien(alice, { entite_id: rows[0].id });
    assert.ok(bien.id);
  });

  test('« SCI familiale » est réservé aux SCI', async () => {
    await assert.rejects(
      enTantQue(db, alice, `insert into entites (type, nom, sci_familiale) values ('indivision', 'Indivision X', true)`),
      /check constraint/,
    );
  });
});

describe('consentements', () => {
  test('ajoutés avec leur version, jamais modifiés ni supprimés', async () => {
    await enTantQue(db, alice, `insert into consentements (document, version) values ('cgu', '0.1')`);
    const maj = await enTantQue(db, alice, `update consentements set version = '9.9'`);
    const sup = await enTantQue(db, alice, 'delete from consentements');
    assert.equal(maj.affectedRows, 0);
    assert.equal(sup.affectedRows, 0);
    const { rows } = await enTantQue(db, alice, 'select document, version from consentements');
    assert.deepEqual(rows, [{ document: 'cgu', version: '0.1' }]);
  });
});

describe('données de référence', () => {
  test('les formules sont lisibles mais pas modifiables', async () => {
    const { rows } = await enTantQue(db, alice, 'select code, max_biens from formules order by ordre');
    assert.deepEqual(rows, [
      { code: 'decouverte', max_biens: 1 },
      { code: 'essentiel', max_biens: 3 },
      { code: 'gestion', max_biens: 10 },
      { code: 'patrimoine', max_biens: null },
    ]);
    const r = await enTantQue(db, alice, `update formules set max_biens = 99`);
    assert.equal(r.affectedRows, 0);
  });

  test('mobilier obligatoire : les 11 éléments du décret n° 2015-981, dans l’ordre', async () => {
    const { rows } = await enTantQue(db, alice, 'select ordre, libelle, source from elements_mobilier_obligatoires order by ordre');
    assert.equal(rows.length, 11);
    assert.equal(rows[0].libelle, 'Literie comprenant couette ou couverture');
    assert.equal(
      rows[4].libelle,
      'Réfrigérateur et congélateur ou, au minimum, un réfrigérateur doté d’un compartiment permettant de disposer d’une température inférieure ou égale à - 6 °C'.replaceAll('’', "'"),
    );
    assert.equal(rows[10].libelle, "Matériel d'entretien ménager adapté aux caractéristiques du logement");
    assert.ok(rows.every((r, i) => r.ordre === i + 1 && r.source.startsWith('Décret n° 2015-981')));
  });

  test('R-09 : les 1 430 communes de l’annexe, 1°, du décret n° 2026-831, en vigueur au 1er janvier 2027', async () => {
    const { rows } = await enTantQue(
      db,
      alice,
      `select count(*)::int as n, min(date_entree_vigueur)::text as debut, max(date_entree_vigueur)::text as fin,
              count(distinct agglomeration)::int as agglos
         from communes_zone_tendue where source like 'Décret n° 2026-831%'`,
    );
    assert.deepEqual(rows[0], { n: 1430, debut: '2027-01-01', fin: '2027-01-01', agglos: 47 });
  });

  for (const [code, commune] of [
    ['83144', 'La Valette-du-Var'],
    ['83062', 'La Garde'],
    ['83137', 'Toulon'],
    ['75056', 'Paris'],
    ['2A004', 'Ajaccio'],
    ['97411', 'Saint-Denis'],
  ]) {
    test(`R-09 : ${commune} (${code}) figure dans la liste`, async () => {
      const { rows } = await enTantQue(db, alice, 'select commune from communes_zone_tendue where code_insee = $1', [code]);
      assert.deepEqual(rows, [{ commune }]);
    });
  }

  test('R-09 : une commune hors liste n’y figure pas (Draguignan oui, Brignoles non)', async () => {
    const { rows } = await enTantQue(db, alice, `select code_insee from communes_zone_tendue where code_insee in ('83050', '83023')`);
    assert.deepEqual(rows, [{ code_insee: '83050' }]);
  });

  test('la liste des communes en zone tendue n’est pas modifiable depuis l’application', async () => {
    await assert.rejects(
      enTantQue(
        db,
        alice,
        `insert into communes_zone_tendue (code_insee, commune, source, date_entree_vigueur) values ('83137', 'Toulon', 'x', '2027-01-01')`,
      ),
      /row-level security/,
    );
  });
});

describe('coffre (stockage des fichiers)', () => {
  test('Alice range un fichier dans son dossier, Bruno ne le voit pas', async () => {
    await enTantQue(db, alice, `insert into storage.objects (bucket_id, name) values ('coffre', $1)`, [
      `${alice}/dpe.pdf`,
    ]);
    const vu = await enTantQue(db, bruno, 'select name from storage.objects');
    assert.equal(vu.rows.length, 0);
    const sup = await enTantQue(db, bruno, 'delete from storage.objects');
    assert.equal(sup.affectedRows, 0);
  });

  test('Bruno ne peut pas déposer un fichier dans le dossier d’Alice', async () => {
    await assert.rejects(
      enTantQue(db, bruno, `insert into storage.objects (bucket_id, name) values ('coffre', $1)`, [
        `${alice}/faux.pdf`,
      ]),
      /row-level security/,
    );
  });
});

describe('moteur de conformité : données et sécurité', () => {
  test('les réponses au check-up sont privées', async () => {
    const bien = await ajouterBien(alice);
    await enTantQue(db, alice, `insert into reponses_checkup (bien_id, question, valeur) values ($1, 'zone_bruit', 'non')`, [bien.id]);
    assert.equal((await enTantQue(db, bruno, 'select * from reponses_checkup')).rows.length, 0);
    await assert.rejects(
      enTantQue(db, bruno, `insert into reponses_checkup (bien_id, question, valeur) values ($1, 'arrete', 'oui')`, [bien.id]),
      /foreign key/,
    );
  });

  test('le bailleur ne peut pas activer lui-même le mode aperçu', async () => {
    await assert.rejects(
      enTantQue(db, alice, 'update profils set apercu_regles = true where id = $1', [alice]),
      /permission denied/,
    );
  });

  test('les règles, leurs paramètres et leurs messages sont lisibles mais pas modifiables', async () => {
    const { rows } = await enTantQue(db, alice, `select code, validee from regles where code in ('R-01', 'R-05', 'SCORE') order by code`);
    assert.deepEqual(rows, [
      { code: 'R-01', validee: true },
      { code: 'R-05', validee: false },
      { code: 'SCORE', validee: false },
    ]);
    const maj = await enTantQue(db, alice, `update regles set validee = true where code = 'R-05'`);
    assert.equal(maj.affectedRows, 0);
    const msg = await enTantQue(db, alice, `update regles_situations set message = 'x'`);
    assert.equal(msg.affectedRows, 0);
  });

  test('R-01 à R-04 validées, R-05 à R-12 et le score non validés', async () => {
    const { rows } = await enTantQue(db, alice, 'select code from regles where validee order by code');
    assert.deepEqual(rows.map((r) => r.code), ['R-01', 'R-02', 'R-03', 'R-04']);
  });
});

describe('suppression du compte par le bailleur lui-même', () => {
  test('Alice supprime son compte : tout est effacé, Bruno n’est pas touché', async () => {
    await ajouterBien(alice);
    await ajouterBien(bruno);
    await enTantQue(db, alice, 'select public.supprimer_mon_compte()');
    const { rows } = await enAdmin(
      db,
      `select (select count(*) from auth.users where id = $1)::int as compte_alice,
              (select count(*) from biens where proprietaire_id = $1)::int as biens_alice,
              (select count(*) from auth.users where id = $2)::int as compte_bruno,
              (select count(*) from biens where proprietaire_id = $2)::int as biens_bruno`,
      [alice, bruno],
    );
    assert.deepEqual(rows[0], { compte_alice: 0, biens_alice: 0, compte_bruno: 1, biens_bruno: 1 });
  });

  test('un visiteur non connecté ne peut pas l’appeler', async () => {
    await enAdmin(db, 'reset role');
    await db.query('set role anon');
    await assert.rejects(db.query('select public.supprimer_mon_compte()'), /permission denied/);
    await db.query('reset role');
  });
});

describe('entités : suppression', () => {
  test('une SCI sans bien peut être supprimée', async () => {
    const { rows } = await enTantQue(db, alice, `insert into entites (type, nom) values ('sci', 'SCI Test') returning id`);
    const r = await enTantQue(db, alice, 'delete from entites where id = $1', [rows[0].id]);
    assert.equal(r.affectedRows, 1);
  });

  test('une SCI qui détient un bien ne peut pas être supprimée', async () => {
    const { rows } = await enTantQue(db, alice, `insert into entites (type, nom) values ('sci', 'SCI Test') returning id`);
    await ajouterBien(alice, { entite_id: rows[0].id });
    await assert.rejects(enTantQue(db, alice, 'delete from entites where id = $1', [rows[0].id]), /foreign key/);
  });
});

describe('suppression du compte', () => {
  test('efface toutes les données du bailleur, et seulement les siennes', async () => {
    await ajouterBien(alice);
    await ajouterBien(bruno);
    await enAdmin(db, 'delete from auth.users where id = $1', [alice]);
    const { rows } = await enAdmin(
      db,
      `select (select count(*) from biens where proprietaire_id = $1)::int as biens_alice,
              (select count(*) from entites where proprietaire_id = $1)::int as entites_alice,
              (select count(*) from profils where id = $1)::int as profil_alice,
              (select count(*) from biens where proprietaire_id = $2)::int as biens_bruno`,
      [alice, bruno],
    );
    assert.deepEqual(rows[0], { biens_alice: 0, entites_alice: 0, profil_alice: 0, biens_bruno: 1 });
  });
});
