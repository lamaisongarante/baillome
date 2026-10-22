import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BandeauPin } from '@/components/bandeau-pin';
import { LIBELLES } from '@/lib/biens';
import { lancerCheckup } from '@/lib/checkup';
import { ajouterJours, ajouterMois } from '@moteur/moteur';
import { aujourdhui, chargerCoffre } from '@/lib/coffre';
import { couleurs, polices } from '@/theme/tokens';

type Ligne = {
  cle: string;
  date: string;
  titre: string;
  bien: string;
  famille: 'diagnostics' | 'assurances' | 'documents';
  ouvrir: () => void;
};

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const FILTRES = [
  { valeur: 'tout', libelle: 'Tout' },
  { valeur: 'diagnostics', libelle: 'Diagnostics' },
  { valeur: 'assurances', libelle: 'Assurances' },
  { valeur: 'documents', libelle: 'Documents' },
] as const;

/** Agenda des échéances, d'après la maquette 04 : les 12 prochains mois, puis l'horizon. */
export default function Agenda() {
  const marges = useSafeAreaInsets();
  const [lignes, setLignes] = useState<Ligne[] | null>(null);
  const [filtre, setFiltre] = useState<(typeof FILTRES)[number]['valeur']>('tout');
  const [nbBiens, setNbBiens] = useState(0);
  const jour = aujourdhui();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      Promise.all([lancerCheckup().catch(() => null), chargerCoffre()]).then(([checkup, coffre]) => {
        setNbBiens(coffre.biens.length);
        const nom = (id: string | null) => {
          const b = coffre.biens.find((x) => x.id === id);
          if (!b) return 'Tous les biens';
          const type = LIBELLES.type_bien[b.type_bien as keyof typeof LIBELLES.type_bien] ?? 'Bien';
          return `${type}${b.commune ? ` · ${b.commune}` : ''}`;
        };
        const issues: Ligne[] = (checkup?.biens ?? []).flatMap((b) =>
          b.echeances.map((e) => ({
            cle: `${b.bien_id}-${e.cle}`,
            date: e.date,
            titre: e.libelle,
            bien: nom(b.bien_id),
            famille: e.regle === 'R-08' ? ('assurances' as const) : ('diagnostics' as const),
            ouvrir: () => router.push({ pathname: '/checkup/resultat/[id]', params: { id: b.bien_id } }),
          })),
        );
        const documents: Ligne[] = coffre.documents
          .filter((d) => d.date_validite)
          .map((d) => ({
            cle: d.id,
            date: d.date_validite!,
            titre: `${d.titre} : fin de validité`,
            bien: nom(d.bien_id),
            famille: 'documents' as const,
            ouvrir: () => router.push({ pathname: '/document/[id]', params: { id: d.id } }),
          }));
        setLignes([...issues, ...documents].filter((l) => l.date >= jour).sort((a, b) => a.date.localeCompare(b.date)));
      });
      return () => setStatusBarStyle('dark');
    }, [jour]),
  );

  const visibles = (lignes ?? []).filter((l) => filtre === 'tout' || l.famille === filtre);
  const limiteAn = ajouterMois(jour, 12);
  const prochaines = visibles.filter((l) => l.date < limiteAn);
  const horizon = visibles.filter((l) => l.date >= limiteAn);
  const ceMois = (lignes ?? []).filter((l) => l.date.slice(0, 7) === jour.slice(0, 7)).length;
  const sous3Mois = (lignes ?? []).filter((l) => l.date <= ajouterMois(jour, 3)).length;

  // Regroupement par mois (maquette : « Novembre 2026 »).
  const groupes = prochaines.reduce<{ mois: string; lignes: Ligne[] }[]>((acc, l) => {
    const mois = l.date.slice(0, 7);
    const g = acc.find((x) => x.mois === mois);
    if (g) g.lignes.push(l);
    else acc.push({ mois, lignes: [l] });
    return acc;
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: 32 }}>
      <BandeauPin style={[styles.bandeau, { paddingTop: marges.top + 16 }]}>
        <Text style={styles.titre} accessibilityRole="header">
          Agenda
        </Text>
        <Text style={styles.sousTitre}>
          {nbBiens} bien{nbBiens > 1 ? 's' : ''} · {lignes?.length ?? 0} échéance{(lignes?.length ?? 0) > 1 ? 's' : ''} suivie
          {(lignes?.length ?? 0) > 1 ? 's' : ''}
        </Text>
        <View style={styles.tuiles}>
          <View style={styles.tuile}>
            <Text style={[styles.tuileChiffre, ceMois > 0 && styles.chiffreAlerte]}>{ceMois}</Text>
            <Text style={styles.tuileLegende}>CE MOIS-CI</Text>
          </View>
          <View style={styles.tuile}>
            <Text style={styles.tuileChiffre}>{sous3Mois}</Text>
            <Text style={styles.tuileLegende}>SOUS 3 MOIS</Text>
          </View>
        </View>
      </BandeauPin>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtres}>
        {FILTRES.map((f) => (
          <Pressable
            key={f.valeur}
            onPress={() => setFiltre(f.valeur)}
            accessibilityRole="radio"
            accessibilityState={{ checked: filtre === f.valeur }}
            style={[styles.filtre, filtre === f.valeur && styles.filtreActif]}>
            <Text style={[styles.filtreTexte, filtre === f.valeur && styles.filtreTexteActif]}>{f.libelle}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.corps}>
        {!lignes ? <ActivityIndicator color={couleurs.pin} style={styles.attente} /> : null}
        {lignes && visibles.length === 0 ? (
          <View style={styles.vide}>
            <Text style={styles.videTexte}>
              Aucune échéance pour l’instant. Faites le check-up de vos biens et renseignez les fins de validité de vos
              documents : elles apparaîtront ici.
            </Text>
          </View>
        ) : null}

        {groupes.map((g) => {
          const [a, m] = g.mois.split('-');
          return (
            <View key={g.mois} style={styles.groupe}>
              <View style={styles.ligneMois}>
                <Text style={styles.mois}>{MOIS[Number(m) - 1].replace(/^./, (c) => c.toUpperCase())}</Text>
                <Text style={styles.annee}>{a}</Text>
              </View>
              {g.lignes.map((l) => {
                const proche = l.date <= ajouterJours(jour, 30);
                return (
                  <Pressable key={l.cle} onPress={l.ouvrir} style={[styles.carte, proche && styles.carteProche]} accessibilityRole="button">
                    <View style={[styles.date, { backgroundColor: proche ? couleurs.corail : couleurs.miel }]}>
                      <Text style={[styles.jour, { color: proche ? couleurs.texteCorail : couleurs.texteMiel }]}>{l.date.slice(8, 10)}</Text>
                      <Text style={[styles.moisCourt, { color: proche ? couleurs.texteCorail : couleurs.texteMiel }]}>
                        {MOIS[Number(m) - 1].slice(0, 3).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.textes}>
                      <Text style={styles.bien}>{l.bien.toUpperCase()}</Text>
                      <Text style={styles.ligneTitre}>{l.titre}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        {horizon.length > 0 ? (
          <BandeauPin style={styles.horizon}>
            <View style={styles.ligneMois}>
              <Text style={styles.horizonTitre}>Horizon</Text>
              <Text style={styles.horizonLegende}>LONG TERME</Text>
            </View>
            <Text style={styles.horizonTexte}>Les grandes échéances qui se préparent des années à l’avance.</Text>
            {horizon.map((l) => (
              <Pressable key={l.cle} onPress={l.ouvrir} style={styles.horizonLigne} accessibilityRole="button">
                <View style={styles.puce} />
                <View style={styles.textes}>
                  <Text style={styles.horizonDate}>
                    {l.date.split('-').reverse().join('.')} · {l.bien.toUpperCase()}
                  </Text>
                  <Text style={styles.horizonLigneTitre}>{l.titre}</Text>
                </View>
              </Pressable>
            ))}
          </BandeauPin>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  bandeau: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingHorizontal: 22, paddingBottom: 24, gap: 6 },
  titre: { fontFamily: polices.titreFort, fontSize: 30, letterSpacing: -1.1, color: couleurs.surPin },
  sousTitre: { fontFamily: polices.interface, fontSize: 14, color: couleurs.surPinDoux },
  tuiles: { flexDirection: 'row', gap: 8, marginTop: 12 },
  tuile: { flex: 1, backgroundColor: couleurs.pinClair, borderRadius: 18, padding: 14, gap: 4 },
  tuileChiffre: { fontFamily: polices.titreFort, fontSize: 30, color: couleurs.surPin },
  chiffreAlerte: { color: couleurs.alerte },
  tuileLegende: { fontFamily: polices.technique, fontSize: 10.5, color: couleurs.surPinDoux },
  filtres: { paddingHorizontal: 18, paddingVertical: 16, gap: 8 },
  filtre: { height: 40, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1.5, borderColor: couleurs.pin, justifyContent: 'center' },
  filtreActif: { backgroundColor: couleurs.pin },
  filtreTexte: { fontFamily: polices.interfaceGras, fontSize: 14, color: couleurs.pin },
  filtreTexteActif: { color: couleurs.surPin },
  corps: { paddingHorizontal: 18, gap: 14 },
  attente: { marginTop: 24 },
  vide: { backgroundColor: couleurs.carte, borderRadius: 22, padding: 18 },
  videTexte: { fontFamily: polices.interface, fontSize: 14, lineHeight: 20, color: couleurs.texteSecondaire },
  groupe: { gap: 10 },
  ligneMois: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  mois: { fontFamily: polices.titre, fontSize: 24, letterSpacing: -0.6, color: couleurs.texte },
  annee: { fontFamily: polices.technique, fontSize: 11, color: couleurs.texteDiscret },
  carte: { backgroundColor: couleurs.carte, borderRadius: 26, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center' },
  carteProche: { borderWidth: 1.5, borderColor: couleurs.pin },
  date: { width: 52, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  jour: { fontFamily: polices.titreFort, fontSize: 22, lineHeight: 24 },
  moisCourt: { fontFamily: polices.technique, fontSize: 9.5 },
  textes: { flex: 1, gap: 2 },
  bien: { fontFamily: polices.technique, fontSize: 10.5, color: couleurs.texteDiscret },
  ligneTitre: { fontFamily: polices.interfaceTresGras, fontSize: 15.5, lineHeight: 20, color: couleurs.texte },
  horizon: { borderRadius: 28, padding: 22, gap: 12, marginTop: 6 },
  horizonTitre: { fontFamily: polices.titre, fontSize: 24, letterSpacing: -0.6, color: couleurs.surPin },
  horizonLegende: { fontFamily: polices.technique, fontSize: 10.5, color: couleurs.surPinDiscret },
  horizonTexte: { fontFamily: polices.interface, fontSize: 14, lineHeight: 20, color: couleurs.surPinDoux },
  horizonLigne: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  puce: { width: 10, height: 10, borderRadius: 5, backgroundColor: couleurs.citron, marginTop: 4 },
  horizonDate: { fontFamily: polices.technique, fontSize: 11, color: couleurs.surPinDiscret },
  horizonLigneTitre: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.surPin },
});
