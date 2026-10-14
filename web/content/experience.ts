import type { Localized } from "@/lib/i18n";

/**
 * Content of the interactive sections of the home page (architecture explorer, DevOps simulation,
 * journey, kinetic typography). Presentation lives in `components/experience/*`.
 *
 * Rules: educational / verified content only. The architecture and the pipeline are
 * teaching models, never a description of a deployed infrastructure.
 */

// ---------------------------------------------------------------------------------------------
// Kinetic typography
// ---------------------------------------------------------------------------------------------

export const kinetic = {
  words: [
    { fr: "CONCEVOIR.", en: "ENGINEER." },
    { fr: "AUTOMATISER.", en: "AUTOMATE." },
    { fr: "CONSTRUIRE.", en: "BUILD." },
  ] satisfies Localized[],
  /** Technical notes that appear in the margins while scrolling. */
  notes: [
    { word: 0, text: { fr: "// concevoir avant de coder", en: "// design before coding" } },
    { word: 1, text: { fr: "// ce qui est répété est scripté", en: "// what repeats gets scripted" } },
    { word: 2, text: { fr: "// livrer par petites étapes", en: "// ship in small steps" } },
  ] as { word: number; text: Localized }[],
  caption: {
    fr: "Trois verbes, une même discipline : comprendre le système, l'automatiser, puis le construire.",
    en: "Three verbs, one discipline: understand the system, automate it, then build it.",
  } satisfies Localized,
};

// ---------------------------------------------------------------------------------------------
// Software architecture explorer
// ---------------------------------------------------------------------------------------------

export interface ArchNode {
  id: string;
  label: Localized;
  /** Position in the diagram, in percent of its box. */
  x: number;
  y: number;
  role: Localized;
  tech: string[];
  /** Concrete examples of what happens at this layer. */
  example: Localized;
}

export const architecture = {
  nodes: [
    {
      id: "frontend",
      label: { fr: "Interface", en: "Frontend" },
      x: 12,
      y: 50,
      role: {
        fr: "Ce que voit et touche l'utilisateur : pages, formulaires, états de chargement et d'erreur. Elle ne contient aucune règle métier critique.",
        en: "What users see and touch: pages, forms, loading and error states. It holds no critical business rules.",
      },
      tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      example: {
        fr: "Un formulaire valide la saisie, appelle l'API puis affiche le résultat.",
        en: "A form validates input, calls the API, then shows the result.",
      },
    },
    {
      id: "api",
      label: { fr: "API", en: "Backend API" },
      x: 33,
      y: 50,
      role: {
        fr: "Point d'entrée unique des données : authentification, validation des entrées, autorisation et contrat REST stable pour les clients.",
        en: "Single entry point to data: authentication, input validation, authorisation and a stable REST contract for clients.",
      },
      tech: ["NestJS", "FastAPI", "REST", "Node.js"],
      example: {
        fr: "Chaque requête est authentifiée, validée, puis routée vers le bon service.",
        en: "Each request is authenticated, validated, then routed to the right service.",
      },
    },
    {
      id: "services",
      label: { fr: "Services métier", en: "Business services" },
      x: 55,
      y: 22,
      role: {
        fr: "La logique propre au produit, découpée en modules : règles, calculs, workflows. C'est la partie qui change le moins quand l'interface évolue.",
        en: "The product's own logic, split into modules: rules, computations, workflows. It changes least when the interface evolves.",
      },
      tech: ["NestJS modules", "TypeScript"],
      example: {
        fr: "Un module « commande » applique les règles puis persiste le résultat.",
        en: "An “order” module applies the rules then persists the result.",
      },
    },
    {
      id: "database",
      label: { fr: "Base de données", en: "Database" },
      x: 87,
      y: 22,
      role: {
        fr: "Source de vérité des données : modèle relationnel, contraintes d'intégrité, migrations versionnées.",
        en: "Source of truth for data: relational model, integrity constraints, versioned migrations.",
      },
      tech: ["PostgreSQL", "Prisma"],
      example: {
        fr: "Les migrations sont rejouables sur chaque environnement.",
        en: "Migrations can be replayed on every environment.",
      },
    },
    {
      id: "cache",
      label: { fr: "Cache", en: "Cache" },
      x: 87,
      y: 50,
      role: {
        fr: "Mémoire rapide optionnelle pour les lectures fréquentes et les données temporaires (sessions, limitation de débit).",
        en: "Optional fast memory for frequent reads and temporary data (sessions, rate limiting).",
      },
      tech: ["Redis"],
      example: {
        fr: "Une réponse coûteuse est mise en cache avec une durée de vie courte.",
        en: "An expensive response is cached with a short lifetime.",
      },
    },
    {
      id: "external",
      label: { fr: "Services externes", en: "External services" },
      x: 55,
      y: 78,
      role: {
        fr: "Ce que le produit n'héberge pas lui-même : envoi d'emails, paiements, API tierces. Chaque intégration est isolée derrière une interface.",
        en: "What the product does not host itself: email delivery, payments, third-party APIs. Each integration is isolated behind an interface.",
      },
      tech: ["SMTP", "API tierces", "Webhooks"],
      example: {
        fr: "L'envoi d'un email passe par un adaptateur, remplaçable sans toucher au métier.",
        en: "Sending an email goes through an adapter, replaceable without touching business logic.",
      },
    },
  ] as ArchNode[],
  /** Directed links: [from, to]. */
  links: [
    ["frontend", "api"],
    ["api", "services"],
    ["services", "database"],
    ["services", "cache"],
    ["services", "external"],
  ] as [string, string][],
};

