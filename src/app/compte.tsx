import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Champ, MessageErreur, MessageInfo } from '@/components/formulaire';
import { afficherTelephone, lireTelephone } from '@/lib/personnes';
import { Icone } from '@/components/icones';
import { exporterMesDonnees, supprimerMonCompte } from '@/lib/compte';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { arrondis, couleurs, polices } from '@/theme/tokens';

const TEXTES: { libelle: string; href: Href }[] = [
  { libelle: 'Conditions générales', href: '/juridique/cgu' },
  { libelle: 'Politique de confidentialité', href: '/juridique/confidentialite' },
  { libelle: 'Mentions légales', href: '/juridique/mentions-legales' },
];

const TYPES_ENTITE: Record<string, string> = { nom_propre: 'En nom propre', sci: 'SCI', indivision: 'Indivision' };

type Entite = { id: string; type: string; nom: string; biens: { count: number }[] };

/** Mon compte : ouvert depuis l'avatar de l'accueil (spec étape 1, § 7 et § 8). */
export default function Compte() {
  const { session } = useSession();
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [formule, setFormule] = useState<string | null>(null);
  const [entites, setEntites] = useState<Entite[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState<'profil' | 'export' | 'suppression' | null>(null);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('profils')
        .select('prenom, nom, adresse, telephone, formules(libelle)')
        .single()
        .then(({ data }) => {
          setPrenom(data?.prenom ?? '');
          setNom(data?.nom ?? '');
          setAdresse(data?.adresse ?? '');
          setTelephone(afficherTelephone(data?.telephone ?? null));
          setFormule((data?.formules as unknown as { libelle: string } | null)?.libelle ?? null);
        });
      supabase
        .from('entites')
        .select('id, type, nom, biens(count)')
        .order('cree_le')
        .then(({ data }) => setEntites((data as Entite[] | null) ?? []));
    }, []),
  );

  async function enregistrerProfil() {
    setMessage(null);
    setErreur(null);
    const tel = lireTelephone(telephone);
    if (tel === undefined) return setErreur('Ce numéro de portable ne semble pas complet. Exemple : 06 12 34 56 78.');
    setOccupe('profil');
    const { error } = await supabase
      .from('profils')
      .update({ prenom: prenom.trim() || null, nom: nom.trim() || null, adresse: adresse.trim() || null, telephone: tel })
      .eq('id', session?.user.id ?? '');
    setOccupe(null);
    if (error) setErreur('L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.');
    else setMessage('Vos informations sont enregistrées.');
  }

  async function exporter() {
    setMessage(null);
    setErreur(null);
    setOccupe('export');
    try {
      await exporterMesDonnees();
    } catch {
      setErreur('L’export n’a pas abouti. Vérifiez votre connexion et réessayez.');
    } finally {
      setOccupe(null);
    }
  }

  function confirmerSuppression() {
    Alert.alert(
      'Supprimer votre compte ?',
      'Vos biens, vos documents et tous les fichiers de votre coffre seront définitivement effacés. Pensez à exporter vos données avant.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Dernière confirmation', 'Cette suppression est définitive et ne pourra pas être annulée.', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer définitivement', style: 'destructive', onPress: supprimer },
            ]),
        },
      ],
    );
  }

  async function supprimer() {
    setErreur(null);
    setOccupe('suppression');
    try {
      await supprimerMonCompte();
      // La session disparaît : l'application revient d'elle-même à l'écran de bienvenue.
    } catch {
      setOccupe(null);
      setErreur('La suppression n’a pas abouti. Vérifiez votre connexion et réessayez.');
    }
  }

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.retour}
            accessibilityRole="button"
            accessibilityLabel="Retour à l'accueil">
            <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
          </Pressable>
          <Text style={styles.titre} accessibilityRole="header">
            Mon compte
          </Text>
          <Text style={styles.email}>{session?.user.email}</Text>

          {/* Mes informations */}
          <View style={styles.deuxColonnes}>
            <View style={styles.colonne}>
              <Champ libelle="Prénom" value={prenom} onChangeText={setPrenom} autoComplete="given-name" />
            </View>
            <View style={styles.colonne}>
              <Champ libelle="Nom" value={nom} onChangeText={setNom} autoComplete="family-name" />
            </View>
          </View>
          <Champ
            libelle="Domicile"
            value={adresse}
            onChangeText={setAdresse}
            autoComplete="street-address"
            aide="Il figure dans vos baux, comme l’exige le contrat type."
          />
          <Champ
            libelle="Portable (facultatif)"
            value={telephone}
            onChangeText={setTelephone}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
          />
          <Pressable onPress={enregistrerProfil} style={styles.boutonSecondaire} accessibilityRole="button" disabled={occupe !== null}>
            <Text style={styles.boutonSecondaireTexte}>{occupe === 'profil' ? 'Enregistrement…' : 'Enregistrer'}</Text>
          </Pressable>
          {message ? <MessageInfo>{message}</MessageInfo> : null}
          <MessageErreur message={erreur} />

          {/* Ma formule */}
          <Text style={styles.sousTitre}>Ma formule</Text>
          <Pressable onPress={() => router.push('/formules')} style={styles.carteLigne} accessibilityRole="button">
            <View style={styles.texteLigne}>
              <Text style={styles.ligneTitre}>{formule ?? '…'}</Text>
              <Text style={styles.ligneDetail}>Voir et comparer les formules</Text>
            </View>
            <Icone nom="fleche" couleur={couleurs.pin} taille={16} epaisseur={2.2} />
          </Pressable>

          {/* Mes entités */}
          <Text style={styles.sousTitre}>Mes entités</Text>
          <Text style={styles.texte}>Organisez vos biens selon qu’ils sont détenus en nom propre, en SCI ou en indivision.</Text>
          <View style={styles.liste}>
            {entites.map((e, i) => (
              <Pressable
                key={e.id}
                onPress={() => router.push({ pathname: '/entite/[id]', params: { id: e.id } })}
                style={[styles.ligne, i > 0 && styles.separateur]}
                accessibilityRole="button">
                <View style={styles.texteLigne}>
                  <Text style={styles.ligneTitre}>{e.nom}</Text>
                  <Text style={styles.ligneDetail}>
                    {TYPES_ENTITE[e.type]} · {e.biens[0]?.count ?? 0} bien{(e.biens[0]?.count ?? 0) > 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/entite/[id]', params: { id: 'nouvelle' } })}
            style={styles.ajouter}
            accessibilityRole="button">
            <Text style={styles.ajouterTexte}>+ Ajouter une SCI ou une indivision</Text>
          </Pressable>

          {/* Textes */}
          <Text style={styles.sousTitre}>Informations légales</Text>
          <View style={styles.liste}>
            {TEXTES.map((t, i) => (
              <Pressable
                key={t.libelle}
                onPress={() => router.push(t.href)}
                style={[styles.ligne, i > 0 && styles.separateur]}
                accessibilityRole="link">
                <Text style={styles.ligneTitre}>{t.libelle}</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>

          {/* Mes données */}
          <Text style={styles.sousTitre}>Mes données</Text>
          <Pressable onPress={exporter} style={styles.boutonSecondaire} accessibilityRole="button" disabled={occupe !== null}>
            <Text style={styles.boutonSecondaireTexte}>{occupe === 'export' ? 'Préparation…' : 'Exporter mes données'}</Text>
          </Pressable>
          <Text style={styles.texte}>
            Un fichier contenant toutes vos informations. Les documents du coffre se téléchargent depuis le coffre.
          </Text>

          <Pressable
            onPress={() => supabase.auth.signOut()}
            style={[styles.boutonSecondaire, styles.deconnexion]}
            accessibilityRole="button">
            <Text style={styles.boutonSecondaireTexte}>Me déconnecter</Text>
          </Pressable>

          <Pressable onPress={confirmerSuppression} style={styles.supprimer} accessibilityRole="button" disabled={occupe !== null}>
            <Text style={styles.supprimerTexte}>
              {occupe === 'suppression' ? 'Suppression en cours…' : 'Supprimer mon compte'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: 24, paddingBottom: 48, gap: 12 },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titre: { fontFamily: polices.titre, fontSize: 30, letterSpacing: -0.9, color: couleurs.texte },
  email: { fontFamily: polices.interface, fontSize: 14, color: couleurs.texteSecondaire, marginTop: -6 },
  sousTitre: { marginTop: 16, fontFamily: polices.titre, fontSize: 20, letterSpacing: -0.5, color: couleurs.texte },
  texte: { fontFamily: polices.interface, fontSize: 13, lineHeight: 19, color: couleurs.texteSecondaire },
  deuxColonnes: { flexDirection: 'row', gap: 10 },
  colonne: { flex: 1 },
  liste: { backgroundColor: couleurs.carte, borderRadius: arrondis.tuile, paddingHorizontal: 18 },
  ligne: { minHeight: 56, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.piste },
  carteLigne: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.tuile,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  texteLigne: { flex: 1, gap: 1 },
  ligneTitre: { fontFamily: polices.interfaceGras, fontSize: 14.5, color: couleurs.texte },
  ligneDetail: { fontFamily: polices.interface, fontSize: 12.5, color: couleurs.texteSecondaire },
  chevron: { fontFamily: polices.interfaceGras, fontSize: 20, color: couleurs.texteDiscret },
  ajouter: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: couleurs.pointillesFort,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ajouterTexte: { fontFamily: polices.interfaceGras, fontSize: 14, color: couleurs.pin },
  boutonSecondaire: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonSecondaireTexte: { fontFamily: polices.interfaceTresGras, fontSize: 14.5, color: couleurs.pin },
  deconnexion: { marginTop: 16 },
  supprimer: { alignItems: 'center', paddingVertical: 12 },
  supprimerTexte: { fontFamily: polices.interfaceGras, fontSize: 14, color: couleurs.texteCorail },
});
