import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ChampAdresse } from '@/components/champ-adresse';
import { PilulesChoix, PilulesMultiples, SelecteurDpe } from '@/components/choix';
import { BoutonPrincipal, CaseACocher, Champ, MessageErreur, MessageInfo } from '@/components/formulaire';
import { question } from '@moteur/questions';
import type { Adresse } from '@/lib/adresse';
import type { Bien, Fiche } from '@/lib/biens';
import { estMeuble } from '@/lib/completude';
import { EQUIPEMENTS_CUISINE, EQUIPEMENTS_SALLE_EAU, WC, phraseEquipements } from '@/lib/equipements';
import {
  estDansLeFutur,
  formaterDateEnCours,
  lireDateFrancaise,
  lireEntier,
  lireNombre,
  versDateFrancaise,
  versTexteNombre,
} from '@/lib/saisie';
import { supabase } from '@/lib/supabase';
import { couleurs, polices, type ClasseDpe } from '@/theme/tokens';

type PropsRubrique = { fiche: Fiche; onEnregistre: () => Promise<void> };

const ERREUR_RESEAU = 'L’enregistrement n’a pas abouti. Vérifiez votre connexion et réessayez.';

/** Enregistre des champs du bien et signale le résultat. */
function useEnregistrement(id: string, onEnregistre: () => Promise<void>) {
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function enregistrer(champs: Partial<Bien>) {
    setErreur(null);
    setOk(false);
    setOccupe(true);
    const { error } = await supabase.from('biens').update(champs).eq('id', id);
    setOccupe(false);
    if (error) return setErreur(error.message.includes('identifiant_fiscal') ? 'L’identifiant fiscal doit comporter 12 chiffres.' : ERREUR_RESEAU);
    setOk(true);
    await onEnregistre();
  }
  return { occupe, erreur, setErreur, ok, enregistrer };
}

function Libelle({ children }: { children: string }) {
  return <Text style={styles.libelle}>{children.toUpperCase()}</Text>;
}

function Confirmation({ visible }: { visible: boolean }) {
  return visible ? <MessageInfo>Enregistré.</MessageInfo> : null;
}

/** Lit une date facultative ; renvoie « undefined » si la saisie est invalide. */
function lireDateFacultative(texte: string, setErreur: (m: string) => void, nom: string, passeeSeulement = true) {
  if (!texte.trim()) return null;
  const iso = lireDateFrancaise(texte);
  if (!iso) {
    setErreur(`${nom} : utilisez le format JJ/MM/AAAA.`);
    return undefined;
  }
  if (passeeSeulement && estDansLeFutur(iso)) {
    setErreur(`${nom} ne peut pas être dans le futur.`);
    return undefined;
  }
  return iso;
}

// ---------------------------------------------------------------------
// Identité du bien
// ---------------------------------------------------------------------

const PERIODES = [
  { valeur: 'avant_1949', libelle: 'Avant 1949' },
  { valeur: '1949_1974', libelle: '1949 à 1974' },
  { valeur: '1975_1989', libelle: '1975 à 1989' },
  { valeur: '1989_2005', libelle: '1989 à 2005' },
  { valeur: 'depuis_2005', libelle: 'Depuis 2005' },
];

