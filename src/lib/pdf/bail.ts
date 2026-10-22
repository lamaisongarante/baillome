// Bail d'habitation (nu ou meublé) en HTML imprimable, construit à partir du
// texte officiel du contrat type (contenus/officiels, copie exacte de
// Légifrance) : chaque ligne est reprise telle quelle ; seules les parties
// entre crochets, qui décrivent ce que les parties doivent indiquer, sont
// remplacées par les données du bail. Les rubriques « le cas échéant » sans
// objet sont omises. Les clauses rédigées par Baillome (solidarité, clauses de
// résiliation facultatives) sont celles des modèles M-02a et M-02c, à valider
// par l'avocat.
//
// Fonctions pures, testées dans tests/logique/pdf-bail.test.mjs.
import { TEXTES_OFFICIELS } from '../../contenus/textes-officiels.ts';
import { couleursDpe } from '../../theme/tokens.ts';
import { afficherTelephone } from '../personnes.ts';
import { LIBELLES_DIAGNOSTICS } from '../../../supabase/functions/_partage/bail.ts';
import type { PiecesAnnexes } from './annexes.ts';
import { PIN, champ, dateFr, euros, html, page } from './commun.ts';
import { htmlNotice } from './notice.ts';

export type DonneesBail = {
  type: 'nu' | 'meuble';
  fichierContrat: string; // ex. « contrat-type-nu-2026-10-01.md »
  versionContrat: string;
  /** Notice d'information jointe (annexe C) ; null si la date du bail précède la version stockée. */
  fichierNotice: string | null;
  bailleur: {
    nom: string;
    adresse: string | null;
    qualite: 'personne_physique' | 'personne_morale';
    sciFamiliale: boolean;
    telephone: string | null;
    email: string | null;
    /** Compléments de pratique professionnelle, hors contrat type (facultatifs). */
    date_naissance: string | null;
    lieu_naissance: string | null;
    forme_juridique: string | null;
    siren: string | null;
    representant_legal: string | null;
  };
  locataires: {
    prenom: string | null;
    nom: string;
    telephone: string | null;
    email: string | null;
    /** Compléments hors contrat type (facultatifs). */
    date_naissance: string | null;
    lieu_naissance: string | null;
    adresse: string | null;
  }[];
  colocation: boolean;
  bien: {
    numero: number;
    adresse: string | null;
    batiment: string | null;
    etage: string | null;
    porte: string | null;
    code_postal: string | null;
    commune: string | null;
    identifiant_fiscal: string | null;
    type_habitat: 'collectif' | 'individuel' | null;
    regime_juridique: 'mono_propriete' | 'copropriete' | null;
    periode_construction: string | null;
    surface_habitable: number | null;
    pieces_principales: number | null;
    autres_parties: string[];
    equipements: string | null;
    chauffage_mode: 'individuel' | 'collectif' | null;
    chauffage_repartition: string | null;
    eau_chaude_mode: 'individuelle' | 'collective' | null;
    eau_chaude_repartition: string | null;
    parties_communes: string | null;
    dpe_classe: string | null;
    dpe_date: string | null;
    dpe_depenses_min_euros: number | null;
    dpe_depenses_max_euros: number | null;
    dpe_annee_reference_prix: number | null;
    equipements_numeriques: string | null;
    servitude_residence_principale: boolean;
    locaux_accessoires: { type: string; numero_lot: string | null; description: string | null }[];
  };
  bail: {
    date_effet: string | null;
    duree_mois: number | null;
    motif_duree_reduite: string | null;
    loyer_hc: number | null;
    soumis_evolution_relocation: boolean | null;
    soumis_loyer_reference: boolean | null;
    loyer_reference_m2: number | null;
    loyer_reference_majore_m2: number | null;
    complement_loyer: number | null;
    complement_justification: string | null;
    precedent_loyer: number | null;
    precedent_loyer_verse_le: string | null;
    precedent_revision_le: string | null;
    clause_revision: boolean | null;
    date_revision: string | null;
    trimestre_irl: number | null;
    mode_charges: 'provisions' | 'periodique' | 'forfait' | null;
    charges_montant: number | null;
    revision_forfait: string | null;
    contribution_montant: number | null;
    contribution_duree: string | null;
    contribution_justification: string | null;
    assurance_pour_compte: boolean;
    assurance_montant_annuel: number | null;
    periodicite: 'mensuelle' | 'trimestrielle';
    terme: 'a_echoir' | 'echu' | null;
    jour_paiement: number | null;
    lieu_paiement: string | null;
    travaux_depuis_dernier_bail: string | null;
    travaux_six_derniers_mois: string | null;
    majoration_travaux: string | null;
    diminution_travaux: string | null;
    depot_garantie: number | null;
    clause_solidarite: boolean | null;
    clause_resiliation_assurance: boolean;
    clause_resiliation_troubles: boolean;
    conditions_particulieres: string | null;
    niveau_signature: 'avancee' | 'qualifiee';
    lieu_signature: string | null;
  };
  /** Documents réellement joints, tirés de la fiche du bien et du coffre (XI). */
  /** Pièces du coffre, lues par la même fonction que les annexes (une seule source). */
  annexes: PiecesAnnexes;
  /** Bail non encore validé par Sarah et l'avocat : mention « projet » sur chaque page. */
  projet: boolean;
};

// ---------------------------------------------------------------------
// Rédactions de Baillome (modèles M-02a et M-02c), à valider par l'avocat
// ---------------------------------------------------------------------

const SOLIDARITE =
  'Pour l’exécution de toutes les obligations du présent contrat, il y aura solidarité et indivisibilité entre les locataires.';
const SOLIDARITE_COLOCATION =
  'Les colocataires sont tenus solidairement et indivisiblement de l’exécution de toutes les obligations du présent contrat. Conformément au VI de l’article 8-1 de la loi du 6 juillet 1989, la solidarité d’un colocataire et celle de la personne qui s’est portée caution pour lui prennent fin à la date d’effet du congé régulièrement délivré lorsqu’un nouveau colocataire figure au bail ; à défaut, elles s’éteignent au plus tard à l’expiration d’un délai de six mois après la date d’effet du congé.';
