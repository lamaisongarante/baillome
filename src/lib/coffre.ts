import { randomUUID } from 'expo-crypto';
import { File } from 'expo-file-system';

import type { BienResume } from '@/components/carte-bien';
import { COLONNES_RESUME } from '@/components/carte-bien';
import type { DocumentCoffre } from '@/lib/statut-document';
import { supabase } from '@/lib/supabase';

/** Types de documents attendus (spec étape 1, § 5). */
export const TYPES_DOCUMENT = {
  bail_annexes: 'Bail et annexes',
  diagnostic: 'Diagnostic',
  reglement_copropriete: 'Règlement de copropriété',
  assurance: 'Assurance',
  etat_des_lieux: 'État des lieux',
  quittance: 'Quittance',
  recu: 'Reçu',
  avis: 'Avis',
  decompte: 'Décompte',
  facture_devis: 'Facture ou devis',
  extrait_compte: 'Extrait de compte',
  fiscal: 'Document fiscal',
  divers: 'Divers',
} as const;

export type TypeDocument = keyof typeof TYPES_DOCUMENT;

export const COLONNES_DOCUMENT =
  'id, type_document, titre, nature_diagnostic, bien_id, personne_id, entite_id, date_document, date_validite, deductible, fichier_chemin, fichier_type, cree_le';

export type Coffre = {
  documents: DocumentCoffre[];
  biens: BienResume[];
  entites: { id: string; nom: string }[];
  personnes: { id: string; prenom: string | null; nom: string }[];
};

export async function chargerCoffre(): Promise<Coffre> {
  const [documents, biens, entites, personnes] = await Promise.all([
    supabase.from('documents').select(COLONNES_DOCUMENT).order('cree_le', { ascending: false }),
    supabase.from('biens').select(COLONNES_RESUME).order('numero'),
    supabase.from('entites').select('id, nom').order('cree_le'),
    supabase.from('personnes').select('id, prenom, nom'),
  ]);
  return {
    documents: documents.data ?? [],
    biens: biens.data ?? [],
    entites: entites.data ?? [],
    personnes: personnes.data ?? [],
  };
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
};

/**
 * Dépose un fichier du téléphone dans le dossier privé du bailleur.
 * Renvoie l'emplacement à enregistrer sur le document.
 */
export async function deposerFichier(uri: string, type: string): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Non connecté');
  const chemin = `${data.user.id}/${randomUUID()}.${EXTENSIONS[type] ?? 'bin'}`;
  const contenu = await new File(uri).arrayBuffer();
  const { error } = await supabase.storage.from('coffre').upload(chemin, contenu, { contentType: type });
  if (error) throw error;
  return chemin;
}

/** Lien temporaire (10 minutes) pour consulter un fichier du coffre. */
export async function lienTemporaire(chemin: string): Promise<string | null> {
  const { data } = await supabase.storage.from('coffre').createSignedUrl(chemin, 600);
  return data?.signedUrl ?? null;
}

/** Supprime un document et son fichier. */
export async function supprimerDocument(doc: Pick<DocumentCoffre, 'id' | 'fichier_chemin'>) {
  if (doc.fichier_chemin) await supabase.storage.from('coffre').remove([doc.fichier_chemin]);
  return supabase.from('documents').delete().eq('id', doc.id);
}

/** Date du jour au format AAAA-MM-JJ (heure de Paris). */
export function aujourdhui(): string {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}
