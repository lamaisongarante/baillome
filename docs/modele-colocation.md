# Modèle M-02c · Colocation à bail unique

**Sources, toutes vérifiées sur Legifrance le 20 octobre 2026 (versions en vigueur fournies par Sarah) :** loi n° 89-462 du 6 juillet 1989, articles 7 (g), 8-1, 22-1, 23, 25-3 et 25-10 ; décret n° 2015-587 du 29 mai 2015, annexes 1 et 2 ; notice d'information en vigueur depuis le 18 octobre 2026. Aucune règle de ce modèle ne repose sur une autre source.

## Principe : une variante, pas un nouveau texte

La loi impose que le bail d'une colocation respecte un contrat type (article 8-1, III). Ce contrat type est le même que celui de la location simple : l'annexe 1 du décret s'applique « aux locations et aux colocations de logement nu » et l'annexe 2 « aux locations et aux colocations de logement meublé ». Baillome génère donc le bail de colocation à partir du modèle M-02a (nu) ou M-02b (meublé), en activant les rubriques propres à la colocation décrites ci-dessous. L'article 8-1 s'applique aussi aux meublés (article 25-3).

## Qu'est-ce qu'une colocation ?

**Article 8-1, I :** la colocation est la location d'un même logement par plusieurs locataires, constituant leur résidence principale, formalisée par un contrat unique ou par plusieurs contrats, à l'exception de la location consentie exclusivement à des époux ou à des partenaires de PACS au moment de la conclusion initiale du contrat.

**Conséquence dans Baillome :** quand plusieurs locataires sont saisis, l'application demande s'ils sont mariés ou pacsés ensemble. Si oui, le bail est un bail ordinaire à deux locataires, et les règles propres à la colocation ne s'appliquent pas. Sinon, c'est une colocation (y compris pour un couple non marié et non pacsé).

## Périmètre de la V1 : le bail unique uniquement

| Forme | Ce que dit la loi | Dans Baillome |
| --- | --- | --- |
| Bail unique signé par tous les colocataires | Contrat type des annexes 1 et 2 | V1 |
| Plusieurs baux, un par colocataire | Exclue des contrats types ; constitue une division du logement soumise aux articles L. 126-17, L. 126-18 et L. 126-21 du code de la construction et de l'habitation, avec au moins 9 m² et 20 m³ par local privatif (article 8-1, II) | Hors V1 : renvoi vers la délégation ou un professionnel |

## Rubriques propres à la colocation

| Rubrique du contrat type | Règle légale | Dans Baillome |
| --- | --- | --- |
| I. Désignation des parties | « Nom et prénom du ou des locataires ou, en cas de colocation, des colocataires », téléphone et adresse électronique facultatifs (annexes 1 et 2) | Autant de colocataires que nécessaire, chacun avec sa fiche locataire |
| IV. A. Loyer | La somme des loyers perçus de l'ensemble des colocataires ne peut être supérieure au loyer applicable au logement (articles 17 ou 25-9) ; révision et réévaluation selon les articles 17-1 et 17-2 (article 8-1, II) | Un seul loyer pour le logement. Règles R-01 (gel F et G) et R-02 (révision) inchangées |
| IV. B. Charges | Au choix : provisions avec régularisation (article 23) ou forfait versé avec le loyer, dont le montant et la périodicité sont fixés au contrat, sans complément ni régularisation, révisable chaque année aux mêmes conditions que le loyer, et non manifestement disproportionné au regard des charges dont le locataire ou le précédent locataire se serait acquitté (article 8-1, V). Le forfait est donc possible en colocation nue, alors qu'il ne l'est pas en location nue simple | Choix provisions ou forfait. Si forfait : comparaison automatique avec les charges réelles connues (coffre, décomptes précédents) et avertissement si l'écart paraît important. La loi ne fixe pas de seuil chiffré : l'application informe, sans bloquer |
| IV. D (nu) ou IV. C (meublé). Assurance pour compte des colocataires | Possible si les parties en conviennent dans le bail (article 8-1, IV). Limitée à la responsabilité locative ; prime annuelle récupérable par douzième avec chaque loyer, inscrite sur l'avis d'échéance et la quittance ; copie du contrat remise à la souscription et à chaque renouvellement ; résiliation par le bailleur dans le délai le plus bref quand un colocataire remet son attestation ou part avant le terme, la prime due dans ce délai restant récupérable (article 7, g) | Option « J'assure pour le compte de mes colocataires » : montant annuel et douzième calculés, report automatique sur l'appel de loyer et la quittance, rappel de résiliation à chaque attestation reçue ou départ. Aucune majoration de la prime : la loi prévoit une majoration « dans la limite d'un montant fixé par décret », décret dont l'existence reste à vérifier |
| VII. Clause de solidarité | Prévue « le cas échéant » par le contrat type. La solidarité d'un colocataire et de sa caution prend fin à la date d'effet de son congé lorsqu'un nouveau colocataire figure au bail, et au plus tard six mois après la date d'effet du congé (article 8-1, VI) | Clause proposée par défaut, rédaction conforme à l'article 8-1, VI (voir ci-dessous), à valider par l'avocat |

