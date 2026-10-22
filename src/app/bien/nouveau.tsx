import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChampAdresse } from '@/components/champ-adresse';
import { GrilleChoix, PilulesChoix, SelecteurDpe } from '@/components/choix';
import { BoutonPrincipal, Champ, EnTeteEtape, MessageErreur, MessageInfo } from '@/components/formulaire';
import { Icone } from '@/components/icones';
import type { Adresse } from '@/lib/adresse';
import { estDansLeFutur, formaterDateEnCours, lireDateFrancaise, lireEntier, lireNombre } from '@/lib/saisie';
import { supabase } from '@/lib/supabase';
import { couleurs, polices, type ClasseDpe } from '@/theme/tokens';

type TypeBien = 'appartement' | 'maison' | 'garage' | 'autre';
type Situation = 'loue_vide' | 'loue_meuble' | 'pas_encore_loue';

const TYPES: { valeur: TypeBien; libelle: string }[] = [
  { valeur: 'appartement', libelle: 'Appartement' },
  { valeur: 'maison', libelle: 'Maison' },
  { valeur: 'garage', libelle: 'Garage' },
  { valeur: 'autre', libelle: 'Autre' },
];

const SITUATIONS: { valeur: Situation; libelle: string }[] = [
  { valeur: 'loue_vide', libelle: 'Oui, vide' },
  { valeur: 'loue_meuble', libelle: 'Oui, meublé' },
  { valeur: 'pas_encore_loue', libelle: 'Pas encore' },
];

/**
 * Premier bien (étape 2 sur 4 du parcours, maquette 14), aussi utilisé
 * pour « Ajouter un bien ». Tout tient sur une seule page.
 */
