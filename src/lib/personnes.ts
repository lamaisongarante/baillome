// Fiches locataires et garants : contrôle des saisies et libellés.
// Fonctions sans dépendance, testées dans tests/logique.

export type TypeGarant = 'personne_physique' | 'personne_morale' | 'visale';
export type TypeBail = 'nu' | 'meuble' | 'garage';

export const LIBELLES_TYPE_GARANT: Record<TypeGarant, string> = {
  personne_physique: 'Une personne',
  personne_morale: 'Une société ou un organisme',
  visale: 'La garantie Visale',
};

export const LIBELLES_TYPE_BAIL: Record<TypeBail, string> = {
  nu: 'Location vide',
  meuble: 'Location meublée',
  garage: 'Garage ou place de stationnement',
};

/**
 * Numéro de portable saisi librement (« 06 12 34 56 78 », « +33 6 12… ») →
 * forme enregistrée (« 0612345678 », « +33612345678 »). Vide → null.
 * Renvoie undefined si le numéro est invalide.
 */
export function lireTelephone(texte: string): string | null | undefined {
  const t = texte.trim().replace(/[\s.\-()]/g, '');
  if (!t) return null;
  if (/^0\d{9}$/.test(t)) return t;
  if (/^\+\d{9,15}$/.test(t)) return t;
  if (/^00\d{9,15}$/.test(t)) return `+${t.slice(2)}`;
  return undefined;
}

/** « 0612345678 » → « 06 12 34 56 78 » ; les numéros internationaux restent tels quels. */
export function afficherTelephone(tel: string | null): string {
  if (!tel) return '';
  if (/^0\d{9}$/.test(tel)) return tel.replace(/(\d{2})(?=\d)/g, '$1 ');
  return tel;
}

/** Adresse électronique : contrôle de forme seulement. Vide → null ; invalide → undefined. */
export function lireEmail(texte: string): string | null | undefined {
  const t = texte.trim();
  if (!t) return null;
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t) ? t : undefined;
}

export function nomComplet(p: { prenom: string | null; nom: string }): string {
  return [p.prenom, p.nom].filter(Boolean).join(' ');
}

/** Type de bail proposé d'après la fiche du bien (le bailleur peut le changer). */
export function typeBailPropose(bien: {
  type_bien: string;
  type_location: string | null;
  situation_locative: string | null;
}): TypeBail {
  if (bien.type_bien === 'garage' || bien.type_location === 'garage_stationnement') return 'garage';
  if (bien.type_location === 'meublee' || bien.type_location === 'meuble_tourisme') return 'meuble';
  if (bien.type_location === 'nue') return 'nu';
  return bien.situation_locative === 'loue_meuble' ? 'meuble' : 'nu';
}

/**
 * Colocation : plusieurs locataires, sauf s'ils sont mariés ou pacsés
 * ensemble (loi du 6 juillet 1989, article 8-1, I).
 */
export function estColocation(nombreLocataires: number, couple: boolean): boolean {
  return nombreLocataires > 1 && !couple;
}