export function RubriqueIdentite({ fiche, onEnregistre }: PropsRubrique) {
  const b = fiche.bien;
  const { occupe, erreur, setErreur, ok, enregistrer } = useEnregistrement(b.id, onEnregistre);
  const [adresse, setAdresse] = useState<Adresse | null>(
    b.adresse && b.code_insee
      ? {
          libelle: `${b.adresse} ${b.code_postal ?? ''} ${b.commune ?? ''}`.trim(),
          voie: b.adresse,
          codePostal: b.code_postal ?? '',
          commune: b.commune ?? '',
          codeInsee: b.code_insee,
          latitude: b.latitude ?? 0,
          longitude: b.longitude ?? 0,
        }
      : null,
  );
  const [batiment, setBatiment] = useState(b.batiment ?? '');
  const [etage, setEtage] = useState(b.etage ?? '');
  const [porte, setPorte] = useState(b.porte ?? '');
  const [fiscal, setFiscal] = useState(b.identifiant_fiscal ?? '');
  const [aideFiscal, setAideFiscal] = useState(false);
  const [habitat, setHabitat] = useState(b.type_habitat);
  const [regime, setRegime] = useState(b.regime_juridique);
  const [periode, setPeriode] = useState(b.periode_construction);
  const [entite, setEntite] = useState(b.entite_id);
  const [partiesCommunes, setPartiesCommunes] = useState(b.parties_communes ?? '');
  const logement = b.type_bien !== 'garage';

  function valider() {
    const id = fiscal.replace(/\s/g, '');
    if (id && !/^\d{12}$/.test(id)) return setErreur('L’identifiant fiscal doit comporter 12 chiffres.');
    if (!adresse) return setErreur('Choisissez l’adresse dans la liste proposée.');
    enregistrer({
      adresse: adresse.voie,
      code_postal: adresse.codePostal,
      commune: adresse.commune,
      code_insee: adresse.codeInsee,
      latitude: adresse.latitude,
      longitude: adresse.longitude,
      batiment: batiment.trim() || null,
      etage: etage.trim() || null,
      porte: porte.trim() || null,
      identifiant_fiscal: id || null,
      type_habitat: logement ? habitat : null,
      regime_juridique: regime,
      parties_communes: logement && (regime === 'copropriete' || habitat === 'collectif') ? partiesCommunes.trim() || null : null,
      periode_construction: logement ? periode : null,
      entite_id: entite,
    });
  }

  return (
    <View style={styles.rubrique}>
      <ChampAdresse adresse={adresse} onChange={setAdresse} />
      <View style={styles.troisColonnes}>
        <View style={styles.colonne}>
          <Champ libelle="Bâtiment" value={batiment} onChangeText={setBatiment} />
        </View>
        <View style={styles.colonne}>
          <Champ libelle="Étage" value={etage} onChangeText={setEtage} />
        </View>
        <View style={styles.colonne}>
          <Champ libelle="Porte" value={porte} onChangeText={setPorte} />
        </View>
      </View>

      <Champ
        libelle="Identifiant fiscal du logement"
        value={fiscal}
        onChangeText={(t) => setFiscal(t.replace(/[^\d\s]/g, ''))}
        keyboardType="number-pad"
        placeholder="12 chiffres"
        maxLength={15}
        aide="Il commence par le numéro du département."
      />
      <Pressable onPress={() => setAideFiscal(!aideFiscal)} accessibilityRole="button">
        <Text style={styles.lien}>Où le trouver ? {aideFiscal ? '↑' : '→'}</Text>
      </Pressable>
      {aideFiscal ? (
        <MessageInfo>
          Sur impots.gouv.fr, dans votre espace particulier, rubrique « Biens immobiliers ». Choisissez le
          local d’habitation, et non une annexe (cave, parking).
        </MessageInfo>
      ) : null}

      {logement ? (
        <View style={styles.bloc}>
          <Libelle>Type d’habitat</Libelle>
          <PilulesChoix
            libelleGroupe="Type d’habitat"
            valeur={habitat}
            onChange={setHabitat}
            options={[
              { valeur: 'collectif', libelle: 'Immeuble collectif' },
              { valeur: 'individuel', libelle: 'Individuel' },
            ]}
          />
        </View>
      ) : null}

      <View style={styles.bloc}>
        <Libelle>Régime juridique</Libelle>
        <PilulesChoix
          libelleGroupe="Régime juridique"
          valeur={regime}
          onChange={setRegime}
          options={[
            { valeur: 'mono_propriete', libelle: 'Mono propriété' },
            { valeur: 'copropriete', libelle: 'Copropriété' },
          ]}
        />
      </View>
      {logement && (regime === 'copropriete' || habitat === 'collectif') ? (
        <Champ
          libelle="Parties et équipements communs"
          value={partiesCommunes}
          onChangeText={setPartiesCommunes}
          multiline
          placeholder="Ascenseur, local vélos, espaces verts, interphone… ou « Néant »"
          aide="Repris au bail (contrat type, II. D). Écrivez « Néant » s’il n’y en a aucun."
        />
      ) : null}

      {logement ? (
        <View style={styles.bloc}>
          <Libelle>Période de construction</Libelle>
          <PilulesChoix libelleGroupe="Période de construction" valeur={periode} onChange={setPeriode} options={PERIODES} />
        </View>
      ) : null}

      {fiche.entites.length > 1 ? (
        <View style={styles.bloc}>
          <Libelle>Propriétaire</Libelle>
          <PilulesChoix
            libelleGroupe="Entité propriétaire"
            valeur={entite}
            onChange={setEntite}
            options={fiche.entites.map((e) => ({ valeur: e.id, libelle: e.nom }))}
          />
        </View>
      ) : null}

      <MessageErreur message={erreur} />
      <Confirmation visible={ok} />
      <BoutonPrincipal libelle="Enregistrer" onPress={valider} occupe={occupe} />
    </View>
  );
}

// ---------------------------------------------------------------------
// Surfaces et pièces, locaux accessoires
// ---------------------------------------------------------------------

const AUTRES_PARTIES = [
  { valeur: 'grenier', libelle: 'Grenier' },
  { valeur: 'combles', libelle: 'Combles' },
  { valeur: 'terrasse', libelle: 'Terrasse' },
  { valeur: 'balcon', libelle: 'Balcon' },
  { valeur: 'loggia', libelle: 'Loggia' },
  { valeur: 'jardin', libelle: 'Jardin' },
  { valeur: 'aucune', libelle: 'Aucune' },
];

