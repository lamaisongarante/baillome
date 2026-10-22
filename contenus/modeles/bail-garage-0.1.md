**PROJET — rédaction propre à Baillome, à valider par l'avocat.** Aucune clause de ce bail n'est imposée par un texte : il n'existe pas de contrat type pour la location d'un garage seul. Chaque clause indique l'article qui la fonde. Les articles du code civil cités ont été relus sur Légifrance le 22 octobre 2026 (titre VIII, articles 1708 à 1762) ; les articles 1174, 1375 et 1377 proviennent de docs/sources-juridiques ; les articles 1224 et 1225 ont été relus sur Légifrance le 22 octobre 2026 (docs/sources-juridiques/code-civil-art-1224-1225-resolution.md).

Conventions : {{champ}} = rempli par Baillome ; ▸ SI … = bloc affiché seulement si la condition est remplie ; « Fondement » = ligne d'explication, non imprimée dans le bail.

---

# BAIL DE GARAGE OU DE PLACE DE STATIONNEMENT

**Régime du bail.** Le présent bail est un louage de choses régi par les articles 1708 et suivants du code civil. Il n'est pas soumis à la loi n° 89-462 du 6 juillet 1989, l'emplacement n'étant pas loué accessoirement à un logement loué au preneur par le même bailleur.

