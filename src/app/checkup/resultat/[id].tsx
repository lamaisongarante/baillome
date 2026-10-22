import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { CarteConstat } from '@/components/carte-constat';
import { BoutonPrincipal, MessageErreur } from '@/components/formulaire';
import { Icone } from '@/components/icones';
import { lancerCheckup, ORDRE_GRAVITE, questionsRestantes, type ResultatCheckup } from '@/lib/checkup';
import { versDateFrancaise } from '@/lib/saisie';
import { couleurs, polices } from '@/theme/tokens';

/** Résultat du check-up d'un bien (maquette 03). */
export default function ResultatCheckupBien() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const marges = useSafeAreaInsets();
  const [r, setR] = useState<ResultatCheckup | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      lancerCheckup(id)
        .then(setR)
        .catch(() => setErreur('Le check-up n’a pas pu être calculé. Vérifiez votre connexion et réessayez.'));
      return () => setStatusBarStyle('dark');
    }, [id]),
  );

  const b = r?.biens[0];
  const aTraiter = (b?.constats ?? []).filter((c) => c.gravite !== 'ok').sort((x, y) => ORDRE_GRAVITE[x.gravite] - ORDRE_GRAVITE[y.gravite]);
  const urgents = aTraiter.filter((c) => c.gravite === 'critique').length;
  const titre = (code: string) => r?.regles.find((x) => x.code === code)?.titre ?? code;
  // « Déjà en règle » : règles évaluées sans point à traiter.
  const enRegle = (b?.etats ?? []).filter((e) => e.statut === 'evaluee' && !aTraiter.some((c) => c.regle === e.regle));
  const aCompleter = (b?.etats ?? []).filter((e) => e.statut === 'a_completer');
  const avecBail = (b?.etats ?? []).filter((e) => e.statut === 'necessite_bail');
  const restantes = b ? questionsRestantes(b).length : 0;

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: marges.bottom + 32 }}>
      <BandeauPin style={[styles.bandeau, { paddingTop: marges.top + 12 }]}>
        <View style={styles.barre}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.rond}
            accessibilityRole="button"
            accessibilityLabel="Retour">
            <Icone nom="retour" couleur={couleurs.surPin} taille={20} epaisseur={2} />
          </Pressable>
          {r ? <Text style={styles.legende}>RELEVÉ {versDateFrancaise(r.date).replaceAll('/', '.')}</Text> : null}
        </View>
        {b && !b.horsV1 ? (
          <>
            <Text style={styles.legende}>BIEN N° {String(b.numero).padStart(2, '0')}</Text>
            {b.score !== null ? (
              <>
                <View style={styles.ligneScore}>
                  <Text style={styles.score}>{b.score}</Text>
                  <View style={styles.surCent}>
                    <Text style={styles.cent}>/100</Text>
                    {!r!.apercu ? null : <Text style={styles.apercu}>SCORE EN APERÇU</Text>}
                  </View>
                </View>
                <View style={styles.jauge}>
                  <View style={[styles.jaugePleine, { width: `${b.score}%` }]} />
                  <View style={[styles.curseur, { left: `${b.score}%` }]} />
                </View>
              </>
            ) : null}
            <View style={styles.ligneResume}>
              <Text style={styles.resume}>
                {aTraiter.length === 0
                  ? 'Aucun point à traiter.'
                  : `${aTraiter.length} point${aTraiter.length > 1 ? 's' : ''} à traiter${urgents ? `, dont ${urgents} urgent${urgents > 1 ? 's' : ''}` : ''}.`}
              </Text>
              {b.score !== null && b.score < 100 ? (
                <View style={styles.aGagner}>
                  <Text style={styles.aGagnerTexte}>↑ {100 - b.score} points à gagner</Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}
      </BandeauPin>

      <View style={styles.corps}>
        {!r && !erreur ? <ActivityIndicator color={couleurs.pin} style={styles.attente} /> : null}
        <MessageErreur message={erreur} />
        {b?.horsV1 ? <Text style={styles.texte}>Le check-up n’est pas encore disponible pour l’outre-mer.</Text> : null}

        {restantes > 0 ? (
          <View style={styles.completer}>
            <Text style={styles.completerTexte}>
              Encore {restantes} question{restantes > 1 ? 's' : ''} pour un check-up complet.
            </Text>
            <BoutonPrincipal libelle="Compléter le check-up" onPress={() => router.push(`/checkup/${id}`)} />
          </View>
        ) : null}

        {aTraiter.length > 0 ? (
          <>
            <View style={styles.titreSection}>
              <Text style={styles.h2}>À traiter</Text>
              <Text style={styles.compteur}>
                {aTraiter.length} POINT{aTraiter.length > 1 ? 'S' : ''}
              </Text>
            </View>
            {aTraiter.map((c, i) => (
              <CarteConstat key={`${c.regle}-${c.situation}`} constat={c} rang={i + 1} />
            ))}
          </>
        ) : null}

        {enRegle.length > 0 ? (
          <>
            <View style={styles.titreSection}>
              <Text style={styles.h2}>Déjà en règle</Text>
              <Text style={styles.compteur}>
                {enRegle.length} POINT{enRegle.length > 1 ? 'S' : ''}
              </Text>
            </View>
            <View style={styles.liste}>
              {enRegle.map((e, i) => (
                <View key={e.regle} style={[styles.ligne, i > 0 && styles.separateur]}>
                  <Text style={styles.ligneTexte}>{titre(e.regle)}</Text>
                  <View style={styles.ok}>
                    <Text style={styles.okTexte}>OK</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {aCompleter.length + avecBail.length > 0 ? (
          <>
            <View style={styles.titreSection}>
              <Text style={styles.h2}>À venir</Text>
            </View>
            <View style={styles.liste}>
              {[...aCompleter, ...avecBail].map((e, i) => (
                <View key={e.regle} style={[styles.ligne, i > 0 && styles.separateur]}>
                  <Text style={styles.ligneTexte}>{titre(e.regle)}</Text>
                  <Text style={styles.etat}>{e.statut === 'a_completer' ? 'À COMPLÉTER' : 'AVEC LE BAIL'}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  bandeau: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingHorizontal: 22, paddingBottom: 26, gap: 12 },
  barre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rond: { width: 44, height: 44, borderRadius: 22, backgroundColor: couleurs.pinClair, alignItems: 'center', justifyContent: 'center' },
  legende: { fontFamily: polices.technique, fontSize: 11, letterSpacing: 0.66, color: couleurs.surPinDiscret },
  ligneScore: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  score: { fontFamily: polices.titreFort, fontSize: 110, letterSpacing: -6, lineHeight: 110, color: couleurs.citron },
  surCent: { paddingBottom: 18, gap: 4 },
  cent: { fontFamily: polices.titreMoyen, fontSize: 24, color: couleurs.surPinDiscret },
  apercu: { fontFamily: polices.technique, fontSize: 9.5, color: couleurs.surPinDiscret },
  jauge: { height: 22, justifyContent: 'center' },
  jaugePleine: { position: 'absolute', left: 0, height: 12, borderRadius: 6, backgroundColor: couleurs.citron },
  curseur: {
    position: 'absolute',
    width: 22,
    height: 22,
    marginLeft: -11,
    borderRadius: 11,
    backgroundColor: couleurs.alerte,
    borderWidth: 3,
    borderColor: couleurs.pin,
  },
  ligneResume: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  resume: { flex: 1, fontFamily: polices.interface, fontSize: 14.5, lineHeight: 20, color: couleurs.surPinDoux },
  aGagner: { backgroundColor: couleurs.citron, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  aGagnerTexte: { fontFamily: polices.interfaceTresGras, fontSize: 13, color: couleurs.pin },
  corps: { paddingHorizontal: 18, paddingTop: 20, gap: 12 },
  attente: { marginTop: 30 },
  texte: { fontFamily: polices.interface, fontSize: 14.5, lineHeight: 21, color: couleurs.texteSecondaire },
  completer: { backgroundColor: couleurs.carte, borderRadius: 24, padding: 18, gap: 12 },
  completerTexte: { fontFamily: polices.interfaceGras, fontSize: 14.5, color: couleurs.texte },
  titreSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 },
  h2: { fontFamily: polices.titre, fontSize: 26, letterSpacing: -0.8, color: couleurs.texte },
  compteur: { fontFamily: polices.technique, fontSize: 11, color: couleurs.texteDiscret },
  liste: { backgroundColor: couleurs.carte, borderRadius: 24, paddingHorizontal: 18 },
  ligne: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 10 },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.pointilles, borderStyle: 'dashed' },
  ligneTexte: { flex: 1, fontFamily: polices.interfaceGras, fontSize: 14.5, color: couleurs.texte },
  ok: { height: 26, borderRadius: 13, paddingHorizontal: 10, backgroundColor: couleurs.citron, justifyContent: 'center' },
  okTexte: { fontFamily: polices.techniqueGras, fontSize: 11, color: couleurs.pin },
  etat: { fontFamily: polices.technique, fontSize: 10, color: couleurs.texteDiscret },
});
