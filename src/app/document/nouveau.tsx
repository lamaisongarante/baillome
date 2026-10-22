import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonPrincipal, MessageErreur } from '@/components/formulaire';
import { FormulaireDocument, lireValeurs, VALEURS_VIDES, type ValeursDocument } from '@/components/formulaire-document';
import { Icone, type NomIcone } from '@/components/icones';
import { chargerCoffre, deposerFichier, TYPES_DOCUMENT, type Coffre, type TypeDocument } from '@/lib/coffre';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

type Fichier = { uri: string; type: string; nom: string; image: boolean; taille: number | null };

/** Ranger un document dans le coffre : photo (recadrable), photo existante ou fichier PDF. */
export default function NouveauDocument() {
  const params = useLocalSearchParams<{ bien?: string; type?: string }>();
  const [coffre, setCoffre] = useState<Coffre | null>(null);
  const [fichier, setFichier] = useState<Fichier | null>(null);
  const [valeurs, setValeurs] = useState<ValeursDocument>(VALEURS_VIDES);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    chargerCoffre().then((c) => {
      setCoffre(c);
      // Par défaut : le seul bien s'il n'y en a qu'un, et l'entité « en nom propre ».
      const type = params.type && params.type in TYPES_DOCUMENT ? (params.type as TypeDocument) : null;
      setValeurs((v) => ({
        ...v,
        bienId: params.bien ?? (c.biens.length === 1 ? c.biens[0].id : null),
        entiteId: c.entites[0]?.id ?? null,
        type,
        titre: type ? TYPES_DOCUMENT[type] : v.titre,
      }));
    });
  }, [params.bien, params.type]);

  async function photographier() {
    setErreur(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return setErreur('Baillome n’a pas accès à l’appareil photo. Autorisez-le dans les réglages du téléphone.');
    }
    const r = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', allowsEditing: true, quality: 0.7 });
    if (!r.canceled) {
      const a = r.assets[0];
      setFichier({ uri: a.uri, type: a.mimeType ?? 'image/jpeg', nom: 'Photo', image: true, taille: a.fileSize ?? null });
    }
  }

  async function choisirPhoto() {
    setErreur(null);
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, quality: 0.7 });
    if (!r.canceled) {
      const a = r.assets[0];
      setFichier({ uri: a.uri, type: a.mimeType ?? 'image/jpeg', nom: a.fileName ?? 'Photo', image: true, taille: a.fileSize ?? null });
    }
  }

  async function choisirFichier() {
    setErreur(null);
    const r = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
    if (!r.canceled) {
      const a = r.assets[0];
      const type = a.mimeType ?? 'application/pdf';
      setFichier({ uri: a.uri, type, nom: a.name, image: type.startsWith('image/'), taille: a.size ?? null });
    }
  }

  async function ranger() {
    setErreur(null);
    if (!fichier) return setErreur('Ajoutez d’abord une photo ou un fichier.');
    if (fichier.taille && fichier.taille > 20 * 1024 * 1024) return setErreur('Ce fichier dépasse 20 Mo.');
    const lu = lireValeurs(valeurs);
    if ('erreur' in lu) return setErreur(lu.erreur);

    setOccupe(true);
    try {
      const chemin = await deposerFichier(fichier.uri, fichier.type);
      const { error } = await supabase.from('documents').insert({
        ...lu.champs,
        fichier_chemin: chemin,
        fichier_type: fichier.type,
        fichier_taille: fichier.taille,
      });
      if (error) {
        await supabase.storage.from('coffre').remove([chemin]);
        throw error;
      }
      router.back();
    } catch {
      setErreur('Le document n’a pas pu être rangé. Vérifiez votre connexion et réessayez.');
    } finally {
      setOccupe(false);
    }
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => router.back()}
            style={styles.retour}
            accessibilityRole="button"
            accessibilityLabel="Retour au coffre">
            <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
          </Pressable>
          <Text style={styles.titre} accessibilityRole="header">
            Ranger un document
          </Text>

          {fichier ? (
            <View style={styles.apercu}>
              {fichier.image ? (
                <Image source={{ uri: fichier.uri }} style={styles.image} contentFit="cover" accessibilityLabel="Aperçu" />
              ) : (
                <View style={styles.pdf}>
                  <Icone nom="document" couleur={couleurs.pin} taille={28} />
                  <Text style={styles.nomFichier} numberOfLines={2}>
                    {fichier.nom}
                  </Text>
                </View>
              )}
              <Pressable onPress={() => setFichier(null)} accessibilityRole="button">
                <Text style={styles.lien}>Changer de fichier</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.sources}>
              <Source icone="photo" libelle="Prendre une photo" detail="Recadrez ensuite le document" onPress={photographier} />
              <Source icone="document" libelle="Choisir une photo" detail="Depuis vos photos" onPress={choisirPhoto} />
              <Source icone="docs" libelle="Choisir un fichier" detail="PDF ou image, 20 Mo maximum" onPress={choisirFichier} />
            </View>
          )}

          {coffre ? <FormulaireDocument valeurs={valeurs} onChange={setValeurs} coffre={coffre} /> : null}

          <MessageErreur message={erreur} />
          <BoutonPrincipal libelle="Ranger dans le coffre" onPress={ranger} occupe={occupe} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Source({ icone, libelle, detail, onPress }: { icone: NomIcone; libelle: string; detail: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.source, pressed && styles.appuye]} accessibilityRole="button">
      <View style={styles.sourceIcone}>
        <Icone nom={icone} couleur={couleurs.pin} taille={22} epaisseur={1.8} />
      </View>
      <View style={styles.sourceTextes}>
        <Text style={styles.sourceLibelle}>{libelle}</Text>
        <Text style={styles.sourceDetail}>{detail}</Text>
      </View>
    </Pressable>
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
  titre: { fontFamily: polices.titreFort, fontSize: 28, letterSpacing: -1.1, lineHeight: 30, color: couleurs.texte },
  sources: { gap: 8 },
  source: {
    backgroundColor: couleurs.carte,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  appuye: { opacity: 0.8 },
  sourceIcone: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: couleurs.menthe,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceTextes: { flex: 1, gap: 1 },
  sourceLibelle: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.texte },
  sourceDetail: { fontFamily: polices.interface, fontSize: 12.5, color: couleurs.texteSecondaire },
  apercu: { gap: 8, alignItems: 'flex-start' },
  image: { width: '100%', aspectRatio: 3 / 4, borderRadius: 22, backgroundColor: couleurs.piste },
  pdf: {
    width: '100%',
    backgroundColor: couleurs.carte,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nomFichier: { flex: 1, fontFamily: polices.interfaceGras, fontSize: 14.5, color: couleurs.texte },
  lien: { fontFamily: polices.interfaceTresGras, fontSize: 13.5, color: couleurs.pin, textDecorationLine: 'underline' },
});
