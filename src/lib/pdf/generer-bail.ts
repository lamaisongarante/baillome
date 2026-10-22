// Génération du projet de bail en PDF sur le téléphone (expo-print), puis
// partage (Fichiers, email, AirDrop…). La génération côté serveur viendra à
// l'étape 5.
import { CONTRATS_TYPES, NOTICES, versionApplicable } from '@moteur/bail';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { TYPES_DIAGNOSTIC } from '@/components/fiche/rubriques';
import { chargerDossierBail } from '@/lib/baux';
import { phraseEquipements } from '@/lib/equipements';
import { estColocation } from '@/lib/personnes';
import { supabase } from '@/lib/supabase';

import { htmlBail, mentionsACompleter, type DonneesBail } from './bail';

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

  const [bien, locaux, profil, locataires, diagnostics] = await Promise.all([
    supabase
      .from('biens')
      .select(
        'numero, adresse, batiment, etage, porte, code_postal, commune, identifiant_fiscal, type_habitat, regime_juridique, periode_construction, surface_habitable, pieces_principales, autres_parties, cuisine, sanitaires, cuisine_equipements, salle_eau_equipements, wc, chauffage_mode, chauffage_repartition, eau_chaude_mode, eau_chaude_repartition, parties_communes, dpe_classe, dpe_date, dpe_depenses_min_euros, dpe_depenses_max_euros, dpe_annee_reference_prix, equipements_numeriques, servitude_residence_principale, entites (type, nom, qualite_bailleur, sci_familiale, siege, siren, forme_juridique, representant_legal)',
      )
      .eq('id', bail.bien_id)
      .single(),
    supabase.from('locaux_accessoires').select('type, numero_lot, description').eq('bien_id', bail.bien_id),
    supabase.from('profils').select('prenom, nom, adresse, telephone, email_dans_baux, date_naissance, lieu_naissance').single(),
    supabase
      .from('baux_locataires')
      .select('ordre, personnes (prenom, nom, telephone, email, date_naissance, lieu_naissance, adresse)')
      .eq('bail_id', bailId)
      .order('ordre'),
    supabase.from('diagnostics').select('type, date_realisation').eq('bien_id', bail.bien_id).order('date_realisation', { ascending: false }),
  ]);
  if (!bien.data || !profil.data) return { impossible: 'Les informations du bien n’ont pas pu être chargées. Vérifiez votre connexion.' };
  const b = bien.data;
  const entite = b.entites as unknown as {
    type: string;
    nom: string;
    qualite_bailleur: string;
    sci_familiale: boolean;
    siege: string | null;
    siren: string | null;
    forme_juridique: string | null;
    representant_legal: string | null;
  };
  const p = profil.data;
  const personnes = (locataires.data ?? []).map(
    (l) => l.personnes as unknown as DonneesBail['locataires'][number],
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
      // Adresse électronique facultative : seulement si le bailleur l'a choisi (Mon compte).
      email: p.email_dans_baux ? ((await supabase.auth.getUser()).data.user?.email ?? null) : null,
      date_naissance: enNomPropre ? p.date_naissance : null,
      lieu_naissance: enNomPropre ? p.lieu_naissance : null,
      forme_juridique: entite.type === 'sci' ? entite.forme_juridique : null,
      siren: entite.type === 'sci' ? entite.siren : null,
      representant_legal: entite.type === 'sci' ? entite.representant_legal : null,
    },
    locataires: personnes,
    colocation: estColocation(personnes.length, bail.locataires_couple),
    bien: {
      ...b,
      autres_parties: b.autres_parties ?? [],
      equipements: phraseEquipements({
        cuisine_equipements: b.cuisine_equipements ?? [],
        salle_eau_equipements: b.salle_eau_equipements ?? [],
        wc: b.wc,
        cuisine: b.cuisine,
        sanitaires: b.sanitaires,
      }),
      type_habitat: b.type_habitat as DonneesBail['bien']['type_habitat'],
      regime_juridique: b.regime_juridique as DonneesBail['bien']['regime_juridique'],
      chauffage_mode: b.chauffage_mode as DonneesBail['bien']['chauffage_mode'],
      eau_chaude_mode: b.eau_chaude_mode as DonneesBail['bien']['eau_chaude_mode'],
      locaux_accessoires: locaux.data ?? [],
    },
    bail,
    annexes: {
      // Le diagnostic le plus récent de chaque type.
      diagnostics: TYPES_DIAGNOSTIC.flatMap((t) => {
        const d = (diagnostics.data ?? []).find((x) => x.type === t.valeur);
        return d ? [{ libelle: t.libelle, date: d.date_realisation }] : [];
      }),
    },
    // Contrat type et clauses de Baillome en cours de relecture : document marqué « projet ».
    projet: true,
  };
  return { donnees };
}

/**
 * Message sur les mentions obligatoires manquantes. Le projet peut être généré,
 * mais il ne pourra pas être envoyé à la signature tant qu'elles manquent
 * (retour de relecture du 22/10/2026) : l'étape de signature reprendra cette liste.
 */
function messageMentions(d: DonneesBail): string | null {
  const manquantes = mentionsACompleter(d);
  if (!manquantes.length) return null;
  return `Projet créé. ${manquantes.length} mention${manquantes.length > 1 ? 's restent' : ' reste'} à compléter : ${manquantes.join(' ; ')}. Le bail ne pourra pas être envoyé à la signature tant qu’elles manquent.`;
}

/** Génère le PDF et ouvre le partage. Renvoie un message à afficher, ou null. */
export async function genererEtPartagerBail(bailId: string): Promise<string | null> {
  const r = await chargerDonneesBail(bailId);
  if ('impossible' in r) return r.impossible;
  const message = messageMentions(r.donnees);
  if (Platform.OS === 'web') {
    // Sur ordinateur (essais uniquement), le projet remplace la page, prêt à imprimer.
    document.open();
    document.write(htmlBail(r.donnees));
    document.close();
    return message;
  }
  // A4 (595 × 842 points) ; sur iPhone, les marges de 19 mm sont données à l'impression.
  const { uri } = await Print.printToFileAsync({
    html: htmlBail(r.donnees),
    width: 595,
    height: 842,
    ...(Platform.OS === 'ios' ? { margins: { left: 54, right: 54, top: 54, bottom: 54 } } : {}),
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Projet de bail' });
  }
  return message;
}
