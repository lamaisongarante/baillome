import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from '@/components/icones';
import { LIBELLES } from '@/lib/biens';
import type { ResultatBien } from '@/lib/checkup';
import { couleurs, polices } from '@/theme/tokens';

export type BienResume = {
  id: string;
  numero: number;
  type_bien: string;
  commune: string | null;
  situation_locative: string | null;
};

export const COLONNES_RESUME = 'id, numero, type_bien, commune, situation_locative';

/** Pastilles de la carte (maquette 01) : nombre de points par gravité. */
const PASTILLES = [
  { gravite: 'critique', singulier: 'urgent', pluriel: 'urgents', fond: couleurs.corail, texte: couleurs.texteCorail },
  { gravite: 'important', singulier: 'important', pluriel: 'importants', fond: couleurs.miel, texte: couleurs.texteMiel },
  { gravite: 'conseil', singulier: 'bon plan', pluriel: 'bons plans', fond: couleurs.menthe, texte: couleurs.texteMenthe },
] as const;

/** Carte d'un bien dans les listes (maquette 01). Le résultat du check-up est facultatif. */
export function CarteBien({ bien, resultat }: { bien: BienResume; resultat?: ResultatBien }) {
  const compte = (g: string) => resultat?.constats.filter((c) => c.gravite === g).length ?? 0;
  const pire = compte('critique') ? 'critique' : compte('important') ? 'important' : 'autre';
  const fondTuile = pire === 'critique' ? couleurs.corail : pire === 'important' ? couleurs.miel : couleurs.menthe;
  const couleurIcone = pire === 'critique' ? couleurs.texteCorail : pire === 'important' ? couleurs.texteMiel : couleurs.texteMenthe;
  const pastilles = PASTILLES.filter((p) => compte(p.gravite) > 0);
  const enRegle = resultat && !resultat.horsV1 && pastilles.length === 0 && resultat.etats.some((e) => e.statut === 'evaluee');

  return (
    <Link href={{ pathname: '/bien/[id]', params: { id: bien.id } }} asChild>
      <Pressable style={styles.carte} accessibilityRole="button">
        <View style={styles.haut}>
          <View style={[styles.tuile, { backgroundColor: fondTuile }]}>
            <Icone nom={bien.type_bien === 'garage' ? 'biens' : 'accueil'} couleur={couleurIcone} taille={24} epaisseur={2} />
          </View>
          <View style={styles.infos}>
            <Text style={styles.legende}>
              BIEN N° {String(bien.numero).padStart(2, '0')}
              {bien.commune ? ` · ${bien.commune.toUpperCase()}` : ''}
            </Text>
            <Text style={styles.nom}>{LIBELLES.type_bien[bien.type_bien as keyof typeof LIBELLES.type_bien] ?? 'Bien'}</Text>
            {bien.situation_locative ? (
              <Text style={styles.detail}>
                {LIBELLES.situation_locative[bien.situation_locative as keyof typeof LIBELLES.situation_locative]}
              </Text>
            ) : null}
          </View>
          {resultat && resultat.score !== null ? (
            <View style={styles.score}>
              <Text style={styles.scoreChiffre}>{resultat.score}</Text>
              <Text style={styles.scoreSur}>/100</Text>
            </View>
          ) : null}
        </View>
        {resultat && resultat.score !== null ? (
          <View style={styles.jauge}>
            <View style={[styles.jaugePleine, { width: `${resultat.score}%` }]} />
          </View>
        ) : null}
        {pastilles.length > 0 || enRegle ? (
          <View style={styles.pastilles}>
            {pastilles.map((p) => (
              <View key={p.gravite} style={[styles.pastille, { backgroundColor: p.fond }]}>
                <Text style={[styles.pastilleTexte, { color: p.texte }]}>
                  {compte(p.gravite)} {compte(p.gravite) > 1 ? p.pluriel : p.singulier}
                </Text>
              </View>
            ))}
            {enRegle ? (
              <View style={[styles.pastille, styles.pastilleOk]}>
                <Text style={styles.pastilleOkTexte}>OK · TOUT EST EN RÈGLE</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

/** Bouton en pointillés « Ajouter un bien » (maquette 01). */
export function BoutonAjouterBien() {
  return (
    <Link href="/bien/nouveau" asChild>
      <Pressable style={styles.ajouter} accessibilityRole="button">
        <Text style={styles.plus}>+</Text>
        <Text style={styles.ajouterTexte}>Ajouter un bien</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: 26,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  haut: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  score: { alignItems: 'flex-end' },
  scoreChiffre: { fontFamily: polices.titreFort, fontSize: 30, letterSpacing: -1.2, lineHeight: 30, color: couleurs.texte },
  scoreSur: { fontFamily: polices.technique, fontSize: 10, color: couleurs.texteDiscret },
  jauge: { height: 8, borderRadius: 4, backgroundColor: couleurs.piste, overflow: 'hidden' },
  jaugePleine: { height: 8, borderRadius: 4, backgroundColor: couleurs.pin },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pastille: { height: 26, borderRadius: 13, paddingHorizontal: 10, justifyContent: 'center' },
  pastilleTexte: { fontFamily: polices.interfaceGras, fontSize: 12 },
  pastilleOk: { backgroundColor: couleurs.citron },
  pastilleOkTexte: { fontFamily: polices.techniqueGras, fontSize: 11, color: couleurs.pin },
  tuile: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: couleurs.menthe,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infos: { flex: 1, gap: 2 },
  legende: { fontFamily: polices.technique, fontSize: 10.5, color: couleurs.texteDiscret },
  nom: { fontFamily: polices.interfaceTresGras, fontSize: 16, color: couleurs.texte },
  detail: { fontFamily: polices.interface, fontSize: 12.5, color: couleurs.texteSecondaire },
  ajouter: {
    height: 56,
    borderRadius: 26,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: couleurs.pointillesFort,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  plus: { fontFamily: polices.interfaceGras, fontSize: 20, color: couleurs.pin },
  ajouterTexte: { fontFamily: polices.interfaceGras, fontSize: 14.5, color: couleurs.pin },
});
