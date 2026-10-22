import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icone } from '@/components/icones';
import { TYPES_DOCUMENT, type TypeDocument } from '@/lib/coffre';
import { versDateFrancaise } from '@/lib/saisie';
import { statutDocument, type DocumentCoffre, type Statut } from '@/lib/statut-document';
import { couleurs, polices } from '@/theme/tokens';

const PASTILLES: Record<Statut, { texte: string; fond: string; couleur: string; contour?: string }> = {
  ok: { texte: 'OK', fond: couleurs.citron, couleur: couleurs.pin },
  deductible: { texte: 'DÉDUCTIBLE', fond: 'transparent', couleur: couleurs.texteMenthe, contour: couleurs.menthe },
  a_renouveler: { texte: 'À RENOUVELER', fond: couleurs.miel, couleur: couleurs.texteMiel },
  expire: { texte: 'EXPIRÉ', fond: couleurs.corail, couleur: couleurs.texteCorail },
};

export function PastilleStatut({ statut }: { statut: Statut }) {
  const p = PASTILLES[statut];
  return (
    <View style={[styles.pastille, { backgroundColor: p.fond }, p.contour ? { borderWidth: 1.5, borderColor: p.contour } : null]}>
      <Text style={[styles.pastilleTexte, { color: p.couleur }]}>{p.texte}</Text>
    </View>
  );
}

/** Une ligne de document dans le coffre (maquette 15). */
export function LigneDocument({ doc, jour, premier }: { doc: DocumentCoffre; jour: string; premier: boolean }) {
  const sousTitre = [
    doc.date_document ? versDateFrancaise(doc.date_document) : null,
    TYPES_DOCUMENT[doc.type_document as TypeDocument],
  ]
    .filter(Boolean)
    .join(' · ');
  // Un lien « asChild » n'accepte qu'un style unique : on fusionne les deux.
  return (
    <Link href={{ pathname: '/document/[id]', params: { id: doc.id } }} asChild>
      <Pressable style={StyleSheet.flatten([styles.ligne, !premier && styles.separateur])} accessibilityRole="button">
        <View style={styles.icone}>
          <Icone nom="document" couleur={couleurs.pin} taille={18} />
        </View>
        <View style={styles.textes}>
          <Text style={styles.titre} numberOfLines={1}>
            {doc.titre}
          </Text>
          <Text style={styles.sousTitre} numberOfLines={1}>
            {sousTitre}
          </Text>
        </View>
        <PastilleStatut statut={statutDocument(doc, jour)} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.piste, borderStyle: 'dashed' },
  icone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: couleurs.piste,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textes: { flex: 1, gap: 1 },
  titre: { fontFamily: polices.interfaceTresGras, fontSize: 14.5, color: couleurs.texte },
  sousTitre: { fontFamily: polices.interface, fontSize: 12, color: couleurs.texteSecondaire },
  pastille: { height: 24, borderRadius: 12, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' },
  pastilleTexte: { fontFamily: polices.techniqueGras, fontSize: 10 },
});
