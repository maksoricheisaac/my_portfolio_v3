# Riche Makso — Portfolio

Portfolio bilingue (FR/EN) en Next.js 16 (App Router, Cache Components), React 19, TypeScript strict, Tailwind CSS 4.
Direction artistique « Dark Engineering », scène 3D (React Three Fiber) avec équivalent SVG.

## Démarrage

```bash
pnpm install
pnpm dev          # http://localhost:3000  (redirige vers /fr ou /en)
pnpm lint
pnpm typecheck
pnpm build && pnpm start
```

## Structure

| Chemin | Rôle |
| --- | --- |
| `app/[lang]/…` | Pages (accueil, projets, études de cas, à propos, compétences, contact) |
| `proxy.ts` | Redirection vers la langue préférée (`/` → `/fr` ou `/en`) |
| `next.config.ts` | URL françaises localisées (`/fr/projets`…) via rewrites, en-têtes de sécurité |
| `content/dictionaries/` | Textes d'interface FR/EN (le français définit le type, l'anglais doit y correspondre) |
| `content/projects.ts` | Projets et études de cas (`published: false` pour masquer) |
| `content/skills.ts` | Compétences et niveaux (`practice` / `learning`) |
| `lib/site.ts` | Identité et liens de contact (mettre `null` pour masquer un lien) |
| `components/three/` | Scène 3D, fallback SVG, détection WebGL / appareil / mouvement réduit |

Voir [docs/CONTENT.md](docs/CONTENT.md) pour modifier le contenu.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publique (canonical, sitemap, Open Graph). Par défaut `https://richemakso.vercel.app` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Serveur SMTP du formulaire de contact (serveur uniquement) |
| `MAIL_FROM` | Adresse expéditrice des emails (par défaut `SMTP_USER`) |
| `CONTACT_TO` | Boîte qui reçoit les messages du portfolio (par défaut `maksoricheisaac@gmail.com`) |

Sans `SMTP_HOST`, le formulaire affiche que l'envoi n'est pas activé (aucun faux succès). Ne jamais committer `.env.local`.

## Formulaire de contact

Une Server Action (`app/[lang]/contact/actions.ts`) valide les champs, applique un anti-spam (champ piège + limite par IP),
envoie (1) un email de notification à `CONTACT_TO` indiquant que le message provient du portfolio, avec `Reply-To` du visiteur,
et (2) un accusé de réception au visiteur dans sa langue. La limite par IP est en mémoire : sur un hébergement serverless,
ajoutez un limiteur partagé si nécessaire.

## Déploiement

**Vercel** : importer le dépôt, définir le *Root Directory* sur `web`, renseigner `NEXT_PUBLIC_SITE_URL`.

**Docker** :

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://example.com -t rm-portfolio .
docker run -p 3000:3000 rm-portfolio
```

**CI** : `.gitlab-ci.yml` exécute lint, typecheck et build. Aucun déploiement automatique n'est configuré.
