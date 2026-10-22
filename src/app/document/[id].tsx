import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonPrincipal, MessageErreur, MessageInfo } from '@/components/formulaire';
import { FormulaireDocument, lireValeurs, type ValeursDocument } from '@/components/formulaire-document';
import { Icone } from '@/components/icones';
import { PastilleStatut } from '@/components/ligne-document';
import { aujourdhui, chargerCoffre, lienTemporaire, supprimerDocument, type Coffre, type TypeDocument } from '@/lib/coffre';
import { versDateFrancaise } from '@/lib/saisie';
import { statutDocument, type DocumentCoffre } from '@/lib/statut-document';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

/** Un document du coffre : consulter le fichier, corriger le classement, supprimer. */
export default function DocumentDuCoffre() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [coffre, setCoffre] = useState<Coffre | null>(null);
  const [doc, setDoc] = useState<DocumentCoffre | null>(null);
  const [valeurs, setValeurs] = useState<ValeursDocument | null>(null);
  const [lienImage, setLienImage] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    chargerCoffre().then(async (c) => {
      setCoffre(c);
      const d = c.documents.find((x) => x.id === id) ?? null;
      setDoc(d);
      if (!d) return;
      setValeurs({
        type: d.type_document as TypeDocument,
        titre: d.titre,
        bienId: d.bien_id,
        entiteId: d.entite_id,
        dateDocument: versDateFrancaise(d.date_document),
        dateValidite: versDateFrancaise(d.date_validite),
        deductible: d.deductible,
      });
      if (d.fichier_chemin && d.fichier_type?.startsWith('image/')) setLienImage(await lienTemporaire(d.fichier_chemin));
    });
  }, [id]);

  async function ouvrirFichier() {
    if (!doc?.fichier_chemin) return;
    const lien = await lienTemporaire(doc.fichier_chemin);
    if (lien) await WebBrowser.openBrowserAsync(lien);
    else setErreur('Le fichier n’a pas pu être ouvert. Vérifiez votre connexion.');
  }

  async function enregistrer() {
    if (!valeurs || !doc) return;
    setErreur(null);
    setOk(false);
    const lu = lireValeurs(valeurs);
    if ('erreur' in lu) return setErreur(lu.erreur);
    setOccupe(true);
    const { error } = await supabase.from('documents').update(lu.champs).eq('id', doc.id);
    setOccupe(false);
    if (error) return setErreur('L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.');
    setDoc({ ...doc, ...lu.champs });
    setOk(true);
  }

  function confirmerSuppression() {
    if (!doc) return;
    Alert.alert('Supprimer ce document ?', 'Le document et son fichier seront définitivement effacés du coffre.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supprimerDocument(doc);
          if (error) setErreur('La suppression n’a pas abouti. Réessayez.');
          else router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.retour} accessibilityRole="button" accessibilityLabel="Retour au coffre">
            <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
          </Pressable>

          {coffre && !doc ? <Text style={styles.texte}>Ce document est introuvable.</Text> : null}

          {doc ? (
            <>
              <View style={styles.ligneTitre}>
                <Text style={styles.titre} accessibilityRole="header">
                  {doc.titre}
                </Text>
                <PastilleStatut statut={statutDocument(doc, aujourdhui())} />
              </View>

              {lienImage ? (
                <Pressable onPress={ouvrirFichier} accessibilityRole="button" accessibilityLabel="Agrandir le document">
                  <Image source={{ uri: lienImage }} style={styles.image} contentFit="cover" />
                </Pressable>
              ) : null}
              {doc.fichier_chemin ? (
                <Pressable onPress={ouvrirFichier} style={styles.ouvrir} accessibilityRole="button">
                  <Icone nom="document" couleur={couleurs.pin} taille={18} />
                  <Text style={styles.ouvrirTexte}>Ouvrir le fichier</Text>
                </Pressable>
              ) : null}

              {coffre && valeurs ? <FormulaireDocument valeurs={valeurs} onChange={setValeurs} coffre={coffre} /> : null}
              <MessageErreur message={erreur} />
              {ok ? <MessageInfo>Enregistré.</MessageInfo> : null}
              <BoutonPrincipal libelle="Enregistrer" onPress={enregistrer} occupe={occupe} />

              <Pressable onPress={confirmerSuppression} style={styles.supprimer} accessibilityRole="button">
                <Text style={styles.supprimerTexte}>Supprimer ce document</Text>
              </Pressable>
              <Text style={styles.trace}>Ajouté le {versDateFrancaise(doc.cree_le)}</Text>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, paddingBottom: 40, gap: 16 },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ligneTitre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titre: { flexShrink: 1, fontFamily: polices.titreFort, fontSize: 26, letterSpacing: -0.9, color: couleurs.texte },
  texte: { fontFamily: polices.interface, fontSize: 14.5, color: couleurs.texteSecondaire },
  image: { width: '100%', aspectRatio: 3 / 4, borderRadius: 22, backgroundColor: couleurs.piste },
  ouvrir: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ouvrirTexte: { fontFamily: polices.interfaceTresGras, fontSize: 14, color: couleurs.pin },
  supprimer: { alignItems: 'center', paddingVertical: 10 },
  supprimerTexte: { fontFamily: polices.interfaceGras, fontSize: 14, color: couleurs.texteCorail },
  trace: { textAlign: 'center', fontFamily: polices.technique, fontSize: 10.5, color: couleurs.texteDiscret },
});