const RESILIATION = {
  introduction: 'le contrat de location est résilié de plein droit :',
  assurance:
    'pour la non-souscription d’une assurance des risques locatifs, cette clause ne produisant effet qu’un mois après commandement demeuré infructueux',
  troubles:
    'pour le non-respect de l’obligation d’user paisiblement des locaux loués, résultant de troubles de voisinage constatés par une décision de justice passée en force de chose jugée',
  servitude:
    'lorsque le logement est soumis à l’obligation prévue à l’article L. 151-14-1 du code de l’urbanisme, pour le non-respect de l’obligation de l’occuper exclusivement à titre de résidence principale ; dans ce dernier cas, la clause ne peut produire effet qu’à l’expiration d’un délai de mise en demeure fixé par le maire conformément au II de l’article L. 481-4 du code de l’urbanisme',
};

// ---------------------------------------------------------------------
// Libellés des valeurs (repris des crochets du contrat type)
// ---------------------------------------------------------------------

const PERIODES: Record<string, string> = {
  avant_1949: 'avant 1949',
  '1949_1974': 'de 1949 à 1974',
  '1975_1989': 'de 1975 à 1989',
  '1989_2005': 'de 1989 à 2005',
  depuis_2005: 'depuis 2005',
};
const LOCAUX: Record<string, string> = { cave: 'cave', parking: 'parking', garage: 'garage', autre: 'local' };
const TRIMESTRES = ['', '1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'];

const nomComplet = (p: { prenom: string | null; nom: string }) => [p.prenom, p.nom].filter(Boolean).join(' ');
const telephone = (t: string) => afficherTelephone(t);

function duree(mois: number): string {
  if (mois % 12 === 0) return `${mois / 12} an${mois > 12 ? 's' : ''}`;
  return `${mois} mois`;
}

// ---------------------------------------------------------------------
// Règles de remplissage, ligne par ligne
// ---------------------------------------------------------------------

/**
 * Résultat d'une règle :
 * - « garder » : ligne reprise telle quelle ;
 * - « omettre » : ligne sans objet ;
 * - « omettreBloc » : la ligne et tout ce qui en dépend (jusqu'au titre suivant de même niveau) ;
 * - une chaîne : remplace la partie entre crochets (du premier « [ » au dernier « ] ») ;
 * - un tableau : remplace chaque partie entre crochets, dans l'ordre.
 */
type Remplissage = 'garder' | 'omettre' | 'omettreBloc' | string | string[];
type Regle = { debut: string; remplir: (d: DonneesBail) => Remplissage };

const normaliser = (s: string) =>
  s
    .toLowerCase()
    .replace(/[,’]/g, (c) => (c === '’' ? "'" : ''))
    .replace(/\s+/g, ' ')
    .trim();

const ouNon = (v: boolean | null) => (v ? 'Oui' : 'Non');

