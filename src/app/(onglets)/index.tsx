import { Link, router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { BoutonAjouterBien, CarteBien, COLONNES_RESUME, type BienResume } from '@/components/carte-bien';
import { Icone } from '@/components/icones';
import { LogoTuile } from '@/components/logo';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { arrondis, couleurs, espaces, polices } from '@/theme/tokens';

/**
 * Accueil, d'après la maquette 01 (design/sources-html/Accueil.dc.html).
 * Le score et les échéances arriveront avec l'étape 2 (conformité).
 */
export default function Accueil() {
  const marges = useSafeAreaInsets();
  const { session, parcoursEnAttente, setParcoursEnAttente } = useSession();
  const [prenom, setPrenom] = useState<string | null>(null);
  const [biens, setBiens] = useState<BienResume[] | null>(null);
  const [formule, setFormule] = useState<{ libelle: string; max: number | null } | null>(null);

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
      </BandeauPin>

      <View style={styles.corps}>
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

        {biens?.map((b) => <CarteBien key={b.id} bien={b} />)}
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
