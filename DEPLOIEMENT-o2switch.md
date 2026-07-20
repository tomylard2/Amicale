# Guide de déploiement sur o2switch

Ce guide décrit la mise en ligne de l'application (Next.js 16) sur un hébergement
mutualisé **o2switch** (cPanel + Passenger), avec **SQLite** comme base de données
et le **stockage des photos sur le disque** de l'hébergement.

> À faire ensemble : les étapes cPanel nécessitent votre accès. Suivez dans
> l'ordre ; en cas de blocage, notez le message d'erreur, on ajuste.

---

## 0. Prérequis

- Un compte **o2switch** actif avec accès **cPanel**.
- Le domaine `amicale-pompier-chateaubourg.fr` géré chez o2switch (ou pointé vers).
- L'accès **SSH** (activé par défaut chez o2switch) — utile pour l'installation.

---

## 1. Préparer un secret d'authentification

Sur votre ordinateur, dans le dossier `amicale-pompiers`, générez un secret :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copiez la valeur : elle servira pour `AUTH_SECRET` (étape 5).

---

## 2. Envoyer le code sur o2switch

Deux méthodes au choix :

**A. Via Git (recommandé)** — cPanel → *Git Version Control* → *Create* →
   collez l'URL du dépôt (ex. GitHub) → clonez dans `~/amicale-pompiers`.

**B. Via FTP / Gestionnaire de fichiers** — envoyez tout le dossier
   `amicale-pompiers` **SAUF** `node_modules`, `.next`, `.env` et `prisma/dev.db`
   dans `~/amicale-pompiers`.

---

## 3. Créer le dossier de données (base SQLite)

Dans cPanel → *Gestionnaire de fichiers*, créez un dossier **hors** de
l'application, par exemple `~/amicale-data`. La base y sera stockée pour
**survivre aux mises à jour** du code.

---

## 4. Créer l'application Node.js

cPanel → **Setup Node.js App** → *Create Application* :

- **Node.js version** : 20 ou plus (obligatoire pour Next.js 16).
- **Application mode** : `Production`.
- **Application root** : `amicale-pompiers`.
- **Application URL** : votre domaine (ou sous-domaine).
- **Application startup file** : `server.js`.

Cliquez *Create*.

---

## 5. Renseigner les variables d'environnement

