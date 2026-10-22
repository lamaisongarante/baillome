import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BoutonPrincipal,
  CaseACocher,
  Champ,
  EnTeteEtape,
  LienTexte,
  MessageErreur,
  MessageInfo,
} from '@/components/formulaire';
import { Icone } from '@/components/icones';
import { LONGUEUR_MIN_MOT_DE_PASSE, messageErreurAuth } from '@/lib/erreurs';
import { CONSENTEMENTS_REQUIS } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

/** Étape 1 sur 4 du parcours : le compte (spec étape 1, § 1). */
export default function Inscription() {
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [cgu, setCgu] = useState(false);
  const [confidentialite, setConfidentialite] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [emailAConfirmer, setEmailAConfirmer] = useState(false);

  async function creerCompte() {
    setErreur(null);
    if (!email.includes('@')) return setErreur('Indiquez votre adresse email.');
    if (motDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      return setErreur(`Votre mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`);
    }
    if (!cgu || !confidentialite) {
      return setErreur('Pour créer votre compte, cochez les deux cases ci-dessous.');
    }
    setOccupe(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: motDePasse,
      options: { data: { prenom: prenom.trim(), consentements: CONSENTEMENTS_REQUIS } },
    });
    setOccupe(false);
    if (error) return setErreur(messageErreurAuth(error));
    // Sans session, Supabase attend la confirmation de l'adresse email.
    if (!data.session) setEmailAConfirmer(true);
    // Avec session, la navigation bascule d'elle-même vers l'application.
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/bienvenue'))}
            style={styles.retour}
            accessibilityRole="button"
            accessibilityLabel="Retour">
            <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
          </Pressable>

          <EnTeteEtape etape={1} total={4} titre={'Créons votre\ncompte'} />

          {emailAConfirmer ? (
            <MessageInfo>
              Un email de confirmation vous a été envoyé à {email.trim()}. Ouvrez le lien qu’il contient,
              puis revenez vous connecter.
            </MessageInfo>
          ) : (
            <>
              <Champ
                libelle="Votre prénom"
                value={prenom}
                onChangeText={setPrenom}
                autoComplete="given-name"
                textContentType="givenName"
                placeholder="Facultatif"
              />
              <Champ
                libelle="Adresse email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              <Champ
                libelle="Mot de passe"
                value={motDePasse}
                onChangeText={setMotDePasse}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                aide={`Au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`}
              />

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
            </>
          )}

          <View style={styles.espace} />

          {emailAConfirmer ? (
            <BoutonPrincipal libelle="Me connecter" onPress={() => router.replace('/connexion')} />
          ) : (
            <BoutonPrincipal libelle="Créer mon compte" onPress={creerCompte} occupe={occupe} />
          )}
          <Text style={styles.ensuite}>Ensuite : votre premier bien, en une page.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, gap: 16 },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cases: { gap: 6, marginTop: 4 },
  espace: { flexGrow: 1, minHeight: 8 },
  ensuite: { textAlign: 'center', fontFamily: polices.interface, fontSize: 12.5, color: couleurs.texteSecondaire },
});
