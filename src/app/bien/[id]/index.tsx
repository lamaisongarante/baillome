import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { Icone } from '@/components/icones';
import { LIBELLES, complements, useFiche } from '@/lib/biens';
import { chargerOccupation, type Occupation } from '@/lib/locataires';
import { LIBELLES_TYPE_BAIL, estColocation, nomComplet } from '@/lib/personnes';
import { pourcentage, rubriques, type CodeRubrique, type EtatRubrique } from '@/lib/completude';
import { versDateFrancaise, versTexteNombre } from '@/lib/saisie';
import { couleurs, polices } from '@/theme/tokens';

const PRESENTATION: Record<CodeRubrique, { titre: string; detail: string }> = {
  identite: { titre: 'Identité du bien', detail: 'Adresse, identifiant fiscal, période de construction, copropriété' },
  surfaces: { titre: 'Surfaces et pièces', detail: 'Surface habitable, pièces, hauteur sous plafond, annexes' },
  energie: { titre: 'Énergie', detail: 'Classe DPE, date du diagnostic, dépenses estimées' },
  equipements: { titre: 'Équipements', detail: 'Chauffage, eau chaude, cuisine, sanitaires, mobilier' },
  assurances: { titre: 'Assurances', detail: 'Propriétaire non occupant, attestation du locataire' },
};

/** Fiche du bien, d'après la maquette 14 bis : compléter à son rythme. */
export default function FicheBien() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const marges = useSafeAreaInsets();
  const { fiche, introuvable, recharger } = useFiche(id);
  const [occupation, setOccupation] = useState<Occupation | null | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      recharger();
      chargerOccupation(id).then(setOccupation);
      return () => setStatusBarStyle('dark');
    }, [recharger, id]),
  );

  if (introuvable) {
    return (
      <View style={[styles.page, { paddingTop: marges.top + 40, padding: 22 }]}>
        <Text style={styles.detail}>Ce bien est introuvable.</Text>
      </View>
    );
  }
  if (!fiche) return <View style={styles.page} />;

  const b = fiche.bien;
  const etats = rubriques(b, complements(fiche));
  const pct = pourcentage(etats);
  const resume = [
    b.commune,
    b.surface_habitable ? `${versTexteNombre(b.surface_habitable)} m²` : null,
    b.situation_locative ? LIBELLES.situation_locative[b.situation_locative as keyof typeof LIBELLES.situation_locative] : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const ouvrir = (code: string) => router.push(`/bien/${b.id}/${code}` as Href);

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: marges.bottom + 28 }}>
      <BandeauPin style={[styles.bandeau, { paddingTop: marges.top + 12 }]}>
        <View style={styles.barre}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.boutonRond}
            accessibilityRole="button"
            accessibilityLabel="Retour">
            <Icone nom="retour" couleur={couleurs.surPin} taille={20} epaisseur={2} />
          </Pressable>
          <Text style={styles.legende}>
            BIEN N° {String(b.numero).padStart(2, '0')}
            {b.commune ? ` · ${b.commune.toUpperCase()}` : ''}
          </Text>
          <View style={styles.boutonRondVide} />
        </View>
        <View style={styles.ligneTitre}>
          <Text style={styles.titre} accessibilityRole="header">
            {LIBELLES.type_bien[b.type_bien as keyof typeof LIBELLES.type_bien] ?? 'Bien'}
          </Text>
          <Text style={styles.pourcentage} accessibilityLabel={`Fiche complète à ${pct} pour cent`}>
            {pct}
            <Text style={styles.signe}>%</Text>
          </Text>
        </View>
        {resume ? <Text style={styles.resume}>{resume}</Text> : null}
        <View style={styles.jauge}>
          <View style={[styles.jaugePleine, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.message}>Plus la fiche est complète, plus votre check-up est précis.</Text>
      </BandeauPin>

      <View style={styles.liste}>
        {occupation !== undefined ? <CarteLocataires bienId={b.id} occupation={occupation} /> : null}

        {etats.map((e) => (
          <CarteRubrique key={e.code} etat={e} onPress={() => ouvrir(e.code)} />
        ))}

        <Pressable onPress={() => ouvrir('diagnostics')} style={({ pressed }) => [styles.carte, pressed && styles.appuye]} accessibilityRole="button">
          <View style={styles.texteCarte}>
            <Text style={styles.titreCarte}>Diagnostics</Text>
            <Text style={styles.detail}>Électricité, gaz, plomb, amiante, état des risques</Text>
          </View>
          <View style={styles.pastilleNeutre}>
            <Text style={styles.pastilleTexte}>{fiche.diagnostics.length}</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => ouvrir('notes')} style={[styles.carte, styles.carteNotes]} accessibilityRole="button">
          <View style={styles.texteCarte}>
            <Text style={styles.titreCarte}>Notes</Text>
            <Text style={styles.detail} numberOfLines={1}>
              {b.notes || 'Accès, digicode, artisans, souvenirs de visite…'}
            </Text>
          </View>
          <View style={styles.pastilleNeutre}>
            <Text style={styles.pastilleTexte}>Libre</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => router.push(`/checkup/${b.id}`)} style={styles.checkup} accessibilityRole="button">
          <Text style={styles.checkupTexte}>Faire le check-up de ce bien</Text>
          <View style={styles.pastilleFleche}>
            <Icone nom="fleche" couleur={couleurs.pin} taille={14} epaisseur={2.6} />
          </View>
        </Pressable>
        <Pressable onPress={() => router.push(`/checkup/resultat/${b.id}`)} style={styles.lienResultat} accessibilityRole="button">
          <Text style={styles.lienResultatTexte}>Voir le dernier résultat</Text>
        </Pressable>

        <View style={styles.scan}>
          <Text style={styles.scanTexte}>Scanner le bail pour remplir · bientôt disponible</Text>
        </View>
        <Text style={styles.rythme}>Vous pouvez compléter plus tard, à votre rythme.</Text>
      </View>
    </ScrollView>
  );
}

