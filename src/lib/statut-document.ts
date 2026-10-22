// Statut des documents du coffre et classement (spec étape 1, § 5 ; maquette 15).
// Fonctions sans dépendance, testées dans tests/logique.

/**
 * Délai d'alerte avant la fin de validité d'un document saisie par le bailleur.
 * Choix d'interface (et non règle de droit) : les durées de validité légales
 * des diagnostics viendront de la règle R-04 à l'étape 2.
 */
export const JOURS_AVANT_RENOUVELLEMENT = 30;

export type DocumentCoffre = {
  id: string;
  type_document: string;
  titre: string;
  bien_id: string | null;
  personne_id: string | null;
  entite_id: string | null;
  date_document: string | null;
  date_validite: string | null;
  deductible: boolean;
  fichier_chemin: string | null;
  fichier_type: string | null;
  cree_le: string;
};

export type Statut = 'expire' | 'a_renouveler' | 'deductible' | 'ok';

function ajouterJours(dateIso: string, jours: number) {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
}

/** Statut affiché sur un document, à la date du jour (AAAA-MM-JJ). */
export function statutDocument(doc: Pick<DocumentCoffre, 'date_validite' | 'deductible'>, aujourdhui: string): Statut {
  if (doc.date_validite) {
    if (doc.date_validite < aujourdhui) return 'expire';
    if (doc.date_validite <= ajouterJours(aujourdhui, JOURS_AVANT_RENOUVELLEMENT)) return 'a_renouveler';
  }
  if (doc.deductible) return 'deductible';
  return 'ok';
}

/** Documents à mettre en avant : expirés d'abord, puis à renouveler, par échéance. */
export function alertes<T extends DocumentCoffre>(docs: T[], aujourdhui: string): T[] {
  const rang = { expire: 0, a_renouveler: 1 } as Record<Statut, number>;
  return docs
    .filter((d) => {
      const s = statutDocument(d, aujourdhui);
      return s === 'expire' || s === 'a_renouveler';
    })
    .sort(
      (a, b) =>
        rang[statutDocument(a, aujourdhui)] - rang[statutDocument(b, aujourdhui)] ||
        (a.date_validite ?? '').localeCompare(b.date_validite ?? ''),
    );
}

export type Critere = 'bien' | 'locataire' | 'entite' | 'type';

export type Groupe<T> = { cle: string; documents: T[] };

const SANS: Record<Critere, string> = {
  bien: 'sans-bien',
  locataire: 'sans-locataire',
  entite: 'sans-entite',
  type: 'divers',
};

/** Regroupe les documents selon le critère choisi, les plus récents d'abord. */
export function regrouper<T extends DocumentCoffre>(docs: T[], critere: Critere): Groupe<T>[] {
  const champ = { bien: 'bien_id', locataire: 'personne_id', entite: 'entite_id', type: 'type_document' } as const;
  const groupes = new Map<string, T[]>();
  for (const d of docs) {
    const cle = (d[champ[critere]] as string | null) ?? SANS[critere];
    groupes.set(cle, [...(groupes.get(cle) ?? []), d]);
  }
  const tri = (d: T) => d.date_document ?? d.cree_le.slice(0, 10);
  return [...groupes.entries()]
    .map(([cle, documents]) => ({ cle, documents: documents.sort((a, b) => tri(b).localeCompare(tri(a))) }))
    .sort((a, b) => Number(a.cle === SANS[critere]) - Number(b.cle === SANS[critere]));
}

/** Recherche simple, sans tenir compte des accents ni des majuscules. */
export function correspond(texte: string, recherche: string) {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  return norm(texte).includes(norm(recherche.trim()));
}
