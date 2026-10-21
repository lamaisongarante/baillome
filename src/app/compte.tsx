import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icone } from '@/components/icones';
import { arrondis, couleurs, espaces, polices } from '@/theme/tokens';

/** Mon compte : ouvert depuis l'avatar de l'accueil. Contenu à l'étape 1. */
export default function Compte() {
  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.retour}
          accessibilityRole="button"
          accessibilityLabel="Retour à l'accueil">
          <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
        </Pressable>
        <Text style={styles.titre}>Mon compte</Text>
        <View style={styles.carte}>
          <Text style={styles.legende}>ÉTAPE 1 · LE SOCLE</Text>
          <Text style={styles.texte}>
            Vos informations, vos entités (nom propre, SCI, indivision) et votre formule
            d’abonnement seront réunies ici.
          </Text>
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
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: {
    fontFamily: polices.titre,
    fontSize: 30,
    letterSpacing: -0.9,
    color: couleurs.texte,
  },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.carteBien,
    padding: 20,
    gap: espaces.s,
  },
  legende: {
    fontFamily: polices.technique,
    fontSize: 11,
    letterSpacing: 0.66,
    color: couleurs.texteDiscret,
  },
  texte: {
    fontFamily: polices.interface,
    fontSize: 14,
    lineHeight: 21,
    color: couleurs.texteSecondaire,
  },
});