// ---------------------------------------------------------------------------------------------
// DevOps pipeline simulation
// ---------------------------------------------------------------------------------------------

export interface PipelineStep {
  id: string;
  label: string;
  role: Localized;
  /** Line written in the simulation log when the step completes. */
  log: Localized;
}

export const pipeline: PipelineStep[] = [
  {
    id: "commit",
    label: "Git Commit",
    role: {
      fr: "Un changement est enregistré dans Git : il déclenche tout le reste et reste traçable.",
      en: "A change is recorded in Git: it triggers everything else and stays traceable.",
    },
    log: { fr: "commit enregistré sur la branche", en: "commit recorded on the branch" },
  },
  {
    id: "ci",
    label: "Continuous Integration",
    role: {
      fr: "Le pipeline récupère le code, installe les dépendances et vérifie que le projet se construit.",
      en: "The pipeline fetches the code, installs dependencies and checks that the project builds.",
    },
    log: { fr: "dépendances installées, build vérifié", en: "dependencies installed, build verified" },
  },
  {
    id: "tests",
    label: "Automated Tests",
    role: {
      fr: "Les tests automatiques, le typage et le lint détectent les régressions avant qu'elles n'arrivent en production.",
      en: "Automated tests, typing and lint catch regressions before they reach production.",
    },
    log: { fr: "tests et vérifications statiques passés", en: "tests and static checks passed" },
  },
  {
    id: "security",
    label: "Security Checks",
    role: {
      fr: "Analyse des dépendances vulnérables et recherche de secrets dans le code. Axe en cours d'apprentissage.",
      en: "Scanning for vulnerable dependencies and secrets in the code. A topic I am currently learning.",
    },
    log: { fr: "aucune alerte dans la simulation", en: "no alert in the simulation" },
  },
  {
    id: "docker",
    label: "Docker Build",
    role: {
      fr: "L'application est empaquetée dans une image de conteneur reproductible, identique d'un environnement à l'autre.",
      en: "The application is packaged in a reproducible container image, identical across environments.",
    },
    log: { fr: "image de conteneur construite", en: "container image built" },
  },
  {
    id: "deploy",
    label: "Deployment",
    role: {
      fr: "L'image est déployée sur l'environnement cible, avec une stratégie de retour arrière possible.",
      en: "The image is deployed to the target environment, with a rollback strategy available.",
    },
    log: { fr: "image déployée sur l'environnement cible", en: "image deployed to the target environment" },
  },
  {
    id: "monitoring",
    label: "Monitoring",
    role: {
      fr: "Logs, métriques et alertes permettent de voir le comportement réel et de réagir. Axe en cours d'apprentissage.",
      en: "Logs, metrics and alerts show real behaviour and let you react. A topic I am currently learning.",
    },
    log: { fr: "supervision active", en: "monitoring active" },
  },
];

