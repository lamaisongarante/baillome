# Modèle M-02b · Bail d'habitation meublé

Texte du contrat type de location ou de colocation de logement meublé (annexe 2 du décret n° 2015-587 du 29 mai 2015, dans sa version issue du décret n° 2026-596 du 6 juillet 2026, applicable aux baux signés ou renouvelés depuis le 1er octobre 2026). Mêmes conventions que le modèle du bail nu : champs {{…}}, blocs ▸ SI, cases cochées selon les données.

**Vérifié sur Legifrance le 20 octobre 2026** (annexe 2 du décret n° 2015-587, version en vigueur depuis le 1er octobre 2026, et décret n° 2015-981, fournis par Sarah). Confirmé : champ d'application « logement meublé » et dépôt de garantie limité à deux mois de loyer hors charges (la reproduction consultée au départ était fausse sur ces deux points). Corrigé : les listes à cocher des rubriques C et D n'existent pas dans le texte officiel ; la clause de solidarité développée n'est pas imposée par le contrat type (c'est une rédaction proposée) ; la mention « garantie autonome » ne figure pas dans le contrat type meublé ; la liste du mobilier reprend désormais les termes exacts du décret. Relecture finale par un avocat recommandée avant le lancement.

## Ce qui change par rapport au bail nu

| Partie | Bail nu (M-02a) | Bail meublé (M-02b) |
| --- | --- | --- |
| Champ du contrat type | Logement nu, résidence principale | Logement meublé, résidence principale ; exclut les colocations à contrats multiples et les logements HLM conventionnés (article L. 831-1 du code de la construction et de l'habitation) |
| II. C et D. Locaux accessoires et parties communes | Rubriques décrites par des exemples | Identiques au bail nu (mêmes exemples, aucune liste imposée) |
| III. Durée | 3 ans (6 ans pour une personne morale), durée réduite possible | 1 an minimum, reconduit tacitement pour 1 an ; ou 9 mois pour un étudiant, sans reconduction |
| IV. B. Charges | Provisions ou paiement périodique ; forfait seulement en colocation | Provisions, paiement périodique, ou forfait de charges |
| IV. Contribution aux économies de charges | Rubrique dédiée (C) | Pas de rubrique dédiée ; le montant figure seulement dans la première échéance |
| IV. Numérotation | C. contribution, D. assurance colocation, E. paiement, F. réévaluation, G. dépenses énergétiques | C. assurance colocation, D. paiement, E. réévaluation, F. dépenses énergétiques |
| V. B. Majoration pour travaux | Travaux d'amélioration | Travaux d'amélioration ou acquisition d'équipements |
| VI. Dépôt de garantie | « Montant du dépôt de garantie \[…\] / Garantie autonome », 1 mois au maximum | « Montant du dépôt de garantie \[…\] », 2 mois au maximum, sans mention de garantie autonome |
| VII. Solidarité | Le cas échéant, clause prévoyant la solidarité | Identique au bail nu : le contrat type n'impose pas de rédaction |
| XI. B. Diagnostics | Amiante et électricité/gaz listés sans réserve | Amiante et électricité/gaz précédés de « le cas échéant » |
| XI. D. Annexe | Un état des lieux | Un état des lieux, un inventaire et un état détaillé du mobilier |

Toutes les autres parties (parties, consistance du logement, identifiant fiscal, rappel des niveaux de performance énergétique, servitude de résidence principale, loyer, zone tendue, révision, modalités de paiement, dépenses énergétiques, clause résolutoire à six semaines et clauses facultatives, honoraires, conditions particulières) reprennent la même rédaction et les mêmes champs que le bail nu.

## Textes propres au meublé

### III. Date de prise d'effet et durée du contrat

**A. Date de prise d'effet du contrat :** {{bail.date\_effet}}

**B. Durée du contrat :** {{bail.duree}} (durée minimale d'un an, ou de neuf mois si la location est consentie à un étudiant)

À l'exception des locations consenties à un étudiant pour une durée de neuf mois, les contrats de location de logements meublés sont reconduits tacitement à leur terme pour une durée d'un an et dans les mêmes conditions. Le locataire peut mettre fin au bail à tout moment, après avoir donné congé. Le bailleur peut, quant à lui, mettre fin au bail à son échéance et après avoir donné congé, soit pour reprendre le logement en vue de l'occuper lui-même ou une personne de sa famille, soit pour le vendre, soit pour un motif sérieux et légitime.

Les contrats de locations meublées consenties à un étudiant pour une durée de neuf mois ne sont pas reconduits tacitement à leur terme et le locataire peut mettre fin au bail à tout moment, après avoir donné congé. Le bailleur peut, quant à lui, mettre fin au bail à son échéance et après avoir donné congé.

### IV. B. Charges récupérables

1. Modalité de règlement des charges récupérables : ☐ Provisions sur charges avec régularisation annuelle ☐ Paiement périodique des charges sans provision ☐ Récupération des charges par le bailleur sous la forme d'un forfait → {{bail.mode\_charges}}
2. Le cas échéant, montant des provisions sur charges ou du forfait de charges : {{bail.charges}}
3. ▸ SI forfait révisable : modalités de révision du forfait de charges (révisé dans les mêmes conditions que le loyer principal) : {{bail.revision\_forfait}}

### VI. Garanties

Le cas échéant, Montant du dépôt de garantie de l'exécution des obligations du locataire (inférieur ou égal à deux mois de loyers hors charges) : {{bail.depot\_garantie}} €

### VII. Le cas échéant, clause de solidarité (▸ SI plusieurs locataires)

Le contrat type prévoit « une clause prévoyant la solidarité des locataires et l'indivisibilité de leurs obligations en cas de pluralité de locataires », sans en imposer la rédaction. Rédaction développée proposée par Baillome pour la colocation, conforme à l'article 8-1 de la loi du 6 juillet 1989 sur la fin de la solidarité du colocataire sortant, à faire valider par l'avocat :

- Il est expressément stipulé que les copreneurs seront tenus solidairement et indivisiblement de l'exécution des obligations du présent contrat.
- Les colocataires soussignés, désignés le « LOCATAIRE », reconnaissent expressément qu'ils se sont engagés solidairement et que le bailleur n'a accepté de consentir le présent bail qu'en considération de cette cotitularité solidaire et n'aurait pas consenti la présente location à l'un seulement d'entre eux.
- Si un colocataire délivrait congé et quittait les lieux, il resterait en tout état de cause tenu du paiement des loyers et accessoires et, plus généralement, de toutes les obligations du bail en cours au moment de la délivrance du congé, et de ses suites et notamment des indemnités d'occupation et de toutes sommes dues au titre des travaux de remise en état, au même titre que le(s) colocataire(s) demeuré(s) dans les lieux pendant une durée de six mois à compter de la date d'effet du congé. Toutefois, cette solidarité prendra fin, avant l'expiration de ce délai, si un nouveau colocataire, accepté par le bailleur, figure au présent contrat.
- La présente clause est une condition substantielle sans laquelle le présent bail n'aurait pas été consenti.

### XI. Annexe spécifique : inventaire et état détaillé du mobilier

Un inventaire et un état détaillé du mobilier, établis à la remise des clés, contradictoirement, et signés par les deux parties. Baillome le génère à partir de l'équipement déclaré dans la fiche du bien, avec pour chaque élément : la pièce, la désignation, la quantité, l'état (neuf, bon, usagé, à remplacer) et une photo.

**Liste minimale du mobilier (décret n° 2015-981 du 31 juillet 2015), contrôlée avant génération :**

| Élément obligatoire (article 2 du décret n° 2015-981) | Contrôle |
| --- | --- |
| 1° Literie comprenant couette ou couverture | Présence déclarée |
| 2° Dispositif d'occultation des fenêtres dans les pièces destinées à être utilisées comme chambre à coucher | Présence déclarée pour chaque chambre |
| 3° Plaques de cuisson | Présence déclarée |
| 4° Four ou four à micro-ondes | Présence déclarée |
| 5° Réfrigérateur et congélateur ou, au minimum, un réfrigérateur doté d'un compartiment permettant de disposer d'une température inférieure ou égale à - 6 °C | Présence déclarée |
| 6° Vaisselle nécessaire à la prise des repas | Présence déclarée |
| 7° Ustensiles de cuisine | Présence déclarée |
| 8° Table et sièges | Présence déclarée |
| 9° Étagères de rangement | Présence déclarée |
| 10° Luminaires | Présence déclarée |
| 11° Matériel d'entretien ménager adapté aux caractéristiques du logement | Présence déclarée |

Termes conformes à l'article 2 du décret, vérifiés sur Legifrance. L'article 1er du même décret ajoute que chaque pièce d'un logement meublé est équipée d'éléments de mobilier conformes à sa destination : l'inventaire est donc organisé pièce par pièce, et l'application signale une pièce déclarée sans mobilier.

## Contrôles propres au meublé

| Contrôle | Effet | Message au bailleur |
| --- | --- | --- |
| Un des onze éléments obligatoires manque | Bloquant | « Il manque encore \[élément\] pour que votre logement soit considéré comme meublé. Sans lui, votre locataire pourrait demander à transformer le bail en location vide : 3 ans au lieu d'1, et un dépôt de garantie d'un seul mois. » |
| Dépôt de garantie supérieur à deux mois de loyer hors charges | Bloquant (règle R-03) | Message de la règle R-03 |
| Durée de 9 mois pour un locataire non étudiant | Bloquant | « La durée de 9 mois est réservée aux étudiants. Pour votre locataire, le bail sera d'un an minimum. » |
| Forfait de charges | Information | « Avec un forfait, vos charges ne seront pas régularisées en fin d'année : vous gagnez en simplicité, mais vous assumez les écarts. » |
| Inventaire sans photos | Avertissement | « Une photo par meuble, c'est votre meilleure preuve à la sortie. » |

Les contrôles communs au bail nu (diagnostics, performance énergétique, surface, identifiant fiscal, clauses interdites) s'appliquent à l'identique.

## Sources

- [Legifrance : décret n° 2015-587 du 29 mai 2015 (contrats types)](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000030649868/)
- [Legifrance : décret n° 2015-981 du 31 juillet 2015 (liste du mobilier)](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000030967884/)
- [Legifrance : décret n° 2026-596 du 6 juillet 2026](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054393114)
- [Reproduction du contrat type meublé, version du 1er octobre 2026 (à corriger sur les deux points signalés)](https://baildelocation.com/bail-de-location-meublee/)
