# Rapport d'audit de sécurité applicative — OWASP Top 10:2025

| | |
|---|---|
| **Projet** | Portfolio Riche Makso (`web/` Next.js 16, `api/` NestJS 11, PostgreSQL 17, Docker/Dokploy) |
| **Nature** | Audit en lecture seule + sondes dynamiques non destructives sur l'environnement de développement local |
| **Référentiel** | OWASP Top 10:2025 (A01–A10) |
| **Aucune modification de code** n'a été effectuée pendant l'audit. |

---

## 1. Résumé exécutif

Aucune vulnérabilité critique ou élevée n'a été identifiée dans le périmètre examiné. L'architecture applique des principes solides : garde d'authentification globale en refus par défaut, sessions à rotation avec détection de réutilisation, Argon2, uploads ré-encodés, API non exposée directement, conteneurs durcis.

Les points qui méritent une action sont les suivants :

1. **Le rate-limit par IP est contournable** en forgeant `X-Forwarded-For` (SEC-003, confirmé dynamiquement, y compris via le proxy Next.js). Il protège le formulaire de contact, les routes d'authentification, le setup et la réinitialisation de mot de passe, et il alimente les adresses IP du journal d'audit.
2. **La réponse automatique du formulaire de contact** peut servir de relais d'emails vers des tiers (SEC-002).
3. **Aucune Content-Security-Policy** sur le site ni sur le back-office (SEC-001).
4. Durcissement DevSecOps à compléter : aucun contrôle de sécurité en CI, images non épinglées, mot de passe Mailpit égal à un secret de sécurité (SEC-007, SEC-008).

| Gravité | Confirmées | Potentielles |
|---|---|---|
| Critique | 0 | 0 |
| Élevée | 0 | 0 |
| Moyenne | 3 | 0 |
| Faible | 6 | 1 |
| Informationnelle | 5 | 0 |

**Risque résiduel global estimé : faible à moyen**, sous réserve des contrôles non réalisés (section 11).

## 2. Périmètre et exclusions

**Inclus** : `api/src` (hors `src/generated/` code Prisma généré), `api/prisma`, `web/app`, `web/components`, `web/lib`, `web/proxy.ts`, `web/next.config.ts`, Dockerfiles, `docker-compose*.yml`, `web/.gitlab-ci.yml`, `env/*.example`, scripts `infra/`.

**Exclus / non réalisés** : production, Traefik/Dokploy, TLS, contenu réel des fichiers `.env`, historique Git, `devDependencies`, images Docker (aucun scan), fuzzing du sanitiseur au-delà d'un jeu de 16 charges, tests authentifiés (aucun identifiant utilisé).

## 3. Architecture et technologies

```
Internet → Traefik (TLS) → web:3000 (Next.js)
                           ├─ pages publiques (SSR + cache)
                           ├─ /admin/* (garde proxy.ts : présence du cookie pf_rt)
                           ├─ /backend/* → rewrite → api:4000
                           └─ /api/revalidate (secret partagé)
                      api:4000 (NestJS) → db:5432 (réseau Docker interne)
                                       → SMTP
```

- **Auth** : cookies `pf_at` (access JWT, 15 min) et `pf_rt` (refresh opaque, 7 j, rotation), 2FA par OTP email, compte administrateur unique (pas de rôles).
- **Garde globale** : `IpThrottlerGuard` → `OriginGuard` → `JwtAuthGuard`, `@Public()` explicite.
- **Données** : Prisma 7 + PostgreSQL, upload d'images (sharp), contenu riche assaini (sanitize-html).

## 4. Méthodologie et outils

| Activité | Outil / méthode | Exécuté |
|---|---|---|
| Revue de code (SAST manuel) | Lecture intégrale des modules sensibles | Oui |
| SCA | `pnpm audit --prod` (api, web) | Oui |
| Motifs dangereux | `grep` (`$queryRaw`, `child_process`, `eval`, `exec`, `new Function`) | Oui — 0 occurrence |
| Tests dynamiques | Sondes HTTP via `fetch` (Node) sur `localhost:3000` et `localhost:4000` | Oui |
| Test du sanitiseur | 16 charges XSS sur `dist/common/sanitize.js` | Oui |
| Semgrep, Gitleaks, Trivy | — | **Non** (non installés, Docker arrêté) |