export default function NouveauBien() {
  const { parcours } = useLocalSearchParams<{ parcours?: string }>();
  const dansLeParcours = parcours === '1';

  const [type, setType] = useState<TypeBien | null>(null);
  const [adresse, setAdresse] = useState<Adresse | null>(null);
  const [surface, setSurface] = useState('');
  const [pieces, setPieces] = useState('');
  const [classeDpe, setClasseDpe] = useState<ClasseDpe | null>(null);
  const [dateDpe, setDateDpe] = useState('');
  const [sansDpe, setSansDpe] = useState(false);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [limiteAtteinte, setLimiteAtteinte] = useState(false);

  const estUnGarage = type === 'garage';

  async function enregistrer() {
    setErreur(null);
    if (!type) return setErreur('Choisissez le type de bien.');
    if (!adresse) return setErreur('Choisissez l’adresse dans la liste proposée.');

    const surfaceHabitable = surface.trim() ? lireNombre(surface) : null;
    if (surface.trim() && (surfaceHabitable === null || surfaceHabitable <= 0)) {
      return setErreur('La surface doit être un nombre, par exemple 48 ou 48,5.');
    }
    const nbPieces = pieces.trim() ? lireEntier(pieces) : null;
    if (pieces.trim() && nbPieces === null) {
      return setErreur('Le nombre de pièces doit être un nombre entier, par exemple 2.');
    }

    let dateDpeIso: string | null = null;
    if (!sansDpe && dateDpe.trim()) {
      dateDpeIso = lireDateFrancaise(dateDpe);
      if (!dateDpeIso) return setErreur('La date du DPE doit être au format JJ/MM/AAAA, par exemple 14/03/2022.');
      if (estDansLeFutur(dateDpeIso)) return setErreur('La date du DPE ne peut pas être dans le futur.');
    }

    setOccupe(true);
    const { data: entite, error: erreurEntite } = await supabase
      .from('entites')
      .select('id')
      .eq('type', 'nom_propre')
      .single();
    if (erreurEntite || !entite) {
      setOccupe(false);
      return setErreur('Impossible de retrouver votre compte. Vérifiez votre connexion et réessayez.');
    }

    const { data: bien, error } = await supabase
      .from('biens')
      .insert({
        entite_id: entite.id,
        type_bien: type,
        adresse: adresse.voie,
        code_postal: adresse.codePostal,
        commune: adresse.commune,
        code_insee: adresse.codeInsee,
        latitude: adresse.latitude,
        longitude: adresse.longitude,
        surface_habitable: estUnGarage ? null : surfaceHabitable,
        pieces_principales: estUnGarage ? null : nbPieces,
        dpe_classe: estUnGarage || sansDpe ? null : classeDpe,
        dpe_date: estUnGarage || sansDpe ? null : dateDpeIso,
        situation_locative: situation,
      })
      .select('id')
      .single();
    setOccupe(false);

    if (error) {
      if (error.message.includes('LIMITE_BIENS')) return setLimiteAtteinte(true);
      return setErreur('L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.');
    }

    if (dansLeParcours) router.replace('/parcours/scan-bail');
    else router.replace({ pathname: '/bien/[id]', params: { id: bien.id } });
  }

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          {dansLeParcours ? (
            <EnTeteEtape etape={2} total={4} titre={'Parlez-nous de\nvotre premier bien'} />
          ) : (
            <>
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                style={styles.retour}
                accessibilityRole="button"
                accessibilityLabel="Retour">
                <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
              </Pressable>
              <Text style={styles.titre} accessibilityRole="header">
                Ajouter un bien
              </Text>
            </>
          )}

          {limiteAtteinte ? (
            <View style={styles.limite}>
              <Text style={styles.limiteTitre}>Votre formule est complète</Text>
              <Text style={styles.limiteTexte}>
                Le nombre de biens inclus dans votre formule actuelle est atteint. Pour ajouter ce bien,
                passez à la formule supérieure.
              </Text>
              <BoutonPrincipal libelle="Voir les formules" onPress={() => router.push('/formules')} />
            </View>
          ) : (
            <>
              <GrilleChoix options={TYPES} valeur={type} onChange={setType} libelleGroupe="Type de bien" />

              <ChampAdresse adresse={adresse} onChange={setAdresse} />
              {adresse ? <MessageInfo>Commune reconnue : {adresse.commune} (code Insee {adresse.codeInsee}).</MessageInfo> : null}

              {!estUnGarage ? (
                <>
                  <View style={styles.deuxColonnes}>
                    <View style={styles.colonne}>
                      <Champ
                        libelle="Surface habitable (m²)"
                        value={surface}
                        onChangeText={setSurface}
                        keyboardType="decimal-pad"
                        placeholder="48"
                      />
                    </View>
                    <View style={styles.colonne}>
                      <Champ
                        libelle="Pièces principales"
                        value={pieces}
                        onChangeText={setPieces}
                        keyboardType="number-pad"
                        placeholder="2"
                      />
                    </View>
                  </View>

                  <View style={styles.bloc}>
                    <View style={styles.ligneDpe}>
                      <Text style={styles.libelle}>CLASSE DU DPE</Text>
                      <Pressable
                        onPress={() => {
                          setSansDpe(!sansDpe);
                          setClasseDpe(null);
                          setDateDpe('');
                        }}
                        accessibilityRole="button">
                        <Text style={styles.lienDpe}>{sansDpe ? 'J’ai un DPE' : 'Pas de DPE ?'}</Text>
                      </Pressable>
                    </View>
                    {sansDpe ? (
                      <MessageInfo>
                        Pas de souci : vous pourrez l’ajouter plus tard. Votre check-up vous indiquera la marche
                        à suivre.
                      </MessageInfo>
                    ) : (
                      <>
                        <SelecteurDpe valeur={classeDpe} onChange={setClasseDpe} />
                        <Champ
                          libelle="Date du DPE"
                          value={dateDpe}
                          onChangeText={(t) => setDateDpe(formaterDateEnCours(t))}
                          keyboardType="number-pad"
                          placeholder="JJ/MM/AAAA"
                          maxLength={10}
                        />
                      </>
                    )}
                  </View>
                </>
              ) : null}

              <View style={styles.bloc}>
                <Text style={styles.libelle}>IL EST LOUÉ ACTUELLEMENT ?</Text>
                <PilulesChoix
                  options={SITUATIONS}
                  valeur={situation}
                  onChange={setSituation}
                  libelleGroupe="Situation locative"
                />
              </View>

              <MessageErreur message={erreur} />
              <View style={styles.espace} />
              <BoutonPrincipal libelle="Continuer" onPress={enregistrer} occupe={occupe} />
              {dansLeParcours ? (
                <Text style={styles.ensuite}>Ensuite : scannez votre bail, on remplit le reste.</Text>
              ) : null}
            </>
          )}
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
  deuxColonnes: { flexDirection: 'row', gap: 10 },
  colonne: { flex: 1 },
  bloc: { gap: 8 },
  ligneDpe: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  libelle: { fontFamily: polices.techniqueGras, fontSize: 10.5, color: couleurs.texteDiscret },
  lienDpe: {
    fontFamily: polices.interface,
    fontSize: 12,
    color: couleurs.texteSecondaire,
    textDecorationLine: 'underline',
  },
  limite: { backgroundColor: couleurs.miel, borderRadius: 24, padding: 20, gap: 12 },
  limiteTitre: { fontFamily: polices.titre, fontSize: 20, letterSpacing: -0.4, color: couleurs.texte },
  limiteTexte: { fontFamily: polices.interface, fontSize: 14, lineHeight: 20, color: couleurs.texteMiel },
  espace: { flexGrow: 1, minHeight: 8 },
  ensuite: { textAlign: 'center', fontFamily: polices.interface, fontSize: 12.5, color: couleurs.texteSecondaire },
});
