import { Pressable, StyleSheet, Text, View } from 'react-native';

import { couleurs, couleursDpe, polices, type ClasseDpe } from '@/theme/tokens';

type Option<T extends string> = { valeur: T; libelle: string };

/** Grille de gros boutons (type de bien, maquette 14). Le choix actif passe en citron. */
export function GrilleChoix<T extends string>({
  options,
  valeur,
  onChange,
  libelleGroupe,
}: {
  options: Option<T>[];
  valeur: T | null;
  onChange: (v: T) => void;
  libelleGroupe: string;
}) {
  return (
    <View style={styles.grille} accessibilityRole="radiogroup" accessibilityLabel={libelleGroupe}>
      {options.map((o) => {
        const actif = o.valeur === valeur;
        return (
          <Pressable
            key={o.valeur}
            onPress={() => onChange(o.valeur)}
            accessibilityRole="radio"
            accessibilityState={{ checked: actif }}
            style={[styles.case, actif && styles.caseActive]}>
            <Text style={styles.caseTexte}>{o.libelle}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Rangée de pilules (situation locative, maquette 14). Le choix actif passe en vert pin. */
export function PilulesChoix<T extends string>({
  options,
  valeur,
  onChange,
  libelleGroupe,
}: {
  options: Option<T>[];
  valeur: T | null;
  onChange: (v: T) => void;
  libelleGroupe: string;
}) {
  return (
    <View style={styles.pilules} accessibilityRole="radiogroup" accessibilityLabel={libelleGroupe}>
      {options.map((o) => {
        const actif = o.valeur === valeur;
        return (
          <Pressable
            key={o.valeur}
            onPress={() => onChange(o.valeur)}
            accessibilityRole="radio"
            accessibilityState={{ checked: actif }}
            style={[styles.pilule, actif && styles.piluleActive]}>
            <Text style={[styles.piluleTexte, actif && styles.piluleTexteActif]}>{o.libelle}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Pilules à choix multiples (autres parties du logement…). */
export function PilulesMultiples<T extends string>({
  options,
  valeurs,
  onChange,
  libelleGroupe,
}: {
  options: Option<T>[];
  valeurs: T[];
  onChange: (v: T[]) => void;
  libelleGroupe: string;
}) {
  return (
    <View style={styles.pilules} accessibilityLabel={libelleGroupe}>
      {options.map((o) => {
        const actif = valeurs.includes(o.valeur);
        return (
          <Pressable
            key={o.valeur}
            onPress={() => onChange(actif ? valeurs.filter((v) => v !== o.valeur) : [...valeurs, o.valeur])}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: actif }}
            style={[styles.pilule, actif && styles.piluleActive]}>
            <Text style={[styles.piluleTexte, actif && styles.piluleTexteActif]}>{o.libelle}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const CLASSES = Object.keys(couleursDpe) as ClasseDpe[];

/** Les 7 classes du DPE aux couleurs de l'étiquette énergie (maquette 14). */
export function SelecteurDpe({
  valeur,
  onChange,
}: {
  valeur: ClasseDpe | null;
  onChange: (v: ClasseDpe) => void;
}) {
  return (
    <View style={styles.dpe} accessibilityRole="radiogroup" accessibilityLabel="Classe du DPE">
      {CLASSES.map((c) => {
        const actif = c === valeur;
        return (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            accessibilityRole="radio"
            accessibilityLabel={`Classe ${c}`}
            accessibilityState={{ checked: actif }}
            style={[
              styles.classe,
              { backgroundColor: couleursDpe[c].fond },
              valeur && !actif && styles.classeEteinte,
              actif && styles.classeActive,
            ]}>
            <Text style={[styles.classeTexte, { color: couleursDpe[c].texte }]}>{c}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  case: {
    flexBasis: '45%',
    flexGrow: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseActive: { backgroundColor: couleurs.citron, boxShadow: `3px 3px 0px ${couleurs.pin}` },
  caseTexte: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.pin },
  pilules: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pilule: {
    flexGrow: 1,
    flexBasis: '30%',
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: couleurs.bordureChoix,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  piluleActive: { backgroundColor: couleurs.pin, borderColor: couleurs.pin },
  piluleTexte: { fontFamily: polices.interfaceGras, fontSize: 13.5, color: couleurs.pin },
  piluleTexteActif: { fontFamily: polices.interfaceTresGras, color: couleurs.surPin },
  dpe: { flexDirection: 'row', gap: 6 },
  classe: { flex: 1, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  classeEteinte: { opacity: 0.55 },
  classeActive: { outlineWidth: 3, outlineColor: couleurs.pin, outlineStyle: 'solid', outlineOffset: 2 },
  classeTexte: { fontFamily: polices.interfaceTresGras, fontSize: 15 },
});