function regles(): Regle[] {
  return [
    // I. Désignation des parties
    {
      debut: '- [nom et prénom ou dénomination du bailleur',
      remplir: ({ bailleur: b }) => {
        const qualite =
          b.qualite === 'personne_physique'
            ? 'personne physique'
            : `personne morale${b.sciFamiliale ? ', société civile constituée exclusivement entre parents et alliés jusqu’au quatrième degré inclus' : ''}`;
        return [
          b.nom,
          b.adresse ? `domicile ou siège social : ${b.adresse}` : 'domicile ou siège social : à compléter',
          qualite,
          b.telephone ? `portable : ${telephone(b.telephone)}` : null,
          b.email ? `adresse électronique : ${b.email}` : null,
        ]
          .filter(Boolean)
          .join(' ; ');
      },
    },
    { debut: '- le cas échéant représenté par le mandataire', remplir: () => 'omettre' },
    { debut: '- [nom ou raison sociale et adresse du mandataire', remplir: () => 'omettre' },
    { debut: '- le cas échéant [numéro et lieu de délivrance', remplir: () => 'omettre' },
    {
      debut: '- [nom et prénom du ou des locataires',
      remplir: ({ locataires }) =>
        locataires
          .map((l) =>
            [nomComplet(l), l.telephone ? `portable : ${telephone(l.telephone)}` : null, l.email ? `adresse électronique : ${l.email}` : null]
              .filter(Boolean)
              .join(', '),
          )
          .join(' ; '),
    },

    // II. A. Consistance du logement
    {
      debut: '- localisation du logement',
      remplir: ({ bien: b }) =>
        [
          b.adresse,
          b.batiment ? `bâtiment ${b.batiment}` : null,
          b.etage ? `étage ${b.etage}` : null,
          b.porte ? `porte ${b.porte}` : null,
          [b.code_postal, b.commune].filter(Boolean).join(' '),
        ]
          .filter(Boolean)
          .join(', '),
    },
    { debut: '- identifiant fiscal du logement', remplir: ({ bien }) => bien.identifiant_fiscal ?? 'à compléter' },
    {
      debut: "- type d'habitat",
      remplir: ({ bien }) => (bien.type_habitat === 'collectif' ? 'immeuble collectif' : bien.type_habitat === 'individuel' ? 'individuel' : 'à compléter'),
    },
    {
      debut: "- régime juridique de l'immeuble",
      remplir: ({ bien }) =>
        bien.regime_juridique === 'copropriete' ? 'copropriété' : bien.regime_juridique === 'mono_propriete' ? 'mono propriété' : 'à compléter',
    },
    { debut: '- période de construction', remplir: ({ bien }) => PERIODES[bien.periode_construction ?? ''] ?? 'à compléter' },
    {
      debut: '- surface habitable',
      remplir: ({ bien }) => (bien.surface_habitable ? String(bien.surface_habitable).replace('.', ',') : 'à compléter'),
    },
    { debut: '- nombre de pièces principales', remplir: ({ bien }) => (bien.pieces_principales !== null ? String(bien.pieces_principales) : 'à compléter') },
    {
      debut: '- le cas échéant autres parties du logement',
      remplir: ({ bien }) => (bien.autres_parties.length ? bien.autres_parties.join(', ') : 'omettre'),
    },
    {
      debut: "- le cas échéant eléments d'équipements du logement",
      remplir: ({ bien }) => bien.equipements?.trim() || 'omettre',
    },
    { debut: '- modalité de production de chauffage', remplir: chauffage },
    { debut: '- modalité de production chauffage', remplir: chauffage },
    {
      debut: "- modalité de production d'eau chaude sanitaire",
      remplir: ({ bien }) => {
        if (!bien.eau_chaude_mode) return 'à compléter';
        if (bien.eau_chaude_mode === 'individuelle') return 'individuelle';
        // Note (5) : préciser les modalités de répartition de la consommation du locataire.
        return `collective ; répartition de la consommation du locataire : ${bien.eau_chaude_repartition?.trim() || 'à compléter'}`;
      },
    },
    {
      debut: '- niveau de performance du logement',
      remplir: ({ bien }) => (bien.dpe_classe ? `classe ${bien.dpe_classe}` : 'à compléter'),
    },

    // II. B à E
    { debut: 'b. destination des locaux', remplir: () => 'usage d’habitation' },
    {
      debut: 'le cas échéant servitude de résidence principale',
      remplir: ({ bien }) => (bien.servitude_residence_principale ? 'garder' : 'omettre'),
    },
    {
      debut: 'c. le cas échéant désignation des locaux et équipements accessoires',
      remplir: ({ bien }) =>
        bien.locaux_accessoires.length
          ? bien.locaux_accessoires
              .map((l) => [LOCAUX[l.type] ?? l.type, l.numero_lot ? `lot n° ${l.numero_lot}` : null, l.description].filter(Boolean).join(', '))
              .join(' ; ')
          : 'omettre',
    },
    {
      debut: 'd. le cas échéant enumération des locaux',
      remplir: ({ bien }) =>
        bien.parties_communes?.trim() || (bien.regime_juridique === 'copropriete' || bien.type_habitat === 'collectif' ? 'à compléter' : 'omettre'),
    },
    {
      debut: "e. le cas échéant equipement d'accès aux technologies",
      remplir: ({ bien }) => bien.equipements_numeriques?.trim() || 'omettre',
    },

    // III. Date de prise d'effet et durée
    { debut: "a. date de prise d'effet du contrat", remplir: ({ bail }) => dateFr(bail.date_effet) || 'à compléter' },
    { debut: 'b. durée du contrat', remplir: ({ bail }) => (bail.duree_mois ? duree(bail.duree_mois) : 'à compléter') },
    {
      debut: 'c. le cas échéant evénement et raison justifiant la durée réduite',
      remplir: ({ bail }) => bail.motif_duree_reduite?.trim() || 'omettre',
    },

    // IV. A. Loyer
    { debut: 'a) montant du loyer mensuel', remplir: ({ bail }) => (bail.loyer_hc !== null ? euros(bail.loyer_hc) : 'à compléter') },
    {
      debut: 'b) le cas échéant modalités particulières de fixation initiale du loyer',
      remplir: ({ bail }) => (bail.soumis_evolution_relocation || bail.soumis_loyer_reference ? 'garder' : 'omettreBloc'),
    },
    {
      debut: '- le loyer du logement objet du présent contrat est soumis au décret',
      remplir: ({ bail }) => ouNon(bail.soumis_evolution_relocation),
    },
    {
      debut: '- le loyer du logement objet du présent contrat est soumis au loyer de référence majoré',
      remplir: ({ bail }) => ouNon(bail.soumis_loyer_reference),
    },
    {
      debut: '- montant du loyer de référence',
      remplir: ({ bail }) =>
        bail.soumis_loyer_reference && bail.loyer_reference_m2 !== null && bail.loyer_reference_majore_m2 !== null
          ? [String(bail.loyer_reference_m2).replace('.', ','), String(bail.loyer_reference_majore_m2).replace('.', ',')]
          : 'omettre',
    },
    {
      debut: '- le cas échéant complément de loyer',
      remplir: ({ bail }) =>
        bail.complement_loyer
          ? `loyer de base ${euros((bail.loyer_hc ?? 0) - bail.complement_loyer)}, complément de loyer ${euros(bail.complement_loyer)}${
              bail.complement_justification ? `, justifié par : ${bail.complement_justification}` : ''
            }`
          : 'omettre',
    },
    {
      debut: 'c) le cas échéant informations relatives au loyer du dernier locataire',
      remplir: ({ bail }) =>
        bail.precedent_loyer !== null
          ? [
              `${euros(bail.precedent_loyer)}`,
              bail.precedent_loyer_verse_le ? `versé le ${dateFr(bail.precedent_loyer_verse_le)}` : null,
              bail.precedent_revision_le ? `dernière révision le ${dateFr(bail.precedent_revision_le)}` : null,
            ]
              .filter(Boolean)
              .join(', ')
          : 'omettre',
    },
    { debut: '2° le cas échéant modalités de révision', remplir: ({ bail }) => (bail.clause_revision ? 'garder' : 'omettreBloc') },
    {
      debut: 'a) date de révision',
      remplir: ({ bail }) =>
        bail.date_revision
          ? `le ${dateFr(bail.date_revision).slice(0, 5)} de chaque année`
          : bail.date_effet
            ? `le ${dateFr(bail.date_effet).slice(0, 5)} de chaque année, date anniversaire du contrat`
            : 'à compléter',
    },
    {
      debut: "b) date ou trimestre de référence de l'irl",
      remplir: ({ bail }) => (bail.trimestre_irl ? TRIMESTRES[bail.trimestre_irl] : 'à compléter'),
    },

    // IV. B. Charges récupérables
    {
      debut: '1. modalité de règlement des charges récupérables',
      remplir: ({ bail }) =>
        bail.mode_charges === 'provisions'
          ? 'provisions sur charges avec régularisation annuelle'
          : bail.mode_charges === 'periodique'
            ? 'paiement périodique des charges sans provision'
            : bail.mode_charges === 'forfait'
              ? 'récupération des charges par le bailleur sous la forme d’un forfait'
              : 'à compléter',
    },
    {
      debut: '2. le cas échéant montant des provisions sur charges',
      remplir: ({ bail }) => (bail.charges_montant ? euros(bail.charges_montant) : 'omettre'),
    },
    {
      debut: '3. le cas échéant en cas de colocation et si les parties en conviennent modalités de révision du forfait',
      remplir: ({ bail }) => (bail.mode_charges === 'forfait' && bail.revision_forfait?.trim() ? bail.revision_forfait : 'omettre'),
    },
    {
      debut: '3. le cas échéant modalités de révision du forfait de charges',
      remplir: ({ bail }) => (bail.mode_charges === 'forfait' && bail.revision_forfait?.trim() ? bail.revision_forfait : 'omettre'),
    },

    // IV. C (nu). Contribution pour le partage des économies de charges
    {
      debut: 'c. le cas échéant contribution pour le partage des économies de charges',
      remplir: ({ bail }) => (bail.contribution_montant ? 'garder' : 'omettreBloc'),
    },
    {
      debut: '1. montant et durée de la participation du locataire',
      remplir: ({ bail }) => `${euros(bail.contribution_montant ?? 0)}${bail.contribution_duree ? `, ${bail.contribution_duree}` : ''}`,
    },
    { debut: '2. eléments propres à justifier les travaux', remplir: ({ bail }) => bail.contribution_justification?.trim() || 'à compléter' },

    // Assurance pour le compte des colocataires (IV. D en nu, IV. C en meublé)
    {
      debut: 'd. le cas échéant en cas de colocation souscription par le bailleur',
      remplir: ({ colocation, bail }) => (colocation ? ouNon(bail.assurance_pour_compte) : 'omettreBloc'),
    },
    {
      debut: 'c. le cas échéant en cas de colocation souscription par le bailleur',
      remplir: ({ colocation, bail }) => (colocation ? ouNon(bail.assurance_pour_compte) : 'omettreBloc'),
    },
    { debut: '1. montant total annuel récupérable', remplir: assuranceAnnuelle },
    { debut: 'a) montant total annuel récupérable', remplir: assuranceAnnuelle },
    { debut: '2. montant récupérable par douzième', remplir: assuranceDouzieme },
    { debut: 'b) montant récupérable par douzième', remplir: assuranceDouzieme },

    // Modalités de paiement
    {
      debut: '- périodicité du paiement',
      remplir: ({ bail }) => (bail.periodicite === 'trimestrielle' ? 'trimestrielle' : 'mensuelle'),
    },
    {
      debut: '- paiement [à échoir',
      remplir: ({ bail }) => (bail.terme === 'echu' ? 'à terme échu' : bail.terme === 'a_echoir' ? 'à échoir' : 'à compléter'),
    },
    {
      debut: '- date ou période de paiement',
      remplir: ({ bail }) =>
        bail.jour_paiement ? `le ${bail.jour_paiement} de chaque ${bail.periodicite === 'trimestrielle' ? 'trimestre' : 'mois'}` : 'à compléter',
    },
    { debut: '- le cas échéant lieu de paiement', remplir: ({ bail }) => bail.lieu_paiement?.trim() || 'omettre' },
    { debut: '- le cas échéant montant total dû à la première échéance', remplir: premiereEcheance },
    { debut: '- le cas échéant montant total du à la première échéance', remplir: premiereEcheance },

    // Réévaluation d'un loyer sous-évalué : seulement au renouvellement (hors V1)
    { debut: "f. le cas échéant exclusivement lors d'un renouvellement", remplir: () => 'omettreBloc' },
    { debut: "e. le cas échéant exclusivement lors d'un renouvellement", remplir: () => 'omettreBloc' },

    // Dépenses énergétiques
    {
      debut: "montant estimé des dépenses annuelles d'énergie",
      remplir: ({ bien }) => [
        bien.dpe_depenses_min_euros !== null && bien.dpe_depenses_max_euros !== null
          ? `entre ${euros(bien.dpe_depenses_min_euros)} et ${euros(bien.dpe_depenses_max_euros)}`
          : 'à compléter',
        bien.dpe_annee_reference_prix ? String(bien.dpe_annee_reference_prix) : 'à compléter',
      ],
    },

    // V. Travaux
    {
      debut: 'a. le cas échéant montant et nature des travaux',
      remplir: ({ bail }) =>
        bail.travaux_depuis_dernier_bail?.trim()
          ? `${bail.travaux_depuis_dernier_bail}${
              bail.travaux_six_derniers_mois?.trim() ? ` ; dont travaux d’amélioration des six derniers mois : ${bail.travaux_six_derniers_mois}` : ''
            }`
          : 'omettre',
    },
    { debut: 'b. le cas échéant majoration du loyer en cours de bail', remplir: ({ bail }) => bail.majoration_travaux?.trim() || 'omettre' },
    { debut: 'c. le cas échéant diminution de loyer en cours de bail', remplir: ({ bail }) => bail.diminution_travaux?.trim() || 'omettre' },

    // VI. Garanties
    {
      debut: 'le cas échéant montant du dépôt de garantie',
      remplir: ({ bail }) => (bail.depot_garantie ? euros(bail.depot_garantie) : 'omettre'),
    },

    // VII. Solidarité
    {
      debut: 'vii. le cas échéant clause de solidarité',
      remplir: ({ locataires, bail }) => (locataires.length > 1 && bail.clause_solidarite ? 'garder' : 'omettreBloc'),
    },
    {
      debut: 'modalités particulières des obligations en cas de pluralité de locataires',
      remplir: ({ colocation }) => (colocation ? SOLIDARITE_COLOCATION : SOLIDARITE),
    },

    // VIII. Clauses de résiliation facultatives
    {
      debut: 'le cas échéant modalités de résiliation de plein droit du contrat pour des motifs autres',
      remplir: ({ bail, bien }) => {
        const clauses = [
          bail.clause_resiliation_assurance ? RESILIATION.assurance : null,
          bail.clause_resiliation_troubles ? RESILIATION.troubles : null,
          bien.servitude_residence_principale ? RESILIATION.servitude : null,
        ].filter((c): c is string => !!c);
        if (!clauses.length) return 'omettre';
        return `${RESILIATION.introduction} ${clauses.map((c, i) => `${c}${i === clauses.length - 1 ? '.' : ' ;'}`).join(' ')}`;
      },
    },

    // IX. Honoraires : aucun mandataire pour un bailleur qui loue seul
    { debut: 'ix. le cas échéant honoraires de location', remplir: () => 'omettreBloc' },

    // X. Autres conditions particulières
    { debut: '[a définir par les parties]', remplir: ({ bail }) => bail.conditions_particulieres?.trim() || 'Néant' },

    // XI. Annexes
    {
      debut: 'a. le cas échéant un extrait du règlement concernant la destination',
      remplir: ({ bien }) => (bien.regime_juridique === 'copropriete' ? 'garder' : 'omettre'),
    },
    { debut: 'e. le cas échéant une autorisation préalable de mise en location', remplir: () => 'omettre' },
    { debut: 'f. le cas échéant les références aux loyers habituellement constatés', remplir: () => 'omettre' },
  ];
}

