// Règles propres au bail (étape 3) : textes applicables à une date, durée
// minimale, plafond du dépôt de garantie et contrôles avant génération.
// Fonctions pures, partagées par l'application et la fonction serveur,
// testées dans tests/moteur/bail.test.mjs.
//
// Les durées et les dates d'application sont des données datées, avec leur
// source ; le plafond du dépôt vient des paramètres de la règle R-03
// (table regles_versions), jamais du code.

export type TypeBail = 'nu' | 'meuble' | 'garage';

// ---------------------------------------------------------------------
// Textes officiels utilisés (contenus/officiels), par date de signature
// ---------------------------------------------------------------------

export type VersionTexte = { version: string; depuis: string; fichier: string; source: string };

/** Contrats types (décret n° 2015-587). Seule la version en vigueur depuis le 1er octobre 2026 est stockée. */
export const CONTRATS_TYPES: Record<'nu' | 'meuble', VersionTexte[]> = {
  nu: [
    {
      version: '2026-10-01',
      depuis: '2026-10-01',
      fichier: 'contrat-type-nu-2026-10-01.md',
      source: 'Décret n° 2015-587, annexe 1, modifiée par le décret n° 2026-596 (Légifrance, relevé le 22/10/2026)',
    },
  ],
  meuble: [
    {
      version: '2026-10-01',
      depuis: '2026-10-01',
      fichier: 'contrat-type-meuble-2026-10-01.md',
      source: 'Décret n° 2015-587, annexe 2, modifiée par le décret n° 2026-596 (Légifrance, relevé le 22/10/2026)',
    },
  ],
};

/** Notice d'information (arrêté du 29 mai 2015). Applicable aux contrats conclus ou renouvelés à compter du 18 octobre 2026. */
export const NOTICES: VersionTexte[] = [
  {
    version: '2026-10-18',
    depuis: '2026-10-18',
    fichier: 'notice-information-2026-10-18.md',
    source: 'Arrêté du 29 mai 2015, annexe, version issue de l’arrêté du 9 octobre 2026 (Légifrance, relevé le 22/10/2026)',
  },
];

/** Version applicable à une date de signature ; null si elle est antérieure aux textes stockés. */
export function versionApplicable(versions: VersionTexte[], dateSignature: string): VersionTexte | null {
  const candidates = versions.filter((v) => v.depuis <= dateSignature).sort((a, b) => b.depuis.localeCompare(a.depuis));
  return candidates[0] ?? null;
}

// ---------------------------------------------------------------------
// Durée minimale du bail (loi n° 89-462, art. 10 et 25-7)
// ---------------------------------------------------------------------

/**
 * « personne_physique » couvre aussi les bailleurs de l'article 13 : société
 * civile constituée exclusivement entre parents et alliés jusqu'au quatrième
 * degré inclus, et indivision.
 */
export type QualiteDuree = 'personne_physique' | 'personne_morale';

export const DUREES_MINIMALES = {
  depuis: '1989-07-08',
  source: 'Loi n° 89-462, art. 10 (nu) et 25-7 (meublé), relus sur Légifrance le 22/10/2026',
  nu: { personne_physique: 36, personne_morale: 72 },
  meuble: { standard: 12, etudiant: 9 },
  /** Durée réduite du bail nu : au moins un an (contrat type, III. B). */
  nuReduiteMinimum: 12,
} as const;

export function qualitePourDuree(entite: { type: string; sci_familiale: boolean }): QualiteDuree {
  if (entite.type === 'nom_propre' || entite.type === 'indivision') return 'personne_physique';
  return entite.sci_familiale ? 'personne_physique' : 'personne_morale';
}

/** Durée proposée par défaut, en mois ; null pour un garage (durée libre). */
export function dureeProposee(type: TypeBail, qualite: QualiteDuree, etudiant: boolean): number | null {
  if (type === 'garage') return null;
  if (type === 'meuble') return etudiant ? DUREES_MINIMALES.meuble.etudiant : DUREES_MINIMALES.meuble.standard;
  return DUREES_MINIMALES.nu[qualite];
}

// ---------------------------------------------------------------------
// Dépôt de garantie (règle R-03)
// ---------------------------------------------------------------------

export type ParametresR03 = { plafond_mois_loyer_hc: { nu: number; meuble: number } };

/** Plafond du dépôt en euros ; null s'il n'y a pas de plafond légal (garage) ou pas de loyer. */
export function plafondDepot(type: TypeBail, loyerHc: number | null, p: ParametresR03): number | null {
  if (type === 'garage' || loyerHc === null) return null;
  return Math.round(loyerHc * p.plafond_mois_loyer_hc[type] * 100) / 100;
}

// ---------------------------------------------------------------------
// Contrôles avant génération (matrice M-02 ; modèles M-02b, M-02c)
// ---------------------------------------------------------------------