const TYPES_LOCAL = [
  { valeur: 'cave', libelle: 'Cave' },
  { valeur: 'parking', libelle: 'Parking' },
  { valeur: 'garage', libelle: 'Garage' },
  { valeur: 'autre', libelle: 'Autre' },
];

export function RubriqueSurfaces({ fiche, onEnregistre }: PropsRubrique) {
  const b = fiche.bien;
  const { occupe, erreur, setErreur, ok, enregistrer } = useEnregistrement(b.id, onEnregistre);
  const [surface, setSurface] = useState(versTexteNombre(b.surface_habitable));
  const [pieces, setPieces] = useState(b.pieces_principales?.toString() ?? '');
  const [hauteur, setHauteur] = useState(versTexteNombre(b.hauteur_sous_plafond));
  const [grandePiece, setGrandePiece] = useState(versTexteNombre(b.surface_piece_principale));
  const [parties, setParties] = useState<string[]>(b.autres_parties);

  function choisirParties(v: string[]) {
    // « Aucune » exclut les autres choix, et inversement.
    const ajoute = v.find((x) => !parties.includes(x));
    if (ajoute === 'aucune') setParties(['aucune']);
    else setParties(v.filter((x) => x !== 'aucune'));
  }

  function valider() {
    const s = surface.trim() ? lireNombre(surface) : null;
    if (surface.trim() && !s) return setErreur('La surface doit être un nombre, par exemple 48,5.');
    const p = pieces.trim() ? lireEntier(pieces) : null;
    if (pieces.trim() && p === null) return setErreur('Le nombre de pièces doit être un nombre entier.');
    const h = hauteur.trim() ? lireNombre(hauteur) : null;
    if (hauteur.trim() && !h) return setErreur('La hauteur sous plafond doit être un nombre, par exemple 2,50.');
    const gp = grandePiece.trim() ? lireNombre(grandePiece) : null;
    if (grandePiece.trim() && !gp) return setErreur('La surface de la plus grande pièce doit être un nombre, par exemple 12,5.');
    enregistrer({ surface_habitable: s, pieces_principales: p, hauteur_sous_plafond: h, surface_piece_principale: gp, autres_parties: parties });
  }

  return (
    <View style={styles.rubrique}>
      <View style={styles.troisColonnes}>
        <View style={styles.colonne}>
          <Champ libelle="Surface (m²)" value={surface} onChangeText={setSurface} keyboardType="decimal-pad" />
        </View>
        <View style={styles.colonne}>
          <Champ libelle="Pièces princ." value={pieces} onChangeText={setPieces} keyboardType="number-pad" />
        </View>
        <View style={styles.colonne}>
          <Champ libelle="Hauteur (m)" value={hauteur} onChangeText={setHauteur} keyboardType="decimal-pad" />
        </View>
      </View>
      <Champ
        libelle="Plus grande pièce principale (m²)"
        value={grandePiece}
        onChangeText={setGrandePiece}
        keyboardType="decimal-pad"
        aide="Sert à vérifier la surface minimale de décence."
      />
      <View style={styles.bloc}>
        <Libelle>Autres parties du logement</Libelle>
        <PilulesMultiples
          libelleGroupe="Autres parties du logement"
          valeurs={parties}
          onChange={choisirParties}
          options={AUTRES_PARTIES}
        />
      </View>
      <MessageErreur message={erreur} />
      <Confirmation visible={ok} />
      <BoutonPrincipal libelle="Enregistrer" onPress={valider} occupe={occupe} />

      <LocauxAccessoires fiche={fiche} onEnregistre={onEnregistre} />
    </View>
  );
}

