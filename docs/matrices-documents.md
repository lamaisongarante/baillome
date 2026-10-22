# Matrices de documents

Chaque matrice décrit un document généré par Baillome : à quoi il sert, d'où viennent ses données, ce qu'il contient, les règles de calcul et les mentions obligatoires. Elle est rédigée par Claude à partir des textes, puis relue et validée par Sarah.

| Matrice | Document | Envoi | Statut |
| --- | --- | --- | --- |
| M-01 | Rapport fiscal annuel | Téléchargement PDF | Brouillon à relire |
| M-02 | Bail d'habitation (nu, meublé) | PDF et signature | Brouillon à relire |
| M-03 | État des lieux d'entrée et de sortie | PDF | Brouillon à relire |
| M-04 | Quittance de loyer | Email automatique | Brouillon à relire |
| M-05 | Reçu de paiement partiel | Email automatique | Brouillon à relire |
| M-06 | Appel de loyer | Email automatique | Brouillon à relire |
| M-07 | Avis de révision du loyer | Email en un clic | Brouillon à relire |
| M-08 | Décompte de régularisation des charges | Email en un clic | Brouillon à relire |
| M-09 | Décompte de restitution du dépôt de garantie | Email en un clic | Brouillon à relire |

## M-01 · Rapport fiscal annuel

**Promesse au bailleur :** « Votre déclaration de revenus locatifs en 10 minutes : voici exactement quoi reporter, et où. »

**Quand :** disponible dès le 1er avril pour l'année précédente, avec une alerte à l'ouverture de la campagne de déclaration. Formule Essentiel et supérieures.

### Périmètre de la version 1

| Situation | Formulaire concerné | Couvert en V1 |
| --- | --- | --- |
| Location nue, micro-foncier | Déclaration n° 2042 | Oui |
| Location nue, régime réel | Déclaration annexe n° 2044, puis report sur la n° 2042 | Oui |
| Garage ou parking loué nu | Revenus fonciers, comme la location nue | Oui |
| Location meublée longue durée, micro-BIC | Déclaration n° 2042-C-PRO | Oui |
| Meublé de tourisme classé ou non classé, micro-BIC | Déclaration n° 2042-C-PRO, seuils et abattements propres | Oui, dans le rapport fiscal uniquement |
| Location meublée au régime réel | Liasse comptable (2031, 2033) | Non : renvoi vers un expert-comptable |
| SCI à l'impôt sur le revenu | Déclaration n° 2072, puis quote-part de chaque associé | V2, formule Patrimoine |
| SCI à l'impôt sur les sociétés | Comptabilité d'entreprise | Non |

**Meublés de tourisme (décision du 20 octobre 2026) :** en V1, le bien « meublé de tourisme » existe dans l'application, figure dans le rapport fiscal (classé ou non classé, avec ses seuils et abattements) et range ses factures dans le coffre. Les autres fonctions (bail, quittances, révision, check-up) restent réservées à la location longue durée, ce que l'application indique clairement. Un module saisonnier complet (enregistrement en mairie, taxe de séjour, nuitées, règles propres) est prévu en V2.

**Affichage des cases (décision du 20 octobre 2026) :** chaque montant à reporter est présenté d'abord par son intitulé en langage clair, puis par son code de case ou de ligne en petit, comme une adresse. Exemple : « Revenus fonciers au micro-foncier : vos loyers bruts — case 4BE de la déclaration de revenus ».

### Les questions posées une fois par an

1. Quel régime avez-vous choisi pour vos locations nues ? (Micro-foncier / Réel / Je ne sais pas)
2. Avez-vous d'autres revenus fonciers hors de l'application, par exemple des parts de SCPI ou un autre bien ? Si oui, quel montant brut ?
3. Avez-vous un prêt pour ce bien ? Si oui, montant des intérêts et de l'assurance emprunteur payés dans l'année, d'après le relevé annuel de votre banque.
4. En copropriété : provisions payées au syndic dans l'année, et régularisation de l'année précédente, d'après vos appels de fonds.

Tout le reste vient de l'application : loyers encaissés, factures du coffre, taxe foncière, prime d'assurance propriétaire non occupant, honoraires de gestion.

### Règles de calcul

- **Loyers encaissés, pas loyers dus :** seuls les loyers réellement perçus dans l'année comptent, hors provisions pour charges.
- **Dépôt de garantie :** ce n'est pas un revenu, sauf la part conservée pour couvrir des loyers impayés.
- **Seuil du micro-foncier :** il s'apprécie sur tous les revenus fonciers bruts du foyer, y compris ceux déclarés hors application (question 2). Au-delà de 15 000 €, le régime réel est obligatoire et l'application le signale.
- **Micro-foncier :** le bailleur déclare les loyers bruts en case 4BE ; l'abattement de 30 % est appliqué par l'administration. Les charges et les travaux ne se déduisent pas.
- **Régime réel :** l'application remplit les lignes de la déclaration n° 2044 à partir des données classées. Les travaux de réparation, d'entretien et d'amélioration sont déductibles ; les travaux de construction, de reconstruction ou d'agrandissement ne le sont pas. Le classement de chaque facture est proposé par l'application et confirmé par le bailleur.
- **Déficit foncier :** l'application calcule la part imputable sur le revenu global et la part reportable, selon le plafond indiqué sur le formulaire de l'année.
- **Meublé en micro-BIC :** le bailleur déclare les recettes brutes ; l'abattement de 50 % pour la location meublée longue durée est appliqué par l'administration, sous un seuil de 83 600 € de recettes (article 50-0 du CGI, version en vigueur depuis le 1er juillet 2026).
- **Forfait de 20 € par local :** ajouté automatiquement en ligne 222 pour chaque bien au réel.

### Correspondance avec la déclaration n° 2044 (régime réel)

