import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonPrincipal, CaseACocher, LienTexte, MessageErreur } from '@/components/formulaire';
import { CONSENTEMENTS_REQUIS, useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

/**
 * Affiché quand un texte a changé de version (ou n'a pas encore été accepté) :
 * le bailleur accepte la nouvelle version avant de retrouver son espace.
 */
export default function Consentement() {
  const { verifierConsentements } = useSession();
  const [cgu, setCgu] = useState(false);
  const [confidentialite, setConfidentialite] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function accepter() {
    if (!cgu || !confidentialite) return setErreur('Cochez les deux cases pour continuer.');
    setOccupe(true);
    const { error } = await supabase.from('consentements').insert([...CONSENTEMENTS_REQUIS]);
    if (error) {
      setOccupe(false);
      return setErreur('L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.');
    }
    await verifierConsentements();
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.titre} accessibilityRole="header">
          Nos conditions{'\n'}évoluent
        </Text>
        <Text style={styles.texte}>
          Pour continuer à utiliser Baillome, merci de prendre connaissance des textes ci-dessous.
        </Text>
        <View style={styles.cases}>
          <CaseACocher
            cochee={cgu}
            onChange={setCgu}
            libelleAccessible="J’accepte les conditions générales d’utilisation et de vente">
            J’accepte les{' '}
            <LienTexte href="/juridique/cgu">conditions générales d’utilisation et de vente</LienTexte>.
          </CaseACocher>
          <CaseACocher
            cochee={confidentialite}
            onChange={setConfidentialite}
            libelleAccessible="J’ai pris connaissance de la politique de confidentialité">
            J’ai pris connaissance de la{' '}
            <LienTexte href="/juridique/confidentialite">politique de confidentialité</LienTexte>.
          </CaseACocher>
        </View>
        <MessageErreur message={erreur} />
        <View style={styles.espace} />
        <BoutonPrincipal libelle="Continuer" onPress={accepter} occupe={occupe} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, gap: 16 },
  titre: {
    marginTop: 12,
    fontFamily: polices.titreFort,
    fontSize: 28,
    letterSpacing: -1.1,
    lineHeight: 30,
    color: couleurs.texte,
  },
  texte: { fontFamily: polices.interface, fontSize: 14.5, lineHeight: 21, color: couleurs.texteSecondaire },
  cases: { gap: 6 },
  espace: { flexGrow: 1, minHeight: 8 },
});
