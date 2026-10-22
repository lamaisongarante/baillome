// Génération du projet de bail en PDF sur le téléphone (expo-print), puis
// partage (Fichiers, email, AirDrop…). La génération côté serveur viendra à
// l'étape 5.
import { CONTRATS_TYPES, NOTICES, blocagesAvantSignature, versionApplicable, type BlocageSignature } from '@moteur/bail';
import type { BienCheckup, RegleData } from '@moteur/moteur';
import { question } from '@moteur/questions';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { TYPES_DIAGNOSTIC } from '@/components/fiche/rubriques';
import { chargerDossierBail } from '@/lib/baux';
import { phraseEquipements } from '@/lib/equipements';
import { estColocation } from '@/lib/personnes';
import { supabase } from '@/lib/supabase';

import { htmlBail, htmlNoticeBail, mentionsACompleter, type DonneesBail } from './bail';

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
 * Ce qui empêche l'envoi à la signature (relectures du 22/10/2026) : mentions
 * « à compléter », DPE absent (R-01), diagnostics obligatoires absents ou
 * périmés (R-04, avec les réponses du check-up). L'étape de signature reprendra
 * cette liste.
 */
export async function chargerBlocagesSignature(bienId: string, donnees: DonneesBail): Promise<BlocageSignature[]> {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const [bien, reponses, diagnostics, regle, version, situations] = await Promise.all([
    supabase.from('biens').select('*').eq('id', bienId).single(),
    supabase.from('reponses_checkup').select('question, valeur').eq('bien_id', bienId),
    supabase.from('diagnostics').select('type, date_realisation, resultat').eq('bien_id', bienId),
    supabase.from('regles').select('code, titre, validee').eq('code', 'R-04').single(),
    supabase
      .from('regles_versions')
      .select('version, date_effet, valable_jusqu_au, parametres, source')
      .eq('regle_code', 'R-04')
      .lte('date_effet', aujourdhui)
      .order('date_effet', { ascending: false })
      .limit(1),
    supabase.from('regles_situations').select('code, titre').eq('regle_code', 'R-04'),
  ]);
  if (!bien.data || !regle.data || !version.data?.[0]) {
    return [{ code: 'chargement', source: 'Bail', libelle: 'Les diagnostics n’ont pas pu être vérifiés : vérifiez votre connexion.' }];
  }
  return blocagesAvantSignature({
    aujourdhui,
    bien: bien.data as BienCheckup,
    reponses: Object.fromEntries((reponses.data ?? []).map((r) => [r.question, r.valeur])),
    diagnostics: diagnostics.data ?? [],
    regleR04: { ...(regle.data as Omit<RegleData, 'version'>), version: version.data[0] as RegleData['version'] },
    titresR04: Object.fromEntries((situations.data ?? []).map((x) => [x.code, x.titre ?? x.code])),
    libelleQuestion: (code) => question(code)?.libelle ?? code,
    mentionsACompleter: mentionsACompleter(donnees),
  });
}

function messageBlocages(blocages: BlocageSignature[]): string {
  if (!blocages.length) return 'Projet créé : le bail et sa notice d’information. Rien n’empêche l’envoi à la signature.';
  return `Projet créé : le bail et sa notice d’information. Avant l’envoi à la signature : ${blocages.map((b) => b.libelle).join(' ; ')}.`;
}

/** Génère le PDF et ouvre le partage. Renvoie un message à afficher, ou null. */
export async function genererEtPartagerBail(bailId: string): Promise<string | null> {
  const r = await chargerDonneesBail(bailId);
  if ('impossible' in r) return r.impossible;
  const bienId = (await supabase.from('baux').select('bien_id').eq('id', bailId).single()).data?.bien_id;
  const message = messageBlocages(bienId ? await chargerBlocagesSignature(bienId, r.donnees) : []);
  const notice = htmlNoticeBail(r.donnees);
  if (Platform.OS === 'web') {
    // Sur ordinateur (essais uniquement), le projet remplace la page, prêt à imprimer.
    document.open();
    document.write(htmlBail(r.donnees));
    document.close();
    return message;
  }
  // Deux documents du même dossier : le bail, puis la notice (annexe C).
  // A4 (595 × 842 points) ; sur iPhone, les marges de 19 mm sont données à l'impression.
  const imprimer = (h: string) =>
    Print.printToFileAsync({
      html: h,
      width: 595,
      height: 842,
      ...(Platform.OS === 'ios' ? { margins: { left: 54, right: 54, top: 54, bottom: 54 } } : {}),
    });
  const bail = await imprimer(htmlBail(r.donnees));
  const annexe = notice ? await imprimer(notice) : null;
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(bail.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Projet de bail' });
    if (annexe) await Sharing.shareAsync(annexe.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Notice d’information (annexe C)' });
  }
  return message;
}
