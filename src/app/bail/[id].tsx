import {
  DUREES_MINIMALES,
  controlerBail,
  dureeProposee,
  plafondDepot,
  versionApplicable,
  CONTRATS_TYPES,
  NOTICES,
  dernierIrlPublie,
  type BlocageSignature,
  type Controle,
} from '@moteur/bail';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PilulesChoix } from '@/components/choix';
import { BoutonPrincipal, CaseACocher, Champ, MessageErreur, MessageInfo } from '@/components/formulaire';
import { Icone } from '@/components/icones';
import { chargerDossierBail, enregistrerConditions, zoneTendueALaDate, type ConditionsBail, type DossierBail } from '@/lib/baux';
import { chargerEtatSignature, genererAnnexes, genererBail } from '@/lib/pdf/generer-bail';
import { LIBELLES_TYPE_BAIL, estColocation } from '@/lib/personnes';
import { formaterDateEnCours, lireDateFrancaise, lireEntier, lireNombre, versDateFrancaise, versTexteNombre } from '@/lib/saisie';
import { supabase } from '@/lib/supabase';
import { couleurs, polices } from '@/theme/tokens';

// Champs saisis au clavier : gardés en texte pendant la saisie, convertis à l'enregistrement.
const MONTANTS = [
  'loyer_hc', 'charges_montant', 'depot_garantie', 'precedent_loyer', 'assurance_montant_annuel',
  'contribution_montant', 'icc_indice',
] as const;
const ENTIERS = ['duree_mois', 'jour_paiement', 'preavis_mois', 'icc_annee', 'delai_restitution_jours'] as const;
const DATES = ['date_effet', 'date_revision', 'precedent_loyer_verse_le', 'precedent_revision_le'] as const;
type ChampTexte = (typeof MONTANTS)[number] | (typeof ENTIERS)[number] | (typeof DATES)[number];

const TRIMESTRES = [
  { valeur: '1', libelle: '1er' },
  { valeur: '2', libelle: '2e' },
  { valeur: '3', libelle: '3e' },
  { valeur: '4', libelle: '4e' },
] as const;

/**
 * Conditions du bail, rubrique par rubrique du contrat type (décret
 * n° 2015-587, version du 1er octobre 2026) ou du bail de garage. Les
 * contrôles de la matrice M-02 s'affichent au fil de la saisie.
 */
