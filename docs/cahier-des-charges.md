# Cahier des charges — Application Baillome

Oct 20, 2026 · @Sarah · Version 0 — brouillon à valider

## 1. Vision et positionnement

Baillome est le copilote de conformité du propriétaire qui gère seul : l'application lui dit s'il est en règle, ce qu'il doit faire ce mois-ci, et lui permet de déléguer à une vraie agence en un geste.

**Promesse :** « Gérez seul, sans risque. Et le jour où vous n'y arrivez plus, déléguez en un clic. »

Les applications du marché sont des logiciels de gestion : elles stockent des loyers et des quittances. Baillome interprète la situation du bailleur au regard de la loi, explique le pourquoi, et s'adosse à une agence réelle.

| Critère | Logiciels de gestion existants | Bailleur Autonome |
| --- | --- | --- |
| Cœur du produit | Comptabilité, quittances, suivi des loyers | Conformité, échéances, pédagogie |
| Rapport à la loi | Modèles de documents figés | Règles qui suivent la loi et alertent bien par bien |
| Ton | Outil neutre | La voix de Sarah, le pourquoi de chaque règle |
| Quand le bailleur décroche | Il résilie | Il délègue à La Maison Garante, dossier transmis |
| Contenu | Fonctions | Parcours de progression adossé au livre |

**Trois piliers de la version 1 :** le check-up de conformité avec score, le calendrier d'alertes par bien, et le bouton « Je délègue ». Le scanner de bail est le quatrième atout, celui qui fait la démonstration.

## 2. Cibles

La cible principale est le particulier qui loue 1 à 5 logements nus ou meublés et les gère seul, partout en France. Deux cibles secondaires portent la conversion vers l'agence et la notoriété.

| Persona | Situation | Ce qui l'inquiète | Ce que l'app lui apporte | Rôle pour l'entreprise |
| --- | --- | --- | --- | --- |
| Le bailleur autonome | 1 à 5 biens, gère seul, à l'aise avec son téléphone | Oublier une obligation, se faire avoir par un locataire, la loi qui change | Score, alertes, documents, explications | Abonnement premium, livre, formations |
| Le bailleur débordé | Hérite d'un bien ou n'a plus le temps | Tout faire de travers, perdre de l'argent | Un état des lieux clair, puis la délégation | Mandat de gestion La Maison Garante (Var) |
| La famille de militaire mutée | Part en mutation, doit décider vite : louer, vendre, faire gérer | Gérer à distance, louer en urgence | Check-list du départ, comparaison des options | Mandat de gestion ou de vente, bouche-à-oreille |

Le bouton « Je délègue » ouvre deux portes partout en France : un rendez-vous de conseil à distance, ou la gestion administrative à distance, où le bailleur garde la mise en location et les interventions. La gestion complète et la mise en location par l'agence restent réservées au Var. Avant d'ouvrir la gestion à distance : suivre les fonds détenus au regard de la garantie financière, adapter le mandat à la signature à distance (rétractation de 14 jours) et écrire noir sur blanc le partage des rôles entre bailleur et agence.

## 3. Périmètre de la version 1

La version 1 couvre tout le parcours du bailleur, du check-up au rapport fiscal, sur une base de données pensée dès le départ pour plusieurs entités et tous les types de biens. Les fonctions des formules supérieures arrivent ensuite par paliers, sans refonte.

