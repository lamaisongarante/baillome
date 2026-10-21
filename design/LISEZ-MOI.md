# Maquettes et logo validés de Baillome

Référence visuelle pour le développement. À ranger dans le dossier du projet, par exemple `BAILLOME/design/`.

## Contenu

- `ecrans/` : les écrans de l'application en PNG (rendu ×2). Les fichiers qui regroupent plusieurs écrans portent leurs numéros (par exemple `13-16-…`).
  - 01 accueil · 02 check-up (question DPE) · 03 résultat du check-up · 04 agenda · 05 fiche du bien · 06 fiche locataire · 07 envoi d'un document · 08 je délègue · 09 module état des lieux (3 écrans) · 10-11 loyers et déclaration fiscale · 12 extrait de compte · 13-16 bienvenue, premier bien (avec DPE), fiche du bien à compléter, coffre, abonnement · 17-19 veille légale, Objectif 2028, dossier litige.
- `documents/` : les documents PDF générés, au format imprimable (A4, fond blanc, sans aplat de couleur).
- `logo/` : le logo « maison interrupteur ».
  - `app-icon-1024.png` / `.svg` : icône d'application (carrée, sans transparence, les coins sont arrondis par le système).
  - `android-adaptive-foreground.png` / `.svg` : premier plan de l'icône adaptative Android (fond à régler sur `#0E3B2E`).
  - `splash-logo.png` / `.svg` : logo de l'écran de démarrage (fond à régler sur `#0E3B2E`).
  - `logo-icone-vert` et `logo-icone-citron` : tuiles arrondies pour l'interface et le site.
  - `logo-glyphe-vert` : la maison seule, vert pin, sur fond transparent.
  - `logotype-vert-pin.png` et `logotype-blanc-sur-fond-vert.png` : logo complet avec le mot Baillome (Bricolage Grotesque ExtraBold).
  - `logo-planche.png` : la planche validée, avec toutes les déclinaisons.
- `sources-html/` : le code HTML de chaque maquette, avec les couleurs, tailles, marges et arrondis exacts. S'ouvre dans un navigateur grâce à `support.js` (polices chargées depuis Google Fonts).

## Règles d'interprétation

- **Les maquettes fixent l'apparence**, le cahier des charges fixe les règles. En cas d'écart sur une règle juridique ou un calcul, le cahier des charges prime.
- Les valeurs entre crochets (`[Prénom Nom]`, `[indice]`, `[adresse]`) sont des emplacements de données.
- Les données d'exemple (T2 La Garde classé F au loyer gelé de 700 €, studio meublé de Toulon révisé de 540 € à 553 €, garage d'Hyères à 95 €) sont cohérentes entre elles : elles peuvent servir de jeu de test.
- Navigation : 5 onglets (Accueil, Biens, Loyers au centre, Agenda, Docs) ; le compte est derrière l'avatar de l'accueil.
- Couleurs, polices et formes : voir CLAUDE.md.