export default function EcranBail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dossier, setDossier] = useState<DossierBail | null | undefined>(undefined);
  const [b, setB] = useState<ConditionsBail | null>(null);
  const [textes, setTextes] = useState<Partial<Record<ChampTexte, string>>>({});
  const [servitude, setServitude] = useState(false);
  // Liste officielle des zones tendues applicable à la date de prise d'effet : [date, réponse].
  const [zoneOfficielle, setZoneOfficielle] = useState<[string, boolean | null] | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistre, setEnregistre] = useState(false);
  const [generation, setGeneration] = useState<'bail' | 'annexes' | null>(null);
  const [blocages, setBlocages] = useState<BlocageSignature[] | null>(null);
  const [messageGeneration, setMessageGeneration] = useState<string | null>(null);

  useEffect(() => {
    // Ce qui bloque l'envoi à la signature, affiché sous les boutons de génération.
    chargerEtatSignature(id).then((e) => setBlocages('blocages' in e ? e.blocages : null));
    chargerDossierBail(id).then((d) => {
      setDossier(d);
      if (!d) return;
      const aujourdhui = new Date().toISOString().slice(0, 10);
      // Trimestre de l'IRL proposé par défaut : le dernier publié à la signature (R-02).
      const signature = d.bail.date_effet && d.bail.date_effet < aujourdhui ? d.bail.date_effet : aujourdhui;
      const defaut = dernierIrlPublie(d.indicesIrl, signature);
      setB(d.bail.trimestre_irl || d.bail.clause_revision === false || !defaut ? d.bail : { ...d.bail, trimestre_irl: defaut.trimestre });
      setServitude(d.bien.servitude_residence_principale);
      const t: Partial<Record<ChampTexte, string>> = {};
      for (const k of MONTANTS) t[k] = versTexteNombre(d.bail[k]);
      for (const k of ENTIERS) t[k] = d.bail[k] === null ? '' : String(d.bail[k]);
      for (const k of DATES) t[k] = versDateFrancaise(d.bail[k]);
      // Durée proposée si elle n'est pas encore saisie.
      if (!t.duree_mois) {
        const proposee = dureeProposee(d.bail.type_bail, d.qualite, d.locataires.length > 0 && d.locataires.every((l) => l.etudiant));
        if (proposee) t.duree_mois = String(proposee);
      }
      setTextes(t);
    });
  }, [id]);

  // Valeurs converties, pour les contrôles en direct.
  const courant = useMemo(() => (b ? convertir(b, textes) : null), [b, textes]);

  // Zone tendue : liste applicable à la date de prise d'effet (R-09), recherchée à chaque changement de date.
  const dateEffet = courant?.valeurs.date_effet ?? null;
  const codeInsee = dossier?.bien.code_insee ?? null;
  useEffect(() => {
    if (!dateEffet) return;
    zoneTendueALaDate(codeInsee, dateEffet).then((z) => {
      setZoneOfficielle([dateEffet, z]);
      // Réponse proposée d'après la liste, tant que le bailleur n'a pas répondu.
      setB((actuel) => (actuel && actuel.soumis_evolution_relocation === null && z !== null ? { ...actuel, soumis_evolution_relocation: z } : actuel));
    });
  }, [dateEffet, codeInsee]);
  const zoneALaDate = zoneOfficielle && zoneOfficielle[0] === dateEffet ? zoneOfficielle[1] : null;

  const controles: Controle[] = useMemo(() => {
    if (!dossier || !courant || !dossier.parametresR03) return [];
    const liste = controlerBail({
      bail: courant.valeurs,
      bien: dossier.bien,
      qualite: dossier.qualite,
      locataires: {
        nombre: dossier.locataires.length,
        couple: courant.valeurs.locataires_couple,
        tousEtudiants: dossier.locataires.length > 0 && dossier.locataires.every((l) => l.etudiant),
      },
      parametresR03: dossier.parametresR03,
      zoneTendueOfficielle: zoneALaDate,
    });
    // Les formulations encore à valider ne s'affichent qu'en mode aperçu.
    return liste.filter((c) => !c.aValider || dossier.apercu);
  }, [dossier, courant, zoneALaDate]);

  if (dossier === null) {
    return (
      <SafeAreaView style={[styles.page, styles.contenu]}>
        <Text style={styles.aide}>Ce bail est introuvable.</Text>
      </SafeAreaView>
    );
  }
  if (!dossier || !b || !courant) return <View style={styles.page} />;

  const maj = <K extends keyof ConditionsBail>(cle: K, valeur: ConditionsBail[K]) => {
    setEnregistre(false);
    setB({ ...b, [cle]: valeur });
  };
  const champ = (cle: ChampTexte, format?: 'date') => ({
    value: textes[cle] ?? '',
    onChangeText: (t: string) => {
      setEnregistre(false);
      setTextes({ ...textes, [cle]: format === 'date' ? formaterDateEnCours(t) : t });
    },
    ...(format === 'date'
      ? { keyboardType: 'number-pad' as const, placeholder: 'JJ/MM/AAAA', maxLength: 10 }
      : { keyboardType: 'decimal-pad' as const }),
  });

  const type = b.type_bail;
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const irlDefaut = dernierIrlPublie(dossier.indicesIrl, dateEffet && dateEffet < aujourdhui ? dateEffet : aujourdhui);
  const habitation = type !== 'garage';
  const plusieurs = dossier.locataires.length > 1;
  const coloc = estColocation(dossier.locataires.length, b.locataires_couple);
  const plafond = dossier.parametresR03 ? plafondDepot(type, courant.valeurs.loyer_hc, dossier.parametresR03) : null;
  const minimum = type === 'nu' ? DUREES_MINIMALES.nu[dossier.qualite] : null;
  const dureeReduite = type === 'nu' && minimum !== null && courant.valeurs.duree_mois !== null && courant.valeurs.duree_mois < minimum;
  const textesOfficiels =
    habitation && courant.valeurs.date_effet
      ? {
          contrat: versionApplicable(CONTRATS_TYPES[type as 'nu' | 'meuble'], courant.valeurs.date_effet),
          notice: versionApplicable(NOTICES, courant.valeurs.date_effet),
        }
      : null;

  async function enregistrer() {
    if (!b || !courant || !dossier) return;
    setErreur(null);
    if (courant.erreurs.length) return setErreur(courant.erreurs[0]);
    setOccupe(true);
    const ok = await enregistrerConditions({
      ...b,
      ...courant.valeurs,
      modele_version: textesOfficiels?.contrat?.version ?? b.modele_version,
      notice_version: textesOfficiels?.notice?.version ?? b.notice_version,
    });
    const okBien =
      servitude === dossier.bien.servitude_residence_principale ||
      !(await supabase.from('biens').update({ servitude_residence_principale: servitude }).eq('id', dossier.bien.id)).error;
    setOccupe(false);
    if (!ok || !okBien) return setErreur('L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.');
    setEnregistre(true);
  }

  async function generer(quoi: 'bail' | 'annexes') {
    setMessageGeneration(null);
    setErreur(null);
    // On enregistre d'abord, pour que le PDF reprenne exactement ce qui est affiché.
    await enregistrer();
    if (courant?.erreurs.length) return;
    setGeneration(quoi);
    try {
      setMessageGeneration(await (quoi === 'bail' ? genererBail(id) : genererAnnexes(id)));
      actualiserBlocages();
    } catch {
      setErreur('Le PDF n’a pas pu être créé. Réessayez dans un instant.');
    } finally {
      setGeneration(null);
    }
  }

  function actualiserBlocages() {
    chargerEtatSignature(id).then((e) => setBlocages('blocages' in e ? e.blocages : null));
  }

  const revenir = () => (router.canGoBack() ? router.back() : router.replace(`/bien/${dossier.bien.id}` as Href));

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          <Pressable onPress={revenir} style={styles.retour} accessibilityRole="button" accessibilityLabel="Retour">
            <Icone nom="retour" couleur={couleurs.pin} taille={20} epaisseur={2} />
          </Pressable>
          <Text style={styles.legende}>
            BAIL · BIEN N° {String(dossier.bien.numero).padStart(2, '0')}
            {dossier.bien.commune ? ` · ${dossier.bien.commune.toUpperCase()}` : ''}
          </Text>
          <Text style={styles.titre} accessibilityRole="header">
            Conditions du bail
          </Text>
          {b.origine === 'existant' ? (
            <MessageInfo>
              Bail signé avant Baillome : reportez ici ses conditions, telles qu’elles figurent sur votre exemplaire.
            </MessageInfo>
          ) : null}

          <Text style={styles.question}>Type de location</Text>
          <PilulesChoix
            libelleGroupe="Type de location"
            valeur={type}
            onChange={(v) => maj('type_bail', v)}
            options={(Object.keys(LIBELLES_TYPE_BAIL) as (keyof typeof LIBELLES_TYPE_BAIL)[]).map((v) => ({
              valeur: v,
              libelle: LIBELLES_TYPE_BAIL[v],
            }))}
          />

          {habitation ? (
            <Section numero="II" titre="Destination">
              <CaseACocher
                cochee={servitude}
                onChange={(v) => {
                  setEnregistre(false);
                  setServitude(v);
                }}
                libelleAccessible="Logement soumis à une servitude de résidence principale">
                Le logement est soumis à une servitude de résidence principale (code de l’urbanisme, article L. 151-14-1)
              </CaseACocher>
            </Section>
          ) : null}

          <Section numero="III" titre="Date de prise d’effet et durée">
            <Champ libelle="Date de prise d’effet" {...champ('date_effet', 'date')} />
            <Champ
              libelle="Durée (en mois)"
              {...champ('duree_mois')}
              keyboardType="number-pad"
              aide={
                type === 'nu'
                  ? `Au moins ${DUREES_MINIMALES.nu[dossier.qualite] / 12} ans pour votre bail (${
                      dossier.qualite === 'personne_physique' ? 'bailleur particulier, indivision ou SCI familiale' : 'société'
                    }).`
                  : type === 'meuble'
                    ? 'Au moins 1 an, ou 9 mois pour un étudiant.'
                    : 'Durée libre ; le bail se renouvelle ensuite pour la même durée.'
              }
            />
            {dureeReduite && dossier.qualite === 'personne_physique' ? (
              <Champ
                libelle="Événement justifiant la durée réduite"
                value={b.motif_duree_reduite ?? ''}
                onChangeText={(t) => maj('motif_duree_reduite', t || null)}
                multiline
                aide="Raisons professionnelles ou familiales précises qui justifient que vous repreniez le logement."
              />
            ) : null}
          </Section>

          <Section numero="IV" titre="Loyer">
            <Champ libelle={`Loyer ${b.periodicite === 'trimestrielle' ? 'trimestriel' : 'mensuel'} hors charges (€)`} {...champ('loyer_hc')} />
            {habitation ? (
              <>
                <Text style={styles.question}>Logement en zone tendue, soumis au plafond d’évolution du loyer à la relocation ?</Text>
                <OuiNon valeur={b.soumis_evolution_relocation} onChange={(v) => maj('soumis_evolution_relocation', v)} />
                {dateEffet ? (
                  <Text style={styles.aide}>
                    {zoneALaDate === null
                      ? 'Baillome ne dispose pas de la liste officielle applicable à cette date : vérifiez vous-même.'
                      : `D’après la liste officielle applicable au ${versDateFrancaise(dateEffet)} (${
                          dateEffet < '2027-01-01' ? 'décret n° 2013-392' : 'décret n° 2026-831'
                        }), ${dossier.bien.commune ?? 'la commune'} ${zoneALaDate ? 'figure' : 'ne figure pas'} parmi les communes concernées.`}
                  </Text>
                ) : null}
                <Text style={styles.sousTitre}>Loyer du précédent locataire</Text>
                <Text style={styles.aide}>À indiquer s’il a quitté le logement moins de dix-huit mois avant la signature.</Text>
                <Champ libelle="Dernier loyer acquitté (€)" {...champ('precedent_loyer')} />
                <Champ libelle="Date de versement" {...champ('precedent_loyer_verse_le', 'date')} />
                <Champ libelle="Date de sa dernière révision" {...champ('precedent_revision_le', 'date')} />
              </>
            ) : null}

            <Text style={styles.sousTitre}>Révision</Text>
            <Text style={styles.question}>
              {habitation ? 'Le bail prévoit-il la révision annuelle du loyer ?' : 'Révision annuelle selon l’indice du coût de la construction ?'}
            </Text>
            <OuiNon valeur={b.clause_revision} onChange={(v) => maj('clause_revision', v)} />
            {b.clause_revision && habitation ? (
              <>
                <Text style={styles.question}>Trimestre de référence de l’IRL</Text>
                <PilulesChoix
                  libelleGroupe="Trimestre de référence de l’IRL"
                  valeur={b.trimestre_irl ? (String(b.trimestre_irl) as '1' | '2' | '3' | '4') : null}
                  onChange={(v) => maj('trimestre_irl', Number(v))}
                  options={[...TRIMESTRES]}
                />
                {irlDefaut ? (
                  <Text style={styles.aide}>
                    {`Par défaut, le dernier indice publié à la signature : ${TRIMESTRES[irlDefaut.trimestre - 1].libelle} trimestre ${irlDefaut.annee} (paru le ${versDateFrancaise(irlDefaut.parution_jo)}). Vous pouvez en choisir un autre si votre bail le prévoit.`}
                  </Text>
                ) : null}
                <Champ
                  libelle="Date de révision (facultatif)"
                  {...champ('date_revision', 'date')}
                  aide="Laissez vide pour réviser à la date anniversaire du bail."
                />
              </>
            ) : null}
            {b.clause_revision && !habitation ? (
              <>
                <Text style={styles.question}>Trimestre de l’indice de référence</Text>
                <PilulesChoix
                  libelleGroupe="Trimestre de l’indice du coût de la construction"
                  valeur={b.icc_trimestre ? (String(b.icc_trimestre) as '1' | '2' | '3' | '4') : null}
                  onChange={(v) => maj('icc_trimestre', Number(v))}
                  options={[...TRIMESTRES]}
                />
                <Champ libelle="Année de l’indice de référence" {...champ('icc_annee')} keyboardType="number-pad" maxLength={4} />
                <Champ libelle="Valeur de l’indice de référence" {...champ('icc_indice')} />
              </>
            ) : null}
          </Section>

          <Section numero="IV" titre="Charges et paiement">
            {habitation ? (
              <>
                <Text style={styles.question}>Modalité de règlement des charges</Text>
                <PilulesChoix
                  libelleGroupe="Modalité de règlement des charges"
                  valeur={b.mode_charges}
                  onChange={(v) => maj('mode_charges', v)}
                  options={[
                    { valeur: 'provisions', libelle: 'Provisions, régularisées chaque année' },
                    { valeur: 'periodique', libelle: 'Paiement périodique sans provision' },
                    ...(type === 'meuble' || coloc ? [{ valeur: 'forfait' as const, libelle: 'Forfait de charges' }] : []),
                  ]}
                />
              </>
            ) : null}
            <Champ
              libelle={b.mode_charges === 'forfait' ? 'Forfait de charges (€)' : habitation ? 'Provisions sur charges (€)' : 'Charges éventuelles (€)'}
              {...champ('charges_montant')}
            />
            <Text style={styles.question}>Périodicité</Text>
            <PilulesChoix
              libelleGroupe="Périodicité du paiement"
              valeur={b.periodicite}
              onChange={(v) => maj('periodicite', v)}
              options={[
                { valeur: 'mensuelle', libelle: 'Chaque mois' },
                { valeur: 'trimestrielle', libelle: 'Chaque trimestre' },
              ]}
            />
            {habitation ? <Text style={styles.aide}>Le locataire peut toujours demander à payer chaque mois.</Text> : null}
            <Text style={styles.question}>Paiement</Text>
            <PilulesChoix
              libelleGroupe="Paiement à échoir ou à terme échu"
              valeur={b.terme}
              onChange={(v) => maj('terme', v)}
              options={[
                { valeur: 'a_echoir', libelle: 'D’avance (à échoir)' },
                { valeur: 'echu', libelle: 'À terme échu' },
              ]}
            />
            <Champ libelle="Jour de paiement" {...champ('jour_paiement')} keyboardType="number-pad" maxLength={2} placeholder="5" />
          </Section>

          <Section numero="VI" titre="Dépôt de garantie">
            <Champ
              libelle="Montant (€)"
              {...champ('depot_garantie')}
              aide={
                plafond !== null
                  ? `Au plus ${versTexteNombre(plafond)} € (${type === 'meuble' ? 'deux mois' : 'un mois'} de loyer hors charges).`
                  : 'Montant librement convenu pour un garage.'
              }
            />
            {!habitation ? (
              <Champ
                libelle="Délai de restitution (jours)"
                {...champ('delai_restitution_jours')}
                keyboardType="number-pad"
                aide="Délai fixé par le contrat, à compter de la remise des moyens d’accès."
              />
            ) : null}
          </Section>

          {habitation && plusieurs ? (
            <Section numero="VII" titre="Plusieurs locataires">
              <CaseACocher
                cochee={!!b.clause_solidarite}
                onChange={(v) => maj('clause_solidarite', v)}
                libelleAccessible="Clause de solidarité">
                Clause de solidarité des locataires et d’indivisibilité de leurs obligations
              </CaseACocher>
              {coloc ? (
                <>
                  <CaseACocher
                    cochee={b.assurance_pour_compte}
                    onChange={(v) => maj('assurance_pour_compte', v)}
                    libelleAccessible="J’assure pour le compte de mes colocataires">
                    J’assure pour le compte de mes colocataires
                  </CaseACocher>
                  {b.assurance_pour_compte ? (
                    <Champ
                      libelle="Prime annuelle récupérable (€)"
                      {...champ('assurance_montant_annuel')}
                      aide={
                        courant.valeurs.assurance_montant_annuel
                          ? `Soit ${versTexteNombre(Math.round((courant.valeurs.assurance_montant_annuel / 12) * 100) / 100)} € par mois.`
                          : undefined
                      }
                    />
                  ) : null}
                </>
              ) : null}
            </Section>
          ) : null}

          {habitation ? (
            <Section numero="VIII" titre="Clause résolutoire">
              <Text style={styles.aide}>
                Le bail reprend la clause obligatoire du contrat type : résiliation de plein droit pour défaut de paiement du loyer
                ou des charges, ou de versement du dépôt de garantie, six semaines après un commandement de payer resté sans effet.
              </Text>
              <Text style={styles.question}>Clauses facultatives</Text>
              <CaseACocher
                cochee={b.clause_resiliation_assurance}
                onChange={(v) => maj('clause_resiliation_assurance', v)}
                libelleAccessible="Résiliation pour défaut d’assurance">
                Défaut d’assurance des risques locatifs (un mois après commandement resté sans effet)
              </CaseACocher>
              <CaseACocher
                cochee={b.clause_resiliation_troubles}
                onChange={(v) => maj('clause_resiliation_troubles', v)}
                libelleAccessible="Résiliation pour troubles de voisinage">
                Troubles de voisinage constatés par une décision de justice passée en force de chose jugée
              </CaseACocher>
              {servitude ? (
                <Text style={styles.aide}>
                  Servitude de résidence principale : la clause de résiliation pour non-occupation à titre de résidence principale
                  sera ajoutée.
                </Text>
              ) : null}
              <Text style={styles.aValider}>RÉDACTION DES CLAUSES FACULTATIVES À VALIDER PAR L’AVOCAT</Text>
            </Section>
          ) : (
            <Section numero="" titre="Usage et fin du bail">
              <Champ libelle="Véhicule stationné" value={b.vehicule ?? ''} onChangeText={(t) => maj('vehicule', t || null)} />
              <CaseACocher
                cochee={!!b.rangement_autorise}
                onChange={(v) => maj('rangement_autorise', v)}
                libelleAccessible="Rangement d’objets personnels autorisé">
                Rangement d’objets personnels autorisé
              </CaseACocher>
              <Champ libelle="Préavis (en mois)" {...champ('preavis_mois')} keyboardType="number-pad" placeholder="1" />
              <Text style={styles.aValider}>BAIL DE GARAGE : RÉDACTION À VALIDER PAR L’AVOCAT</Text>
            </Section>
          )}

          <Section numero="X" titre="Autres conditions particulières">
            <Champ
              libelle="Conditions particulières (facultatif)"
              value={b.conditions_particulieres ?? ''}
              onChangeText={(t) => maj('conditions_particulieres', t || null)}
              multiline
            />
          </Section>

          <Section numero="" titre="Signature électronique">
            <Champ
              libelle="Lieu de signature"
              value={b.lieu_signature ?? ''}
              onChangeText={(t) => maj('lieu_signature', t || null)}
              placeholder={dossier.bien.commune ?? 'Ville'}
              aide="La date sera celle de la signature électronique."
            />
            <PilulesChoix
              libelleGroupe="Niveau de signature"
              valeur={b.niveau_signature}
              onChange={(v) => maj('niveau_signature', v)}
              options={[
                { valeur: 'avancee', libelle: 'Avancée (par défaut)' },
                { valeur: 'qualifiee', libelle: 'Qualifiée' },
              ]}
            />
          </Section>

          {textesOfficiels ? (
            <Text style={styles.trace}>
              {textesOfficiels.contrat
                ? `Contrat type en vigueur depuis le ${versDateFrancaise(textesOfficiels.contrat.depuis)}`
                : 'Bail antérieur au 1er octobre 2026 : ancien contrat type'}
              {' · '}
              {textesOfficiels.notice
                ? `notice d’information en vigueur depuis le ${versDateFrancaise(textesOfficiels.notice.depuis)}`
                : 'notice antérieure au 18 octobre 2026'}
            </Text>
          ) : null}

          {controles.length ? <Text style={styles.sousTitre}>Avant de finaliser</Text> : null}
          {controles.map((c) => (
            <CarteControle key={c.code} controle={c} />
          ))}

          <MessageErreur message={erreur} />
          {enregistre ? <MessageInfo>Conditions enregistrées.</MessageInfo> : null}
          <BoutonPrincipal libelle="Enregistrer" onPress={enregistrer} occupe={occupe} />
          {habitation ? (
            <>
              <Pressable
                onPress={() => generer('bail')}
                disabled={generation !== null}
                style={({ pressed }) => [styles.boutonPdf, pressed && styles.appuye]}
                accessibilityRole="button">
                <Icone nom="document" couleur={couleurs.pin} taille={18} epaisseur={1.9} />
                <Text style={styles.boutonPdfTexte}>{generation === 'bail' ? 'Création du bail…' : 'Générer le bail'}</Text>
              </Pressable>
              <Pressable
                onPress={() => generer('annexes')}
                disabled={generation !== null}
                style={({ pressed }) => [styles.boutonPdf, pressed && styles.appuye]}
                accessibilityRole="button">
                <Icone nom="document" couleur={couleurs.pin} taille={18} epaisseur={1.9} />
                <Text style={styles.boutonPdfTexte}>{generation === 'annexes' ? 'Création des annexes…' : 'Générer les annexes'}</Text>
              </Pressable>
              <Text style={styles.aide}>
                Projet à relire, non signé. Les annexes réunissent en un seul PDF le règlement de copropriété et les diagnostics rangés
                dans le coffre, puis la notice d’information.
              </Text>
              {messageGeneration ? <MessageInfo>{messageGeneration}</MessageInfo> : null}
              {blocages ? (
                blocages.length ? (
                  <View style={styles.blocages}>
                    <Text style={styles.titreBlocages}>Avant l’envoi à la signature</Text>
                    {blocages.map((b) => (
                      <Text key={b.code} style={styles.ligneBlocage}>
                        • {b.libelle}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <MessageInfo>Rien n’empêche l’envoi à la signature.</MessageInfo>
                )
              ) : null}
            </>
          ) : null}
          <View style={styles.bas} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Convertit les saisies ; renvoie aussi les erreurs de format. */
function convertir(b: ConditionsBail, textes: Partial<Record<ChampTexte, string>>) {
  const erreurs: string[] = [];
  const valeurs = { ...b };
  for (const k of MONTANTS) {
    const t = textes[k] ?? '';
    const n = lireNombre(t);
    if (t.trim() && n === null) erreurs.push('Un montant n’est pas valide : utilisez des chiffres, avec une virgule pour les centimes.');
    valeurs[k] = n;
  }
  for (const k of ENTIERS) {
    const t = textes[k] ?? '';
    const n = lireEntier(t);
    if (t.trim() && n === null) erreurs.push('Une durée ou un jour n’est pas valide : utilisez uniquement des chiffres.');
    valeurs[k] = n;
  }
  for (const k of DATES) {
    const t = textes[k] ?? '';
    const d = lireDateFrancaise(t);
    if (t.trim() && !d) erreurs.push('Une date n’est pas valide : utilisez le format JJ/MM/AAAA.');
    valeurs[k] = d;
  }
  if (valeurs.jour_paiement !== null && (valeurs.jour_paiement < 1 || valeurs.jour_paiement > 31)) {
    erreurs.push('Le jour de paiement doit être compris entre 1 et 31.');
  }
  if (valeurs.statut === 'en_cours' && !valeurs.date_effet) erreurs.push('Indiquez la date de prise d’effet du bail.');
  return { valeurs, erreurs };
}

function Section({ numero, titre, children }: { numero: string; titre: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.enteteSection}>
        {numero ? <Text style={styles.numero}>{numero}</Text> : null}
        <Text style={styles.titreSection}>{titre}</Text>
      </View>
      {children}
    </View>
  );
}

function OuiNon({ valeur, onChange }: { valeur: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <PilulesChoix
      libelleGroupe="Oui ou non"
      valeur={valeur === null ? null : valeur ? 'oui' : 'non'}
      onChange={(v) => onChange(v === 'oui')}
      options={[
        { valeur: 'oui', libelle: 'Oui' },
        { valeur: 'non', libelle: 'Non' },
      ]}
    />
  );
}

function CarteControle({ controle }: { controle: Controle }) {
  const fond =
    controle.niveau === 'bloquant' ? couleurs.corail : controle.niveau === 'avertissement' ? couleurs.miel : couleurs.menthe;
  const texte =
    controle.niveau === 'bloquant' ? couleurs.texteCorail : controle.niveau === 'avertissement' ? couleurs.texteMiel : couleurs.texteMenthe;
  return (
    <View style={[styles.controle, { backgroundColor: fond }]} accessibilityRole="alert">
      <Text style={[styles.niveau, { color: texte }]}>
        {controle.niveau === 'bloquant' ? 'À CORRIGER' : controle.niveau === 'avertissement' ? 'À VÉRIFIER' : 'BON À SAVOIR'}
        {' · '}
        {controle.source.toUpperCase()}
      </Text>
      <Text style={styles.controleTexte}>{controle.message}</Text>
      {controle.aValider ? <Text style={styles.aValider}>FORMULATION À VALIDER · APERÇU</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { flexGrow: 1, padding: 22, gap: 14 },
  retour: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legende: { fontFamily: polices.technique, fontSize: 10.5, letterSpacing: 0.63, color: couleurs.texteDiscret },
  titre: { fontFamily: polices.titreFort, fontSize: 28, letterSpacing: -1.1, lineHeight: 30, color: couleurs.texte },
  section: { marginTop: 8, paddingTop: 16, gap: 12, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: couleurs.pointilles },
  enteteSection: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  numero: { fontFamily: polices.titreFort, fontSize: 22, color: couleurs.pin },
  titreSection: { flex: 1, fontFamily: polices.titre, fontSize: 19, letterSpacing: -0.4, color: couleurs.texte },
  sousTitre: { marginTop: 6, fontFamily: polices.titre, fontSize: 17, letterSpacing: -0.3, color: couleurs.texte },
  question: { fontFamily: polices.interfaceGras, fontSize: 14.5, lineHeight: 20, color: couleurs.texte },
  aide: { fontFamily: polices.interface, fontSize: 13, lineHeight: 19, color: couleurs.texteSecondaire },
  aValider: { fontFamily: polices.techniqueGras, fontSize: 10, letterSpacing: 0.5, color: couleurs.texteMiel },
  trace: { fontFamily: polices.technique, fontSize: 10.5, lineHeight: 15, color: couleurs.texteDiscret },
  controle: { borderRadius: 20, padding: 14, gap: 6 },
  niveau: { fontFamily: polices.techniqueGras, fontSize: 10.5, letterSpacing: 0.5 },
  controleTexte: { fontFamily: polices.interface, fontSize: 13.5, lineHeight: 19, color: couleurs.texte },
  boutonPdf: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  boutonPdfTexte: { fontFamily: polices.interfaceGras, fontSize: 15, color: couleurs.pin },
  appuye: { opacity: 0.85 },
  blocages: { borderRadius: 20, padding: 14, gap: 6, backgroundColor: couleurs.corail },
  titreBlocages: { fontFamily: polices.techniqueGras, fontSize: 10.5, letterSpacing: 0.5, color: couleurs.texteCorail },
  ligneBlocage: { fontFamily: polices.interface, fontSize: 13.5, lineHeight: 19, color: couleurs.texte },
  bas: { height: 24 },
});