| Ligne | Intitulé | Source dans Baillome |
| --- | --- | --- |
| 211 | Loyers bruts encaissés | Saisie des loyers, hors provisions pour charges |
| 221 | Frais d'administration et de gestion | Honoraires de gestion, frais de procédure (coffre) |
| 222 | Autres frais de gestion | Forfait de 20 € par local, automatique |
| 223 | Primes d'assurance | Assurance propriétaire non occupant (fiche du bien) |
| 224 | Dépenses de réparation, d'entretien et d'amélioration | Factures classées « déductibles » dans le coffre |
| 227 | Taxes foncières de l'année | Avis de taxe foncière (coffre), hors taxe d'ordures ménagères récupérée |
| 229 | Provisions pour charges payées | Question 4 (copropriété) |
| 230 | Régularisation des provisions de l'année précédente | Question 4 (copropriété) |
| 250 | Intérêts d'emprunt | Question 3 |
| 420 et suivantes | Résultat, déficit, reports en 4BA, 4BB, 4BC | Calcul automatique |

### Contenu du PDF

1. **Page de synthèse :** l'année, le foyer fiscal, le régime retenu, et un encadré « À reporter » avec chaque case et son montant, prêt à recopier.
2. **Détail par bien :** les loyers encaissés mois par mois, puis les charges ligne par ligne, avec leur justificatif.
3. **Liste des justificatifs :** chaque facture retenue, sa date, son montant et son classement, à conserver en cas de contrôle.
4. **Rappels :** les points d'attention de l'année, par exemple le passage obligatoire au réel ou l'engagement de trois ans en cas d'option.

### Mentions obligatoires du document

- « Ce rapport est une aide à la déclaration, établie à partir des informations que vous avez saisies. Il ne constitue pas un conseil fiscal personnalisé. »
- « Numéros de cases et de lignes conformes aux formulaires publiés pour l'année \[N\]. »
- En cas de location meublée au réel ou de situation complexe : recommandation de consulter un expert-comptable.

### Mise à jour annuelle

Les numéros de cases, les seuils et les plafonds sont des constantes vérifiées chaque année à la publication des formulaires officiels, en avril, avant d'ouvrir le rapport aux bailleurs. Les références ci-dessus sont celles des formulaires 2026 (revenus 2025) ; celles de 2027 seront vérifiées avant le lancement.

### Décisions de Sarah

- [x] Contenu et règles à relire et à valider.
- [ ] Intérêts d'emprunt : décidé, saisie une fois par an par le bailleur, d'après le relevé annuel de sa banque.
- [x] Meublés de tourisme : décidé, intégrés au rapport fiscal en V1, module saisonnier complet en V2.
- [x] Affichage : décidé, intitulé clair puis code de case en petit. Cases du micro-BIC (longue durée, meublé de tourisme classé et non classé) à confirmer sur le formulaire officiel 2027 avant le lancement.

## M-02 · Bail d'habitation (nu et meublé)

**Promesse au bailleur :** « Un bail à jour de la loi, déjà rempli, qui vous protège. »

**Quand :** à chaque nouvelle location ou renouvellement, depuis la fiche du bien. Formule Essentiel et supérieures.

### Le cadre légal

Le bail d'une résidence principale, nue ou meublée, doit reprendre le contrat type fixé par le décret n° 2015-587 du 29 mai 2015 : annexe 1 pour le logement nu, annexe 2 pour le meublé. Ce contrat type a été réécrit par le décret n° 2026-596 du 6 juillet 2026, qui s'applique aux baux conclus ou renouvelés à compter du 1er octobre 2026. Les baux signés avant restent valables dans leur rédaction d'origine.

Principales nouveautés intégrées d'office par Baillome :

- **Clause résolutoire** pour défaut de paiement du loyer, des charges ou du dépôt de garantie, avec le délai de six semaines après commandement de payer, désormais écrite dans le modèle.
- **Servitude de résidence principale**, mentionnée lorsqu'elle s'applique au logement.
- **Trois clauses de résiliation facultatives** prévues par le modèle : défaut d'assurance, troubles de voisinage, non-occupation en résidence principale.
- **Numéro de téléphone portable** du bailleur et du locataire, facultatif.

### Structure du bail et source des données

| Partie du contrat type | Contenu | Source dans Baillome |
| --- | --- | --- |
| I. Parties | Bailleur (ou entité), locataire(s), coordonnées, téléphone facultatif | Compte, entité, fiche locataire |
| II. Objet du contrat | Adresse, type d'habitat, période de construction, surface habitable, nombre de pièces, équipements, chauffage et eau chaude, locaux et parties communes | Fiche du bien |
| II. Performance énergétique | Classe du DPE, niveau minimal exigé et calendrier, estimation des dépenses annuelles d'énergie | Règle R-01 et DPE du coffre |
| III. Durée | Date de prise d'effet ; 3 ans (bailleur personne physique) ou 6 ans (personne morale) en nu ; 1 an, ou 9 mois pour un étudiant, en meublé | Calcul automatique |
| IV. Conditions financières | Loyer, encadrement éventuel, dernier loyer du locataire précédent s'il est parti depuis moins de 18 mois, révision (trimestre IRL), charges (provisions ou forfait en meublé), modalités de paiement | Fiche du bien, règle R-02 |
| V. Travaux | Travaux réalisés depuis le dernier bail, le cas échéant | Coffre à factures |
| VI. Garanties | Montant du dépôt de garantie | Règle R-03 |
| VII. Solidarité | Clause de solidarité en colocation | Fiche locataire |
| VIII. Clause résolutoire | Rédaction du nouveau contrat type, six semaines | Texte figé du modèle |
| X. Conditions particulières | Clauses facultatives du modèle et clauses libres contrôlées | Choix du bailleur |
| XI. Annexes | Voir ci-dessous | Coffre et documents générés |

### Annexes jointes automatiquement

- Notice d'information sur les droits et obligations des locataires et des bailleurs, dans sa version en vigueur.
- Dossier de diagnostic technique (règle R-04).
- État des lieux d'entrée (matrice M-03).
- En meublé : inventaire et état détaillé du mobilier, avec la liste minimale fixée par le décret n° 2015-981 du 31 juillet 2015.
- En copropriété : extraits du règlement de copropriété concernant la destination de l'immeuble, les parties privatives et communes, et la répartition des charges.
- Le cas échéant : autorisation préalable de mise en location, si la commune l'exige.
- Acte de cautionnement, s'il y a un garant : document distinct, objet d'une matrice dédiée.

