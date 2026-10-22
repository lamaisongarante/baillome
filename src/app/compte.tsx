import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icone } from '@/components/icones';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { arrondis, couleurs, espaces, polices } from '@/theme/tokens';

/** Mon compte : ouvert depuis l'avatar de l'accueil. Contenu à l'étape 1. */
const TEXTES: { libelle: string; href: Href }[] = [
  { libelle: 'Conditions générales', href: '/juridique/cgu' },
  { libelle: 'Politique de confidentialité', href: '/juridique/confidentialite' },
  { libelle: 'Mentions légales', href: '/juridique/mentions-legales' },
];

export default function Compte() {
  const { session } = useSession();

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
        <Text style={styles.email}>{session?.user.email}</Text>

        <View style={styles.liste}>
          {TEXTES.map((t) => (
            <Pressable
              key={t.libelle}
              onPress={() => router.push(t.href)}
              style={styles.ligne}
              accessibilityRole="link">
              <Text style={styles.ligneTexte}>{t.libelle}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => supabase.auth.signOut()}
          style={styles.deconnexion}
          accessibilityRole="button">
          <Text style={styles.deconnexionTexte}>Me déconnecter</Text>
        </Pressable>

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
  email: { fontFamily: polices.interface, fontSize: 14, color: couleurs.texteSecondaire, marginTop: -8 },
  liste: { backgroundColor: couleurs.carte, borderRadius: arrondis.tuile, paddingHorizontal: 18 },
  ligne: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: couleurs.piste,
  },
  ligneTexte: { fontFamily: polices.interfaceGras, fontSize: 14.5, color: couleurs.texte },
  chevron: { fontFamily: polices.interfaceGras, fontSize: 20, color: couleurs.texteDiscret },
  deconnexion: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deconnexionTexte: { fontFamily: polices.interfaceTresGras, fontSize: 14.5, color: couleurs.pin },
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
