import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { arrondis, couleurs, espaces } from '@/theme/tokens';

const PAS_GRILLE = 22;

/** Bandeau vert pin avec son quadrillage discret. */
export function BandeauPin({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bandeau}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 24 }, (_, i) => (
          <View key={`v${i}`} style={[styles.ligneVerticale, { left: i * PAS_GRILLE }]} />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
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
    borderRadius: arrondis.grandeTuile,
    padding: espaces.l,
    overflow: 'hidden',
    gap: espaces.m,
  },
  ligneVerticale: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  ligneHorizontale: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});