Commandes réellement exécutées : `pnpm audit --prod` (dans `api/` et `web/`) ; scripts Node de sondes HTTP (en-têtes, accès sans cookie, CSRF/Origin, CORS, validation, taille de corps, traversée sur `/media`, throttling avec honeypot) ; script Node appelant `sanitizeRichText` et `plain`.

## 5. Version du référentiel

OWASP Top 10:2025 : A01 Broken Access Control, A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting Failures, A10 Mishandling of Exceptional Conditions.

## 6. Couverture des catégories

| Catégorie | Contrôles réalisés | Résultats | Risque | Vérification | Actions |
|---|---|---|---|---|---|
| A01 Access Control | Garde globale, routes `admin/*`, isolation, CSRF/Origin | 8 routes admin → 401 sans cookie (API et proxy) ; origine hostile → 403 ; compte unique donc pas d'IDOR multi-utilisateurs | Faible | Statique + dynamique (non authentifié) | Tests authentifiés à ajouter (section 14) |
| A02 Misconfiguration | En-têtes, CORS, Docker, Compose, endpoints exposés | CSP absente côté web ; CORS correct ; setup/health publics ; `cap_drop`, non-root | Moyen | Statique + dynamique (dev) | SEC-001, SEC-008, SEC-013 |
| A03 Supply Chain | `pnpm audit`, CI, images, `npx @latest` | 3 avis API (outillage Prisma, non exploitables) ; CI sans contrôles de sécurité ; images non épinglées | Faible | Partiel | SEC-006, SEC-007 |
| A04 Cryptographic | Hachage, OTP, tokens, secrets | Argon2, HMAC, SHA-256, `timingSafeEqual` | Faible | Statique | SEC-008, SEC-009 |
| A05 Injection | SQL, commandes, XSS, templates | Aucun SQL brut ; `ValidationPipe` strict ; 16/16 charges XSS neutralisées | Faible | Statique + dynamique | SEC-005, SEC-014 |
| A06 Insecure Design | Abus métier, limites, workflows | Rate-limit contournable ; auto-réponse relais | Moyen | Dynamique | SEC-002, SEC-003 |
| A07 Authentication | Sessions, cookies, OTP, verrouillage, JWT | Conception solide ; verrouillage exploitable en DoS | Faible | Statique | SEC-004 |
| A08 Integrity | Uploads, webhook, imports | Ré-encodage WebP, secret en temps constant, tags filtrés | Faible | Statique | SEC-012 |
| A09 Logging | Audit, alertes, rétention | Audit en base ; aucune alerte ; IP falsifiable | Faible | Statique | SEC-003, SEC-011 |
| A10 Exceptions | Erreurs, timeouts, secours | Pas de stack trace ; mail/audit non bloquants | Faible | Dynamique | SEC-015 |

## 7. Synthèse des constats

| ID | Titre | OWASP | Gravité | Statut | Priorité |
|---|---|---|---|---|---|
| SEC-001 | Aucune Content-Security-Policy sur le site web | A02 | Moyenne | Confirmée | P1 |
| SEC-002 | Auto-réponse du formulaire de contact utilisable comme relais d'emails | A06 | Moyenne | Confirmée | P1 |
| SEC-003 | Rate-limit par IP contournable via `X-Forwarded-For` | A06 / A02 / A09 | Moyenne | Confirmée (dev) | P1 |
| SEC-004 | Verrouillage du compte déclenchable par un tiers et énumération | A07 | Faible | Confirmée | P2 |
| SEC-005 | URLs de profil : tout schéma accepté | A05 / A08 | Faible | Potentielle | P3 |
| SEC-006 | Dépendances vulnérables (outillage Prisma) | A03 | Informationnelle | Confirmée | P3 |
| SEC-007 | CI/CD sans contrôles de sécurité, images non épinglées | A03 / A02 | Faible | Confirmée | P2 |
| SEC-008 | Mot de passe Mailpit par défaut = `OTP_SECRET` | A04 / A02 | Faible | Confirmée | P2 |
| SEC-009 | `ADMIN_PASSWORD` en variable d'environnement, token de setup dans les logs | A04 / A02 | Faible | Confirmée | P2 |
| SEC-010 | Rôle PostgreSQL unique propriétaire | A01 / A02 | Faible | Confirmée | P3 |
| SEC-011 | Aucune alerte de sécurité ni politique de rétention des données personnelles | A09 | Faible | Confirmée | P3 |
| SEC-012 | Images externes `https` autorisées dans le contenu riche | A08 | Informationnelle | Confirmée | P3 |
| SEC-013 | Surface exposée par `/backend` (setup/status, health) | A02 | Informationnelle | Confirmée | P3 |
| SEC-014 | `plain()` encode `<`, `>` en entités avant stockage | A05 (intégrité) | Informationnelle | Confirmée | P3 |
| SEC-015 | Message d'erreur de parsing JSON renvoyé tel quel | A10 | Informationnelle | Confirmée | P3 |

