# Modifier le contenu

## Règles
- Ne publier que des faits vérifiables : pas de chiffres, d'utilisateurs ou de gains non prouvés.
- Aucun code privé, URL interne, donnée client ou capture non autorisée. Un projet professionnel doit être
  anonymisé ou rester `published: false`.
- Les sections optionnelles d'une étude de cas sont masquées si le champ est omis.

## Ajouter un projet
Ajouter un objet dans `content/projects.ts` :

```ts
{
  slug: "mon-projet",            // URL: /fr/projets/mon-projet
  published: true,               // false = masqué partout
  featured: false,               // true = candidat à l'accueil (3 premiers)
  category: "saas",              // saas | entrepreneurship | impact | infra (filtres)
  tagline: { fr: "…", en: "…" },
  title: "Nom du projet",
  summary: { fr: "…", en: "…" },
  problem: { fr: "…", en: "…" },
  contribution: { fr: "…", en: "…" },
  status: "development",         // stabilizing | development | concept | designdev | studio | professional
  stack: ["Next.js", "NestJS"],
  stackPlanned: false,           // true = affichée comme « stack envisagée »
  visual: "pos",                 // marketplace | studio | pos | sports | maintenance | pipeline
  domain: "fullstack",           // couleur d'accent : fullstack | devops
  links: { live: "https://…", repo: "https://…" },  // seulement des liens qui fonctionnent
  // facultatif : context, goals, users, solution, features, responsibilities,
  // architecture, decisions, challenges, nextSteps, related, confidential
}
```

Les aperçus visuels sont des illustrations conceptuelles (`components/project/project-mockup.tsx`).
Pour afficher une vraie capture d'écran, ajoutez l'image dans `public/` et remplacez l'aperçu dans la page concernée.

## Compétences
`content/skills.ts` : `level: "practice"` (utilisé en pratique) ou `"learning"` (en apprentissage).

## Contact
`lib/site.ts` : renseigner `email` pour afficher une adresse (avec bouton copier) ; mettre un lien à `null` le masque.
