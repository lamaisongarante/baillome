import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { couleurs } from '@/theme/tokens';

/**
 * La maison interrupteur sur sa tuile citron, telle que dans l'en-tête
 * de la maquette d'accueil (design/sources-html/Accueil.dc.html).
 */
export function LogoTuile({ taille = 34 }: { taille?: number }) {
  return (
    <View style={[styles.tuile, { width: taille, height: taille, borderRadius: taille * 0.3 }]}>
      <Svg width={taille * 0.8} height={taille * 0.8} viewBox="0 0 100 100">
        <Path
          d="M15 47 L50 18 L85 47"
          fill="none"
          stroke={couleurs.pin}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M25 41 V81 H75 V41"
          fill="none"
          stroke={couleurs.pin}
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect x={31} y={51} width={38} height={22} rx={11} fill={couleurs.pin} />
        <Circle cx={58} cy={62} r={7.5} fill={couleurs.citron} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  tuile: {
    backgroundColor: couleurs.citron,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
