// Tests de la base : fiches locataires et garants, rattachement au bail.
import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';

import { creerBase, creerCompte, enTantQue } from './base-de-test.mjs';

let db;
let alice;
let bruno;

async function ajouterBien(id) {
  const { rows: e } = await enTantQue(db, id, `select id from entites where type = 'nom_propre'`);
  const { rows } = await enTantQue(db, id, `insert into biens (entite_id, type_bien) values ($1, 'appartement') returning id`, [e[0].id]);
  return rows[0].id;
}

async function ajouterPersonne(id, champs) {
  const cles = Object.keys(champs);
  const { rows } = await enTantQue(
    db,
    id,
    `insert into personnes (${cles.join(', ')}) values (${cles.map((_, i) => `$${i + 1}`).join(', ')}) returning id`,
    Object.values(champs),
  );
  return rows[0].id;
}

async function ajouterBail(id, bien, champs = {}) {
  const { rows } = await enTantQue(
    db,
    id,
    `insert into baux (bien_id, type_bail, date_effet, statut) values ($1, $2, $3, $4) returning id`,
    [bien, champs.type_bail ?? 'nu', champs.date_effet ?? '2023-11-01', champs.statut ?? 'en_cours'],
  );
  return rows[0].id;
}

async function rattacher(id, bail, personne) {
  await enTantQue(db, id, `insert into baux_locataires (bail_id, personne_id) values ($1, $2)`, [bail, personne]);
}

beforeEach(async () => {
  db = await creerBase();
  alice = await creerCompte(db, 'alice@exemple.test');
  bruno = await creerCompte(db, 'bruno@exemple.test');
});

describe('fiche locataire', () => {
  test('enregistre les coordonnées et la situation d’étudiant', async () => {
    const id = await ajouterPersonne(alice, {
      role: 'locataire', prenom: 'Léa', nom: 'Martin', email: 'lea@exemple.test', telephone: '0612345678',
      etudiant: true, boursier: false,
    });
    const { rows } = await enTantQue(db, alice, 'select email, telephone, etudiant, boursier from personnes where id = $1', [id]);
    assert.deepEqual(rows[0], { email: 'lea@exemple.test', telephone: '0612345678', etudiant: true, boursier: false });
  });

  test('refuse un email ou un numéro mal formé', async () => {
    await assert.rejects(ajouterPersonne(alice, { role: 'locataire', nom: 'Martin', email: 'lea@' }));
    await assert.rejects(ajouterPersonne(alice, { role: 'locataire', nom: 'Martin', telephone: '06 12' }));
  });

  test('« boursier » n’a de sens que pour un étudiant', async () => {
    await assert.rejects(ajouterPersonne(alice, { role: 'locataire', nom: 'Martin', boursier: true }));
  });

  test('le rôle d’une personne ne se modifie pas', async () => {
    const id = await ajouterPersonne(alice, { role: 'locataire', nom: 'Martin' });
    await assert.rejects(enTantQue(db, alice, `update personnes set role = 'garant' where id = $1`, [id]));
  });
});

describe('fiche garant', () => {
  test('un garant a toujours un type, et seulement lui', async () => {
    await assert.rejects(ajouterPersonne(alice, { role: 'garant', nom: 'Durand' }));
    await assert.rejects(ajouterPersonne(alice, { role: 'locataire', nom: 'Durand', type_garant: 'personne_physique' }));
    await ajouterPersonne(alice, { role: 'garant', nom: 'Durand', type_garant: 'personne_physique', adresse: '3 rue des Lilas, 83000 Toulon' });
  });

  test('la référence Visale est réservée à la garantie Visale', async () => {
    await assert.rejects(ajouterPersonne(alice, { role: 'garant', nom: 'Durand', type_garant: 'personne_physique', visale_reference: 'V123' }));
    await ajouterPersonne(alice, { role: 'garant', nom: 'Garantie Visale', type_garant: 'visale', visale_reference: 'V123' });
  });

  test('les champs propres au locataire sont refusés pour un garant', async () => {
    await assert.rejects(ajouterPersonne(alice, { role: 'garant', nom: 'Durand', type_garant: 'personne_physique', etudiant: true }));
  });
});

