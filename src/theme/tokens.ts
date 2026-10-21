/**
 * Charte Baillome : couleurs, polices et formes.
 * Source : CLAUDE.md, rubrique « La marque et la direction artistique ».
 * Toute l'interface lit ces valeurs : on ne recopie jamais une couleur ailleurs.
 */

export const couleurs = {
  /** Vert pin : couleur principale. */
  pin: '#0E3B2E',
  /** Citron : signature, avec parcimonie (score, validations, onglet actif). Jamais dans les PDF. */
  citron: '#D7F75B',
  fond: '#F6F8F4',
  carte: '#FFFFFF',
  /** États */
  corail: '#FFE4DC', // urgent
  miel: '#FFF1C7', // important
  menthe: '#DDF3E4', // en règle
  /** Textes */
  texte: '#0E3B2E',
  texteDiscret: '#5B6B63',
  surPin: '#FFFFFF',
  trait: '#E3E8E1',
} as const;

/** Noms des polices, tels que chargés dans src/app/_layout.tsx. */
export const polices = {
  titre: 'BricolageGrotesque_700Bold',
  titreMoyen: 'BricolageGrotesque_600SemiBold',
  interface: 'InstrumentSans_400Regular',
  interfaceMoyen: 'InstrumentSans_500Medium',
  interfaceGras: 'InstrumentSans_600SemiBold',
  technique: 'IBMPlexMono_400Regular',
} as const;

export const arrondis = {
  /** Tuiles : 22 à 28 px. */
  tuile: 24,
  grandeTuile: 28,
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

/** Ombre décalée de 5 px, réservée à l'élément urgent. */
export const ombreUrgente = {
  boxShadow: `5px 5px 0px ${couleurs.pin}`,
} as const;
