# Tribune – guide pour mettre le site sur le téléphone d'un ami

Le but : ton ami ouvre **un lien** sur son téléphone, et le site s'installe comme une appli (icône sur l'écran
d'accueil). Aucun logiciel à installer pour lui. Toi, tu fais la mise en ligne **une seule fois**, depuis un
ordinateur (≈ 20 minutes la première fois).

> Le site est un jeu **gratuit, en jetons fictifs**, sans gain possible. Il n'est pas destiné aux mineurs.

---

## Vue d'ensemble

1. Tu crées une **clé API-Football** (la source des matchs, des cotes et des logos).
2. Tu mets le dossier du site en ligne sur **Vercel** (hébergement gratuit pour un usage perso).
3. Tu récupères l'**adresse du site** (ex. `https://tribune-xxxx.vercel.app`) et tu l'envoies à ton ami.
4. Ton ami l'ouvre sur son téléphone et l'ajoute à son écran d'accueil.

Chaque personne a ses propres paris et son propre solde de jetons, enregistrés **dans son téléphone**.
Il n'y a pas de compte, pas de mot de passe, et ton ami ne voit pas tes paris (ni l'inverse).

---

## Étape 1 – Créer la clé API-Football

1. Va sur https://dashboard.api-football.com et crée un compte.
2. Copie ta clé (une longue suite de lettres et de chiffres) quelque part.
3. **Avant de continuer, vérifie que ta clé donne accès à la saison en cours.** L'offre gratuite
   (100 requêtes par jour) peut être limitée à d'anciennes saisons. Pour tester, ouvre un terminal et tape
   (en remplaçant `TA_CLE`) :

       curl -H "x-apisports-key: TA_CLE" "https://v3.football.api-sports.io/fixtures?league=61&season=2026&next=3"

   - Si tu vois une liste de matchs → c'est bon.
   - Si tu vois un message d'erreur parlant de plan, d'abonnement ou de saison → il faudra une offre payante
     (vérifie les tarifs sur leur site) ou ça ne fonctionnera pas.
   - Teste aussi les cotes :
     `https://v3.football.api-sports.io/odds?league=61&season=2026&bet=1&bookmaker=8` (même méthode).

**Ne partage jamais ta clé** (ni avec ton ami, ni sur Internet). Elle reste cachée sur le serveur ; ton ami
n'en a pas besoin.

---

## Étape 2 – Mettre le site en ligne (sans ligne de commande)

C'est la méthode la plus simple : tout se fait dans le navigateur.

### 2.1 Créer un compte GitHub et y déposer le dossier
1. Crée un compte gratuit sur https://github.com.
2. Clique sur **New repository** (nouveau dépôt), nomme-le `tribune`, laisse-le **Private**, puis **Create repository**.
3. Sur la page du dépôt, clique sur **uploading an existing file**.
4. Dézippe `tribune-pro.zip` sur ton ordinateur, puis **glisse le contenu du dossier `tribune-pro`**
   (le fichier `index.html`, le dossier `api`, les icônes, etc.) dans la page GitHub.
   Important : `index.html` doit se retrouver **à la racine** du dépôt, pas dans un sous-dossier.
5. Clique sur **Commit changes**.

### 2.2 Brancher Vercel
1. Crée un compte gratuit sur https://vercel.com (choisis « Continue with GitHub »).
2. Clique sur **Add New… → Project**, puis **Import** à côté de ton dépôt `tribune`.
3. Ouvre la section **Environment Variables** et ajoute :
   - Name : `API_FOOTBALL_KEY`
   - Value : ta clé de l'étape 1
4. Clique sur **Deploy** et attends 1 à 2 minutes.
5. Vercel affiche l'adresse du site. Ouvre-la sur ton téléphone pour vérifier que les matchs s'affichent.

### Variante en ligne de commande (si tu es à l'aise)

    npm i -g vercel
    cd tribune-pro
    vercel                          # réponds aux questions
    vercel env add API_FOOTBALL_KEY # colle ta clé (environnement Production)
    vercel --prod

---

## Étape 3 – Envoyer le site à ton ami

Envoie-lui l'adresse par message. Pour que ce soit encore plus simple, tu peux créer un QR code
(par exemple avec un générateur de QR code en ligne) et le lui montrer à l'écran.

Si Vercel affiche une page de connexion au lieu du site, va dans **Settings → Deployment Protection** de ton
projet et désactive la protection pour l'environnement **Production**.

## Étape 4 – Ton ami installe le site sur son téléphone