describe('bail et cautionnement', () => {
  test('un locataire est rattaché au bail de son bien', async () => {
    const bien = await ajouterBien(alice);
    const bail = await ajouterBail(alice, bien);
    const lea = await ajouterPersonne(alice, { role: 'locataire', nom: 'Martin' });
    await rattacher(alice, bail, lea);
    const { rows } = await enTantQue(db, alice, 'select personne_id from baux_locataires where bail_id = $1', [bail]);
    assert.deepEqual(rows, [{ personne_id: lea }]);
  });

  test('un garant ne peut pas être rattaché comme locataire', async () => {
    const bien = await ajouterBien(alice);
    const bail = await ajouterBail(alice, bien);
    const garant = await ajouterPersonne(alice, { role: 'garant', nom: 'Durand', type_garant: 'personne_physique' });
    await assert.rejects(rattacher(alice, bail, garant));
  });

  test('un seul bail en cours par bien', async () => {
    const bien = await ajouterBien(alice);
    await ajouterBail(alice, bien);
    await assert.rejects(ajouterBail(alice, bien));
    await ajouterBail(alice, bien, { statut: 'termine', date_effet: '2020-01-01' });
  });

  test('un bail en cours a une date de prise d’effet', async () => {
    const bien = await ajouterBien(alice);
    await assert.rejects(
      enTantQue(db, alice, `insert into baux (bien_id, type_bail) values ($1, 'nu')`, [bien]),
    );
  });

  test('le cautionnement désigne un locataire de ce bail (article 8-1, VI)', async () => {
    const bien = await ajouterBien(alice);
    const bail = await ajouterBail(alice, bien);
    const lea = await ajouterPersonne(alice, { role: 'locataire', nom: 'Martin' });
    const tom = await ajouterPersonne(alice, { role: 'locataire', nom: 'Petit' });
    const garant = await ajouterPersonne(alice, { role: 'garant', nom: 'Durand', type_garant: 'personne_physique' });
    await rattacher(alice, bail, lea);
    // Tom n'est pas au bail : refusé.
    await assert.rejects(
      enTantQue(db, alice, 'insert into cautionnements (bail_id, garant_id, locataire_id) values ($1, $2, $3)', [bail, garant, tom]),
    );
    await enTantQue(db, alice, 'insert into cautionnements (bail_id, garant_id, locataire_id) values ($1, $2, $3)', [bail, garant, lea]);
    // Un locataire ne peut pas être garant.
    await rattacher(alice, bail, tom);
    await assert.rejects(
      enTantQue(db, alice, 'insert into cautionnements (bail_id, garant_id, locataire_id) values ($1, $2, $3)', [bail, tom, lea]),
    );
  });

  test('chaque bailleur ne voit que ses baux, locataires et garants', async () => {
    const bien = await ajouterBien(alice);
    const bail = await ajouterBail(alice, bien);
    const lea = await ajouterPersonne(alice, { role: 'locataire', nom: 'Martin' });
    await rattacher(alice, bail, lea);
    for (const table of ['baux', 'baux_locataires', 'personnes']) {
      const { rows } = await enTantQue(db, bruno, `select * from ${table}`);
      assert.equal(rows.length, 0, table);
    }
    // Bruno ne peut pas rattacher sa propre fiche au bail d'Alice.
    const sien = await ajouterPersonne(bruno, { role: 'locataire', nom: 'Intrus' });
    await assert.rejects(rattacher(bruno, bail, sien));
  });

  test('supprimer le bien supprime ses baux', async () => {
    const bien = await ajouterBien(alice);
    await ajouterBail(alice, bien);
    await enTantQue(db, alice, 'delete from biens where id = $1', [bien]);
    const { rows } = await enTantQue(db, alice, 'select * from baux');
    assert.equal(rows.length, 0);
  });
});
