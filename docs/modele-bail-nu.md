# Modèle M-02a · Bail d'habitation nu

Texte du contrat type de location ou de colocation de logement vide (annexe 1 du décret n° 2015-587 du 29 mai 2015, dans sa version issue du décret n° 2026-596 du 6 juillet 2026, applicable aux baux signés ou renouvelés depuis le 1er octobre 2026). Les clauses imposées reprennent le texte officiel ; seuls les champs sont remplis par Baillome.

**Vérifié sur Legifrance le 20 octobre 2026** (annexe 1 du décret n° 2015-587, version en vigueur depuis le 1er octobre 2026, fournie par Sarah). Écarts corrigés : servitude de résidence principale rédigée comme une mention et non comme une case oui/non ; clause de solidarité rendue conditionnelle (« le cas échéant ») ; clauses de résiliation facultatives reprises au mot près, sans ajout. Le texte officiel décrit chaque rubrique entre crochets ; les cases à cocher sont un choix de présentation de Baillome, permis par le contrat type (« tout autre support \[…\] dans le respect du présent contrat type »). Relecture finale par un avocat recommandée avant le lancement.

**Conventions du modèle**

| Notation | Signification |
| --- | --- |
| {{bien.adresse}} | Champ rempli automatiquement à partir des données de Baillome |
| ▸ SI … | Bloc affiché seulement si la condition est remplie |
| ☐ / ☒ | Option cochée automatiquement selon les données ; toutes les options restent visibles, comme dans le contrat type |

---

## CONTRAT TYPE DE LOCATION OU DE COLOCATION DE LOGEMENT VIDE

Soumis au titre Ier de la loi du 6 juillet 1989 tendant à améliorer les rapports locatifs et portant modification de la loi n° 86-1290 du 23 décembre 1986.

**Champ du contrat type :** Le présent contrat type de location est applicable aux locations et aux colocations de logement nu et qui constitue la résidence principale du preneur, à l'exception : des colocations formalisées par la conclusion de plusieurs contrats entre les colocataires et le bailleur ; des locations de logements faisant l'objet d'une convention passée en application de l'article L. 831-1 ou de l'article L. 321-8 du code de la construction et de l'habitation ; des locations de logement appartenant à un organisme d'habitation à loyer modéré ne faisant pas l'objet d'une convention passée en application de l'article L. 831-1 précité.

**Modalités d'application du contrat type :** le régime de droit commun en matière de baux d'habitation est défini principalement par la loi du 6 juillet 1989 modifiée. L'ensemble de ces dispositions étant d'ordre public, elles s'imposent aux parties qui, en principe, ne peuvent pas y renoncer.

**En conséquence :**

- le présent contrat type de location contient uniquement les clauses essentielles du contrat dont la législation et la réglementation en vigueur au jour de sa publication imposent la mention par les parties dans le contrat. Il appartient cependant aux parties de s'assurer des dispositions applicables au jour de la conclusion du contrat ;
- au-delà de ces clauses, les parties sont également soumises à l'ensemble des dispositions légales et réglementaires d'ordre public applicables aux baux d'habitation sans qu'il soit nécessaire de les faire figurer dans le contrat et qui sont rappelées utilement dans la notice d'information qui doit être jointe à chaque contrat ;
- les parties sont libres de prévoir dans le contrat d'autres clauses particulières, propres à chaque location, dans la mesure où celles-ci sont conformes aux dispositions législatives et réglementaires en vigueur. Les parties peuvent également convenir de l'utilisation de tout autre support pour établir leur contrat, dans le respect du présent contrat type.

### I. DÉSIGNATION DES PARTIES

Le présent contrat est conclu entre les soussignés :

