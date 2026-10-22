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
  // Fiche locataire (maquette 06).
  locataire: ['M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M5 20c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5'],
  telephone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z'],
  email: ['M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', 'M3 7l9 6 9-6'],
  lieu: ['M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z', 'M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  crayon: ['M4 20h4L19 9l-4-4L4 16z', 'M13 7l4 4'],
  plus: ['M12 5v14M5 12h14'],
  bouclier: ['M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z', 'M9 12l2 2 4-4'],
  chevron: ['M9 5l7 7-7 7'],
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
