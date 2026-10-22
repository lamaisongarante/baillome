// Chargement et enregistrement des conditions d'un bail, avec ce qu'il faut
// pour les contrôles (fiche du bien, qualité du bailleur, locataires, R-03).
import { qualitePourDuree, type ParametresR03, type QualiteDuree, type TypeBail } from '@moteur/bail';

import { supabase } from '@/lib/supabase';

export const COLONNES_CONDITIONS = [
  'id', 'bien_id', 'type_bail', 'statut', 'origine', 'date_effet', 'locataires_couple',
  'duree_mois', 'motif_duree_reduite',
  'loyer_hc', 'soumis_evolution_relocation', 'soumis_loyer_reference', 'loyer_reference_m2', 'loyer_reference_majore_m2',
  'complement_loyer', 'complement_justification', 'precedent_loyer', 'precedent_loyer_verse_le', 'precedent_revision_le',
  'clause_revision', 'date_revision', 'trimestre_irl',
  'mode_charges', 'charges_montant', 'revision_forfait',
  'contribution_montant', 'contribution_duree', 'contribution_justification',
  'assurance_pour_compte', 'assurance_montant_annuel',
  'periodicite', 'terme', 'jour_paiement', 'lieu_paiement',
  'travaux_depuis_dernier_bail', 'travaux_six_derniers_mois', 'majoration_travaux', 'diminution_travaux',
  'depot_garantie', 'clause_solidarite', 'clause_resiliation_assurance', 'clause_resiliation_troubles',
  'conditions_particulieres', 'niveau_signature', 'modele_version', 'notice_version',
  'vehicule', 'rangement_autorise', 'preavis_mois', 'icc_trimestre', 'icc_annee', 'icc_indice',
  'delai_restitution_jours', 'clause_vente',
].join(', ');

export type ConditionsBail = {
  id: string;
  bien_id: string;
  type_bail: TypeBail;
  statut: 'brouillon' | 'en_cours' | 'termine';
  origine: 'existant' | 'baillome';
  date_effet: string | null;
  locataires_couple: boolean;
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
  modele_version: string | null;
  notice_version: string | null;
  vehicule: string | null;
  rangement_autorise: boolean | null;
  preavis_mois: number | null;
  icc_trimestre: number | null;
  icc_annee: number | null;
  icc_indice: number | null;
  delai_restitution_jours: number | null;
  clause_vente: boolean;
};

export type DossierBail = {
  bail: ConditionsBail;
  bien: {
    id: string;
    numero: number;
    commune: string | null;
    surface_habitable: number | null;
    identifiant_fiscal: string | null;
    servitude_residence_principale: boolean;
  };
  qualite: QualiteDuree;
  locataires: { id: string; prenom: string | null; nom: string; etudiant: boolean }[];
  parametresR03: ParametresR03 | null;
  apercu: boolean;
};

export async function chargerDossierBail(id: string): Promise<DossierBail | null> {
  const { data: bail } = await supabase.from('baux').select(COLONNES_CONDITIONS).eq('id', id).maybeSingle();
  if (!bail) return null;
  const b = bail as unknown as ConditionsBail;
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const [bien, locataires, r03, profil] = await Promise.all([
    supabase
      .from('biens')
      .select('id, numero, commune, surface_habitable, identifiant_fiscal, servitude_residence_principale, entites (type, sci_familiale)')
      .eq('id', b.bien_id)
      .single(),
    supabase.from('baux_locataires').select('ordre, personnes (id, prenom, nom, etudiant)').eq('bail_id', id).order('ordre'),
    supabase
      .from('regles_versions')
      .select('parametres, date_effet, valable_jusqu_au')
      .eq('regle_code', 'R-03')
      .lte('date_effet', aujourdhui)
      .order('date_effet', { ascending: false }),
    supabase.from('profils').select('apercu_regles').maybeSingle(),
  ]);
  if (!bien.data) return null;
  const entite = bien.data.entites as unknown as { type: string; sci_familiale: boolean } | null;
  const version = (r03.data ?? []).find((v) => !v.valable_jusqu_au || v.valable_jusqu_au >= aujourdhui);
  const { entites: _e, ...bienSeul } = bien.data;
  return {
    bail: b,
    bien: bienSeul as DossierBail['bien'],
    qualite: qualitePourDuree(entite ?? { type: 'nom_propre', sci_familiale: false }),
    locataires: (locataires.data ?? []).map((l) => l.personnes as unknown as DossierBail['locataires'][number]),
    parametresR03: (version?.parametres as ParametresR03 | undefined) ?? null,
    apercu: !!profil.data?.apercu_regles,
  };
}

/** Enregistre les conditions (sans l'identifiant, le bien ni le statut). */
export async function enregistrerConditions(bail: ConditionsBail): Promise<boolean> {
  const { id, bien_id: _b, statut: _s, origine: _o, ...champs } = bail;
  const { error } = await supabase.from('baux').update(champs).eq('id', id);
  return !error;
}
