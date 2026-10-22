import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonPrincipal, EnTeteEtape } from '@/components/formulaire';
import { couleurs, polices } from '@/theme/tokens';

/**
 * Étape 3 sur 4 : scan du bail. La lecture automatique arrive à l'étape 3
 * du développement (décision du 22/10/2026) : pour l'instant, on la passe.
 */
export default function ScanBail() {
  const { bien } = useLocalSearchParams<{ bien?: string }>();
  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <EnTeteEtape etape={3} total={4} titre={'Votre bail,\nscanné en un geste'} />
        <View style={styles.carte}>
          <Text style={styles.legende}>BIENTÔT DISPONIBLE</Text>
          <Text style={styles.texte}>
            Vous pourrez photographier votre bail pour remplir automatiquement la fiche du bien et celle
            de votre locataire. En attendant, vous complétez la fiche à votre rythme.
          </Text>
        </View>
        <View style={styles.espace} />
        <BoutonPrincipal libelle="Passer cette étape" onPress={() => router.replace({ pathname: '/parcours/check-up', params: bien ? { bien } : {} })} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, gap: 16 },
  carte: { backgroundColor: couleurs.carte, borderRadius: 26, padding: 20, gap: 8 },
  legende: { fontFamily: polices.technique, fontSize: 11, letterSpacing: 0.66, color: couleurs.texteDiscret },
  texte: { fontFamily: polices.interface, fontSize: 14.5, lineHeight: 21, color: couleurs.texteSecondaire },
  espace: { flexGrow: 1 },
});
