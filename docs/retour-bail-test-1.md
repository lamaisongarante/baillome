# Retour sur le premier projet de bail généré (Test_bail.pdf, 25 pages)

Relecture du 22 octobre 2026 par Sarah et Claude. À traiter avant toute nouvelle génération.

## A. Mise en page : le PDF doit reproduire la maquette Bail-Editorial

Référence : design/documents/doc-bail-page1.png et design/sources-html/Bail-Editorial.dc.html (+ Bail-Signatures).

1. **Format A4 obligatoire** (210 × 297 mm). Le PDF actuel est au format américain Letter (612 × 792 pts).
2. **Marges** : 18 à 20 mm sur les quatre côtés. Le texte touche actuellement les bords.
3. **En-tête** : comme la maquette (logo au trait, filet, référence du bien et du bail à droite), discret.
4. **Bloc titre** : encadré au trait, avec en petit la mention du contrat type et de la loi, et le titre officiel en taille raisonnable (22 à 24 px, et non en très grand). Le titre peut rester « Contrat type de location ou de colocation de logement nu ».
5. **Préambule du contrat type** (« Champ du contrat type… », « Modalités d'application… », « En conséquence… ») : il fait partie du texte officiel et doit être reproduit, mais **en petit** (8 à 8,5 pt), dans un encadré fin intitulé « Préambule du contrat type (texte officiel) ». Il ne doit pas occuper la première page.
6. **Parties** : deux encadrés côte à côte, « Le bailleur » et « Le locataire », comme sur la maquette.
7. **Classe énergie** : l'étiquette de la classe DPE, entourée de sa couleur officielle, dans un encadré à côté du rappel des niveaux de performance, comme sur la maquette.
8. **Grands numéros de parties** (I, II, III…) en vert pin, intitulés en police technique : à conserver, mais vérifier l'espacement (les titres sont actuellement espacés lettre par lettre « D É S I G N A T I O N », ce qui les rend illisibles à l'extraction).
9. **Ligatures** : désactiver les ligatures typographiques (fi, fl, ffi) dans les PDF (`font-variant-ligatures: none`). Dans le PDF actuel, le texte copié donne « dé!ni », « identi!ant », « !nancières » : un document juridique doit pouvoir être copié et recherché sans erreur.
10. **Corps du texte** : 9,5 à 10 pt, interligne 1,4, paragraphes aérés ; notes de bas de page en 7,5 pt.

## B. Désignation des parties

**Ce que le contrat type impose (partie I)** : pour le bailleur, nom et prénom (ou dénomination), domicile ou siège social, qualité (personne physique ou morale), adresse électronique et téléphone portable facultatifs ; pour le locataire, nom et prénom, adresse électronique et téléphone portable facultatifs.

**Constats sur le test :**
- Le bailleur apparaît sous le seul prénom « Sarah » : **le nom de famille est obligatoire**.
- Le domicile du bailleur apparaît « à compléter ».
- Un bail contenant une mention obligatoire « à compléter » peut être généré en projet, mais **ne doit jamais pouvoir être envoyé à la signature** : contrôle bloquant à prévoir.

**Ajouts demandés par Sarah (pratique professionnelle, non imposée par le contrat type) :**
- pour chaque personne physique (bailleur, locataires) : **date et lieu de naissance** ;
- pour le locataire : **adresse actuelle** (avant l'entrée dans les lieux) ;
- pour le bailleur personne morale : forme juridique, numéro d'immatriculation, représentant légal ;
- ces informations s'ajoutent à la suite de la désignation officielle, sans modifier le texte du contrat type, et sont facultatives à la saisie mais proposées par défaut.

## C. Contrôle juridique du contenu

**Conforme (vérifié) :** texte du contrat type du 1er octobre 2026 ; durée de 3 ans pour un bailleur personne physique et clause de reconduction ; identifiant fiscal à 12 chiffres ; classe DPE D, location autorisée ; dépôt de garantie de 850 € égal à un mois de loyer hors charges (art. 22) ; loyer non supérieur au dernier loyer du précédent locataire (850 €) ; mention du dernier loyer, de sa date de versement et de la dernière révision ; clause de révision avec date et trimestre de l'IRL ; provisions sur charges avec régularisation ; clause résolutoire obligatoire avec le délai de six semaines ; garage lot 749 désigné comme local accessoire (loi, art. 2) ; notice d'information du 18 octobre 2026 en annexe C ; signature électronique avancée.

**À corriger :**
1. **Chauffage et eau chaude collectifs** : les notes (4) et (5) du contrat type demandent de **préciser les modalités de répartition de la consommation du locataire** (tantièmes, compteurs individuels, répartiteurs…). Le bail indique seulement « collectif ». Ajouter un champ « Modalités de répartition » dans la fiche du bien (rubrique Équipements), obligatoire si collectif.
2. **Parties communes (II, D)** : en copropriété, la rubrique « Énumération des locaux, parties, équipements et accessoires de l'immeuble à usage commun » (ascenseur, local vélos, espaces verts, interphone…) doit être renseignée ou indiquer « Néant ». Elle a disparu du test. Ajouter le champ dans la fiche du bien.
3. **Éléments d'équipement** : le texte libre « Équipée, plaques, four ; Salle d'eau, toilette » n'est pas assez précis pour un bail. Construire la phrase à partir des réponses structurées de la rubrique Équipements (cuisine équipée : plaques, four, hotte… ; salle d'eau avec douche ; WC séparé…).
4. **Zone tendue pour un bail prenant effet avant le 1er janvier 2027** : le bail de test (prise d'effet le 22 octobre 2026) indique « Oui ». Pour cette date, la liste applicable est celle du décret n° 2013-392 (modifié par le décret n° 2025-1267), et non celle du décret n° 2026-831. La commune de La Valette-du-Var appartient à l'agglomération de Toulon, qui figure très probablement dans la liste de 2013, mais cela doit être **vérifié sur le texte** avant d'afficher « Oui ». Règle : la liste applicable dépend de la date de prise d'effet du bail.
5. **Trimestre de l'IRL** : le test retient le 4e trimestre. C'est un choix contractuel possible, mais l'usage et la règle par défaut (dernier indice publié à la signature) conduiraient au 2e ou au 3e trimestre 2026 selon la date de publication. Proposer par défaut le **dernier trimestre publié à la date de signature**, avec une explication, et laisser le bailleur le modifier.
6. **Montant de la première échéance** : la prise d'effet au 22 octobre implique un premier mois incomplet. Le contrat type demande le montant pour « une période complète » (910 € : correct), mais l'appel de loyer d'octobre devra être calculé au prorata (étape 5).
7. **Lieu et date de signature** : à remplir automatiquement au moment de la signature électronique (date de signature, lieu déclaré par le bailleur).
8. **Annexes (XI)** : la liste officielle est reproduite ; ajouter, sous chaque rubrique, la liste des documents **réellement joints** (par exemple : DPE du 12/03/2022, électricité du…, état des risques du…), tirée du coffre, et bloquer l'envoi à la signature si un diagnostic obligatoire manque (règle R-04).
9. **Adresse électronique** : celle du locataire figure, celle du bailleur non. Appliquer l'option « Faire figurer mon email dans mes baux » décidée le 22 octobre.

## D. Après correction

Générer un nouveau bail de test avec les mêmes données (plus les nouveaux champs), en A4, et l'envoyer à Sarah pour une seconde relecture, accompagné d'une capture de la première page à côté de la maquette Bail-Editorial.
