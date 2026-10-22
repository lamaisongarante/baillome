// Accès aux fiches locataires et garants, et au bail qui les relie au bien.
import { supabase } from '@/lib/supabase';
import type { TypeBail, TypeGarant } from '@/lib/personnes';

export const COLONNES_PERSONNE =
  'id, role, prenom, nom, email, telephone, adresse, date_naissance, lieu_naissance, etudiant, apprenti, boursier, accord_email_le, adresse_apres_depart, type_garant, visale_reference, notes';

export type Personne = {
  id: string;
  role: 'locataire' | 'colocataire' | 'garant' | 'candidat';
  prenom: string | null;
  nom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  etudiant: boolean;
  apprenti: boolean;
  boursier: boolean | null;
  accord_email_le: string | null;
  adresse_apres_depart: string | null;
  type_garant: TypeGarant | null;
  visale_reference: string | null;
  notes: string | null;
};

export type Bail = {
  id: string;
  bien_id: string;
  type_bail: TypeBail;
  statut: 'brouillon' | 'en_cours' | 'termine';
  date_effet: string | null;
  locataires_couple: boolean;
};

const COLONNES_BAIL = 'id, bien_id, type_bail, statut, date_effet, locataires_couple';

export type Occupation = {
  bail: Bail;
  locataires: Pick<Personne, 'id' | 'prenom' | 'nom'>[];
};

/** Bail en cours du bien et ses locataires ; null si le bien n'est pas loué. */
export async function chargerOccupation(bienId: string): Promise<Occupation | null> {
  const { data: bail } = await supabase
    .from('baux')
    .select(COLONNES_BAIL)
    .eq('bien_id', bienId)
    .eq('statut', 'en_cours')
    .maybeSingle();
  if (!bail) return null;
  const { data } = await supabase
    .from('baux_locataires')
    .select('ordre, personnes (id, prenom, nom)')
    .eq('bail_id', bail.id)
    .order('ordre');
  const locataires = (data ?? []).map((l) => l.personnes as unknown as Occupation['locataires'][number]);
  return { bail: bail as Bail, locataires };
}

export type Garantie = {
  cautionnementId: string;
  signe_le: string | null;
  garant: Pick<Personne, 'id' | 'prenom' | 'nom' | 'type_garant'>;
};

export type FicheLocataire = {
  personne: Personne;
  bail: Bail | null;
  bien: { id: string; numero: number; type_bien: string; commune: string | null; libelle: string | null } | null;
  garanties: Garantie[];
  attestation: { annee: number | null; date_fin_validite: string | null } | null;
};

export async function chargerFicheLocataire(id: string): Promise<FicheLocataire | null> {
  const { data: personne } = await supabase.from('personnes').select(COLONNES_PERSONNE).eq('id', id).maybeSingle();
  if (!personne) return null;

  // Le bail en cours en priorité, sinon le plus récent.
  const { data: liens } = await supabase
    .from('baux_locataires')
    .select(`baux (${COLONNES_BAIL})`)
    .eq('personne_id', id);
  const baux = (liens ?? []).map((l) => l.baux as unknown as Bail);
  baux.sort((a, b) => Number(b.statut === 'en_cours') - Number(a.statut === 'en_cours') || (b.date_effet ?? '').localeCompare(a.date_effet ?? ''));
  const bail = baux[0] ?? null;

  let bien: FicheLocataire['bien'] = null;
  let garanties: Garantie[] = [];
  let attestation: FicheLocataire['attestation'] = null;
  if (bail) {
    const [b, c, a] = await Promise.all([
      supabase.from('biens').select('id, numero, type_bien, commune, libelle').eq('id', bail.bien_id).maybeSingle(),
      supabase
        .from('cautionnements')
        .select('id, signe_le, personnes!cautionnements_garant_id_proprietaire_id_fkey (id, prenom, nom, type_garant)')
        .eq('bail_id', bail.id)
        .eq('locataire_id', id)
        .order('cree_le'),
      supabase
        .from('assurances')
        .select('annee, date_fin_validite')
        .eq('bien_id', bail.bien_id)
        .eq('nature', 'attestation_locataire')
        .order('date_fin_validite', { ascending: false, nullsFirst: false })
        .limit(1),
    ]);
    bien = b.data ?? null;
    garanties = (c.data ?? []).map((x) => ({
      cautionnementId: x.id,
      signe_le: x.signe_le,
      garant: x.personnes as unknown as Garantie['garant'],
    }));
    attestation = a.data?.[0] ?? null;
  }
  return { personne: personne as Personne, bail, bien, garanties, attestation };
}