### Contrôles avant génération

Le bail ne peut pas être finalisé tant qu'un point bloquant subsiste. Chaque blocage est expliqué au bailleur dans le ton de l'application.

| Contrôle | Effet |
| --- | --- |
| Diagnostic obligatoire absent ou périmé | Bloquant (règle R-04) |
| Logement sous le niveau de performance minimal (classe G aujourd'hui, F à partir de 2028) | Bloquant (règle R-01) |
| Dépôt de garantie au-delà du plafond | Bloquant (règle R-03) |
| Surface habitable non renseignée | Bloquant |
| Identifiant fiscal du logement absent ou invalide (12 chiffres, les 2 premiers correspondant au département du bien) | Bloquant, sauf bail de garage seul et outre-mer avant 2028 |
| Hausse de loyer entre deux locataires dans une commune où elle est encadrée | Avertissement, avec le montant maximal calculé |
| Clause libre interdite par la loi (frais de quittance, prélèvement imposé, pénalités, interdiction générale d'animaux…) | Clause refusée, avec l'explication |

L'identifiant fiscal est obligatoire dans les baux de résidence principale depuis le 1er janvier 2024 (article 5 du décret du 18 août 2023). Il se saisit une fois dans la fiche du bien, avec une aide « Où le trouver ? » renvoyant à la rubrique « Biens immobiliers » de l'espace particulier sur impots.gouv.fr, et en précisant de choisir le local d'habitation et non une annexe (cave, parking).

### Version du modèle

Chaque bail généré enregistre la version du contrat type utilisée. Au renouvellement d'un bail signé avant le 1er octobre 2026, Baillome propose automatiquement le nouveau modèle.

### Signature électronique (V1)

Le droit français reconnaît la signature électronique dès lors qu'elle repose sur un procédé fiable d'identification garantissant son lien avec l'acte (article 1367 du Code civil). Le règlement européen eIDAS distingue trois niveaux : simple, avancée et qualifiée. Seule la signature **qualifiée** bénéficie d'une présomption de fiabilité (décret n° 2017-1416 du 28 septembre 2017) : c'est alors à celui qui la conteste de prouver qu'elle n'est pas fiable. Avec une signature avancée, c'est au bailleur de prouver la fiabilité du procédé en cas de contestation.

| Document | Niveau retenu (décision du 21 octobre 2026) | Pourquoi |
| --- | --- | --- |
| Bail et ses annexes | Avancée par défaut (code SMS, dossier de preuve) ; qualifiée en option au choix du bailleur | Standard du marché (pratique des agences), parcours de deux minutes, coût environ quatre fois moindre ; la validité du bail est identique, seule la charge de la preuve diffère en cas de contestation |
| Acte de cautionnement | Avancée avec vérification de la pièce d'identité de la caution ; qualifiée en option | Mention de l'article 2297 apposée par la caution elle-même : le procédé doit garantir qu'elle seule peut l'effectuer (code civil, article 1174). Point soumis à l'avocat |
| État des lieux d'entrée et de sortie | Avancée, avec code SMS | Document contradictoire, signé sur place |
| Avenants (dont avenant de colocation), accords ponctuels | Avancée | Même logique que le bail |
| Bail de garage seul | Avancée par défaut, qualifiée en option | Décision du 20 octobre 2026, confirmée |

La décision du 20 octobre 2026 (bail et cautionnement en signature qualifiée) est remplacée par celle-ci, après retour d'expérience de Sarah : les plateformes utilisées par les agences pour les baux demandent seulement le nom, l'email et un code SMS.

**Exigences techniques non négociables :**

- Prestataire de services de confiance **qualifié**, inscrit sur la liste de confiance européenne, avec hébergement des données dans l'Union européenne.
- Vérification d'identité de chaque signataire selon un procédé reconnu pour la signature qualifiée (pièce d'identité et vérification à distance).
- Le bail et toutes ses annexes signés dans une seule enveloppe, pour qu'aucune annexe ne puisse être contestée.
- Horodatage qualifié, dossier de preuve (journal des étapes, adresses, appareils) et format PDF signé conservé dans le coffre du bien, avec un exemplaire envoyé à chaque partie.
- Coût de chaque signature intégré au prix des formules (à chiffrer auprès des prestataires).

**Limite honnête :** aucune signature n'est incontestable à 100 %. La signature qualifiée est cependant le niveau le plus fort prévu par la loi, et elle renverse la charge de la preuve en faveur du bailleur.

### Messages au bailleur (exemples)

- « Bonne nouvelle : votre bail utilise le tout dernier modèle officiel, en vigueur depuis le 1er octobre 2026. Beaucoup de modèles qui circulent sur Internet sont déjà périmés. »
- « Cette clause ne peut pas figurer dans un bail : la loi interdit de faire payer les quittances au locataire. Pas d'inquiétude, nous l'avons retirée pour vous. »

### Décisions de Sarah

- [ ] Contenu et contrôles à relire et à valider.
- [ ] Types de bail : décidé, en V1 le nu, le meublé, la colocation à bail unique et le bail de garage seul ; le bail mobilité en V2.
- [ ] Signature : décidé, signature électronique dès la V1, avec le niveau de sécurité le plus élevé pour le bail et le cautionnement (voir la section Signature électronique).
- [ ] Clauses facultatives : décidé, défaut d'assurance et troubles de voisinage cochées par défaut avec leur explication en une phrase ; non-occupation en résidence principale proposée uniquement si le logement est soumis à la servitude, ce que l'application demande au bailleur.

## M-03 · État des lieux d'entrée et de sortie

**Sources, vérifiées sur Legifrance le 20 octobre 2026 (versions en vigueur fournies par Sarah) :** loi du 6 juillet 1989, articles 3-2, 4, 7 (c et d), 22 et 25-5 ; décret n° 2016-382 du 30 mars 2016 ; décret n° 87-712 du 26 août 1987 et son annexe ; code civil, articles 1730 et 1731 (garage seul).

**Promesse au bailleur :** « Un état des lieux complet, photographié et signé sur place, qui vous protège le jour de la sortie. »

### Les règles de forme

| Règle | Source | Dans Baillome |
| --- | --- | --- |
| Établi à la remise et à la restitution des clés, contradictoirement et amiablement par les parties ou par un tiers mandaté par elles, en autant d'exemplaires que de parties, et joint au bail | Loi, article 3-2 | Réalisé sur place dans l'application, en présence des deux parties |
| Porte sur l'ensemble des locaux et équipements privatifs mentionnés au bail | Décret 2016-382, article 1er | La grille est construite à partir de la fiche du bien et des locaux accessoires du bail (cave, parking) |
| Le logement ne contient que les meubles ou équipements mentionnés au contrat | Décret 2016-382, article 3, 1° | Contrôle de cohérence avec l'inventaire (meublé) et les équipements du bail |
| La forme permet de comparer l'entrée et la sortie : document unique ou documents distincts de présentation similaire | Décret 2016-382, article 3, 2° | Même grille, même ordre des pièces et des éléments, à l'entrée et à la sortie |
| Établi sur papier ou sous forme électronique, remis à chaque partie au moment de la signature | Décret 2016-382, article 3, 3° | Signature électronique avancée sur place, PDF envoyé immédiatement à chaque partie et rangé dans le coffre |
| En meublé : inventaire et état détaillé du mobilier, dans les mêmes formes, sans autre facturation que celle de l'état des lieux | Loi, article 25-5 | Inventaire intégré au même parcours (annexe déjà maquettée) |

### Les mentions obligatoires (décret 2016-382, article 2)

| À l'entrée et à la sortie | Source dans Baillome | Contrôle |
| --- | --- | --- |
| Type d'état des lieux (entrée ou sortie) et date | Automatique | Bloquant |
| Localisation du logement | Fiche du bien | Bloquant |
| Nom ou dénomination des parties, domicile ou siège du bailleur | Compte, fiche locataire | Bloquant |
| Le cas échéant, mandataire chargé de l'état des lieux | Saisie | Si mandataire |
| Relevés des compteurs individuels d'eau ou d'énergie | Saisie avec photo du compteur | Bloquant en présence d'un chauffage ou d'une eau chaude individuels, ou collectifs avec comptage individuel (loi, article 3-2) |
| Détail et destination des clés ou autres moyens d'accès (privatifs et communs) | Saisie : type, nombre, usage | Bloquant |
| Pour chaque pièce : état précis des sols, murs, plafonds, équipements et éléments, avec observations, réserves et images possibles | Grille pièce par pièce, photos | Bloquant si une pièce n'est pas décrite |
| Signature des parties ou des mandataires | Signature électronique | Bloquant |

| À la sortie uniquement | Source dans Baillome | Contrôle |
| --- | --- | --- |
| Adresse du nouveau domicile ou du lieu d'hébergement du locataire | Saisie par le locataire | Bloquant (elle conditionne aussi la pénalité de retard du dépôt de garantie, article 22) |
| Date de l'état des lieux d'entrée | Automatique | Bloquant |
| Évolutions de l'état de chaque pièce depuis l'entrée | Comparaison côte à côte avec l'entrée, photos de l'entrée affichées | Signalées élément par élément |

### Après l'état des lieux d'entrée

| Droit du locataire | Source | Dans Baillome |
| --- | --- | --- |
| Demander à compléter l'état des lieux d'entrée dans les dix jours de son établissement ; en cas de refus, saisir la commission départementale de conciliation | Loi, article 3-2 | Lien envoyé au locataire avec l'état des lieux : il peut ajouter des observations et des photos pendant dix jours. Le bailleur accepte ou refuse ; en cas de refus, le locataire est informé de la possibilité de saisir la commission |
| Pendant le premier mois de la période de chauffe, demander que l'état des lieux soit complété par l'état des éléments de chauffage | Loi, article 3-2 | Rappel au locataire au début de la période de chauffe suivant l'entrée, et même mécanisme d'ajout |

### Si l'état des lieux ne peut pas être établi à l'amiable

Il est établi par un commissaire de justice, à l'initiative de la partie la plus diligente, à frais partagés par moitié et à un coût fixé par décret ; les parties sont avisées au moins sept jours à l'avance par lettre recommandée avec avis de réception. La partie qui a fait obstacle à l'état des lieux, ou à la remise d'un exemplaire, ne peut pas invoquer la présomption de bon état de l'article 1731 du code civil (loi, article 3-2). **Dans Baillome :** explication de la procédure et rappel de ses conséquences, sans automatisation.

### Ce qui est interdit (loi, article 4)

- Faire payer au locataire l'état des lieux de sortie, sauf s'il est établi par un commissaire de justice dans le cas de l'article 3-2 (k).
- Faire s'engager le locataire par avance à rembourser des réparations locatives sur une estimation faite unilatéralement par le bailleur (f).
- Prévoir que le locataire est automatiquement responsable des dégradations constatées (q), ou la responsabilité collective des locataires pour un élément commun (e).

Baillome n'insère aucune de ces clauses et refuse de les ajouter.

### De l'état des lieux de sortie aux retenues sur le dépôt de garantie

**Ce que dit la loi :** le locataire répond des dégradations et pertes survenues pendant le bail, sauf force majeure, faute du bailleur ou fait d'un tiers qu'il n'a pas introduit (article 7, c). Il prend en charge l'entretien courant, les menues réparations et les réparations locatives définies par décret, **sauf si elles sont occasionnées par vétusté, malfaçon, vice de construction, cas fortuit ou force majeure** (article 7, d). La vétusté est l'état d'usure ou de détérioration résultant du temps ou de l'usage normal (décret 2016-382, article 4). Les retenues doivent être dûment justifiées (article 22).

**Dans Baillome**, pour chaque évolution constatée entre l'entrée et la sortie, le bailleur classe l'écart :

| Classement | Imputable au locataire ? | Justificatif demandé |
| --- | --- | --- |
| Réparation locative (liste de l'annexe du décret 87-712, non exhaustive : « notamment ») | Oui, sauf vétusté | Devis ou facture |
| Dégradation ou perte (article 7, c) | Oui, sauf force majeure, faute du bailleur ou fait d'un tiers | Devis ou facture, photos d'entrée et de sortie |
| Vétusté, malfaçon, vice de construction, cas fortuit, force majeure | Non | Aucun : l'application refuse la retenue |

Les retenues alimentent le décompte de restitution du dépôt de garantie (matrice M-09), avec les délais de l'article 22 : un mois si l'état des lieux de sortie est conforme à l'entrée, deux mois sinon, provision de 20 % au plus en immeuble collectif jusqu'à l'arrêté annuel des comptes, majoration de 10 % du loyer mensuel par mois de retard commencé, sauf si le locataire n'a pas donné sa nouvelle adresse. Le guide de l'état des lieux et des retenues reste la référence pédagogique du bailleur.

### Grille de vétusté

Le décret 2016-382 (article 4) permet aux parties de convenir, dès la signature du bail, d'une grille de vétusté choisie parmi celles d'un accord collectif national (article 41 ter de la loi du 23 décembre 1986) ou local (article 42), même si le logement ne relève pas du secteur couvert par l'accord. Cette grille fixe au minimum, pour les principaux matériaux et équipements, une durée de vie théorique et des coefficients d'abattement annuels. **Décision déjà prise : pas de grille de vétusté dans Baillome en V1.** Si elle est envisagée en V2, il faudra récupérer le texte d'un accord collectif en vigueur.

### Relevés d'index et diagnostic de performance énergétique

Le propriétaire complète les états des lieux par les relevés des index de chaque énergie, et l'extrait correspondant est mis à disposition du diagnostiqueur qui en fait la demande (loi, article 3-2). **Dans Baillome :** les relevés sont stockés dans la fiche du bien et peuvent être exportés pour le diagnostiqueur.

### Garage seul

Le décret 2016-382 ne s'applique qu'aux logements de la loi de 1989. Pour un garage seul, l'état des lieux relève du code civil : le preneur rend la chose telle qu'il l'a reçue, sauf vétusté ou force majeure (article 1730) ; sans état des lieux, il est présumé l'avoir reçue en bon état (article 1731). Baillome propose un état des lieux simplifié : localisation, moyens d'accès remis, état de la porte, du sol, des murs et de l'éclairage, photos, signatures.

### Décisions de Sarah

- [ ] Contenu et contrôles à relire et à valider.
- [ ] Décidé le 20 octobre 2026 : la loi ne définissant pas la période de chauffe, rappel au locataire le 1er octobre suivant son entrée, ajustable par le bailleur.
- [ ] Décidé le 20 octobre 2026 : les compléments demandés par le locataire sont intégrés après validation du bailleur ; en cas de refus, le locataire est informé de la possibilité de saisir la commission départementale de conciliation (loi, article 3-2).

## M-04 · Quittance de loyer

**Sources (Legifrance, versions en vigueur fournies par Sarah) :** loi du 6 juillet 1989, articles 3-4, 4 (p), 7 (g), 21 et 23-1.

| Règle | Source | Dans Baillome |
| --- | --- | --- |
| Le bailleur transmet gratuitement une quittance au locataire qui en fait la demande | Article 21 | Quittance générée dès qu'un loyer est noté comme payé en entier |
| Elle porte le détail des sommes versées, en distinguant le loyer et les charges | Article 21 | Lignes séparées : loyer, charges (provisions ou forfait) |
| La prime d'assurance pour compte (par douzième) est portée sur la quittance | Article 7, g | Ligne ajoutée si l'option est active |
| La contribution pour le partage des économies de charges est portée sur la quittance | Article 23-1 | Ligne ajoutée si elle s'applique |
| Aucuns frais de quittance ou d'avis d'échéance ne peuvent être facturés au locataire | Articles 21 et 4 (p) | Aucune ligne de frais possible |
| Transmission dématérialisée avec l'accord exprès du locataire | Article 21 | Envoi automatique par email seulement si l'accord est enregistré (fiche locataire) ; sinon PDF à remettre |
| Refuser de délivrer une quittance ou un reçu, ou dissimuler cette obligation, est puni d'un an d'emprisonnement et de 20 000 € d'amende | Article 3-4 | Argument pédagogique dans l'application |

**Contenu du document :** bailleur, locataire, adresse du logement, période concernée, détail des sommes (loyer, charges, contribution, assurance pour compte), total, date du paiement. Mentions d'usage (non imposées par les textes) : « pour acquit » et la précision que la quittance vaut pour la période indiquée.

## M-05 · Reçu de paiement partiel

| Règle | Source | Dans Baillome |
| --- | --- | --- |
| Si le locataire effectue un paiement partiel, le bailleur est tenu de délivrer un reçu | Article 21 | Généré à la place de la quittance dès qu'un paiement est inférieur à l'échéance |
| Refus de délivrer un reçu : un an d'emprisonnement et 20 000 € d'amende | Article 3-4 | Le reçu part automatiquement si l'accord d'envoi par email est donné |
| Le paiement partiel réalisé en application de l'article L. 843-1 du code de la construction et de l'habitation (aides au logement) ne peut être considéré comme un défaut de paiement | Article 7, a | Option « paiement partiel lié aux aides au logement » : le montant n'est alors pas signalé comme impayé. Texte du code de la construction à récupérer pour préciser le cas |

**Contenu du document :** montant reçu, date, période concernée, montant restant dû pour cette période. Le document s'intitule « Reçu » et ne doit jamais porter la mention « quittance ».

## M-06 · Appel de loyer (avis d'échéance)

Les textes fournis n'imposent pas d'envoyer un avis d'échéance, mais ils l'encadrent quand il existe.

| Règle | Source | Dans Baillome |
| --- | --- | --- |
| Aucuns frais liés à la gestion de l'avis d'échéance ne peuvent être facturés | Article 21 | Gratuit, aucune ligne de frais |
| La prime d'assurance pour compte est inscrite sur l'avis d'échéance | Article 7, g | Ligne ajoutée si l'option est active |
| La contribution pour le partage des économies de charges est inscrite sur l'avis d'échéance | Article 23-1 | Ligne ajoutée si elle s'applique |
| Le paiement mensuel est de droit à la demande du locataire | Article 7, a | Périodicité mensuelle proposée par défaut |
| Interdiction d'imposer le prélèvement automatique ou des traites | Article 4, c | Le prélèvement n'est proposé que comme un choix du locataire |

**Contenu du document :** période, loyer, charges, contribution et assurance le cas échéant, total, date d'exigibilité, modalités de paiement prévues au bail. Envoi automatique à la date choisie par le bailleur (le 25 par défaut, comme sur les maquettes).

## M-07 · Avis de révision du loyer

**Sources :** loi du 6 juillet 1989, articles 7-1, 17-1 et 25-9 ; règle R-02 déjà validée.

| Règle | Source | Dans Baillome |
| --- | --- | --- |
| Révision seulement si le bail le prévoit, une fois par an, à la date convenue ou à défaut au terme de chaque année du contrat | Article 17-1, I | Date de révision lue dans le bail |
| Hausse plafonnée à la variation de l'indice de référence des loyers (IRL) ; à défaut de trimestre de référence au bail, c'est le dernier indice publié à la signature | Article 17-1, I | Calcul automatique à partir des indices Insee |
| Le bailleur doit manifester sa volonté de réviser dans l'année suivant la date de prise d'effet, sinon il est réputé y avoir renoncé pour l'année écoulée ; la révision prend effet à compter de sa demande | Article 17-1, I | Alerte 45 jours avant la date de révision, relance jusqu'à la fin du délai d'un an, aucune rétroactivité |
| L'action en révision du loyer est prescrite un an après la date convenue au bail | Article 7-1 | Même délai d'un an |
| Aucune révision ni majoration pour les logements classés F ou G | Article 17-1, III (applicable aux baux conclus, renouvelés ou tacitement reconduits depuis le 24 août 2022) | Révision bloquée, avec contrôle de la date du bail ou de sa dernière reconduction |
| Meublé : mêmes règles de révision | Article 25-9 | Identique |

**Contenu du document :** loyer actuel, trimestre et valeurs de l'IRL (référence et nouvel indice), calcul, nouveau loyer, date d'effet (date de la demande), référence à l'article 17-1. Envoi par email en un clic, confirmation de lecture facultative (décision du 20 octobre 2026).

## M-08 · Décompte de régularisation des charges

**Sources :** loi du 6 juillet 1989, articles 7-1, 8-1 (V), 23 et 25-10 ; décret n° 87-713 du 26 août 1987 et son annexe.

**Ce qui est récupérable :** uniquement les charges de la liste annexée au décret, en huit rubriques : I. ascenseurs et monte-charge ; II. eau froide, eau chaude et chauffage collectif ; III. installations individuelles (récupérables seulement lorsque le bailleur effectue l'entretien au lieu et place du locataire, article 3 du décret) ; IV. parties communes intérieures ; V. espaces extérieurs ; VI. hygiène ; VII. équipements divers ; VIII. impositions et redevances (droit de bail, taxe ou redevance d'enlèvement des ordures ménagères, taxe de balayage).

**Règles de calcul du décret à intégrer :** gardien ou concierge assurant l'entretien des parties communes et l'élimination des rejets : 75 % de sa rémunération et des charges sociales et fiscales ; une seule de ces deux tâches : 40 % ; employé d'immeuble : 100 % ; encadrement technique des services en régie : 10 % ; certains éléments de rémunération exclus (salaire en nature, primes de départ, mutuelle, etc.) ; le remplacement d'un équipement n'est assimilé à une menue réparation que si son coût ne dépasse pas celui de la réparation (article 2).

| Règle | Source | Dans Baillome |
| --- | --- | --- |
| Provisions avec régularisation annuelle ; demandes de provisions justifiées par la régularisation précédente et, en copropriété, par le budget prévisionnel | Article 23 | Provision proposée à partir du décompte précédent et du budget du syndic |
| Un mois avant la régularisation, communication du décompte par nature de charges, du mode de répartition (immeubles collectifs) et, le cas échéant, de la note sur le chauffage et l'eau chaude collectifs | Article 23 | Le décompte est envoyé au moins un mois avant toute demande de paiement ou tout remboursement |
| Pièces justificatives tenues à disposition pendant six mois ; récapitulatif transmis à la demande | Article 23 | Factures du coffre partageables avec le locataire pendant six mois |
| Régularisation non faite avant la fin de l'année civile suivant l'exigibilité : paiement par douzième si le locataire le demande | Article 23 | Alerte au bailleur ; échéancier en douze mois proposé |
| Forfait de charges (meublé, colocation) : aucune régularisation | Articles 8-1, V et 25-10 | Pas de décompte pour un bail au forfait |
| Prescription de trois ans | Article 7-1 | Alerte avant l'expiration du délai |

**Contenu du document :** période, total des provisions versées, charges réelles par rubrique du décret, mode de répartition, solde (complément dû ou trop-perçu à rembourser), nouvelle provision proposée, liste des justificatifs.

## M-09 · Décompte de restitution du dépôt de garantie

**Sources :** loi du 6 juillet 1989, articles 22 et 25-6 ; matrice M-03 pour les retenues.

| Règle | Source | Dans Baillome |
| --- | --- | --- |
| Restitution dans un mois si l'état des lieux de sortie est conforme à l'entrée, deux mois sinon, à compter de la remise des clés en main propre ou par lettre recommandée | Article 22 | Compte à rebours dès la saisie de la remise des clés |
| Déduction des sommes restant dues et de celles dont le bailleur pourrait être tenu à la place du locataire, sous réserve qu'elles soient dûment justifiées | Article 22 | Retenues reprises de l'état des lieux de sortie (M-03), avec devis ou factures obligatoires |
| Le locataire indique sa nouvelle adresse lors de la remise des clés | Article 22 | Champ obligatoire de l'état des lieux de sortie |
| Immeuble collectif : arrêté des comptes provisoire et provision de 20 % au plus, si elle est justifiée, jusqu'à l'arrêté annuel des comptes ; solde dans le mois suivant l'approbation des comptes ; les parties peuvent solder immédiatement à l'amiable | Article 22 | Option de provision limitée à 20 %, avec rappel du solde à verser |
| Majoration de 10 % du loyer mensuel en principal par mois de retard commencé, sauf si le locataire n'a pas donné sa nouvelle adresse | Article 22 | Calcul automatique en cas de retard, affiché au bailleur avant l'échéance |
| Le dépôt ne porte pas intérêt et n'est jamais révisé | Article 22 | Montant figé |
| En cas de vente du logement, la restitution incombe au nouveau bailleur | Article 22 | Information lors de la sortie d'un bien du patrimoine |
| Meublé : dépôt limité à deux mois de loyer en principal | Article 25-6 | Règle R-03 |

**Contenu du document :** montant du dépôt, date de remise des clés, retenues ligne par ligne avec leur justificatif, provision éventuelle de 20 %, solde à restituer, date limite de restitution. En cas de désaccord sur un litige de moins de 5 000 €, rappel de la tentative de conciliation obligatoire avant le juge (notice d'information du 18 octobre 2026).

## Matrices à ajouter à la liste

- **M-10 · Avenant d'entrée d'un nouveau colocataire** : rédigée ci-dessous.
- **M-11 · Acte de cautionnement** : rédigée ci-dessous.

## Décisions de Sarah (M-04 à M-09)

- [ ] Contenu et règles des six matrices à relire et à valider.
- [ ] Décidé le 21 octobre 2026 : la quittance porte les mentions d'usage « pour acquit » et « vaut pour la période indiquée ».

## M-10 · Avenant d'entrée d'un nouveau colocataire

**Sources (Legifrance, versions en vigueur fournies par Sarah) :** loi du 6 juillet 1989, articles 7 (g), 8-1 (VI) et 22-1 ; code civil, article 1375.

**À quoi il sert :** la solidarité d'un colocataire qui part, et celle de sa caution, prennent fin à la date d'effet de son congé **lorsqu'un nouveau colocataire figure au bail** ; à défaut, au plus tard six mois après cette date (article 8-1, VI). L'avenant est l'acte qui fait figurer le remplaçant au bail.

| Contenu | Source | Dans Baillome |
| --- | --- | --- |
| Références du bail initial (date, logement, parties) | Bail en cours | Automatique |
| Colocataire sortant et date d'effet de son congé | Article 8-1, VI | Repris du congé enregistré |
| Identité du nouveau colocataire et date à laquelle il figure au bail | Article 8-1, VI | Fiche locataire du nouvel entrant |
| Application au nouveau colocataire de toutes les clauses du bail, y compris la clause de solidarité | Bail (rubrique VII) | Clause de reprise |
| Justification de l'assurance du nouveau colocataire, ou extension de l'assurance pour compte | Article 7, g | Attestation demandée, ou option assurance pour compte |
| Le cas échéant, acte de cautionnement du nouveau colocataire, qui le désigne nommément | Articles 8-1, VI et 22-1 | Génère la matrice M-11 |
| Un exemplaire par partie ; en électronique, chaque partie dispose d'un exemplaire sur support durable | Code civil, article 1375 | Envoi à chaque signataire, copie dans le coffre |

**Points que la loi ne règle pas, à valider par l'avocat :** qui doit signer l'avenant (Baillome propose : le bailleur, tous les colocataires restants et le nouveau colocataire) ; le sort de la part de dépôt de garantie du sortant ; l'utilité d'un état des lieux partiel lors du changement.

## M-11 · Acte de cautionnement

**Sources (Legifrance, versions en vigueur fournies par Sarah) :** loi du 6 juillet 1989, articles 8-1 (VI), 22-1 et 24 ; code civil, articles 2292 à 2301.

### Quand un cautionnement peut être demandé

| Règle | Source | Dans Baillome |
| --- | --- | --- |
| Interdit, à peine de nullité, si le bailleur a souscrit une assurance ou une autre garantie des obligations locatives, sauf pour un étudiant ou un apprenti (le dépôt de garantie n'est pas concerné) | Article 22-1 | Bloquant si une assurance loyers impayés est déclarée dans la fiche du bien |
| Bailleur personne morale (hors société civile familiale jusqu'au quatrième degré) : seulement si la caution est apportée par un organisme de la liste fixée par décret, ou pour un étudiant non boursier | Article 22-1 | Bloquant hors de ces cas pour une SCI non familiale |
| Interdiction de refuser une caution au motif qu'elle n'a pas la nationalité française ou ne réside pas en métropole | Article 22-1 | Aucun critère de ce type dans la fiche garant |
| Le cautionnement doit être exprès et ne peut être étendu au-delà de ses limites | Code civil, article 2294 | Acte distinct, jamais une simple ligne du bail |
| Il ne peut excéder ce qui est dû par le locataire, sous peine d'être réduit ; il peut ne couvrir qu'une partie de la dette | Code civil, article 2296 | Plafond proposé, modifiable à la baisse |

### Contenu obligatoire, à peine de nullité (article 22-1)

1. Le montant du loyer et les conditions de sa révision, tels qu'ils figurent au bail.
2. La reproduction de l'avant-dernier alinéa de l'article 22-1 : « Lorsque le cautionnement d'obligations résultant d'un contrat de location conclu en application du présent titre ne comporte aucune indication de durée ou lorsque la durée du cautionnement est stipulée indéterminée, la caution peut le résilier unilatéralement. La résiliation prend effet au terme du contrat de location, qu'il s'agisse du contrat initial ou d'un contrat reconduit ou renouvelé, au cours duquel le bailleur reçoit notification de la résiliation. »
3. La mention de l'article 2297 du code civil, apposée par la caution personne physique elle-même : elle s'engage en qualité de caution à payer au créancier ce que lui doit le débiteur en cas de défaillance de celui-ci, dans la limite d'un montant en principal et accessoires exprimé en toutes lettres et en chiffres. En cas de différence, la somme en lettres prévaut.
4. Si la caution renonce aux bénéfices de discussion et de division (caution solidaire), elle le reconnaît dans cette même mention ; à défaut, elle les conserve (article 2297).
5. En colocation : l'identification du colocataire pour lequel l'extinction de la solidarité met fin à l'engagement de la caution (article 8-1, VI).
6. La remise à la caution d'un exemplaire du bail, également prescrite à peine de nullité.

### Dans Baillome

- **Saisie de la mention par la caution elle-même** dans le parcours de signature, avec le montant en lettres et en chiffres. L'application vérifie que les deux montants concordent avant de permettre la signature. **Base légale vérifiée le 21 octobre 2026 (code civil, article 1174) : lorsqu'une mention écrite de la main même de celui qui s'oblige est exigée, il peut l'apposer sous forme électronique si les conditions de cette apposition sont de nature à garantir qu'elle ne peut être effectuée que par lui-même. Conditions retenues par Baillome : la caution saisit sa mention au clavier, elle-même, dans une session ouverte après la vérification de son identité exigée pour la signature qualifiée, et la mention est scellée dans le document signé ; aucune mention ne peut être préremplie par le bailleur. L'écrit électronique doit offrir une lisibilité équivalente au papier (article 1176), et l'exigence de plusieurs exemplaires est satisfaite si le destinataire peut l'imprimer (article 1177)**.
- **Montant du plafond** : Baillome propose un calcul transparent (loyer et charges sur la durée de l'engagement, plus les accessoires), que le bailleur peut baisser mais pas porter au-delà de ce que doit le locataire.
- **Durée** : choix entre une durée déterminée (la caution ne peut pas résilier avant le terme) et une durée indéterminée (résiliable par la caution, avec effet au terme du bail en cours).
- **Signature électronique** avancée avec vérification de la pièce d'identité de la caution, qualifiée en option (décision du 21 octobre 2026), avec remise automatique d'un exemplaire du bail.
- **Pour la suite (impayés, formule Gestion) :** le commandement de payer doit être signifié à la caution dans les quinze jours de sa signification au locataire, à défaut de quoi elle ne peut être tenue des pénalités ou intérêts de retard (article 24). Alerte prévue dans le module impayés.

### Décisions de Sarah et points pour l'avocat

- [ ] Décidé le 21 octobre 2026 : durée déterminée par défaut, couvrant le bail initial et sa première reconduction ; durée indéterminée possible au choix du bailleur.
- [ ] Décidé le 21 octobre 2026 : caution solidaire proposée par défaut, la renonciation aux bénéfices de discussion et de division étant reconnue par la caution dans sa mention (article 2297).
- [ ] Avocat : application des articles 2299 (mise en garde) et 2300 (disproportion), qui visent le « créancier professionnel », à un bailleur particulier, à une SCI ou à un loueur en meublé.
- [ ] Décidé le 21 octobre 2026 : avenant de colocation en signature avancée, comme le bail.

## M-12 · Extrait de compte locataire (version 1, décision du 21 octobre 2026)

**À quoi il sert :** en cas de conflit, d'impayé, de demande du locataire ou de besoin comptable, le bailleur produit en un geste l'historique du compte de son locataire.

**Choix de la période :** « Tout le compte », depuis la prise d'effet du bail ; ou « De date à date », avec une date de début et une date de fin. Pour une période bornée, le solde antérieur est reporté en première ligne.

| Contenu | Source dans Baillome |
| --- | --- |
| Locataire, bailleur, bien, date du bail, montant et périodicité de l'échéance, date d'établissement | Fiches et bail |
| Pour chaque écriture : date, libellé, montant appelé, montant encaissé, solde progressif | Appels de loyer (date d'appel), saisie des encaissements (date de réception), sommes ponctuelles (régularisations, remboursements) |
| Totaux de la période et solde final (débiteur ou créditeur) | Calcul automatique |
| Dépôt de garantie, pour information et hors solde | Fiche du bail |

**Règles :** les loyers et charges courants et les sommes ponctuelles apparaissent avec leur libellé propre ; un paiement partiel figure tel quel ; le dépôt de garantie n'est jamais imputé sur le solde en cours de bail. L'action en paiement des loyers et charges se prescrit par trois ans (loi du 6 juillet 1989, article 7-1) : l'application le rappelle si la période choisie contient des sommes impayées anciennes.

**Diffusion :** PDF au format imprimable, rangé dans le coffre du bien. **L'extrait n'est jamais envoyé automatiquement au locataire** : le bailleur l'envoie s'il le souhaite, en cliquant sur le bouton « Envoyer au locataire par email » (décision du 21 octobre 2026).

**Point d'entrée :** fiche locataire et écran Loyers.

## Navigation de l'application (décision du 21 octobre 2026)

Barre du bas à cinq onglets : Accueil, Biens, Loyers (au centre), Agenda, Docs. Le compte et les réglages sont accessibles depuis l'avatar en haut de l'accueil.

## Sources consultées

- [impots.gouv.fr : déclaration n° 2044 des revenus fonciers 2025](https://www.impots.gouv.fr/sites/default/files/formulaires/2044/2026/2044_5483.pdf)
- [impots.gouv.fr : notice de la déclaration n° 2044](https://www.impots.gouv.fr/sites/default/files/formulaires/2044/2026/2044_5487.pdf)
- [impots.gouv.fr : brochure pratique 2026, revenus fonciers](https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/10-rev_fonciers_157a160.pdf)
- [Smartloc : déclaration micro-BIC, seuils 2025 et 2026](https://www.smartloc.fr/blog/declaration-micro-bic-2/)
- [PAP : revenus de la location meublée](https://www.pap.fr/bailleur/impots-taxes/comment-declarer-vos-revenus-locatifs/a6210/les-revenus-issus-de-la-location-meublee-les-bic)

* [Legifrance : décret n° 2015-587, annexe 2 (contrat type du logement meublé)](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000043842249)
* [Village de la Justice : ce que le décret du 6 juillet 2026 change pour les bailleurs](https://www.village-justice.com/articles/nouveau-contrat-location-2026-que-decret-juillet-2026-change-pour-les-bailleurs,58313.html)
* [Juriguide : les quatre modifications du contrat type au 1er octobre 2026](https://www.juriguide.com/2026/10/01/bail-modifications-contrat-type/)
* [Hagnéré Investissement : clause résolutoire réécrite et date d'application](https://www.hagnere-investissement.fr/ressources/blog/contrat-type-location-bailleur)
* [Bail de location vide : annexes à joindre](https://baildelocation.com/bail-de-location-vide/)