Toujours dans l'écran de l'application Node.js, section
*Environment variables*, ajoutez (voir `.env.production.example`) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | `file:/home/VOTRE_LOGIN/amicale-data/prod.db` |
| `AUTH_SECRET` | le secret généré à l'étape 1 |
| `AUTH_URL` | `https://www.amicale-pompier-chateaubourg.fr` |
| `ADMIN_EMAIL` | `tom.lardeux@bt-blue.com` (identifiant de connexion du compte admin, pas une adresse de notification) |
| `NODE_ENV` | `production` |
| `GMAIL_USER` | `reservationamicalechateaubourg@gmail.com` |
| `GMAIL_APP_PASSWORD` | mot de passe d'application Gmail (voir myaccount.google.com/apppasswords) |
| `SIGNUP_ALERT_EMAIL` | `tomy.lardeux@gmail.com` (reçoit l'alerte de nouvelle inscription) |

> Remplacez `VOTRE_LOGIN` par votre identifiant o2switch.
> Après `npm install --include=dev`, les paquets de développement sont bien installés même avec `NODE_ENV=production`.

---

## 6. Installer, migrer, construire (SSH)

Dans l'écran de l'application Node.js, copiez la commande
*"Enter to the virtual environment"* (elle active le bon Node). Connectez-vous
en SSH puis collez-la. Ensuite, depuis `~/amicale-pompiers` :

```bash
npm install --include=dev   # installe TOUTES les dépendances (+ génère Prisma)
npm run db:deploy           # crée la base et applique les migrations
npm run build               # construit l'application pour la production
export DATABASE_URL="file:/home/VOTRE_LOGIN/amicale-data/prod.db"
export ADMIN_EMAIL="tom.lardeux@bt-blue.com"
npm run db:seed             # crée le compte administrateur initial
```

> `--include=dev` est indispensable : `NODE_ENV=production` (variable
> d'environnement de l'app) fait sinon sauter l'installation des paquets de
> développement (Tailwind, TypeScript...) pourtant nécessaires pour construire
> le site.
>
> Les variables d'environnement définies dans *Setup Node.js App* ne sont
> disponibles que pour l'application en ligne, pas dans ce terminal SSH —
> d'où les `export` avant `db:seed`.
>
> `db:seed` affiche l'e-mail et le mot de passe de l'admin — **changez ce mot
> de passe** après la première connexion.

---

## 7. Démarrer l'application

Retour dans *Setup Node.js App* → **Restart** l'application.

Visitez votre domaine : l'écran de connexion doit apparaître. 🎉

---

## 8. Brancher le domaine (si besoin)

Si l'application est sur un sous-domaine technique, cPanel → *Domains* permet
d'associer `www.amicale-pompier-chateaubourg.fr` à l'application. o2switch
fournit le **certificat SSL (HTTPS)** automatiquement (Let's Encrypt).

---

## 9. Mettre à jour le site plus tard

Après chaque modification du code :

```bash
# en SSH, dans le dossier de l'application, environnement Node activé
git pull                    # (si méthode Git) sinon renvoyer les fichiers
npm install --include=dev
npm run db:deploy           # applique d'éventuelles nouvelles migrations
npm run build
```

Puis *Restart* l'application dans cPanel.

---

## Dépannage

- **Erreur Prisma "engine" au démarrage** : o2switch est sous CloudLinux
  (RHEL). Si Prisma ne trouve pas le bon moteur, ajoutez dans
  `prisma/schema.prisma`, bloc `generator client` :
  `binaryTargets = ["native", "rhel-openssl-3.0.x"]`, puis relancez
  `npm install && npm run build`. (À faire ensemble si le cas se présente.)
- **La base est réinitialisée après une mise à jour** : vérifiez que
  `DATABASE_URL` pointe bien vers `~/amicale-data` (hors du dossier de l'app).
- **Photos qui disparaissent** : elles sont dans `public/uploads`. Si vous
  redéployez en écrasant l'app, sauvegardez ce dossier au préalable (ou on le
  déplacera aussi hors de l'app, comme la base).
- **Page blanche / erreur 503** : consultez les logs dans *Setup Node.js App*
  et vérifiez que le fichier de démarrage est bien `server.js` et Node ≥ 20.
- **`npm install`/`npm run` semble s'exécuter dans le mauvais dossier**
  (erreurs "file not found" sur des fichiers pourtant présents) : le
  `node_modules` créé par cPanel est un lien symbolique vers
  `~/nodevenv/.../lib/node_modules`, ce qui perturbe la détection du dossier
  de travail par npm. Déjà corrigé dans `package.json` (les scripts se
  replacent explicitement dans `INIT_CWD`) — si le problème réapparaît sur un
  nouveau script, appliquez le même principe.
- **Erreur "Symlink node_modules ... points out of the filesystem root"** :
  Turbopack refuse ce lien symbolique. `npm run build` utilise déjà
  `next build --webpack` pour l'éviter.
- **"Out of memory: Cannot allocate Wasm memory" pendant `npm run build`** :
  l'hébergement impose une limite mémoire stricte (LVE CloudLinux, ~4 Go)
  qui peut être dépassée si le build lance trop de workers en parallèle.
  Déjà corrigé via `experimental.cpus: 1` dans `next.config.ts`.
- **"ThreadPoolBuildError ... Resource temporarily unavailable" (panic Rust)
  pendant `npm run build`**, persistant même avec `RAYON_NUM_THREADS=1` et
  une pile réduite (`ulimit -s`) : la vraie cause est une limite LVE
  (nombre de processus/threads) invisible depuis le compte (n'apparaît ni
  dans `ulimit -a` ni dans `/proc/PID/limits`), trop basse pour que le
  compilateur natif (Rust/SWC) puisse même démarrer un seul thread. Seul
  o2switch peut l'augmenter (ticket support, demander la limite "Number of
  Processes" du LVE Manager). **En attendant**, voir "Construire en local"
  ci-dessous.
- **`npm run db:seed` échoue avec "Environment variable not found:
  DATABASE_URL"** : les variables de *Setup Node.js App* ne s'appliquent
  qu'à l'application en ligne, pas au terminal SSH. Il faut les `export`
  manuellement avant de lancer la commande (voir étape 6).

---

## Construire en local (si `npm run build` échoue sur le serveur)

Tant que la limite LVE n'est pas augmentée par o2switch, on peut construire
l'application sur un PC (où ça fonctionne) et envoyer seulement le résultat.

1. Sur le PC : `npm run build`, puis compresser le dossier `.next` **sans**
   son sous-dossier `cache` (inutile en production, mais représente ~95% de
   la taille) dans `next-build.zip`.
2. Envoyer `next-build.zip` dans le dossier de l'app via cPanel →
   *Gestionnaire de fichiers* → Upload.
3. En SSH :
   ```bash
   rm -rf .next
   unzip next-build.zip -d .next
   rm next-build.zip
   # Un zip fait sous Windows perd les droits Unix : sans ça, l'app plante
   # au démarrage avec "EACCES: permission denied" sur les fichiers .next.
   find .next -type d -exec chmod 755 {} \;
   find .next -type f -exec chmod 644 {} \;
   ```
4. *Setup Node.js App* → **Restart**.

---

## Sauvegarde automatique de la base de données

Le script `scripts/backup-db.mjs` copie `prod.db` chaque jour dans
`~/amicale-data/backups/` (purge des sauvegardes de plus de 35 jours) et
envoie la sauvegarde par e-mail le 1er de chaque mois.

**Ce script n'a pas besoin d'être redéployé** (il n'est pas dans `.next`) —
un simple `git pull` suffit pour le mettre à jour.

Les variables de *Setup Node.js App* ne sont pas disponibles pour une tâche
planifiée (cron) : il faut les fournir directement dans la commande cron.

1. cPanel → **Tâches Cron** (Cron Jobs).
2. Fréquence : *Une fois par jour* (choisissez une heure creuse, ex. 3h du matin).
3. Commande :
   ```bash
   DATABASE_URL="file:/home/VOTRE_LOGIN/amicale-data/prod.db" GMAIL_USER="reservationamicalechateaubourg@gmail.com" GMAIL_APP_PASSWORD="MOT_DE_PASSE_APPLICATION" BACKUP_EMAIL="reservationamicalechateaubourg@gmail.com" node /home/VOTRE_LOGIN/repositories/Amicale/scripts/backup-db.mjs >> /home/VOTRE_LOGIN/amicale-data/backup.log 2>&1
   ```
   Remplacez `VOTRE_LOGIN` et `MOT_DE_PASSE_APPLICATION` par les vraies valeurs.
4. Test manuel possible en SSH avec la même commande (sans le cron).