/** Locataires du bail en cours, et accès à leur fiche (maquette 06). */
function CarteLocataires({ bienId, occupation }: { bienId: string; occupation: Occupation | null }) {
  const ajouter = () => router.push(`/locataire/nouveau/modifier?bien=${bienId}` as Href);
  if (!occupation) {
    return (
      <Pressable onPress={ajouter} style={({ pressed }) => [styles.carte, pressed && styles.appuye]} accessibilityRole="button">
        <View style={styles.texteCarte}>
          <Text style={styles.titreCarte}>Locataire</Text>
          <Text style={styles.detail}>Ajoutez votre locataire actuel et son garant</Text>
        </View>
        <View style={styles.pastilleNeutre}>
          <Text style={styles.pastilleTexte}>Ajouter</Text>
        </View>
      </Pressable>
    );
  }
  const { bail, locataires } = occupation;
  const coloc = estColocation(locataires.length, bail.locataires_couple);
  return (
    <View style={styles.carteLocataires}>
      <Text style={styles.titreCarte}>{coloc ? 'Colocataires' : locataires.length > 1 ? 'Locataires' : 'Locataire'}</Text>
      <Text style={styles.detail}>
        {LIBELLES_TYPE_BAIL[bail.type_bail]}
        {bail.date_effet ? ` · depuis le ${versDateFrancaise(bail.date_effet)}` : ''}
      </Text>
      {locataires.map((l) => (
        <Pressable
          key={l.id}
          onPress={() => router.push(`/locataire/${l.id}` as Href)}
          style={({ pressed }) => [styles.ligneLocataire, pressed && styles.appuye]}
          accessibilityRole="button">
          <Icone nom="locataire" couleur={couleurs.pin} taille={18} epaisseur={1.9} />
          <Text style={styles.nomLocataire}>{nomComplet(l)}</Text>
          <Icone nom="chevron" couleur={couleurs.pin} taille={16} epaisseur={2} />
        </Pressable>
      ))}
      {bail.type_bail !== 'garage' ? (
        <Pressable onPress={ajouter} style={styles.lienAjout} accessibilityRole="button">
          <Text style={styles.lienAjoutTexte}>+ Ajouter un locataire à ce bail</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CarteRubrique({ etat, onPress }: { etat: EtatRubrique; onPress: () => void }) {
  const complete = etat.remplis === etat.total;
  const commencee = etat.remplis > 0;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.carte, pressed && styles.appuye]}
      accessibilityRole="button"
      accessibilityLabel={`${PRESENTATION[etat.code].titre}, ${etat.remplis} sur ${etat.total}`}>
      <View style={styles.texteCarte}>
        <Text style={styles.titreCarte}>{PRESENTATION[etat.code].titre}</Text>
        <Text style={styles.detail}>{PRESENTATION[etat.code].detail}</Text>
      </View>
      <View style={[styles.compteur, complete ? styles.compteurComplet : commencee ? styles.compteurEnCours : null]}>
        <Text style={styles.compteurTexte}>
          {etat.remplis} / {etat.total}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  bandeau: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 10,
  },
  barre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  boutonRond: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.pinClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonRondVide: { width: 44 },
  legende: { fontFamily: polices.technique, fontSize: 10.5, letterSpacing: 0.63, color: couleurs.surPinDiscret },
  ligneTitre: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  titre: {
    flexShrink: 1,
    fontFamily: polices.titreFort,
    fontSize: 27,
    letterSpacing: -0.95,
    lineHeight: 29,
    color: couleurs.surPin,
  },
  pourcentage: {
    fontFamily: polices.titreFort,
    fontSize: 44,
    letterSpacing: -1.8,
    lineHeight: 44,
    color: couleurs.citron,
  },
  signe: { fontSize: 18, letterSpacing: 0 },
  resume: { fontFamily: polices.interface, fontSize: 13.5, color: couleurs.surPinDoux },
  jauge: { height: 10, borderRadius: 5, backgroundColor: couleurs.pinClair, overflow: 'hidden' },
  jaugePleine: { height: '100%', borderRadius: 5, backgroundColor: couleurs.citron },
  message: { fontFamily: polices.interface, fontSize: 12.5, color: couleurs.surPinDoux },
  liste: { paddingHorizontal: 18, paddingTop: 14, gap: 8 },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appuye: { opacity: 0.8 },
  carteNotes: { backgroundColor: couleurs.transparent, borderWidth: 1.5, borderStyle: 'dashed', borderColor: couleurs.pointillesFort },
  texteCarte: { flex: 1, gap: 2 },
  titreCarte: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.texte },
  detail: { fontFamily: polices.interface, fontSize: 12, lineHeight: 16, color: couleurs.texteSecondaire },
  compteur: {
    minWidth: 46,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  compteurComplet: { backgroundColor: couleurs.citron, borderColor: couleurs.citron },
  compteurEnCours: { backgroundColor: couleurs.miel, borderColor: couleurs.miel },
  compteurTexte: { fontFamily: polices.techniqueGras, fontSize: 11, color: couleurs.pin },
  pastilleNeutre: {
    height: 26,
    borderRadius: 13,
    backgroundColor: couleurs.piste,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastilleTexte: { fontFamily: polices.techniqueGras, fontSize: 10.5, color: couleurs.texteDiscret },
  checkup: {
    marginTop: 12,
    height: 54,
    borderRadius: 27,
    backgroundColor: couleurs.pin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  checkupTexte: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.surPin },
  pastilleFleche: { width: 26, height: 26, borderRadius: 13, backgroundColor: couleurs.citron, alignItems: 'center', justifyContent: 'center' },
  lienResultat: { alignItems: 'center', paddingVertical: 6 },
  lienResultatTexte: { fontFamily: polices.interfaceTresGras, fontSize: 13.5, color: couleurs.pin, textDecorationLine: 'underline' },
  scan: {
    marginTop: 12,
    height: 54,
    borderRadius: 27,
    backgroundColor: couleurs.pin,
    opacity: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTexte: { fontFamily: polices.interfaceTresGras, fontSize: 14, color: couleurs.surPin },
  carteLocataires: { backgroundColor: couleurs.carte, borderRadius: 22, paddingVertical: 16, paddingHorizontal: 18, gap: 4 },
  ligneLocataire: {
    marginTop: 6,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: couleurs.pointilles,
  },
  nomLocataire: { flex: 1, fontFamily: polices.interfaceGras, fontSize: 15, color: couleurs.texte },
  lienAjout: { paddingTop: 8 },
  lienAjoutTexte: { fontFamily: polices.interfaceGras, fontSize: 13.5, color: couleurs.pin },
  rythme: { textAlign: 'center', fontFamily: polices.interface, fontSize: 12.5, color: couleurs.texteSecondaire },
});