export type BailSaisi = {
  type_bail: TypeBail;
  soumis_evolution_relocation?: boolean | null;
  date_effet: string | null;
  duree_mois: number | null;
  motif_duree_reduite: string | null;
  loyer_hc: number | null;
  mode_charges: 'provisions' | 'periodique' | 'forfait' | null;
  periodicite: 'mensuelle' | 'trimestrielle';
  terme: 'a_echoir' | 'echu' | null;
  depot_garantie: number | null;
};

export type ContexteBail = {
  bail: BailSaisi;
  bien: { surface_habitable: number | null; identifiant_fiscal: string | null };
  qualite: QualiteDuree;
  /** Nombre de locataires, et s'ils sont mariés ou pacsés ensemble. */
  locataires: { nombre: number; couple: boolean; tousEtudiants: boolean };
  parametresR03: ParametresR03;
  /**
   * Commune du bien dans la liste des zones tendues applicable à la date de
   * prise d'effet (décret n° 2013-392 avant 2027, n° 2026-831 ensuite) ; null
   * si aucune liste stockée ne couvre cette date.
   */
  zoneTendueOfficielle?: boolean | null;
};

export type NiveauControle = 'bloquant' | 'avertissement' | 'information';

export type Controle = {
  code: string;
  niveau: NiveauControle;
  /** Règle ou matrice d'origine. */
  source: string;
  /** Message validé (mot pour mot), ou rédaction de Baillome encore à valider par Sarah. */
  message: string;
  aValider: boolean;
};

export function controlerBail(c: ContexteBail): Controle[] {
  const { bail } = c;
  const controles: Controle[] = [];
  const habitation = bail.type_bail !== 'garage';
  const colocation = c.locataires.nombre > 1 && !c.locataires.couple;

  // R-05 : identifiant fiscal (12 chiffres, décision du 22/10/2026), sauf garage seul.
  if (habitation && !(c.bien.identifiant_fiscal && /^\d{12}$/.test(c.bien.identifiant_fiscal))) {
    controles.push({
      code: 'identifiant_fiscal',
      niveau: 'bloquant',
      source: 'R-05',
      message:
        'Le bail doit mentionner l’identifiant fiscal du logement. Il se trouve en quelques clics dans votre espace particulier sur impots.gouv.fr, rubrique « Biens immobiliers ».',
      aValider: true,
    });
  }

  // M-02 : surface habitable.
  if (habitation && !c.bien.surface_habitable) {
    controles.push({
      code: 'surface',
      niveau: 'bloquant',
      source: 'M-02',
      message: 'Indiquez la surface habitable du logement dans sa fiche : elle figure obligatoirement au bail.',
      aValider: true,
    });
  }

  // R-03 : dépôt de garantie au-delà du plafond (message validé le 20/10/2026).
  const plafond = plafondDepot(bail.type_bail, bail.loyer_hc, c.parametresR03);
  if (plafond !== null && bail.depot_garantie !== null && bail.depot_garantie > plafond) {
    controles.push({
      code: 'depot_depasse',
      niveau: 'bloquant',
      source: 'R-03',
      message:
        'Petit dépassement repéré : votre dépôt de garantie est plus élevé que ce que la loi autorise. La partie en trop n’a pas de valeur juridique, et votre locataire pourrait vous la réclamer. Autant régulariser à l’amiable, en toute sérénité.',
      aValider: false,
    });
  }

  // Loi, art. 22 : pas de dépôt si le loyer est payable d'avance pour plus de deux mois.
  if (habitation && bail.depot_garantie && bail.periodicite === 'trimestrielle' && bail.terme === 'a_echoir') {
    controles.push({
      code: 'depot_paiement_trimestriel',
      niveau: 'bloquant',
      source: 'Loi n° 89-462, art. 22',
      message:
        'Avec un loyer payé d’avance par trimestre, la loi ne permet pas de demander un dépôt de garantie. Passez au paiement mensuel, ou retirez le dépôt.',
      aValider: true,
    });
  }

  // Durée.
  if (bail.type_bail === 'meuble' && bail.duree_mois !== null) {
    if (bail.duree_mois < DUREES_MINIMALES.meuble.standard && !c.locataires.tousEtudiants) {
      // Modèle M-02b, message validé.
      controles.push({
        code: 'meuble_neuf_mois',
        niveau: 'bloquant',
        source: 'M-02b',
        message: 'La durée de 9 mois est réservée aux étudiants. Pour votre locataire, le bail sera d’un an minimum.',
        aValider: false,
      });
    } else if (bail.duree_mois < DUREES_MINIMALES.meuble.etudiant) {
      controles.push(dureeTropCourte(DUREES_MINIMALES.meuble.etudiant));
    }
  }
  if (bail.type_bail === 'nu' && bail.duree_mois !== null) {
    const minimum = DUREES_MINIMALES.nu[c.qualite];
    if (bail.duree_mois < minimum) {
      const reduiteValable =
        c.qualite === 'personne_physique' && bail.duree_mois >= DUREES_MINIMALES.nuReduiteMinimum && !!bail.motif_duree_reduite?.trim();
      if (!reduiteValable) controles.push(dureeTropCourte(minimum));
    }
  }

  // Charges : forfait en location nue réservé à la colocation (contrat type, annexe 1, IV. B).
  if (bail.type_bail === 'nu' && bail.mode_charges === 'forfait' && !colocation) {
    controles.push({
      code: 'forfait_nu',
      niveau: 'bloquant',
      source: 'Contrat type, annexe 1, IV. B',
      message:
        'En location vide, le forfait de charges n’est possible qu’en colocation. Choisissez des provisions avec régularisation annuelle, ou un paiement périodique sans provision.',
      aValider: true,
    });
  }
  if (bail.type_bail === 'meuble' && bail.mode_charges === 'forfait') {
    // Modèle M-02b, message validé.
    controles.push({
      code: 'forfait_meuble',
      niveau: 'information',
      source: 'M-02b',
      message:
        'Avec un forfait, vos charges ne seront pas régularisées en fin d’année : vous gagnez en simplicité, mais vous assumez les écarts.',
      aValider: false,
    });
  }

  // R-09 : réponse du bailleur différente de la liste officielle applicable à la date du bail.
  if (
    habitation &&
    c.zoneTendueOfficielle != null &&
    bail.soumis_evolution_relocation != null &&
    bail.soumis_evolution_relocation !== c.zoneTendueOfficielle
  ) {
    controles.push({
      code: 'zone_tendue_ecart',
      niveau: 'avertissement',
      source: 'R-09',
      message: c.zoneTendueOfficielle
        ? 'D’après la liste officielle applicable à la date de prise d’effet, la commune du logement est en zone tendue : le loyer est soumis au plafond d’évolution à la relocation.'
        : 'D’après la liste officielle applicable à la date de prise d’effet, la commune du logement n’est pas en zone tendue. Vérifiez votre réponse.',
      aValider: true,
    });
  }

  return controles;
}

