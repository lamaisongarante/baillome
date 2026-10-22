import type { Constat, EtatRegle, Echeance, Gravite } from '@moteur/moteur';
import { question } from '@moteur/questions';
import { supabase } from '@/lib/supabase';

export { messageAffiche } from '@/lib/message';

export type ConstatAffiche = Constat & { libelle: string; message: string; action: string };

export type ResultatBien = {
  bien_id: string;
  numero: number;
  horsV1: boolean;
  constats: ConstatAffiche[];
  etats: EtatRegle[];
  score: number | null;
  echeances: Echeance[];
};

export type ResultatCheckup = {
  date: string;
  apercu: boolean;
  regles: { code: string; titre: string; validee: boolean }[];
  biens: ResultatBien[];
  score_moyen: number | null;
};

/** Lance le check-up sur le serveur, pour un bien ou pour tout le patrimoine. */
export async function lancerCheckup(bienId?: string): Promise<ResultatCheckup> {
  const { data, error } = await supabase.functions.invoke<ResultatCheckup>('check-up', { body: bienId ? { bien_id: bienId } : {} });
  if (error || !data) throw error ?? new Error('Check-up indisponible');
  return data;
}

/**
 * Enregistre une réponse : dans la fiche du bien si la question y correspond
 * (une seule source de vérité), sinon dans les réponses du check-up.
 */
export async function enregistrerReponse(bienId: string, code: string, valeur: string) {
  const q = question(code);
  if (q?.fiche) {
    const v = q.type === 'nombre' ? Number(valeur) : valeur;
    const { error } = await supabase.from('biens').update({ [q.fiche]: v }).eq('id', bienId);
    if (error) throw error;
    // La réponse « Avez-vous un DPE ? » est déduite : si on a une date, c'est oui.
    if (q.fiche === 'dpe_date') await enregistrerReponse(bienId, 'dpe_existe', 'oui');
    return;
  }
  const { error } = await supabase
    .from('reponses_checkup')
    .upsert({ bien_id: bienId, question: code, valeur, repondu_le: new Date().toISOString() }, { onConflict: 'bien_id,question' });
  if (error) throw error;
}

/** Questions encore sans réponse pour un bien, dans l'ordre des règles. */
export function questionsRestantes(r: ResultatBien): string[] {
  const vues = new Set<string>();
  return r.etats.flatMap((e) => e.questions).filter((q) => (vues.has(q) ? false : (vues.add(q), true)));
}

export const LIBELLES_GRAVITE: Record<Gravite, string> = {
  critique: 'URGENT',
  important: 'IMPORTANT',
  conseil: 'BON PLAN',
  ok: 'OK',
};

/** Famille affichée sur les cartes (maquette 03). */
export const FAMILLES: Record<string, string> = {
  'R-01': 'ÉNERGIE',
  'R-02': 'LOYER',
  'R-03': 'DÉPÔT',
  'R-04': 'DIAGNOSTICS',
  'R-05': 'BAIL',
  'R-06': 'ÉTAT DES LIEUX',
  'R-07': 'CANDIDATURE',
  'R-08': 'ASSURANCES',
  'R-09': 'ZONE TENDUE',
  'R-10': 'FISCALITÉ',
  'R-11': 'MEUBLÉ',
  'R-12': 'DÉCENCE',
};

/** Ordre d'affichage : urgent, important, bon plan, OK. */
export const ORDRE_GRAVITE: Record<Gravite, number> = { critique: 0, important: 1, conseil: 2, ok: 3 };
