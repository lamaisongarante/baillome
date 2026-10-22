// Notice d'information (annexe C du bail) en HTML imprimable, à partir de la
// copie exacte de Légifrance (contenus/officiels). Le texte est reproduit sans
// aucune modification ; seule la mise en page est propre à Baillome.
// Conventions de la copie : voir contenus/officiels/LISEZ-MOI.md.
import { TEXTES_OFFICIELS } from '../../contenus/textes-officiels.ts';
import { html } from './commun.ts';

/** Paragraphes de la notice (blocs séparés par une ligne vide). */
export function paragraphesNotice(fichier: string): string[] {
  const texte = TEXTES_OFFICIELS[fichier]?.texte;
  if (!texte) throw new Error(`Notice introuvable : ${fichier}`);
  return texte.split('\n\n').map((p) => p.replace(/\n$/, ''));
}

/** Tableau de la copie (« | a | b | ») : une ligne plus courte que l'en-tête étend sa dernière cellule. */
function tableau(bloc: string): string {
  const lignes = bloc
    .split('\n')
    .filter((l) => !/^\|( --- \|)+$/.test(l))
    .map((l) => l.replace(/^\| /, '').replace(/ \|$/, '').split(' | '));
  const colonnes = lignes[0].length;
  return `<table>${lignes
    .map((cellules, i) => {
      const balise = i === 0 ? 'th' : 'td';
      return `<tr>${cellules
        .map((c, j) => {
          const etendue = j === cellules.length - 1 ? colonnes - cellules.length + 1 : 1;
          return `<${balise}${etendue > 1 ? ` colspan="${etendue}"` : ''}>${html(c)}</${balise}>`;
        })
        .join('')}</tr>`;
    })
    .join('')}</table>`;
}

/** Corps HTML de la notice, à placer après le bail (nouvelle page). */
export function htmlNotice(fichier: string): string {
  const paragraphes = paragraphesNotice(fichier);
  const [titre, ...suite] = paragraphes;
  // Le sommaire va jusqu'au second « Préambule », où commence le texte.
  const debutTexte = suite.indexOf('Préambule', 1);
  const sommaire = suite.slice(0, debutTexte);
  const texte = suite.slice(debutTexte);

  const corps: string[] = [`<div class="cartouche"><div>
<div class="mono sur-titre">ANNEXE C · NOTICE D’INFORMATION · ARRÊTÉ DU 29 MAI 2015</div>
<h1>${html(titre)}</h1></div></div>`];
  corps.push(`<div class="encadre">${sommaire.map((s) => `<p>${html(s)}</p>`).join('')}</div>`);
  for (const p of texte) {
    if (p.startsWith('|')) {
      corps.push(tableau(p));
      continue;
    }
    const numero = p.match(/^(\d+(?:\.\d+)*)\.\s/);
    if (p === 'Préambule' || (numero && p.length < 160)) {
      const profondeur = numero ? numero[1].split('.').length : 1;
      const balise = profondeur === 1 ? 'h2' : profondeur === 2 ? 'h3' : 'h4';
      corps.push(`<${balise}>${html(p)}</${balise}>`);
    } else if (/^\(\d+\)\s/.test(p)) {
      corps.push(`<div class="notes"><p>${html(p)}</p></div>`);
    } else {
      corps.push(`<p${p.startsWith('- ') ? ' class="tiret"' : ''}>${html(p)}</p>`);
    }
  }
  return corps.join('\n');
}
