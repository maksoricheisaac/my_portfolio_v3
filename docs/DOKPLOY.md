# Déploiement avec Dokploy

Dokploy fournit déjà Traefik (TLS Let's Encrypt, routage par domaine) : la stack n'embarque donc
**aucun reverse proxy** et ne publie **aucun port**. Un seul fichier, [docker-compose.yml](../docker-compose.yml),
sert tous les environnements ; seules les variables changent.

```
Internet ──► Traefik (Dokploy) ──► web :3000 ──/backend/*──► api :4000 ──► db :5432
                                    (réseau dokploy-network)   (réseau app)   (réseau data, isolé)
```

## 1. Créer le service

1. Dokploy → **Projects** → votre projet → **Create Service → Compose**.
2. **Provider** : Git (ce dépôt), branche voulue, *Compose path* : `./docker-compose.yml`,
   type **Docker Compose**.
3. Onglet **Environment** : coller le contenu de `env/.env.prod.example` (ou `.env.staging.example`,
   `.env.dev.example`) et le compléter. Secrets : `sh infra/scripts/gen-secrets.sh`.
4. Onglet **Domains** → ajouter un domaine :
   - **Service name** : `web`, **Port** : `3000`, **HTTPS** activé, certificat *Let's Encrypt*.
   - `SITE_URL` doit être exactement cette URL publique (`https://…`).
5. **Deploy**.

> `api` et `db` ne reçoivent **aucun** domaine : ils ne sont joignables que depuis le site.

## 2. Premier démarrage : assistant d'installation

Au premier démarrage, aucune donnée de compte n'est à fournir dans les variables : l'instance est
« non réclamée » et l'API affiche dans ses logs un **code d'installation à usage unique** :

```
================================================================
  FIRST-RUN SETUP
  No administrator exists yet. Open: https://<domaine>/admin/setup
  Setup token: 3f9a…
================================================================
```

1. Dokploy → service Compose → **Logs** (service `api`) : copier le code.
2. Ouvrir `https://<domaine>/admin` (redirige vers `/admin/setup`).
3. L'assistant guide : **code d'installation → compte → vérification e-mail → site → récapitulatif**.
   - Si le SMTP est configuré, un code est envoyé à votre adresse pour prouver que vous la recevez
     avant d'activer la double authentification (pas de risque de vous enfermer dehors).
   - Sans SMTP, le compte est créé sans double authentification (à activer ensuite dans *Sécurité*).
4. Une fois terminé, l'assistant disparaît : tous les endpoints `/setup/*` répondent 404.

Sécurité : sans le code d'installation (qui n'est lisible que par qui a accès au serveur), personne ne
peut s'emparer d'une instance fraîchement déployée. Après 10 codes erronés, un nouveau code est généré.
Variante : fixer `SETUP_TOKEN` (16+ caractères) dans l'onglet Environment.

Alternative non interactive (CI) : définir `ADMIN_EMAIL` + `ADMIN_PASSWORD` ; le compte est créé au
démarrage. Supprimer ensuite `ADMIN_PASSWORD`.

Le SMTP reste indispensable en production : il envoie les codes OTP de connexion.

## 3. Environnements

Créez un service Compose **par environnement** (idéalement dans les *environments* Dokploy
production / staging / development), sur la même repo :

| Env | Branche | `SITE_ENV` | Mails | Indexation |
| --- | --- | --- | --- | --- |
| production | `main` | `production` | SMTP réel | oui |
| staging | `staging` | `staging` | SMTP de test ou Mailpit | non |
| dev | `develop` | `dev` | Mailpit (`COMPOSE_PROFILES=mailcatcher`) | non |

- Tout `SITE_ENV` autre que `production` est servi en noindex (en-tête, balise `robots`, `robots.txt`).
- Secrets, mots de passe de base et domaines doivent être **différents** par environnement.
- Mailpit : ajouter un domaine sur le service `mailpit`, port `8025` ; l'interface est protégée par
  `MAILPIT_AUTH` (`utilisateur:motdepasse`).
- Pour protéger tout un staging par mot de passe, utiliser le middleware *Basic Auth* de Traefik
  (Dokploy → Advanced → Traefik, ou onglet **Security** si disponible pour votre type de service).

## 4. Points d'attention

- **Variables figées au build** : `SITE_URL`, `SITE_ENV` (et l'URL interne de l'API) sont intégrées au
  build de `web`. Après modification → **Rebuild**, pas seulement Restart.
- **IP des visiteurs** : `TRUST_PROXY=2` (Traefik + Next.js) pour que le verrouillage et le
  rate-limiting s'appliquent par visiteur et non globalement. À ne changer que si vous ajoutez un proxy
  (ex. Cloudflare → 3).
- **Données persistantes** : volumes nommés `pgdata` (base), `uploads` (images), `db_backups`
  (dumps quotidiens si `COMPOSE_PROFILES=backup`). Ne pas utiliser de bind mount relatif : le dépôt
  est recloné à chaque déploiement.
- **Sauvegardes hors serveur** : Dokploy sait sauvegarder une base *managée* vers du S3. Variante
  possible : créer une base PostgreSQL dans Dokploy, fournir son `DATABASE_URL` à l'API et retirer le
  service `db` du compose (le reste est inchangé).
- **Migrations** : appliquées automatiquement au démarrage de l'API (`prisma migrate deploy`).
- **Réseau `dokploy-network`** : déclaré `external` dans le compose ; il existe déjà sur tout serveur
  Dokploy. Pour tester ailleurs : `docker network create dokploy-network`.

## Sécurité : points d'exploitation

- **IP des visiteurs / limitation de débit** : `TRUSTED_PROXY_HOPS` (service `web`, défaut `1`) est le
  nombre de reverse proxies devant Next.js qui ajoutent l'adresse du client à `X-Forwarded-For`
  (Traefik = 1). Ne jamais le monter au-delà du nombre réel : les entrées de gauche sont écrites par
  le client. Vérifier sur staging qu'une requête avec un `X-Forwarded-For` forgé est bien limitée.
  Hors production (sans proxy), laisser `0` : tout le trafic partage alors un seul compteur.
- **Cookies de session** : `pf_at` et `pf_rt` sont `HttpOnly`, `SameSite=Strict` et `Secure` en
  production. Aucun jeton n'est lisible depuis JavaScript.
- **`ADMIN_PASSWORD`** : à retirer de l'environnement dès que le compte administrateur existe.
- **Mailpit** : `MAILPIT_AUTH` est obligatoire (`utilisateur:motdepasse`), jamais un secret réutilisé.
- **CSP** : le site envoie une Content-Security-Policy sans nonce (`script-src 'self' 'unsafe-inline'`)
  car Next.js injecte des scripts inline. Un nonce par requête rendrait toutes les pages dynamiques ;
  à envisager si le niveau de risque l'exige.
- **Images Docker** : épingler `node`, `postgres` et `mailpit` par digest
  (`docker buildx imagetools inspect <image>`) lors du prochain build en environnement connecté.
- **Base de données** : l'application utilise le rôle propriétaire `portfolio` ; séparer un rôle de
  migration d'un rôle applicatif (DML seul) est recommandé mais non appliqué automatiquement.
