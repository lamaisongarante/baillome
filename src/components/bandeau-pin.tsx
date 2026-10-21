import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { couleurs } from '@/theme/tokens';

/** Pas du quadrillage des maquettes (background-size: 22px 22px). */
const PAS_GRILLE = 22;
const NB_LIGNES = 40;

/** Bandeau vert pin avec son quadrillage discret. */
export function BandeauPin({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.bandeau, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: NB_LIGNES }, (_, i) => (
          <View key={`v${i}`} style={[styles.ligneVerticale, { left: i * PAS_GRILLE }]} />
        ))}
        {Array.from({ length: NB_LIGNES }, (_, i) => (
          <View key={`h${i}`} style={[styles.ligneHorizontale, { top: i * PAS_GRILLE }]} />
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bandeau: {
    backgroundColor: couleurs.pin,
    overflow: 'hidden',
  },
  ligneVerticale: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: couleurs.grille,
  },
  ligneHorizontale: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: couleurs.grille,
  },
});
