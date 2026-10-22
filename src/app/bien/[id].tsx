import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icone } from '@/components/icones';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

type Bien = {
  numero: number;
  type_bien: string;
  adresse: string | null;
  code_postal: string | null;
  commune: string | null;
};

/** Fiche du bien : version provisoire, la fiche complète arrive au morceau 1d. */
export default function FicheBien() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bien, setBien] = useState<Bien | null>(null);

  useEffect(() => {
    supabase
      .from('biens')
      .select('numero, type_bien, adresse, code_postal, commune')
      .eq('id', id)
      .single()
      .then(({ data }) => setBien(data));
  }, [id]);

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.retour}
          accessibilityRole="button"
          accessibilityLabel="Retour">
          <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
        </Pressable>
        {bien ? (
          <>
            <Text style={styles.legende}>BIEN N° {String(bien.numero).padStart(2, '0')}</Text>
            <Text style={styles.titre}>{bien.adresse}</Text>
            <Text style={styles.texte}>
              {bien.code_postal} {bien.commune}
            </Text>
            <View style={styles.carte}>
              <Text style={styles.legende}>ÉTAPE 1 · LE SOCLE</Text>
              <Text style={styles.texte}>La fiche complète du bien arrive très bientôt.</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: 22, gap: 12 },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legende: { fontFamily: polices.technique, fontSize: 11, letterSpacing: 0.66, color: couleurs.texteDiscret },
  titre: { fontFamily: polices.titreFort, fontSize: 26, letterSpacing: -0.9, color: couleurs.texte },
  texte: { fontFamily: polices.interface, fontSize: 14.5, lineHeight: 21, color: couleurs.texteSecondaire },
  carte: { backgroundColor: couleurs.carte, borderRadius: 26, padding: 20, gap: 8, marginTop: 8 },
});