## 8. Détail technique des constats

### SEC-001 — Aucune Content-Security-Policy sur le site web
- **Gravité** : Moyenne · **Statut** : Confirmée · **Confiance** : Élevée · **Priorité** : P1
- **Localisation** : `web/next.config.ts` (bloc `headers()`).
- **Preuve** : réponses de `/fr` et `/admin/login` (dynamique) : HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` et COOP présents ; `content-security-policy` absent.
- **Prérequis** : une injection de HTML préalable (contournement du sanitiseur, écriture en base hors API).
- **Scénario** : le contenu riche est rendu via `dangerouslySetInnerHTML` (`web/app/[lang]/projects/[slug]/page.tsx`) ; sans CSP, un script injecté s'exécute sur l'origine du site, qui est aussi celle du back-office.
- **Impact** : confidentialité et intégrité des sessions administrateur.
- **CVSS** : non calculé (dépend d'un autre défaut).
- **Cause racine** : défense en profondeur non configurée.
- **Correction** : CSP stricte avec nonce (`default-src 'self'`, `script-src 'self' 'nonce-…'`, `img-src 'self' data: https:`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`), d'abord en `Report-Only`.
- **Validation** : en-tête présent sur toutes les routes, aucune violation en console.

### SEC-002 — Auto-réponse du formulaire de contact utilisable comme relais
- **Gravité** : Moyenne · **Statut** : Confirmée (code) · **Confiance** : Élevée · **Priorité** : P1
- **Localisation** : `api/src/messages/messages.service.ts`, `receive()`.
- **Preuve** : après notification du propriétaire, l'API envoie `AUTO_REPLY` à `saved.email` avec `Bonjour ${name}` ; aucune vérification de propriété de l'adresse, aucun CAPTCHA.
- **Prérequis** : `CONTACT_TO` et SMTP configurés (cas de la production).
- **Scénario** : un attaquant soumet l'adresse d'une victime et un « nom » à contenu choisi ; la victime reçoit un message depuis votre domaine.
- **Impact** : réputation du domaine d'envoi, blacklistage SMTP, harcèlement/phishing. Amplifié par SEC-003.
- **Correction** : supprimer l'auto-réponse ou la conditionner à une confirmation par lien ; ajouter Turnstile/hCaptcha ; plafonner par adresse de destination ; ne pas insérer le nom brut dans le corps.
- **Validation** : N soumissions pour une même adresse produisent au plus un email ; adresse non confirmée = aucun email.

### SEC-003 — Rate-limit par IP contournable via `X-Forwarded-For`
- **Gravité** : Moyenne · **Statut** : Confirmée en développement · **Confiance** : Élevée (topologie locale), Moyenne (production) · **Priorité** : P1
- **Localisation** : `api/src/common/throttle.ts`, `api/src/common/client-ip.ts`, `api/src/main.ts` (`trust proxy`), `web/app/[lang]/contact/actions.ts`.
- **Preuve (dynamique)** :
  - Limite du contact : 4 requêtes / 10 min. Même client sans en-tête : `202,202,202,202` puis `429,429,429` (limiteur fonctionnel).
  - Avec `X-Forwarded-For` différent à chaque requête, **via le proxy Next.js** `/backend/public/contact` : `202,202,202,202,202,202` ; **directement sur l'API** : 7 × `202`.
  - Environnement testé : `TRUST_PROXY=1`, `NODE_ENV=development`.