function chauffage({ bien }: DonneesBail): Remplissage {
  if (!bien.chauffage_mode) return 'à compléter';
  if (bien.chauffage_mode === 'individuel') return 'individuel';
  // Note (4) : préciser les modalités de répartition de la consommation du locataire.
  return `collectif ; répartition de la consommation du locataire : ${bien.chauffage_repartition?.trim() || 'à compléter'}`;
}
function assuranceAnnuelle({ bail }: DonneesBail): Remplissage {
  return bail.assurance_pour_compte && bail.assurance_montant_annuel ? euros(bail.assurance_montant_annuel) : 'omettre';
}
function assuranceDouzieme({ bail }: DonneesBail): Remplissage {
  return bail.assurance_pour_compte && bail.assurance_montant_annuel
    ? euros(Math.round((bail.assurance_montant_annuel / 12) * 100) / 100)
    : 'omettre';
}
function premiereEcheance({ bail, colocation }: DonneesBail): Remplissage {
  if (bail.loyer_hc === null) return 'à compléter';
  const lignes: [string, number][] = [['loyer', bail.loyer_hc]];
  if (bail.charges_montant) lignes.push(['charges récupérables', bail.charges_montant]);
  if (bail.contribution_montant) lignes.push(['contribution pour le partage des économies de charges', bail.contribution_montant]);
  if (colocation && bail.assurance_pour_compte && bail.assurance_montant_annuel) {
    lignes.push(['assurance pour le compte des colocataires', Math.round((bail.assurance_montant_annuel / 12) * 100) / 100]);
  }
  const total = lignes.reduce((s, [, n]) => s + n, 0);
  return `${lignes.map(([l, n]) => `${l} ${euros(n)}`).join(' + ')} = ${euros(total)}`;
}

