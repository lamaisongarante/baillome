import { Link, router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { BoutonAjouterBien, CarteBien, COLONNES_RESUME, type BienResume } from '@/components/carte-bien';
import { Icone } from '@/components/icones';
import { LogoTuile } from '@/components/logo';
import { LIBELLES_GRAVITE, lancerCheckup, messageAffiche, ORDRE_GRAVITE, type ResultatCheckup } from '@/lib/checkup';
import { versDateFrancaise } from '@/lib/saisie';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { arrondis, couleurs, espaces, ombreUrgente, polices } from '@/theme/tokens';

const FONDS_GRAVITE = { critique: couleurs.corail, important: couleurs.miel, conseil: couleurs.menthe, ok: couleurs.citron } as const;
const TEXTES_GRAVITE = { critique: couleurs.texteCorail, important: couleurs.texteMiel, conseil: couleurs.texteMenthe, ok: couleurs.pin } as const;

/** Nombre de jours entre aujourd'hui et une date (AAAA-MM-JJ). */
function joursAvant(date: string, aujourdhui: string) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${aujourdhui}T00:00:00Z`)) / 86400000);
}

/**
 * Accueil, d'après la maquette 01 (design/sources-html/Accueil.dc.html).
 * Le score n'apparaît qu'en mode aperçu tant que son calcul n'est pas validé.
 */
export default function Accueil() {
  const marges = useSafeAreaInsets();
  const { session, parcoursEnAttente, setParcoursEnAttente } = useSession();
  const [prenom, setPrenom] = useState<string | null>(null);
  const [biens, setBiens] = useState<BienResume[] | null>(null);
  const [formule, setFormule] = useState<{ libelle: string; max: number | null } | null>(null);
  const [checkup, setCheckup] = useState<ResultatCheckup | null>(null);

  // Juste après l'inscription, on enchaîne sur le premier bien (étape 2 sur 4).
  useEffect(() => {
    if (!parcoursEnAttente) return;
    setParcoursEnAttente(false);
    router.push({ pathname: '/bien/nouveau', params: { parcours: '1' } });
  }, [parcoursEnAttente, setParcoursEnAttente]);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('biens')
        .select(COLONNES_RESUME)
        .order('numero')
        .then(({ data }) => setBiens(data ?? []));
      lancerCheckup()
        .then(setCheckup)
        .catch(() => setCheckup(null));
      supabase
        .from('profils')
        .select('formules(libelle, max_biens)')
        .single()
        .then(({ data }) => {
          const f = data?.formules as unknown as { libelle: string; max_biens: number | null } | null;
          if (f) setFormule({ libelle: f.libelle, max: f.max_biens });
        });
    }, []),
  );

  useEffect(() => {
    if (!session) return;
    supabase
      .from('profils')
      .select('prenom')
      .single()
      .then(({ data }) => setPrenom(data?.prenom ?? null));
  }, [session]);

  // Le bandeau est sombre : heure et batterie en blanc sur cet écran.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const constats = (checkup?.biens ?? []).flatMap((b) => b.constats).filter((c) => c.gravite !== 'ok');
  // Les points les plus importants, tous biens confondus (3 au plus sur l'accueil).
  const aTraiter = (checkup?.biens ?? [])
    .flatMap((b) => b.constats.filter((c) => c.gravite !== 'ok').map((c) => ({ ...c, bien_id: b.bien_id, numero: b.numero })))
    .sort((a, b) => ORDRE_GRAVITE[a.gravite] - ORDRE_GRAVITE[b.gravite] || a.numero - b.numero);
  const totalPoints = constats.length;
  const urgents = constats.filter((c) => c.gravite === 'critique').length;
  // Prochaine échéance : la plus proche à venir, tous biens confondus.
  const prochaine = (checkup?.biens ?? [])
    .flatMap((b) => b.echeances.map((e) => ({ ...e, bien_id: b.bien_id })))
    .filter((e) => checkup && e.date >= checkup.date)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nomBien = (id: string) => {
    const b = biens?.find((x) => x.id === id);
    return b ? `Bien n° ${String(b.numero).padStart(2, '0')}${b.commune ? ` · ${b.commune}` : ''}` : '';
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.contenu}>
      <BandeauPin style={[styles.bandeau, { paddingTop: marges.top + 20 }]}>
        <View style={styles.entete}>
          <View style={styles.marque}>
            <LogoTuile />
            <Text style={styles.logotype}>Baillome</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              style={styles.boutonRond}
              accessibilityRole="button"
              accessibilityLabel="Notifications">
              <Icone nom="cloche" couleur={couleurs.surPin} taille={19} epaisseur={1.8} />
            </Pressable>
            {/* Avatar : accès au compte (choix de Sarah, à côté de la cloche). */}
            <Link href="/compte" asChild>
              <Pressable
                style={styles.avatar}
                accessibilityRole="button"
                accessibilityLabel="Mon compte">
                <Icone nom="personne" couleur={couleurs.pin} taille={20} epaisseur={1.8} />
              </Pressable>
            </Link>
          </View>
        </View>

        <Text style={styles.bonjour}>{prenom ? `Bonjour ${prenom}` : 'Bonjour'}</Text>
        <Text style={styles.sousTitre}>Voici où en est votre patrimoine.</Text>

        {checkup && checkup.biens.length > 0 ? (
          <>
            <View style={styles.ligneScore}>
              <View>
                <Text style={styles.legendeScore}>
                  {checkup.score_moyen !== null ? 'SCORE MOYEN' : 'CHECK-UP'} · {checkup.biens.length} BIEN{checkup.biens.length > 1 ? 'S' : ''}
                </Text>
                {checkup.score_moyen !== null ? (
                  <View style={styles.score}>
                    <Text style={styles.scoreChiffre}>{checkup.score_moyen}</Text>
                    <Text style={styles.scoreSur}>/100</Text>
                  </View>
                ) : (
                  <Text style={styles.points}>
                    {totalPoints === 0 ? 'Aucun point à traiter' : `${totalPoints} point${totalPoints > 1 ? 's' : ''} à traiter`}
                  </Text>
                )}
              </View>
              {urgents > 0 ? (
                <View style={styles.pilluleUrgent}>
                  <View style={styles.pointRouge} />
                  <Text style={styles.pilluleUrgentTexte}>
                    {urgents} point{urgents > 1 ? 's' : ''} urgent{urgents > 1 ? 's' : ''}
                  </Text>
                </View>
              ) : null}
            </View>
            {checkup.score_moyen !== null ? (
              <View style={styles.jauge} accessibilityLabel={`Score moyen ${checkup.score_moyen} sur 100`}>
                <View style={styles.piste} />
                <View style={[styles.pleine, { width: `${checkup.score_moyen}%` }]} />
                <View style={[styles.curseur, { left: `${checkup.score_moyen}%` }]} />
              </View>
            ) : null}
          </>
        ) : null}
      </BandeauPin>

      <View style={styles.corps}>
        {prochaine && checkup ? (
          <Pressable
            onPress={() => router.push({ pathname: '/checkup/resultat/[id]', params: { id: prochaine.bien_id } })}
            style={styles.echeance}
            accessibilityRole="button">
            <View style={styles.ligneEcheance}>
              <Text style={styles.legendeSombre}>PROCHAINE ÉCHÉANCE</Text>
              <View style={styles.jours}>
                <Text style={styles.joursTexte}>J−{joursAvant(prochaine.date, checkup.date)}</Text>
              </View>
            </View>
            <Text style={styles.echeanceTitre}>{prochaine.libelle}</Text>
            <Text style={styles.echeanceDetail}>
              {nomBien(prochaine.bien_id)} · le {versDateFrancaise(prochaine.date)}
            </Text>
          </Pressable>
        ) : null}

        {aTraiter.length > 0 ? (
          <>
            <View style={styles.titreSection}>
              <Text style={styles.h2} accessibilityRole="header">
                À traiter
              </Text>
              <Text style={styles.compteur}>
                {aTraiter.length} POINT{aTraiter.length > 1 ? 'S' : ''}
              </Text>
            </View>
            <View style={styles.listePoints}>
              {aTraiter.slice(0, 3).map((c, i) => (
                <Pressable
                  key={`${c.bien_id}-${c.regle}-${c.situation}`}
                  onPress={() => router.push({ pathname: '/checkup/point', params: { bien: c.bien_id, regle: c.regle, situation: c.situation } })}
                  style={({ pressed }) => [styles.point, i > 0 && styles.pointSepare, pressed && styles.pointAppuye]}
                  accessibilityRole="button">
                  <View style={[styles.pastilleGravite, { backgroundColor: FONDS_GRAVITE[c.gravite] }]}>
                    <Text style={[styles.pastilleGraviteTexte, { color: TEXTES_GRAVITE[c.gravite] }]}>{LIBELLES_GRAVITE[c.gravite]}</Text>
                  </View>
                  <View style={styles.pointTextes}>
                    <Text style={styles.pointTitre}>{messageAffiche(c.titre ?? c.libelle)}</Text>
                    <Text style={styles.pointBien}>{nomBien(c.bien_id)}</Text>
                  </View>
                  <Icone nom="fleche" couleur={couleurs.pin} taille={16} epaisseur={2.2} />
                </Pressable>
              ))}
            </View>
            {aTraiter.length > 3 ? (
              <Text style={styles.plusDePoints}>
                Et {aTraiter.length - 3} autre{aTraiter.length - 3 > 1 ? 's' : ''} : ouvrez un bien, puis « Voir le dernier résultat ».
              </Text>
            ) : null}
          </>
        ) : null}

        <View style={styles.titreSection}>
          <Text style={styles.h2} accessibilityRole="header">
            Mes biens
          </Text>
          {biens && formule ? (
            <Text style={styles.compteur}>
              {biens.length}
              {formule.max ? ` / ${formule.max}` : ''} FORMULE {formule.libelle.toUpperCase()}
            </Text>
          ) : null}
        </View>

        {biens?.map((b) => (
          <CarteBien key={b.id} bien={b} resultat={checkup?.biens.find((r) => r.bien_id === b.id)} />
        ))}
        <BoutonAjouterBien />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },
  contenu: {
    paddingBottom: espaces.l,
  },
  bandeau: {
    borderBottomLeftRadius: arrondis.bandeau,
    borderBottomRightRadius: arrondis.bandeau,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  entete: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logotype: {
    fontFamily: polices.titreFort,
    fontSize: 19,
    letterSpacing: -0.66,
    color: couleurs.surPin,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.surPinDoux,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonRond: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.pinClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonjour: {
    marginTop: 22,
    fontFamily: polices.titre,
    fontSize: 26,
    letterSpacing: -0.78,
    color: couleurs.surPin,
  },
  sousTitre: {
    marginTop: 2,
    fontFamily: polices.interface,
    fontSize: 14,
    color: couleurs.surPinDoux,
  },
  corps: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  ligneScore: { marginTop: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  legendeScore: { fontFamily: polices.technique, fontSize: 11, letterSpacing: 0.66, color: couleurs.surPinDiscret },
  score: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  scoreChiffre: { fontFamily: polices.titreFort, fontSize: 88, letterSpacing: -4.4, lineHeight: 88, color: couleurs.citron },
  scoreSur: { fontFamily: polices.titreMoyen, fontSize: 20, color: couleurs.surPinDiscret },
  points: { marginTop: 4, fontFamily: polices.titre, fontSize: 22, color: couleurs.surPin },
  pilluleUrgent: {
    marginBottom: 10,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: couleurs.pinClair,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointRouge: { width: 8, height: 8, borderRadius: 4, backgroundColor: couleurs.alerte },
  pilluleUrgentTexte: { fontFamily: polices.interfaceGras, fontSize: 13, color: couleurs.surPin },
  jauge: { marginTop: 14, height: 22, justifyContent: 'center' },
  piste: { position: 'absolute', left: 0, right: 0, height: 12, borderRadius: 6, backgroundColor: couleurs.pinPiste },
  pleine: { position: 'absolute', left: 0, height: 12, borderRadius: 6, backgroundColor: couleurs.citron },
  curseur: {
    position: 'absolute',
    width: 20,
    height: 20,
    marginLeft: -10,
    borderRadius: 10,
    backgroundColor: couleurs.alerte,
    borderWidth: 3,
    borderColor: couleurs.pin,
  },
  echeance: {
    backgroundColor: couleurs.carte,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 8,
    ...ombreUrgente,
  },
  ligneEcheance: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendeSombre: { fontFamily: polices.techniqueGras, fontSize: 11, letterSpacing: 0.44, color: couleurs.texte },
  jours: { height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: couleurs.corail, justifyContent: 'center' },
  joursTexte: { fontFamily: polices.techniqueGras, fontSize: 11, color: couleurs.texteCorail },
  echeanceTitre: { fontFamily: polices.titre, fontSize: 21, letterSpacing: -0.4, lineHeight: 24, color: couleurs.texte },
  echeanceDetail: { fontFamily: polices.interface, fontSize: 13.5, lineHeight: 20, color: couleurs.texteSecondaire },
  listePoints: { backgroundColor: couleurs.carte, borderRadius: arrondis.tuile, paddingHorizontal: 16 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  pointSepare: { borderTopWidth: 1, borderTopColor: couleurs.pointilles, borderStyle: 'dashed' },
  pointAppuye: { opacity: 0.7 },
  pastilleGravite: { height: 24, borderRadius: 12, paddingHorizontal: 8, justifyContent: 'center' },
  pastilleGraviteTexte: { fontFamily: polices.techniqueGras, fontSize: 9.5 },
  pointTextes: { flex: 1, gap: 2 },
  pointTitre: { fontFamily: polices.interfaceTresGras, fontSize: 14.5, lineHeight: 19, color: couleurs.texte },
  pointBien: { fontFamily: polices.interface, fontSize: 12, color: couleurs.texteSecondaire },
  plusDePoints: { fontFamily: polices.interface, fontSize: 12.5, color: couleurs.texteSecondaire },
  titreSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  h2: { fontFamily: polices.titre, fontSize: 26, letterSpacing: -0.78, color: couleurs.texte },
  compteur: { fontFamily: polices.technique, fontSize: 11, color: couleurs.texteDiscret },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.carteBien,
    padding: 20,
    gap: espaces.s,
  },
  legende: {
    fontFamily: polices.technique,
    fontSize: 11,
    letterSpacing: 0.66,
    color: couleurs.texteDiscret,
  },
  texte: {
    fontFamily: polices.interface,
    fontSize: 14,
    lineHeight: 21,
    color: couleurs.texteSecondaire,
  },
});