- **Prérequis** : joindre `/backend/*` ou le Server Action de contact ; en production, que Traefik/Next.js n'écrasent pas l'en-tête (non vérifié, voir section 11).
- **Scénario** : l'attaquant fait varier l'en-tête à chaque requête, donc chaque requête a un compteur neuf. Sont concernés `login` (8/min), `login/verify`, `login/resend`, `password/forgot` (5/10 min), `password/reset`, `setup/*`, `public/contact`.
- **Impact** : spam du formulaire et de la messagerie (avec SEC-002), envoi répété de codes OTP à l'administrateur, contournement des limites par IP des endpoints d'authentification (le verrouillage par compte et la limite de 5 essais par OTP restent actifs), et **journal d'audit falsifiable** (champ `ip` choisi par l'attaquant).
- **Cause racine** : le compte de sauts de confiance (`TRUST_PROXY`) suppose que chaque saut ajoute l'IP du client ; le serveur Next.js ne la rajoute pas, donc l'entrée la plus à droite reste celle du client. La Server Action utilise en plus la première entrée du header (contrôlée par le client).
- **Correction** : (1) faire ajouter/réécrire l'IP par la couche d'entrée (Traefik avec `forwardedHeaders.trustedIPs` vide) et faire en sorte que Next.js transmette `x-forwarded-for` en ajoutant le pair réel ; (2) dans la Server Action, utiliser l'entrée de droite correspondant au nombre de proxys de confiance ou `x-real-ip` posé par Traefik ; (3) ajouter des limites par ressource indépendantes de l'IP (par adresse email cible, par compte) ; (4) ne pas utiliser l'IP comme preuve dans l'audit sans la marquer « déclarée par le client ».
- **Validation** : 6 requêtes avec `X-Forwarded-For` rotatif depuis un même client doivent se terminer par des `429` à partir de la 5ᵉ, en local et sur staging.

### SEC-004 — Verrouillage du compte déclenchable par un tiers et énumération
- **Gravité** : Faible · **Statut** : Confirmée (code) · **Priorité** : P2
- **Localisation** : `api/src/auth/auth.service.ts`, `login()`.
- **Preuve** : 5 échecs → verrouillage 15 min ; compte verrouillé = 429 « Too many failed attempts », compte inconnu = 401 « Invalid credentials ».
- **Impact** : déni de service ciblé sur l'administrateur ; confirmation de l'existence d'un email.
- **Correction** : verrouillage par couple (compte, IP) ou délai progressif ; réponse identique dans les deux cas.
- **Validation** : 5 échecs depuis une IP A n'empêchent pas une connexion légitime depuis une IP B.

### SEC-005 — URLs de profil : tout schéma accepté
- **Gravité** : Faible · **Statut** : Potentielle · **Confiance** : Moyenne · **Priorité** : P3
- **Localisation** : `api/src/settings/settings.ts` (`optionalUrl = z.string().url()`).
- **Preuve** : validation syntaxique uniquement (non testée dynamiquement faute de session).
- **Impact** : aujourd'hui limité au JSON-LD `sameAs` (échappé) ; devient un XSS si ces champs alimentent un `href`.
- **Correction** : restreindre à `https?:` par `refine`.
- **Validation** : `javascript:alert(1)` rejeté en 400.

### SEC-006 — Dépendances vulnérables (outillage Prisma, API)
- **Gravité** : Informationnelle · **Statut** : Confirmée (présence), non exploitable (usage) · **Priorité** : P3
- **Preuve** : `pnpm audit --prod` → 3 avis : `deepmerge-ts <8.0.0` (GHSA-ggr8-5vv4-36mx, élevé), `mysql2 <3.22.0` (GHSA-3f6p-5ww8-9rcr, élevé), `mysql2 <=3.23.0` (GHSA-rgwj-5xj2-c3m3, modéré), tous sous `@prisma/client > prisma`. `web/` : aucune vulnérabilité.
- **Exploitabilité** : le projet utilise le driver `pg` ; `mysql2` n'est pas chargé ; `deepmerge-ts` est dans la configuration du CLI.
- **Correction** : mise à jour de Prisma ou `pnpm.overrides` ; relancer l'audit.

