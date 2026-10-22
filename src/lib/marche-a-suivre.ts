// Marche à suivre d'un point à traiter : où le mettre à jour dans l'application.
// Ces étapes ne disent rien du droit : l'action juridique est celle de la fiche
// de règle (affichée mot pour mot). Elles guident seulement dans l'application.
import type { Href } from 'expo-router';

export type Bouton = { libelle: string; etape: string; cible: { route: Href } | { lien: string } };

const rubrique = (bien: string, r: string) => ({ route: `/bien/${bien}/${r}` as Href });
const question = (bien: string, code: string) => ({ route: { pathname: '/checkup/[id]', params: { id: bien, question: code } } as Href });
const coffre = (bien: string, type: string) => ({ route: { pathname: '/document/nouveau', params: { bien, type } } as Href });

const GEORISQUES = 'https://www.georisques.gouv.fr/';
const OBSERVATOIRE_DPE = 'https://observatoire-dpe-audit.ademe.fr/';

/** Correspondance entre un critère de décence et sa question (R-12). */
const QUESTIONS_DECENCE: Record<string, string> = {
  'clos et couvert': 'decence_clos_couvert',
  "infiltrations d'air": 'decence_infiltrations_air',
  'dispositifs de retenue': 'decence_dispositifs_retenue',
  matériaux: 'decence_materiaux',
  'électricité, gaz, chauffage, eau chaude': 'decence_reseaux',
  aération: 'decence_aeration',
  éclairement: 'decence_eclairement',
  'eau potable': 'decence_eau_potable',
  'évacuation des eaux': 'decence_evacuation',
  électricité: 'decence_electricite',
};

export function boutons(bien: string, regle: string, situation: string, valeurs?: Record<string, string>): Bouton[] {
  const dpe: Bouton = {
    libelle: 'Mettre à jour le DPE',
    etape: 'Renseignez la date, la classe et le numéro du nouveau DPE dans la fiche du bien.',
    cible: rubrique(bien, 'energie'),
  };
  const rangerDpe: Bouton = {
    libelle: 'Ranger le DPE dans le coffre',
    etape: 'Rangez le DPE dans le coffre, pour l’avoir sous la main au prochain bail.',
    cible: coffre(bien, 'diagnostic'),
  };
  const diagnostic: Bouton = {
    libelle: 'Ajouter le diagnostic',
    etape: 'Indiquez la date de réalisation du diagnostic dans la fiche du bien.',
    cible: rubrique(bien, 'diagnostics'),
  };
  const rangerDiagnostic: Bouton = {
    libelle: 'Ranger le document dans le coffre',
    etape: 'Rangez le document dans le coffre du bien.',
    cible: coffre(bien, 'diagnostic'),
  };

  switch (`${regle}/${situation}`) {
    case 'R-01/dpe_absent_ou_ancien':
    case 'R-01/dpe_plus_10_ans':
      return [dpe, rangerDpe];
    case 'R-01/classe_g':
    case 'R-01/classe_g_locataire':
    case 'R-01/classe_f':
    case 'R-01/classe_e':
      return [
        {
          libelle: 'Mettre à jour la classe',
          etape: 'Après des travaux et un nouveau DPE, renseignez la nouvelle classe : votre check-up se met à jour.',
          cible: rubrique(bien, 'energie'),
        },
        {
          libelle: 'Ranger un devis ou une facture',
          etape: 'Rangez vos devis et factures de travaux dans le coffre.',
          cible: coffre(bien, 'facture_devis'),
        },
      ];
    case 'R-01/attestation_electricite':
      return [
        {
          libelle: 'Ouvrir l’Observatoire DPE de l’ADEME',
          etape: 'Téléchargez l’attestation sur le site de l’ADEME.',
          cible: { lien: OBSERVATOIRE_DPE },
        },
        dpe,
        { libelle: 'Ranger l’attestation dans le coffre', etape: 'Rangez l’attestation dans le coffre du bien.', cible: coffre(bien, 'diagnostic') },
      ];
    case 'R-04/crep_absent':
    case 'R-04/crep_positif_perime':
    case 'R-04/securite_absent':
    case 'R-04/securite_perime':
    case 'R-04/bruit':
    case 'R-04/amiante':
      return [diagnostic, rangerDiagnostic];
    case 'R-04/erp_absent':
    case 'R-04/erp_plus_6_mois':
      return [
        { libelle: 'Ouvrir Géorisques', etape: 'Générez l’état des risques sur Géorisques, avec l’adresse du logement.', cible: { lien: GEORISQUES } },
        diagnostic,
        rangerDiagnostic,
      ];
    case 'R-05/identifiant_fiscal':
      return [
        {
          libelle: 'Renseigner l’identifiant fiscal',
          etape: 'Saisissez les 12 chiffres dans la rubrique « Identité du bien ».',
          cible: rubrique(bien, 'identite'),
        },
      ];
    case 'R-08/attestation_absente':
    case 'R-08/attestation_perimee':
      return [
        {
          libelle: 'Mettre à jour l’attestation',
          etape: 'Indiquez l’année et la date de fin de validité de l’attestation reçue.',
          cible: rubrique(bien, 'assurances'),
        },
        { libelle: 'Ranger l’attestation dans le coffre', etape: 'Rangez l’attestation dans le coffre.', cible: coffre(bien, 'assurance') },
      ];
    case 'R-08/pno_copropriete':
    case 'R-08/pno_hors_copropriete':
      return [
        { libelle: 'Saisir l’assurance', etape: 'Indiquez l’assureur, le numéro de police et l’échéance.', cible: rubrique(bien, 'assurances') },
        { libelle: 'Ranger le contrat dans le coffre', etape: 'Rangez le contrat dans le coffre.', cible: coffre(bien, 'assurance') },
      ];
    case 'R-11/element_manquant':
      return [
        {
          libelle: 'Compléter l’inventaire',
          etape: 'Cochez les éléments présents dans la rubrique « Équipements ».',
          cible: rubrique(bien, 'equipements'),
        },
      ];
    case 'R-12/surface':
      return [
        {
          libelle: 'Vérifier les surfaces',
          etape: 'Vérifiez la surface de la plus grande pièce et la hauteur sous plafond.',
          cible: rubrique(bien, 'surfaces'),
        },
      ];
    case 'R-12/arrete':
      return [{ libelle: 'Mettre à jour ma réponse', etape: 'Si l’arrêté a été levé, mettez votre réponse à jour.', cible: question(bien, 'arrete') }];
    case 'R-12/critere': {
      const critere = valeurs?.['critère'] ?? '';
      if (['chauffage', 'cuisine', 'sanitaires'].includes(critere)) {
        return [
          {
            libelle: 'Mettre à jour les équipements',
            etape: 'Une fois les travaux faits, mettez à jour la rubrique « Équipements ».',
            cible: rubrique(bien, 'equipements'),
          },
        ];
      }
      const code = QUESTIONS_DECENCE[critere];
      return code
        ? [{ libelle: 'Mettre à jour ma réponse', etape: 'Une fois les travaux faits, mettez votre réponse à jour.', cible: question(bien, code) }]
        : [];
    }
    case 'R-12/contraintes_travaux':
      return [
        { libelle: 'Ranger un justificatif', etape: 'Rangez les justificatifs dans le coffre.', cible: coffre(bien, 'divers') },
      ];
    default:
      return [];
  }
}
