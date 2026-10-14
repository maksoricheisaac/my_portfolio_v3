# Portfolio API

API NestJS 11 + Prisma 7 (PostgreSQL) du portfolio : authentification sécurisée de l'espace
d'administration, gestion des projets, des messages du formulaire de contact, des médias et du SEO.

## Démarrage

```bash
pnpm install
docker compose -f ../docker-compose.local.yml up -d  # PostgreSQL (5433) + Mailpit (UI :8025)
cp .env.example .env             # puis remplir les secrets (voir ci-dessous)
pnpm db:migrate                  # applique les migrations
pnpm start:dev                   # http://localhost:4000
```

Générer un secret : `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
Premier lancement : le **code d'installation** est affiché dans la console ; ouvrir
`http://localhost:3000/admin` lance l'assistant (`/admin/setup`). `pnpm db:seed` reste disponible
pour un amorçage non interactif (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
Avec Mailpit (`SMTP_HOST=localhost`, `SMTP_PORT=1025`), les codes OTP arrivent sur http://localhost:8025.
Sans `SMTP_HOST`, ils sont affichés dans la console **en développement uniquement**.

## Sécurité

| Mesure | Détail |
| --- | --- |
| Mots de passe | Argon2id ; politique : 12+ caractères, 3 classes, pas l'e-mail |
| Connexion | Mot de passe puis **code OTP e-mail** à 6 chiffres (désactivable depuis l'admin) |
| OTP | Haché (HMAC), 10 min, 5 essais max, usage unique, renvoi limité |
| Sessions | JWT d'accès 15 min + refresh token opaque **rotatif** (hashé en base), cookies `HttpOnly` / `SameSite=Strict` / `Secure` en prod |
| Réutilisation de refresh token | Détectée : toute la famille de sessions est révoquée |
| Brute force | Verrouillage du compte 15 min après 5 échecs + throttling par IP |
| Mot de passe oublié | Code OTP par e-mail, réponse identique que le compte existe ou non |
| CSRF | `SameSite=Strict` + contrôle de l'en-tête `Origin` sur toute écriture |
| Entrées | `ValidationPipe` (whitelist stricte), HTML riche assaini (`sanitize-html`) |
| Uploads | Format détecté sur les octets, ré-encodé en WebP (métadonnées supprimées), nom aléatoire, 8 Mo max |
| En-têtes | Helmet (CSP stricte, HSTS en prod), CORS limité à `WEB_ORIGINS` |
| Audit | Connexions, changements de mot de passe, modifications de contenu journalisés |

L'API ne doit pas être exposée directement sur Internet : le site Next.js la proxifie sur `/backend/*`
(`TRUST_PROXY=1`), ce qui garde les cookies de session en première partie.

## Endpoints

Installation (tant qu'aucun compte n'existe) : `GET /setup/status`, `POST /setup/token`,
`/setup/email/send`, `/setup/complete`.

Public : `GET /public/projects`, `GET /public/projects/:slug`, `GET /public/settings`,
`POST /public/contact`, `GET /media/:filename`, `GET /health`.

Auth : `POST /auth/login`, `/auth/login/verify`, `/auth/login/resend`, `/auth/refresh`, `/auth/logout`,
`/auth/password/forgot`, `/auth/password/reset`, `/auth/password/change`, `PATCH /auth/2fa`,
`GET /auth/me`, `/auth/sessions`.

Admin (session requise) : `/admin/projects`, `/admin/messages`, `/admin/media`, `/admin/settings`,
`/admin/dashboard`, `/admin/audit`.

## Scripts

`pnpm build` · `pnpm test` · `pnpm lint` · `pnpm db:migrate` · `pnpm db:deploy` · `pnpm db:seed` · `pnpm db:studio`