| Fonction | Ce qu'elle fait | Version | Formule |
| --- | --- | --- | --- |
| Compte, entités et biens | Une entité « en nom propre » par défaut ; fiche bien typée : logement nu, meublé, garage, local commercial, bureau | V1 | Toutes |
| Check-up de conformité | Score sur 100 et risques expliqués ; règles habitation et garage en V1, commercial et professionnel en V2 | V1 | Découverte |
| Calendrier d'alertes | Révision du loyer avec montant, charges, diagnostics, assurance, déclaration | V1 | Essentiel |
| Documents prêts à l'emploi | Avis de révision, quittance, courrier de régularisation, décompte de restitution du dépôt, pré-remplis | V1 | Essentiel |
| Scanner de bail | Clauses à risque et mentions manquantes, avec explication | V1 | 1 scan gratuit, puis Essentiel |
| Coffre à factures et devis | Rangés par bien ; classement entretien et réparation ou amélioration, proposé puis confirmé par le bailleur | V1 | Essentiel |
| Je délègue | Demande de prise en charge et transmission du dossier après consentement | V1 | Gratuit |
| Génération du bail | Bail conforme au contrat type légal, généré à partir des données du bien, du bailleur et du locataire, avec ses annexes obligatoires ; matrice validée par Sarah et tenue à jour de la loi | V1 | Essentiel |
| Génération de l'état des lieux | Matrice d'entrée et de sortie pré-remplie à partir des pièces et équipements du bien ; à la sortie, comparaison avec l'entrée et champ obligatoire pour la nouvelle adresse du locataire, qui alimente directement le décompte du dépôt | V1 | Essentiel |
| Suivi simple des loyers et rapport fiscal | Loyer reçu oui, non ou partiel ; charges payées ; rapport annuel avec les cases selon le régime déclaré | V1 | Essentiel |
| Gestion locative complète | Avis d'échéance, quittances automatiques, relances d'impayés, régularisation des charges, dépôt de garantie, rapprochement bancaire via un prestataire agréé | V2 | Gestion |
| Multi-entités | SCI à l'impôt sur le revenu, indivision, démembrement ; associés et quotes-parts ; rapport fiscal réparti par entité et par associé | V2 | Patrimoine |
| Baux commerciaux et professionnels | Règles propres : durée, indice de révision, charges, TVA | V2 | Patrimoine |
| Annuaire d'artisans (Var) | Recherche par métier et proximité ; avis réservés aux bailleurs ayant enregistré une facture | V2 | Gratuit pour le bailleur |

**Ajouts validés le 20 octobre 2026 (version 1, formule Essentiel) :**

- **Assurances du bien** : fiche de l'assurance propriétaire non occupant (assureur, numéro de police, échéance, contrat dans le coffre) et suivi de l'attestation d'assurance habitation du locataire, avec demande automatique 30 jours avant son échéance.
- **Fiche locataire** : contacts, adresse après le départ (alimentée par l'état des lieux de sortie), attestation d'assurance, dossier de candidature limité aux pièces autorisées par le décret n° 2015-1437 du 5 novembre 2015, et suppression automatique des dossiers des candidats non retenus.
- **Fiche garant** : contacts, pièces autorisées par le même décret, acte de cautionnement, ou garantie Visale à la place d'un garant.

Ces deux familles deviennent les règles R-07 (dossier de candidature et pièces exigibles) et R-08 (assurances du locataire et du propriétaire), à rédiger. Le registre RGPD devra intégrer ces traitements avant la bêta.

**Envoi des documents par email (version 1, décision du 20 octobre 2026) :**

| Document | Envoi en un clic | Envoi automatique |
| --- | --- | --- |
| Quittance, après saisie d'un loyer payé en entier | Oui | Oui, si le locataire a donné son accord exprès pour la dématérialisation |
| Reçu, en cas de paiement partiel | Oui | Oui, généré à la place de la quittance |
| Appel de loyer | Oui | Oui, chaque mois à la date choisie |
| Avis de révision | Oui | Non : préparé automatiquement, validé d'un geste par le bailleur |
| Décompte de régularisation des charges | Oui | Non : validation obligatoire |
| Décompte de restitution du dépôt | Oui | Non : validation obligatoire |

L'email part au nom du bailleur, les réponses arrivent dans sa propre boîte, et chaque envoi est tracé dans le journal de la fiche locataire (envoyé, ouvert, confirmé). L'accord du locataire pour recevoir ses documents par email est enregistré dans sa fiche, avec sa date.

Conséquence sur le calendrier : la saisie simple des loyers (reçu, partiel, impayé) passe de la V1.5 à la V1, puisqu'elle déclenche les quittances. Le rapport fiscal annuel est lui aussi en V1 : il n'y a plus de V1.5, une V2 viendra après les premiers tests du code (décision du 20 octobre 2026). Un service d'envoi d'emails est ajouté à l'architecture technique.

**Échéances ponctuelles dans l'écran Loyers (décision du 21 octobre 2026) :** toute somme hors échéance mensuelle (complément de régularisation des charges, remboursement d'un trop-perçu, facture refacturable, etc.) apparaît sur une ligne « Ponctuel » distincte, sous le bien concerné, avec son propre statut et son propre document : quittance distincte qui en précise la nature et la période, ou reçu en cas de paiement partiel. Le total du mois sépare les loyers et charges courants des sommes ponctuelles. Raisons : la quittance doit distinguer loyer et charges (loi, article 21) ; un complément de régularisation ne peut être demandé qu'après l'envoi du décompte, un mois avant (article 23), et peut être échelonné sur douze mois si la régularisation est tardive ; les charges récupérées ne sont pas des revenus fonciers et ne doivent jamais gonfler les loyers du rapport fiscal. La taxe d'enlèvement des ordures ménagères est une charge récupérable (décret n° 87-713, rubrique VIII) : elle est récupérée via la régularisation annuelle, et non ajoutée au loyer.