function LocauxAccessoires({ fiche, onEnregistre }: PropsRubrique) {
  const [type, setType] = useState<string | null>(null);
  const [lot, setLot] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  async function ajouter() {
    if (!type) return setErreur('Choisissez le type de local.');
    const { error } = await supabase
      .from('locaux_accessoires')
      .insert({ bien_id: fiche.bien.id, type, numero_lot: lot.trim() || null });
    if (error) return setErreur(ERREUR_RESEAU);
    setType(null);
    setLot('');
    setErreur(null);
    await onEnregistre();
  }

  async function retirer(id: string) {
    await supabase.from('locaux_accessoires').delete().eq('id', id);
    await onEnregistre();
  }

  return (
    <View style={[styles.bloc, styles.separation]}>
      <Text style={styles.sousTitre}>Locaux accessoires privatifs</Text>
      <Text style={styles.texte}>
        Un garage loué avec le logement, par le même bailleur, fait partie du bail d’habitation{'\u202F'}:
        renseignez-le ici, et non comme un bien à part.
      </Text>
      {fiche.locaux.map((l) => (
        <View key={l.id} style={styles.ligneListe}>
          <Text style={styles.ligneTexte}>
            {TYPES_LOCAL.find((t) => t.valeur === l.type)?.libelle}
            {l.numero_lot ? ` · lot n° ${l.numero_lot}` : ''}
          </Text>
          <Pressable onPress={() => retirer(l.id)} accessibilityRole="button" accessibilityLabel="Retirer ce local">
            <Text style={styles.lien}>Retirer</Text>
          </Pressable>
        </View>
      ))}
      <PilulesChoix libelleGroupe="Type de local" valeur={type} onChange={setType} options={TYPES_LOCAL} />
      <Champ libelle="Numéro de lot (facultatif)" value={lot} onChangeText={setLot} />
      <MessageErreur message={erreur} />
      <Pressable onPress={ajouter} style={styles.boutonSecondaire} accessibilityRole="button">
        <Text style={styles.boutonSecondaireTexte}>+ Ajouter ce local</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------
// Énergie
// ---------------------------------------------------------------------

export function RubriqueEnergie({ fiche, onEnregistre }: PropsRubrique) {
  const b = fiche.bien;
  const { occupe, erreur, setErreur, ok, enregistrer } = useEnregistrement(b.id, onEnregistre);
  const [classe, setClasse] = useState<ClasseDpe | null>(b.dpe_classe as ClasseDpe | null);
  const [date, setDate] = useState(versDateFrancaise(b.dpe_date));
  const [numero, setNumero] = useState(b.dpe_numero ?? '');
  const [min, setMin] = useState(b.dpe_depenses_min_euros?.toString() ?? '');
  const [max, setMax] = useState(b.dpe_depenses_max_euros?.toString() ?? '');
  const [annee, setAnnee] = useState(b.dpe_annee_reference_prix?.toString() ?? '');
  const [energie, setEnergie] = useState(b.chauffage_energie);

  function valider() {
    const iso = lireDateFacultative(date, setErreur, 'La date du DPE');
    if (iso === undefined) return;
    const dMin = min.trim() ? lireEntier(min) : null;
    const dMax = max.trim() ? lireEntier(max) : null;
    if ((min.trim() && dMin === null) || (max.trim() && dMax === null)) {
      return setErreur('Les dépenses d’énergie sont des montants entiers en euros.');
    }
    if (dMin !== null && dMax !== null && dMin > dMax) return setErreur('Le montant minimum dépasse le maximum.');
    const an = annee.trim() ? lireEntier(annee) : null;
    if (annee.trim() && (an === null || an < 2000 || an > 2100)) return setErreur('L’année de référence doit être une année, par exemple 2021.');
    enregistrer({
      dpe_classe: classe,
      dpe_date: iso,
      dpe_numero: numero.trim() || null,
      dpe_depenses_min_euros: dMin,
      dpe_depenses_max_euros: dMax,
      dpe_annee_reference_prix: an,
      chauffage_energie: energie,
    });
  }

  return (
    <View style={styles.rubrique}>
      <View style={styles.bloc}>
        <Libelle>Classe du DPE</Libelle>
        <SelecteurDpe valeur={classe} onChange={setClasse} />
      </View>
      <View style={styles.deuxColonnes}>
        <View style={styles.colonne}>
          <Champ
            libelle="Date du DPE"
            value={date}
            onChangeText={(t) => setDate(formaterDateEnCours(t))}
            keyboardType="number-pad"
            placeholder="JJ/MM/AAAA"
            maxLength={10}
          />
        </View>
        <View style={styles.colonne}>
          <Champ libelle="Numéro du DPE" value={numero} onChangeText={setNumero} autoCapitalize="characters" />
        </View>
      </View>
      <View style={styles.bloc}>
        <Libelle>Dépenses annuelles d’énergie estimées</Libelle>
        <View style={styles.troisColonnes}>
          <View style={styles.colonne}>
            <Champ libelle="Entre (€)" value={min} onChangeText={setMin} keyboardType="number-pad" />
          </View>
          <View style={styles.colonne}>
            <Champ libelle="Et (€)" value={max} onChangeText={setMax} keyboardType="number-pad" />
          </View>
          <View style={styles.colonne}>
            <Champ libelle="Prix de" value={annee} onChangeText={setAnnee} keyboardType="number-pad" placeholder="2021" maxLength={4} />
          </View>
        </View>
        <Text style={styles.texte}>Montants indiqués sur votre DPE.</Text>
      </View>
      <View style={styles.bloc}>
        <Libelle>Mode de chauffage principal</Libelle>
        <PilulesChoix
          libelleGroupe="Mode de chauffage principal"
          valeur={energie}
          onChange={setEnergie}
          options={[
            { valeur: 'electrique', libelle: 'Électrique' },
            { valeur: 'gaz', libelle: 'Gaz' },
            { valeur: 'fioul', libelle: 'Fioul' },
            { valeur: 'bois', libelle: 'Bois' },
            { valeur: 'reseau', libelle: 'Réseau' },
            { valeur: 'autre', libelle: 'Autre' },
          ]}
        />
      </View>
      <MessageErreur message={erreur} />
      <Confirmation visible={ok} />
      <BoutonPrincipal libelle="Enregistrer" onPress={valider} occupe={occupe} />
    </View>
  );
}

// ---------------------------------------------------------------------
// Équipements et mobilier du meublé
// ---------------------------------------------------------------------

/** Question à choix de décence (R-12), avec son libellé validé. */
function QuestionDecence({ champ, valeur, onChange }: { champ: string; valeur: string | null; onChange: (v: string) => void }) {
  const q = question(champ)!;
  return (
    <View style={styles.bloc}>
      <Text style={styles.question}>{q.libelle}</Text>
      <PilulesChoix libelleGroupe={q.libelle} valeur={valeur} onChange={onChange} options={q.options!} />
    </View>
  );
}

export function RubriqueEquipements({ fiche, onEnregistre }: PropsRubrique) {
  const b = fiche.bien;
  const { occupe, erreur, ok, enregistrer } = useEnregistrement(b.id, onEnregistre);
  const [chauffage, setChauffage] = useState(b.chauffage_mode);
  const [repartition, setRepartition] = useState(b.chauffage_repartition ?? '');
  const [eau, setEau] = useState(b.eau_chaude_mode);
  const [repartitionEau, setRepartitionEau] = useState(b.eau_chaude_repartition ?? '');
  const [equipCuisine, setEquipCuisine] = useState<string[]>(b.cuisine_equipements ?? []);
  const [equipSalleEau, setEquipSalleEau] = useState<string[]>(b.salle_eau_equipements ?? []);
  const [wc, setWc] = useState(b.wc);
  const [cuisine, setCuisine] = useState(b.cuisine ?? '');
  const [sanitaires, setSanitaires] = useState(b.sanitaires ?? '');
  const [numerique, setNumerique] = useState(b.equipements_numeriques ?? '');
  const [decence, setDecence] = useState({
    decence_chauffage: b.decence_chauffage,
    decence_cuisine: b.decence_cuisine,
    decence_wc: b.decence_wc,
    decence_salle_eau: b.decence_salle_eau,
  });

  const choisir = (champ: keyof typeof decence) => (v: string) => setDecence({ ...decence, [champ]: v });

  function valider() {
    enregistrer({
      ...decence,
      chauffage_mode: chauffage,
      chauffage_repartition: chauffage === 'collectif' ? repartition.trim() || null : null,
      eau_chaude_mode: eau,
      eau_chaude_repartition: eau === 'collective' ? repartitionEau.trim() || null : null,
      cuisine_equipements: equipCuisine,
      salle_eau_equipements: equipSalleEau,
      wc,
      cuisine: cuisine.trim() || null,
      sanitaires: sanitaires.trim() || null,
      equipements_numeriques: numerique.trim() || null,
    });
  }

  return (
    <View style={styles.rubrique}>
      <View style={styles.bloc}>
        <Libelle>Chauffage</Libelle>
        <PilulesChoix
          libelleGroupe="Mode de chauffage"
          valeur={chauffage}
          onChange={setChauffage}
          options={[
            { valeur: 'individuel', libelle: 'Individuel' },
            { valeur: 'collectif', libelle: 'Collectif' },
          ]}
        />
      </View>
      {chauffage === 'collectif' ? (
        <Champ
          libelle="Répartition de la consommation de chauffage"
          value={repartition}
          onChangeText={setRepartition}
          multiline
          placeholder="Tantièmes, compteurs individuels, répartiteurs…"
          aide="Obligatoire au bail en cas de chauffage collectif (contrat type, note 4)."
        />
      ) : null}
      <QuestionDecence champ="decence_chauffage" valeur={decence.decence_chauffage} onChange={choisir('decence_chauffage')} />
      <View style={styles.bloc}>
        <Libelle>Eau chaude</Libelle>
        <PilulesChoix
          libelleGroupe="Production d’eau chaude"
          valeur={eau}
          onChange={setEau}
          options={[
            { valeur: 'individuelle', libelle: 'Individuelle' },
            { valeur: 'collective', libelle: 'Collective' },
          ]}
        />
      </View>
      {eau === 'collective' ? (
        <Champ
          libelle="Répartition de la consommation d’eau chaude"
          value={repartitionEau}
          onChangeText={setRepartitionEau}
          multiline
          placeholder="Tantièmes, compteurs individuels…"
          aide="Obligatoire au bail en cas de production collective (contrat type, note 5)."
        />
      ) : null}
      <QuestionDecence champ="decence_cuisine" valeur={decence.decence_cuisine} onChange={choisir('decence_cuisine')} />
      <View style={styles.bloc}>
        <Libelle>Équipements de la cuisine</Libelle>
        <PilulesMultiples
          libelleGroupe="Équipements de la cuisine"
          valeurs={equipCuisine}
          onChange={setEquipCuisine}
          options={EQUIPEMENTS_CUISINE.map((e) => ({ valeur: e.valeur, libelle: e.libelle }))}
        />
      </View>
      <Champ libelle="Précisions sur la cuisine (facultatif)" value={cuisine} onChangeText={setCuisine} multiline />
      <QuestionDecence champ="decence_wc" valeur={decence.decence_wc} onChange={choisir('decence_wc')} />
      <QuestionDecence champ="decence_salle_eau" valeur={decence.decence_salle_eau} onChange={choisir('decence_salle_eau')} />
      <View style={styles.bloc}>
        <Libelle>Salle d’eau</Libelle>
        <PilulesMultiples
          libelleGroupe="Équipements de la salle d’eau"
          valeurs={equipSalleEau}
          onChange={setEquipSalleEau}
          options={EQUIPEMENTS_SALLE_EAU.map((e) => ({ valeur: e.valeur, libelle: e.libelle }))}
        />
      </View>
      <View style={styles.bloc}>
        <Libelle>WC</Libelle>
        <PilulesChoix
          libelleGroupe="WC"
          valeur={wc}
          onChange={setWc}
          options={WC.map((e) => ({ valeur: e.valeur, libelle: e.libelle }))}
        />
      </View>
      <Champ libelle="Précisions sur les sanitaires (facultatif)" value={sanitaires} onChangeText={setSanitaires} multiline />
      {equipCuisine.length || equipSalleEau.length || wc ? (
        <Text style={styles.aide}>
          Au bail : {phraseEquipements({ cuisine_equipements: equipCuisine, salle_eau_equipements: equipSalleEau, wc, cuisine, sanitaires })}
        </Text>
      ) : null}
      <Champ libelle="Équipements numériques" value={numerique} onChangeText={setNumerique} placeholder="Télévision, internet, fibre…" multiline />
      <MessageErreur message={erreur} />
      <Confirmation visible={ok} />
      <BoutonPrincipal libelle="Enregistrer" onPress={valider} occupe={occupe} />

      {estMeuble(b) ? <MobilierObligatoire fiche={fiche} onEnregistre={onEnregistre} /> : null}
    </View>
  );
}

function MobilierObligatoire({ fiche, onEnregistre }: PropsRubrique) {
  const [erreur, setErreur] = useState<string | null>(null);
  const lignes = new Map(fiche.inventaire.filter((l) => l.element_code).map((l) => [l.element_code, l.id]));
  const coches = fiche.elementsObligatoires.filter((e) => lignes.has(e.code)).length;

  async function basculer(code: string, libelle: string) {
    setErreur(null);
    const id = lignes.get(code);
    const { error } = id
      ? await supabase.from('inventaire_mobilier').delete().eq('id', id)
      : await supabase.from('inventaire_mobilier').insert({ bien_id: fiche.bien.id, element_code: code, libelle });
    if (error) setErreur(ERREUR_RESEAU);
    await onEnregistre();
  }

  return (
    <View style={[styles.bloc, styles.separation]}>
      <View style={styles.ligneTitre}>
        <Text style={styles.sousTitre}>Mobilier obligatoire</Text>
        <Text style={styles.compteur}>
          {coches} / {fiche.elementsObligatoires.length}
        </Text>
      </View>
      <Text style={styles.texte}>
        Liste du décret n° 2015-981 du 31 juillet 2015. Cochez les éléments présents dans le logement.
      </Text>
      {fiche.elementsObligatoires.map((e) => (
        <CaseACocher
          key={e.code}
          cochee={lignes.has(e.code)}
          onChange={() => basculer(e.code, e.libelle)}
          libelleAccessible={e.libelle}>
          {e.libelle}
        </CaseACocher>
      ))}
      <MessageErreur message={erreur} />
    </View>
  );
}

// ---------------------------------------------------------------------
// Assurances
// ---------------------------------------------------------------------

export function RubriqueAssurances({ fiche, onEnregistre }: PropsRubrique) {
  const pno = fiche.assurances.find((a) => a.nature === 'proprietaire_non_occupant');
  const att = fiche.assurances.find((a) => a.nature === 'attestation_locataire');
  const [assureur, setAssureur] = useState(pno?.assureur ?? '');
  const [police, setPolice] = useState(pno?.numero_police ?? '');
  const [echeance, setEcheance] = useState(versDateFrancaise(pno?.date_echeance ?? null));
  const [annee, setAnnee] = useState(att?.annee?.toString() ?? '');
  const [finValidite, setFinValidite] = useState(versDateFrancaise(att?.date_fin_validite ?? null));
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const loue = fiche.bien.situation_locative !== 'pas_encore_loue';

  async function enregistrer() {
    setErreur(null);
    setOk(false);
    const dEcheance = lireDateFacultative(echeance, setErreur, 'L’échéance', false);
    const dFin = lireDateFacultative(finValidite, setErreur, 'La fin de validité', false);
    if (dEcheance === undefined || dFin === undefined) return;
    const an = annee.trim() ? lireEntier(annee) : null;
    if (annee.trim() && (an === null || an < 2000 || an > 2100)) return setErreur('L’année doit être une année, par exemple 2026.');

    setOccupe(true);
    const champsPno = { assureur: assureur.trim() || null, numero_police: police.trim() || null, date_echeance: dEcheance };
    const r1 = pno
      ? await supabase.from('assurances').update(champsPno).eq('id', pno.id)
      : await supabase.from('assurances').insert({ bien_id: fiche.bien.id, nature: 'proprietaire_non_occupant', ...champsPno });
    let r2: { error: unknown } = { error: null };
    if (loue) {
      const champsAtt = { annee: an, date_fin_validite: dFin };
      r2 = att
        ? await supabase.from('assurances').update(champsAtt).eq('id', att.id)
        : await supabase.from('assurances').insert({ bien_id: fiche.bien.id, nature: 'attestation_locataire', ...champsAtt });
    }
    setOccupe(false);
    if (r1.error || r2.error) return setErreur(ERREUR_RESEAU);
    setOk(true);
    await onEnregistre();
  }

  return (
    <View style={styles.rubrique}>
      <Text style={styles.sousTitre}>Propriétaire non occupant</Text>
      <Champ libelle="Assureur" value={assureur} onChangeText={setAssureur} />
      <View style={styles.deuxColonnes}>
        <View style={styles.colonne}>
          <Champ libelle="N° de police" value={police} onChangeText={setPolice} />
        </View>
        <View style={styles.colonne}>
          <Champ
            libelle="Échéance"
            value={echeance}
            onChangeText={(t) => setEcheance(formaterDateEnCours(t))}
            keyboardType="number-pad"
            placeholder="JJ/MM/AAAA"
            maxLength={10}
          />
        </View>
      </View>

      {loue ? (
        <>
          <Text style={[styles.sousTitre, styles.separation]}>Attestation d’assurance du locataire</Text>
          <View style={styles.deuxColonnes}>
            <View style={styles.colonne}>
              <Champ libelle="Année" value={annee} onChangeText={setAnnee} keyboardType="number-pad" maxLength={4} />
            </View>
            <View style={styles.colonne}>
              <Champ
                libelle="Valable jusqu’au"
                value={finValidite}
                onChangeText={(t) => setFinValidite(formaterDateEnCours(t))}
                keyboardType="number-pad"
                placeholder="JJ/MM/AAAA"
                maxLength={10}
              />
            </View>
          </View>
        </>
      ) : null}
      <Text style={styles.texte}>Les contrats et attestations se rangent dans le coffre.</Text>
      <MessageErreur message={erreur} />
      <Confirmation visible={ok} />
      <BoutonPrincipal libelle="Enregistrer" onPress={enregistrer} occupe={occupe} />
    </View>
  );
}

// ---------------------------------------------------------------------
// Diagnostics (R-04 ; le DPE se renseigne dans « Énergie »)
// ---------------------------------------------------------------------

export const TYPES_DIAGNOSTIC = [
  { valeur: 'crep', libelle: 'Constat de risque d’exposition au plomb (CREP)' },
  { valeur: 'electricite', libelle: 'État de l’installation intérieure d’électricité' },
  { valeur: 'gaz', libelle: 'État de l’installation intérieure de gaz' },
  { valeur: 'erp', libelle: 'État des risques et pollutions' },
  { valeur: 'bruit', libelle: 'État des nuisances sonores aériennes' },
  { valeur: 'amiante', libelle: 'Dossier amiante des parties privatives' },
];

export function RubriqueDiagnostics({ fiche, onEnregistre }: PropsRubrique) {
  const [type, setType] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [resultat, setResultat] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function ajouter() {
    setErreur(null);
    if (!type) return setErreur('Choisissez le diagnostic.');
    const iso = lireDateFacultative(date, setErreur, 'La date de réalisation');
    if (iso === undefined) return;
    if (!iso) return setErreur('Indiquez la date de réalisation, au format JJ/MM/AAAA.');
    if (type === 'crep' && !resultat) return setErreur('Indiquez le résultat du constat plomb.');
    setOccupe(true);
    const { error } = await supabase.from('diagnostics').insert({
      bien_id: fiche.bien.id,
      type,
      date_realisation: iso,
      resultat: type === 'crep' ? resultat : null,
    });
    setOccupe(false);
    if (error) return setErreur(ERREUR_RESEAU);
    setType(null);
    setDate('');
    setResultat(null);
    await onEnregistre();
  }

  async function retirer(id: string) {
    await supabase.from('diagnostics').delete().eq('id', id);
    await onEnregistre();
  }

  return (
    <View style={styles.rubrique}>
      <Text style={styles.texte}>
        Indiquez chaque diagnostic dont vous disposez. Le DPE se renseigne dans la rubrique « Énergie », et les fichiers se rangent dans le coffre.
      </Text>
      {fiche.diagnostics.map((d) => (
        <View key={d.id} style={styles.ligneListe}>
          <View style={styles.colonne}>
            <Text style={styles.ligneTexte}>{TYPES_DIAGNOSTIC.find((t) => t.valeur === d.type)?.libelle ?? d.type}</Text>
            <Text style={styles.texte}>
              Réalisé le {versDateFrancaise(d.date_realisation)}
              {d.resultat ? ` · ${d.resultat === 'presence' ? 'présence de plomb' : 'absence de plomb'}` : ''}
            </Text>
          </View>
          <Pressable onPress={() => retirer(d.id)} accessibilityRole="button" accessibilityLabel="Retirer ce diagnostic">
            <Text style={styles.lien}>Retirer</Text>
          </Pressable>
        </View>
      ))}

      <Text style={[styles.sousTitre, styles.separation]}>Ajouter un diagnostic</Text>
      <PilulesChoix libelleGroupe="Diagnostic" valeur={type} onChange={setType} options={TYPES_DIAGNOSTIC} />
      <Champ
        libelle="Date de réalisation"
        value={date}
        onChangeText={(t) => setDate(formaterDateEnCours(t))}
        keyboardType="number-pad"
        placeholder="JJ/MM/AAAA"
        maxLength={10}
      />
      {type === 'crep' ? (
        <View style={styles.bloc}>
          <Libelle>Résultat</Libelle>
          <PilulesChoix
            libelleGroupe="Résultat du constat plomb"
            valeur={resultat}
            onChange={setResultat}
            options={[
              { valeur: 'absence', libelle: 'Absence de plomb' },
              { valeur: 'presence', libelle: 'Présence de plomb' },
            ]}
          />
        </View>
      ) : null}
      <MessageErreur message={erreur} />
      <BoutonPrincipal libelle="Ajouter ce diagnostic" onPress={ajouter} occupe={occupe} />
    </View>
  );
}

// ---------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------

export function RubriqueNotes({ fiche, onEnregistre }: PropsRubrique) {
  const { occupe, erreur, ok, enregistrer } = useEnregistrement(fiche.bien.id, onEnregistre);
  const [notes, setNotes] = useState(fiche.bien.notes ?? '');
  return (
    <View style={styles.rubrique}>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Accès, digicode, artisans, souvenirs de visite…"
        placeholderTextColor={couleurs.pointillesFort}
        style={styles.notes}
        accessibilityLabel="Notes"
      />
      <MessageErreur message={erreur} />
      <Confirmation visible={ok} />
      <BoutonPrincipal libelle="Enregistrer" onPress={() => enregistrer({ notes: notes.trim() || null })} occupe={occupe} />
    </View>
  );
}

const styles = StyleSheet.create({
  rubrique: { gap: 16 },
  bloc: { gap: 8 },
  aide: { fontFamily: polices.interface, fontSize: 13, lineHeight: 19, color: couleurs.texteSecondaire },
  separation: { marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: couleurs.pointilles },
  libelle: { fontFamily: polices.techniqueGras, fontSize: 10.5, color: couleurs.texteDiscret },
  deuxColonnes: { flexDirection: 'row', gap: 10 },
  troisColonnes: { flexDirection: 'row', gap: 8 },
  colonne: { flex: 1 },
  lien: { fontFamily: polices.interfaceTresGras, fontSize: 13.5, color: couleurs.pin },
  question: { fontFamily: polices.interfaceGras, fontSize: 14.5, lineHeight: 20, color: couleurs.texte },
  sousTitre: { fontFamily: polices.titre, fontSize: 19, letterSpacing: -0.4, color: couleurs.texte },
  texte: { fontFamily: polices.interface, fontSize: 13, lineHeight: 19, color: couleurs.texteSecondaire },
  ligneTitre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  compteur: { fontFamily: polices.techniqueGras, fontSize: 12, color: couleurs.texteDiscret },
  ligneListe: {
    backgroundColor: couleurs.carte,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ligneTexte: { fontFamily: polices.interfaceGras, fontSize: 14, color: couleurs.texte },
  boutonSecondaire: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: couleurs.pin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonSecondaireTexte: { fontFamily: polices.interfaceTresGras, fontSize: 14, color: couleurs.pin },
  notes: {
    minHeight: 180,
    backgroundColor: couleurs.carte,
    borderRadius: 18,
    padding: 16,
    fontFamily: polices.interface,
    fontSize: 15,
    lineHeight: 22,
    color: couleurs.texte,
    textAlignVertical: 'top',
  },
});
