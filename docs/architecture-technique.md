# Architecture technique

**Principe directeur :** des outils standards, bien documentés, que Claude Code maîtrise parfaitement, avec des données hébergées dans l'Union européenne. Sarah pilote, Claude Code écrit le code, étape par étape.

## Les outils retenus (propositions à valider)

| Besoin | Outil proposé | Pourquoi |
| --- | --- | --- |
| Application iPhone et Android | Expo (React Native), en TypeScript | Un seul code pour les deux plateformes ; publication simplifiée sur les stores |
| Base de données, comptes, fichiers | Supabase (base PostgreSQL, authentification, stockage) | Tout-en-un, sécurité ligne par ligne, région européenne (Paris ou Francfort, à vérifier) |
| Calculs et documents côté serveur | Fonctions Supabase (TypeScript) | Règles de conformité, génération des PDF, envois programmés |
| Génération des PDF | Modèles HTML convertis en PDF côté serveur | Reprend directement les mises en page imprimables validées |
| Emails (quittances, avis, alertes) | Prestataire d'emails transactionnels européen (par exemple Brevo, société française) | Délivrabilité, suivi d'ouverture, hébergement européen |
| Signature électronique | Prestataire retenu après devis | API, marque blanche, signature avancée par code SMS |
| Abonnements dans l'application | RevenueCat, au-dessus des achats Apple et Google | Gère les formules, l'essai, la restauration d'achat et les commissions des stores |
| Fonctionnement hors connexion (états des lieux) | Base locale sur le téléphone, synchronisée au retour du réseau | Caves, sous-sols, immeubles mal couverts |
| Code source | GitHub (dépôt privé) | Historique, sauvegarde, travail avec Claude Code |

## Les données publiques à brancher

| Donnée | Source | Usage |
| --- | --- | --- |
| Adresse et code Insee de la commune | API Adresse de l'État (adresse.data.gouv.fr) | Saisie de l'adresse, détection de la zone tendue |
| Communes en zone tendue | Annexe du décret n° 2026-831, intégrée par code Insee | Règle R-09 |
| Indice de référence des loyers et indice du coût de la construction | Publications trimestrielles de l'Insee (accès automatisé à vérifier) | Révisions (R-02, garage) |
| DPE d'un logement | Base publique des DPE de l'Ademe (accès par numéro de DPE à vérifier) | Pré-remplir la classe et la date du DPE |

## Le modèle de données (simplifié)

| Élément | Contenu principal |
| --- | --- |
| Utilisateur et formule | Compte, formule d'abonnement, consentements |
| Entité | Nom propre, SCI, indivision (organisation par entité) |
| Bien | Type, adresse, code Insee, identifiant fiscal, surfaces, pièces, équipements, copropriété, notes, complétude |
| Diagnostic | Type, date, validité, classe (DPE), fichier |
| Assurance | Propriétaire non occupant, attestation du locataire, échéances |
| Personne | Locataire, colocataire, garant, candidat : coordonnées, pièces autorisées, consentement d'envoi par email |
| Bail | Type, version du modèle, dates, loyer, charges, dépôt, clauses, signatures, notice jointe |
| État des lieux | Entrée ou sortie, pièces, éléments, états, photos horodatées, compteurs, clés, signatures |
| Écriture du compte locataire | Appel, encaissement, somme ponctuelle, date, montant |
| Document | Type, bien, locataire, entité, fichier, statut d'envoi (envoyé, ouvert, confirmé) |
| Règle et version de texte | Identifiant (R-01 à R-12), date d'entrée en vigueur, source, contenu |
| Alerte | Bien concerné, règle, échéance, statut |
| Évolution légale | Texte, date, résumé, biens impactés, message, date de vérification |

## Le moteur de conformité

Les règles R-01 à R-12 sont stockées comme des données datées (seuils, listes, dates d'effet), et non écrites en dur dans le code. Une évolution de la loi se traduit par une nouvelle version de la règle, avec sa date d'entrée en vigueur et sa source. Le check-up, les blocages de documents, la veille légale personnalisée et l'Objectif 2028 lisent tous la même base de règles.

## Sécurité et données personnelles

- Hébergement dans l'Union européenne, contrats de sous-traitance (RGPD) avec chaque prestataire.
- Chaque bailleur n'accède qu'à ses propres données (sécurité ligne par ligne).
- Suppression automatique des dossiers des candidats non retenus.
- Registre des traitements à compléter avant la bêta.

## Le plan de développement

| Étape | Contenu | Résultat visible |
| --- | --- | --- |
| 0 · Préparation | Comptes développeur Apple et Google, Supabase, Expo, GitHub, nom de domaine | Les outils sont prêts |
| 1 · Le socle | Inscription, entités, biens, fiche du bien, coffre | Je crée un compte et j'ajoute mes biens |
| 2 · La conformité | Moteur de règles R-01 à R-12, check-up et score, agenda et alertes | J'ai mon score sur 100 |
| 3 · Les baux | Locataires, garants, génération des baux, cautionnement | Je génère un bail conforme |
| 4 · La signature et l'état des lieux | Prestataire de signature, module d'état des lieux hors connexion | Je signe un bail et un état des lieux sur place |
| 5 · Les loyers | Appels, saisie, quittances, reçus, envois, révision, régularisation, dépôt, extrait de compte | Mes quittances partent toutes seules |
| 6 · Les différenciants | Déclaration fiscale, veille légale, Objectif 2028, dossier litige | Baillome devient unique |
| 7 · Le lancement | Abonnements, Je délègue, finitions, tests, bêta | Les premiers bailleurs testent |

**Point de vigilance sur le calendrier :** ce périmètre représente environ vingt semaines de travail à un rythme régulier. Avec six heures par semaine, un lancement en avril 2027 suppose soit d'augmenter le temps consacré pendant la phase de développement, soit d'ouvrir la bêta en mars avec les étapes 1 à 5 et d'ajouter l'étape 6 en avril. À trancher par Sarah.

## Avant d'ouvrir Claude Code

- [ ] Créer le compte développeur Apple au nom de la SASU (numéro D-U-N-S nécessaire).
- [ ] Créer le compte développeur Google Play.
- [ ] Créer les comptes Supabase, Expo et GitHub avec l'adresse email de la société.
- [ ] Réserver les noms de domaine baillome.fr et baillome.com.
- [ ] Installer Claude Code et créer le dossier du projet, puis y déposer le fichier CLAUDE.md fourni.
