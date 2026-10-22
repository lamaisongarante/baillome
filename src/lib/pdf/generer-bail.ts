// Génération du projet de bail en PDF sur le téléphone (expo-print), puis
// partage (Fichiers, email, AirDrop…). La génération côté serveur viendra à
// l'étape 5.
import { CONTRATS_TYPES, NOTICES, blocagesAvantSignature, versionApplicable, type BlocageSignature } from '@moteur/bail';
import { diagnosticsRequis, type BienCheckup, type RegleData } from '@moteur/moteur';
import { question } from '@moteur/questions';
import * as Print from 'expo-print';
import { File } from 'expo-file-system';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import { Platform } from 'react-native';

import { TYPES_DIAGNOSTIC } from '@/components/fiche/rubriques';
import { chargerDossierBail } from '@/lib/baux';
import { lienTemporaire } from '@/lib/coffre';
import { phraseEquipements } from '@/lib/equipements';
import { estColocation } from '@/lib/personnes';
import { supabase } from '@/lib/supabase';

import { htmlPageDeGarde, type PiecesAnnexes } from './annexes';
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
export async function chargerBlocagesSignature(bienId: string, donnees: DonneesBail, naturesAuCoffre: string[]): Promise<BlocageSignature[]> {
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
    naturesAuCoffre,
  });
}

/** État avant signature, affiché sous les boutons : ce qui bloque l'envoi. */
export async function chargerEtatSignature(bailId: string): Promise<{ blocages: BlocageSignature[] } | { impossible: string }> {
  const r = await chargerDonneesBail(bailId);
  if ('impossible' in r) return r;
  const bienId = (await supabase.from('baux').select('bien_id').eq('id', bailId).single()).data?.bien_id;
  if (!bienId) return { impossible: 'Ce bail est introuvable.' };
  const pieces = await chargerPieces(bienId, r.donnees);
  return { blocages: await chargerBlocagesSignature(bienId, r.donnees, pieces.diagnostics.map((d) => d.nature)) };
}

type DocumentAnnexe = { titre: string; date: string | null; nature: string | null; chemin: string; type: string | null };

/** Documents du coffre à annexer : règlement de copropriété et diagnostics (le plus récent de chaque nature). */
async function chargerPieces(bienId: string, d: DonneesBail): Promise<PiecesAnnexes & { fichiers: DocumentAnnexe[] }> {
  const [docs, bien, reponses] = await Promise.all([
    supabase
      .from('documents')
      .select('titre, type_document, nature_diagnostic, date_document, fichier_chemin, fichier_type, cree_le')
      .eq('bien_id', bienId)
      .in('type_document', ['reglement_copropriete', 'diagnostic'])
      .not('fichier_chemin', 'is', null)
      .order('date_document', { ascending: false, nullsFirst: false })
      .order('cree_le', { ascending: false }),
    supabase.from('biens').select('*').eq('id', bienId).single(),
    supabase.from('reponses_checkup').select('question, valeur').eq('bien_id', bienId),
  ]);
  const liste = docs.data ?? [];
  const reglement = liste.find((x) => x.type_document === 'reglement_copropriete') ?? null;
  const parNature = new Map<string, (typeof liste)[number]>();
  for (const x of liste) if (x.type_document === 'diagnostic' && x.nature_diagnostic && !parNature.has(x.nature_diagnostic)) parNature.set(x.nature_diagnostic, x);
  const { requis } = bien.data
    ? diagnosticsRequis({ bien: bien.data as BienCheckup, reponses: Object.fromEntries((reponses.data ?? []).map((q) => [q.question, q.valeur])) })
    : { requis: [] as string[] };
  // Ordre officiel : A (règlement), puis B dans l'ordre des diagnostics requis, puis les autres diagnostics.
  const ordre = [...requis, ...[...parNature.keys()].filter((n) => !requis.includes(n))];
  const diagnostics = ordre.flatMap((n) => {
    const x = parNature.get(n);
    return x ? [{ titre: x.titre, date: x.date_document, nature: n, chemin: x.fichier_chemin!, type: x.fichier_type }] : [];
  });
  return {
    copropriete: d.bien.regime_juridique === 'copropriete',
    reglement: reglement ? { titre: reglement.titre, date: reglement.date_document } : null,
    diagnosticsRequis: requis,
    diagnostics,
    notice: d.fichierNotice ? { depuis: NOTICES.find((n) => n.fichier === d.fichierNotice)?.depuis ?? '' } : null,
    fichiers: [
      ...(reglement ? [{ titre: reglement.titre, date: reglement.date_document, nature: null, chemin: reglement.fichier_chemin!, type: reglement.fichier_type }] : []),
      ...diagnostics,
    ],
  };
}