**iPhone (Safari obligatoire)**
1. Ouvrir l'adresse dans **Safari**.
2. Appuyer sur le bouton **Partager** (le carré avec la flèche vers le haut).
3. Choisir **Sur l'écran d'accueil**, puis **Ajouter**.

**Android (Chrome)**
1. Ouvrir l'adresse dans **Chrome**.
2. Appuyer sur les **trois points** en haut à droite.
3. Choisir **Installer l'application** (ou **Ajouter à l'écran d'accueil**).

L'icône « Tribune » apparaît ensuite comme une appli normale.

---

## Utilisation au quotidien

- Les matchs, les cotes et les logos se chargent **automatiquement**. Le bouton **Actualiser** (en haut de la
  liste des matchs) force un rechargement.
- Quand un match sur lequel ton ami a parié est terminé, son pari est **réglé tout seul** à l'ouverture de
  l'appli (le résultat est vérifié toutes les 5 minutes tant que la page est ouverte).
- Les paris portent sur le **score à 90 minutes**. Un match annulé est remboursé.
- Le menu ☰ donne accès aux paris, aux résultats, au **Bilan honnête** (la simulation qui montre l'effet de
  la marge sur 100 journées) et à l'aide.
- Pour **repartir de zéro** : Mes paris → « Recommencer à zéro ».

## Si quelque chose ne marche pas

| Problème | Solution |
|---|---|
| « Impossible de charger les matchs » | Clé API absente ou fausse : vérifie la variable `API_FOOTBALL_KEY` dans Vercel (Settings → Environment Variables), puis **Redeploy**. |
| Message d'erreur parlant de plan ou de saison | Ton offre API-Football ne couvre pas la saison en cours (voir étape 1). |
| Il manque des compétitions ou des matchs | Les cotes ne sont pas encore publiées pour ces matchs, ou la compétition n'est pas incluse dans ton offre. |
| Plus de données au bout d'un moment | Quota journalier de l'API atteint (100 requêtes/jour en gratuit). Il se réinitialise chaque jour. |
| Un logo ne s'affiche pas | Normal parfois : un écusson de remplacement apparaît. |
| Le solde et l'historique ont disparu | Ils sont stockés dans le navigateur : vider les données du navigateur, changer de téléphone ou de navigateur les efface. |
| Pour modifier le site | Remplace les fichiers dans GitHub : Vercel redéploie automatiquement. |

## À savoir

- **Quota partagé** : toi et ton ami utilisez la même clé et donc le même quota. Le site met les données en
  cache quelques heures pour l'économiser (réglable avec `CACHE_SECONDS`, voir plus bas).
- **Coûts** : Vercel et GitHub sont gratuits pour cet usage. Seule l'API peut devenir payante (étape 1).
- **Logos** : ils sont fournis par API-Football. Lis leurs conditions d'utilisation si tu rends le site public.
- **Jeu fictif** : n'ajoute ni achat de jetons, ni lots, ni conversion en argent. Si le jeu réel pose un
  problème à l'un de vous : **Joueurs Info Service, 09 74 75 13 13** (appel non surtaxé).
- **Confidentialité** : le site n'enregistre rien sur un serveur ; les paris restent sur chaque téléphone.
- L'adresse du site est accessible à toute personne qui la connaît. Ne la publie pas si tu veux la garder privée.

## Réglages avancés (facultatif)

Variables d'environnement à ajouter dans Vercel (Settings → Environment Variables), puis **Redeploy** :

| Variable | Rôle | Défaut |
|---|---|---|
| `API_FOOTBALL_KEY` | ta clé (obligatoire) | – |
| `BOOKMAKER` | numéro du bookmaker dont on affiche les cotes | 8 |
| `SEASON` | saison forcée (ex. 2026) | calculée |
| `CACHE_SECONDS` | durée du cache des matchs et cotes | 21600 (6 h) |
| `RESULTS_CACHE_SECONDS` | durée du cache des résultats | 300 (5 min) |

Pour changer les compétitions, modifie `LEAGUES` dans `api/_lib.js` (identifiants à vérifier dans la
documentation API-Football ; Europa League : 3, Conference League : 848). Plus de compétitions = plus
d'appels API.

## Contenu du dossier

    index.html            le site (menu, matchs, ticket, paris, résultats, bilan honnête, aide)
    manifest.webmanifest  permet l'installation sur l'écran d'accueil
    icon.svg, icon-*.png, apple-touch-icon.png   icônes
    api/_lib.js           appels à API-Football
    api/fixtures.js       matchs, cotes, derniers résultats
    api/results.js        résultats des matchs pariés
    package.json  .env.example
