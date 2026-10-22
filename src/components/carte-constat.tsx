import { StyleSheet, Text, View } from 'react-native';

import { FAMILLES, LIBELLES_GRAVITE, messageAffiche, type ConstatAffiche } from '@/lib/checkup';
import { couleurs, ombreUrgente, polices } from '@/theme/tokens';

const TEINTES = {
  critique: { fond: couleurs.corail, texte: couleurs.texteCorail },
  important: { fond: couleurs.miel, texte: couleurs.texteMiel },
  conseil: { fond: couleurs.menthe, texte: couleurs.texteMenthe },
  ok: { fond: couleurs.carte, texte: couleurs.texteDiscret },
} as const;

/** Carte d'un point à traiter (maquette 03) : gravité, famille, situation, message et action. */
export function CarteConstat({ constat, rang }: { constat: ConstatAffiche; rang: number }) {
  const t = TEINTES[constat.gravite];
  const urgent = constat.gravite === 'critique';
  return (
    <View style={[styles.carte, { backgroundColor: t.fond }, urgent && styles.urgent]}>
      <View style={styles.ligne}>
        <Text style={[styles.legende, { color: t.texte }]}>
          [{String(rang).padStart(2, '0')}] {LIBELLES_GRAVITE[constat.gravite]}
        </Text>
        <Text style={[styles.legende, { color: t.texte }]}>{FAMILLES[constat.regle]}</Text>
      </View>
      <Text style={styles.titre}>{messageAffiche(constat.titre ?? constat.libelle)}</Text>
      <Text style={styles.message}>{messageAffiche(constat.message, constat.valeurs)}</Text>
      <View style={styles.action}>
        <Text style={[styles.legende, { color: t.texte }]}>CE QUE VOUS POUVEZ FAIRE</Text>
        <Text style={styles.actionTexte}>{messageAffiche(constat.action, constat.valeurs)}</Text>
      </View>
      {!constat.validee ? <Text style={styles.nonValidee}>RÈGLE NON VALIDÉE · APERÇU</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { borderRadius: 28, padding: 20, gap: 8 },
  urgent: { borderWidth: 1.5, borderColor: couleurs.pin, ...ombreUrgente },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  legende: { fontFamily: polices.techniqueGras, fontSize: 11, letterSpacing: 0.66 },
  titre: { fontFamily: polices.titre, fontSize: 19, letterSpacing: -0.4, lineHeight: 23, color: couleurs.texte },
  message: { fontFamily: polices.interface, fontSize: 14, lineHeight: 21, color: couleurs.texteSecondaire },
  action: { marginTop: 4, gap: 3 },
  actionTexte: { fontFamily: polices.interfaceGras, fontSize: 13.5, lineHeight: 19, color: couleurs.texte },
  nonValidee: { fontFamily: polices.technique, fontSize: 9.5, color: couleurs.texteDiscret, marginTop: 4 },
});
