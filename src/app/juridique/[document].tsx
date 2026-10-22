import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icone } from '@/components/icones';
import { TexteMarkdown } from '@/components/texte-markdown';
import { textesJuridiques, type DocumentJuridique } from '@/contenus/textes-juridiques';
import { couleurs, polices } from '@/theme/tokens';

/** Page d'un texte juridique : CGU, politique de confidentialité, mentions légales. */
export default function PageJuridique() {
  const { document } = useLocalSearchParams<{ document: string }>();
  const texte = textesJuridiques[document as DocumentJuridique];

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <View style={styles.barre}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.retour}
          accessibilityRole="button"
          accessibilityLabel="Retour">
          <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.contenu}>
        {texte ? (
          <>
            <View style={[styles.statut, !texte.statut && styles.statutValide]}>
              <Text style={styles.statutTexte}>
                {(texte.statut ?? 'Version en vigueur').toUpperCase()} · VERSION {texte.version}
              </Text>
            </View>
            <TexteMarkdown source={texte.texte} />
          </>
        ) : (
          <Text style={styles.introuvable}>Ce document est introuvable.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  barre: { paddingHorizontal: 22, paddingTop: 8 },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenu: { padding: 22, paddingBottom: 48, gap: 16 },
  statut: {
    alignSelf: 'flex-start',
    backgroundColor: couleurs.miel,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statutValide: { backgroundColor: couleurs.menthe },
  statutTexte: { fontFamily: polices.techniqueGras, fontSize: 10.5, color: couleurs.texteMiel },
  introuvable: { fontFamily: polices.interface, fontSize: 15, color: couleurs.texteSecondaire },
});