> Fondement : code civil, articles 1709 et 1713 ; loi n° 89-462 du 6 juillet 1989, article 2 (la loi ne vise les garages et places de stationnement que lorsqu'ils sont « loués accessoirement au local principal par le même bailleur »).

## 1. Les parties

Le présent bail est conclu entre :

- {{bailleur.nom}}, {{bailleur.qualite}}, demeurant ou ayant son siège {{bailleur.adresse}}, ▸ SI renseignés : téléphone {{bailleur.telephone}}, adresse électronique {{bailleur.email}}, ci-après « le bailleur » ;
- {{preneur.nom}}, demeurant {{preneur.adresse}}, ▸ SI renseignés : téléphone {{preneur.telephone}}, adresse électronique {{preneur.email}}, ci-après « le preneur ».

▸ SI garant : {{garant.nom}}, demeurant {{garant.adresse}}, se porte caution des obligations du preneur par acte séparé, annexé au présent bail.

> Fondement : article 1709 (le bailleur s'oblige à faire jouir le preneur de la chose, le preneur s'oblige à en payer le prix).

## 2. Désignation de l'emplacement

- Adresse : {{garage.adresse}}
- Numéro de lot ou d'emplacement : {{garage.numero}}
- Type : {{garage.type}} (box fermé, place ouverte ou parking couvert)
- ▸ SI connues : dimensions : {{garage.dimensions}}
- Moyens d'accès remis au preneur : {{garage.moyens_acces}} (nature et nombre de clés, badges, télécommandes)

> Fondement : article 1719, 1° (obligation de délivrer la chose louée, qui doit donc être désignée précisément).

## 3. Destination

L'emplacement est loué exclusivement pour le stationnement du véhicule suivant : {{vehicule.description}} ({{vehicule.immatriculation}}).

▸ SI le bailleur l'accepte : le preneur peut également y ranger des objets personnels.

Toute autre utilisation est interdite, notamment l'habitation et l'exercice d'une activité professionnelle ou commerciale.

> Fondement : article 1728, 1° (user de la chose « suivant la destination qui lui a été donnée par le bail ») ; article 1729 (résiliation possible en cas d'usage contraire à la destination).

## 4. Durée, reconduction et fin du bail

Le bail prend effet le {{bail.date_effet}} pour une durée de {{bail.duree}}.

À son terme, il est reconduit tacitement pour la même durée et aux mêmes conditions.

Chaque partie peut y mettre fin à tout moment, par lettre recommandée avec demande d'avis de réception ou par remise en main propre contre récépissé, moyennant un préavis de {{bail.preavis}}, qui court à compter de la réception de la lettre ou de la remise.

> Fondement : article 1737 (un bail écrit cesse de plein droit à son terme) ; articles 1738, 1736 et 1759 (à défaut de stipulation, le preneur laissé en possession bénéficie d'un nouveau bail régi par l'usage des lieux) ; article 1739 (congé et tacite reconduction). La clause fixe elle-même la reconduction et le préavis pour éviter l'incertitude de l'usage des lieux. Préavis d'un mois pour chaque partie : décision de Sarah du 20 octobre 2026.

## 5. Loyer et paiement

- Montant du loyer : {{bail.loyer}} € par {{bail.periodicite}}.
- ▸ SI charges : le preneur verse en outre {{bail.charges}} € par {{bail.periodicite}} au titre des charges suivantes : {{bail.charges_detail}}.
- Le loyer est payable d'avance, le {{bail.jour_paiement}} de chaque période, par {{bail.mode_paiement}}.

> Fondement : article 1709 (louage moyennant « un certain prix ») ; article 1728, 2° (payer le prix du bail aux termes convenus).

## 6. ▸ SI révision activée : révision du loyer

Le loyer est révisé chaque année à la date anniversaire de la prise d'effet du bail, à la hausse comme à la baisse, selon la variation sur un an de l'indice national du coût de la construction publié par l'Insee.

L'indice de référence est celui du {{bail.trimestre_icc}} {{bail.annee_icc}}, soit {{bail.indice_reference}}. À chaque révision, le loyer est multiplié par le rapport entre l'indice du même trimestre de l'année suivante et l'indice ayant servi à la révision précédente.

> Fondement : code monétaire et financier, article L. 112-2 (l'indice national du coût de la construction est réputé en relation directe avec l'objet d'une convention relative à un immeuble bâti) et article L. 112-1 (est réputée non écrite une clause prenant en compte une période de variation de l'indice supérieure à la durée entre deux révisions). La révision à la hausse comme à la baisse est un choix de rédaction de Baillome.

## 7. Dépôt de garantie

▸ SI dépôt : le preneur verse à la signature un dépôt de garantie de {{bail.depot}} €, destiné à garantir l'exécution de ses obligations. Il n'est pas productif d'intérêts et ne peut pas être imputé par le preneur sur le dernier loyer.

Il est restitué dans un délai de {{bail.delai_restitution}} après la remise de tous les moyens d'accès, déduction faite des sommes restant dues au bailleur, sur justificatifs.

> Fondement : aucun article du code civil ne fixe de plafond ni de délai de restitution ; le montant et le délai sont librement convenus (voir docs/modele-garage.md). Rédaction propre à Baillome.

## 8. Obligations du bailleur

Le bailleur s'engage à :

- délivrer l'emplacement en bon état de réparations de toute espèce ;
- l'entretenir en état de servir au stationnement et y faire toutes les réparations nécessaires autres que locatives ;
- en faire jouir paisiblement le preneur pendant la durée du bail ;
- garantir le preneur des vices ou défauts qui empêchent l'usage de l'emplacement ;
- ne pas en changer la forme pendant la durée du bail.

Le bailleur ne garantit pas le preneur du trouble que des tiers apportent par voies de fait à sa jouissance sans prétendre aucun droit sur l'emplacement ; le preneur peut les poursuivre en son nom personnel.

> Fondement : article 1719, 2° et 3° ; article 1720 ; article 1721 ; article 1723 ; article 1725.

## 9. Obligations du preneur

Le preneur s'engage à :

- user de l'emplacement raisonnablement et suivant la destination prévue à l'article 3 ;
- payer le loyer, et le cas échéant les charges, aux termes convenus ;
- supporter les réparations urgentes qui ne peuvent être différées ; si elles durent plus de vingt et un jours, le loyer est diminué à proportion du temps et de la partie de l'emplacement dont il a été privé ;
- assurer à ses frais les menues réparations et l'entretien courant suivants, sauf s'ils résultent de la vétusté ou de la force majeure : porte et mécanisme d'ouverture, serrure, télécommandes et badges, éclairage intérieur ;
- répondre des dégradations et des pertes survenues pendant sa jouissance, y compris par le fait des personnes qu'il autorise à utiliser l'emplacement, à moins qu'il ne prouve qu'elles ont eu lieu sans sa faute ;
- informer sans délai le bailleur de tout sinistre, de toute dégradation et de toute action d'un tiers concernant la propriété de l'emplacement.

> Fondement : article 1728 ; article 1724 ; articles 1754 (réparations locatives définies par l'usage des lieux « s'il n'y a clause contraire ») et 1755 (jamais dues en cas de vétusté ou de force majeure) ; articles 1732 et 1735 ; articles 1726 et 1727 (dénonciation au propriétaire des troubles relatifs à la propriété). La liste des menues réparations est un choix de rédaction de Baillome.

## 10. Assurance

Le preneur s'assure, pendant toute la durée du bail, pour sa responsabilité à l'égard du bailleur et des tiers, notamment en cas d'incendie, ainsi que pour le véhicule stationné. Il en justifie à la signature puis à première demande du bailleur.

> Fondement : aucune obligation légale d'assurance pour un garage seul ; stipulation contractuelle de Baillome. Elle couvre la responsabilité du preneur prévue aux articles 1732 (dégradations) et 1733 (incendie).

## 11. Sous-location et cession

Le preneur ne peut ni sous-louer, en tout ou en partie, ni céder le présent bail, ni mettre l'emplacement à disposition d'un tiers, même à titre gratuit, sans l'accord écrit et préalable du bailleur.

> Fondement : article 1717 (la faculté de sous-louer et de céder « peut être interdite pour le tout ou partie. Cette clause est toujours de rigueur. »).

## 12. État des lieux

Un état des lieux, accompagné de photographies, est établi contradictoirement à la remise des moyens d'accès et lors de leur restitution. Le preneur rend l'emplacement tel qu'il l'a reçu suivant cet état, excepté ce qui a péri ou a été dégradé par vétusté ou force majeure.

> Fondement : article 1730 ; article 1731 (à défaut d'état des lieux, le preneur est présumé avoir reçu l'emplacement en bon état de réparations locatives).

## 13. Clause résolutoire

À défaut de paiement d'un terme de loyer ou de charges à son échéance, ou de versement du dépôt de garantie, le bail est résilié de plein droit un mois après une mise en demeure de payer restée sans effet, adressée au preneur par lettre recommandée avec demande d'avis de réception et mentionnant expressément la présente clause résolutoire.

En cas de résiliation par la faute du preneur, celui-ci reste tenu de payer le loyer pendant le temps nécessaire à la relocation, sans préjudice de dommages et intérêts.

> Fondement : article 1741 (le louage se résout par le défaut du bailleur ou du preneur de remplir leurs engagements) ; article 1760 (loyer dû pendant le temps nécessaire à la relocation). Article 1224 (la résolution résulte de l'application d'une clause résolutoire) ; article 1225 (la clause précise les engagements dont l'inexécution entraîne la résolution ; mise en demeure infructueuse, qui « ne produit effet que si elle mentionne expressément la clause résolutoire »). Délai d'un mois : décision de Sarah du 20 octobre 2026.

## 14. Restitution de l'emplacement

À la fin du bail, le preneur restitue tous les moyens d'accès remis à l'entrée et rend l'emplacement vidé de tout véhicule et de tout objet, et nettoyé.

> Fondement : article 1730 (rendre la chose telle qu'elle a été reçue).

## 15. Décès d'une partie

Le présent bail n'est pas résolu par le décès du bailleur ni par celui du preneur.

> Fondement : article 1742.

## 16. ▸ SI option activée (désactivée par défaut) : vente de l'emplacement

En cas de vente de l'emplacement, l'acquéreur pourra mettre fin au bail. Il en avertit le preneur en respectant le préavis prévu à l'article 4. Le bailleur indemnise alors le preneur d'une somme égale au loyer correspondant à ce préavis.

> Fondement : article 1743, alinéa 2 (l'acquéreur peut expulser le locataire de biens non ruraux s'il s'est réservé ce droit par le bail) ; articles 1744, 1745 et 1748 (indemnité et avertissement « au temps d'avance usité dans le lieu ») ; article 1750 (sans acte authentique ni date certaine, l'acquéreur ne doit aucune indemnité) ; article 1377 (un acte sous signature privée n'acquiert date certaine que par son enregistrement, le décès d'un signataire ou sa constatation dans un acte authentique). Option désactivée par défaut, à trancher par l'avocat.

## 17. Forme du bail et exemplaires

Le présent bail est établi et signé sous forme électronique. Chaque partie en reçoit un exemplaire sur un support durable et peut y accéder à tout moment depuis Baillome.

> Fondement : article 1174 (un écrit exigé pour la validité d'un contrat peut être établi et conservé sous forme électronique dans les conditions des articles 1366 et 1367) ; article 1375 (l'exigence d'une pluralité d'originaux est réputée satisfaite si chaque partie dispose d'un exemplaire sur support durable ou y a accès). Signature électronique avancée par défaut, qualifiée en option au choix du bailleur : décision de Sarah du 22 octobre 2026.

## 18. Annexes

- L'état des lieux d'entrée (article 12).
- L'état des risques, établi pour l'emplacement.
- ▸ SI garant : l'acte de cautionnement.

> Fondement de l'état des risques : code de l'environnement, article L. 125-5 (information de tous les locataires de biens immobiliers situés dans les zones visées). Son annexion au bail de garage est un choix de Baillome (voir docs/modele-garage.md).

Fait le {{signature.date}}, par voie électronique.

Le bailleur — Le preneur ▸ SI garant : — La caution

---

## Points à soumettre à l'avocat

1. L'ensemble de la rédaction.
2. Article 1740 : la caution ne s'étend pas à la prolongation née de l'article 1738. La reconduction tacite prévue au contrat (article 4) est-elle une « prolongation » au sens de ce texte ? L'acte de cautionnement doit-il viser expressément les reconductions ?
3. Clause résolutoire (article 13) : rédaction de la clause et de la mise en demeure au regard des articles 1224 et 1225 du code civil.
4. Révision à la hausse comme à la baisse (article 6) : choix de rédaction à confirmer.
5. Clause de vente (article 16) : montant de l'indemnité, et intérêt de l'option alors que le bail électronique n'a pas date certaine (article 1377).
6. Garage loué par contrat séparé au locataire du logement du même bailleur (rappel de docs/modele-garage.md).
