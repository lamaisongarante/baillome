/**
 * Recherche d'adresse via le service officiel de l'État (Géoplateforme,
 * successeur de l'API Adresse de adresse.data.gouv.fr). Renvoie notamment
 * le code Insee de la commune, qui sert à la détection de la zone tendue.
 */
const URL_RECHERCHE = 'https://data.geopf.fr/geocodage/search';

export type Adresse = {
  libelle: string; // « 12 Rue des Oliviers 83130 La Garde »
  voie: string; // « 12 Rue des Oliviers »
  codePostal: string;
  commune: string;
  codeInsee: string;
  latitude: number;
  longitude: number;
};

type ReponseGeoplateforme = {
  features: {
    geometry: { coordinates: [number, number] };
    properties: {
      label: string;
      name: string;
      postcode: string;
      city: string;
      citycode: string;
    };
  }[];
};

export async function rechercherAdresses(texte: string, signal?: AbortSignal): Promise<Adresse[]> {
  const q = texte.trim();
  if (q.length < 4) return [];
  const url = `${URL_RECHERCHE}?q=${encodeURIComponent(q)}&limit=5&autocomplete=1&index=address`;
  const reponse = await fetch(url, { signal });
  if (!reponse.ok) throw new Error(`Recherche d'adresse indisponible (${reponse.status})`);
  const donnees = (await reponse.json()) as ReponseGeoplateforme;
  return donnees.features.map((f) => ({
    libelle: f.properties.label,
    voie: f.properties.name,
    codePostal: f.properties.postcode,
    commune: f.properties.city,
    codeInsee: f.properties.citycode,
    longitude: f.geometry.coordinates[0],
    latitude: f.geometry.coordinates[1],
  }));
}