**Rédaction proposée pour la clause de solidarité** (identique en nu et en meublé) : « Les colocataires sont tenus solidairement et indivisiblement de l'exécution de toutes les obligations du présent contrat. Conformément au VI de l'article 8-1 de la loi du 6 juillet 1989, la solidarité d'un colocataire et celle de la personne qui s'est portée caution pour lui prennent fin à la date d'effet du congé régulièrement délivré lorsqu'un nouveau colocataire figure au bail ; à défaut, elles s'éteignent au plus tard à l'expiration d'un délai de six mois après la date d'effet du congé. »

## Cautionnement en colocation

**Article 8-1, VI :** l'acte de cautionnement des obligations d'un ou de plusieurs colocataires identifie nécessairement, sous peine de nullité, le colocataire pour lequel l'extinction de la solidarité met fin à l'engagement de la caution.

**Article 22-1 :** la caution personne physique signe un acte faisant apparaître le montant du loyer et les conditions de sa révision tels qu'ils figurent au bail, la reproduction de l'avant-dernier alinéa de l'article 22-1 (résiliation d'un cautionnement sans durée), et la mention de l'article 2297 du code civil apposée par la caution elle-même ; le bailleur lui remet un exemplaire du bail ; ces formalités sont prescrites à peine de nullité. Le cautionnement est interdit si le bailleur a souscrit une assurance ou une autre garantie des obligations locatives, sauf pour un étudiant ou un apprenti.

**Dans Baillome :** un acte de cautionnement par garant, rattaché à un colocataire nommément désigné. La génération est bloquée si le colocataire garanti n'est pas identifié. Ces règles alimenteront la matrice dédiée à l'acte de cautionnement.

## Départ d'un colocataire en cours de bail

| Étape | Ce que fait Baillome | Source |
| --- | --- | --- |
| Congé d'un colocataire | Enregistre la date de réception et calcule la date d'effet selon le préavis applicable | Articles 15 et 25-8 |
| Fin de la solidarité | Affiche la date limite : date d'effet du congé + six mois, ou date d'entrée d'un nouveau colocataire au bail si elle est antérieure. Alerte le bailleur à l'approche | Article 8-1, VI |
| Arrivée d'un remplaçant | Prépare l'avenant ajoutant le nouveau colocataire au bail, ce qui met fin à la solidarité du sortant et de sa caution | Article 8-1, VI |
| Assurance pour compte | Rappelle de résilier l'assurance souscrite pour le colocataire sortant | Article 7, g |

## Contrôles propres à la colocation

| Contrôle | Effet |
| --- | --- |
| Locataires mariés ou pacsés ensemble | Pas de colocation : bail ordinaire à plusieurs locataires |
| Demande de baux séparés par colocataire | Non disponible en V1, avec l'explication (division du logement, 9 m² et 20 m³ par local privatif) |
| Somme des loyers supérieure au loyer applicable au logement | Bloquant |
| Forfait de charges très éloigné des charges réelles connues | Avertissement |
| Cautionnement sans colocataire garanti identifié | Bloquant |
| Cautionnement demandé alors qu'une assurance loyers impayés est souscrite (hors étudiant ou apprenti) | Bloquant |
| Normes de peuplement | Information : elles s'imposent aux logements loués en colocation (article 8-1, II, renvoyant à l'article L. 822-10 du code de la construction et de l'habitation). Texte à récupérer avant de transformer cette information en contrôle |

Les contrôles communs au bail nu et au bail meublé s'appliquent à l'identique.

## Points à trancher ou à vérifier

- [ ] Décidé par Sarah le 20 octobre 2026 : périmètre V1 limité au bail unique.
- [ ] Décidé par Sarah le 20 octobre 2026 : option d'assurance pour compte des colocataires en V1.
- [ ] Décidé par Sarah le 20 octobre 2026 : avenant d'entrée d'un nouveau colocataire en V1 (il conditionne la fin anticipée de la solidarité du sortant) ; à ajouter à la liste des matrices.
- [ ] Avocat : rédaction de la clause de solidarité proposée.
- [ ] Avocat : sort du dépôt de garantie quand un seul colocataire quitte un bail unique. La loi ne traite pas expressément ce cas ; Baillome ne doit pas l'automatiser sans validation.
- [ ] Recherche : existence du décret fixant la majoration possible de la prime d'assurance pour compte, et texte de l'article L. 822-10 du code de la construction et de l'habitation (normes de peuplement).