**Trois fonctions différenciantes en V1 (décision du 22 octobre 2026) :** aucune des applications concurrentes relevées ne les propose. Elles portent la promesse « La loi change. Vous, vous êtes prévenu. »

1. **Veille légale personnalisée (fonction phare).** À chaque évolution d'un texte (loi, décret, arrêté, seuil fiscal), l'application croise la nouvelle règle avec les biens et les baux de chaque utilisateur, et lui envoie une alerte qui dit ce que ça change pour lui et quoi faire (« À savoir », « C'est prêt », « Aucune action »). Chaque alerte cite sa source et sa date de vérification. Organisation : veille juridique mensuelle menée par Sarah avec l'aide de Claude, mise à jour des règles datées du moteur de conformité, puis diffusion des alertes.
2. **Objectif 2028, le plan anti-passoire.** Pour chaque bien classé E, F ou G : compte à rebours jusqu'à l'échéance d'interdiction de louer, plan d'action en étapes (nouveau DPE, audit et devis, travaux, DPE après travaux), avantage fiscal du déficit foncier relevé à 21 400 € pour une rénovation faisant passer le logement de E, F ou G à D ou mieux d'ici fin 2027 (CGI, article 156, I, 3°), effet sur le loyer (fin du gel), et accès à la délégation. En V2 : estimation des travaux et mise en relation avec des diagnostiqueurs et artisans du Var.
3. **Dossier litige en un geste.** Assemblage chronologique de toutes les pièces d'un locataire (bail et annexes, états des lieux d'entrée et de sortie avec photos côte à côte, extrait de compte, quittances et reçus, échanges horodatés, mise en demeure), adapté au destinataire (commission de conciliation, commissaire de justice, avocat), en PDF. Rien n'est envoyé automatiquement. Rappel de la conciliation obligatoire pour les litiges de moins de 5 000 €.

Impact sur le planning : la veille et le dossier litige s'appuient sur des briques déjà prévues (règles datées, coffre, documents) ; l'Objectif 2028 s'appuie sur les règles R-01 et R-10. Leur ajout est compatible avec un lancement en avril 2027, à confirmer lors du découpage technique.

**Inscription, fiche du bien et coffre (décisions du 21 octobre 2026) :**

- **Écran de bienvenue :** il présente les six grandes fonctions de l'application en termes compréhensibles par un nouvel utilisateur : conformité vérifiée (DPE, diagnostics, dépôt, révision : un score sur 100), baux rédigés et signés, états des lieux interactifs (détaillés, photographiés, signés sur place), loyers suivis de A à Z (quittances, révisions, charges, relances), déclaration fiscale, documents et échéances (tout rangé au même endroit, rappels automatiques).
- **Parcours d'inscription en quatre étapes courtes :** compte ; premier bien sur une seule page (type, adresse avec détection de zone tendue, surface, pièces, classe et date du DPE, situation locative) ; scan du bail ; premier résultat du check-up.
- **Fiche du bien à compléter ensuite**, avec un pourcentage de complétude : identité du bien (dont identifiant fiscal), surfaces et pièces, énergie, équipements, diagnostics, assurances, et une zone de notes libre. Le scan du bail pré-remplit les rubriques ; plus la fiche est complète, plus le check-up est précis.
- **Coffre :** classement au choix par bien, par locataire, par entité (si le bailleur en a plusieurs) ou par type de document, avec recherche et alertes de renouvellement.
- **Offre fondateur de la bêta :** absente de l'écran public des formules ; elle est proposée aux testeurs par invitation ou code.
- **Contenu précis de chaque formule :** à arbitrer avant le développement de l'écran d'abonnement.

**Module état des lieux dans l'application (version 1, décision du 21 octobre 2026) :** l'état des lieux d'entrée et de sortie se réalise entièrement dans l'application, sur place.

