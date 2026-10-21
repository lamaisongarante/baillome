import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone, type NomIcone } from '@/components/icones';
import { couleurs, polices } from '@/theme/tokens';

/**
 * Barre de navigation des maquettes : pilule vert pin flottante,
 * onglet actif sur fond citron.
 */
export function BarreOnglets({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const marges = useSafeAreaInsets();

  return (
    <View style={[styles.zone, { paddingBottom: Math.max(marges.bottom, 16) }]}>
      <View style={styles.barre} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const actif = state.index === index;
          const { options } = descriptors[route.key];
          const libelle = options.title ?? route.name;
          const icone = (route.name === 'index' ? 'accueil' : route.name) as NomIcone;

          const ouvrir = () => {
            const evenement = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!actif && !evenement.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={ouvrir}
              accessibilityRole="tab"
              accessibilityState={{ selected: actif }}
              accessibilityLabel={libelle}
              style={[styles.onglet, actif && styles.ongletActif]}>
              <Icone
                nom={icone}
                couleur={actif ? couleurs.pin : couleurs.surPinDiscret}
                epaisseur={actif ? 2 : 1.7}
              />
              <Text style={[styles.libelle, actif && styles.libelleActif]}>{libelle}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    backgroundColor: couleurs.fond,
    paddingHorizontal: 16,
  },
  barre: {
    height: 68,
    borderRadius: 34,
    backgroundColor: couleurs.pin,
    flexDirection: 'row',
    padding: 8,
    gap: 4,
  },
  onglet: {
    flex: 1,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  ongletActif: {
    backgroundColor: couleurs.citron,
  },
  libelle: {
    fontFamily: polices.interfaceMoyen,
    fontSize: 10.5,
    color: couleurs.surPinDiscret,
  },
  libelleActif: {
    fontFamily: polices.interfaceTresGras,
    color: couleurs.pin,
  },
});