### SEC-007 — CI/CD sans contrôles de sécurité, images non épinglées
- **Gravité** : Faible · **Statut** : Confirmée · **Priorité** : P2
- **Preuve** : `web/.gitlab-ci.yml` = lint, typecheck, build ; rien pour `api/` ; images `node:24-alpine`, `postgres:17-alpine`, `axllent/mailpit:latest` ; `npx shadcn@latest mcp` dans les configurations MCP.
- **Correction** : étapes `pnpm audit`, gitleaks, Semgrep, Trivy ; épinglage par digest ; versions fixes pour les outils MCP.
- **Validation** : pipeline en échec sur une vulnérabilité ≥ élevée.

### SEC-008 — Mot de passe Mailpit par défaut égal à `OTP_SECRET`
- **Gravité** : Faible · **Statut** : Confirmée · **Priorité** : P2
- **Localisation** : `docker-compose.yml`, `MP_UI_AUTH: ${MAILPIT_AUTH:-mailpit:${OTP_SECRET}}`.
- **Preuve** : la valeur de repli est le secret lui-même (le commentaire dit « derived »).
- **Impact** : toute personne qui accède à Mailpit ou à ses logs connaît `OTP_SECRET` ; Mailpit contient précisément les codes OTP.
- **Correction** : `${MAILPIT_AUTH:?set MAILPIT_AUTH}`.

### SEC-009 — `ADMIN_PASSWORD` en variable d'environnement, token de setup dans les logs
- **Gravité** : Faible · **Statut** : Confirmée (conception) · **Priorité** : P2
- **Preuve** : `ADMIN_PASSWORD` reste visible via `docker inspect` ; le token de setup est imprimé dans les logs ; atténué par la comparaison en temps constant, la rotation après 10 échecs et le 404 une fois l'administrateur créé. Sur l'instance locale : `setup/status → required:false`.
- **Correction** : retirer la variable après amorçage ou utiliser un secret Docker ; réaliser le setup dans une fenêtre maîtrisée.

### SEC-010 — Rôle PostgreSQL unique propriétaire
- **Gravité** : Faible · **Statut** : Confirmée · **Priorité** : P3
- **Preuve** : `DATABASE_URL` utilise le rôle `portfolio` (propriétaire) ; `db:deploy` au démarrage avec le même rôle.
- **Correction** : rôle de migration distinct d'un rôle applicatif limité au DML.

### SEC-011 — Pas d'alerte de sécurité ni de rétention des données personnelles
- **Gravité** : Faible · **Statut** : Confirmée · **Priorité** : P3
- **Preuve** : `AuditLog` en base sans alerting ; `Message.ip` / `userAgent` conservés sans purge.
- **Correction** : alertes (verrouillages, `auth.refresh.reuse`, échecs répétés), export des logs, durée de rétention documentée.