- **Parcours pièce par pièce**, construit à partir de la fiche du bien (pièces, équipements, locaux accessoires), avec la liste des éléments à vérifier et la progression.
- **Pour chaque élément** : photos prises dans l'application et horodatées, état en un geste (neuf, bon, usagé, mauvais), nature, observations écrites ou dictées.
- **Rubriques obligatoires** du décret n° 2016-382 : relevés de compteurs avec photo, clés et moyens d'accès, inventaire du mobilier en meublé ; à la sortie, nouvelle adresse du locataire et comparaison avec l'entrée, photos d'entrée affichées.
- **Fonctionnement hors connexion** (caves, sous-sols, immeubles mal couverts), avec synchronisation au retour du réseau.
- **Signature électronique avancée sur place** (code SMS pour le locataire), contrôle des mentions obligatoires avant signature.
- **Envoi immédiat par email** aux deux parties, **rangement automatique dans le coffre du bien**, et lien de complément de dix jours envoyé au locataire.

**Approche tarifaire validée par Sarah le 21 octobre 2026 (montants à fixer après chiffrage du prestataire de signature et du stockage des photos) :** ne pas augmenter les prix des formules. Le module est inclus sans limite dans les formules Essentiel et supérieures, avec la signature avancée ; il devient un argument central de l'Essentiel. Dans la formule Découverte (gratuite), il est proposé à l'unité, ce qui transforme l'état des lieux en porte d'entrée vers l'abonnement. Les signatures qualifiées (bail, cautionnement) sont incluses dans un volume annuel par formule, puis facturées à l'unité.

**Prestataire de signature électronique : premier comparatif (21 octobre 2026, tarifs publics relevés en ligne, à confirmer par devis)**