- Nom et prénom, ou dénomination du bailleur : {{bailleur.nom}}
- Domicile ou siège social du bailleur : {{bailleur.adresse}}
- Adresse e-mail du bailleur (facultatif) : {{bailleur.email}}
- Numéro de téléphone portable du bailleur (facultatif) : {{bailleur.telephone}}
- Qualité du bailleur : ☐ Personne physique ☐ Personne morale → coché selon {{entite.type}}
- ▸ SI personne morale : la personne morale est une société civile constituée exclusivement entre parents et alliés jusqu'au quatrième degré inclus : ☐ oui ☐ non → {{entite.sci\_familiale}}
- Le cas échéant, représenté par le mandataire : ☐ oui ☐ non → « non » par défaut dans Baillome
- ▸ SI mandataire : nom ou raison sociale et adresse du mandataire ainsi que l'activité exercée : {{mandataire.identite}} ; n° et lieu de délivrance de la carte professionnelle : {{mandataire.carte}}

désigné(s) ci-après le « bailleur »

ET :

- Nom et prénom du locataire : {{locataire1.nom}}
- ▸ SI second locataire : nom et prénom du second locataire : {{locataire2.nom}}
- Adresse e-mail du locataire (facultatif) : {{locataire1.email}}
- Numéro de téléphone portable du locataire (facultatif) : {{locataire1.telephone}}
- ▸ SI second locataire : numéro de téléphone portable et adresse e-mail du second locataire (facultatif) : {{locataire2.telephone}}, {{locataire2.email}}
- ▸ SI garant : nom et adresse du garant : {{garant.nom}}, {{garant.adresse}}

désigné(s) ci-après le « locataire »

Il a été convenu ce qui suit :

### II. OBJET DU CONTRAT

Le présent contrat a pour objet la location d'un logement ainsi déterminé :

**A. Consistance du logement**

- Localisation du logement (adresse, bâtiment, étage, porte, etc.) : {{bien.adresse\_complete}}
- Identifiant fiscal du logement : {{bien.identifiant\_fiscal}}
- Type d'habitat : ☐ immeuble collectif ☐ individuel → {{bien.type\_habitat}}
- Régime juridique de l'immeuble : ☐ mono propriété ☐ copropriété → {{bien.copropriete}}
- Période de construction : ☐ avant 1949 ☐ de 1949 à 1974 ☐ de 1975 à 1989 ☐ de 1989 à 2005 ☐ depuis 2005 → {{bien.periode\_construction}}
- Surface habitable (en m²) : {{bien.surface\_habitable}}
- Nombre de pièces principales : {{bien.nb\_pieces}}
- Le cas échéant, autres parties du logement : ☐ grenier ☐ comble aménagés ☐ terrasse ☐ balcon ☐ loggia ☐ jardin ☐ autres → {{bien.annexes\_privatives}}
- Le cas échéant, éléments d'équipements du logement : {{bien.equipements}}
- Modalité de production de chauffage : ☐ individuel ☐ collectif → {{bien.chauffage}} ; ▸ SI collectif : modalités de répartition de la consommation du locataire : {{bien.chauffage\_repartition}}
- Modalité de production d'eau chaude sanitaire : ☐ individuel ☐ collectif → {{bien.eau\_chaude}} ; ▸ SI collectif : modalités de répartition : {{bien.eau\_chaude\_repartition}}

**Rappel :** un logement décent doit respecter les critères minimaux de performance suivants :

a) En France métropolitaine :

1. À compter du 1er janvier 2025, le niveau de performance minimal du logement correspond à la classe F du DPE ;
2. À compter du 1er janvier 2028, le niveau de performance minimal du logement correspond à la classe E du DPE ;
3. À compter du 1er janvier 2034, le niveau de performance minimal du logement correspond à la classe D du DPE.

b) En Guadeloupe, en Martinique, en Guyane, à La Réunion et à Mayotte :

1. À compter du 1er janvier 2028, le niveau de performance minimal du logement correspond à la classe F du DPE ;
2. À compter du 1er janvier 2031, le niveau de performance minimal du logement correspond à la classe E du DPE.

