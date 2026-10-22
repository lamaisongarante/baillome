// Complétude de la fiche du bien (spec étape 1, § 4 ; maquette 14 bis).
// Fonctions sans dépendance, testées dans tests/logique.

export type BienPourCompletude = {
  type_bien: string;
  type_location: string | null;
  situation_locative: string | null;
  adresse: string | null;
  code_insee: string | null;
  identifiant_fiscal: string | null;
  type_habitat: string | null;
  regime_juridique: string | null;
  periode_construction: string | null;
  surface_habitable: number | null;
  pieces_principales: number | null;
  hauteur_sous_plafond: number | null;
  autres_parties: string[];
  dpe_classe: string | null;
  dpe_date: string | null;
  dpe_depenses_min_euros: number | null;
  dpe_depenses_max_euros: number | null;
  chauffage_mode: string | null;
  eau_chaude_mode: string | null;
  cuisine: string | null;
  sanitaires: string | null;
  equipements_numeriques: string | null;
  cuisine_equipements?: string[];
  salle_eau_equipements?: string[];
  wc?: string | null;
};

export type Complements = {
  /** Nombre d'éléments obligatoires de mobilier cochés (sur le total du décret). */
  mobilierCoche: number;
  mobilierTotal: number;
  assurancePno: boolean;
  attestationLocataire: boolean;
};

export type CodeRubrique = 'identite' | 'surfaces' | 'energie' | 'equipements' | 'assurances';

export type EtatRubrique = { code: CodeRubrique; remplis: number; total: number };

/** Un garage ou une place n'a ni DPE, ni pièces, ni équipements. */
export function estUnLogement(bien: Pick<BienPourCompletude, 'type_bien'>) {
  return bien.type_bien !== 'garage';
}

/** Meublé : situation « loué meublé » ou type de location meublée. */
export function estMeuble(bien: Pick<BienPourCompletude, 'situation_locative' | 'type_location'>) {
  return (
    bien.situation_locative === 'loue_meuble' ||
    bien.type_location === 'meublee' ||
    bien.type_location === 'meuble_tourisme'
  );
}

const rempli = (v: unknown) => v !== null && v !== undefined && v !== '';

function compter(valeurs: boolean[]) {
  return { remplis: valeurs.filter(Boolean).length, total: valeurs.length };
}

export function rubriques(bien: BienPourCompletude, c: Complements): EtatRubrique[] {
  const logement = estUnLogement(bien);
  const liste: EtatRubrique[] = [
    {
      code: 'identite',
      ...compter(
        logement
          ? [
              rempli(bien.adresse) && rempli(bien.code_insee),
              rempli(bien.identifiant_fiscal),
              rempli(bien.type_habitat),
              rempli(bien.regime_juridique),
              rempli(bien.periode_construction),
            ]
          : [rempli(bien.adresse) && rempli(bien.code_insee), rempli(bien.identifiant_fiscal), rempli(bien.regime_juridique)],
      ),
    },
  ];

  if (logement) {
    liste.push({
      code: 'surfaces',
      ...compter([
        rempli(bien.surface_habitable),
        rempli(bien.pieces_principales),
        rempli(bien.hauteur_sous_plafond),
        // « Aucune » est une réponse : le tableau n'est vide que si rien n'a été indiqué.
        bien.autres_parties.length > 0,
      ]),
    });
    liste.push({
      code: 'energie',
      ...compter([
        rempli(bien.dpe_classe),
        rempli(bien.dpe_date),
        rempli(bien.dpe_depenses_min_euros) && rempli(bien.dpe_depenses_max_euros),
      ]),
    });
    const equipements = [
      rempli(bien.chauffage_mode),
      rempli(bien.eau_chaude_mode),
      (bien.cuisine_equipements ?? []).length > 0 || rempli(bien.cuisine),
      (bien.salle_eau_equipements ?? []).length > 0 || rempli(bien.wc) || rempli(bien.sanitaires),
      rempli(bien.equipements_numeriques),
    ];
    if (estMeuble(bien)) equipements.push(c.mobilierTotal > 0 && c.mobilierCoche >= c.mobilierTotal);
    liste.push({ code: 'equipements', ...compter(equipements) });
  }

  liste.push({
    code: 'assurances',
    ...compter(
      bien.situation_locative === 'pas_encore_loue' ? [c.assurancePno] : [c.assurancePno, c.attestationLocataire],
    ),
  });

  return liste;
}

/** Pourcentage global, arrondi à l'unité. */
export function pourcentage(etats: EtatRubrique[]): number {
  const total = etats.reduce((s, e) => s + e.total, 0);
  const remplis = etats.reduce((s, e) => s + e.remplis, 0);
  return total === 0 ? 0 : Math.round((remplis / total) * 100);
}
