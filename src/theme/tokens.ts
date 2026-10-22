/**
 * Charte Baillome : couleurs, polices et formes.
 * Sources : CLAUDE.md (« La marque et la direction artistique ») et les maquettes
 * validées (design/sources-html), qui donnent les valeurs exactes.
 * Toute l'interface lit ces valeurs : on ne recopie jamais une couleur ailleurs.
 */

export const couleurs = {
  /** Vert pin : couleur principale. */
  pin: '#0E3B2E',
  /** Citron : signature, avec parcimonie (score, validations, onglet actif). Jamais dans les PDF. */
  citron: '#D7F75B',
  fond: '#F6F8F4',
  carte: '#FFFFFF',

  /** États : fond de pastille, puis couleur du texte posé dessus. */
  corail: '#FFE4DC', // urgent
  texteCorail: '#8F2A14',
  miel: '#FFF1C7', // important
  texteMiel: '#6E4700',
  menthe: '#DDF3E4', // en règle
  texteMenthe: '#146B45',
  texteInfo: '#164A31', // texte des encadrés d'information menthe
  /** Point d'alerte (notification, curseur du score). */
  alerte: '#FF7A59',

  /** Textes sur fond clair */
  texte: '#0E3B2E',
  texteSecondaire: '#3E5C50',
  texteDiscret: '#4A6B5E',

  /** Sur le bandeau vert pin */
  surPin: '#FFFFFF',
  surPinDoux: '#DCEAE2',
  surPinDiscret: '#B9D3C6',
  pinClair: '#1D4D3F', // boutons et pastilles posés sur le vert pin
  pinPiste: '#2A5A4B', // piste de la jauge sur le vert pin
  grille: 'rgba(255,255,255,0.06)', // quadrillage discret

  /** Traits */
  piste: '#EDF1EE', // jauge sur carte blanche
  pointilles: '#C5D3CB',
  pointillesFort: '#7FA596',
  bordureChoix: '#9DB3A9', // pilules de choix non sélectionnées
} as const;

/**
 * Couleurs de l'étiquette énergie du DPE (maquette 14), avec la couleur
 * de la lettre posée dessus. Utilisées uniquement pour le choix de la classe.
 */
export const couleursDpe = {
  A: { fond: '#009A44', texte: '#FFFFFF' },
  B: { fond: '#4FB848', texte: '#FFFFFF' },
  C: { fond: '#B5D334', texte: '#1E1E1E' },
  D: { fond: '#FFEE00', texte: '#1E1E1E' },
  E: { fond: '#F6B500', texte: '#1E1E1E' },
  F: { fond: '#E8622A', texte: '#FFFFFF' },
  G: { fond: '#D21F25', texte: '#FFFFFF' },
} as const;

export type ClasseDpe = keyof typeof couleursDpe;

/** Noms des polices, tels que chargés dans src/app/_layout.tsx. */
export const polices = {
  titre: 'BricolageGrotesque_700Bold',
  titreMoyen: 'BricolageGrotesque_600SemiBold',
  titreFort: 'BricolageGrotesque_800ExtraBold', // logotype et grands chiffres
  interface: 'InstrumentSans_400Regular',
  interfaceMoyen: 'InstrumentSans_500Medium',
  interfaceGras: 'InstrumentSans_600SemiBold',
  interfaceTresGras: 'InstrumentSans_700Bold',
  technique: 'IBMPlexMono_500Medium',
  techniqueGras: 'IBMPlexMono_600SemiBold',
} as const;

export const arrondis = {
  /** Tuiles : 22 à 28 px. */
  tuile: 24,
  carteBien: 26,
  grandeTuile: 28,
  /** Bas du bandeau d'accueil. */
  bandeau: 40,
  /** Boutons en pilule. */
  pilule: 999,
} as const;

export const espaces = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
} as const;

/** Ombre décalée de 5 px : élément urgent (accueil) ou mis en avant (formule conseillée). */
export const ombreUrgente = {
  boxShadow: `5px 5px 0px ${couleurs.pin}`,
} as const;
