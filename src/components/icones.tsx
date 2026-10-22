import Svg, { Path } from 'react-native-svg';

/**
 * Icônes au trait des maquettes (grille 24 × 24), reprises telles quelles
 * depuis design/sources-html.
 */
const traces = {
  accueil: ['M4 11l8-6.5 8 6.5V20h-5v-5H9v5H4z'],
  biens: ['M4 4h16v16H4zM4 10h16M10 10v10'],
  loyers: ['M4 7h16v11H4zM4 11h16M8 15h3'],
  agenda: ['M4 6h16v14H4zM8 3v5M16 3v5M4 11h16'],
  docs: ['M7 3h7l5 5v13H7zM14 3v5h5'],
  cloche: ['M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z', 'M10 20.5a2 2 0 0 0 4 0'],
  // Hors maquettes : accès au compte, dessiné dans le même style.
  personne: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4.5 20a7.5 7.5 0 0 1 15 0'],
  retour: ['M15 5l-7 7 7 7'],
  document: ['M7 3h7l5 5v13H7zM14 3v5h5'],
  loupe: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-4-4'],
  scanner: ['M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3', 'M7 12h10'],
  fleche: ['M5 12h14M13 6l6 6-6 6'],
  photo: ['M4 8h3l2-3h6l2 3h3v11H4z', 'M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
} as const;

export type NomIcone = keyof typeof traces;

type Props = {
  nom: NomIcone;
  couleur: string;
  taille?: number;
  epaisseur?: number;
};

export function Icone({ nom, couleur, taille = 20, epaisseur = 1.7 }: Props) {
  return (
    <Svg width={taille} height={taille} viewBox="0 0 24 24">
      {traces[nom].map((d) => (
        <Path
          key={d}
          d={d}
          fill="none"
          stroke={couleur}
          strokeWidth={epaisseur}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
