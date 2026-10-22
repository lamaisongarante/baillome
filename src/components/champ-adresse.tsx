import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { rechercherAdresses, type Adresse } from '@/lib/adresse';
import { couleurs, polices } from '@/theme/tokens';

/**
 * Champ d'adresse avec propositions de l'État au fil de la frappe.
 * Le bailleur choisit une proposition : on obtient ainsi le code Insee.
 */
export function ChampAdresse({
  adresse,
  onChange,
}: {
  adresse: Adresse | null;
  onChange: (a: Adresse | null) => void;
}) {
  const [texte, setTexte] = useState(adresse?.libelle ?? '');
  const [propositions, setPropositions] = useState<Adresse[]>([]);
  const [recherche, setRecherche] = useState(false);
  const [indisponible, setIndisponible] = useState(false);

  useEffect(() => {
    if (adresse && texte === adresse.libelle) return;
    const controle = new AbortController();
    // On attend une courte pause dans la frappe avant d'interroger le service.
    const minuteur = setTimeout(async () => {
      setRecherche(true);
      try {
        setPropositions(await rechercherAdresses(texte, controle.signal));
        setIndisponible(false);
      } catch {
        if (!controle.signal.aborted) setIndisponible(true);
      } finally {
        if (!controle.signal.aborted) setRecherche(false);
      }
    }, 300);
    return () => {
      clearTimeout(minuteur);
      controle.abort();
    };
  }, [texte, adresse]);

  function choisir(a: Adresse) {
    setTexte(a.libelle);
    setPropositions([]);
    onChange(a);
  }

  return (
    <View style={styles.bloc}>
      <Text style={styles.libelle}>ADRESSE</Text>
      <View>
        <TextInput
          value={texte}
          onChangeText={(t) => {
            setTexte(t);
            if (adresse) onChange(null);
          }}
          placeholder="Numéro, rue, ville"
          placeholderTextColor={couleurs.pointillesFort}
          autoComplete="street-address"
          textContentType="fullStreetAddress"
          accessibilityLabel="Adresse du bien"
          style={styles.saisie}
        />
        {recherche ? <ActivityIndicator style={styles.chargement} color={couleurs.pin} /> : null}
      </View>

      {propositions.length > 0 && !adresse ? (
        <View style={styles.propositions} accessibilityRole="list">
          {propositions.map((p, i) => (
            <Pressable
              key={`${p.libelle}-${i}`}
              onPress={() => choisir(p)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.proposition, i > 0 && styles.separateur, pressed && styles.appuye]}>
              <Text style={styles.voie}>{p.voie}</Text>
              <Text style={styles.commune}>
                {p.codePostal} {p.commune}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {indisponible ? (
        <Text style={styles.aide}>
          La recherche d’adresse ne répond pas. Vérifiez votre connexion, puis reprenez la saisie.
        </Text>
      ) : null}
      {!adresse && texte.trim().length >= 4 && !recherche && propositions.length === 0 && !indisponible ? (
        <Text style={styles.aide}>Aucune adresse trouvée. Essayez avec le numéro, la rue et la ville.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: 8 },
  libelle: { fontFamily: polices.techniqueGras, fontSize: 10.5, color: couleurs.texteDiscret },
  saisie: {
    backgroundColor: couleurs.carte,
    borderRadius: 18,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 44,
    fontFamily: polices.interfaceGras,
    fontSize: 15,
    color: couleurs.texte,
  },
  chargement: { position: 'absolute', right: 14, top: 14 },
  propositions: { backgroundColor: couleurs.carte, borderRadius: 18, overflow: 'hidden' },
  proposition: { paddingVertical: 10, paddingHorizontal: 16, gap: 1 },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.piste },
  appuye: { backgroundColor: couleurs.fond },
  voie: { fontFamily: polices.interfaceGras, fontSize: 14.5, color: couleurs.texte },
  commune: { fontFamily: polices.interface, fontSize: 12.5, color: couleurs.texteSecondaire },
  aide: { fontFamily: polices.interface, fontSize: 12, lineHeight: 17, color: couleurs.texteSecondaire },
});