| Prestataire | Points forts | Tarifs relevés | Points de vigilance |
| --- | --- | --- | --- |
| Goodflag (ex-Lex Persona) | Prestataire qualifié eIDAS français depuis 2005, centres de données en France, API REST, crédits sans limite d'utilisateurs ; signature qualifiée à distance via France Identité au prix d'une signature simple | Système de crédits, sur devis | Le tarif réduit suppose que le signataire utilise France Identité ; prévoir une solution de repli (vérification d'identité à distance) pour les autres |
| Universign (groupe Signaturit) | Prestataire qualifié français parmi les plus anciens, vérification d'identité à distance certifiée par l'ANSSI, API | Signature avancée en option à 2,50 € ; qualifiée à partir de 10 € par signature ; API directe à partir de 80 € HT par mois (10 signatures qualifiées) | Coût de la qualifiée élevé à l'unité, à négocier au volume |
| Youtrust (ex-Yousign) | Éditeur et hébergement français, API mature | API Plus à 104 € HT par mois, engagement 12 mois, 500 signatures simples par an ; qualifiée en pack complémentaire | Proximité visuelle avec la marque Baillome (point soulevé par Sarah) : à écarter, sauf marque blanche complète |
| Docusign | Leader mondial, API très documentée | API Starter à 50 € par mois (40 enveloppes) ; qualifiée sur devis | Moins adapté au marché français et à la vérification d'identité française |

**Ordre de grandeur pour Baillome :** une signature qualifiée coûte environ 10 € par signataire. Un bail à deux signataires et un acte de cautionnement représentent donc environ 30 € ; un état des lieux en signature avancée, quelques euros. Sur la durée d'un bail, le coût reste compatible avec la formule Essentiel, à condition d'inclure un volume raisonnable de signatures qualifiées et de facturer le surplus.

**Recommandation (mise à jour le 21 octobre 2026, après le passage du bail en signature avancée) :** la signature qualifiée devenant une option, le critère principal est désormais le prix de la signature avancée au volume, suivi de la marque blanche (parcours aux couleurs de Baillome), de l'intégration dans une application mobile, de la vérification de pièce d'identité pour la caution, de l'archivage probatoire et de l'hébergement des données en France. Demander un devis à Goodflag et à Universign, et comparer avec un ou deux acteurs spécialisés de l'immobilier.

**Suivi :** demandes de devis envoyées par Sarah le 21 octobre 2026 à Goodflag, Universign, ImmoSign, Certyneo, Docage et Oodrive Sign. Réponses à comparer dans un tableau dès réception.

**Réponse d'Universign (groupe Namirial), reçue le 21 octobre 2026 :** signature avancée à 1,90 € HT ; signature qualifiée uniquement avec vérification d'identité à distance, à 5,25 € HT ; personnalisation du parcours par « entité émettrice » (logo, nom, affichage, SMS) ; mention de la caution gérée par un champ de saisie dans la transaction, suivie d'une signature qualifiée ; dossier de preuve détaillé (empreintes des documents, participants, chronologie complète) ; archivage de 10 ans selon les normes NF Z42-013 et NF Z42-020 ; hébergement en France, inscrit sur la liste de confiance européenne (Cryptolog International) ; engagement de 24 mois ; environnement de test disponible. Points à éclaircir : prix par signataire ou par transaction, minimum de facturation, marque blanche complète, signature avancée avec vérification d'identité pour la caution, signature sur place sur un même appareil, coûts annexes (SMS, archivage), engagement plus court.

**Hors périmètre :** SCI à l'impôt sur les sociétés et location meublée au régime réel, qui relèvent de la comptabilité d'entreprise (renvoi vers un expert-comptable partenaire) ; application pour le locataire. Signature électronique, assistant IA et module Mutation sont prévus en V2.

**Jamais dans l'application :** garantie loyers impayés et tout produit d'assurance (La Maison Garante n'est pas habilitée à les distribuer), conseil juridique personnalisé (renvoi vers un rendez-vous).

## 4. Moteur de conformité

Le moteur est un catalogue de règles écrites par Sarah, chacune sourcée sur Legifrance et datée. Claude les transforme en code ; Sarah les valide une par une avant la mise en ligne.

**Format d'une fiche règle :** identifiant · question posée au bailleur · condition de déclenchement · gravité (critique / important / conseil) · explication en langage simple (le pourquoi) · action recommandée · article de loi · date de dernière vérification.

| Famille | Ce que l'application vérifie | Gravité par défaut | Statut |
| --- | --- | --- | --- |
| Performance énergétique | Classe DPE et calendrier d'interdiction de louer (G, puis F, puis E), validité du DPE | Critique | À écrire |
| Révision du loyer | Clause de révision présente, trimestre IRL de référence, date anniversaire, délai au-delà duquel la révision est perdue | Important | À écrire |
| Charges | Régularisation annuelle faite, provisions cohérentes, justificatifs tenus à disposition | Important | À écrire |
| Dépôt de garantie | Montant plafonné selon nu ou meublé, délai et pénalités de restitution | Important | À écrire |
| Mentions du bail | Mentions obligatoires du bail type, surface habitable, annexes et notice d'information | Important | À écrire |
| Diagnostics annexés | Dossier de diagnostic technique complet et à jour selon l'âge et la situation du bien | Critique | À écrire |
| Décence | Critères de décence et surface minimale | Critique | À écrire |
| Meublé | Liste minimale du mobilier, durée du bail, régime fiscal | Important | À écrire |
| Encadrement et zones tendues | Commune soumise ou non au plafonnement des loyers et à la taxe sur les logements vacants | Conseil | À écrire |
| Fiscalité | Choix du régime (micro ou réel), échéance de déclaration | Conseil | À écrire |

Les garages loués seuls ont leur propre fiche courte dès la V1, car ils relèvent du Code civil et non de la loi de 1989. En V2, deux familles s'ajoutent, chacune avec son jeu de règles : les baux commerciaux (durée, indice de révision, inventaire des charges, option pour la TVA) et les baux professionnels.

**Règle de sécurité :** chaque fiche porte sa date de vérification. Au-delà de 12 mois sans revue, elle est signalée à Sarah. Les constantes qui changent chaque trimestre ou chaque année (indice IRL, seuils fiscaux) sont tenues dans un seul fichier, mis à jour avec Claude, comme pour le simulateur.

Fiches détaillées, règle par règle : Règles de conformité

## 5. Parcours utilisateur

Tout le parcours converge vers le check-up : le score décide si le bailleur continue seul avec le premium ou passe la main à l'agence.

&#91;embedded content: parcours utilisateur · version 1\]

La flèche pointillée est le cœur du modèle : un abonné premium peut basculer vers la délégation à tout moment, sans perdre son historique.

**Écrans de la version 1 (9) :** accueil avec score global, fiche du bien, questionnaire du check-up, résultat du check-up, calendrier des alertes, génération de document, scanner de bail, Je délègue, compte et abonnement.

## 6. Modèle économique

L'application gagne de l'argent par trois voies : l'abonnement premium, la vente du livre et des formations, et surtout les mandats de gestion apportés à La Maison Garante. Les prix ci-dessous sont validés ; la bêta sert à les confirmer.

| Formule | Contenu | Prix mensuel | Prix annuel |
| --- | --- | --- | --- |
| Découverte | 1 bien, check-up complet, 1 scan de bail, 1 alerte | Gratuit | Gratuit |
| Essentiel | Jusqu'à 3 biens en nom propre : conformité, alertes, documents, coffre à factures, scanner, rapport fiscal | 9,90 € TTC | 99 € TTC |
| Gestion | Essentiel + gestion locative complète et rapprochement bancaire, jusqu'à 10 biens | 19,90 € TTC | 199 € TTC |
| Patrimoine | Gestion + multi-entités (SCI à l'IR, indivision, démembrement), baux commerciaux et professionnels, biens sans limite, rapport fiscal par entité et par associé | 39 € TTC | 390 € TTC |
| Je délègue | Rendez-vous de conseil à distance, gestion administrative (partout en France) ou gestion complète (Var) | Barème de l'agence | Barème de l'agence |

**Tarif fondateur :** prix réduit garanti à vie pour les bêta-testeurs et les premiers abonnés, par exemple Essentiel à 79 € par an au lieu de 99 €. Les premiers sont récompensés sans qu'aucun prix bradé ne soit jamais affiché.

**Commissions des stores :** les abonnements achetés dans l'application passent en principe par Apple et Google, qui prélèvent une commission, réduite pour les petits éditeurs. Le prix premium doit l'absorber. Une vente par le site, via Stripe, est à étudier selon les règles de chaque store.

**Indicateurs suivis dès la bêta :** nombre de check-ups terminés, score moyen, taux de passage en premium, nombre de demandes « Je délègue », mandats signés issus de l'application.

**Piste V2 : réseau d'agences partenaires.** Si l'application se développe, des agences d'autres départements pourront apparaître comme « agence partenaire » dans le parcours « Je délègue », avec une participation financière. La forme de cette rémunération (abonnement de visibilité ou partage d'honoraires entre titulaires de la carte professionnelle) sera à valider au regard de la loi Hoguet avant le lancement.

## 7. Architecture technique et coûts

Une seule base de code produit les applications iOS et Android ; toutes les données passent par un back-end hébergé dans l'Union européenne. Claude écrit l'ensemble du code avec Claude Code ; Sarah teste chaque étape sur son téléphone.

&#91;embedded content: architecture technique · version 1\]

Le moteur de conformité est séparé du reste : une règle se corrige sans republier l'application sur les stores.

**Décision d'architecture prise dès la V1 : trois niveaux, entité, bien, bail.** En V1, chaque compte n'a qu'une entité « en nom propre », mais la structure accueille les SCI en V2 sans refonte. L'entité porte son régime fiscal, ses associés et leurs quotes-parts ; le bail porte son régime juridique (habitation nue ou meublée, garage, commercial, professionnel), qui oriente vers le bon jeu de règles et les bonnes cases fiscales.

La formule Gestion ajoute en V2 un prestataire agréé de connexion bancaire, dont le coût par compte connecté devra être intégré au prix.

| Poste | Coût (ordre de grandeur) |
| --- | --- |
| Compte Apple Developer | Environ 99 $ par an |
| Compte Google Play | Environ 25 $, une seule fois |
| Supabase (hébergement UE) | Gratuit au départ, puis quelques dizaines d'euros par mois |
| API Claude (scanner) | Proportionnel au nombre de scans, à intégrer dans le prix premium |
| Gestion des abonnements | Gratuit jusqu'à un certain chiffre d'affaires, puis un pourcentage |

Ces montants sont approximatifs et à vérifier au moment de chaque souscription.

## 8. Juridique, RGPD et responsabilité

Aucune mise en ligne publique avant que les cinq points ci-dessous soient réglés. Ils conditionnent la bêta ouverte, pas le développement.

- [ ] **Assurance :** demander à Galian-SMABTP si la RCP couvre une activité d'éditeur d'application, et sinon obtenir un devis d'extension ou une RC éditeur.
- [ ] **Éditeur et objet social :** vérifier que l'objet social de la SASU couvre l'édition de logiciels et la vente d'abonnements, ou décider de la structure qui édite l'application.
- [ ] **CGU et CGV :** l'application délivre une information générale, pas une consultation juridique personnalisée ; limites de responsabilité ; droit de rétractation pour l'abonnement ; mention du médiateur de la consommation.
- [ ] **RGPD :** hébergement dans l'Union européenne, registre des traitements étendu, politique de confidentialité propre à l'application, durée de conservation, suppression du compte en un geste depuis l'application.
- [ ] **Données des locataires :** les baux scannés contiennent des données de tiers. Principe retenu : analyse puis suppression du fichier, seul le résultat est conservé ; masquage des noms quand c'est possible ; aucune donnée transmise à l'agence sans consentement explicite du bailleur.

**Bouton « Je délègue » et loi Hoguet :** la demande de prise en charge n'est qu'une prise de contact. Le mandat de gestion se signe ensuite, hors application, selon la procédure habituelle de l'agence.

## 9. Direction artistique et ton

L'application s'appelle Baillome, contraction de « bailleur » et « autonome », issue de la méthode et du livre Bailleur Autonome : pédagogique, directe, outillée. Elle a sa propre identité, moderne et ludique sans être criarde, distincte de l'univers premium de l'agence (décision du 20 octobre 2026).

| Élément | Direction retenue : hybride « Plan × Solaire » (validée le 20 octobre 2026) |
| --- | --- |
| Couleurs principales | Vert pin #0E3B2E (bandeaux, textes, boutons principaux), fond très clair #F6F8F4, cartes blanches |
| Couleur signature | Citron acidulé #D7F75B, rare : score, points à gagner, validations « OK », onglet actif |
| États | Tuiles pastel : corail #FFE4DC (urgent), miel #FFF1C7 (important), menthe #DDF3E4 (bon plan, en règle), textes foncés de la même teinte ; curseur et alertes en corail #FF7A59 |
| Échelle DPE | Couleurs officielles du diagnostic, du vert au rouge : seul endroit multicolore |
| Typographies | Bricolage Grotesque pour les titres et les chiffres géants, Instrument Sans pour l'interface, IBM Plex Mono pour les petites légendes techniques ; aucune police serif |
| Formes | Arrondis généreux (tuiles 24 à 28 px, boutons en pilule), navigation flottante en pilule |
| Signatures visuelles | Quadrillage discret façon plan d'architecte dans le bandeau ; score géant sur un mètre ruban gradué avec curseur rond ; légendes « BIEN N° 01 », « RELEVÉ », « \[01\] URGENT » ; ombre décalée réservée à l'élément urgent ; check-list en pastilles « OK » |
| Mode sombre | Bandeau et fond vert pin, tuiles assombries, citron conservé, à prévoir dès la version 1 |
| Ton | Phrases courtes, toujours le « pourquoi » en une ligne, jamais culpabilisant (voir la charte des messages) |

Pistes explorées et écartées : beige et brun (trop « agence ancienne »), serif (pas assez « application pro »), fintech indigo (trop générique), plan d'architecte pur (trop carré). Maquettes de référence : [toile Bailleur Autonome](https://claude.ai/artifact/XKNbKkLUWJxjhSeUR2ednR).

**Charte des messages (validée par Sarah le 20 octobre 2026).** Chaque message s'adresse à un bailleur qui n'est pas un professionnel de l'immobilier. Il doit être clair, facile à comprendre, instructif et léger, sans être familier : le bailleur doit prendre plaisir à le lire et se sentir bien informé. En pratique :

- Vouvoiement, phrases courtes, aucun terme technique sans explication immédiate.
- Une image ou une tournure souriante quand le sujet s'y prête (« Votre DPE a pris sa retraite »), jamais de moquerie ni d'alarmisme.
- Toujours le pourquoi en une phrase, puis la bonne nouvelle ou la solution.
- Aucune information juridique non encore en vigueur (projet de loi, texte en consultation) dans les messages.

**Logo validé le 20 octobre 2026 : la maison interrupteur.** Une maison au trait avec, en son centre, un interrupteur dont le bouton est en position « activé » : la bascule « je gère / je délègue », et le bailleur aux commandes. Icône de l'application : tuile vert pin, maison blanche, bouton citron. Sur fond citron, maison et bouton en vert pin. En dessous d'environ 48 pixels, une version simplifiée s'applique : trait plus épais, interrupteur en pilule pleine. Logotype : « Bailleur » en Bricolage Grotesque extra-gras, « Autonome » en Bricolage moyen. Pistes écartées : maison au mètre (trop « diagnostiqueur »), plan de porte, monogramme b, maison à la coche, maison au point. Dépôt de la marque verbale d'abord, le logo ensuite.

## 10. Planning et jalons

Au rythme de 6 heures par semaine, le lancement public est réaliste en avril 2027, juste avant la campagne de déclaration des revenus, ce qui met le rapport fiscal en vitrine. Chaque phase s'ouvre seulement quand le feu vert précédent est franchi.

&#91;embedded content: planning · 4 phases, 3 feux verts\]

Il n'y a pas de V1.5 : son contenu (bail et état des lieux générés, saisie des loyers, rapport fiscal) est intégré à la V1. La V2 suit après les premiers tests, en plusieurs livraisons au cours de 2027 : formules Gestion puis Patrimoine, multi-entités, baux commerciaux et professionnels, annuaire d'artisans dans le Var, assistant IA et module Mutation.

## 11. Décisions à trancher par Sarah

Onze décisions débloquent le développement. Les trois premières sont à prendre avant d'écrire la moindre ligne de code.

- [x] **Marque et bouton « Je délègue ».** La charte interdit qu'un support Bailleur Autonome vende un mandat. Options : présenter La Maison Garante comme « agence partenaire » dans un écran distinct, ou assouplir la charte pour l'application, puisque ta méthode dit « j'apprends à gérer, ou je le fais pour vous ».
- [x] **Éditeur.** Décidé : la SASU La Maison Garante édite l'application et sera titulaire de la marque.
- [x] **Nom de l'application.** « Bailleur Autonome » ou un nom propre au produit. Point au 20 octobre 2026 : Baillome retenu par Sarah (bailleur + autonome), absent de Data INPI à l'identique ; variante proche Bayoma enregistrée en classes 35 et 43, jugée éloignée (ne pas déposer en classe 43) ; Nomos écarté (déjà enregistré en France pour une entreprise de finance, classe 36) ; restent à vérifier les variantes proches, les noms de domaine, les stores et le test à l'oral avant le dépôt.
- [x] **Ton : décidé, vouvoiement** dans l'application.
- [x] **Hors du Var :** le bouton « Je délègue » décidé : partout en France, rendez-vous de conseil à distance ou gestion administrative à distance (5 %), au barème de l'agence ; mise en location et gestion complète réservées au Var.
- [x] **Prix du premium** : décidé : Essentiel 9,90 €, Gestion 19,90 €, Patrimoine 39 € par mois, environ deux mois offerts sur l'annuel.
- [x] **Créneau hebdomadaire protégé** pour le projet, décidé : 6 heures par semaine, sans empiéter sur la prospection.
- [ ] **Comptes développeur :** un compte Apple au nom de la société demande un numéro D-U-N-S, gratuit mais à obtenir plusieurs jours à l'avance.

* [ ] **Formules et prix :** décidé, gamme Découverte, Essentiel, Gestion et Patrimoine retenue.
* [ ] **Ordre d'écriture des règles :** habitation et garage pour la V1, puis baux commerciaux et professionnels pour la V2.
* [ ] **Connexion bancaire (V2) :** choisir le prestataire agréé et vérifier son coût par compte connecté.

- [ ] **Marque :** recherche à l'identique sur Data INPI sans résultat. Reste à faire : recherche de similarité INPI (classes 9, 16, 36, 41, 42), puis dépôt au nom de la SASU avant toute communication sur l'application ; réserver les domaines en .fr et .com.

* [ ] **Matrices de documents à rédiger et valider** (à ne pas oublier) : bail (R-05), état des lieux d'entrée et de sortie (R-06), quittance, reçu de paiement partiel, appel de loyer, avis de révision, décompte de régularisation des charges, décompte de restitution du dépôt de garantie, rapport fiscal annuel.

- [x] **Palette (21 octobre 2026) :** après comparaison avec trois pistes (Nuit & Mimosa, Pin & Tuile, Lagune & Corail), Sarah conserve **Pin & Citron**. Vigilance sur la proximité perçue avec l'identité de Yousign, devenue Youtrust : la différenciation passera par la typographie des titres, la sobriété des documents générés et le choix du prestataire de signature.

* [x] **Typographie et documents imprimables (21 octobre 2026) :** la police des titres reste Bricolage Grotesque. Les documents générés (bail, état des lieux, quittances, avis) sont pensés pour l'impression : fond blanc, aucun bandeau ni aplat de couleur, encadrés au trait vert pin, numéros de parties graphiques, champs remplis soulignés en pointillé, citron réservé au logo de l'application et absent des documents.

Matrices détaillées, document par document : Matrices de documents
