// Moteur de conformité de Baillome (étape 2).
// Fonctions pures, sans dépendance : utilisées par la fonction serveur « check-up »
// et par les tests (tests/moteur). Les seuils, durées et dates viennent des
// paramètres datés des règles (table regles_versions), jamais du code.
// Référence : docs/regles-de-conformite.md.

export type Gravite = 'critique' | 'important' | 'conseil' | 'ok';

export type RegleData = {
  code: string;
  titre: string;
  validee: boolean;
  /** Version en vigueur à la date du check-up. */
  version: { version: string; date_effet: string; valable_jusqu_au: string | null; parametres: Record<string, unknown>; source: string } | null;
};

export type SituationData = { regle_code: string; code: string; gravite: Gravite };

export type BienCheckup = {
  id: string;
  type_bien: string;
  situation_locative: string | null;
  type_location: string | null;
  code_insee: string | null;
  identifiant_fiscal: string | null;
  type_habitat: string | null;
  regime_juridique: string | null;
  periode_construction: string | null;
  hauteur_sous_plafond: number | null;
  surface_piece_principale: number | null;
  dpe_classe: string | null;
  dpe_date: string | null;
  chauffage_energie: string | null;
};

export type Contexte = {
  aujourdhui: string; // AAAA-MM-JJ
  bien: BienCheckup;
  reponses: Record<string, string>;
  diagnostics: { type: string; date_realisation: string | null; resultat: string | null }[];
  assurances: { nature: string; assureur: string | null; date_fin_validite: string | null }[];
  inventaireCodes: string[];
  elementsObligatoires: { code: string; libelle: string }[];
  /** Commune du bien dans la liste R-09 en vigueur à la date du check-up. */
  zoneTendue: boolean;
  regles: RegleData[];
  situations: SituationData[];
  /** Mode aperçu : règles non validées et score visibles. */
  apercu: boolean;
};

export type Constat = {
  regle: string;
  situation: string;
  gravite: Gravite;
  validee: boolean;
  /** Valeurs à insérer dans le message ([montant], [élément], [critère]). */
  valeurs?: Record<string, string>;
};

export type StatutRegle =
  | 'evaluee'
  | 'a_completer' // des réponses manquent
  | 'necessite_bail' // évaluée quand le bail sera saisi (étape 3 et suivantes)
  | 'non_applicable'
  | 'version_a_revoir'; // la version des paramètres est arrivée à échéance

export type EtatRegle = { regle: string; statut: StatutRegle; validee: boolean; questions: string[] };

export type Echeance = { date: string; regle: string; cle: string; libelle: string };

export type Resultat = {
  horsV1: boolean;
  constats: Constat[];
  etats: EtatRegle[];
  /** Score sur 100 ; null si le calcul n'est pas visible (non validé hors aperçu) ou pas évaluable. */
  score: number | null;
  echeances: Echeance[];
};

// ---------------------------------------------------------------------
// Outils de dates (AAAA-MM-JJ, sans fuseau horaire)
// ---------------------------------------------------------------------

export function ajouterMois(date: string, mois: number): string {
  const [a, m, j] = date.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1 + mois, 1));
  const dernierJour = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(j, dernierJour));
  return d.toISOString().slice(0, 10);
}

export function ajouterAns(date: string, ans: number): string {
  return ajouterMois(date, ans * 12);
}

