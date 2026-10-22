// Questions du check-up, reprises des fiches de règles (docs/regles-de-conformite.md).
// Fichier partagé entre l'application et le moteur (fonction serveur).
// « fiche » : la réponse est enregistrée dans la fiche du bien (une seule source de vérité).
// « aValider » : formulation proposée par Claude, absente des fiches, à valider par Sarah.

export type Option = { valeur: string; libelle: string };

export type Question = {
  code: string;
  regle: string;
  libelle: string;
  type: 'choix' | 'date' | 'classe_dpe' | 'nombre';
  options?: Option[];
  /** Champ de la fiche du bien qui porte la réponse, le cas échéant. */
  fiche?: 'dpe_date' | 'dpe_classe' | 'chauffage_energie' | 'hauteur_sous_plafond' | 'surface_piece_principale' | 'type_habitat' | 'regime_juridique';
  /** Texte de la règle, affiché derrière le lien « Ce que dit la loi ». */
  loi?: string;
  /** Précision affichée sous la question, en plus petit. */
  aide?: string;
  unite?: string;
  aValider?: boolean;
};

const OUI_NON_NSP: Option[] = [
  { valeur: 'oui', libelle: 'Oui' },
  { valeur: 'non', libelle: 'Non' },
  { valeur: 'nsp', libelle: 'Je ne sais pas' },
];

const CONFORME: Option[] = [
  { valeur: 'oui', libelle: 'Oui' },
  { valeur: 'non', libelle: 'Non' },
  { valeur: 'nsp', libelle: 'Je ne sais pas' },
];

/**
 * Critères de décence (R-12, compléments du 22/10/2026). La règle du décret est citée telle quelle
 * (lien « Ce que dit la loi ») ; la question simple vient de docs/formulations-check-up.md.
 * Chauffage, cuisine et sanitaires viennent de la fiche du bien : pas de question.
 */
export const CRITERES_DECENCE = [
  { code: 'clos_couvert', critere: 'Clos et couvert', regle: 'Gros œuvre et accès en bon état ; protection contre les eaux de ruissellement, les remontées d\'eau et les infiltrations', question: 'Le toit, les murs et les accès sont-ils en bon état, sans infiltration ni remontée d\'humidité ?' },
  { code: 'infiltrations_air', critere: 'Infiltrations d\'air', regle: 'Portes, fenêtres et parois suffisamment étanches ; pièces donnant sur des locaux non chauffés fermées ; cheminées munies de trappes', question: 'Les portes et fenêtres ferment-elles bien, sans courant d\'air important ?' },
  { code: 'dispositifs_retenue', critere: 'Dispositifs de retenue', regle: 'Garde-corps, escaliers, loggias et balcons en état conforme à leur usage', question: 'Les garde-corps, rambardes, escaliers et balcons sont-ils solides et sûrs ?' },
  { code: 'materiaux', critere: 'Matériaux', regle: 'Matériaux, canalisations et revêtements sans risque manifeste pour la santé et la sécurité', question: 'Les matériaux et canalisations sont-ils sans danger pour la santé (pas de peinture au plomb dégradée, pas d\'amiante abîmée) ?' },
  { code: 'reseaux', critere: 'Électricité, gaz, chauffage, eau chaude', regle: 'Réseaux, branchements et équipements conformes aux normes de sécurité, en bon état d\'usage et de fonctionnement', question: 'Les installations sont-elles en bon état de marche et sans danger ?' },
  { code: 'aeration', critere: 'Aération', regle: 'Ouvertures et ventilation en bon état, renouvellement de l\'air et évacuation de l\'humidité suffisants', question: 'Le logement est-il bien aéré (ventilation qui fonctionne, pas de moisissures) ?' },
  { code: 'eclairement', critere: 'Éclairement', regle: 'Pièces principales avec éclairement naturel suffisant et un ouvrant donnant à l\'air libre', question: 'Chaque pièce principale a-t-elle une fenêtre qui donne sur l\'extérieur et laisse entrer la lumière du jour ?' },
  { code: 'chauffage', critere: 'Chauffage', regle: 'Installation permettant un chauffage normal, adaptée au logement', question: null },
  { code: 'eau_potable', critere: 'Eau potable', regle: 'Distribution intérieure avec pression et débit suffisants', question: 'L\'eau potable arrive-t-elle avec une pression et un débit suffisants ?' },
  { code: 'evacuation', critere: 'Évacuation des eaux', regle: 'Eaux ménagères et eaux-vannes évacuées sans refoulement d\'odeurs, avec siphon', question: 'Les éviers, douches et WC s\'évacuent-ils bien, sans mauvaises odeurs ?' },
  { code: 'cuisine', critere: 'Cuisine', regle: 'Cuisine ou coin cuisine pouvant recevoir un appareil de cuisson, avec évier en eau chaude et froide et évacuation', question: null },
  { code: 'sanitaires', critere: 'Sanitaires', regle: 'WC intérieur, séparé de la cuisine et de la pièce des repas, et douche ou baignoire en eau chaude et froide, garantissant l\'intimité ; pour un logement d\'une seule pièce, WC extérieur admis s\'il est dans le même bâtiment et facilement accessible', question: null },
  { code: 'electricite', critere: 'Électricité', regle: 'Éclairage suffisant de toutes les pièces et des accès, fonctionnement des appareils ménagers courants', question: 'Toutes les pièces sont-elles éclairées et les prises permettent-elles de brancher les appareils courants ?' },
] as const;

