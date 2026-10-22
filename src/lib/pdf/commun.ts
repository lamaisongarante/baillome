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
  return `<span class="champ">${html(valeur)}</span>`;
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
const LOGO = `<svg width="16" height="16" viewBox="0 0 100 100"><path d="M15 47 L50 18 L85 47" fill="none" stroke="${PIN}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M25 41 V81 H75 V41" fill="none" stroke="${PIN}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><rect x="31" y="51" width="38" height="22" rx="11" fill="none" stroke="${PIN}" stroke-width="7"/><circle cx="58" cy="62" r="7.5" fill="${PIN}"/></svg>`;

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
}: {
  titre: string;
  reference: string;
  piedGauche: string;
  piedDroite: string;
  corps: string;
}): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>${html(titre)}</title>
<link rel="stylesheet" href="${POLICES}">
<style>
@page { size: A4; margin: 16mm 17mm 16mm 17mm; }
* { box-sizing: border-box; }
html, body { margin: 0; background: ${FOND}; }
body { font-family: 'Instrument Sans', Helvetica, Arial, sans-serif; font-size: 10.5px; line-height: 1.5; color: ${TEXTE}; }
.entete { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid ${PIN}; margin-bottom: 14px; }
.marque { display: flex; align-items: center; gap: 7px; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 800; letter-spacing: -0.03em; color: ${PIN}; }
.marque span.logo { width: 24px; height: 24px; border: 1.5px solid ${PIN}; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; }
.mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.08em; }
.reference { font-size: 8.5px; color: ${SECONDAIRE}; }
.pied { margin-top: 18px; display: flex; justify-content: space-between; padding-top: 6px; border-top: 1px solid ${FILET}; font-size: 8px; color: ${SECONDAIRE}; }
.cartouche { border: 1.5px solid ${PIN}; border-radius: 14px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; margin-bottom: 8px; }
.cartouche .sur-titre { font-size: 9px; color: ${SECONDAIRE}; }
.cartouche h1 { margin: 6px 0 0 0; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 19px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: ${PIN}; }
.cartouche .loi { font-size: 8px; line-height: 1.6; color: ${SECONDAIRE}; text-align: right; max-width: 45%; }
.partie { margin-top: 18px; display: flex; align-items: baseline; gap: 12px; border-top: 1px solid ${FILET}; padding-top: 10px; break-after: avoid; page-break-after: avoid; }
.partie .numero { font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.04em; color: ${PIN}; line-height: 1; min-width: 46px; }
.partie .intitule { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em; color: ${PIN}; text-transform: uppercase; }
.rubrique { margin: 10px 0 2px 0; font-weight: 700; color: ${PIN}; break-after: avoid; page-break-after: avoid; }
p { margin: 3px 0; }
p.tiret { padding-left: 12px; text-indent: -12px; }
.champ { border-bottom: 1.5px dotted ${PIN}; padding: 0 2px; font-weight: 600; color: ${PIN}; }
.encadre { border: 1px solid ${TRAIT}; border-radius: 10px; padding: 10px 12px; margin: 8px 0; }
.encadre-fort { border: 1.5px solid ${PIN}; border-radius: 12px; padding: 12px 14px; margin: 10px 0; }
.notes { margin-top: 18px; padding-top: 8px; border-top: 1px solid ${FILET}; font-size: 8.5px; line-height: 1.45; color: ${SECONDAIRE}; }
.notes p { margin: 2px 0; }
.signatures { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 10px; break-inside: avoid; page-break-inside: avoid; }
.signature { border: 1.5px solid ${PIN}; border-radius: 12px; padding: 12px 14px; min-height: 110px; }
.signature .qui { font-weight: 700; color: ${PIN}; margin-bottom: 6px; }
.signature .niveau { font-size: 8.5px; color: ${SECONDAIRE}; }
.signature .nom { margin-top: 8px; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; color: ${PIN}; }
.saut { break-before: page; page-break-before: always; }
table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9px; }
th, td { border: 1px solid ${TRAIT}; padding: 4px 6px; text-align: left; vertical-align: top; }
th { color: ${PIN}; font-weight: 700; }
h2 { margin: 16px 0 4px 0; font-family: 'Bricolage Grotesque', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: ${PIN}; break-after: avoid; page-break-after: avoid; }
h3 { margin: 12px 0 3px 0; font-size: 11px; font-weight: 700; color: ${PIN}; break-after: avoid; page-break-after: avoid; }
h4 { margin: 8px 0 2px 0; font-size: 10.5px; font-weight: 600; color: ${PIN}; break-after: avoid; page-break-after: avoid; }
.projet { font-weight: 600; color: ${PIN}; }
</style></head><body>
<div class="entete"><div class="marque"><span class="logo">${LOGO}</span>Baillome</div><span class="mono reference">${html(reference)}</span></div>
${corps}
<div class="pied mono"><span>${piedGauche}</span><span>${piedDroite}</span></div>
</body></html>`;
}
