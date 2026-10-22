import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonAjouterBien, CarteBien, COLONNES_RESUME, type BienResume } from '@/components/carte-bien';
import { PilulesChoix } from '@/components/choix';
import { BoutonPrincipal, CaseACocher, Champ, MessageErreur } from '@/components/formulaire';
import { Icone } from '@/components/icones';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

type TypeEntite = 'sci' | 'indivision';

/**
 * Créer ou modifier une entité (spec étape 1, § 2) : SCI ou indivision.
 * L'entité « en nom propre » existe toujours et ne se supprime pas.
 */
export default function EcranEntite() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nouvelle = id === 'nouvelle';
  const [type, setType] = useState<TypeEntite | 'nom_propre' | null>(null);
  const [nom, setNom] = useState('');
  const [siren, setSiren] = useState('');
  const [siege, setSiege] = useState('');
  const [forme, setForme] = useState('');
  const [representant, setRepresentant] = useState('');
  const [familiale, setFamiliale] = useState(false);
  const [biens, setBiens] = useState<BienResume[]>([]);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (nouvelle) return;
    supabase
      .from('entites')
      .select('type, nom, siren, sci_familiale, siege, forme_juridique, representant_legal')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setType(data.type as TypeEntite | 'nom_propre');
        setNom(data.nom);
        setSiren(data.siren ?? '');
        setSiege(data.siege ?? '');
        setForme(data.forme_juridique ?? '');
        setRepresentant(data.representant_legal ?? '');
        setFamiliale(data.sci_familiale);
      });
    supabase
      .from('biens')
      .select(COLONNES_RESUME)
      .eq('entite_id', id)
      .order('numero')
      .then(({ data }) => setBiens(data ?? []));
  }, [id, nouvelle]);

  const nomPropre = type === 'nom_propre';

  async function enregistrer() {
    setErreur(null);
    if (!type) return setErreur('Choisissez SCI ou indivision.');
    if (!nom.trim()) return setErreur('Indiquez le nom de l’entité, par exemple « SCI Les Pins ».');
    const s = siren.replace(/\s/g, '');
    if (s && !/^\d{9}$/.test(s)) return setErreur('Le numéro SIREN comporte 9 chiffres.');

    const champs = {
      nom: nom.trim(),
      siren: type === 'sci' ? s || null : null,
      sci_familiale: type === 'sci' ? familiale : false,
      siege: type === 'sci' ? siege.trim() || null : null,
      forme_juridique: type === 'sci' ? forme.trim() || null : null,
      representant_legal: type === 'sci' ? representant.trim() || null : null,
    };
    setOccupe(true);
    const { error } = nouvelle
      ? await supabase.from('entites').insert({
          type,
          // Dans les baux : une SCI est une personne morale ; les indivisaires sont des personnes physiques.
          qualite_bailleur: type === 'sci' ? 'personne_morale' : 'personne_physique',
          ...champs,
        })
      : await supabase.from('entites').update(nomPropre ? { nom: champs.nom } : champs).eq('id', id);
    setOccupe(false);
    if (error) return setErreur('L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.');
    router.back();
  }

  function confirmerSuppression() {
    if (biens.length > 0) {
      return setErreur('Rattachez d’abord ses biens à une autre entité (fiche du bien, rubrique Identité).');
    }
    Alert.alert('Supprimer cette entité ?', `« ${nom} » sera retirée de votre compte.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('entites').delete().eq('id', id);
          if (error) setErreur('La suppression n’a pas abouti. Vérifiez que plus aucun bien ni document n’y est rattaché.');
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
            {nouvelle ? 'Nouvelle entité' : nom || 'Entité'}
          </Text>

          {nouvelle ? (
            <PilulesChoix
              libelleGroupe="Type d’entité"
              valeur={type as TypeEntite | null}
              onChange={setType}
              options={[
                { valeur: 'sci', libelle: 'SCI' },
                { valeur: 'indivision', libelle: 'Indivision' },
              ]}
            />
          ) : null}

          <Champ
            libelle="Nom"
            value={nom}
            onChangeText={setNom}
            placeholder={type === 'indivision' ? 'Indivision Martin' : 'SCI Les Pins'}
          />

          {type === 'sci' ? (
            <>
              <Champ
                libelle="Numéro SIREN (facultatif)"
                value={siren}
                onChangeText={(t) => setSiren(t.replace(/[^\d\s]/g, ''))}
                keyboardType="number-pad"
                maxLength={11}
              />
              <Champ
                libelle="Siège social"
                value={siege}
                onChangeText={setSiege}
                aide="Il figure dans les baux des biens de la SCI, comme l’exige le contrat type."
              />
              <Champ
                libelle="Forme juridique (facultatif)"
                value={forme}
                onChangeText={setForme}
                placeholder="Société civile immobilière"
              />
              <Champ
                libelle="Représentant légal (facultatif)"
                value={representant}
                onChangeText={setRepresentant}
                placeholder="Prénom Nom, gérant"
              />
              <CaseACocher cochee={familiale} onChange={setFamiliale} libelleAccessible="Société civile familiale jusqu’au quatrième degré">
                Société civile familiale jusqu’au quatrième degré
              </CaseACocher>
            </>
          ) : null}

          <MessageErreur message={erreur} />
          <BoutonPrincipal libelle="Enregistrer" onPress={enregistrer} occupe={occupe} />

          {!nouvelle ? (
            <>
              <Text style={styles.sousTitre}>Biens détenus</Text>
              {biens.length === 0 ? <Text style={styles.texte}>Aucun bien rattaché pour l’instant.</Text> : null}
              {biens.map((b) => (
                <CarteBien key={b.id} bien={b} />
              ))}
              {nomPropre ? <BoutonAjouterBien /> : (
                <Text style={styles.texte}>
                  Pour rattacher un bien à cette entité, ouvrez sa fiche, rubrique « Identité du bien ».
                </Text>
              )}
              {!nomPropre ? (
                <Pressable onPress={confirmerSuppression} style={styles.supprimer} accessibilityRole="button">
                  <Text style={styles.supprimerTexte}>Supprimer cette entité</Text>
                </Pressable>
              ) : null}
            </>
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
  sousTitre: { marginTop: 16, fontFamily: polices.titre, fontSize: 20, letterSpacing: -0.5, color: couleurs.texte },
  texte: { fontFamily: polices.interface, fontSize: 13, lineHeight: 19, color: couleurs.texteSecondaire },
  supprimer: { alignItems: 'center', paddingVertical: 12 },
  supprimerTexte: { fontFamily: polices.interfaceGras, fontSize: 14, color: couleurs.texteCorail },
  bas: { height: 24 },
});
