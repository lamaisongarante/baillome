// Équipements du logement (fiche du bien, rubrique Équipements) : réponses
// structurées et phrase reprise au bail (contrat type, II. A, « éléments
// d'équipements du logement »). Libellés descriptifs, sans portée juridique.
// Fonctions sans dépendance, testées dans tests/logique.

export const EQUIPEMENTS_CUISINE = [
  { valeur: 'evier', libelle: 'évier' },
  { valeur: 'plaques', libelle: 'plaques de cuisson' },
  { valeur: 'four', libelle: 'four' },
  { valeur: 'micro_ondes', libelle: 'four à micro-ondes' },
  { valeur: 'hotte', libelle: 'hotte' },
  { valeur: 'refrigerateur', libelle: 'réfrigérateur' },
  { valeur: 'congelateur', libelle: 'congélateur' },
  { valeur: 'lave_vaisselle', libelle: 'lave-vaisselle' },
  { valeur: 'lave_linge', libelle: 'lave-linge' },
  { valeur: 'placards', libelle: 'placards de rangement' },
] as const;

export const EQUIPEMENTS_SALLE_EAU = [
  { valeur: 'douche', libelle: 'douche' },
  { valeur: 'baignoire', libelle: 'baignoire' },
  { valeur: 'lavabo', libelle: 'lavabo' },
] as const;

export const WC = [
  { valeur: 'separe', libelle: 'WC séparé' },
  { valeur: 'salle_eau', libelle: 'WC dans la salle d’eau' },
] as const;

const libelle = (liste: readonly { valeur: string; libelle: string }[], v: string) => liste.find((x) => x.valeur === v)?.libelle ?? v;

function enumerer(mots: string[]): string {
  if (mots.length <= 1) return mots.join('');
  return `${mots.slice(0, -1).join(', ')} et ${mots[mots.length - 1]}`;
}

/**
 * Phrase des équipements pour le bail, par exemple « cuisine équipée : évier,
 * plaques de cuisson, four et hotte ; salle d'eau avec douche et lavabo ; WC
 * séparé ». Les précisions libres du bailleur s'ajoutent à la fin. Null si rien
 * n'est renseigné.
 */
export function phraseEquipements(b: {
  cuisine_equipements: string[];
  salle_eau_equipements: string[];
  wc: string | null;
  cuisine: string | null;
  sanitaires: string | null;
}): string | null {
  // Ordre fixe, quel que soit l'ordre de saisie.
  const cuisine = EQUIPEMENTS_CUISINE.filter((e) => b.cuisine_equipements.includes(e.valeur)).map((e) => e.libelle);
  const salleEau = EQUIPEMENTS_SALLE_EAU.filter((e) => b.salle_eau_equipements.includes(e.valeur)).map((e) => e.libelle);
  const parties = [
    cuisine.length ? `cuisine équipée : ${enumerer(cuisine)}` : null,
    salleEau.length ? `salle d’eau avec ${enumerer(salleEau)}` : null,
    b.wc ? libelle(WC, b.wc) : null,
    b.cuisine?.trim() || null,
    b.sanitaires?.trim() || null,
  ].filter((p): p is string => !!p);
  return parties.length ? parties.join(' ; ') : null;
}
