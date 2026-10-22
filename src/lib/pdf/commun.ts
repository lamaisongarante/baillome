// Éléments communs aux documents imprimables (charte « documents » de
// CLAUDE.md) : fond blanc, aucun aplat de couleur, encadrés au trait vert pin,
// champs remplis soulignés en pointillé, jamais de citron.
// Valeurs reprises des maquettes design/sources-html (Bail-Editorial).

import { couleursDocuments } from '../../theme/tokens.ts';

export const PIN = couleursDocuments.pin;
const FOND = couleursDocuments.fond;
const TEXTE = couleursDocuments.texte;
const SECONDAIRE = couleursDocuments.secondaire;
const TRAIT = couleursDocuments.trait;
const FILET = couleursDocuments.filet;

/** Échappe un texte pour l'insérer dans du HTML. */
export function html(texte: string): string {
  return texte.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

/** Valeur remplie par Baillome : soulignée en pointillé, en gras vert pin. */
export function champ(valeur: string): string {
  // Une valeur courte (numéro, date, montant) ne se coupe pas en fin de ligne.
  return `<span class="champ${valeur.length <= 32 ? ' insecable' : ''}">${html(valeur)}</span>`;
}

export function euros(n: number): string {
  const [ent, dec] = n.toFixed(2).split('.');
  // Espace insécable classique : l'espace fine n'existe pas dans les polices des documents.
  return `${ent.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')},${dec}\u00a0€`;
}

export function dateFr(iso: string | null): string {
  if (!iso) return '';
  const [a, m, j] = iso.slice(0, 10).split('-');
  return `${j}/${m}/${a}`;
}

const POLICES =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap';

/** Logo « maison interrupteur » au trait, repris de design/sources-html/Bail-Editorial.dc.html. */
const LOGO = `<svg width="12" height="12" viewBox="0 0 100 100"><path d="M15 47 L50 18 L85 47" fill="none" stroke="${PIN}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M25 41 V81 H75 V41" fill="none" stroke="${PIN}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><rect x="31" y="51" width="38" height="22" rx="11" fill="none" stroke="${PIN}" stroke-width="7"/><circle cx="58" cy="62" r="7.5" fill="${PIN}"/></svg>`;

/**
 * Document A4 : en-tête en haut du document, pied à la fin. (La répétition
 * sur chaque page et la numérotation viendront avec la génération côté
 * serveur, étape 5 : l'impression sur téléphone ne les gère pas de façon fiable.)
 */
export function page({
  titre,
  reference,
  piedGauche,
  piedDroite,
  corps,
  echelle = 1,
}: {
  /**
   * Échelle d'impression. L'iPhone compte 1 point par pixel CSS (Chrome et
   * Android : 0,75 point) : sans correction, tout y sort un tiers plus grand.
   * generer-bail.ts passe 0,75 sur iPhone.
   */
  echelle?: number;
  titre: string;
  reference: string;
  piedGauche: string;
  piedDroite: string;
  corps: string;
}): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${html(titre)}</title>
<link rel="stylesheet" href="${POLICES}">
<style>
@page { size: A4; margin: 19mm; }
* { box-sizing: border-box; }
html, body { margin: 0; background: ${FOND}; }
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; zoom: ${echelle}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
table.mise-en-page { width: 100%; border-collapse: separate; border-spacing: 0; margin: 0; font-size: inherit; }
table.mise-en-page > tbody > tr > td { border: none; padding: 0; vertical-align: top; }
table.mise-en-page > tbody > tr > td.col-gauche { width: 50%; padding-right: 6pt; }
table.mise-en-page > tbody > tr > td.col-droite { width: 50%; padding-left: 6pt; }
table.parties-table { margin-top: 6pt; }
table.grille > tbody > tr > td { width: 50%; padding-right: 8pt; }
svg.case { display: inline-block; vertical-align: -0.5pt; margin: 0 3pt 0 4pt; }
/* Texte juridique : copiable et recherchable sans erreur (pas de ligatures, pas d'espacement des lettres). */
body { font-family: 'Instrument Sans', Helvetica, Arial, sans-serif; font-size: 9.75pt; line-height: 1.4; color: ${TEXTE};
  font-variant-ligatures: none; font-feature-settings: "liga" 0, "clig" 0, "dlig" 0; letter-spacing: 0; }
.entete { display: flex; justify-content: space-between; align-items: center; padding-bottom: 6pt; border-bottom: 0.75pt solid ${PIN}; margin-bottom: 12pt; }
.marque { display: flex; align-items: center; gap: 6pt; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 11pt; font-weight: 800; color: ${PIN}; }
.marque span.logo { width: 18pt; height: 18pt; border: 1.1pt solid ${PIN}; border-radius: 5pt; display: inline-flex; align-items: center; justify-content: center; }
.mono { font-family: 'IBM Plex Mono', monospace; }
.reference { font-size: 7pt; color: ${SECONDAIRE}; }
.pied { margin-top: 14pt; display: flex; justify-content: space-between; gap: 12pt; padding-top: 5pt; border-top: 0.75pt solid ${FILET}; font-size: 6.5pt; color: ${SECONDAIRE}; }
.cartouche { border: 1.1pt solid ${PIN}; border-radius: 10pt; padding: 12pt 16pt; display: flex; justify-content: space-between; align-items: flex-end; gap: 14pt; margin-bottom: 6pt; }
.cartouche .sur-titre { font-size: 7.5pt; color: ${SECONDAIRE}; }
.cartouche h1 { margin: 5pt 0 0 0; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 17pt; font-weight: 800; line-height: 1.15; color: ${PIN}; }
.cartouche .loi { font-size: 7pt; line-height: 1.5; color: ${SECONDAIRE}; text-align: right; max-width: 42%; }
.partie { margin-top: 14pt; display: flex; align-items: baseline; gap: 10pt; border-top: 0.75pt solid ${FILET}; padding-top: 8pt; break-after: avoid; page-break-after: avoid; }
.partie .numero { font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 21pt; font-weight: 800; color: ${PIN}; line-height: 1; min-width: 36pt; }
.partie .intitule { font-family: 'IBM Plex Mono', monospace; font-size: 8.5pt; font-weight: 600; color: ${PIN}; text-transform: uppercase; }
.rubrique { margin: 8pt 0 2pt 0; font-weight: 700; color: ${PIN}; break-after: avoid; page-break-after: avoid; }
p { margin: 3.5pt 0; }
p.tiret { padding-left: 9pt; text-indent: -9pt; }
.grille p { margin: 2pt 0; }
.champ { border-bottom: 1pt dotted ${PIN}; padding: 0 1.5pt; font-weight: 600; color: ${PIN}; }
.insecable, .option { white-space: nowrap; }
.encadre { border: 0.75pt solid ${TRAIT}; border-radius: 8pt; padding: 8pt 10pt; margin: 6pt 0; }
.encadre-fort { border: 1.1pt solid ${PIN}; border-radius: 9pt; padding: 9pt 11pt; margin: 8pt 0; break-inside: avoid; page-break-inside: avoid; }
.etiquette { font-size: 7pt; color: ${SECONDAIRE}; margin-bottom: 3pt; }
.partie-encadre { margin: 0; padding: 7pt 9pt; font-size: 8.75pt; line-height: 1.32; break-inside: avoid; page-break-inside: avoid; }
.ligne { padding: 1pt 0; }
.libelle { color: ${SECONDAIRE}; }
.personne + .personne { margin-top: 5pt; padding-top: 5pt; border-top: 0.75pt dashed ${TRAIT}; }
.complements { margin-top: 4pt; padding-top: 3pt; border-top: 0.75pt dashed ${TRAIT}; }
.designe { margin-top: 4pt; font-size: 8.5pt; color: ${SECONDAIRE}; }
.rappel { display: flex; gap: 12pt; align-items: center; }
.rappel-texte { flex: 1; font-size: 8.5pt; }
.rappel-texte p { margin: 1.5pt 0; }
.dpe { display: flex; align-items: center; gap: 8pt; padding-left: 12pt; border-left: 0.75pt solid ${PIN}; }
.dpe .mono { font-size: 7pt; color: ${SECONDAIRE}; line-height: 1.4; }
.dpe .lettre { width: 32pt; height: 32pt; border: 2.25pt solid; border-radius: 7pt; display: flex; align-items: center; justify-content: center; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 18pt; font-weight: 800; }
.joints { margin: 2pt 0 6pt 9pt; font-size: 8.5pt; }
.joints .etiquette { display: inline; margin-right: 4pt; }
.preambule { margin: 4pt 0 4pt 0; padding: 7pt 10pt; border: 0.75pt solid ${TRAIT}; border-radius: 8pt; font-size: 8pt; line-height: 1.35; color: ${SECONDAIRE}; }
.preambule p { margin: 2pt 0; }
.notes { margin-top: 12pt; padding-top: 6pt; border-top: 0.75pt solid ${FILET}; font-size: 7.5pt; line-height: 1.35; color: ${SECONDAIRE}; }
.notes p { margin: 1.5pt 0; }
.signatures { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; margin-top: 8pt; break-inside: avoid; page-break-inside: avoid; }
.signature { border: 1.1pt solid ${PIN}; border-radius: 9pt; padding: 9pt 11pt; min-height: 80pt; }
.signature .qui { font-weight: 700; color: ${PIN}; margin-bottom: 4pt; }
.signature .niveau { font-size: 7pt; color: ${SECONDAIRE}; }
.signature .nom { margin-top: 6pt; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 12pt; font-weight: 800; color: ${PIN}; }
.saut { break-before: page; page-break-before: always; }
table { width: 100%; border-collapse: collapse; margin: 6pt 0; font-size: 8pt; }
th, td { border: 0.75pt solid ${TRAIT}; padding: 3pt 5pt; text-align: left; vertical-align: top; }
th { color: ${PIN}; font-weight: 700; }
h2 { margin: 12pt 0 3pt 0; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 12pt; font-weight: 800; color: ${PIN}; break-after: avoid; page-break-after: avoid; }
h3 { margin: 9pt 0 2pt 0; font-size: 9.75pt; font-weight: 700; color: ${PIN}; break-after: avoid; page-break-after: avoid; }
h4 { margin: 7pt 0 2pt 0; font-size: 9.75pt; font-weight: 600; color: ${PIN}; break-after: avoid; page-break-after: avoid; }
.projet { font-weight: 600; color: ${PIN}; }
.pieces { margin-top: 8pt; }
.piece { display: flex; gap: 10pt; padding: 8pt 0; border-top: 0.75pt solid ${FILET}; break-inside: avoid; page-break-inside: avoid; }
.lettre-piece { font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 18pt; font-weight: 800; color: ${PIN}; min-width: 20pt; line-height: 1; }
.contenu-piece { flex: 1; }
.intitule-piece { font-weight: 700; color: ${PIN}; margin-bottom: 2pt; }
.sous-piece, .joint { padding: 1pt 0; }
.nom-diag { color: ${TEXTE}; }
.manquant { font-weight: 700; color: ${PIN}; text-decoration: underline; text-decoration-style: double; }
.alerte { border-width: 2pt; }
.alerte .manquant { padding: 1pt 0; text-decoration: none; }
</style></head><body>
<div class="entete"><div class="marque"><span class="logo">${LOGO}</span>Baillome</div><span class="mono reference">${html(reference)}</span></div>
${corps}
<div class="pied mono"><span>${piedGauche}</span><span>${piedDroite}</span></div>
</body></html>`;
}
