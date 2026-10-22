// Lecture et contrôle des saisies du bailleur (dates, nombres).
// Fonctions sans dépendance, testées dans tests/logique.

/** « 14/03/2022 » → « 2022-03-14 ». Renvoie null si la date n'existe pas. */
export function lireDateFrancaise(texte: string): string | null {
  const m = texte.trim().match(/^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{4})$/);
  if (!m) return null;
  const [jour, mois, annee] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(annee, mois - 1, jour));
  if (d.getUTCFullYear() !== annee || d.getUTCMonth() !== mois - 1 || d.getUTCDate() !== jour) return null;
  return `${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
}

/** Vrai si la date (AAAA-MM-JJ) est postérieure à aujourd'hui. */
export function estDansLeFutur(dateIso: string, aujourdhui: Date = new Date()): boolean {
  const jour = aujourdhui.toISOString().slice(0, 10);
  return dateIso > jour;
}

/** Ajoute les « / » au fil de la frappe : « 140320 » → « 14/03/20 ». */
export function formaterDateEnCours(texte: string): string {
  const chiffres = texte.replace(/\D/g, '').slice(0, 8);
  if (chiffres.length <= 2) return chiffres;
  if (chiffres.length <= 4) return `${chiffres.slice(0, 2)}/${chiffres.slice(2)}`;
  return `${chiffres.slice(0, 2)}/${chiffres.slice(2, 4)}/${chiffres.slice(4)}`;
}

/** « 48,5 » ou « 48.5 » → 48.5 ; null si vide ou invalide. */
export function lireNombre(texte: string): number | null {
  const t = texte.trim().replace(/\s/g, '').replace(',', '.');
  if (!t) return null;
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

/** Nombre entier positif ou nul ; null si vide ou invalide. */
export function lireEntier(texte: string): number | null {
  const t = texte.trim();
  if (!/^\d+$/.test(t)) return null;
  return Number(t);
}
