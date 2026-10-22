import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { LogoTuile } from '@/components/logo';
import { couleurs, polices } from '@/theme/tokens';

/** Les six fonctions présentées en tuiles (spec étape 1, § 1 ; maquette 13). */
const FONCTIONS = [
  { titre: 'Conformité vérifiée', texte: 'DPE, diagnostics, dépôt, révision : un score sur 100' },
  { titre: 'Baux rédigés et signés', texte: 'Conformes à la loi, signés en ligne' },
  { titre: 'États des lieux interactifs', texte: 'Détaillés, photographiés, signés sur place' },
  { titre: 'Loyers suivis de A à Z', texte: 'Quittances, révisions, charges, relances' },
  { titre: 'Déclaration fiscale', texte: 'Les cases à remplir, montants prêts' },
  { titre: 'Documents et échéances', texte: 'Tout rangé au même endroit, rappels automatiques' },
];

/** Écran de bienvenue, d'après la maquette 13. */
export default function Bienvenue() {
  const marges = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  return (
    <BandeauPin style={styles.page}>
      <ScrollView
        contentContainerStyle={[
          styles.contenu,
          { paddingTop: marges.top + 26, paddingBottom: marges.bottom + 20 },
        ]}>
        <View style={styles.marque}>
          <LogoTuile taille={52} />
          <Text style={styles.logotype}>Baillome</Text>
        </View>

        <Text style={styles.promesse} accessibilityRole="header">
          Louer en règle,{'\n'}l’esprit <Text style={styles.citron}>tranquille.</Text>
        </Text>
        <Text style={styles.sousTitre}>
          L’application des propriétaires qui gèrent eux-mêmes, et qui veulent bien faire.
        </Text>

        <View style={styles.tuiles}>
          {FONCTIONS.map((f, i) => (
            <View key={f.titre} style={styles.tuile}>
              <Text style={styles.numero}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.tuileTitre}>{f.titre}</Text>
              <Text style={styles.tuileTexte}>{f.texte}</Text>
            </View>
          ))}
        </View>

        <View style={styles.espace} />

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push('/inscription')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.boutonCitron, pressed && styles.appuye]}>
            <Text style={styles.boutonCitronTexte}>Créer mon compte</Text>
          </Pressable>
          {/* « Continuer avec Apple ou Google » : ajouté quand les comptes développeur existeront. */}
          <Pressable
            onPress={() => router.push('/connexion')}
            accessibilityRole="button"
            style={styles.lienConnexion}>
            <Text style={styles.dejaCompte}>
              J’ai déjà un compte · <Text style={styles.meConnecter}>Me connecter</Text>
            </Text>
          </Pressable>
        </View>

        <Text style={styles.mention}>CONÇU PAR LA MAISON GARANTE · AGENCE IMMOBILIÈRE DU VAR</Text>
      </ScrollView>
    </BandeauPin>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  contenu: { flexGrow: 1, paddingHorizontal: 26 },
  marque: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logotype: {
    fontFamily: polices.titreFort,
    fontSize: 30,
    letterSpacing: -1.2,
    color: couleurs.surPin,
  },
  promesse: {
    marginTop: 30,
    fontFamily: polices.titreFort,
    fontSize: 40,
    letterSpacing: -1.8,
    lineHeight: 41,
    color: couleurs.surPin,
  },
  citron: { color: couleurs.citron },
  sousTitre: {
    marginTop: 14,
    fontFamily: polices.interface,
    fontSize: 15,
    lineHeight: 22.5,
    color: couleurs.surPinDoux,
  },
  tuiles: { marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tuile: {
    width: '48.5%',
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: couleurs.pinClair,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  numero: { fontFamily: polices.technique, fontSize: 9.5, color: couleurs.citron },
  tuileTitre: {
    fontFamily: polices.interfaceTresGras,
    fontSize: 13,
    lineHeight: 15.6,
    color: couleurs.surPin,
  },
  tuileTexte: { fontFamily: polices.interface, fontSize: 11, lineHeight: 14.3, color: couleurs.surPinDiscret },
  espace: { flexGrow: 1, minHeight: 24 },
  actions: { gap: 10 },
  boutonCitron: {
    height: 56,
    borderRadius: 28,
    backgroundColor: couleurs.citron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appuye: { opacity: 0.85 },
  boutonCitronTexte: { fontFamily: polices.interfaceTresGras, fontSize: 16, color: couleurs.pin },
  lienConnexion: { paddingVertical: 10, alignItems: 'center' },
  dejaCompte: { fontFamily: polices.interface, fontSize: 13.5, color: couleurs.surPinDoux },
  meConnecter: { fontFamily: polices.interfaceTresGras, color: couleurs.citron },
  mention: {
    marginTop: 18,
    textAlign: 'center',
    fontFamily: polices.technique,
    fontSize: 9.5,
    letterSpacing: 0.57,
    color: couleurs.pointillesFort,
  },
});
