import { useCallback, useEffect, useState } from 'react';

import type { BienPourCompletude, Complements } from '@/lib/completude';
import { supabase } from '@/lib/supabase';

export type Bien = BienPourCompletude & {
  id: string;
  numero: number;
  entite_id: string;
  libelle: string | null;
  batiment: string | null;
  etage: string | null;
  porte: string | null;
  code_postal: string | null;
  commune: string | null;
  latitude: number | null;
  longitude: number | null;
  dpe_numero: string | null;
  dpe_annee_reference_prix: number | null;
  chauffage_repartition: string | null;
  chauffage_energie: string | null;
  surface_piece_principale: number | null;
  decence_chauffage: string | null;
  decence_cuisine: string | null;
  decence_wc: string | null;
  decence_salle_eau: string | null;
  notes: string | null;
};

export type LocalAccessoire = { id: string; type: string; numero_lot: string | null; description: string | null };
export type ElementMobilier = { code: string; libelle: string; ordre: number };
export type LigneInventaire = { id: string; element_code: string | null; libelle: string; quantite: number };
export type Assurance = {
  id: string;
  nature: 'proprietaire_non_occupant' | 'attestation_locataire';
  assureur: string | null;
  numero_police: string | null;
  date_echeance: string | null;
  annee: number | null;
  date_fin_validite: string | null;
};
export type Entite = { id: string; type: string; nom: string };
export type Diagnostic = { id: string; type: string; date_realisation: string | null; resultat: string | null };

export type Fiche = {
  bien: Bien;
  locaux: LocalAccessoire[];
  inventaire: LigneInventaire[];
  elementsObligatoires: ElementMobilier[];
  assurances: Assurance[];
  entites: Entite[];
  diagnostics: Diagnostic[];
};

/** Charge tout ce qui compose la fiche d'un bien. */
export async function chargerFiche(id: string): Promise<Fiche | null> {
  const [bien, locaux, inventaire, elements, assurances, entites, diagnostics] = await Promise.all([
    supabase.from('biens').select('*').eq('id', id).single(),
    supabase.from('locaux_accessoires').select('id, type, numero_lot, description').eq('bien_id', id),
    supabase.from('inventaire_mobilier').select('id, element_code, libelle, quantite').eq('bien_id', id),
    supabase.from('elements_mobilier_obligatoires').select('code, libelle, ordre').order('ordre'),
    supabase
      .from('assurances')
      .select('id, nature, assureur, numero_police, date_echeance, annee, date_fin_validite')
      .eq('bien_id', id),
    supabase.from('entites').select('id, type, nom').order('cree_le'),
    supabase.from('diagnostics').select('id, type, date_realisation, resultat').eq('bien_id', id).order('date_realisation', { ascending: false }),
  ]);
  if (bien.error || !bien.data) return null;
  return {
    bien: { ...bien.data, surface_habitable: nombre(bien.data.surface_habitable), hauteur_sous_plafond: nombre(bien.data.hauteur_sous_plafond), surface_piece_principale: nombre(bien.data.surface_piece_principale) } as Bien,
    locaux: locaux.data ?? [],
    inventaire: inventaire.data ?? [],
    elementsObligatoires: elements.data ?? [],
    assurances: (assurances.data ?? []) as Assurance[],
    entites: entites.data ?? [],
    diagnostics: diagnostics.data ?? [],
  };
}

/** Les colonnes « numeric » arrivent sous forme de texte. */
function nombre(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  return Number(v);
}

export function complements(f: Fiche): Complements {
  const codes = new Set(f.inventaire.map((l) => l.element_code).filter(Boolean));
  return {
    mobilierCoche: f.elementsObligatoires.filter((e) => codes.has(e.code)).length,
    mobilierTotal: f.elementsObligatoires.length,
    assurancePno: f.assurances.some((a) => a.nature === 'proprietaire_non_occupant' && !!a.assureur),
    attestationLocataire: f.assurances.some((a) => a.nature === 'attestation_locataire' && !!a.date_fin_validite),
  };
}

/** Fiche d'un bien, rechargeable après chaque modification. */
export function useFiche(id: string | undefined) {
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [introuvable, setIntrouvable] = useState(false);

  const recharger = useCallback(async () => {
    if (!id) return;
    const f = await chargerFiche(id);
    setFiche(f);
    setIntrouvable(!f);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let actif = true;
    chargerFiche(id).then((f) => {
      if (!actif) return;
      setFiche(f);
      setIntrouvable(!f);
    });
    return () => {
      actif = false;
    };
  }, [id]);

  return { fiche, introuvable, recharger };
}

/** Libellés lisibles des valeurs enregistrées. */
export const LIBELLES = {
  type_bien: { appartement: 'Appartement', maison: 'Maison', garage: 'Garage', autre: 'Autre bien' },
  situation_locative: { loue_vide: 'Loué vide', loue_meuble: 'Loué meublé', pas_encore_loue: 'Pas encore loué' },
  type_location: {
    nue: 'Location nue',
    meublee: 'Location meublée',
    colocation_bail_unique: 'Colocation (bail unique)',
    garage_stationnement: 'Garage ou stationnement',
    meuble_tourisme: 'Meublé de tourisme',
  },
} as const;
