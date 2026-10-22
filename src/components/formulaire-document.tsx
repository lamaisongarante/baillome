import { StyleSheet, Text, View } from 'react-native';

import { PilulesChoix } from '@/components/choix';
import { CaseACocher, Champ } from '@/components/formulaire';
import { LIBELLES } from '@/lib/biens';
import { TYPES_DOCUMENT, type Coffre, type TypeDocument } from '@/lib/coffre';
import { estDansLeFutur, formaterDateEnCours, lireDateFrancaise } from '@/lib/saisie';
import { couleurs, polices } from '@/theme/tokens';

export type ValeursDocument = {
  type: TypeDocument | null;
  titre: string;
  bienId: string | null;
  entiteId: string | null;
  dateDocument: string; // saisie JJ/MM/AAAA
  dateValidite: string; // saisie JJ/MM/AAAA
  deductible: boolean;
};

export const VALEURS_VIDES: ValeursDocument = {
  type: null,
  titre: '',
  bienId: null,
  entiteId: null,
  dateDocument: '',
  dateValidite: '',
  deductible: false,
};

const OPTIONS_TYPES = (Object.keys(TYPES_DOCUMENT) as TypeDocument[]).map((v) => ({ valeur: v, libelle: TYPES_DOCUMENT[v] }));

/** Vérifie la saisie et prépare les champs à enregistrer, ou renvoie un message d'erreur. */
export function lireValeurs(v: ValeursDocument):
  | { erreur: string }
  | { champs: { type_document: TypeDocument; titre: string; bien_id: string | null; entite_id: string | null; date_document: string | null; date_validite: string | null; deductible: boolean } } {
  if (!v.type) return { erreur: 'Choisissez le type de document.' };
  if (!v.titre.trim()) return { erreur: 'Donnez un nom au document.' };
  const dateDocument = v.dateDocument.trim() ? lireDateFrancaise(v.dateDocument) : null;
  if (v.dateDocument.trim() && !dateDocument) return { erreur: 'Date du document : utilisez le format JJ/MM/AAAA.' };
  if (dateDocument && estDansLeFutur(dateDocument)) return { erreur: 'La date du document ne peut pas être dans le futur.' };
  const dateValidite = v.dateValidite.trim() ? lireDateFrancaise(v.dateValidite) : null;
  if (v.dateValidite.trim() && !dateValidite) return { erreur: 'Fin de validité : utilisez le format JJ/MM/AAAA.' };
  return {
    champs: {
      type_document: v.type,
      titre: v.titre.trim(),
      bien_id: v.bienId,
      entite_id: v.entiteId,
      date_document: dateDocument,
      date_validite: dateValidite,
      deductible: v.type === 'facture_devis' ? v.deductible : false,
    },
  };
}

/** Champs de classement d'un document du coffre. */
export function FormulaireDocument({
  valeurs,
  onChange,
  coffre,
}: {
  valeurs: ValeursDocument;
  onChange: (v: ValeursDocument) => void;
  coffre: Coffre;
}) {
  const maj = (champs: Partial<ValeursDocument>) => onChange({ ...valeurs, ...champs });

  function choisirType(type: TypeDocument) {
    // Classement proposé : le nom du type sert de titre tant que rien n'est saisi.
    const titreParDefaut = !valeurs.titre || Object.values(TYPES_DOCUMENT).includes(valeurs.titre as never);
    maj({ type, titre: titreParDefaut ? TYPES_DOCUMENT[type] : valeurs.titre });
  }

  return (
    <View style={styles.formulaire}>
      <View style={styles.bloc}>
        <Text style={styles.libelle}>TYPE DE DOCUMENT</Text>
        <PilulesChoix libelleGroupe="Type de document" valeur={valeurs.type} onChange={choisirType} options={OPTIONS_TYPES} />
      </View>

      <Champ libelle="Nom du document" value={valeurs.titre} onChangeText={(titre) => maj({ titre })} />

      {coffre.biens.length > 0 ? (
        <View style={styles.bloc}>
          <Text style={styles.libelle}>BIEN CONCERNÉ</Text>
          <PilulesChoix
            libelleGroupe="Bien concerné"
            valeur={valeurs.bienId ?? 'aucun'}
            onChange={(id) => maj({ bienId: id === 'aucun' ? null : id })}
            options={[
              ...coffre.biens.map((b) => ({
                valeur: b.id,
                libelle: `${LIBELLES.type_bien[b.type_bien as keyof typeof LIBELLES.type_bien] ?? 'Bien'}${b.commune ? ` · ${b.commune}` : ''}`,
              })),
              { valeur: 'aucun', libelle: 'Aucun' },
            ]}
          />
        </View>
      ) : null}

      {coffre.entites.length > 1 ? (
        <View style={styles.bloc}>
          <Text style={styles.libelle}>ENTITÉ</Text>
          <PilulesChoix
            libelleGroupe="Entité"
            valeur={valeurs.entiteId}
            onChange={(entiteId) => maj({ entiteId })}
            options={coffre.entites.map((e) => ({ valeur: e.id, libelle: e.nom }))}
          />
        </View>
      ) : null}

      <View style={styles.deuxColonnes}>
        <View style={styles.colonne}>
          <Champ
            libelle="Date du document"
            value={valeurs.dateDocument}
            onChangeText={(t) => maj({ dateDocument: formaterDateEnCours(t) })}
            keyboardType="number-pad"
            placeholder="JJ/MM/AAAA"
            maxLength={10}
          />
        </View>
        <View style={styles.colonne}>
          <Champ
            libelle="Valable jusqu’au"
            value={valeurs.dateValidite}
            onChangeText={(t) => maj({ dateValidite: formaterDateEnCours(t) })}
            keyboardType="number-pad"
            placeholder="Facultatif"
            maxLength={10}
          />
        </View>
      </View>
      <Text style={styles.aide}>Avec une fin de validité, Baillome vous prévient avant l’échéance.</Text>

      {valeurs.type === 'facture_devis' ? (
        <CaseACocher
          cochee={valeurs.deductible}
          onChange={(deductible) => maj({ deductible })}
          libelleAccessible="Dépense déductible de mes revenus fonciers">
          Dépense déductible de mes revenus fonciers
        </CaseACocher>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  formulaire: { gap: 16 },
  bloc: { gap: 8 },
  libelle: { fontFamily: polices.techniqueGras, fontSize: 10.5, color: couleurs.texteDiscret },
  deuxColonnes: { flexDirection: 'row', gap: 10 },
  colonne: { flex: 1 },
  aide: { fontFamily: polices.interface, fontSize: 12, color: couleurs.texteSecondaire, marginTop: -8 },
});