// ---------------------------------------------------------------------------------------------
// Journey (timeline)
// ---------------------------------------------------------------------------------------------

export interface JourneyEntry {
  id: string;
  kind: "profile" | "practice" | "learning" | "project";
  /** Optional: fill with a verified period, e.g. "2024 — 2025". Hidden when omitted. */
  period?: string;
  title: Localized;
  text: Localized;
  /** Slug of a project in `content/projects.ts` (links to its case study). */
  project?: string;
}

/**
 * Only facts already published elsewhere on the site. No invented dates, positions or
 * certifications: add `period` / new entries here once they are verified.
 */
export const journey: JourneyEntry[] = [
  {
    id: "fullstack",
    kind: "practice",
    title: { fr: "Développement Full-Stack", en: "Full-Stack development" },
    text: {
      fr: "Applications web et mobiles avec React, Next.js, NestJS et Node.js, du modèle de données à l'interface.",
      en: "Web and mobile applications with React, Next.js, NestJS and Node.js, from data model to interface.",
    },
  },
  {
    id: "devops",
    kind: "practice",
    title: { fr: "Montée en compétence DevOps", en: "Growing into DevOps" },
    text: {
      fr: "Docker, Git, GitLab CI/CD et Linux : rendre les applications reproductibles et livrables automatiquement.",
      en: "Docker, Git, GitLab CI/CD and Linux: making applications reproducible and automatically deliverable.",
    },
  },
  {
    id: "gebook",
    kind: "project",
    project: "gebook",
    title: { fr: "Projet GeBook", en: "GeBook project" },
    text: {
      fr: "Une étude de cas détaillée de ce projet est disponible, avec mon rôle réel et son état actuel.",
      en: "A detailed case study of this project is available, with my actual role and its current state.",
    },
  },
  {
    id: "now",
    kind: "learning",
    title: { fr: "En cours : observabilité et DevSecOps", en: "In progress: observability and DevSecOps" },
    text: {
      fr: "Logs, métriques, alertes et sécurité des pipelines — signalés comme « en apprentissage » partout sur le site.",
      en: "Logs, metrics, alerts and pipeline security — flagged as “learning” everywhere on this site.",
    },
  },
];

// ---------------------------------------------------------------------------------------------
// UI labels for the sections above
// ---------------------------------------------------------------------------------------------

