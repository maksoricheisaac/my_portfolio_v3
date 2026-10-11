import type { Localized } from "@/lib/i18n";

/**
 * `practice`  = used in real work or projects.
 * `learning`  = actively being learned — never presented as acquired expertise.
 * Edit levels here as your experience evolves.
 */
export type SkillLevel = "practice" | "learning";

export interface Skill {
  name: string;
  level: SkillLevel;
  usedFor: Localized;
}

export interface SkillGroup {
  id: string;
  domain: "fullstack" | "devops";
  title: Localized;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    domain: "fullstack",
    title: { fr: "Frontend", en: "Frontend" },
    skills: [
      {
        name: "Next.js",
        level: "practice",
        usedFor: {
          fr: "Sites et applications web rendus côté serveur, avec routage et SEO.",
          en: "Server-rendered websites and web apps, with routing and SEO.",
        },
      },
      {
        name: "React",
        level: "practice",
        usedFor: {
          fr: "Interfaces composées de composants réutilisables.",
          en: "Interfaces built from reusable components.",
        },
      },
      {
        name: "TypeScript",
        level: "practice",
        usedFor: {
          fr: "Typage de bout en bout, du front à l'API.",
          en: "End-to-end typing, from frontend to API.",
        },
      },
      {
        name: "Tailwind CSS",
        level: "practice",
        usedFor: {
          fr: "Systèmes de design cohérents et responsive.",
          en: "Consistent, responsive design systems.",
        },
      },
      {
        name: "React Native / Expo",
        level: "practice",
        usedFor: {
          fr: "Applications mobiles multiplateformes.",
          en: "Cross-platform mobile applications.",
        },
      },
    ],
  },
  {
    id: "backend",
    domain: "fullstack",
    title: { fr: "Backend", en: "Backend" },
    skills: [
      {
        name: "NestJS",
        level: "practice",
        usedFor: {
          fr: "API REST structurées en modules, avec validation et authentification.",
          en: "REST APIs structured in modules, with validation and authentication.",
        },
      },
      {
        name: "Node.js",
        level: "practice",
        usedFor: {
          fr: "Services et intégrations côté serveur.",
          en: "Server-side services and integrations.",
        },
      },
      {
        name: "Express",
        level: "practice",
        usedFor: {
          fr: "API HTTP légères et services Node.js.",
          en: "Lightweight HTTP APIs and Node.js services.",
        },
      },
      {
        name: "FastAPI",
        level: "practice",
        usedFor: {
          fr: "API Python rapides, documentées automatiquement.",
          en: "Fast Python APIs with automatic documentation.",
        },
      },
    ],
  },
  {
    id: "data",
    domain: "fullstack",
    title: { fr: "Bases de données", en: "Databases" },
    skills: [
      {
        name: "PostgreSQL",
        level: "practice",
        usedFor: {
          fr: "Modélisation relationnelle d'applications métier.",
          en: "Relational modelling for business applications.",
        },
      },
      {
        name: "Prisma",
        level: "practice",
        usedFor: {
          fr: "Accès aux données typé et migrations.",
          en: "Typed data access and migrations.",
        },
      },
      {
        name: "MongoDB (NoSQL)",
        level: "practice",
        usedFor: {
          fr: "Données documentaires à structure évolutive.",
          en: "Document data with an evolving structure.",
        },
      },
    ],
  },
  {
    id: "devops",
    domain: "devops",
    title: { fr: "DevOps", en: "DevOps" },
    skills: [
      {
        name: "Docker",
        level: "practice",
        usedFor: {
          fr: "Environnements reproductibles et images de production.",
          en: "Reproducible environments and production images.",
        },
      },
      {
        name: "Git",
        level: "practice",
        usedFor: {
          fr: "Versionnement, branches et revue de code.",
          en: "Versioning, branching and code review.",
        },
      },
      {
        name: "GitLab CI/CD",
        level: "practice",
        usedFor: {
          fr: "Pipelines de build, test et livraison.",
          en: "Build, test and delivery pipelines.",
        },
      },
    ],
  },
  {
    id: "infra",
    domain: "devops",
    title: { fr: "Infrastructure", en: "Infrastructure" },
    skills: [
      {
        name: "Linux",
        level: "practice",
        usedFor: {
          fr: "Administration de serveurs et automatisation en ligne de commande.",
          en: "Server administration and command-line automation.",
        },
      },
      {
        name: "Réseaux",
        level: "learning",
        usedFor: {
          fr: "Comprendre le routage, le DNS et la sécurité réseau des déploiements.",
          en: "Understanding routing, DNS and network security of deployments.",
        },
      },
      {
        name: "Observabilité",
        level: "learning",
        usedFor: {
          fr: "Logs, métriques et alertes pour exploiter une application.",
          en: "Logs, metrics and alerts to operate an application.",
        },
      },
    ],
  },
  {
    id: "quality",
    domain: "devops",
    title: { fr: "Sécurité & qualité", en: "Security & quality" },
    skills: [
      {
        name: "Sécurité applicative",
        level: "practice",
        usedFor: {
          fr: "Authentification, validation des entrées, gestion des secrets.",
          en: "Authentication, input validation, secrets handling.",
        },
      },
      {
        name: "DevSecOps",
        level: "learning",
        usedFor: {
          fr: "Sécuriser les pipelines : analyse des dépendances, secrets, images.",
          en: "Securing pipelines: dependency, secrets and image scanning.",
        },
      },
      {
        name: "Intégration de l'IA",
        level: "learning",
        usedFor: {
          fr: "Agents et automatisations appliqués à des processus métier.",
          en: "Agents and automations applied to business processes.",
        },
      },
    ],
  },
];