La consommation d'énergie finale et le niveau de performance du logement sont déterminés selon la méthode du diagnostic de performance énergétique mentionné à l'article L. 126-26 du code de la construction et de l'habitation.

Niveau de performance du logement (classe du diagnostic de performance énergétique) : {{bien.dpe\_classe}}

**B. Destination des locaux :** ☐ usage d'habitation ☐ usage mixte professionnel et d'habitation → {{bail.destination}}

▸ SI le logement est soumis à la servitude : Le cas échéant, Servitude de résidence principale : le logement objet du présent contrat est soumis à l'obligation prévue à l'article L. 151-14-1 du code de l'urbanisme ; il est à usage exclusif de résidence principale, au sens de l'article 2 de la loi du 6 juillet 1989 susmentionnée.

**C. Le cas échéant, désignation des locaux et équipements accessoires de l'immeuble à usage privatif du locataire** (ex. n° de lot du garage, parking, cave, grenier, etc.) : {{bien.locaux\_accessoires}}

**D. Le cas échéant, énumération des locaux, parties, équipements et accessoires de l'immeuble à usage commun** (garage à vélo, ascenseur, espaces verts, aires et équipements de jeux, laverie, local poubelle, gardiennage, autres prestations et services collectifs etc.) : {{bien.parties\_communes}}

**E. Le cas échéant, équipement d'accès aux technologies de l'information et de la communication** (ex. modalités de réception de la télévision dans l'immeuble, modalités de raccordement internet etc.) : {{bien.tic}}

### III. DATE DE PRISE D'EFFET ET DURÉE DU CONTRAT

La durée du contrat et sa date de prise d'effet sont ainsi définies :

**A. Date de prise d'effet du contrat :** {{bail.date\_effet}}

**B. Durée du contrat :** ☐ 3 ans (personne physique) ☐ 6 ans (personne morale) ☐ durée réduite à {{bail.duree\_reduite}} (minimum 1 an, limité aux événements précis qui justifient que le bailleur personne physique ait à reprendre le local pour des raisons professionnelles ou familiales) → calculé selon {{entite.type}}

**C. ▸ SI durée réduite : événement et raison justifiant la durée réduite du contrat de location :** {{bail.motif\_duree\_reduite}}

En l'absence de proposition de renouvellement du contrat, celui-ci est, à son terme, reconduit tacitement pour 3 ou 6 ans et dans les mêmes conditions. Le locataire peut mettre fin au bail à tout moment, après avoir donné congé. Le bailleur, quant à lui, peut mettre fin au bail à son échéance et après avoir donné congé, soit pour reprendre le logement en vue de l'occuper lui-même ou une personne de sa famille, soit pour le vendre, soit pour un motif sérieux et légitime.

### IV. CONDITIONS FINANCIÈRES

Les parties conviennent des conditions financières suivantes :

**A. Loyer**

1° Fixation du loyer initial :

a) Montant du loyer mensuel (en €) : {{bail.loyer\_hc}}

b) ▸ SI zone tendue : modalités particulières de fixation initiale du loyer applicables dans certaines zones tendues :

- Le loyer du logement objet du présent contrat est soumis au décret fixant annuellement le montant maximum d'évolution des loyers à la relocation : ☐ oui ☐ non → {{bien.zone\_tendue}}
- Le loyer du logement objet du présent contrat est soumis au loyer de référence majoré fixé par arrêté préfectoral : ☐ oui ☐ non → {{bien.encadrement}}
- ▸ SI encadrement : montant du loyer de référence (€/m²) : {{bien.loyer\_reference}} ; montant du loyer de référence majoré (€/m²) : {{bien.loyer\_reference\_majore}} ; le cas échéant, complément de loyer : {{bail.complement\_loyer}}

c) ▸ SI le précédent locataire est parti depuis moins de dix-huit mois : informations relatives au loyer du dernier locataire (montant du dernier loyer acquitté par le précédent locataire, date de versement et date de la dernière révision du loyer) : {{bail.dernier\_loyer}}, {{bail.dernier\_loyer\_date}}, {{bail.derniere\_revision}}

