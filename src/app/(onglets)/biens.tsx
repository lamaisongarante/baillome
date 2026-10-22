import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonAjouterBien, CarteBien, COLONNES_RESUME, type BienResume } from '@/components/carte-bien';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

/** Onglet Biens : tous les biens du bailleur. */
export default function Biens() {
  const [biens, setBiens] = useState<BienResume[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('biens')
        .select(COLONNES_RESUME)
        .order('numero')
        .then(({ data }) => setBiens(data ?? []));
    }, []),
  );

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.titre} accessibilityRole="header">
          Mes biens
        </Text>
        {biens?.length === 0 ? (
          <Text style={styles.texte}>Ajoutez votre premier bien pour commencer.</Text>
        ) : null}
        {biens?.map((b) => <CarteBien key={b.id} bien={b} />)}
        <BoutonAjouterBien />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: 24, gap: 12 },
  titre: { fontFamily: polices.titre, fontSize: 30, letterSpacing: -0.9, color: couleurs.texte, marginBottom: 4 },
  texte: { fontFamily: polices.interface, fontSize: 14.5, color: couleurs.texteSecondaire },
});
