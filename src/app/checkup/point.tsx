import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MessageErreur } from '@/components/formulaire';
import { Icone } from '@/components/icones';
import { FAMILLES, lancerCheckup, LIBELLES_GRAVITE, messageAffiche, type ConstatAffiche } from '@/lib/checkup';
import { boutons } from '@/lib/marche-a-suivre';
import { couleurs, polices } from '@/theme/tokens';

const TEINTES = {
  critique: { fond: couleurs.corail, texte: couleurs.texteCorail },
  important: { fond: couleurs.miel, texte: couleurs.texteMiel },
  conseil: { fond: couleurs.menthe, texte: couleurs.texteMenthe },
  ok: { fond: couleurs.carte, texte: couleurs.texteDiscret },
} as const;

/**
 * Un point à traiter : ce que dit la règle, la marche à suivre et les raccourcis
 * pour mettre à jour la fiche ou le coffre. À chaque retour sur l'écran, le
 * check-up est recalculé : si le point est réglé, on l'annonce.
 */
export default function PointATraiter() {
  const { bien, regle, situation } = useLocalSearchParams<{ bien: string; regle: string; situation: string }>();
  const [constat, setConstat] = useState<ConstatAffiche | null | undefined>(undefined);
  const [erreur, setErreur] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      lancerCheckup(bien)
        .then((r) => setConstat(r.biens[0]?.constats.find((c) => c.regle === regle && c.situation === situation) ?? null))
        .catch(() => setErreur('Le point n’a pas pu être chargé. Vérifiez votre connexion et réessayez.'));
    }, [bien, regle, situation]),
  );

  const etapes = constat ? boutons(bien, regle, situation, constat.valeurs) : [];
  const t = constat ? TEINTES[constat.gravite] : TEINTES.ok;

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Pressable onPress={() => router.back()} style={styles.retour} accessibilityRole="button" accessibilityLabel="Retour">
          <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
        </Pressable>

        {constat === undefined && !erreur ? <ActivityIndicator color={couleurs.pin} style={styles.attente} /> : null}
        <MessageErreur message={erreur} />

        {constat === null ? (
          <View style={styles.regle}>
            <View style={styles.ok}>
              <Text style={styles.okTexte}>OK</Text>
            </View>
            <Text style={styles.titre}>Ce point est réglé</Text>
            <Text style={styles.message}>Votre mise à jour a été prise en compte par le check-up.</Text>
          </View>
        ) : null}

        {constat ? (
          <>
            <View style={[styles.carte, { backgroundColor: t.fond }]}>
              <View style={styles.ligne}>
                <Text style={[styles.legende, { color: t.texte }]}>{LIBELLES_GRAVITE[constat.gravite]}</Text>
                <Text style={[styles.legende, { color: t.texte }]}>{FAMILLES[constat.regle]}</Text>
              </View>
              <Text style={styles.titre} accessibilityRole="header">
                {messageAffiche(constat.titre ?? constat.libelle)}
              </Text>
              <Text style={styles.message}>{messageAffiche(constat.message, constat.valeurs)}</Text>
              {!constat.validee ? <Text style={styles.nonValidee}>RÈGLE NON VALIDÉE · APERÇU</Text> : null}
            </View>

            <Text style={styles.h2}>Marche à suivre</Text>
            <View style={styles.etapes}>
              <View style={styles.etape}>
                <View style={styles.numero}>
                  <Text style={styles.numeroTexte}>1</Text>
                </View>
                <Text style={styles.etapeTexte}>{messageAffiche(constat.action, constat.valeurs)}</Text>
              </View>
              {etapes.map((e, i) => (
                <View key={e.libelle} style={styles.etape}>
                  <View style={styles.numero}>
                    <Text style={styles.numeroTexte}>{i + 2}</Text>
                  </View>
                  <View style={styles.etapeCorps}>
                    <Text style={styles.etapeTexte}>{e.etape}</Text>
                    <Pressable
                      onPress={() =>
                        'lien' in e.cible ? WebBrowser.openBrowserAsync(e.cible.lien) : router.push(e.cible.route)
                      }
                      style={({ pressed }) => [styles.bouton, pressed && styles.appuye]}
                      accessibilityRole={'lien' in e.cible ? 'link' : 'button'}>
                      <Text style={styles.boutonTexte}>{e.libelle}</Text>
                      <Icone nom="fleche" couleur={couleurs.pin} taille={14} epaisseur={2.4} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.astuce}>Revenez ici après votre mise à jour : le check-up se recalcule tout seul.</Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, paddingBottom: 40, gap: 16 },
  retour: { width: 44, height: 44, borderRadius: 22, backgroundColor: couleurs.carte, alignItems: 'center', justifyContent: 'center' },
  attente: { marginTop: 40 },
  carte: { borderRadius: 28, padding: 20, gap: 8 },
  ligne: { flexDirection: 'row', justifyContent: 'space-between' },
  legende: { fontFamily: polices.techniqueGras, fontSize: 11, letterSpacing: 0.66 },
  titre: { fontFamily: polices.titre, fontSize: 22, letterSpacing: -0.5, lineHeight: 26, color: couleurs.texte },
  message: { fontFamily: polices.interface, fontSize: 14.5, lineHeight: 21, color: couleurs.texteSecondaire },
  nonValidee: { fontFamily: polices.technique, fontSize: 9.5, color: couleurs.texteDiscret },
  h2: { marginTop: 8, fontFamily: polices.titre, fontSize: 24, letterSpacing: -0.6, color: couleurs.texte },
  etapes: { gap: 14 },
  etape: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  numero: { width: 28, height: 28, borderRadius: 14, backgroundColor: couleurs.pin, alignItems: 'center', justifyContent: 'center' },
  numeroTexte: { fontFamily: polices.interfaceTresGras, fontSize: 13, color: couleurs.citron },
  etapeCorps: { flex: 1, gap: 8 },
  etapeTexte: { flex: 1, fontFamily: polices.interface, fontSize: 14.5, lineHeight: 21, color: couleurs.texte },
  bouton: {
    alignSelf: 'flex-start',
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.carte,
  },
  appuye: { backgroundColor: couleurs.citron },
  boutonTexte: { fontFamily: polices.interfaceTresGras, fontSize: 14, color: couleurs.pin },
  astuce: { fontFamily: polices.interface, fontSize: 12.5, lineHeight: 18, color: couleurs.texteSecondaire },
  regle: { backgroundColor: couleurs.carte, borderRadius: 28, padding: 22, gap: 10, alignItems: 'flex-start' },
  ok: { height: 26, borderRadius: 13, paddingHorizontal: 10, backgroundColor: couleurs.citron, justifyContent: 'center' },
  okTexte: { fontFamily: polices.techniqueGras, fontSize: 11, color: couleurs.pin },
});
