import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { Icone } from '@/components/icones';
import { LigneDocument } from '@/components/ligne-document';
import { LIBELLES } from '@/lib/biens';
import { aujourdhui, chargerCoffre, TYPES_DOCUMENT, type Coffre, type TypeDocument } from '@/lib/coffre';
import { alertes, correspond, regrouper, statutDocument, type Critere } from '@/lib/statut-document';
import { couleurs, ombreUrgente, polices } from '@/theme/tokens';

function nomBien(coffre: Coffre | null, bienId: string | null, sinon: string) {
  const b = coffre?.biens.find((x) => x.id === bienId);
  if (!b) return sinon;
  const type = LIBELLES.type_bien[b.type_bien as keyof typeof LIBELLES.type_bien] ?? 'Bien';
  return b.commune ? `${type} · ${b.commune}` : type;
}

/** Le coffre, d'après la maquette 15 : tout au même endroit. */
export default function LeCoffre() {
  const marges = useSafeAreaInsets();
  const [coffre, setCoffre] = useState<Coffre | null>(null);
  const [recherche, setRecherche] = useState('');
  const [critere, setCritere] = useState<Critere>('bien');
  const jour = aujourdhui();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      chargerCoffre().then(setCoffre);
      return () => setStatusBarStyle('dark');
    }, []),
  );

  // « Entité » n'apparaît que si le bailleur en a plusieurs (spec § 5).
  const criteres: { valeur: Critere; libelle: string }[] = [
    { valeur: 'bien', libelle: 'Bien' },
    { valeur: 'locataire', libelle: 'Locataire' },
    ...(coffre && coffre.entites.length > 1 ? [{ valeur: 'entite' as Critere, libelle: 'Entité' }] : []),
    { valeur: 'type', libelle: 'Type' },
  ];

  const documents = useMemo(
    () => (coffre?.documents ?? []).filter((d) => !recherche.trim() || correspond(d.titre, recherche)),
    [coffre, recherche],
  );
  const aRenouveler = alertes(documents, jour);
  const groupes = regrouper(documents, critere);
  const total = coffre?.documents.length ?? 0;
  const nbBiens = coffre?.biens.length ?? 0;

  function nomGroupe(cle: string) {
    if (!coffre) return '';
    switch (critere) {
      case 'bien':
        return nomBien(coffre, cle, 'Sans bien rattaché');
      case 'locataire': {
        const p = coffre.personnes.find((x) => x.id === cle);
        return p ? [p.prenom, p.nom].filter(Boolean).join(' ') : 'Sans locataire';
      }
      case 'entite':
        return coffre.entites.find((x) => x.id === cle)?.nom ?? 'Sans entité';
      case 'type':
        return TYPES_DOCUMENT[cle as TypeDocument] ?? 'Divers';
    }
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <BandeauPin style={[styles.bandeau, { paddingTop: marges.top + 16 }]}>
          <View style={styles.ligneTitre}>
            <View>
              <Text style={styles.titre} accessibilityRole="header">
                Le coffre
              </Text>
              <Text style={styles.compte}>
                {total} document{total > 1 ? 's' : ''} · {nbBiens} bien{nbBiens > 1 ? 's' : ''}
              </Text>
            </View>
            {coffre ? <Text style={styles.grandNombre}>{total}</Text> : null}
          </View>
          <View style={styles.recherche}>
            <Icone nom="loupe" couleur={couleurs.surPinDiscret} taille={18} />
            <TextInput
              value={recherche}
              onChangeText={setRecherche}
              placeholder="Rechercher un document"
              placeholderTextColor={couleurs.surPinDiscret}
              style={styles.rechercheSaisie}
              accessibilityLabel="Rechercher un document"
            />
          </View>
        </BandeauPin>

        <View style={styles.corps}>
          <Text style={styles.legende}>CLASSER PAR</Text>
          <View style={styles.criteres} accessibilityRole="radiogroup" accessibilityLabel="Classer par">
            {criteres.map((c) => (
              <Pressable
                key={c.valeur}
                onPress={() => setCritere(c.valeur)}
                accessibilityRole="radio"
                accessibilityState={{ checked: critere === c.valeur }}
                style={[styles.critere, critere === c.valeur && styles.critereActif]}>
                <Text style={[styles.critereTexte, critere === c.valeur && styles.critereTexteActif]}>{c.libelle}</Text>
              </Pressable>
            ))}
          </View>

          {aRenouveler.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => router.push({ pathname: '/document/[id]', params: { id: d.id } })}
              style={styles.alerte}
              accessibilityRole="button">
              <View style={styles.alerteIcone}>
                <Text style={styles.alerteExclamation}>!</Text>
              </View>
              <View style={styles.alerteTextes}>
                <Text style={styles.alerteTitre}>
                  {d.titre} · {statutDocument(d, jour) === 'expire' ? 'expiré' : 'à renouveler'}
                </Text>
                <Text style={styles.alerteDetail}>{nomBien(coffre, d.bien_id, 'Document général')}</Text>
              </View>
              <Icone nom="fleche" couleur={couleurs.pin} taille={16} epaisseur={2.2} />
            </Pressable>
          ))}

          {coffre && documents.length === 0 ? (
            <View style={styles.vide}>
              <Text style={styles.videTexte}>
                {recherche.trim()
                  ? 'Aucun document ne correspond à votre recherche.'
                  : 'Votre coffre est vide. Touchez « Scanner » pour ranger votre premier document.'}
              </Text>
            </View>
          ) : null}

          {groupes.map((g) => (
            <View key={g.cle} style={styles.groupe}>
              <View style={styles.ligneGroupe}>
                <Text style={styles.nomGroupe}>{nomGroupe(g.cle)}</Text>
                <Text style={styles.legende}>
                  {g.documents.length} DOC{g.documents.length > 1 ? 'S' : ''}
                </Text>
              </View>
              <View style={styles.carte}>
                {g.documents.map((d, i) => (
                  <LigneDocument key={d.id} doc={d} jour={jour} premier={i === 0} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push('/document/nouveau')}
        style={({ pressed }) => [styles.scanner, pressed && styles.appuye]}
        accessibilityRole="button"
        accessibilityLabel="Scanner un document">
        <Icone nom="scanner" couleur={couleurs.pin} taille={18} epaisseur={2} />
        <Text style={styles.scannerTexte}>Scanner</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  bandeau: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 14,
  },
  ligneTitre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  titre: { fontFamily: polices.titreFort, fontSize: 28, letterSpacing: -1, color: couleurs.surPin },
  compte: { fontFamily: polices.interface, fontSize: 13, color: couleurs.surPinDoux },
  grandNombre: { fontFamily: polices.titreFort, fontSize: 44, letterSpacing: -1.8, color: couleurs.citron },
  recherche: {
    height: 48,
    borderRadius: 24,
    backgroundColor: couleurs.pinClair,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  rechercheSaisie: { flex: 1, fontFamily: polices.interface, fontSize: 14.5, color: couleurs.surPin },
  corps: { paddingHorizontal: 18, paddingTop: 16, gap: 12 },
  legende: { fontFamily: polices.techniqueGras, fontSize: 10.5, color: couleurs.texteDiscret },
  criteres: { flexDirection: 'row', backgroundColor: couleurs.piste, borderRadius: 24, padding: 4, gap: 4 },
  critere: { flex: 1, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  critereActif: { backgroundColor: couleurs.citron },
  critereTexte: { fontFamily: polices.interfaceGras, fontSize: 13.5, color: couleurs.texte },
  critereTexteActif: { fontFamily: polices.interfaceTresGras },
  alerte: {
    backgroundColor: couleurs.carte,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...ombreUrgente,
  },
  alerteIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: couleurs.corail,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alerteExclamation: { fontFamily: polices.interfaceTresGras, fontSize: 16, color: couleurs.texteCorail },
  alerteTextes: { flex: 1, gap: 1 },
  alerteTitre: { fontFamily: polices.interfaceTresGras, fontSize: 14.5, color: couleurs.texte },
  alerteDetail: { fontFamily: polices.interface, fontSize: 12, color: couleurs.texteSecondaire },
  vide: { backgroundColor: couleurs.carte, borderRadius: 22, padding: 18 },
  videTexte: { fontFamily: polices.interface, fontSize: 14, lineHeight: 20, color: couleurs.texteSecondaire },
  groupe: { gap: 8, marginTop: 6 },
  ligneGroupe: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  nomGroupe: { fontFamily: polices.titre, fontSize: 18, letterSpacing: -0.4, color: couleurs.texte },
  carte: { backgroundColor: couleurs.carte, borderRadius: 22, paddingHorizontal: 14 },
  scanner: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 22,
    backgroundColor: couleurs.citron,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0px 6px 16px rgba(14,59,46,0.25)',
  },
  appuye: { opacity: 0.85 },
  scannerTexte: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.pin },
});
