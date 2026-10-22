import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { aujourdhui } from '@/lib/coffre';
import { supabase } from '@/lib/supabase';

/** Toutes les tables qui contiennent des données du bailleur. */
const TABLES = [
  'profils',
  'consentements',
  'entites',
  'associes_entite',
  'biens',
  'locaux_accessoires',
  'detentions_bien',
  'diagnostics',
  'assurances',
  'inventaire_mobilier',
  'personnes',
  'documents',
] as const;

/**
 * Export de toutes les données du bailleur (droit à la portabilité) dans un
 * fichier JSON, proposé au partage (email, Fichiers, AirDrop…).
 * Les fichiers du coffre restent téléchargeables un par un depuis le coffre.
 */
export async function exporterMesDonnees(): Promise<void> {
  const { data: utilisateur } = await supabase.auth.getUser();
  const resultats = await Promise.all(TABLES.map((t) => supabase.from(t).select('*')));
  const erreur = resultats.find((r) => r.error);
  if (erreur?.error) throw erreur.error;

  const contenu = {
    application: 'Baillome',
    exporte_le: new Date().toISOString(),
    compte: { email: utilisateur.user?.email ?? null, cree_le: utilisateur.user?.created_at ?? null },
    donnees: Object.fromEntries(TABLES.map((t, i) => [t, resultats[i].data])),
  };

  const uri = `${cacheDirectory}baillome-mes-donnees-${aujourdhui()}.json`;
  await writeAsStringAsync(uri, JSON.stringify(contenu, null, 2));
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Exporter mes données Baillome' });
}

/**
 * Supprime définitivement le compte : d'abord les fichiers du coffre,
 * puis le compte et toutes ses données (en cascade, côté serveur).
 */
export async function supprimerMonCompte(): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Non connecté');
  const dossier = data.user.id;

  // Les fichiers sont effacés par lots de 100, jusqu'à ce que le dossier soit vide.
  for (;;) {
    const { data: fichiers, error } = await supabase.storage.from('coffre').list(dossier, { limit: 100 });
    if (error) throw error;
    if (!fichiers?.length) break;
    const { error: e } = await supabase.storage.from('coffre').remove(fichiers.map((f) => `${dossier}/${f.name}`));
    if (e) throw e;
  }

  const { error } = await supabase.rpc('supprimer_mon_compte');
  if (error) throw error;
  // Le compte n'existe plus : on oublie simplement la session sur le téléphone.
  await supabase.auth.signOut({ scope: 'local' });
}
