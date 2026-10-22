import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { Icone, type NomIcone } from '@/components/icones';
import { LIBELLES } from '@/lib/biens';
import { chargerFicheLocataire, type FicheLocataire, type Garantie } from '@/lib/locataires';
import { LIBELLES_TYPE_GARANT, afficherTelephone, nomComplet } from '@/lib/personnes';
import { versDateFrancaise } from '@/lib/saisie';
import { couleurs, polices } from '@/theme/tokens';

/** Fiche locataire, d'après la maquette 06. */
export default function EcranLocataire() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const marges = useSafeAreaInsets();
  const [fiche, setFiche] = useState<FicheLocataire | null | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      chargerFicheLocataire(id).then(setFiche);
      return () => setStatusBarStyle('dark');
    }, [id]),
  );

  if (fiche === null) {
    return (
      <View style={[styles.page, { paddingTop: marges.top + 40, padding: 22 }]}>
        <Text style={styles.texteDoux}>Cette fiche est introuvable.</Text>
      </View>
    );
  }
  if (!fiche) return <View style={styles.page} />;

  const { personne: p, bail, bien, garanties, attestation } = fiche;
  const sousTitre = bien
    ? [LIBELLES.type_bien[bien.type_bien as keyof typeof LIBELLES.type_bien] ?? 'Bien', bien.commune].filter(Boolean).join(' · ')
    : null;
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const attestationValide = !!attestation?.date_fin_validite && attestation.date_fin_validite >= aujourdhui;

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: marges.bottom + 28 }}>
      <BandeauPin style={[styles.bandeau, { paddingTop: marges.top + 12 }]}>
        <View style={styles.barre}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.boutonRond}
            accessibilityRole="button"
            accessibilityLabel="Retour">
            <Icone nom="retour" couleur={couleurs.surPin} taille={18} epaisseur={2} />
          </Pressable>
          <Text style={styles.legende}>
            LOCATAIRE{bien ? ` · BIEN N° ${String(bien.numero).padStart(2, '0')}` : ''}
          </Text>
          <Pressable
            onPress={() => router.push(`/locataire/${p.id}/modifier` as Href)}
            style={styles.boutonRond}
            accessibilityRole="button"
            accessibilityLabel="Modifier la fiche">
            <Icone nom="crayon" couleur={couleurs.surPin} taille={18} epaisseur={1.8} />
          </Pressable>
        </View>
        <View style={styles.identite}>
          <View style={styles.avatar}>
            <Icone nom="locataire" couleur={couleurs.pin} taille={28} epaisseur={2} />
          </View>
          <View style={styles.identiteTexte}>
            <Text style={styles.titre} accessibilityRole="header">
              {nomComplet(p)}
            </Text>
            {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
          </View>
        </View>
        <View style={styles.pilules}>
          {bail?.date_effet ? (
            <View style={styles.pilule}>
              {bail.statut === 'en_cours' ? <View style={styles.point} /> : null}
              <Text style={styles.piluleTexte}>
                {bail.statut === 'en_cours' ? 'En place depuis le ' : 'Entré le '}
                {versDateFrancaise(bail.date_effet)}
              </Text>
            </View>
          ) : null}
          {garanties.length > 0 ? (
            <View style={styles.pilule}>
              <Text style={styles.piluleTexte}>
                {garanties.length} garant{garanties.length > 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}
          {p.etudiant || p.apprenti ? (
            <View style={styles.pilule}>
              <Text style={styles.piluleTexte}>{p.etudiant ? 'Étudiant' : 'Apprenti'}</Text>
            </View>
          ) : null}
        </View>
      </BandeauPin>

      <View style={styles.corps}>
        <Text style={styles.h2}>Contact</Text>
        <View style={styles.carteListe}>
          <LigneContact icone="telephone" libelle="TÉLÉPHONE" valeur={afficherTelephone(p.telephone)} vide="Non renseigné" />
          <LigneContact icone="email" libelle="EMAIL" valeur={p.email} vide="Non renseigné" />
          <LigneContact
            icone="lieu"
            libelle="ADRESSE APRÈS LE DÉPART"
            valeur={p.adresse_apres_depart}
            vide="Renseignée à l’état des lieux de sortie"
            derniere
          />
        </View>
        {p.email ? (
          <Text style={styles.note}>
            {p.accord_email_le
              ? `Accord pour recevoir ses documents par email, donné le ${versDateFrancaise(p.accord_email_le)}.`
              : 'Pas encore d’accord pour recevoir ses documents par email : ils lui seront remis en PDF.'}
          </Text>
        ) : null}

        <Text style={[styles.h2, styles.espaceSection]}>Assurance habitation</Text>
        <Pressable
          onPress={() => bien && router.push(`/bien/${bien.id}/assurances` as Href)}
          style={styles.carte}
          accessibilityRole="button">
          {attestation ? (
            <>
              <View style={styles.ligneEntre}>
                <Text style={styles.carteTitre}>Attestation{attestation.annee ? ` ${attestation.annee}` : ''}</Text>
                <View style={[styles.etiquette, attestationValide ? styles.etiquetteOk : styles.etiquetteAlerte]}>
                  <Text style={[styles.etiquetteTexte, !attestationValide && styles.etiquetteTexteAlerte]}>
                    {attestationValide ? 'OK · REÇUE' : 'EXPIRÉE'}
                  </Text>
                </View>
              </View>
              {attestation.date_fin_validite ? (
                <Text style={styles.texteDoux}>Valable jusqu’au {versDateFrancaise(attestation.date_fin_validite)}.</Text>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.carteTitre}>Aucune attestation enregistrée</Text>
              <Text style={styles.texteDoux}>
                Votre locataire doit s’assurer contre les risques locatifs et vous en justifier chaque année. Ajoutez son
                attestation dans la fiche du bien, rubrique Assurances.
              </Text>
            </>
          )}
        </Pressable>

        <View style={[styles.ligneEntre, styles.espaceSection]}>
          <Text style={styles.h2}>{garanties.length > 1 ? 'Garants' : 'Garant'}</Text>
        </View>
        {garanties.map((g) => (
          <CarteGarant key={g.cautionnementId} garantie={g} />
        ))}
        {bail ? (
          <Pressable
            onPress={() => router.push(`/garant/nouveau?bail=${bail.id}&locataire=${p.id}` as Href)}
            style={({ pressed }) => [styles.ajouter, pressed && styles.appuye]}
            accessibilityRole="button">
            <Icone nom="plus" couleur={couleurs.pin} taille={18} epaisseur={2} />
            <Text style={styles.ajouterTexte}>Ajouter un garant ou une garantie Visale</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

function LigneContact({
  icone,
  libelle,
  valeur,
  vide,
  derniere = false,
}: {
  icone: NomIcone;
  libelle: string;
  valeur: string | null;
  vide: string;
  derniere?: boolean;
}) {
  return (
    <View style={[styles.ligneContact, !derniere && styles.ligneSeparee]}>
      <View style={styles.pastilleIcone}>
        <Icone nom={icone} couleur={couleurs.pin} taille={18} epaisseur={1.8} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.libelle}>{libelle}</Text>
        {valeur ? <Text style={styles.valeur}>{valeur}</Text> : <Text style={styles.valeurVide}>{vide}</Text>}
      </View>
    </View>
  );
}

function CarteGarant({ garantie }: { garantie: Garantie }) {
  const g = garantie.garant;
  const detail =
    g.type_garant === 'visale'
      ? LIBELLES_TYPE_GARANT.visale
      : garantie.signe_le
        ? `Acte de cautionnement signé le ${versDateFrancaise(garantie.signe_le)}`
        : 'Acte de cautionnement à faire signer';
  return (
    <Pressable
      onPress={() => router.push(`/garant/${g.id}` as Href)}
      style={({ pressed }) => [styles.carteGarant, pressed && styles.appuye]}
      accessibilityRole="button">
      <View style={styles.avatarGarant}>
        <Icone nom={g.type_garant === 'visale' ? 'bouclier' : 'locataire'} couleur={couleurs.pin} taille={22} epaisseur={2} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.garantNom}>{nomComplet(g)}</Text>
        <Text style={styles.texteDoux}>{detail}</Text>
      </View>
      <Icone nom="chevron" couleur={couleurs.pin} taille={18} epaisseur={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  flex: { flex: 1 },
  bandeau: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingHorizontal: 24, paddingBottom: 24 },
  barre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 },
  boutonRond: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.pinClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legende: { fontFamily: polices.technique, fontSize: 11, letterSpacing: 0.66, color: couleurs.surPinDiscret },
  identite: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: couleurs.citron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identiteTexte: { flex: 1, gap: 3 },
  titre: { fontFamily: polices.titreFort, fontSize: 27, letterSpacing: -0.95, lineHeight: 29, color: couleurs.surPin },
  sousTitre: { fontFamily: polices.interface, fontSize: 14, color: couleurs.surPinDoux },
  pilules: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pilule: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: couleurs.pinClair,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  point: { width: 8, height: 8, borderRadius: 4, backgroundColor: couleurs.citron },
  piluleTexte: { fontFamily: polices.interfaceGras, fontSize: 12.5, color: couleurs.surPin },
  corps: { paddingHorizontal: 24 },
  h2: { marginTop: 24, fontFamily: polices.titre, fontSize: 24, letterSpacing: -0.72, color: couleurs.texte },
  espaceSection: { marginTop: 26 },
  carteListe: { marginTop: 12, backgroundColor: couleurs.carte, borderRadius: 26, paddingVertical: 6, paddingHorizontal: 18 },
  ligneContact: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8 },
  ligneSeparee: { borderBottomWidth: 1, borderStyle: 'dashed', borderBottomColor: couleurs.pointilles },
  pastilleIcone: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: couleurs.piste,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libelle: { fontFamily: polices.technique, fontSize: 10.5, color: couleurs.texteDiscret },
  valeur: { fontFamily: polices.interfaceGras, fontSize: 14.5, color: couleurs.texte },
  valeurVide: { fontFamily: polices.interface, fontSize: 13.5, color: couleurs.texteSecondaire },
  note: { marginTop: 10, fontFamily: polices.interface, fontSize: 12.5, lineHeight: 18, color: couleurs.texteSecondaire },
  carte: { marginTop: 12, backgroundColor: couleurs.carte, borderRadius: 26, paddingVertical: 16, paddingHorizontal: 18, gap: 10 },
  ligneEntre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  carteTitre: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.texte },
  etiquette: { height: 26, paddingHorizontal: 10, borderRadius: 13, justifyContent: 'center' },
  etiquetteOk: { backgroundColor: couleurs.citron },
  etiquetteAlerte: { backgroundColor: couleurs.corail },
  etiquetteTexte: { fontFamily: polices.techniqueGras, fontSize: 11, color: couleurs.pin },
  etiquetteTexteAlerte: { color: couleurs.texteCorail },
  texteDoux: { fontFamily: polices.interface, fontSize: 13, lineHeight: 19, color: couleurs.texteSecondaire },
  carteGarant: {
    marginTop: 12,
    backgroundColor: couleurs.carte,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    borderRadius: 26,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarGarant: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.miel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garantNom: { fontFamily: polices.interfaceTresGras, fontSize: 16, color: couleurs.texte },
  ajouter: {
    marginTop: 10,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: couleurs.pointillesFort,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ajouterTexte: { fontFamily: polices.interfaceGras, fontSize: 15, color: couleurs.texte },
  appuye: { opacity: 0.85 },
});
