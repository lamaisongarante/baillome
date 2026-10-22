import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from '@/components/icones';
import { LIBELLES } from '@/lib/biens';
import { couleurs, polices } from '@/theme/tokens';

export type BienResume = {
  id: string;
  numero: number;
  type_bien: string;
  commune: string | null;
  situation_locative: string | null;
};

export const COLONNES_RESUME = 'id, numero, type_bien, commune, situation_locative';

/** Carte d'un bien dans les listes (maquette 01, sans le score qui arrive à l'étape 2). */
export function CarteBien({ bien }: { bien: BienResume }) {
  return (
    <Link href={{ pathname: '/bien/[id]', params: { id: bien.id } }} asChild>
      <Pressable style={styles.carte} accessibilityRole="button">
        <View style={styles.tuile}>
          <Icone nom={bien.type_bien === 'garage' ? 'biens' : 'accueil'} couleur={couleurs.pin} taille={24} epaisseur={2} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
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
