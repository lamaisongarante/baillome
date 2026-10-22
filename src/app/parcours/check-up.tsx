import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonPrincipal, EnTeteEtape } from '@/components/formulaire';
import { couleurs, polices } from '@/theme/tokens';

/**
 * Étape 4 sur 4 : premier résultat du check-up. Le moteur de conformité
 * arrive à l'étape 2 du développement : en attendant, écran d'attente.
 */
export default function CheckUp() {
  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <EnTeteEtape etape={4} total={4} titre={'Votre bien\nest enregistré'} />
        <View style={styles.carte}>
          <View style={styles.pastille}>
            <Text style={styles.pastilleTexte}>OK</Text>
          </View>
          <Text style={styles.texte}>
            Votre check-up de conformité arrive très bientôt dans Baillome. Il vérifiera votre bien et
            vous donnera un score sur 100, avec les points à traiter en priorité.
          </Text>
        </View>
        <View style={styles.espace} />
        <BoutonPrincipal libelle="Découvrir mon espace" onPress={() => router.replace('/')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, gap: 16 },
  carte: { backgroundColor: couleurs.carte, borderRadius: 26, padding: 20, gap: 12 },
  pastille: {
    alignSelf: 'flex-start',
    backgroundColor: couleurs.citron,
    borderRadius: 13,
    paddingHorizontal: 10,
    height: 26,
    justifyContent: 'center',
  },
  pastilleTexte: { fontFamily: polices.techniqueGras, fontSize: 11, color: couleurs.pin },
  texte: { fontFamily: polices.interface, fontSize: 14.5, lineHeight: 21, color: couleurs.texteSecondaire },
  espace: { flexGrow: 1 },
});