type ChampsPersonne = Partial<Omit<Personne, 'id' | 'role'>> & { nom: string };

/**
 * Ajoute un locataire au bien : au bail en cours s'il existe (colocation ou
 * couple), sinon dans un nouveau bail en cours, saisi par le bailleur.
 */
export async function ajouterLocataire(
  bienId: string,
  champs: ChampsPersonne,
  bailNouveau: { type_bail: TypeBail; date_effet: string } | null,
  couple: boolean | null,
): Promise<{ id: string } | { erreur: string }> {
  const occupation = await chargerOccupation(bienId);
  if (!occupation && !bailNouveau) return { erreur: 'Indiquez la date d’entrée du locataire.' };

  const { data: personne, error } = await supabase
    .from('personnes')
    .insert({ role: 'locataire', ...champs })
    .select('id')
    .single();
  if (error || !personne) return { erreur: 'L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.' };

  let bailId = occupation?.bail.id;
  let bailCree = false;
  if (!bailId && bailNouveau) {
    const { data: bail } = await supabase
      .from('baux')
      .insert({ bien_id: bienId, statut: 'en_cours', origine: 'existant', ...bailNouveau })
      .select('id')
      .single();
    bailId = bail?.id;
    bailCree = !!bailId;
  }
  const lien = bailId
    ? await supabase
        .from('baux_locataires')
        .insert({ bail_id: bailId, personne_id: personne.id, ordre: (occupation?.locataires.length ?? 0) + 1 })
    : null;
  if (!bailId || lien?.error) {
    // On ne laisse pas de fiche orpheline.
    if (bailCree) await supabase.from('baux').delete().eq('id', bailId);
    await supabase.from('personnes').delete().eq('id', personne.id);
    return { erreur: 'L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.' };
  }
  if (occupation && couple !== null) {
    await supabase.from('baux').update({ locataires_couple: couple }).eq('id', bailId);
  }
  return { id: personne.id };
}

/**
 * Supprime la fiche du locataire. Si c'était le seul locataire d'un bail
 * saisi par le bailleur, ce bail est supprimé aussi.
 */
export async function supprimerLocataire(id: string, bail: Bail | null): Promise<boolean> {
  // Garants de ce locataire, relevés avant que la suppression n'efface les cautionnements.
  const { data: garants } = await supabase.from('cautionnements').select('garant_id').eq('locataire_id', id);
  if (bail) {
    const { count } = await supabase
      .from('baux_locataires')
      .select('personne_id', { count: 'exact', head: true })
      .eq('bail_id', bail.id);
    if (count === 1) {
      const { error } = await supabase.from('baux').delete().eq('id', bail.id).eq('origine', 'existant');
      if (error) return false;
    }
  }
  const { error } = await supabase.from('personnes').delete().eq('id', id);
  if (error) return false;
  // Un garant qui ne garantit plus personne n'a plus de raison d'être conservé.
  for (const g of garants ?? []) {
    const { count } = await supabase
      .from('cautionnements')
      .select('id', { count: 'exact', head: true })
      .eq('garant_id', g.garant_id);
    if (!count) await supabase.from('personnes').delete().eq('id', g.garant_id);
  }
  return true;
}
