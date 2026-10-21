import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

/**
 * Connexion à Supabase (projet « Baillome », région Paris).
 * Seule la clé publique est utilisée ici : la protection des données repose
 * sur la sécurité ligne par ligne de la base, jamais sur le secret de cette clé.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const clePublique = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !clePublique) {
  throw new Error(
    'Connexion Supabase non configurée : renseigner .env.local (voir .env.example).',
  );
}

export const supabase = createClient(url, clePublique, {
  auth: {
    // La session reste enregistrée sur le téléphone entre deux ouvertures.
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