function dureeTropCourte(minimumMois: number): Controle {
  const duree = minimumMois % 12 === 0 ? `${minimumMois / 12} an${minimumMois > 12 ? 's' : ''}` : `${minimumMois} mois`;
  return {
    code: 'duree_minimale',
    niveau: 'bloquant',
    source: 'Loi n° 89-462, art. 10 et 25-7',
    message: `La loi impose une durée d’au moins ${duree} pour ce bail.`,
    aValider: true,
  };
}

// ---------------------------------------------------------------------
// Révision du loyer (règle R-02) : loyer × IRL du trimestre de référence
// de l'année en cours ÷ IRL du même trimestre de l'année précédente.
// ---------------------------------------------------------------------

export type IndiceIrl = { annee: number; trimestre: number; valeur: number; parution_jo: string | null };

/**
 * Indices à utiliser pour une révision à une date donnée : le dernier IRL du
 * trimestre de référence publié à cette date, et celui du même trimestre un
 * an plus tôt. Null si l'un des deux n'est pas encore connu.
 */
export function indicesPourRevision(
  indices: IndiceIrl[],
  trimestre: number,
  dateRevision: string,
): { nouveau: IndiceIrl; ancien: IndiceIrl } | null {
  const publies = indices
    .filter((i) => i.trimestre === trimestre && i.parution_jo !== null && i.parution_jo <= dateRevision)
    .sort((a, b) => b.annee - a.annee);
  const nouveau = publies[0];
  if (!nouveau) return null;
  const ancien = indices.find((i) => i.trimestre === trimestre && i.annee === nouveau.annee - 1);
  return ancien ? { nouveau, ancien } : null;
}

/** Nouveau loyer hors charges, arrondi au centime. */
export function loyerRevise(loyerHc: number, nouveau: number, ancien: number): number {
  return Math.round(((loyerHc * nouveau) / ancien) * 100) / 100;
}

/**
 * Trimestre de l'IRL proposé par défaut : le dernier indice publié à la date
 * de signature (règle R-02 : « on retient celui du dernier indice publié à la
 * signature du bail »). Le bailleur peut en choisir un autre.
 */
export function dernierIrlPublie(indices: IndiceIrl[], dateSignature: string): IndiceIrl | null {
  const publies = indices
    .filter((i) => i.parution_jo !== null && i.parution_jo <= dateSignature)
    .sort((a, b) => b.annee - a.annee || b.trimestre - a.trimestre);
  return publies[0] ?? null;
}
