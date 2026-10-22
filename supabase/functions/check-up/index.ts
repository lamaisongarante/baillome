// Fonction serveur « check-up » : évalue la conformité des biens du bailleur connecté.
// Elle s'exécute avec les droits du bailleur (sécurité ligne par ligne) : elle ne
// peut lire que ses propres données. Les règles et leurs paramètres datés sont lus
// en base à chaque appel : corriger une règle ne demande pas de republier l'application.
import { createClient } from 'npm:@supabase/supabase-js@2';

import { codeInseeCommune, evaluer, scoreMoyen, type Contexte, type RegleData, type SituationData } from '../_partage/moteur.ts';
import { CRITERES_DECENCE } from '../_partage/questions.ts';

const ENTETES = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const repondre = (corps: unknown, statut = 200) => new Response(JSON.stringify(corps), { status: statut, headers: ENTETES });

/** Date du jour à Paris, au format AAAA-MM-JJ. */
const aujourdhui = () => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());

Deno.serve(async (requete) => {
  if (requete.method === 'OPTIONS') return new Response('ok', { headers: ENTETES });

  const autorisation = requete.headers.get('Authorization');
  if (!autorisation) return repondre({ erreur: 'NON_CONNECTE' }, 401);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: autorisation } },
    auth: { persistSession: false },
  });
  const { data: utilisateur } = await supabase.auth.getUser(autorisation.replace(/^Bearer\s+/i, ''));
  if (!utilisateur.user) return repondre({ erreur: 'NON_CONNECTE' }, 401);

  const { bien_id: bienId } = (await requete.json().catch(() => ({}))) as { bien_id?: string };
  const jour = aujourdhui();

  // Données communes : règles, versions en vigueur, situations, éléments de mobilier, mode aperçu.
  const [regles, versions, situations, elements, profil] = await Promise.all([
    supabase.from('regles').select('code, titre, validee').order('code'),
    supabase
      .from('regles_versions')
      .select('regle_code, version, date_effet, valable_jusqu_au, parametres, source')
      .lte('date_effet', jour)
      .order('date_effet', { ascending: false }),
    supabase.from('regles_situations').select('regle_code, code, libelle, titre, gravite, message, action'),
    supabase.from('elements_mobilier_obligatoires').select('code, libelle').order('ordre'),
    supabase.from('profils').select('apercu_regles').single(),
  ]);
  const erreur = [regles, versions, situations, elements, profil].find((r) => r.error);
  if (erreur?.error) return repondre({ erreur: 'LECTURE', detail: erreur.error.message }, 500);

  const reglesData: RegleData[] = regles.data!.map((r) => ({
    ...r,
    // La version la plus récente déjà entrée en vigueur.
    version: versions.data!.find((v) => v.regle_code === r.code) ?? null,
  }));

  let requeteBiens = supabase
    .from('biens')
    .select('id, numero, type_bien, situation_locative, type_location, code_insee, identifiant_fiscal, type_habitat, regime_juridique, periode_construction, hauteur_sous_plafond, surface_piece_principale, dpe_classe, dpe_date, chauffage_energie')
    .order('numero');
  if (bienId) requeteBiens = requeteBiens.eq('id', bienId);
  const biens = await requeteBiens;
  if (biens.error) return repondre({ erreur: 'LECTURE', detail: biens.error.message }, 500);

  const resultats = [];
  for (const b of biens.data) {
    const codeCommune = b.code_insee ? codeInseeCommune(b.code_insee) : null;
    const [reponses, diagnostics, assurances, inventaire, zone] = await Promise.all([
      supabase.from('reponses_checkup').select('question, valeur').eq('bien_id', b.id),
      supabase.from('diagnostics').select('type, date_realisation, resultat').eq('bien_id', b.id),
      supabase.from('assurances').select('nature, assureur, date_fin_validite').eq('bien_id', b.id),
      supabase.from('inventaire_mobilier').select('element_code').eq('bien_id', b.id),
      codeCommune
        ? supabase
            .from('communes_zone_tendue')
            .select('code_insee')
            .eq('code_insee', codeCommune)
            .lte('date_entree_vigueur', jour)
            .or(`date_fin.is.null,date_fin.gt.${jour}`)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const contexte: Contexte = {
      aujourdhui: jour,
      bien: {
        ...b,
        hauteur_sous_plafond: b.hauteur_sous_plafond === null ? null : Number(b.hauteur_sous_plafond),
        surface_piece_principale: b.surface_piece_principale === null ? null : Number(b.surface_piece_principale),
      },
      reponses: Object.fromEntries((reponses.data ?? []).map((r) => [r.question, r.valeur])),
      diagnostics: diagnostics.data ?? [],
      assurances: assurances.data ?? [],
      inventaireCodes: (inventaire.data ?? []).map((l) => l.element_code).filter((c): c is string => !!c),
      elementsObligatoires: elements.data!,
      zoneTendue: (zone.data ?? []).length > 0,
      regles: reglesData,
      situations: situations.data as SituationData[],
      apercu: profil.data!.apercu_regles,
    };

    const r = evaluer(contexte, [...CRITERES_DECENCE]);
    // Les messages et actions sont joints au résultat, tels qu'ils sont en base.
    const constats = r.constats.map((c) => {
      const s = situations.data!.find((x) => x.regle_code === c.regle && x.code === c.situation)!;
      return { ...c, libelle: s.libelle, titre: s.titre, message: s.message, action: s.action };
    });
    resultats.push({ bien_id: b.id, numero: b.numero, ...r, constats });
  }

  return repondre({
    date: jour,
    apercu: profil.data!.apercu_regles,
    regles: reglesData.map((r) => ({ code: r.code, titre: r.titre, validee: r.validee })),
    biens: resultats,
    score_moyen: scoreMoyen(resultats.map((r) => r.score)),
  });
});
