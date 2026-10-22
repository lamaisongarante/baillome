import { question, type Question } from '@moteur/questions';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BoutonPrincipal, MessageErreur } from '@/components/formulaire';
import { Icone } from '@/components/icones';
import { LIBELLES } from '@/lib/biens';
import { enregistrerReponse, FAMILLES, lancerCheckup, messageAffiche, questionsRestantes } from '@/lib/checkup';
import { estDansLeFutur, formaterDateEnCours, lireDateFrancaise, lireNombre } from '@/lib/saisie';
import { supabase } from '@/lib/supabase';
import { couleurs, couleursDpe, ombreUrgente, polices, type ClasseDpe } from '@/theme/tokens';

const CLASSES = Object.keys(couleursDpe) as ClasseDpe[];

/** Questionnaire du check-up d'un bien, une question par écran (maquette 02). */
export default function QuestionnaireCheckup() {
  const { id, question: seule } = useLocalSearchParams<{ id: string; question?: string }>();
  const [entete, setEntete] = useState('');
  // En mise à jour d'une seule réponse, la question est connue d'emblée.
  const [restantes, setRestantes] = useState<string[] | null>(seule ? [seule] : null);
  const [repondues, setRepondues] = useState(0);
  const [valeur, setValeur] = useState('');
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [apercu, setApercu] = useState(false);
  const [loiVisible, setLoiVisible] = useState(false);

  /** Interroge le moteur : questions restantes, ou fin du questionnaire (on passe au résultat). */
  const prochainesQuestions = useCallback(async (): Promise<{ questions: string[]; apercu: boolean } | null> => {
    const r = await lancerCheckup(id);
    const b = r.biens[0];
    const q = b && !b.horsV1 ? questionsRestantes(b) : [];
    if (q.length === 0) {
      router.replace(`/checkup/resultat/${id}`);
      return null;
    }
    return { questions: q, apercu: r.apercu };
  }, [id]);

  const recalculer = useCallback(async () => {
    const r = await prochainesQuestions();
    if (r) {
      setRestantes(r.questions);
      setApercu(r.apercu);
      setValeur('');
    }
  }, [prochainesQuestions]);

  useEffect(() => {
    supabase
      .from('biens')
      .select('numero, type_bien, commune')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const type = LIBELLES.type_bien[data.type_bien as keyof typeof LIBELLES.type_bien] ?? 'Bien';
        setEntete(`BIEN N° ${String(data.numero).padStart(2, '0')} · ${type}${data.commune ? ` ${data.commune}` : ''}`.toUpperCase());
      });
    if (seule) {
      // Mise à jour d'une seule réponse, depuis la marche à suivre.
      lancerCheckup(id)
        .then((r) => setApercu(r.apercu))
        .catch(() => undefined);
      return;
    }
    prochainesQuestions()
      .then((r) => {
        if (!r) return;
        setRestantes(r.questions);
        setApercu(r.apercu);
      })
      .catch(() => setErreur('Le check-up n’a pas pu démarrer. Vérifiez votre connexion et réessayez.'));
  }, [id, prochainesQuestions, seule]);

  const q: Question | undefined = restantes ? question(restantes[0]) : undefined;
  const total = repondues + (restantes?.length ?? 0);

  async function repondre(v: string) {
    if (!q) return;
    setErreur(null);
    let aEnregistrer = v;
    if (q.type === 'date') {
      const iso = lireDateFrancaise(v);
      if (!iso) return setErreur('Indiquez la date au format JJ/MM/AAAA, par exemple 14/03/2022.');
      if (estDansLeFutur(iso)) return setErreur('Cette date ne peut pas être dans le futur.');
      aEnregistrer = iso;
    }
    if (q.type === 'nombre') {
      const n = lireNombre(v);
      if (n === null || n <= 0) return setErreur(`Indiquez un nombre${q.unite ? ` en ${q.unite}` : ''}, par exemple 2,50.`);
      aEnregistrer = String(n);
    }
    setOccupe(true);
    try {
      await enregistrerReponse(id, q.code, aEnregistrer);
      if (seule) return router.back();
      setRepondues((n) => n + 1);
      // Après chaque réponse, le moteur peut avoir besoin d'autres questions (ex. chauffage pour un DPE E, F ou G).
      if (restantes && restantes.length > 1) {
        setRestantes(restantes.slice(1));
        setValeur('');
        setLoiVisible(false);
      } else await recalculer();
    } catch {
      setErreur('La réponse n’a pas été enregistrée. Vérifiez votre connexion et réessayez.');
    } finally {
      setOccupe(false);
    }
  }

  const nsp = q?.options?.find((o) => o.valeur === 'nsp');

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <View style={styles.barre}>
            <Pressable onPress={() => router.back()} style={styles.rond} accessibilityRole="button" accessibilityLabel="Retour">
              <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
            </Pressable>
            <Text style={styles.entete} numberOfLines={1}>
              {entete}
            </Text>
            <Pressable
              onPress={() => router.replace(`/checkup/resultat/${id}`)}
              style={styles.rond}
              accessibilityRole="button"
              accessibilityLabel="Fermer le check-up">
              <Text style={styles.croix}>✕</Text>
            </Pressable>
          </View>

          {!q ? (
            <View style={styles.attente}>
              {erreur ? <MessageErreur message={erreur} /> : <ActivityIndicator color={couleurs.pin} />}
            </View>
          ) : (
            <>
              <View style={styles.ligneProgression}>
                <Text style={styles.legende}>{FAMILLES[q.regle] ?? ''}</Text>
                <Text style={styles.legende}>
                  QUESTION {String(repondues + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </Text>
              </View>
              <View style={styles.progression} accessibilityLabel={`Question ${repondues + 1} sur ${total}`}>
                {Array.from({ length: total }, (_, i) => (
                  <View key={i} style={[styles.trait, i < repondues && styles.traitFait, i === repondues && styles.traitEnCours]} />
                ))}
              </View>

              <Text style={styles.titre} accessibilityRole="header">
                {messageAffiche(q.libelle)}
              </Text>
              {q.aide ? <Text style={styles.aide}>{messageAffiche(q.aide)}</Text> : null}
              {q.loi ? (
                <Pressable onPress={() => setLoiVisible(!loiVisible)} accessibilityRole="button">
                  <Text style={styles.lienLoi}>Ce que dit la loi {loiVisible ? '↑' : '→'}</Text>
                </Pressable>
              ) : null}
              {q.loi && loiVisible ? (
                <View style={styles.loi}>
                  <Text style={styles.loiTexte}>{messageAffiche(q.loi)}</Text>
                </View>
              ) : null}

              {q.type === 'choix' ? (
                <View style={styles.choix}>
                  {q.options!.filter((o) => o.valeur !== 'nsp').map((o) => (
                    <Pressable
                      key={o.valeur}
                      onPress={() => repondre(o.valeur)}
                      disabled={occupe}
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.option, pressed && styles.optionAppuyee]}>
                      <Text style={styles.optionTexte}>{o.libelle}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {q.type === 'classe_dpe' ? (
                <View style={styles.dpe}>
                  <Text style={styles.legende}>LOGEMENT ÉCONOME</Text>
                  {CLASSES.map((c, i) => (
                    <Pressable
                      key={c}
                      onPress={() => setValeur(c)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: valeur === c }}
                      accessibilityLabel={`Classe ${c}`}
                      style={[
                        styles.barreDpe,
                        { width: `${52 + i * 8}%`, backgroundColor: couleursDpe[c].fond },
                        valeur === c && styles.barreDpeChoisie,
                      ]}>
                      <Text style={[styles.lettre, { color: couleursDpe[c].texte }]}>{c}</Text>
                      {valeur === c ? <Text style={[styles.votreClasse, { color: couleursDpe[c].texte }]}>✓ Votre classe</Text> : null}
                    </Pressable>
                  ))}
                  <Text style={styles.legende}>LOGEMENT ÉNERGIVORE</Text>
                </View>
              ) : null}

              {q.type === 'date' || q.type === 'nombre' ? (
                <View style={styles.champ}>
                  <TextInput
                    value={valeur}
                    onChangeText={(t) => setValeur(q.type === 'date' ? formaterDateEnCours(t) : t)}
                    keyboardType={q.type === 'date' ? 'number-pad' : 'decimal-pad'}
                    placeholder={q.type === 'date' ? 'JJ/MM/AAAA' : q.unite}
                    placeholderTextColor={couleurs.pointillesFort}
                    maxLength={q.type === 'date' ? 10 : 8}
                    style={styles.saisie}
                    accessibilityLabel={q.libelle}
                    autoFocus
                  />
                  {q.unite ? <Text style={styles.unite}>{q.unite}</Text> : null}
                </View>
              ) : null}

              {q.aValider && apercu ? <Text style={styles.aValider}>FORMULATION À VALIDER · APERÇU</Text> : null}
              <MessageErreur message={erreur} />
              <View style={styles.espace} />

              <View style={styles.boutons}>
                {nsp ? (
                  <Pressable onPress={() => repondre('nsp')} disabled={occupe} style={styles.nsp} accessibilityRole="button">
                    <Text style={styles.nspTexte}>Je ne sais pas</Text>
                  </Pressable>
                ) : null}
                {q.type !== 'choix' ? (
                  <View style={styles.continuer}>
                    <BoutonPrincipal libelle="Continuer" onPress={() => repondre(valeur)} occupe={occupe} desactive={!valeur} />
                  </View>
                ) : null}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, gap: 14 },
  barre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rond: { width: 44, height: 44, borderRadius: 22, backgroundColor: couleurs.carte, alignItems: 'center', justifyContent: 'center' },
  croix: { fontFamily: polices.interfaceGras, fontSize: 16, color: couleurs.pin },
  entete: { flex: 1, textAlign: 'center', fontFamily: polices.technique, fontSize: 11, letterSpacing: 0.66, color: couleurs.texteDiscret },
  attente: { paddingTop: 60, alignItems: 'center' },
  ligneProgression: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  legende: { fontFamily: polices.techniqueGras, fontSize: 11, letterSpacing: 0.66, color: couleurs.texteDiscret },
  progression: { flexDirection: 'row', gap: 4 },
  trait: { flex: 1, height: 6, borderRadius: 3, backgroundColor: couleurs.piste },
  traitFait: { backgroundColor: couleurs.pin },
  traitEnCours: { backgroundColor: couleurs.pointillesFort },
  titre: { marginTop: 16, fontFamily: polices.titreFort, fontSize: 25, letterSpacing: -0.9, lineHeight: 29, color: couleurs.texte },
  aide: { fontFamily: polices.interface, fontSize: 15, lineHeight: 22, color: couleurs.texteSecondaire },
  lienLoi: { fontFamily: polices.interfaceTresGras, fontSize: 13.5, color: couleurs.pin },
  loi: { backgroundColor: couleurs.menthe, borderRadius: 18, padding: 14 },
  loiTexte: { fontFamily: polices.interface, fontSize: 13.5, lineHeight: 20, color: couleurs.texteInfo },
  choix: { gap: 10, marginTop: 4 },
  option: {
    minHeight: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    backgroundColor: couleurs.carte,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  optionAppuyee: { backgroundColor: couleurs.citron },
  optionTexte: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.pin },
  dpe: { gap: 8 },
  barreDpe: {
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barreDpeChoisie: { borderWidth: 3, borderColor: couleurs.pin, ...ombreUrgente },
  lettre: { fontFamily: polices.interfaceTresGras, fontSize: 20 },
  votreClasse: { fontFamily: polices.interfaceTresGras, fontSize: 14 },
  champ: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  saisie: {
    flex: 1,
    backgroundColor: couleurs.carte,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontFamily: polices.interfaceGras,
    fontSize: 20,
    color: couleurs.texte,
  },
  unite: { fontFamily: polices.interfaceGras, fontSize: 17, color: couleurs.texteSecondaire },
  aValider: { fontFamily: polices.technique, fontSize: 10, color: couleurs.texteMiel },
  espace: { flexGrow: 1, minHeight: 12 },
  boutons: { flexDirection: 'row', gap: 10 },
  nsp: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nspTexte: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.pin },
  continuer: { flex: 1.4 },
});
