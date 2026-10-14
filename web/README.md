# Riche Makso — Portfolio

Portfolio bilingue (FR/EN) en Next.js 16 (App Router, Cache Components), React 19, TypeScript strict, Tailwind CSS 4.
Direction artistique « Dark Engineering », animations Motion, portraits en WebP optimisés.

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
| `components/site/portrait.tsx` | Portrait détouré sur panneau teinté (photos dans `public/me/`) |

Voir [docs/CONTENT.md](docs/CONTENT.md) pour modifier le contenu.

## Expérience immersive (page d'accueil)

| Section | Composant | Contenu éditable |
| --- | --- | --- |
| Hero cinématographique + scène 3D | `components/sections/hero.tsx`, `components/experience/hero-scene.tsx` | `content/dictionaries`, `lib/site.ts` |
| Typographie cinétique | `components/experience/kinetic-type.tsx` | `content/experience.ts` → `kinetic` |
| À propos / portrait | `components/sections/about-teaser.tsx` | dictionnaires |
| Architecture logicielle interactive | `components/experience/architecture-explorer.tsx` | `content/experience.ts` → `architecture` |
| Pipeline DevOps (simulation locale) | `components/experience/pipeline-simulation.tsx` | `content/experience.ts` → `pipeline` |
| Expertise (3 domaines) | `components/experience/skills-explorer.tsx` | `content/skills.ts` |
| Parcours | `components/experience/journey.tsx` | `content/experience.ts` → `journey` |

Choix techniques :

- **Animations** : `motion` uniquement (scroll, masques, parallaxe). GSAP n'est pas installé : il n'apporterait rien
  de plus et ferait doublon.
- **3D** : `three` + `@react-three/fiber`, sans `drei` ni post-traitement. Le chunk n'est téléchargé qu'après
  l'hydratation et seulement si WebGL est disponible ; l'environnement de réflexion est généré localement
  (`RoomEnvironment`), aucun fichier HDR externe. Le rendu est suspendu hors écran, en pixel ratio 1 et avec moins de
  particules sous 768 px, et rendu une seule fois (`frameloop="demand"`) avec `prefers-reduced-motion`.
  Sans WebGL, une composition SVG statique prend le relais.
- **Honnêteté du contenu** : l'architecture et le pipeline sont des modèles pédagogiques ; la simulation est
  explicitement locale. Le parcours ne contient que des éléments déjà publiés sur le site, sans dates inventées
  (renseigner `period` dans `content/experience.ts` quand elles sont confirmées).
- Palette : `#08090B` / `#101216` / `#202329` / `#F2F1EC` / `#969BA5`, accent bleu unique `#5B9CFF` (jetons dans
  `app/globals.css`).

## Vérifications réalisées

Exécutées sur la version de production (`next build` puis `next start`), avec Chromium piloté par Playwright :

- `pnpm typecheck` : OK · `pnpm lint` : 0 erreur (4 avertissements préexistants dans l'admin) · `pnpm build` : OK.
- Desktop 1440×900 et mobile 390×844 : pas de débordement horizontal, pas d'erreur console
  (seul avertissement : dépréciation de `THREE.Clock` émise par `@react-three/fiber`).
- Clavier : sélection d'un composant d'architecture, onglets d'expertise (flèches).
- Simulation DevOps : lancée jusqu'au message « Simulation terminée », bouton Rejouer.
- `prefers-reduced-motion: reduce` : page complète, scène 3D rendue statique.
- WebGL désactivé : aucun canvas, repli SVG, aucune erreur.
- Non mesuré : Lighthouse / Core Web Vitals (aucun score n'est revendiqué).

## Espace d'administration

L'administration vit sous `/admin` (non indexée) et s'appuie sur l'API NestJS du dossier `../api`.
Le navigateur ne parle qu'à ce site : les appels API passent par le proxy `/backend/*`
(`next.config.ts`), ce qui garde les cookies de session HttpOnly / SameSite=Strict.

| Page | Rôle |
| --- | --- |
| `/admin` | Tableau de bord (projets, messages, activité) |
| `/admin/projects` | Projets : CRUD, éditeur WYSIWYG FR/EN, SEO par page, ordre, publication |
| `/admin/messages` | Boîte de réception du formulaire de contact, réponse par e-mail |
| `/admin/media` | Bibliothèque d'images (vérifiées, converties en WebP) |
| `/admin/settings` | SEO global, profil JSON-LD, indexation |
| `/admin/security` | Mot de passe, double authentification, sessions, journal |

Le site public lit les projets depuis l'API (cache 5 min + revalidation à la demande via
`/api/revalidate`). Si l'API est injoignable, il retombe sur `content/projects.ts`.

## SEO

Canonical + hreflang par page, Open Graph/Twitter (image de couverture par projet), JSON-LD
(Person, WebSite, CreativeWork, BreadcrumbList), sitemap avec `lastModified`, `robots.txt`
pilotable depuis l'admin, titres/descriptions modifiables par page.

## Variables d'environnement

Voir `.env.example`. `API_URL` est lu **au build** (réécriture `/backend`) : le fournir aussi
comme `ARG` Docker. `INTERNAL_API_KEY` et `REVALIDATE_SECRET` doivent être identiques côté API.
L'envoi d'e-mails (formulaire de contact, OTP) est géré par l'API : configurer le SMTP dans `../api/.env`.
