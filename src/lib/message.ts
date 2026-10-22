// Mise en forme des messages des règles (sans dépendance, testée dans tests/logique).

/**
 * Prépare un message pour l'affichage : remplace [montant], [élément], [critère]
 * et applique la typographie française (espace fine insécable avant : ; ? !).
 * Le texte enregistré n'est jamais modifié.
 */
export function messageAffiche(message: string, valeurs?: Record<string, string>): string {
  const rempli = message.replace(/\[([^\]]+)\]/g, (tout, cle: string) => valeurs?.[cle] ?? tout);
  return rempli.replace(/ ([:;?!])/g, ' $1').replace(/« /g, '« ').replace(/ »/g, ' »');
}
