# Maison Verveine

Site vitrine d'un fleuriste et studio floral parisien. Projet scolaire.

HTML, CSS et JavaScript natifs. Aucun framework, aucune dépendance à installer,
aucun serveur applicatif : le site est entièrement statique et tourne dans le
navigateur. Les seules ressources externes sont la police (Fontshare) et les
photographies (Unsplash).

## Lancer le site

Il suffit d'un serveur statique, par exemple :

```bash
python -m http.server 5199
```

Puis ouvrir <http://localhost:5199>.

Ouvrir `index.html` directement par double-clic fonctionne aussi, à ceci près
que les liens entre pages restent corrects mais que certains navigateurs
limitent les requêtes en `file://`.

## Les pages

| Fichier | Rôle |
|---|---|
| `index.html` | La vitrine : manifeste, services, bouquets de saison, réalisations, méthode, témoignages, FAQ |
| `atelier.html` | Le composeur de bouquet, avec rendu visuel et prix en direct |
| `devis.html` | Demande de devis pour un bouquet ou un événement, avec estimation chiffrée |

## Les scripts

| Fichier | Rôle |
|---|---|
| `script.js` | Navigation, menu mobile, révélations au scroll, défilé des avis |
| `bouquet.js` | Catalogue des fleurs, calcul du prix, dessin du bouquet (`window.MV`) |
| `atelier.js` | Interface du composeur |
| `devis.js` | Estimation, validation du formulaire, envoi et impression |
| `chatbot.js` | Le conseiller floral |

## Le composeur de bouquet

Le bouquet est dessiné à la volée dans un repère de 420 × 520 :

- les corolles sont de vraies photographies recadrées en cercle, réparties sur
  trois arcs (arrière, milieu, avant) avec une variation de taille et de
  rotation calculée à partir d'un générateur pseudo-aléatoire stable, pour que
  le même bouquet se redessine toujours à l'identique ;
- un masque radial fond le bord de chaque disque, sinon les photographies
  prises sur fond clair se verraient comme des pastilles découpées ;
- les tiges, le feuillage et l'emballage sont en SVG, dessinés respectivement
  derrière et devant les corolles.

Une composition tient entièrement dans l'URL
(`atelier.html?p=renoncule&s=gypsophile&f=eucalyptus&t=moyen&w=kraft`), ce qui
la rend partageable et permet de la transmettre à la page de devis.

## Le conseiller floral

Trois questions à choix (occasion, ambiance, budget), puis une recommandation
chiffrée et deux actions réelles : ouvrir la composition dans l'atelier, ou
partir d'un bouquet déjà monté.

Le déroulé est entièrement local et scripté : aucune requête réseau, aucune clé
d'API, rien n'est envoyé nulle part. C'est un guide de choix, pas un modèle de
langage, et l'en-tête du widget le dit explicitement.

## Le devis

L'estimation se recalcule à chaque saisie. Pour un bouquet, le montant est
ferme. Pour un événement, le résultat est une fourchette, parce qu'un devis
floral dépend de la saison et du lieu.

Faute de serveur, l'envoi passe par un lien `mailto:` prérempli avec le
récapitulatif complet, et le récapitulatif reste affiché à l'écran pour être
copié si le client de messagerie ne s'ouvre pas. Une feuille de style
d'impression permet d'en sortir un PDF propre.

## Accessibilité

Contrastes vérifiés en AA, focus visible au clavier, accordéon et onglets
navigables, `aria-live` sur les montants qui changent, `prefers-reduced-motion`
respecté partout. La vitrine reste lisible sans JavaScript ; le composeur, lui,
affiche alors un message et renvoie vers les bouquets déjà prêts.

## Crédits

Photographies : [Unsplash](https://unsplash.com), licence Unsplash.
Police : [General Sans](https://www.fontshare.com/fonts/general-sans), Indian Type Foundry.
Direction artistique inspirée du gabarit Framer « La Fleur » de Magdalena Wołowiec :
la grammaire visuelle a servi de référence, le contenu, la marque et le code sont originaux.
