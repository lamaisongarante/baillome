// Génération du projet de bail en PDF sur le téléphone (expo-print), puis
// partage (Fichiers, email, AirDrop…). La génération côté serveur viendra à
// l'étape 5.
import { CONTRATS_TYPES, NOTICES, versionApplicable } from '@moteur/bail';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { chargerDossierBail } from '@/lib/baux';
import { estColocation } from '@/lib/personnes';
import { supabase } from '@/lib/supabase';

import { htmlBail, type DonneesBail } from './bail';

export async function chargerDonneesBail(bailId: string): Promise<{ donnees: DonneesBail } | { impossible: string }> {
  const dossier = await chargerDossierBail(bailId);
  if (!dossier) return { impossible: 'Ce bail est introuvable.' };
  const { bail } = dossier;
  if (bail.type_bail === 'garage') {
    return { impossible: 'Le bail de garage sera généré une fois sa rédaction validée par l’avocat.' };
  }
  if (!bail.date_effet) return { impossible: 'Indiquez d’abord la date de prise d’effet du bail.' };
  const contrat = versionApplicable(CONTRATS_TYPES[bail.type_bail], bail.date_effet);
  if (!contrat) {
    return {
      impossible:
        'Ce bail prend effet avant le 1er octobre 2026 : il relève de l’ancien contrat type, que Baillome ne génère pas. Votre exemplaire signé reste valable.',
    };
  }
  const notice = versionApplicable(NOTICES, bail.date_effet);

  const [bien, locaux, profil, locataires] = await Promise.all([
    supabase
      .from('biens')
      .select(
        'numero, adresse, batiment, etage, porte, code_postal, commune, identifiant_fiscal, type_habitat, regime_juridique, periode_construction, surface_habitable, pieces_principales, autres_parties, cuisine, sanitaires, chauffage_mode, chauffage_repartition, eau_chaude_mode, dpe_classe, dpe_depenses_min_euros, dpe_depenses_max_euros, dpe_annee_reference_prix, equipements_numeriques, servitude_residence_principale, entites (type, nom, qualite_bailleur, sci_familiale, siege)',
      )
      .eq('id', bail.bien_id)
      .single(),
    supabase.from('locaux_accessoires').select('type, numero_lot, description').eq('bien_id', bail.bien_id),
    supabase.from('profils').select('prenom, nom, adresse, telephone').single(),
    supabase.from('baux_locataires').select('ordre, personnes (prenom, nom, telephone, email)').eq('bail_id', bailId).order('ordre'),
  ]);
  if (!bien.data || !profil.data) return { impossible: 'Les informations du bien n’ont pas pu être chargées. Vérifiez votre connexion.' };
  const b = bien.data;
  const entite = b.entites as unknown as { type: string; nom: string; qualite_bailleur: string; sci_familiale: boolean; siege: string | null };
  const p = profil.data;
  const personnes = (locataires.data ?? []).map(
    (l) => l.personnes as unknown as { prenom: string | null; nom: string; telephone: string | null; email: string | null },
  );
  if (!personnes.length) return { impossible: 'Ajoutez d’abord le locataire de ce bail.' };

  const enNomPropre = entite.type === 'nom_propre';
  const donnees: DonneesBail = {
    type: bail.type_bail,
    fichierContrat: contrat.fichier,
    versionContrat: contrat.version,
    fichierNotice: notice?.fichier ?? null,
    bailleur: {
      nom: enNomPropre ? [p.prenom, p.nom].filter(Boolean).join(' ') || 'à compléter' : entite.nom,
      adresse: entite.type === 'sci' ? entite.siege : p.adresse,
      qualite: entite.qualite_bailleur === 'personne_morale' ? 'personne_morale' : 'personne_physique',
      sciFamiliale: entite.sci_familiale,
      telephone: p.telephone,
      // Adresse électronique facultative : non reprise sans choix du bailleur.
      email: null,
    },
    locataires: personnes,
    colocation: estColocation(personnes.length, bail.locataires_couple),
    bien: {
      ...b,
      autres_parties: b.autres_parties ?? [],
      equipements: [b.cuisine, b.sanitaires].filter(Boolean).join(' ; ') || null,
      type_habitat: b.type_habitat as DonneesBail['bien']['type_habitat'],
      regime_juridique: b.regime_juridique as DonneesBail['bien']['regime_juridique'],
      chauffage_mode: b.chauffage_mode as DonneesBail['bien']['chauffage_mode'],
      eau_chaude_mode: b.eau_chaude_mode as DonneesBail['bien']['eau_chaude_mode'],
      locaux_accessoires: locaux.data ?? [],
    },
    bail,
    // Contrat type et clauses de Baillome en cours de relecture : document marqué « projet ».
    projet: true,
  };
  return { donnees };
}

/** Génère le PDF et ouvre le partage. Renvoie un message si la génération est impossible. */
export async function genererEtPartagerBail(bailId: string): Promise<string | null> {
  const r = await chargerDonneesBail(bailId);
  if ('impossible' in r) return r.impossible;
  if (Platform.OS === 'web') {
    // Sur ordinateur (essais uniquement), le projet remplace la page, prêt à imprimer.
    document.open();
    document.write(htmlBail(r.donnees));
    document.close();
    return null;
  }
  const { uri } = await Print.printToFileAsync({ html: htmlBail(r.donnees) });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Projet de bail' });
  }
  return null;
}
