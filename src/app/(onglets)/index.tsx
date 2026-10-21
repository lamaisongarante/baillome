import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { arrondis, couleurs, espaces, polices } from '@/theme/tokens';

export default function Accueil() {
  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.entete}>
          <Text style={styles.marque}>Baillome</Text>
          {/* L'avatar mènera au compte (étape 1). */}
          <View style={styles.avatar}>
            <Text style={styles.initiale}>S</Text>
          </View>
        </View>

        <BandeauPin>
          <Text style={styles.bonjour}>Bonjour</Text>
          <Text style={styles.accroche}>
            Votre gestion locative, en règle et sans stress.
          </Text>
          <View style={styles.pastilleOk}>
            <Text style={styles.pastilleOkTexte}>OK</Text>
          </View>
        </BandeauPin>

        <View style={styles.carte}>
          <Text style={styles.legende}>ÉTAPE 0 · PRÉPARATION</Text>
          <Text style={styles.texte}>
            Ceci est la toute première version de l’application. Les onglets sont en place ; leur
            contenu arrive étape par étape.
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
    gap: espaces.l,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marque: {
    fontFamily: polices.titre,
    fontSize: 28,
    color: couleurs.pin,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: arrondis.pilule,
    backgroundColor: couleurs.pin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initiale: {
    fontFamily: polices.interfaceGras,
    color: couleurs.surPin,
    fontSize: 16,
  },
  bonjour: {
    fontFamily: polices.titre,
    fontSize: 40,
    color: couleurs.surPin,
  },
  accroche: {
    fontFamily: polices.interface,
    fontSize: 17,
    lineHeight: 24,
    color: couleurs.surPin,
  },
  pastilleOk: {
    alignSelf: 'flex-start',
    backgroundColor: couleurs.citron,
    borderRadius: arrondis.pilule,
    paddingHorizontal: espaces.m,
    paddingVertical: espaces.xs,
  },
  pastilleOkTexte: {
    fontFamily: polices.interfaceGras,
    color: couleurs.pin,
    fontSize: 13,
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
