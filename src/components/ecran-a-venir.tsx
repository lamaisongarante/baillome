import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { arrondis, couleurs, espaces, polices } from '@/theme/tokens';

type Props = {
  titre: string;
  /** Ce que l'écran permettra de faire, en une phrase. */
  promesse: string;
  /** Étape du plan de développement où l'écran sera construit. */
  etape: string;
};

/** Écran provisoire, en attendant que l'onglet soit construit. */
export function EcranAVenir({ titre, promesse, etape }: Props) {
  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.titre}>{titre}</Text>
        <View style={styles.carte}>
          <Text style={styles.legende}>{etape.toUpperCase()}</Text>
          <Text style={styles.texte}>{promesse}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },
  contenu: {
    padding: espaces.l,
    gap: espaces.m,
  },
  titre: {
    fontFamily: polices.titre,
    fontSize: 34,
    color: couleurs.texte,
  },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.tuile,
    padding: espaces.l,
    gap: espaces.s,
  },
  legende: {
    fontFamily: polices.technique,
    fontSize: 11,
    letterSpacing: 1,
    color: couleurs.texteDiscret,
  },
  texte: {
    fontFamily: polices.interface,
    fontSize: 16,
    lineHeight: 23,
    color: couleurs.texte,
  },
});
