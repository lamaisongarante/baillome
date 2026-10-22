import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PilulesChoix } from '@/components/choix';
import { BoutonPrincipal, Champ, MessageErreur, MessageInfo } from '@/components/formulaire';
import { Icone } from '@/components/icones';
import { COLONNES_PERSONNE, type Personne } from '@/lib/locataires';
import { LIBELLES_TYPE_GARANT, afficherTelephone, lireEmail, lireTelephone, nomComplet, type TypeGarant } from '@/lib/personnes';
import { formaterDateEnCours, lireDateFrancaise, versDateFrancaise } from '@/lib/saisie';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

const ERREUR_RESEAU = 'L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.';

/**
 * Fiche garant (cahier des charges : contacts, acte de cautionnement, ou
 * garantie Visale à la place d'un garant). Création : id = « nouveau »,
 * avec le bail et le locataire garanti, nommément désigné (article 8-1, VI).
 */
export default function EcranGarant() {
  const { id, bail, locataire } = useLocalSearchParams<{ id: string; bail?: string; locataire?: string }>();
  const nouveau = id === 'nouveau';

  const [type, setType] = useState<TypeGarant | null>(null);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [visale, setVisale] = useState('');
  const [signeLe, setSigneLe] = useState('');
  const [cautionnementId, setCautionnementId] = useState<string | null>(null);
  const [garanti, setGaranti] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (nouveau) {
      if (!locataire) return;
      supabase
        .from('personnes')
        .select('prenom, nom')
        .eq('id', locataire)
        .single()
        .then(({ data }) => setGaranti(data ? nomComplet(data) : null));
      return;
    }
    supabase
      .from('personnes')
      .select(COLONNES_PERSONNE)
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const p = data as Personne;
        setType(p.type_garant);
        setPrenom(p.prenom ?? '');
        setNom(p.nom);
        setAdresse(p.adresse ?? '');
        setTelephone(afficherTelephone(p.telephone));
        setEmail(p.email ?? '');
        setVisale(p.visale_reference ?? '');
      });
    supabase
      .from('cautionnements')
      .select('id, signe_le, baux_locataires (personnes (prenom, nom))')
      .eq('garant_id', id)
      .order('cree_le')
      .limit(1)
      .then(({ data }) => {
        const c = data?.[0];
        if (!c) return;
        setCautionnementId(c.id);
        setSigneLe(versDateFrancaise(c.signe_le));
        const l = (c.baux_locataires as unknown as { personnes: { prenom: string | null; nom: string } } | null)?.personnes;
        setGaranti(l ? nomComplet(l) : null);
      });
  }, [id, nouveau, locataire]);

  const estVisale = type === 'visale';
  const estPersonne = type === 'personne_physique';

  function choisirType(t: TypeGarant) {
    setType(t);
    // La garantie Visale est accordée par Action Logement.
    if (t === 'visale' && !nom.trim()) setNom('Action Logement');
  }

  async function enregistrer() {
    setErreur(null);
    if (!type) return setErreur('Indiquez qui se porte garant.');
    if (!nom.trim()) return setErreur(estPersonne ? 'Indiquez le nom du garant.' : 'Indiquez le nom de l’organisme ou de la société.');
    const tel = lireTelephone(telephone);
    if (tel === undefined) return setErreur('Ce numéro de portable ne semble pas complet. Exemple : 06 12 34 56 78.');
    const mail = lireEmail(email);
    if (mail === undefined) return setErreur('Cette adresse email ne semble pas valide.');
    let dateSignature: string | null = null;
    if (signeLe.trim()) {
      dateSignature = lireDateFrancaise(signeLe);
      if (!dateSignature) return setErreur('La date de signature doit être au format JJ/MM/AAAA.');
    }

    const champs = {
      type_garant: type,
      prenom: estPersonne ? prenom.trim() || null : null,
      nom: nom.trim(),
      adresse: adresse.trim() || null,
      telephone: tel,
      email: mail,
      visale_reference: estVisale ? visale.trim() || null : null,
    };

    setOccupe(true);
    if (nouveau) {
      if (!bail || !locataire) return setOccupe(false);
      const { data: garant, error } = await supabase
        .from('personnes')
        .insert({ role: 'garant', ...champs })
        .select('id')
        .single();
      if (error || !garant) {
        setOccupe(false);
        return setErreur(ERREUR_RESEAU);
      }
      const lien = await supabase
        .from('cautionnements')
        .insert({ bail_id: bail, garant_id: garant.id, locataire_id: locataire, signe_le: dateSignature });
      if (lien.error) await supabase.from('personnes').delete().eq('id', garant.id);
      setOccupe(false);
      if (lien.error) return setErreur(ERREUR_RESEAU);
      router.back();
      return;
    }
    const { error } = await supabase.from('personnes').update(champs).eq('id', id);
    const erreurActe = cautionnementId
      ? (await supabase.from('cautionnements').update({ signe_le: dateSignature }).eq('id', cautionnementId)).error
      : null;
    setOccupe(false);
    if (error || erreurActe) return setErreur(ERREUR_RESEAU);
    router.back();
  }

  function confirmerSuppression() {
    Alert.alert('Retirer ce garant ?', `La fiche de ${nomComplet({ prenom, nom }) || 'ce garant'} sera supprimée.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('personnes').delete().eq('id', id);
          if (error) setErreur('La suppression n’a pas abouti. Vérifiez votre connexion et réessayez.');
          else router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.retour} accessibilityRole="button" accessibilityLabel="Retour">
            <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
          </Pressable>
          <Text style={styles.titre} accessibilityRole="header">
            {nouveau ? 'Nouveau garant' : nomComplet({ prenom, nom }) || 'Garant'}
          </Text>
          {garanti ? <Text style={styles.aide}>Se porte garant pour {garanti}.</Text> : null}

          <PilulesChoix
            libelleGroupe="Qui se porte garant ?"
            valeur={type}
            onChange={choisirType}
            options={(Object.keys(LIBELLES_TYPE_GARANT) as TypeGarant[]).map((v) => ({ valeur: v, libelle: LIBELLES_TYPE_GARANT[v] }))}
          />

          {estVisale ? (
            <MessageInfo>
              La garantie Visale est une caution gratuite accordée sous conditions par Action Logement. Pas d’acte de
              cautionnement à faire signer : conservez le visa dans le coffre.
            </MessageInfo>
          ) : null}

          {type ? (
            <>
              {estPersonne ? (
                <Champ libelle="Prénom" value={prenom} onChangeText={setPrenom} autoCapitalize="words" textContentType="givenName" />
              ) : null}
              <Champ
                libelle={estPersonne ? 'Nom' : 'Nom de l’organisme ou de la société'}
                value={nom}
                onChangeText={setNom}
                autoCapitalize="words"
              />
              {estVisale ? (
                <Champ libelle="Numéro du visa (facultatif)" value={visale} onChangeText={setVisale} autoCapitalize="characters" />
              ) : (
                <Champ
                  libelle="Adresse"
                  value={adresse}
                  onChangeText={setAdresse}
                  textContentType="fullStreetAddress"
                  aide="Elle figure dans l’acte de cautionnement."
                />
              )}
              <Champ
                libelle="Portable (facultatif)"
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                placeholder="06 12 34 56 78"
              />
              <Champ
                libelle="Email (facultatif)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
              {!estVisale ? (
                <Champ
                  libelle="Acte de cautionnement signé le (facultatif)"
                  value={signeLe}
                  onChangeText={(t) => setSigneLe(formaterDateEnCours(t))}
                  keyboardType="number-pad"
                  placeholder="JJ/MM/AAAA"
                  maxLength={10}
                  aide="Pour un acte déjà signé. Baillome préparera les nouveaux actes avec le bail."
                />
              ) : null}
            </>
          ) : null}

          <MessageErreur message={erreur} />
          <BoutonPrincipal libelle="Enregistrer" onPress={enregistrer} occupe={occupe} desactive={!type} />

          {!nouveau ? (
            <Pressable onPress={confirmerSuppression} style={styles.supprimer} accessibilityRole="button">
              <Text style={styles.supprimerTexte}>Retirer ce garant</Text>
            </Pressable>
          ) : null}
          <View style={styles.bas} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, gap: 14 },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: { fontFamily: polices.titreFort, fontSize: 28, letterSpacing: -1.1, lineHeight: 30, color: couleurs.texte },
  aide: { fontFamily: polices.interface, fontSize: 13.5, lineHeight: 19, color: couleurs.texteSecondaire },
  supprimer: { alignItems: 'center', paddingVertical: 12 },
  supprimerTexte: { fontFamily: polices.interfaceGras, fontSize: 14, color: couleurs.texteCorail },
  bas: { height: 24 },
});
