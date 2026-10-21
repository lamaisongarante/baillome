# Baillome — instructions pour Claude Code

## Le projet

Baillome est une application mobile (iPhone et Android) de gestion locative pour les propriétaires bailleurs particuliers français. Elle est éditée par La Maison Garante (SASU, agence immobilière titulaire des cartes T et G, La Valette-du-Var). Lancement visé : avril 2027.

La porteuse du projet, Sarah, n'est pas développeuse. Elle est experte de la gestion locative (8 ans d'expérience, autrice du livre « Bailleur Autonome »). **Explique chaque étape en français simple, sans jargon, et demande-lui toujours son accord avant :**
- d'installer un service payant ou de créer un compte chez un prestataire ;
- de modifier une règle juridique ou un modèle de document ;
- de supprimer des données.

## Les documents de référence

Le cahier des charges complet est dans un document Claude partagé par Sarah (onglets : Cahier des charges, Règles de conformité, Guide état des lieux et dépôt, Matrices de documents, Modèles de baux nu, meublé, colocation et garage, Dossier avocat, Concurrence, Architecture technique). **En cas de doute, il fait foi.** Demande à Sarah de t'en transmettre l'onglet utile plutôt que de supposer.

## La règle d'or juridique

- **N'invente jamais une règle de droit, un seuil, un délai ou une formulation légale.** Chaque règle de l'application vient des règles R-01 à R-12 et des matrices M-01 à M-12, qui citent leurs textes sources (vérifiés sur Legifrance en octobre 2026).
- Les textes imposés (contrats types, notice d'information, mentions de l'acte de cautionnement) sont reproduits **mot pour mot**. Ne les reformule jamais.
- Les règles sont des **données datées** (seuil, liste, date d'entrée en vigueur, source), jamais des valeurs écrites en dur dans le code. Une évolution de la loi = une nouvelle version de la règle.
- Chaque règle a ses **tests automatisés**, avec des cas réels (par exemple : logement classé F → révision du loyer bloquée ; commune en zone tendue → plafond à la relocation ; dépôt de garantie en meublé > 2 mois → bloquant).
- Si un texte manque pour trancher, arrête-toi et demande-le à Sarah.

## Les outils

- Application : Expo (React Native), TypeScript strict.
- Données, comptes, fichiers, fonctions serveur : Supabase, région de l'Union européenne.
- PDF : modèles HTML convertis côté serveur.
- Emails : prestataire transactionnel européen.
- Signature électronique : prestataire choisi après devis (avancée par défaut, qualifiée en option).
- Abonnements : RevenueCat (achats Apple et Google).
- États des lieux : fonctionnement hors connexion, synchronisation au retour du réseau.

## La marque et la direction artistique

- Nom : **Baillome** (bailleur + autonome). Logo : la maison interrupteur.
- Couleurs de l'application :
  - vert pin `#0E3B2E` (couleur principale) ;
  - citron `#D7F75B` (signature, à utiliser avec parcimonie : score, validations, onglet actif) ;
  - fond `#F6F8F4`, cartes blanches ;
  - états : corail `#FFE4DC` (urgent), miel `#FFF1C7` (important), menthe `#DDF3E4` (en règle).
- Polices : Bricolage Grotesque (titres et grands chiffres), Instrument Sans (interface), IBM Plex Mono (légendes techniques).
- Formes : grands arrondis (tuiles 22 à 28 px, boutons en pilule), quadrillage discret dans les bandeaux vert pin, ombre décalée de 5 px pour l'élément urgent, pastilles « OK » en citron.
- Navigation : 5 onglets (Accueil, Biens, Loyers au centre, Agenda, Docs). Le compte est derrière l'avatar de l'accueil.
- Les maquettes validées (19 écrans et 10 documents) sont la référence visuelle.

## Les documents générés (PDF)

- Pensés pour l'impression : **fond blanc, aucun bandeau ni aplat de couleur**, encadrés au trait vert pin, grands numéros de parties, champs remplis soulignés en pointillé.
- Le citron n'apparaît jamais dans les documents.
- Chaque document garde la trace de la version du modèle et des textes utilisés.

## Le ton

- Vouvoiement dans l'application.
- Des phrases courtes et claires, qui expliquent le « pourquoi » au bailleur sans le culpabiliser.
- Toujours en français, avec la typographie française (espaces avant « : ; ! ? », guillemets « »).

## Les données personnelles

- Chaque bailleur n'accède qu'à ses propres données (sécurité ligne par ligne dans Supabase).
- Dossier de candidature : uniquement les pièces de la liste officielle (règle R-07) ; suppression automatique des dossiers des candidats non retenus.
- Rien n'est envoyé au locataire sans l'accord du bailleur (sauf les envois automatiques qu'il a activés, avec l'accord exprès du locataire pour la quittance dématérialisée).

## La méthode de travail

- On avance **étape par étape**, dans l'ordre du plan de développement (onglet Architecture technique) : 0 préparation, 1 socle, 2 conformité, 3 baux, 4 signature et état des lieux, 5 loyers, 6 différenciants, 7 lancement.
- À la fin de chaque étape : un résumé en français simple de ce qui a été fait, ce que Sarah peut tester sur son téléphone, et ce qui vient ensuite.
- Commits petits et clairs, en français.
- Avant d'écrire du code d'interface, relis les couleurs, les polices et les maquettes ci-dessus.
