import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PilulesChoix } from '@/components/choix';
import { BoutonPrincipal, CaseACocher, Champ, MessageErreur, MessageInfo } from '@/components/formulaire';
import { Icone } from '@/components/icones';
import {
  ajouterLocataire,
  chargerFicheLocataire,
  chargerOccupation,
  supprimerLocataire,
  type Bail,
  type Occupation,
} from '@/lib/locataires';
import {
  LIBELLES_TYPE_BAIL,
  afficherTelephone,
  lireEmail,
  lireTelephone,
  nomComplet,
  typeBailPropose,
  type TypeBail,
} from '@/lib/personnes';
import { formaterDateEnCours, lireDateFrancaise, versDateFrancaise } from '@/lib/saisie';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

const ERREUR_RESEAU = 'L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.';

/**
 * Créer (id = « nouveau », paramètre « bien ») ou modifier une fiche locataire.
 * À la création, le locataire rejoint le bail en cours du bien, ou un bail
 * en cours est créé avec la date d'entrée indiquée.
 */
export default function ModifierLocataire() {
  const { id, bien } = useLocalSearchParams<{ id: string; bien?: string }>();
  const nouveau = id === 'nouveau';

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [naissance, setNaissance] = useState('');
  const [lieuNaissance, setLieuNaissance] = useState('');
  const [etudiant, setEtudiant] = useState(false);
  const [apprenti, setApprenti] = useState(false);
  const [boursier, setBoursier] = useState(false);
  const [accordEmail, setAccordEmail] = useState(false);
  const [accordInitial, setAccordInitial] = useState<string | null>(null);

  const [occupation, setOccupation] = useState<Occupation | null>(null);
  const [bail, setBail] = useState<Bail | null>(null);
  const [typeBail, setTypeBail] = useState<TypeBail | null>(null);
  const [dateEntree, setDateEntree] = useState('');
  const [couple, setCouple] = useState<'oui' | 'non' | null>(null);

  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (nouveau) {
      if (!bien) return;
      supabase
        .from('biens')
        .select('type_bien, type_location, situation_locative')
        .eq('id', bien)
        .single()
        .then(({ data }) => {
          if (data) setTypeBail(typeBailPropose(data));
        });
      chargerOccupation(bien).then(setOccupation);
      return;
    }
    chargerFicheLocataire(id).then((fiche) => {
      if (!fiche) return;
      const p = fiche.personne;
      setPrenom(p.prenom ?? '');
      setNom(p.nom);
      setTelephone(afficherTelephone(p.telephone));
      setEmail(p.email ?? '');
      setAdresse(p.adresse ?? '');
      setNaissance(versDateFrancaise(p.date_naissance));
      setLieuNaissance(p.lieu_naissance ?? '');
      setEtudiant(p.etudiant);
      setApprenti(p.apprenti);
      setBoursier(!!p.boursier);
      setAccordEmail(!!p.accord_email_le);
      setAccordInitial(p.accord_email_le);
      setBail(fiche.bail);
      setTypeBail(fiche.bail?.type_bail ?? null);
      setDateEntree(versDateFrancaise(fiche.bail?.date_effet ?? null));
    });
  }, [id, nouveau, bien]);

  // Retour à l'écran précédent, ou à la fiche si on arrive directement ici.
  function revenir() {
    if (router.canGoBack()) router.back();
    else if (!nouveau) router.replace(`/locataire/${id}` as Href);
    else if (bien) router.replace(`/bien/${bien}` as Href);
    else router.replace('/');
  }

  // Un deuxième locataire : couple marié ou pacsé, ou colocation (article 8-1, I).
  const questionCouple = nouveau && occupation?.locataires.length === 1;
  const bailASaisir = nouveau ? !occupation : !!bail;

  async function enregistrer() {
    setErreur(null);
    if (!nom.trim()) return setErreur('Indiquez au moins le nom du locataire.');
    const tel = lireTelephone(telephone);
    if (tel === undefined) return setErreur('Ce numéro de portable ne semble pas complet. Exemple : 06 12 34 56 78.');
    const mail = lireEmail(email);
    if (mail === undefined) return setErreur('Cette adresse email ne semble pas valide.');
    if (accordEmail && !mail) return setErreur('Pour envoyer les documents par email, indiquez l’adresse email du locataire.');
    const dateNaissance = naissance.trim() ? lireDateFrancaise(naissance) : null;
    if (naissance.trim() && !dateNaissance) return setErreur('La date de naissance doit être au format JJ/MM/AAAA.');
    let dateIso: string | null = null;
    if (bailASaisir) {
      dateIso = lireDateFrancaise(dateEntree);
      if (!dateIso) return setErreur('Indiquez la date d’entrée dans le logement, au format JJ/MM/AAAA.');
      if (!typeBail) return setErreur('Choisissez le type de location.');
    }
    if (questionCouple && !couple) return setErreur('Indiquez si les locataires sont mariés ou pacsés ensemble.');

    const champs = {
      prenom: prenom.trim() || null,
      nom: nom.trim(),
      telephone: tel,
      email: mail,
      adresse: adresse.trim() || null,
      date_naissance: dateNaissance,
      lieu_naissance: lieuNaissance.trim() || null,
      etudiant,
      apprenti,
      boursier: etudiant ? boursier : null,
      // L'accord garde sa date d'origine ; il est daté du jour où il est donné.
      accord_email_le: accordEmail ? (accordInitial ?? new Date().toISOString()) : null,
    };

    setOccupe(true);
    if (nouveau) {
      if (!bien) return setOccupe(false);
      const resultat = await ajouterLocataire(
        bien,
        champs,
        !occupation && typeBail && dateIso ? { type_bail: typeBail, date_effet: dateIso } : null,
        questionCouple ? couple === 'oui' : null,
      );
      setOccupe(false);
      if ('erreur' in resultat) return setErreur(resultat.erreur);
      router.replace(`/locataire/${resultat.id}` as Href);
      return;
    }
    const { error } = await supabase.from('personnes').update(champs).eq('id', id);
    const erreurBail =
      bail && dateIso && typeBail
        ? (await supabase.from('baux').update({ date_effet: dateIso, type_bail: typeBail }).eq('id', bail.id)).error
        : null;
    setOccupe(false);
    if (error || erreurBail) return setErreur(ERREUR_RESEAU);
    revenir();
  }

  function confirmerSuppression() {
    Alert.alert(
      'Supprimer cette fiche ?',
      `La fiche de ${nomComplet({ prenom, nom }) || 'ce locataire'} sera supprimée, avec ses garants.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const ok = await supprimerLocataire(id, bail);
            if (!ok) return setErreur('La suppression n’a pas abouti. Vérifiez votre connexion et réessayez.');
            if (bail) router.dismissTo(`/bien/${bail.bien_id}` as Href);
            else router.replace('/');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <Pressable onPress={revenir} style={styles.retour} accessibilityRole="button" accessibilityLabel="Retour">
            <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
          </Pressable>
          <Text style={styles.titre} accessibilityRole="header">
            {nouveau ? 'Nouveau locataire' : 'Modifier la fiche'}
          </Text>
          {nouveau && occupation ? (
            <MessageInfo>
              {`Ce locataire rejoint le bail en cours, aux côtés de ${occupation.locataires.map(nomComplet).join(', ')}.`}
            </MessageInfo>
          ) : null}

          <Champ libelle="Prénom" value={prenom} onChangeText={setPrenom} autoCapitalize="words" textContentType="givenName" />
          <Champ libelle="Nom" value={nom} onChangeText={setNom} autoCapitalize="words" textContentType="familyName" />
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
          <Champ
            libelle="Adresse actuelle (facultatif)"
            value={adresse}
            onChangeText={setAdresse}
            textContentType="fullStreetAddress"
            aide="Son adresse avant l’entrée dans les lieux. Elle complète la désignation des parties."
          />
          <Champ
            libelle="Date de naissance (facultatif)"
            value={naissance}
            onChangeText={(t) => setNaissance(formaterDateEnCours(t))}
            keyboardType="number-pad"
            placeholder="JJ/MM/AAAA"
            maxLength={10}
          />
          <Champ libelle="Lieu de naissance (facultatif)" value={lieuNaissance} onChangeText={setLieuNaissance} />
          <CaseACocher
            cochee={accordEmail}
            onChange={setAccordEmail}
            libelleAccessible="Le locataire accepte de recevoir ses documents par email">
            Le locataire accepte de recevoir ses documents par email (quittances, avis d’échéance)
          </CaseACocher>

          {bailASaisir ? (
            <>
              <Text style={styles.sousTitre}>La location</Text>
              <Champ
                libelle="Date d’entrée dans le logement"
                value={dateEntree}
                onChangeText={(t) => setDateEntree(formaterDateEnCours(t))}
                keyboardType="number-pad"
                placeholder="JJ/MM/AAAA"
                maxLength={10}
                aide="La date de prise d’effet du bail."
              />
              <Text style={styles.question}>Type de location</Text>
              <PilulesChoix
                libelleGroupe="Type de location"
                valeur={typeBail}
                onChange={setTypeBail}
                options={(Object.keys(LIBELLES_TYPE_BAIL) as TypeBail[]).map((v) => ({ valeur: v, libelle: LIBELLES_TYPE_BAIL[v] }))}
              />
            </>
          ) : null}

          {questionCouple ? (
            <>
              <Text style={styles.question}>Les deux locataires sont-ils mariés ou pacsés ensemble ?</Text>
              <PilulesChoix
                libelleGroupe="Locataires mariés ou pacsés ensemble"
                valeur={couple}
                onChange={setCouple}
                options={[
                  { valeur: 'oui', libelle: 'Oui' },
                  { valeur: 'non', libelle: 'Non' },
                ]}
              />
              <Text style={styles.aide}>Sinon, la loi considère qu’il s’agit d’une colocation.</Text>
            </>
          ) : null}

          {typeBail !== 'garage' ? (
            <>
              <Text style={styles.sousTitre}>Situation</Text>
              <Text style={styles.aide}>
                Ces informations comptent pour la durée d’un bail meublé et pour la possibilité de demander un garant.
              </Text>
              <CaseACocher cochee={etudiant} onChange={setEtudiant} libelleAccessible="Étudiant">
                Étudiant
              </CaseACocher>
              {etudiant ? (
                <CaseACocher cochee={boursier} onChange={setBoursier} libelleAccessible="Boursier de l’enseignement supérieur">
                  Boursier de l’enseignement supérieur
                </CaseACocher>
              ) : null}
              <CaseACocher cochee={apprenti} onChange={setApprenti} libelleAccessible="Apprenti">
                Apprenti
              </CaseACocher>
            </>
          ) : null}

          <MessageErreur message={erreur} />
          <BoutonPrincipal libelle="Enregistrer" onPress={enregistrer} occupe={occupe} />

          {!nouveau ? (
            <Pressable onPress={confirmerSuppression} style={styles.supprimer} accessibilityRole="button">
              <Text style={styles.supprimerTexte}>Supprimer cette fiche</Text>
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
  sousTitre: { marginTop: 12, fontFamily: polices.titre, fontSize: 20, letterSpacing: -0.5, color: couleurs.texte },
  question: { fontFamily: polices.interfaceGras, fontSize: 15, lineHeight: 21, color: couleurs.texte },
  aide: { fontFamily: polices.interface, fontSize: 13, lineHeight: 19, color: couleurs.texteSecondaire },
  supprimer: { alignItems: 'center', paddingVertical: 12 },
  supprimerTexte: { fontFamily: polices.interfaceGras, fontSize: 14, color: couleurs.texteCorail },
  bas: { height: 24 },
});
