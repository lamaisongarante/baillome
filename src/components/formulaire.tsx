import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { couleurs, polices } from '@/theme/tokens';

/** En-tête des étapes du parcours d'inscription (maquette 14). */
export function EnTeteEtape({ etape, total, titre }: { etape: number; total: number; titre: string }) {
  return (
    <View style={styles.enTete}>
      <View style={styles.ligneEtape}>
        <Text style={styles.legende}>
          ÉTAPE {etape} SUR {total}
        </Text>
        <View style={styles.progression} accessibilityLabel={`Étape ${etape} sur ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={[styles.trait, i < etape && styles.traitFait]} />
          ))}
        </View>
      </View>
      <Text style={styles.titre} accessibilityRole="header">
        {titre}
      </Text>
    </View>
  );
}

type ChampProps = TextInputProps & { libelle: string; aide?: string };

/** Champ de saisie sur carte blanche, libellé technique au-dessus (maquette 14). */
export function Champ({ libelle, aide, style, ...props }: ChampProps) {
  return (
    <View style={styles.champ}>
      <Text style={styles.libelle}>{libelle.toUpperCase()}</Text>
      <TextInput
        placeholderTextColor={couleurs.pointillesFort}
        style={[styles.saisie, style]}
        accessibilityLabel={libelle}
        {...props}
      />
      {aide ? <Text style={styles.aide}>{aide}</Text> : null}
    </View>
  );
}

/** Case à cocher, avec un texte qui peut contenir des liens. */
export function CaseACocher({
  cochee,
  onChange,
  children,
  libelleAccessible,
}: {
  cochee: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  libelleAccessible: string;
}) {
  return (
    <Pressable
      onPress={() => onChange(!cochee)}
      style={styles.case}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: cochee }}
      accessibilityLabel={libelleAccessible}>
      <View style={[styles.carre, cochee && styles.carreCoche]}>
        {cochee ? <Text style={styles.coche}>✓</Text> : null}
      </View>
      <Text style={styles.texteCase}>{children}</Text>
    </Pressable>
  );
}

export function LienTexte({ href, children }: { href: Href; children: ReactNode }) {
  return (
    <Link href={href} style={styles.lien}>
      {children}
    </Link>
  );
}

/** Bouton principal vert pin avec la pastille flèche citron (maquette 14). */
export function BoutonPrincipal({
  libelle,
  onPress,
  occupe = false,
  desactive = false,
}: {
  libelle: string;
  onPress: () => void;
  occupe?: boolean;
  desactive?: boolean;
}) {
  const inactif = occupe || desactive;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactif}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactif, busy: occupe }}
      style={({ pressed }) => [styles.bouton, inactif && styles.boutonInactif, pressed && styles.appuye]}>
      <Text style={styles.boutonTexte}>{libelle}</Text>
      <View style={styles.pastilleFleche}>
        {occupe ? (
          <ActivityIndicator size="small" color={couleurs.pin} />
        ) : (
          <Text style={styles.fleche}>→</Text>
        )}
      </View>
    </Pressable>
  );
}

/** Message d'erreur sur fond corail. */
export function MessageErreur({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.erreur} accessibilityRole="alert">
      <Text style={styles.erreurTexte}>{message}</Text>
    </View>
  );
}

/** Message d'information sur fond menthe. */
export function MessageInfo({ children }: { children: ReactNode }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoI}>i</Text>
      <Text style={styles.infoTexte}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  enTete: { gap: 14 },
  ligneEtape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legende: {
    fontFamily: polices.technique,
    fontSize: 11,
    letterSpacing: 0.66,
    color: couleurs.texteDiscret,
  },
  progression: { flexDirection: 'row', gap: 6 },
  trait: { width: 26, height: 6, borderRadius: 3, backgroundColor: couleurs.pointilles },
  traitFait: { backgroundColor: couleurs.pin },
  titre: {
    fontFamily: polices.titreFort,
    fontSize: 28,
    letterSpacing: -1.1,
    lineHeight: 30,
    color: couleurs.texte,
  },
  champ: { gap: 8 },
  libelle: {
    fontFamily: polices.techniqueGras,
    fontSize: 10.5,
    color: couleurs.texteDiscret,
  },
  saisie: {
    backgroundColor: couleurs.carte,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: polices.interfaceGras,
    fontSize: 15,
    color: couleurs.texte,
  },
  aide: { fontFamily: polices.interface, fontSize: 12, color: couleurs.texteSecondaire },
  case: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 4 },
  carre: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  carreCoche: { backgroundColor: couleurs.pin },
  coche: { color: couleurs.citron, fontFamily: polices.interfaceTresGras, fontSize: 14 },
  texteCase: {
    flex: 1,
    fontFamily: polices.interface,
    fontSize: 13.5,
    lineHeight: 20,
    color: couleurs.texte,
  },
  lien: {
    fontFamily: polices.interfaceGras,
    textDecorationLine: 'underline',
    color: couleurs.pin,
  },
  bouton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: couleurs.pin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  boutonInactif: { opacity: 0.45 },
  appuye: { opacity: 0.85 },
  boutonTexte: { fontFamily: polices.interfaceTresGras, fontSize: 15, color: couleurs.surPin },
  pastilleFleche: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: couleurs.citron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fleche: { fontFamily: polices.interfaceTresGras, color: couleurs.pin, fontSize: 14 },
  erreur: { backgroundColor: couleurs.corail, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14 },
  erreurTexte: { fontFamily: polices.interfaceMoyen, fontSize: 13, lineHeight: 18, color: couleurs.texteCorail },
  info: {
    backgroundColor: couleurs.menthe,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  infoI: { fontFamily: polices.interfaceTresGras, color: couleurs.texteMenthe },
  infoTexte: { flex: 1, fontFamily: polices.interface, fontSize: 12, lineHeight: 17, color: couleurs.texteInfo },
});
