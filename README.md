# Maison Verveine

Site vitrine d'un fleuriste et studio floral parisien. Projet scolaire.

HTML, CSS et JavaScript natifs. Aucun framework, aucune dépendance à installer,
aucun serveur applicatif : le site est entièrement statique et tourne dans le
navigateur. Les seules ressources externes sont la police (Fontshare) et les
photographies (Unsplash).

## Lancer le site

```bash
python proxy.py
```

Puis ouvrir <http://localhost:5199>. Ce script sert le site et fait tourner le
conseiller floral (voir plus bas).

Un simple `python -m http.server 5199` suffit si le conseiller ne vous intéresse
pas : tout le reste du site en est indépendant.

## Les pages

| Fichier | Rôle |
|---|---|
| `index.html` | La vitrine : manifeste, services, bouquets de saison, réalisations, méthode, témoignages, FAQ. Le hero est une vidéo (`media/hero.mp4`) |
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

Une barre de chat. Aucune réponse écrite d'avance : tout vient d'un modèle de
langage, cadré par un prompt système qui lui interdit de sortir du sujet
« fleurs et boutique ».

### Pourquoi un proxy

`proxy.py` sert le site **et** relaie les questions vers le modèle. Deux raisons,
toutes deux importantes :

1. **La clé d'API ne descend jamais dans le navigateur.** Mise dans un fichier
   `.js`, elle serait lisible par n'importe quel visiteur et récupérée en
   quelques minutes par les robots qui scannent GitHub.
2. **Le prompt système reste hors de portée.** Écrit côté navigateur, n'importe
   qui le réécrirait depuis la console pour faire sortir le bot de son sujet.
   Ici, personne n'y touche.

### Mise en route

```bash
cp .env.exemple .env      # puis renseigner MV_CLE
python proxy.py
```

`.env` est ignoré par Git. Le proxy accepte tout fournisseur compatible avec le
format OpenAI : Mistral, OpenAI, Groq et autres, en changeant `MV_URL` et
`MV_MODELE`.

Sans clé, ou sur un hébergement purement statique (GitHub Pages), il n'y a pas
de modèle à interroger : le widget l'annonce et renvoie vers l'atelier.

### Mise en ligne sur Vercel

Vercel ne fait pas tourner `proxy.py` en continu : il exécute les fichiers de
`api/` comme fonctions serverless, appelées une par une. `api/chat.py` et
`api/etat.py` remplissent donc en production le rôle que `proxy.py` remplit en
local. Les deux importent `api/_conseiller.py`, seule source de vérité du prompt
et des garde-fous : il n'existe pas deux versions du périmètre.

**La clé ne se met pas dans le dépôt, mais dans les variables d'environnement du
projet Vercel.**

Par l'interface : *Project → Settings → Environment Variables*, ajouter

| Nom | Valeur | Environnements |
|---|---|---|
| `MV_CLE` | votre clé | Production, Preview, Development |

C'est la seule variable indispensable. `MV_URL` et `MV_MODELE` ont pour valeurs
par défaut Mistral et `open-mistral-nemo` ; ne les ajoutez que pour changer de
fournisseur ou de modèle.

En ligne de commande, avec la CLI Vercel :

```bash
vercel env add MV_CLE production
```

Un redéploiement est nécessaire après l'ajout : une fonction déjà déployée ne
voit pas les variables créées ensuite.

Pour vérifier que tout est branché, ouvrir `https://votre-projet.vercel.app/api/etat`.
La réponse attendue est `{"ia": true, "modele": "open-mistral-nemo"}`. Si `ia`
vaut `false`, la variable n'est pas visible par la fonction : vérifier son nom et
redéployer.

### Si le conseiller répond « je n'arrive pas à joindre l'atelier »

Le terminal où tourne `proxy.py` affiche la cause exacte. Le cas le plus
fréquent est un `429` : la clé est bonne, mais l'inférence n'est pas activée sur
le compte. Chez Mistral, cela se règle dans *console.mistral.ai → Workspace →
Billing*, en activant le plan gratuit (vérification par téléphone) ou en
ajoutant un moyen de paiement. Aucun changement de code n'est nécessaire.

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
