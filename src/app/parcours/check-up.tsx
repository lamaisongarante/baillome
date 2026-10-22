import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonPrincipal, EnTeteEtape } from '@/components/formulaire';
import { couleurs, polices } from '@/theme/tokens';

/** Étape 4 sur 4 : premier check-up du bien qui vient d'être ajouté. */
export default function CheckUp() {
  const { bien } = useLocalSearchParams<{ bien?: string }>();
  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <EnTeteEtape etape={4} total={4} titre={'Votre bien\nest enregistré'} />
        <View style={styles.carte}>
          <View style={styles.pastille}>
            <Text style={styles.pastilleTexte}>OK</Text>
          </View>
          <Text style={styles.texte}>
            Quelques questions sur votre DPE et vos diagnostics, et Baillome vous dit ce qui est en
            règle et ce qu’il reste à traiter, en commençant par l’urgent.
          </Text>
        </View>
        <View style={styles.espace} />
        {bien ? (
          <BoutonPrincipal libelle="Faire mon premier check-up" onPress={() => router.replace(`/checkup/${bien}`)} />
        ) : null}
        <Pressable onPress={() => router.replace('/')} style={styles.plusTard} accessibilityRole="button">
          <Text style={styles.plusTardTexte}>Plus tard, découvrir mon espace</Text>
        </Pressable>
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
  plusTard: { alignItems: 'center', paddingVertical: 10 },
  plusTardTexte: { fontFamily: polices.interfaceGras, fontSize: 14, color: couleurs.pin },
});