export const QUESTIONS: Question[] = [
  // R-01 (questions de la fiche)
  { code: 'dpe_existe', regle: 'R-01', libelle: 'Avez-vous un DPE pour ce logement ?', type: 'choix', options: OUI_NON_NSP },
  { code: 'dpe_date', regle: 'R-01', libelle: 'À quelle date a-t-il été réalisé ?', type: 'date', fiche: 'dpe_date' },
  { code: 'dpe_classe', regle: 'R-01', libelle: 'Quelle est sa classe énergie ?', type: 'classe_dpe', fiche: 'dpe_classe' },
  {
    code: 'chauffage_energie',
    regle: 'R-01',
    libelle: 'Quel est le mode de chauffage principal ?',
    type: 'choix',
    fiche: 'chauffage_energie',
    options: [
      { valeur: 'electrique', libelle: 'Électrique' },
      { valeur: 'gaz', libelle: 'Gaz' },
      { valeur: 'fioul', libelle: 'Fioul' },
      { valeur: 'bois', libelle: 'Bois' },
      { valeur: 'reseau', libelle: 'Réseau' },
      { valeur: 'autre', libelle: 'Autre' },
    ],
  },
  // R-04 (questions de la fiche et complément du 22/10/2026)
  {
    code: 'construction',
    regle: 'R-04',
    libelle: 'En quelle année le logement a-t-il été construit ?',
    type: 'choix',
    options: [
      { valeur: 'avant_1949', libelle: 'Avant 1949' },
      { valeur: '1949_1997', libelle: 'Entre 1949 et juin 1997' },
      { valeur: 'apres_1997', libelle: 'Après juillet 1997' },
      { valeur: 'nsp', libelle: 'Je ne sais pas' },
    ],
  },
  { code: 'electricite_plus_15_ans', regle: 'R-04', libelle: 'L\'installation électrique a-t-elle plus de 15 ans ?', type: 'choix', options: OUI_NON_NSP },
  {
    code: 'gaz',
    regle: 'R-04',
    libelle: 'Y a-t-il une installation de gaz, et a-t-elle plus de 15 ans ?',
    type: 'choix',
    options: [
      { valeur: 'pas_de_gaz', libelle: 'Pas de gaz' },
      { valeur: 'plus_15_ans', libelle: 'Oui, plus de 15 ans' },
      { valeur: 'moins_15_ans', libelle: 'Non, moins de 15 ans' },
      { valeur: 'nsp', libelle: 'Je ne sais pas' },
    ],
  },
  {
    code: 'permis_avant_1997',
    regle: 'R-04',
    libelle: 'Le permis de construire de l\'immeuble a-t-il été délivré avant le 1er juillet 1997 ?',
    type: 'choix',
    options: OUI_NON_NSP,
  },
  {
    code: 'commune_risques',
    regle: 'R-04',
    libelle: 'Votre commune est-elle concernée par un risque naturel, minier ou technologique, ou par le recul du trait de côte ?',
    aide: 'Vous pouvez le vérifier gratuitement sur le site public Géorisques, en saisissant l\'adresse du logement.',
    type: 'choix',
    options: OUI_NON_NSP,
    aValider: true,
  },
  {
    code: 'zone_bruit',
    regle: 'R-04',
    libelle: 'Le logement se trouve-t-il dans une zone de bruit d\'un aérodrome ?',
    aide: 'Cette information figure dans le plan d\'exposition au bruit, consultable en mairie ou sur Géorisques.',
    type: 'choix',
    options: OUI_NON_NSP,
    aValider: true,
  },
  // Champs de la fiche du bien nécessaires au check-up (mêmes libellés que la fiche)
  {
    code: 'type_habitat',
    regle: 'R-04',
    libelle: 'Type d\'habitat',
    type: 'choix',
    fiche: 'type_habitat',
    options: [
      { valeur: 'collectif', libelle: 'Immeuble collectif' },
      { valeur: 'individuel', libelle: 'Individuel' },
    ],
  },
  {
    code: 'regime_juridique',
    regle: 'R-08',
    libelle: 'Régime juridique',
    type: 'choix',
    fiche: 'regime_juridique',
    options: [
      { valeur: 'mono_propriete', libelle: 'Mono propriété' },
      { valeur: 'copropriete', libelle: 'Copropriété' },
    ],
  },
  // R-12 (compléments du 22/10/2026 ; formulation des questions à valider)
  {
    code: 'surface_piece_principale',
    regle: 'R-12',
    libelle: 'Quelle est la surface de la plus grande pièce principale ?',
    type: 'nombre',
    unite: 'm²',
    fiche: 'surface_piece_principale',
    aValider: true,
  },
  {
    code: 'hauteur_sous_plafond',
    regle: 'R-12',
    libelle: 'Quelle est la hauteur sous plafond de cette pièce ?',
    type: 'nombre',
    unite: 'm',
    fiche: 'hauteur_sous_plafond',
    aValider: true,
  },
  {
    code: 'arrete',
    regle: 'R-12',
    libelle: 'Le logement fait-il l\'objet d\'un arrêté de mise en sécurité ou d\'insalubrité ?',
    type: 'choix',
    options: OUI_NON_NSP,
    aValider: true,
  },
  ...CRITERES_DECENCE.filter((c) => c.question).map(
    (c): Question => ({
      code: `decence_${c.code}`,
      regle: 'R-12',
      libelle: c.question!,
      loi: `${c.critere} : ${c.regle} (décret n° 2002-120).`,
      type: 'choix',
      options: CONFORME,
      aValider: true,
    }),
  ),
  {
    code: 'contraintes_travaux',
    regle: 'R-12',
    libelle: 'Des contraintes techniques ou patrimoniales empêchent-elles des travaux d\'amélioration énergétique ?',
    type: 'choix',
    options: OUI_NON_NSP,
    aValider: true,
  },
];

export function question(code: string): Question | undefined {
  return QUESTIONS.find((q) => q.code === code);
}
