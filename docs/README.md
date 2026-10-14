# Portfolio — Riche Makso

Monorepo : `web/` (Next.js 16, site public + espace `/admin`) et `api/` (NestJS 11 + Prisma + PostgreSQL).

| Dossier / fichier | Contenu |
| --- | --- |
| [web/](web/README.md) | Site bilingue FR/EN, administration, SEO |
| [api/](api/README.md) | API, authentification, projets, messages, médias |
| `docker-compose.prod.yml` / `.staging.yml` / `.dev.yml` | Stacks de déploiement Dokploy par environnement : web → api → PostgreSQL |
| `docker-compose.local.yml` | Poste de dev : PostgreSQL + Mailpit |
| `env/.env.<env>` (+ `.example`) | Variables à coller dans Dokploy (prod / staging / dev) ; les fichiers sans `.example` sont locaux et ignorés par Git |
| [docs/DOKPLOY.md](docs/DOKPLOY.md) | Guide de déploiement pas à pas |

## Déploiement (Dokploy)

TLS et routage sont assurés par Traefik (Dokploy) : la stack ne publie aucun port. Un compose par
environnement (noms de projet distincts, donc isolés sur un même VPS). Voir
[docs/DOKPLOY.md](docs/DOKPLOY.md).

| Env | Compose path | Mails | Indexation |
| --- | --- | --- | --- |
| production | `docker-compose.prod.yml` | SMTP réel | oui |
| staging | `docker-compose.staging.yml` | Mailpit | non |
| dev | `docker-compose.dev.yml` | Mailpit | non |

## Développement local

```bash
docker compose -f docker-compose.local.yml up -d   # PostgreSQL :5433 + Mailpit (UI :8025)
cd api && cp .env.example .env && pnpm install && pnpm db:migrate && pnpm start:dev
cd web && cp .env.example .env.local && pnpm install && pnpm dev
```

Valeurs à renseigner : `env/.env.local.example`. Les codes OTP arrivent dans Mailpit.

## Premier lancement

Aucun compte n'est créé à l'avance : ouvrir `/admin` lance l'**assistant d'installation**
(`/admin/setup`). Il demande un code à usage unique affiché dans les logs de l'API au démarrage
(ou `SETUP_TOKEN`), puis crée le compte, vérifie l'e-mail et configure le SEO.
Détails : [docs/DOKPLOY.md](docs/DOKPLOY.md).