// ---------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------

type Niveau = 1 | 2 | 3 | 4 | 9;

/** Niveau de titre d'une ligne du contrat type (9 : contenu). */
function niveau(ligne: string): Niveau {
  if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI)\.\s/.test(ligne)) return 1;
  if (/^[A-G]\.\s/.test(ligne)) return 2;
  if (/^\d°\s/.test(ligne)) return 3;
  if (/^[a-c]\)\s/.test(ligne)) return 4;
  return 9;
}

/** Remplace la partie entre crochets d'une ligne par la ou les valeurs. */
function remplacer(ligne: string, valeur: string | string[]): string {
  if (Array.isArray(valeur)) {
    let i = 0;
    return html(ligne).replace(/\[[^\[\]]*\]/g, (m) => (i < valeur.length ? champ(valeur[i++]) : m));
  }
  const debut = ligne.indexOf('[');
  const fin = ligne.lastIndexOf(']');
  return `${html(ligne.slice(0, debut))}${champ(valeur)}${html(ligne.slice(fin + 1))}`;
}

export type LigneTraitee = { source: string; rendu: 'gardee' | 'remplie' | 'omise'; html: string };

/** Parcourt le contrat type et remplit chaque ligne ; exporté pour les tests. */
export function traiterContrat(d: DonneesBail): LigneTraitee[] {
  const texte = TEXTES_OFFICIELS[d.fichierContrat]?.texte;
  if (!texte) throw new Error(`Contrat type introuvable : ${d.fichierContrat}`);
  const R = regles();
  const lignes = texte.split('\n').filter((l) => l.trim());
  const resultat: LigneTraitee[] = [];
  let omissionJusquA: Niveau | null = null;

  for (const ligne of lignes) {
    const n = niveau(ligne);
    if (omissionJusquA !== null) {
      if (n <= omissionJusquA) omissionJusquA = null;
      else {
        resultat.push({ source: ligne, rendu: 'omise', html: '' });
        continue;
      }
    }
    const regle = R.find((r) => normaliser(ligne).startsWith(normaliser(r.debut)));
    const r = regle ? regle.remplir(d) : 'garder';
    if (r === 'omettre') {
      resultat.push({ source: ligne, rendu: 'omise', html: '' });
    } else if (r === 'omettreBloc') {
      resultat.push({ source: ligne, rendu: 'omise', html: '' });
      omissionJusquA = n === 9 ? null : n;
    } else if (r === 'garder' || !ligne.includes('[')) {
      resultat.push({ source: ligne, rendu: 'gardee', html: html(ligne) });
    } else {
      resultat.push({ source: ligne, rendu: 'remplie', html: remplacer(ligne, r) });
    }
  }

  // Titres dont toutes les rubriques ont été omises : omis aussi (de bas en haut).
  // Un titre sans rubrique dans le texte officiel (ex. « C. Une notice
  // d'information… » dans les annexes) est un élément à part entière : gardé.
  for (let i = resultat.length - 1; i >= 0; i--) {
    const l = resultat[i];
    const n = niveau(l.source);
    if (l.rendu === 'omise' || n === 9 || l.source.includes('[')) continue;
    let fin = i + 1;
    while (fin < resultat.length && niveau(resultat[fin].source) > n) fin++;
    const rubriques = resultat.slice(i + 1, fin);
    if (rubriques.length > 0 && rubriques.every((x) => x.rendu === 'omise')) resultat[i] = { ...l, rendu: 'omise', html: '' };
  }
  return resultat;
}

