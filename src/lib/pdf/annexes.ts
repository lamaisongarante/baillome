// Page de garde des annexes du bail (contrat type, XI) : la liste des pièces
// dans l'ordre officiel, avec les documents réellement joints et, s'il en
// manque, la mention claire de ce qui manque. Les pièces elles-mêmes (coffre et
// notice) sont réunies à la suite dans le même PDF (generer-bail.ts).
// Fonctions pures, testées dans tests/logique/pdf-bail.test.mjs.
import { LIBELLES_DIAGNOSTICS } from '../../../supabase/functions/_partage/bail.ts';
import { dateFr, html, page } from './commun.ts';

export type PieceJointe = { titre: string; date: string | null };

export type PiecesAnnexes = {
  /** A. Extrait du règlement de copropriété : seulement pour un logement en copropriété. */
  copropriete: boolean;
  reglement: PieceJointe | null;
  /** B. Diagnostics obligatoires (natures) et documents rangés au coffre, par nature. */
  diagnosticsRequis: string[];
  diagnostics: (PieceJointe & { nature: string })[];
  /** Questions du check-up sans réponse qui décident d'un diagnostic obligatoire (libellés). */
  aRepondre: string[];
  /** C. Notice d'information jointe (version), ou null si aucune version ne couvre la date du bail. */
  notice: { depuis: string } | null;
};

const ligne = (lettre: string, intitule: string, contenu: string) =>
  `<div class="piece"><div class="lettre-piece">${lettre}</div><div class="contenu-piece"><div class="intitule-piece">${html(intitule)}</div>${contenu}</div></div>`;
const joint = (p: PieceJointe) => `<div class="joint">Joint : ${html(p.titre)}${p.date ? ` du ${html(dateFr(p.date))}` : ''}</div>`;
const manquant = (texte: string) => `<div class="manquant">MANQUANT · ${html(texte)}</div>`;

/** Pièces obligatoires absentes du coffre (pour l'avertissement de la page de garde). */
export function piecesManquantes(p: PiecesAnnexes): string[] {
  const manque: string[] = [];
  if (p.copropriete && !p.reglement) manque.push('Extrait du règlement de copropriété');
  for (const n of p.diagnosticsRequis) if (!p.diagnostics.some((d) => d.nature === n)) manque.push(LIBELLES_DIAGNOSTICS[n] ?? n);
  if (!p.notice) manque.push('Notice d’information');
  for (const q of p.aRepondre) manque.push(`Question du check-up sans réponse : ${q}`);
  return manque;
}

export function htmlPageDeGarde(args: { numeroBien: number; adresse: string; pieces: PiecesAnnexes; projet: boolean }): string {
  const { pieces: p } = args;
  const manque = piecesManquantes(p);

  const a = p.copropriete
    ? ligne('A', 'Extrait du règlement de copropriété', p.reglement ? joint(p.reglement) : manquant('à ranger dans le coffre (type « Règlement de copropriété »)'))
    : '';

  const requis = p.diagnosticsRequis.map((n) => {
    const doc = p.diagnostics.find((d) => d.nature === n);
    return `<div class="sous-piece"><span class="nom-diag">${html(LIBELLES_DIAGNOSTICS[n] ?? n)}</span> — ${
      doc ? `joint${doc.date ? ` (${html(dateFr(doc.date))})` : ''}` : '<span class="manquant">MANQUANT · obligatoire, à ranger dans le coffre</span>'
    }</div>`;
  });
  const autres = p.diagnostics
    .filter((d) => !p.diagnosticsRequis.includes(d.nature))
    .map((d) => `<div class="sous-piece"><span class="nom-diag">${html(LIBELLES_DIAGNOSTICS[d.nature] ?? d.titre)}</span> — joint${d.date ? ` (${html(dateFr(d.date))})` : ''}</div>`);
  const questions = p.aRepondre.map((q) => `<div class="sous-piece"><span class="manquant">À VÉRIFIER · question du check-up sans réponse : ${html(q)}</span></div>`);
  const b = ligne('B', 'Dossier de diagnostic technique', [...requis, ...autres, ...questions].join('') || '<div class="sous-piece">Aucun diagnostic.</div>');

  const c = ligne(
    'C',
    'Notice d’information relative aux droits et obligations des locataires et des bailleurs',
    p.notice ? `<div class="joint">Jointe : version en vigueur depuis le ${html(dateFr(p.notice.depuis))}</div>` : manquant('aucune version stockée pour la date du bail'),
  );
  const d = ligne('D', 'État des lieux', '<div class="joint">Établi à la remise des clés (document distinct).</div>');

  const corps = `<div class="cartouche"><div>
<div class="mono sur-titre">CONTRAT DE LOCATION · BIEN N° ${String(args.numeroBien).padStart(2, '0')} · ${html(args.adresse.toUpperCase())}</div>
<h1>Annexes au contrat de location</h1>${args.projet ? '<div class="mono sur-titre projet">PROJET À RELIRE · NON SIGNÉ</div>' : ''}</div></div>
${
  manque.length
    ? `<div class="encadre-fort alerte"><div class="mono etiquette">PIÈCES MANQUANTES · LE BAIL NE PEUT PAS ÊTRE ENVOYÉ À LA SIGNATURE</div>${manque
        .map((m) => `<div class="manquant">${html(m)}</div>`)
        .join('')}</div>`
    : ''
}
<p>Sont annexées et jointes au contrat de location les pièces suivantes, réunies dans ce document dans l’ordre ci-dessous :</p>
<div class="pieces">${a}${b}${c}${d}</div>`;

  return page({
    titre: 'Annexes au contrat de location',
    reference: `BIEN N° ${String(args.numeroBien).padStart(2, '0')} · ANNEXES AU CONTRAT DE LOCATION`,
    piedGauche: args.projet ? '<span class="projet">PROJET À RELIRE · NON SIGNÉ</span>' : 'ANNEXES AU CONTRAT DE LOCATION',
    piedDroite: '',
    corps,
  });
}