2° Le cas échéant, modalités de révision :

a) Date de révision : {{bail.date\_revision}}

b) Date ou trimestre de référence de l'IRL : {{bail.trimestre\_irl}}

**B. Charges récupérables**

1. Modalité de règlement des charges récupérables : ☐ Provisions sur charges avec régularisation annuelle ☐ Paiement périodique des charges sans provision → {{bail.mode\_charges}}. En cas de colocation, les parties peuvent convenir de la récupération des charges par le bailleur sous la forme d'un forfait.
2. Le cas échéant, montant des provisions sur charges ou, en cas de colocation, du forfait de charge : {{bail.charges}}
3. ▸ SI colocation avec forfait révisable : modalités de révision du forfait de charges : {{bail.revision\_forfait}}

**C. ▸ SI travaux d'économies d'énergie : contribution pour le partage des économies de charges**

1. Montant et durée de la participation du locataire restant à courir au jour de la signature du contrat : {{bail.contribution\_economies}}
2. Éléments propres à justifier les travaux réalisés donnant lieu à cette contribution : {{bail.justification\_economies}}

**D. ▸ SI colocation : souscription par le bailleur d'une assurance pour le compte des colocataires :** ☐ oui ☐ non → {{bail.assurance\_compte\_coloc}} ; montant total annuel récupérable : {{bail.assurance\_montant}} ; montant récupérable par douzième : {{bail.assurance\_douzieme}}

**E. Modalités de paiement**

- Périodicité du paiement : {{bail.periodicite}}
- Paiement : ☐ à échoir ☐ à terme échu → {{bail.terme}}
- Date ou période de paiement : {{bail.jour\_paiement}}
- Le cas échéant, lieu de paiement : {{bail.lieu\_paiement}}
- Montant total dû à la première échéance de paiement pour une période complète de location : loyer (hors charges) {{bail.loyer\_hc}} € ; charges récupérables {{bail.charges}} € ; contribution pour le partage des économies de charges {{bail.contribution\_mensuelle}} € ; en cas de colocation, assurance récupérable pour le compte des colocataires {{bail.assurance\_douzieme}} €.

**F. ▸ SI renouvellement avec loyer manifestement sous-évalué : modalités de réévaluation**

1. Montant de la hausse ou de la baisse de loyer mensuelle : {{bail.reevaluation\_montant}}
2. Modalité d'application annuelle de la hausse (par tiers ou par sixième selon la durée du contrat et le montant de la hausse de loyer) : {{bail.reevaluation\_modalite}}

**G. Dépenses énergétiques (pour information)**

Montant estimé des dépenses annuelles d'énergie pour un usage standard de l'ensemble des usages énumérés dans le diagnostic de performance énergétique (chauffage, refroidissement, production d'eau chaude sanitaire, éclairage et auxiliaires de chauffage, de refroidissement, d'eau chaude sanitaire et de ventilation) mentionné à l'article L. 126-26 du code de la construction et de l'habitation : {{dpe.depenses\_annuelles}} (estimation réalisée à partir des prix énergétiques de référence de l'année : {{dpe.annee\_prix}}).

### V. TRAVAUX

A. ▸ SI travaux depuis le dernier bail : montant et nature des travaux d'amélioration ou de mise en conformité avec les caractéristiques de décence effectués depuis la fin du dernier contrat de location ou depuis le dernier renouvellement : {{bail.travaux\_depuis\_dernier\_bail}} ; montant des travaux d'amélioration effectués au cours des six derniers mois : {{bail.travaux\_6\_mois}}

B. ▸ SI convenu : majoration du loyer en cours de bail consécutive à des travaux d'amélioration entrepris par le bailleur (nature des travaux, modalités d'exécution, délai de réalisation ainsi que montant de la majoration du loyer) : {{bail.majoration\_travaux}}

