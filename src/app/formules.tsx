import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { Icone } from '@/components/icones';
import { supabase } from '@/lib/supabase';
import { couleurs, ombreUrgente, polices } from '@/theme/tokens';

/** Descriptions de la maquette 16 (les prix et limites viennent de la base). */
const DESCRIPTIONS: Record<string, string> = {
  decouverte: 'Pour 1 bien : check-up complet, quittances et suivi des loyers. Signature à l’unité.',
  essentiel: 'Jusqu’à 3 biens : baux et états des lieux signés, loyers, déclaration fiscale.',
  gestion: 'Jusqu’à 10 biens : impayés automatisés, pilotage, accès partagé.',
  patrimoine: 'Biens illimités, organisation par entité, accompagnement prioritaire.',
};
const CONSEILLEE = 'essentiel';

type Formule = {
  code: string;
  libelle: string;
  prix_mensuel_centimes: number | null;
  prix_annuel_centimes: number | null;
};

function prix(centimes: number | null) {
  if (!centimes) return '0 €';
  const euros = centimes / 100;
  return `${euros.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(euros) ? 0 : 2 })} €`;
}

/** Choix de la formule, d'après la maquette 16. Le paiement arrive à l'étape 7. */
export default function Formules() {
  const marges = useSafeAreaInsets();
  const [annuel, setAnnuel] = useState(true);
  const [formules, setFormules] = useState<Formule[]>([]);
  const [actuelle, setActuelle] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  useEffect(() => {
    supabase
      .from('formules')
      .select('code, libelle, prix_mensuel_centimes, prix_annuel_centimes')
      .order('ordre')
      .then(({ data }) => setFormules(data ?? []));
    supabase
      .from('profils')
      .select('formule')
      .single()
      .then(({ data }) => setActuelle(data?.formule ?? null));
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: marges.bottom + 24 }}>
      <BandeauPin style={[styles.bandeau, { paddingTop: marges.top + 12 }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.retour}
          accessibilityRole="button"
          accessibilityLabel="Retour">
          <Icone nom="retour" couleur={couleurs.surPin} taille={20} epaisseur={2} />
        </Pressable>
        <Text style={styles.legende}>VOTRE FORMULE</Text>
        <Text style={styles.titre} accessibilityRole="header">
          Choisissez votre{'\n'}tranquillité.
        </Text>
        <View style={styles.bascule} accessibilityRole="radiogroup" accessibilityLabel="Facturation">
          {[
            { v: false, l: 'Mensuel' },
            { v: true, l: 'Annuel · 2 mois offerts' },
          ].map((o) => (
            <Pressable
              key={o.l}
              onPress={() => setAnnuel(o.v)}
              accessibilityRole="radio"
              accessibilityState={{ checked: annuel === o.v }}
              style={[styles.choix, annuel === o.v && styles.choixActif]}>
              <Text style={[styles.choixTexte, annuel === o.v && styles.choixTexteActif]}>{o.l}</Text>
            </Pressable>
          ))}
        </View>
      </BandeauPin>

      <View style={styles.liste}>
        {formules.map((f) => {
          const conseillee = f.code === CONSEILLEE;
          const gratuite = !f.prix_mensuel_centimes;
          return (
            <View key={f.code} style={[styles.carte, conseillee && styles.carteConseillee]}>
              <View style={styles.ligne}>
                <View style={styles.nom}>
                  <Text style={styles.libelle}>{f.libelle}</Text>
                  {conseillee ? (
                    <View style={styles.pastille}>
                      <Text style={styles.pastilleTexte}>CONSEILLÉE</Text>
                    </View>
                  ) : null}
                  {actuelle === f.code ? (
                    <View style={[styles.pastille, styles.pastilleActuelle]}>
                      <Text style={styles.pastilleTexte}>ACTUELLE</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.prix}>
                  {prix(annuel ? f.prix_annuel_centimes : f.prix_mensuel_centimes)}
                  {gratuite ? null : <Text style={styles.par}> {annuel ? '/ an' : '/ mois'}</Text>}
                </Text>
              </View>
              <Text style={styles.description}>{DESCRIPTIONS[f.code]}</Text>
            </View>
          );
        })}

        <View style={styles.bientot}>
          <Text style={styles.bientotTexte}>
            Le changement de formule en ligne arrive bientôt. Votre formule actuelle reste active.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  bandeau: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 10,
  },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.pinClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legende: { fontFamily: polices.technique, fontSize: 10.5, letterSpacing: 0.63, color: couleurs.surPinDiscret },
  titre: {
    fontFamily: polices.titreFort,
    fontSize: 27,
    letterSpacing: -0.95,
    lineHeight: 28,
    color: couleurs.surPin,
  },
  bascule: {
    marginTop: 6,
    flexDirection: 'row',
    backgroundColor: couleurs.pinClair,
    borderRadius: 26,
    padding: 5,
    gap: 4,
  },
  choix: { flex: 1, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  choixActif: { backgroundColor: couleurs.citron },
  choixTexte: { fontFamily: polices.interfaceGras, fontSize: 13.5, color: couleurs.surPin },
  choixTexteActif: { fontFamily: polices.interfaceTresGras, color: couleurs.pin },
  liste: { padding: 18, gap: 12 },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: 26,
    padding: 18,
    gap: 8,
    borderWidth: 2,
    borderColor: couleurs.transparent,
  },
  carteConseillee: { borderColor: couleurs.pin, ...ombreUrgente },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  nom: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, flexWrap: 'wrap' },
  libelle: { fontFamily: polices.interfaceTresGras, fontSize: 17, color: couleurs.texte },
  pastille: { backgroundColor: couleurs.citron, borderRadius: 11, paddingHorizontal: 8, height: 22, justifyContent: 'center' },
  pastilleActuelle: { backgroundColor: couleurs.menthe },
  pastilleTexte: { fontFamily: polices.techniqueGras, fontSize: 9.5, color: couleurs.pin },
  prix: { fontFamily: polices.titreFort, fontSize: 22, letterSpacing: -0.6, color: couleurs.texte },
  par: { fontFamily: polices.interface, fontSize: 12, letterSpacing: 0, color: couleurs.texteSecondaire },
  description: { fontFamily: polices.interface, fontSize: 13.5, lineHeight: 19, color: couleurs.texteSecondaire },
  bientot: { backgroundColor: couleurs.miel, borderRadius: 18, padding: 14 },
  bientotTexte: { fontFamily: polices.interfaceMoyen, fontSize: 13, lineHeight: 18, color: couleurs.texteMiel },
});