/** Mentions restées « à compléter » : le projet peut être généré, jamais envoyé à la signature. */
export function mentionsACompleter(d: DonneesBail): string[] {
  const manquantes = traiterContrat(d)
    .filter((l) => l.rendu === 'remplie' && l.html.includes('à compléter'))
    .map((l) =>
      l.source.startsWith('- [nom et prénom, ou dénomination du bailleur')
        ? 'Domicile ou siège social du bailleur'
        : l.source.replace(/^[-–]\s*/, '').split(/\s*:\s*\[|\s\[/)[0].replace(/\s*:$/, '').trim(),
    );
  if (!d.bail.lieu_signature?.trim()) manquantes.push('Lieu de signature');
  return manquantes;
}

const QUALITES = { personne_physique: 'personne physique', personne_morale: 'personne morale' } as const;

/** Case à cocher dessinée (une image s'imprime partout, contrairement à un fond coloré). */
const caseACocher = (cochee: boolean) =>
  `<svg class="case" width="8" height="8" viewBox="0 0 8 8"><rect x="0.5" y="0.5" width="7" height="7" rx="1.5" fill="${cochee ? PIN : 'none'}" stroke="${PIN}" stroke-width="1"/></svg>`;

/** Deux colonnes en tableau : la seule mise en colonnes que tous les moteurs d'impression respectent. */
const deuxColonnes = (gauche: string, droite: string, classe = '') =>
  `<table class="mise-en-page ${classe}"><tbody><tr><td class="col-gauche">${gauche}</td><td class="col-droite">${droite}</td></tr></tbody></table>`;

const ligne = (libelle: string, valeur: string) => `<div class="ligne"><span class="libelle">${html(libelle)} :</span> ${champ(valeur)}</div>`;
const naissance = (date: string | null, lieu: string | null) =>
  date || lieu ? [date ? `le ${dateFr(date)}` : null, lieu ? `à ${lieu}` : null].filter(Boolean).join(' ') : null;

/** Partie I : deux encadrés « Le bailleur » et « Le locataire » (maquette Bail-Editorial). */
function parties(d: DonneesBail, ligneBailleur: string, ligneLocataire: string): string {
  const b = d.bailleur;
  // Libellés repris des crochets du contrat type (« nom et prénom, ou dénomination du bailleur / domicile… »).
  const [lNom, lDomicile, , lPortable, lEmail] = ligneBailleur.slice(ligneBailleur.indexOf('[') + 1, ligneBailleur.lastIndexOf(']')).split(' / ');
  const suiteBailleur = ligneBailleur.slice(ligneBailleur.lastIndexOf(']') + 1).trim();
  const suiteLocataire = ligneLocataire.slice(ligneLocataire.lastIndexOf(']') + 1).trim();
  const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const caseQualite = (q: keyof typeof QUALITES) =>
    `<span class="option">${caseACocher(b.qualite === q)}${QUALITES[q]}${q === 'personne_morale' ? ' (1)' : ''}</span>`;

  const complementsBailleur = [
    naissance(b.date_naissance, b.lieu_naissance) && b.qualite === 'personne_physique'
      ? ligne('Date et lieu de naissance', naissance(b.date_naissance, b.lieu_naissance)!)
      : null,
    b.forme_juridique ? ligne('Forme juridique', b.forme_juridique) : null,
    b.siren ? ligne('Immatriculation (SIREN)', b.siren) : null,
    b.representant_legal ? ligne('Représentant légal', b.representant_legal) : null,
  ].filter(Boolean);

  const bailleur = `<div class="encadre partie-encadre"><div class="mono etiquette">LE BAILLEUR</div>
${ligne(majuscule(lNom), b.nom)}
${ligne(majuscule(lDomicile), b.adresse || 'à compléter')}
<div class="ligne"><span class="libelle">Qualité du bailleur :</span> ${caseQualite('personne_physique')} ${caseQualite('personne_morale')}${
    b.qualite === 'personne_morale' && b.sciFamiliale
      ? ` — ${champ('société civile constituée exclusivement entre parents et alliés jusqu’au quatrième degré inclus')}`
      : ''
  }</div>
${b.telephone ? ligne(majuscule(lPortable), telephone(b.telephone)) : ''}
${b.email ? ligne(majuscule(lEmail), b.email) : ''}
${complementsBailleur.length ? `<div class="complements"><div class="mono etiquette">COMPLÉMENTS (HORS CONTRAT TYPE)</div>${complementsBailleur.join('')}</div>` : ''}
<div class="designe">${html(suiteBailleur)}</div></div>`;

  const locataires = d.locataires
    .map((l) => {
      const complements = [
        naissance(l.date_naissance, l.lieu_naissance) ? ligne('Date et lieu de naissance', naissance(l.date_naissance, l.lieu_naissance)!) : null,
        l.adresse ? ligne('Adresse actuelle', l.adresse) : null,
      ].filter(Boolean);
      return `<div class="personne">${ligne('Nom et prénom', nomComplet(l))}
${l.telephone ? ligne('Numéro de téléphone portable (facultatif)', telephone(l.telephone)) : ''}
${l.email ? ligne('Adresse électronique (facultatif)', l.email) : ''}
${complements.length ? `<div class="complements"><div class="mono etiquette">COMPLÉMENTS (HORS CONTRAT TYPE)</div>${complements.join('')}</div>` : ''}</div>`;
    })
    .join('');
  const locataire = `<div class="encadre partie-encadre"><div class="mono etiquette">${d.locataires.length > 1 ? 'LES LOCATAIRES' : 'LE LOCATAIRE'}</div>
${locataires}<div class="designe">${html(suiteLocataire)}</div></div>`;
  return deuxColonnes(bailleur, locataire, 'parties-table');
}

/** Caractéristiques du logement : deux par ligne, les plus longues sur toute la largeur. */
function grilleEnTableau(elements: string[]): string {
  const lignes: string[] = [];
  let attente: string | null = null;
  const vider = () => {
    if (attente !== null) lignes.push(`<tr><td>${attente}</td><td></td></tr>`);
    attente = null;
  };
  for (const e of elements) {
    if (e.startsWith('large:')) {
      vider();
      lignes.push(`<tr><td colspan="2">${e.slice(6)}</td></tr>`);
    } else if (attente === null) attente = e;
    else {
      lignes.push(`<tr><td>${attente}</td><td>${e}</td></tr>`);
      attente = null;
    }
  }
  vider();
  return `<table class="mise-en-page grille"><tbody>${lignes.join('')}</tbody></table>`;
}

/** Étiquette de la classe DPE, entourée de sa couleur officielle (trait, sans aplat). */
function etiquetteDpe(classe: string | null): string {
  const c = (couleursDpe as Record<string, { fond: string; texte: string }>)[classe ?? ''];
  const bordure = c?.fond ?? PIN;
  // Classes claires (C, D, E) : lettre dans la couleur foncée de l'étiquette officielle, lisible sur fond blanc.
  const lettre = !c ? PIN : c.texte === couleursDpe.A.texte ? c.fond : c.texte;
  return `<div class="dpe"><span class="mono">CLASSE<br>DU DPE</span><span class="lettre" style="color: ${lettre}; border-color: ${bordure}">${html(classe ?? '?')}</span></div>`;
}

/** Bail complet, prêt à imprimer. */
export function htmlBail(d: DonneesBail): string {
  const lignes = traiterContrat(d);
  const corps: string[] = [];

  // Les deux premières lignes forment le cartouche (titre officiel et loi).
  const [titre, sousTitre, ...suite] = lignes;
  corps.push(`<div class="cartouche"><div>
<div class="mono sur-titre">CONTRAT TYPE · DÉCRET N° 2015-587 · VERSION DU ${html(dateFr(d.versionContrat))}</div>
<h1>${titre.html}</h1>${d.projet ? '<div class="mono sur-titre projet">PROJET À RELIRE · NON SIGNÉ</div>' : ''}</div>
<div class="mono loi">${sousTitre.html}</div></div>`);

  const visibles = suite.filter((x) => x.rendu !== 'omise');
  // Préambule du contrat type : texte officiel reproduit en petit, sous le bloc titre, sur deux colonnes.
  const debutParties = visibles.findIndex((l) => /^I\.\s/.test(l.source));
  const preambule = visibles.slice(0, debutParties);
  const contenu = visibles.slice(debutParties);
  if (preambule.length) {
    // Deux colonnes équilibrées : on coupe à la moitié du texte, entre deux paragraphes.
    const paragraphes = preambule.map((p) => `<p${p.source.startsWith('-') ? ' class="tiret"' : ''}>${p.html}</p>`);
    const total = preambule.reduce((n, p) => n + p.source.length, 0);
    let cumul = 0;
    const coupure = preambule.findIndex((p) => (cumul += p.source.length) >= total / 2) + 1;
    corps.push(
      `<div class="preambule"><div class="mono etiquette">PRÉAMBULE DU CONTRAT TYPE (TEXTE OFFICIEL)</div>${deuxColonnes(
        paragraphes.slice(0, coupure).join(''),
        paragraphes.slice(coupure).join(''),
      )}</div>`,
    );
  }

  let encadreDpe: string[] | null = null;
  // II. A : caractéristiques du logement en deux colonnes (maquette), les plus longues sur toute la largeur.
  let grille: string[] | null = null;
  for (const l of contenu) {
    const s = l.source;
    if (s.startsWith('- localisation du logement')) grille = [];
    if (grille && s.startsWith('- rappel : un logement décent')) {
      corps.push(grilleEnTableau(grille));
      grille = null;
    }
    if (grille) {
      const texte = l.html.replace(/<[^>]+>/g, '');
      grille.push(texte.length > 60 ? `large:<p class="tiret">${l.html}</p>` : `<p class="tiret">${l.html}</p>`);
      continue;
    }
    // Partie I : les deux encadrés remplacent les deux lignes de désignation.
    if (s.startsWith('- [nom et prénom, ou dénomination du bailleur')) {
      const locataire = contenu.find((x) => x.source.startsWith('- [nom et prénom du ou des locataires'));
      corps.push(parties(d, s, locataire?.source ?? ''));
      continue;
    }
    if (s.startsWith('- [nom et prénom du ou des locataires')) continue;
    // Rappel des niveaux de performance et classe du logement : un encadré, avec l'étiquette DPE.
    if (s.startsWith('- rappel : un logement décent')) encadreDpe = [];
    if (encadreDpe) {
      encadreDpe.push(`<p${s.startsWith('-') ? ' class="tiret"' : ''}>${l.html}</p>`);
      if (s.startsWith('- niveau de performance du logement')) {
        corps.push(`<div class="encadre-fort rappel"><div class="rappel-texte">${encadreDpe.join('')}</div>${etiquetteDpe(d.bien.dpe_classe)}</div>`);
        encadreDpe = null;
      }
      continue;
    }
    if (/^Le \[date\]/.test(s)) {
      corps.push(`<p>${remplacer(s, ['……………… (date de la signature électronique)', d.bail.lieu_signature?.trim() || '……………… (lieu de signature à indiquer)'])}</p>`);
      continue;
    }
    if (/^Signature du bailleur/.test(s)) {
      corps.push(signatures(d));
      continue;
    }
    if (/^\(\d+\)\s/.test(s)) {
      // Notes de bas de page : un paragraphe officiel, présenté note par note. Seules
      // les notes appelées dans le texte retenu sont imprimées, avec leur numéro officiel.
      const appelees = new Set([...corps.join(' ').replace(/<[^>]+>/g, ' ').matchAll(/\((\d{1,2})\)/g)].map((m) => m[1]));
      const notes = s.split(/\s(?=\(\d+\)\s)/).filter((n) => appelees.has(n.match(/^\((\d+)\)/)![1]));
      if (notes.length) corps.push(`<div class="notes">${notes.map((n) => `<p>${html(n)}</p>`).join('')}</div>`);
      continue;
    }
    const n = niveau(s);
    if (n === 1 && !s.includes('[')) {
      const [, numero, intitule] = s.match(/^([IVX]+)\.\s*-?\s*(.*?)\.?$/) ?? [];
      corps.push(`<div class="partie"><span class="numero">${numero}</span><span class="intitule">${html(intitule)}</span></div>`);
    } else if ((n === 2 || n === 3) && !s.includes('[')) {
      corps.push(`<div class="rubrique">${l.html}</div>`);
    } else {
      corps.push(`<p${s.startsWith('-') ? ' class="tiret"' : ''}>${l.html}</p>`);
    }
    // XI. B : documents réellement joints au dossier de diagnostic technique.
    if (s.startsWith('- le cas échéant, un état des risques naturels et technologiques')) {
      const p = d.annexes;
      const joints = p.diagnostics.map((x) => `${LIBELLES_DIAGNOSTICS[x.nature] ?? x.titre}${x.date ? ` du ${dateFr(x.date)}` : ''}`);
      const manquants = p.diagnosticsRequis.filter((n) => !p.diagnostics.some((x) => x.nature === n)).map((n) => LIBELLES_DIAGNOSTICS[n] ?? n);
      corps.push(
        `<div class="joints"><span class="mono etiquette">DOCUMENTS JOINTS</span> ${joints.length ? joints.map((x) => html(x)).join(' ; ') : 'aucun diagnostic rangé dans le coffre'}${
          manquants.length ? `<br><span class="mono etiquette">MANQUANTS</span> ${manquants.map((x) => html(x)).join(' ; ')}` : ''
        }${p.aRepondre.length ? `<br><span class="mono etiquette">À VÉRIFIER</span> ${p.aRepondre.map((x) => html(x)).join(' ; ')}` : ''}</div>`,
      );
    }
    if (s.startsWith('C. Une notice d’information') || s.startsWith("C. Une notice d'information")) {
      corps.push(
        `<div class="joints"><span class="mono etiquette">DOCUMENT JOINT</span> ${
          d.fichierNotice ? 'notice d’information, document séparé du même dossier de signature' : 'notice à joindre'
        }</div>`,
      );
    }
  }

  const libelle = d.type === 'nu' ? 'LOGEMENT NU' : 'LOGEMENT MEUBLÉ';
  return page({
    titre: `Bail · bien n° ${String(d.bien.numero).padStart(2, '0')}`,
    reference: `BIEN N° ${String(d.bien.numero).padStart(2, '0')} · CONTRAT DE LOCATION · ${libelle}`,
    piedGauche: d.projet
      ? '<span class="projet">PROJET À RELIRE · NON SIGNÉ</span> · CLAUSES PROPRES À BAILLOME À VALIDER PAR L’AVOCAT'
      : `SIGNATURE ÉLECTRONIQUE ${d.bail.niveau_signature === 'qualifiee' ? 'QUALIFIÉE' : 'AVANCÉE'}`,
    piedDroite: '<span class="champ">champ</span> rempli par Baillome',
    corps: corps.join('\n'),
  });
}

/** Notice d'information (annexe C du bail), en document séparé du même dossier de signature. */
export function htmlNoticeBail(d: DonneesBail): string | null {
  if (!d.fichierNotice) return null;
  return page({
    titre: 'Notice d’information',
    reference: `BIEN N° ${String(d.bien.numero).padStart(2, '0')} · ANNEXE C DU CONTRAT DE LOCATION · NOTICE D’INFORMATION`,
    piedGauche: 'ANNEXE C · ARRÊTÉ DU 29 MAI 2015 · TEXTE OFFICIEL REPRODUIT SANS MODIFICATION',
    piedDroite: '',
    corps: htmlNotice(d.fichierNotice),
  });
}

function signatures(d: DonneesBail): string {
  const niveauSignature = d.bail.niveau_signature === 'qualifiee' ? 'SIGNATURE ÉLECTRONIQUE QUALIFIÉE' : 'SIGNATURE ÉLECTRONIQUE AVANCÉE';
  const bloc = (qui: string, nom: string) =>
    `<div class="signature"><div class="qui">${html(qui)}</div><div class="mono niveau">${niveauSignature}</div><div class="nom">${html(nom)}</div><div class="mono niveau">${
      d.projet ? 'EN ATTENTE DE SIGNATURE' : ''
    }</div></div>`;
  return `<div class="signatures">${bloc('Signature du bailleur', d.bailleur.nom)}${d.locataires
    .map((l) => bloc('Signature du locataire', nomComplet(l)))
    .join('')}</div>`;
}