C. ▸ SI convenu : diminution de loyer en cours de bail consécutive à des travaux entrepris par le locataire (durée de cette diminution et, en cas de départ anticipé du locataire, modalités de son dédommagement sur justification des dépenses effectuées) : {{bail.diminution\_travaux}}

### VI. GARANTIES

Le cas échéant, montant du dépôt de garantie de l'exécution des obligations du locataire / garantie autonome (inférieur ou égal à un mois de loyers hors charges) : {{bail.depot\_garantie}} €

### VII. LE CAS ÉCHÉANT, CLAUSE DE SOLIDARITÉ

▸ SI plusieurs locataires : Modalités particulières des obligations en cas de pluralité de locataires : {{bail.clause\_solidarite}}. Le contrat type prévoit « une clause prévoyant la solidarité des locataires et l'indivisibilité de leurs obligations » sans en imposer la rédaction. Rédaction proposée par Baillome, à valider : « Pour l'exécution de toutes les obligations du présent contrat, il y aura solidarité et indivisibilité entre les locataires. »

### VIII. CLAUSE RÉSOLUTOIRE

Le contrat de location est résilié de plein droit pour défaut de paiement du loyer ou des charges aux termes convenus ou pour non versement du dépôt de garantie. La clause de résiliation de plein droit ne produit effet que six semaines après la date d'un commandement de payer demeuré infructueux.

▸ SI au moins une clause facultative est activée : Le cas échéant, Modalités de résiliation de plein droit du contrat pour des motifs autres que le défaut de paiement du loyer ou des charges ou le non versement du dépôt de garantie : le contrat de location est résilié de plein droit :

- ▸ SI activée (cochée par défaut) : pour la non-souscription d'une assurance des risques locatifs, cette clause ne produisant effet qu'un mois après commandement demeuré infructueux ;
- ▸ SI activée (cochée par défaut) : pour le non-respect de l'obligation d'user paisiblement des locaux loués, résultant de troubles de voisinage constatés par une décision de justice passée en force de chose jugée ;
- ▸ SI le logement est soumis à la servitude : lorsque le logement est soumis à l'obligation prévue à l'article L. 151-14-1 du code de l'urbanisme, pour le non-respect de l'obligation de l'occuper exclusivement à titre de résidence principale ; dans ce dernier cas, la clause ne peut produire effet qu'à l'expiration d'un délai de mise en demeure fixé par le maire conformément au II de l'article L. 481-4 du code de l'urbanisme.

### IX. LE CAS ÉCHÉANT, HONORAIRES DE LOCATION

▸ SI le bail est conclu avec le concours d'une personne mandatée et rémunérée à cette fin : reproduction des dispositions du I de l'article 5 de la loi du 6 juillet 1989 (alinéas 1 à 3), plafonds applicables, détail et répartition des honoraires entre bailleur et locataire, selon le texte du contrat type. Dans Baillome, un bailleur qui loue seul n'a pas de mandataire : cette partie est masquée.

### X. AUTRES CONDITIONS PARTICULIÈRES

{{bail.conditions\_particulieres}}

