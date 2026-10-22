// Charge les vraies données des règles (après migrations) pour tester le moteur.
import { creerBase } from '../db/base-de-test.mjs';

let cache;
export async function donneesRegles() {
  if (cache) return cache;
  const db = await creerBase();
  const regles = (await db.query('select code, titre, validee from regles order by code')).rows;
  const versions = (await db.query('select regle_code, version, date_effet::text, valable_jusqu_au::text, parametres, source from regles_versions')).rows;
  const situations = (await db.query('select regle_code, code, gravite from regles_situations')).rows;
  const elements = (await db.query('select code, libelle from elements_mobilier_obligatoires order by ordre')).rows;
  const zoneTendue = (await db.query('select code_insee, date_entree_vigueur::text as debut from communes_zone_tendue')).rows;
  cache = {
    regles: regles.map((r) => {
      const v = versions.find((x) => x.regle_code === r.code);
      return { ...r, version: v ? { ...v } : null };
    }),
    situations,
    elements,
    zoneTendue,
  };
  return cache;
}