// A4 (595 × 842 points) ; sur iPhone, les marges de 19 mm sont données à l'impression.
const imprimer = (h: string) =>
  Print.printToFileAsync({
    html: h,
    width: 595,
    height: 842,
    ...(Platform.OS === 'ios' ? { margins: { left: 54, right: 54, top: 54, bottom: 54 } } : {}),
  });

async function partager(uri: string, titre: string) {
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: titre });
}

/** « Générer le bail » : le bail seul, un fichier, une fenêtre de partage. */
export async function genererBail(bailId: string): Promise<string | null> {
  const r = await chargerDonneesBail(bailId);
  if ('impossible' in r) return r.impossible;
  if (Platform.OS === 'web') {
    // Sur ordinateur (essais uniquement), le projet remplace la page, prêt à imprimer.
    document.open();
    document.write(htmlBail(r.donnees));
    document.close();
    return null;
  }
  const { uri } = await imprimer(htmlBail(r.donnees));
  await partager(uri, 'Projet de bail');
  return null;
}

/**
 * « Générer les annexes » : un seul PDF — page de garde, puis A (règlement de
 * copropriété), B (diagnostics du coffre), C (notice d'information). L'état des
 * lieux (D) s'ajoutera à l'étape 4.
 */
export async function genererAnnexes(bailId: string): Promise<string | null> {
  const r = await chargerDonneesBail(bailId);
  if ('impossible' in r) return r.impossible;
  const bienId = (await supabase.from('baux').select('bien_id').eq('id', bailId).single()).data?.bien_id;
  if (!bienId) return 'Ce bail est introuvable.';
  const pieces = await chargerPieces(bienId, r.donnees);
  const d = r.donnees;
  const adresse = [d.bien.adresse, [d.bien.code_postal, d.bien.commune].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const garde = htmlPageDeGarde({ numeroBien: d.bien.numero, adresse, pieces, projet: d.projet });
  const notice = htmlNoticeBail(d);
  if (Platform.OS === 'web') {
    document.open();
    document.write(garde);
    document.close();
    return null;
  }

  const fusion = await PDFDocument.create();
  const ajouterPdf = async (octets: ArrayBuffer) => {
    const source = await PDFDocument.load(octets, { ignoreEncryption: true });
    for (const p of await fusion.copyPages(source, source.getPageIndices())) fusion.addPage(p);
  };
  const ajouterImage = async (octets: ArrayBuffer, type: string) => {
    const image = type === 'image/png' ? await fusion.embedPng(octets) : await fusion.embedJpg(octets);
    const page = fusion.addPage([595, 842]);
    const echelle = Math.min((595 - 80) / image.width, (842 - 80) / image.height);
    const l = image.width * echelle;
    const h = image.height * echelle;
    page.drawImage(image, { x: (595 - l) / 2, y: (842 - h) / 2, width: l, height: h });
  };

  await ajouterPdf(await new File((await imprimer(garde)).uri).arrayBuffer());
  const nonJoints: string[] = [];
  for (const f of pieces.fichiers) {
    try {
      const lien = await lienTemporaire(f.chemin);
      if (!lien) throw new Error('lien');
      const octets = await (await fetch(lien)).arrayBuffer();
      if (f.type === 'application/pdf') await ajouterPdf(octets);
      else if (f.type === 'image/jpeg' || f.type === 'image/png') await ajouterImage(octets, f.type);
      else throw new Error('format');
    } catch {
      nonJoints.push(f.titre);
    }
  }
  if (notice) await ajouterPdf(await new File((await imprimer(notice)).uri).arrayBuffer());

  const chemin = `${cacheDirectory}annexes-bail-${String(d.bien.numero).padStart(2, '0')}.pdf`;
  await writeAsStringAsync(chemin, await fusion.saveAsBase64(), { encoding: 'base64' });
  await partager(chemin, 'Annexes au contrat de location');
  return nonJoints.length
    ? `Ces documents du coffre n’ont pas pu être joints (format ou connexion) : ${nonJoints.join(' ; ')}. Rangez-les en PDF, JPEG ou PNG.`
    : null;
}