### SEC-012 — Images externes `https` autorisées dans le contenu riche
- **Gravité** : Informationnelle · **Statut** : Confirmée · **Priorité** : P3
- **Preuve** : `<img src="https://a.example/x.png">` conservé par `sanitizeRichText`.
- **Impact** : pixel de suivi / contenu tiers (réservé à l'administrateur).
- **Correction** : restreindre aux médias hébergés si non souhaité.

### SEC-013 — Surface exposée par `/backend`
- **Gravité** : Informationnelle · **Statut** : Confirmée · **Priorité** : P3
- **Preuve** : le rewrite expose publiquement toutes les routes ; `GET /backend/setup/status` révèle l'état « non réclamé » et `mailEnabled` ; `/health` est public.
- **Correction** : liste blanche de préfixes dans le rewrite ; masquer `setup/status` hors période d'installation.

### SEC-014 — `plain()` encode les caractères HTML avant stockage
- **Gravité** : Informationnelle · **Statut** : Confirmée · **Priorité** : P3
- **Preuve** : `plain('a < b')` → `a &lt; b` ; React réaffiche `&lt;` littéralement.
- **Impact** : intégrité des données affichées (pas de risque de sécurité direct).
- **Correction** : stocker du texte brut et échapper à la sortie.

### SEC-015 — Message d'erreur de parsing JSON renvoyé
- **Gravité** : Informationnelle · **Statut** : Confirmée · **Priorité** : P3
- **Preuve** : corps `{bad json` → `400 {"message":"Expected property name or '}' in JSON at position 1 …"}`.
- **Correction** : message générique pour les erreurs de parsing.

## 9. Analyse des risques métier

| Actif | Menace principale | Constats |
|---|---|---|
| Réputation du domaine d'envoi / délivrabilité | Relais de spam, boîte aux lettres inondée | SEC-002, SEC-003 |
| Compte administrateur | Déni de service ciblé, spam d'OTP | SEC-003, SEC-004 |
| Intégrité du contenu public | XSS stockée si le sanitiseur est contourné | SEC-001, SEC-005, SEC-012 |
| Traçabilité | Journal d'audit falsifiable | SEC-003, SEC-011 |
| Chaîne de livraison | Dépendance/image compromise non détectée | SEC-006, SEC-007 |

## 10. Résultats des outils automatisés

| Outil | Résultat |
|---|---|
| `pnpm audit --prod` (web) | Aucune vulnérabilité connue |
| `pnpm audit --prod` (api) | 3 avis (2 élevés, 1 modéré), non exploitables dans le code lu — SEC-006 |
| Sondes dynamiques | Voir tableau ci-dessous |
| Jeu de 16 charges XSS | 16/16 neutralisées ; `javascript:`, `data:`, handlers `on*`, `<svg>`, `<iframe>`, `style`, mXSS `<math>` et `<noscript>` supprimés ; `//` protocol-relative refusé ; `rel="noopener noreferrer nofollow"` ajouté aux liens externes |

Sondes dynamiques (dev local, non authentifié) :

| Test | Résultat attendu | Observé |
|---|---|---|
| 8 routes `admin/*` et `auth/me`, `auth/sessions` sans cookie (API et via `/backend`) | 401 | 401 partout |
| POST mutatif avec `Origin: https://evil.example` | 403 | 403 « Origin not allowed » |
| POST mutatif `Sec-Fetch-Site: cross-site` sans Origin | 403 | 403 |
| Préflight CORS depuis origine hostile | pas d'`Access-Control-Allow-Origin` | absent |
| Préflight CORS depuis l'origine du site | ACAO + credentials | présents |
| JSON invalide / champs non autorisés | 400 sans stack trace | 400 (voir SEC-015) |
| Corps de 1,2 Mo | 413 | 413 |
| Injection dans `:slug` | 404 | 404 |
| Traversée / noms invalides sur `/media/…` | 404 | 404 |
| Rate-limit même client | 429 à partir de la 5ᵉ | 429 |
| Rate-limit avec `X-Forwarded-For` rotatif | 429 | **202 partout** (SEC-003) |
| Content-Security-Policy du site | présente | **absente** (SEC-001) |

Remarque : ces sondes ont consommé le compteur de contact de l'IP locale (réinitialisation sous 10 minutes) ; le honeypot garantit qu'aucun message n'a été stocké.

## 11. Limites de l'audit et contrôles non réalisés

- Aucun test authentifié : upload, CRUD projets, paramètres, messages, révocation de sessions, 2FA, réinitialisation de mot de passe n'ont été vérifiés que par lecture de code.
- En dynamique, API lancée en `NODE_ENV=development` : HSTS, cookies `Secure` et comportement de production non observés.
- Comportement réel de Traefik/Dokploy sur `X-Forwarded-For` et sur `TRUST_PROXY=2` non vérifié (SEC-003 en production).
- Semgrep, Gitleaks, Trivy non exécutés ; images Docker non scannées ; historique Git non analysé pour des secrets.
- `.env` réels non lus ; la force des secrets de production n'est pas évaluée.
- Le Server Action de contact (premier élément de `x-forwarded-for`) n'a pas été invoqué dynamiquement ; la conclusion repose sur la lecture du code.
- Disponibilité (déni de service) non testée par conception.

## 12. Plan de remédiation priorisé

### Phase 1 — Risques immédiats
| Action | Effort | Dépendances | Risque traité | Critère de validation |
|---|---|---|---|---|
| Corriger l'IP cliente (Traefik + Next.js + Server Action), ajouter des limites non basées sur l'IP | 0,5–1 j | Accès configuration Dokploy | SEC-003 | 6 requêtes à `X-Forwarded-For` rotatif → 429 dès la 5ᵉ |
| Désactiver ou vérifier l'auto-réponse, ajouter un CAPTCHA | 0,5 j | Choix produit | SEC-002 | 1 email max par adresse non confirmée |
| Ajouter une CSP (Report-Only puis enforcement) | 0,5–1 j | — | SEC-001 | En-tête présent, 0 violation |

### Phase 2 — Renforcement
| Action | Effort | Risque traité | Critère de validation |
|---|---|---|---|
| Verrouillage par compte+IP, réponses uniformes | 0,5 j | SEC-004 | Tests de non-régression d'auth |
| `MAILPIT_AUTH` obligatoire, retirer `ADMIN_PASSWORD` après amorçage | 0,25 j | SEC-008, SEC-009 | `docker compose config` échoue sans valeur |
| Restreindre les schémas d'URL (settings) | 0,25 j | SEC-005 | 400 sur `javascript:` |
| Mise à jour Prisma / overrides, relancer l'audit | 0,25 j | SEC-006 | `pnpm audit` sans avis ≥ élevé |
| Rôles PostgreSQL séparés | 0,5 j | SEC-010 | L'appli ne peut pas `DROP` |
| Liste blanche de préfixes pour `/backend` | 0,25 j | SEC-013 | `/backend/setup/status` non joignable après installation |

### Phase 3 — Amélioration continue
- CI : `pnpm audit`, gitleaks, Semgrep, Trivy (images), blocage sur ≥ élevé (SEC-007).
- Épinglage des images par digest et des outils MCP.
- Alertes sur événements d'audit critiques et politique de rétention (SEC-011).
- Revue périodique des dépendances (Renovate/Dependabot).

## 13. Recommandations DevSecOps

1. Pipeline unique monorepo : lint, typecheck, tests, `pnpm audit`, gitleaks, Semgrep (règles Node/TypeScript/Next), Trivy sur les images construites.
2. Politique de blocage : aucune vulnérabilité critique/élevée exploitable sans exception documentée.
3. Secrets : génération via `infra/scripts/gen-secrets.sh`, jamais réutilisés comme mots de passe d'interface ; rotation planifiée.
4. Images : tags précis ou digests, reconstruction régulière, utilisateur non-root (déjà en place).
5. Environnements : variables par environnement dans Dokploy, `SITE_ENV` ≠ production → `noindex` (déjà en place).
6. Sauvegardes : profil `backup` activé en production et restauration testée.

## 14. Stratégie de tests de non-régression

| Test | Type | Contrôle |
|---|---|---|
| Rate-limit avec `X-Forwarded-For` rotatif | e2e (Jest/supertest) | 429 attendu |
| Aucune route `admin/*` accessible sans cookie | e2e | 401 sur chaque route énumérée dynamiquement depuis les contrôleurs |
| Origin hostile / `Sec-Fetch-Site: cross-site` | e2e | 403 |
| Upload : SVG, polyglotte, fichier > 8 Mo, > 50 Mpx | e2e authentifié | 400/413 |
| Sanitiseur : corpus XSS (≥ 50 charges) | unitaire | aucune balise/attribut dangereux en sortie |
| En-têtes de sécurité (CSP, HSTS, XFO…) | e2e / Playwright | présents sur `/fr`, `/admin/login`, `/backend/health` |
| Verrouillage de compte | unitaire/e2e | pas de DoS inter-IP, réponses identiques |
| Contact : une seule réponse par destinataire | unitaire | plafond respecté |
| Audit CI | pipeline | échec sur vulnérabilité ≥ élevée |

## 15. Conclusion et niveau de risque résiduel

L'application présente une base de sécurité nettement supérieure à la moyenne pour un portfolio : refus par défaut, sessions robustes, cryptographie correcte, uploads ré-encodés et conteneurs durcis. Les écarts relevés sont de nature « défense en profondeur » et « abus » plutôt que des failles d'accès directes. Après correction de la Phase 1, le **risque résiduel** serait **faible**, sous réserve de validation en environnement de staging (comportement du reverse proxy, cookies `Secure`, en-têtes de production) et d'une passe de tests authentifiés.

*Aucune garantie d'absence de vulnérabilité n'est donnée : cet audit porte uniquement sur les éléments listés en sections 2 et 4, et les limites de la section 11 s'appliquent.*

---

## Annexe — Correctifs appliqués

| ID | Correctif | Fichiers | Vérification |
|---|---|---|---|
| SEC-003 | `proxy.ts` écrase `x-internal-key` / `x-client-ip` fournis par le navigateur et envoie l'IP dérivée du saut de confiance (`TRUSTED_PROXY_HOPS`) ; la Server Action utilise le même calcul ; limite par adresse email indépendante de l'IP | `web/proxy.ts`, `web/lib/client-ip.ts`, `web/app/[lang]/contact/actions.ts`, `api/src/messages/messages.service.ts` | Sonde sur un amont factice : en-têtes forgés → remplacés, `x-forwarded-for: 6.6.6.6, 1.2.3.4` → IP `1.2.3.4` |
| SEC-002 | Réponse automatique sans texte du visiteur, 1 par adresse et par jour, 5 messages/jour/adresse maximum (429 au-delà) | `messages.service.ts`, dictionnaires FR/EN | Compilation + revue (pas d'envoi SMTP testé) |
| SEC-001 | Content-Security-Policy (`script-src 'self' 'unsafe-inline'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri`/`form-action` `'self'`, `connect-src 'self'`) | `web/next.config.ts` | Build de production dans Chromium : 0 violation, scène 3D active |
| SEC-004 | Compte verrouillé = même réponse 401 qu'un mauvais mot de passe ; verrouillage ramené à 5 min | `auth.service.ts` | Compilation ; test dynamique non réalisé |
| SEC-005 | URLs de profil limitées à `http(s)` | `settings.ts` | Compilation |
| SEC-006 | `overrides` `mysql2>=3.23.1`, `deepmerge-ts>=8.0.0` | `api/pnpm-workspace.yaml` | `pnpm audit --prod` : 0 vulnérabilité ; `prisma validate`/`generate`, build et tests OK |
| SEC-007 | Étapes `dependency-audit` et `secret-scan` (gitleaks) dans la CI web, nouvelle CI API | `web/.gitlab-ci.yml`, `api/.gitlab-ci.yml` | Fichiers non exécutés (GitLab) |
| SEC-008 | `MAILPIT_AUTH` obligatoire, placeholders explicites | `docker-compose.yml`, `env/*.example` | Revue |
| SEC-009 | Documentation du retrait d'`ADMIN_PASSWORD` | `docker-compose.yml`, `docs/DOKPLOY.md` | Revue |
| SEC-011 | Événements de sécurité écrits dans les logs (`SECURITY …`), purge quotidienne des IP/user agents de messages > 90 jours | `audit.service.ts`, `messages.service.ts` | Compilation |
| SEC-012 | Images du contenu riche limitées à la médiathèque (`/backend/media/<32 hex>.webp`) | `sanitize.ts` | Tests unitaires |
| SEC-013 | Rewrite `/backend` limité à `auth`, `admin`, `public`, `media`, `setup` ; `setup/status` ne révèle plus rien une fois configuré | `next.config.ts`, `setup.service.ts` | `/backend/health` → 404 |
| SEC-014 | `plain()` restitue du texte réel (échappement à la sortie) | `sanitize.ts` | Tests unitaires |
| SEC-015 | Filtre `BadRequestFilter` : message générique pour les erreurs de parsing JSON | `api/src/common/bad-request.filter.ts`, `main.ts` | Compilation ; à confirmer au redémarrage de l'API |
| Cookies | Options de session extraites (`sessionCookieOptions`) et verrouillées par test : `HttpOnly`, `SameSite=Strict`, `Secure` en production | `api/src/auth/cookies.ts`, `cookies.spec.ts` | 15/15 tests |

### Non appliqué (et pourquoi)

- **SEC-010 rôles PostgreSQL séparés** : nécessite des mots de passe/rôles propres à chaque environnement et une migration d'exploitation ; documenté dans `docs/DOKPLOY.md`.
- **Épinglage des images par digest** (SEC-007) : exige un accès au registre (Docker était arrêté) ; commande documentée.
- **CSP avec nonce** : rendrait toutes les pages dynamiques ; `'unsafe-inline'` reste donc autorisé pour les scripts.
- **CAPTCHA** (SEC-002) : requiert un compte/clé tiers ; la limitation par adresse est en place.
- Les correctifs de l'API (SEC-002, 004, 005, 011, 015) n'ont pas été exercés en dynamique : redémarrer l'API de dev et rejouer les sondes de la section 10.