export const ui = {
  hero: {
    role: { fr: "Full-Stack Developer · Junior DevOps", en: "Full-Stack Developer · Junior DevOps" },
    scroll: { fr: "Défiler", en: "Scroll" },
    sceneLabel: {
      fr: "Structure métallique abstraite en 3D, décorative.",
      en: "Abstract metallic 3D structure, decorative.",
    },
  },
  about: {
    eyebrow: { fr: "À propos", en: "About" },
    bgWord: "ENGINEER",
    points: {
      fr: ["Applications Full-Stack", "Livraison automatisée", "Infrastructure reproductible"],
      en: ["Full-Stack applications", "Automated delivery", "Reproducible infrastructure"],
    },
  },
  architecture: {
    eyebrow: { fr: "Architecture logicielle", en: "Software architecture" },
    title: {
      fr: "Comment une application est structurée.",
      en: "How an application is structured.",
    },
    intro: {
      fr: "Un modèle pédagogique d'application web : cliquez sur un composant pour voir son rôle, ses technologies et ses connexions. Ce n'est pas une infrastructure déployée.",
      en: "A teaching model of a web application: click a component to see its role, technologies and connections. It is not a deployed infrastructure.",
    },
    role: { fr: "Rôle", en: "Role" },
    tech: { fr: "Technologies associées", en: "Related technologies" },
    connectedTo: { fr: "Connecté à", en: "Connected to" },
    receivesFrom: { fr: "Reçoit de", en: "Receives from" },
    example: { fr: "Exemple", en: "Example" },
    none: { fr: "Aucune sélection", en: "Nothing selected" },
    hint: {
      fr: "Sélectionnez un composant du schéma.",
      en: "Select a component in the diagram.",
    },
    diagram: { fr: "Schéma d'architecture interactif", en: "Interactive architecture diagram" },
  },
  pipeline: {
    eyebrow: { fr: "Pipeline DevOps", en: "DevOps pipeline" },
    title: {
      fr: "Du commit au monitoring.",
      en: "From commit to monitoring.",
    },
    intro: {
      fr: "Le chemin d'un changement logiciel jusqu'à la production, étape par étape.",
      en: "The path of a software change to production, step by step.",
    },
    badge: {
      fr: "Simulation locale — aucun pipeline réel n'est exécuté",
      en: "Local simulation — no real pipeline is executed",
    },
    run: { fr: "Lancer la simulation", en: "Run the simulation" },
    running: { fr: "Simulation en cours…", en: "Simulation running…" },
    replay: { fr: "Rejouer", en: "Replay" },
    done: { fr: "Simulation terminée : toutes les étapes simulées sont passées.", en: "Simulation complete: all simulated steps passed." },
    idle: { fr: "En attente", en: "Pending" },
    active: { fr: "En cours", en: "Running" },
    passed: { fr: "Terminé", en: "Passed" },
    log: { fr: "Journal de simulation", en: "Simulation log" },
    emptyLog: { fr: "Lancez la simulation pour voir le journal.", en: "Run the simulation to see the log." },
    stepRole: { fr: "Rôle de l'étape", en: "Role of the step" },
  },
  skills: {
    eyebrow: { fr: "Expertise", en: "Expertise" },
    title: { fr: "Trois domaines, une même exigence.", en: "Three domains, one standard." },
    intro: {
      fr: "Pas de pourcentages : pour chaque technologie, son rôle, son contexte d'usage et le projet associé quand il existe.",
      en: "No percentages: for each technology, its role, where it is used and the related project when one exists.",
    },
    domains: {
      fullstack: { fr: "Full-Stack", en: "Full-Stack" },
      devops: { fr: "DevOps", en: "DevOps" },
      infra: { fr: "Infrastructure & Systems", en: "Infrastructure & Systems" },
    },
    role: { fr: "Rôle et contexte", en: "Role and context" },
    status: { fr: "Statut", en: "Status" },
    project: { fr: "Projet associé", en: "Related project" },
    noProject: {
      fr: "Aucun projet public associé pour le moment.",
      en: "No public project associated yet.",
    },
    practice: { fr: "Utilisé en pratique", en: "Used in practice" },
    learning: { fr: "En apprentissage", en: "Learning" },
    select: { fr: "Sélectionnez une technologie.", en: "Select a technology." },
  },
  journey: {
    eyebrow: { fr: "Parcours", en: "Journey" },
    title: { fr: "Une progression, étape par étape.", en: "A progression, step by step." },
    intro: {
      fr: "Uniquement des éléments vérifiables. Les dates seront ajoutées une fois confirmées.",
      en: "Verifiable items only. Dates will be added once confirmed.",
    },
    kinds: {
      profile: { fr: "Profil", en: "Profile" },
      practice: { fr: "Pratique", en: "Practice" },
      learning: { fr: "En apprentissage", en: "Learning" },
      project: { fr: "Projet", en: "Project" },
    },
    viewCase: { fr: "Lire l'étude de cas", en: "Read the case study" },
  },
  contact: {
    eyebrow: { fr: "Contact", en: "Contact" },
    lines: {
      fr: ["CONSTRUISONS", "QUELQUE CHOSE", "QUI COMPTE."],
      en: ["LET'S BUILD", "SOMETHING", "THAT MATTERS."],
    },
  },
};