Seules les clauses acceptées par le contrôle de Baillome peuvent figurer ici (aucune clause interdite par l'article 4 de la loi du 6 juillet 1989).

### XI. ANNEXES

Sont annexées et jointes au contrat de location les pièces suivantes :

A. ▸ SI copropriété : un extrait du règlement concernant la destination de l'immeuble, la jouissance et l'usage des parties privatives et communes, et précisant la quote-part afférente au lot loué dans chacune des catégories de charges

B. Un dossier de diagnostic technique comprenant : un diagnostic de performance énergétique ; un constat de risque d'exposition au plomb pour les immeubles construits avant le 1er janvier 1949 ; une copie d'un état mentionnant l'absence ou la présence de matériaux ou de produits de la construction contenant de l'amiante ; un état de l'installation intérieure d'électricité et de gaz, dont l'objet est d'évaluer les risques pouvant porter atteinte à la sécurité des personnes ; le cas échéant, un état des risques naturels et technologiques (liste générée selon la règle R-04)

C. Une notice d'information relative aux droits et obligations des locataires et des bailleurs

**Notice jointe par Baillome :** texte intégral de l'annexe de l'arrêté du 29 mai 2015, dans sa version en vigueur depuis le 18 octobre 2026, issue de l'arrêté du 9 octobre 2026 (NOR VLOL2619452A), vérifiée sur Legifrance le 20 octobre 2026. Le texte est reproduit sans aucune modification ; seule la mise en page est propre à Baillome, le support et le format étant libres. Elle est commune au bail nu et au bail meublé.

**Choix de la version selon la date du bail :** la nouvelle notice s'applique aux contrats conclus ou renouvelés à compter du 18 octobre 2026. Pour un bail conclu ou renouvelé avant cette date, c'est la version issue de l'arrêté du 16 février 2023 qui s'applique. Baillome conserve les deux versions et enregistre avec chaque bail celle qui a été jointe.

**Écart résolu :** la notice de 2023 évoquait encore un délai de deux mois après le commandement de payer. La version du 18 octobre 2026 est alignée sur la loi et sur le contrat type : six semaines, clause résolutoire obligatoire pour impayés et défaut de dépôt de garantie, trois clauses facultatives (défaut d'assurance, troubles de voisinage, servitude de résidence principale).

**Enseignements de la notice à reporter dans les règles de Baillome :**

- Servitude de résidence principale : le bailleur doit la mentionner explicitement dans le bail, sinon le contrat est nul (confirme le contrôle prévu).
- Toute clause de résiliation de plein droit pour un autre motif que ceux de la loi est réputée non écrite : Baillome refuse ce type de clause libre.
- Impayés (formule Gestion, V2) : pour un bailleur personne physique ou une SCI familiale, signalement du commandement de payer à la CCAPEX dès deux mois d'impayés consécutifs ou une dette égale à deux mois de loyer hors charges ; assignation notifiée au préfet au moins six semaines avant l'audience.
- Litiges de moins de 5 000 € (par exemple sur le dépôt de garantie) : tentative de médiation, de procédure participative ou de conciliation obligatoire avant de saisir le juge, sauf cas de saisine obligatoire de la commission départementale de conciliation. À ajouter au guide de l'état des lieux.
- Zones tendues : la liste des communes change au 1er janvier 2027 (décret n° 2026-831 du 25 août 2026). Constante à mettre à jour dans Baillome avant le lancement.
- Garantie Visale : la notice la présente désormais ; elle conforte l'option prévue dans la fiche garant.

D. Un état des lieux (modèle M-03)

E. ▸ SI la commune l'exige : une autorisation préalable de mise en location

F. ▸ SI réévaluation d'un loyer sous-évalué : les références aux loyers habituellement constatés dans le voisinage pour des logements comparables

Le {{signature.date}}, à {{signature.lieu}}

Signature du bailleur \[ou de son mandataire, le cas échéant\] — signature électronique qualifiée

Signature du locataire — signature électronique qualifiée

*Contrat type issu de l'annexe 1 du décret n° 2015-587 du 29 mai 2015, dans sa version issue du décret n° 2026-596 du 6 juillet 2026.*

---

## Notes pour le développement

- Les notes de bas de page du contrat type (définition de la zone tendue, mention du dernier loyer, plafonds, etc.) sont reprises à l'identique en fin de document généré.
- Le texte est figé par version : chaque bail généré conserve la référence de la version utilisée.
- Les champs obligatoires non renseignés bloquent la génération (voir les contrôles de la matrice M-02).

## Sources

- [Legifrance : décret n° 2015-587 du 29 mai 2015 (contrats types)](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000030649868/)
- [Legifrance : décret n° 2026-596 du 6 juillet 2026](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054393114)
- [Texte intégral du contrat type vide, version du 1er octobre 2026](https://baildelocation.com/bail-de-location-vide/)