export function ajouterJours(date: string, jours: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------
// Codes Insee : Paris, Marseille et Lyon sont listés par commune dans le
// décret n° 2026-831, alors que les adresses portent le code de l'arrondissement.
// ---------------------------------------------------------------------

export function codeInseeCommune(code: string): string {
  if (/^751(0[1-9]|1\d|20)$/.test(code)) return '75056'; // Paris, 1er à 20e
  if (/^132(0[1-9]|1[0-6])$/.test(code)) return '13055'; // Marseille, 1er à 16e
  if (/^6938[1-9]$/.test(code)) return '69123'; // Lyon, 1er à 9e
  return code;
}

export function estOutreMer(code: string | null): boolean {
  return !!code && /^97/.test(code);
}

// ---------------------------------------------------------------------
// Évaluation
// ---------------------------------------------------------------------

type Ajout = { situation: string; valeurs?: Record<string, string> };

type Evaluation =
  | { statut: 'evaluee'; constats: Ajout[]; echeances?: Omit<Echeance, 'regle'>[] }
  | { statut: 'a_completer'; questions: string[]; constats?: Ajout[]; echeances?: Omit<Echeance, 'regle'>[] }
  | { statut: 'necessite_bail' | 'non_applicable' };

const param = <T>(r: RegleData, cle: string): T => {
  if (!r.version || !(cle in r.version.parametres)) throw new Error(`Paramètre ${cle} manquant pour ${r.code}`);
  return r.version.parametres[cle] as T;
};

const estLogement = (b: BienCheckup) => b.type_bien !== 'garage';
const estLoue = (b: BienCheckup) => b.situation_locative === 'loue_vide' || b.situation_locative === 'loue_meuble';
const estMeuble = (b: BienCheckup) =>
  b.situation_locative === 'loue_meuble' || b.type_location === 'meublee' || b.type_location === 'meuble_tourisme';

/** R-01 · Performance énergétique (DPE). */
function evaluerR01(c: Contexte, r: RegleData): Evaluation {
  const b = c.bien;
  if (!estLogement(b)) return { statut: 'non_applicable' };
  const valablesDepuis = param<string>(r, 'dpe_valables_depuis');
  const validite = param<number>(r, 'validite_dpe_ans');
  const alerteMois = param<number>(r, 'alerte_expiration_mois');
  const elec = param<{ dpe_du: string; dpe_au: string }>(r, 'calcul_electricite');

  const existe = c.reponses.dpe_existe;
  if (!b.dpe_date) {
    if (existe === 'oui') return { statut: 'a_completer', questions: ['dpe_date', 'dpe_classe'] };
    if (!existe) return { statut: 'a_completer', questions: ['dpe_existe'] };
    return { statut: 'evaluee', constats: [{ situation: 'dpe_absent_ou_ancien' }] };
  }

  const constats: Ajout[] = [];
  const echeances: Omit<Echeance, 'regle'>[] = [];
  if (b.dpe_date < valablesDepuis) {
    constats.push({ situation: 'dpe_absent_ou_ancien' });
  } else {
    const fin = ajouterAns(b.dpe_date, validite);
    if (fin <= c.aujourdhui) constats.push({ situation: 'dpe_plus_10_ans' });
    else {
      echeances.push({ date: ajouterMois(fin, -alerteMois), cle: 'dpe_bientot_perime', libelle: 'DPE à renouveler dans 6 mois' });
      echeances.push({ date: fin, cle: 'dpe_fin_validite', libelle: 'Fin de validité du DPE' });
    }
  }

  // Décision du 22/10/2026 : la classe déclarée est évaluée même si le DPE n'est plus valable.
  if (!b.dpe_classe) return { statut: 'a_completer', questions: ['dpe_classe'], constats, echeances };
  if (b.dpe_classe === 'G') {
    constats.push({ situation: 'classe_g' });
    if (estLoue(b)) constats.push({ situation: 'classe_g_locataire' });
  } else if (b.dpe_classe === 'F') constats.push({ situation: 'classe_f' });
  else if (b.dpe_classe === 'E') constats.push({ situation: 'classe_e' });

  // Horizon : date à laquelle la classe actuelle ne suffira plus (paramètres datés).
  const prochaine = param<{ classe: string; depuis: string }[]>(r, 'classes_non_decentes').find(
    (x) => x.classe === b.dpe_classe && x.depuis > c.aujourdhui,
  );
  if (prochaine) {
    echeances.push({ date: prochaine.depuis, cle: 'classe_insuffisante', libelle: `La classe ${prochaine.classe} ne suffira plus pour louer` });
  }

  if (['E', 'F', 'G'].includes(b.dpe_classe)) {
    if (!b.chauffage_energie) return { statut: 'a_completer', questions: ['chauffage_energie'], constats, echeances };
    if (b.chauffage_energie === 'electrique' && b.dpe_date >= elec.dpe_du && b.dpe_date <= elec.dpe_au) {
      constats.push({ situation: 'attestation_electricite' });
    }
  }
  return { statut: 'evaluee', constats, echeances };
}

/** R-04 · Diagnostics annexés au bail. Le DPE est traité par R-01. */
function evaluerR04(c: Contexte, r: RegleData): Evaluation {
  const b = c.bien;
  const rep = c.reponses;
  const ansSecurite = param<number>(r, 'validite_electricite_gaz_ans');
  const ansCrep = param<number>(r, 'crep_validite_ans_si_presence');
  const moisErp = param<number>(r, 'validite_etat_risques_mois');
  const alerteMois = param<number>(r, 'alerte_expiration_mois');
  const manquantes: string[] = [];
  const constats: Ajout[] = [];
  const echeances: Omit<Echeance, 'regle'>[] = [];

  const dernier = (type: string) =>
    c.diagnostics
      .filter((d) => d.type === type && d.date_realisation)
      .sort((x, y) => (y.date_realisation ?? '').localeCompare(x.date_realisation ?? ''))[0];

  /** Un diagnostic valable N ans : absent → critique ; périmé → important (décision du 22/10/2026). */
  const controler = (type: string, ans: number, absent: string, perime: string, libelle: string) => {
    const d = dernier(type);
    if (!d) return constats.push({ situation: absent, valeurs: { diagnostic: libelle } });
    const fin = ajouterAns(d.date_realisation!, ans);
    if (fin <= c.aujourdhui) return constats.push({ situation: perime, valeurs: { diagnostic: libelle } });
    echeances.push({ date: ajouterMois(fin, -alerteMois), cle: `${type}_bientot_perime`, libelle: `${libelle} à refaire dans 3 mois` });
  };

  if (estLogement(b)) {
    // Plomb (CREP) : logement construit avant 1949. La fiche du bien suffit si elle le dit.
    const construction = b.periode_construction === 'avant_1949' ? 'avant_1949' : b.periode_construction ? 'apres_1949' : rep.construction;
    if (!construction) manquantes.push('construction');
    else if (construction === 'avant_1949' || construction === 'nsp') {
      const crep = dernier('crep');
      if (!crep) constats.push({ situation: 'crep_absent' });
      else if (crep.resultat === 'presence') {
        const fin = ajouterAns(crep.date_realisation!, ansCrep);
        if (fin <= c.aujourdhui) constats.push({ situation: 'crep_positif_perime' });
        else echeances.push({ date: ajouterMois(fin, -alerteMois), cle: 'crep_bientot_perime', libelle: 'Constat plomb à refaire dans 3 mois' });
      }
    }

    // Électricité et gaz : installation de plus de 15 ans (« Je ne sais pas » = à prévoir).
    const elec = rep.electricite_plus_15_ans;
    if (!elec) manquantes.push('electricite_plus_15_ans');
    else if (elec === 'oui' || elec === 'nsp') controler('electricite', ansSecurite, 'securite_absent', 'securite_perime', 'Diagnostic électricité');
    const gaz = rep.gaz;
    if (!gaz) manquantes.push('gaz');
    else if (gaz === 'plus_15_ans' || gaz === 'nsp') controler('gaz', ansSecurite, 'securite_absent', 'securite_perime', 'Diagnostic gaz');

    // Amiante : immeuble collectif, permis avant le 1er juillet 1997 (« Je ne sais pas » = oui).
    if (b.type_habitat === 'collectif') {
      const permis = rep.permis_avant_1997;
      if (!permis) manquantes.push('permis_avant_1997');
      else if ((permis === 'oui' || permis === 'nsp') && !dernier('amiante')) constats.push({ situation: 'amiante' });
    } else if (!b.type_habitat) manquantes.push('type_habitat');

    // Bruit d'aérodrome.
    const bruit = rep.zone_bruit;
    if (!bruit) manquantes.push('zone_bruit');
    else if ((bruit === 'oui' || bruit === 'nsp') && !dernier('bruit')) constats.push({ situation: 'bruit' });
  }

  // État des risques (y compris pour un garage seul). Obligatoire si la commune est exposée,
  // ou si le bailleur ne sait pas (décision du 22/10/2026).
  const risques = rep.commune_risques;
  if (!risques) manquantes.push('commune_risques');
  else if (risques === 'oui' || risques === 'nsp') {
    const erp = dernier('erp');
    if (!erp) constats.push({ situation: 'erp_absent' });
    else if (b.situation_locative === 'pas_encore_loue' && ajouterMois(erp.date_realisation!, moisErp) <= c.aujourdhui) {
      // « Nouveau bail » : en l'absence de bail, une location en préparation.
      constats.push({ situation: 'erp_plus_6_mois' });
    }
  }

  if (manquantes.length) return { statut: 'a_completer', questions: manquantes, constats, echeances };
  if (constats.length === 0) constats.push({ situation: 'tous_valables' });
  return { statut: 'evaluee', constats, echeances };
}

/** R-05 · Bail conforme : identifiant fiscal (12 chiffres, sans contrôle du département, décision du 22/10/2026). */
function evaluerR05(c: Contexte): Evaluation {
  if (!estLogement(c.bien)) return { statut: 'non_applicable' };
  const id = c.bien.identifiant_fiscal;
  return { statut: 'evaluee', constats: id && /^\d{12}$/.test(id) ? [] : [{ situation: 'identifiant_fiscal' }] };
}

/** R-08 · Assurances. */
function evaluerR08(c: Contexte, r: RegleData): Evaluation {
  const b = c.bien;
  const delai = param<number>(r, 'delai_attestation_jours');
  const constats: Ajout[] = [];
  const echeances: Omit<Echeance, 'regle'>[] = [];
  const pno = c.assurances.some((a) => a.nature === 'proprietaire_non_occupant' && a.assureur);
  if (!b.regime_juridique) return { statut: 'a_completer', questions: ['regime_juridique'] };
  if (!pno) constats.push({ situation: b.regime_juridique === 'copropriete' ? 'pno_copropriete' : 'pno_hors_copropriete' });

  if (estLoue(b)) {
    const att = c.assurances
      .filter((a) => a.nature === 'attestation_locataire' && a.date_fin_validite)
      .sort((x, y) => (y.date_fin_validite ?? '').localeCompare(x.date_fin_validite ?? ''))[0];
    if (!att) constats.push({ situation: 'attestation_absente' });
    else {
      const limite = ajouterJours(att.date_fin_validite!, delai);
      if (limite < c.aujourdhui) constats.push({ situation: 'attestation_perimee' });
      else echeances.push({ date: att.date_fin_validite!, cle: 'attestation_locataire', libelle: 'Attestation d\'assurance du locataire à renouveler' });
    }
  }
  return { statut: 'evaluee', constats, echeances };
}

/** R-09 · Zone tendue : le plafond se calcule avec le bail (étape 3). */
function evaluerR09(c: Contexte): Evaluation {
  if (!estLogement(c.bien) || !c.zoneTendue) return { statut: 'non_applicable' };
  return { statut: 'necessite_bail' };
}

/** R-11 · Location meublée : les onze éléments du décret n° 2015-981. */
function evaluerR11(c: Contexte): Evaluation {
  if (!estLogement(c.bien) || !estMeuble(c.bien)) return { statut: 'non_applicable' };
  const manquants = c.elementsObligatoires.filter((e) => !c.inventaireCodes.includes(e.code));
  if (manquants.length === 0) return { statut: 'evaluee', constats: [{ situation: 'inventaire_complet' }] };
  return {
    statut: 'evaluee',
    constats: [{ situation: 'element_manquant', valeurs: { élément: manquants.map((e) => e.libelle.toLowerCase()).join(', ') } }],
  };
}

/** R-12 · Décence du logement (la performance énergétique relève de R-01). */
function evaluerR12(c: Contexte, r: RegleData, criteres: { code: string; critere: string; question: string | null }[]): Evaluation {
  const b = c.bien;
  if (!estLogement(b)) return { statut: 'non_applicable' };
  const rep = c.reponses;
  const smin = param<number>(r, 'piece_surface_min_m2');
  const hmin = param<number>(r, 'piece_hauteur_min_m');
  const vmin = param<number>(r, 'piece_volume_min_m3');
  const manquantes: string[] = [];
  const constats: Ajout[] = [];

  const surface = c.bien.surface_piece_principale;
  const hauteur = b.hauteur_sous_plafond ?? (rep.hauteur_sous_plafond ? Number(rep.hauteur_sous_plafond) : null);
  if (surface === null) manquantes.push('surface_piece_principale');
  if (hauteur === null) manquantes.push('hauteur_sous_plafond');
  if (surface !== null && hauteur !== null && !((surface >= smin && hauteur >= hmin) || surface * hauteur >= vmin)) {
    constats.push({ situation: 'surface' });
  }

  if (!rep.arrete) manquantes.push('arrete');
  else if (rep.arrete === 'oui') constats.push({ situation: 'arrete' });

  // Seuls les critères posés en question (chauffage, cuisine et sanitaires viennent de la fiche du bien).
  for (const cr of criteres.filter((x) => x.question)) {
    const v = rep[`decence_${cr.code}`];
    if (!v) manquantes.push(`decence_${cr.code}`);
    else if (v === 'non') constats.push({ situation: 'critere', valeurs: { critère: cr.critere.toLowerCase() } });
  }

  if (b.dpe_classe && ['E', 'F', 'G'].includes(b.dpe_classe)) {
    if (!rep.contraintes_travaux) manquantes.push('contraintes_travaux');
    else if (rep.contraintes_travaux === 'oui') constats.push({ situation: 'contraintes_travaux' });
  }

  if (manquantes.length) return { statut: 'a_completer', questions: manquantes, constats };
  return { statut: 'evaluee', constats };
}

/** Règles qui ont besoin du bail, des loyers ou des candidatures (étapes 3 à 5). */
const NECESSITE_BAIL = ['R-02', 'R-03', 'R-06', 'R-07', 'R-10'];

export function evaluer(c: Contexte, criteresDecence: { code: string; critere: string; question: string | null }[]): Resultat {
  if (estOutreMer(c.bien.code_insee)) return { horsV1: true, constats: [], etats: [], score: null, echeances: [] };

  const constats: Constat[] = [];
  const etats: EtatRegle[] = [];
  const echeances: Echeance[] = [];

  for (const r of c.regles) {
    if (r.code === 'SCORE') continue;
    if (!r.validee && !c.apercu) continue;

    let ev: Evaluation;
    if (NECESSITE_BAIL.includes(r.code)) ev = { statut: 'necessite_bail' };
    else if (r.version?.valable_jusqu_au && r.version.valable_jusqu_au < c.aujourdhui) {
      etats.push({ regle: r.code, statut: 'version_a_revoir', validee: r.validee, questions: [] });
      continue;
    } else {
      switch (r.code) {
        case 'R-01': ev = evaluerR01(c, r); break;
        case 'R-04': ev = evaluerR04(c, r); break;
        case 'R-05': ev = evaluerR05(c); break;
        case 'R-08': ev = evaluerR08(c, r); break;
        case 'R-09': ev = evaluerR09(c); break;
        case 'R-11': ev = evaluerR11(c); break;
        case 'R-12': ev = evaluerR12(c, r, criteresDecence); break;
        default: ev = { statut: 'non_applicable' };
      }
    }

    etats.push({ regle: r.code, statut: ev.statut, validee: r.validee, questions: 'questions' in ev ? ev.questions : [] });
    if ('constats' in ev && ev.constats) {
      for (const a of ev.constats) {
        const s = c.situations.find((x) => x.regle_code === r.code && x.code === a.situation);
        if (!s) throw new Error(`Situation ${r.code}/${a.situation} absente des données`);
        constats.push({ regle: r.code, situation: a.situation, gravite: s.gravite, validee: r.validee, valeurs: a.valeurs });
      }
    }
    if ('echeances' in ev && ev.echeances) echeances.push(...ev.echeances.map((e) => ({ ...e, regle: r.code })));
  }

  return { horsV1: false, constats, etats, score: calculerScore(c, constats), echeances: echeances.sort((a, b) => a.date.localeCompare(b.date)) };
}

/**
 * Score d'un bien : 100, moins une pénalité par règle selon sa situation la plus grave
 * (correction du 22/10/2026 : une seule déduction par règle) ; minimum fixé par les paramètres.
 */
export function calculerScore(c: Pick<Contexte, 'regles' | 'apercu'>, constats: Constat[]): number | null {
  const r = c.regles.find((x) => x.code === 'SCORE');
  if (!r?.version || (!r.validee && !c.apercu)) return null;
  const p = r.version.parametres as { depart: number; critique: number; important: number; conseil: number; minimum: number; une_deduction_par_regle?: boolean };
  const valeur = (g: Gravite) => (g === 'ok' ? 0 : p[g]);
  let penalite: number;
  if (p.une_deduction_par_regle) {
    const pire = new Map<string, number>();
    for (const k of constats) pire.set(k.regle, Math.max(pire.get(k.regle) ?? 0, valeur(k.gravite)));
    penalite = [...pire.values()].reduce((s, v) => s + v, 0);
  } else penalite = constats.reduce((s, k) => s + valeur(k.gravite), 0);
  return Math.max(p.minimum, p.depart - penalite);
}

/** Score moyen du patrimoine : moyenne des biens évalués, arrondie. */
export function scoreMoyen(scores: (number | null)[]): number | null {
  const v = scores.filter((s): s is number => s !== null);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
}
