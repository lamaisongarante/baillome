import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonPrincipal, Champ, MessageErreur } from '@/components/formulaire';
import { Icone } from '@/components/icones';
import { messageErreurAuth } from '@/lib/erreurs';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function seConnecter() {
    setErreur(null);
    if (!email.includes('@') || !motDePasse) return setErreur('Indiquez votre email et votre mot de passe.');
    setOccupe(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: motDePasse });
    setOccupe(false);
    if (error) setErreur(messageErreurAuth(error));
    // En cas de succès, la navigation bascule d'elle-même vers l'application.
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

          <Text style={styles.titre} accessibilityRole="header">
            Bon retour{'\n'}parmi nous
          </Text>

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
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={seConnecter}
          />
          <MessageErreur message={erreur} />

          <View style={styles.espace} />
          <BoutonPrincipal libelle="Me connecter" onPress={seConnecter} occupe={occupe} />
          <Pressable onPress={() => router.replace('/inscription')} style={styles.lien} accessibilityRole="button">
            <Text style={styles.lienTexte}>
              Pas encore de compte · <Text style={styles.gras}>Créer mon compte</Text>
            </Text>
          </Pressable>
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
  titre: {
    fontFamily: polices.titreFort,
    fontSize: 28,
    letterSpacing: -1.1,
    lineHeight: 30,
    color: couleurs.texte,
  },
  espace: { flexGrow: 1, minHeight: 8 },
  lien: { alignItems: 'center', paddingVertical: 6 },
  lienTexte: { fontFamily: polices.interface, fontSize: 13.5, color: couleurs.texteSecondaire },
  gras: { fontFamily: polices.interfaceTresGras, color: couleurs.pin },
});
