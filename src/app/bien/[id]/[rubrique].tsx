import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  RubriqueAssurances,
  RubriqueEnergie,
  RubriqueEquipements,
  RubriqueIdentite,
  RubriqueNotes,
  RubriqueSurfaces,
} from '@/components/fiche/rubriques';
import { Icone } from '@/components/icones';
import { useFiche } from '@/lib/biens';
import { couleurs, polices } from '@/theme/tokens';

const RUBRIQUES = {
  identite: { titre: 'Identité du bien', Composant: RubriqueIdentite },
  surfaces: { titre: 'Surfaces et pièces', Composant: RubriqueSurfaces },
  energie: { titre: 'Énergie', Composant: RubriqueEnergie },
  equipements: { titre: 'Équipements', Composant: RubriqueEquipements },
  assurances: { titre: 'Assurances', Composant: RubriqueAssurances },
  notes: { titre: 'Notes', Composant: RubriqueNotes },
} as const;

/** Une rubrique de la fiche du bien, à compléter et enregistrer. */
export default function EcranRubrique() {
  const { id, rubrique } = useLocalSearchParams<{ id: string; rubrique: string }>();
  const { fiche, recharger } = useFiche(id);
  const r = RUBRIQUES[rubrique as keyof typeof RUBRIQUES];

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace(`/bien/${id}`))}
            style={styles.retour}
            accessibilityRole="button"
            accessibilityLabel="Retour à la fiche du bien">
            <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
          </Pressable>
          {fiche ? (
            <Text style={styles.legende}>
              BIEN N° {String(fiche.bien.numero).padStart(2, '0')}
              {fiche.bien.commune ? ` · ${fiche.bien.commune.toUpperCase()}` : ''}
            </Text>
          ) : null}
          <Text style={styles.titre} accessibilityRole="header">
            {r?.titre ?? 'Rubrique introuvable'}
          </Text>
          {/* La rubrique ne s'affiche qu'une fois la fiche chargée : ses champs partent des valeurs enregistrées. */}
          {fiche && r ? <r.Composant fiche={fiche} onEnregistre={recharger} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, paddingBottom: 40, gap: 12 },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legende: { fontFamily: polices.technique, fontSize: 11, letterSpacing: 0.66, color: couleurs.texteDiscret },
  titre: {
    fontFamily: polices.titreFort,
    fontSize: 28,
    letterSpacing: -1.1,
    lineHeight: 30,
    color: couleurs.texte,
    marginBottom: 6,
  },
});
