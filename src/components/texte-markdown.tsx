import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { couleurs, polices } from '@/theme/tokens';

/**
 * Affiche un texte juridique écrit en Markdown simple (titres, paragraphes,
 * listes, tableaux, gras). Le texte est affiché tel quel : on n'en modifie
 * aucun mot, on ne fait que la mise en forme.
 */
export function TexteMarkdown({ source }: { source: string }) {
  return <View style={styles.texte}>{decouper(source).map(afficherBloc)}</View>;
}

type Bloc =
  | { type: 'titre'; niveau: number; texte: string }
  | { type: 'paragraphe'; lignes: string[] }
  | { type: 'liste'; elements: string[] }
  | { type: 'tableau'; entete: string[]; lignes: string[][] };

function decouper(source: string): Bloc[] {
  const blocs: Bloc[] = [];
  const lignes = source.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lignes.length) {
    const ligne = lignes[i];
    if (!ligne.trim()) {
      i++;
      continue;
    }
    const titre = ligne.match(/^(#{1,6})\s+(.*)$/);
    if (titre) {
      blocs.push({ type: 'titre', niveau: titre[1].length, texte: titre[2] });
      i++;
      continue;
    }
    if (ligne.trimStart().startsWith('|')) {
      const rangs: string[][] = [];
      while (i < lignes.length && lignes[i].trimStart().startsWith('|')) {
        const cellules = lignes[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        if (!cellules.every((c) => /^:?-{3,}:?$/.test(c))) rangs.push(cellules);
        i++;
      }
      blocs.push({ type: 'tableau', entete: rangs[0] ?? [], lignes: rangs.slice(1) });
      continue;
    }
    if (/^[-*]\s+/.test(ligne)) {
      const elements: string[] = [];
      while (i < lignes.length && /^[-*]\s+/.test(lignes[i])) {
        elements.push(lignes[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      blocs.push({ type: 'liste', elements });
      continue;
    }
    const paragraphe: string[] = [];
    while (
      i < lignes.length &&
      lignes[i].trim() &&
      !/^#{1,6}\s/.test(lignes[i]) &&
      !/^[-*]\s+/.test(lignes[i]) &&
      !lignes[i].trimStart().startsWith('|')
    ) {
      paragraphe.push(lignes[i]);
      i++;
    }
    blocs.push({ type: 'paragraphe', lignes: paragraphe });
  }
  return blocs;
}

/** Met en gras les passages entre ** **. */
function enLigne(texte: string, cle: string) {
  return texte.split(/(\*\*[^*]+\*\*)/g).map((morceau, i) =>
    morceau.startsWith('**') && morceau.endsWith('**') ? (
      <Text key={`${cle}-${i}`} style={styles.gras}>
        {morceau.slice(2, -2)}
      </Text>
    ) : (
      <Fragment key={`${cle}-${i}`}>{morceau}</Fragment>
    ),
  );
}

function afficherBloc(bloc: Bloc, index: number) {
  const cle = `b${index}`;
  switch (bloc.type) {
    case 'titre':
      return (
        <Text key={cle} accessibilityRole="header" style={bloc.niveau === 1 ? styles.titre1 : styles.titre2}>
          {enLigne(bloc.texte, cle)}
        </Text>
      );
    case 'paragraphe':
      return (
        <Text key={cle} style={styles.paragraphe}>
          {bloc.lignes.map((l, i) => (
            <Fragment key={i}>
              {i > 0 ? '\n' : null}
              {enLigne(l, `${cle}-${i}`)}
            </Fragment>
          ))}
        </Text>
      );
    case 'liste':
      return (
        <View key={cle} style={styles.liste}>
          {bloc.elements.map((e, i) => (
            <View key={i} style={styles.elementListe}>
              <Text style={styles.puce}>•</Text>
              <Text style={styles.texteListe}>{enLigne(e, `${cle}-${i}`)}</Text>
            </View>
          ))}
        </View>
      );
    case 'tableau':
      // Sur téléphone, chaque ligne du tableau devient une petite carte.
      return (
        <View key={cle} style={styles.tableau}>
          {bloc.lignes.map((ligne, i) => (
            <View key={i} style={styles.carteLigne}>
              {ligne.map((cellule, j) => (
                <View key={j} style={styles.cellule}>
                  <Text style={styles.enteteCellule}>{bloc.entete[j]?.toUpperCase()}</Text>
                  <Text style={styles.texteCellule}>{enLigne(cellule, `${cle}-${i}-${j}`)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  texte: { gap: 12 },
  titre1: {
    fontFamily: polices.titreFort,
    fontSize: 26,
    letterSpacing: -0.8,
    lineHeight: 29,
    color: couleurs.texte,
  },
  titre2: {
    marginTop: 8,
    fontFamily: polices.titre,
    fontSize: 18,
    letterSpacing: -0.4,
    lineHeight: 23,
    color: couleurs.texte,
  },
  paragraphe: { fontFamily: polices.interface, fontSize: 14.5, lineHeight: 22, color: couleurs.texteSecondaire },
  gras: { fontFamily: polices.interfaceTresGras, color: couleurs.texte },
  liste: { gap: 8 },
  elementListe: { flexDirection: 'row', gap: 8 },
  puce: { fontFamily: polices.interfaceTresGras, color: couleurs.pin, lineHeight: 22 },
  texteListe: { flex: 1, fontFamily: polices.interface, fontSize: 14.5, lineHeight: 22, color: couleurs.texteSecondaire },
  tableau: { gap: 8 },
  carteLigne: { backgroundColor: couleurs.carte, borderRadius: 18, padding: 14, gap: 8 },
  cellule: { gap: 2 },
  enteteCellule: { fontFamily: polices.techniqueGras, fontSize: 10, color: couleurs.texteDiscret },
  texteCellule: { fontFamily: polices.interface, fontSize: 13.5, lineHeight: 19, color: couleurs.texte },
});
