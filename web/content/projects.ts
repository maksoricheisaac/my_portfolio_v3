import type { Localized } from "@/lib/i18n";

/**
 * Project catalogue — see docs/CONTENT.md.
 *
 *  - Only verified facts. Every optional case-study section is hidden when omitted.
 *  - `published: false` hides an entry everywhere (list, pages, sitemap).
 *  - `stackPlanned: true` labels the stack as "envisagée / planned" instead of implemented.
 *  - Never add confidential employer/client material, unproven metrics, internal URLs
 *    or unauthorised screenshots. Links are shown only when `links` is filled.
 */
export type Category = "saas" | "entrepreneurship" | "impact" | "infra";
export type Status =
  | "stabilizing"
  | "development"
  | "concept"
  | "designdev"
  | "studio"
  | "professional";
export type VisualKind =
  | "marketplace"
  | "studio"
  | "pos"
  | "sports"
  | "maintenance"
  | "pipeline";

export interface ArchitectureLayer {
  label: Localized;
  items: string[];
}

export interface Project {
  slug: string;
  published: boolean;
  featured: boolean;
  category: Category;
  /** Short product type shown above the name. */
  tagline: Localized;
  title: string;
  summary: Localized;
  problem: Localized;
  contribution: Localized;
  status: Status;
  stack: string[];
  stackPlanned: boolean;
  visual: VisualKind;
  domain: "fullstack" | "devops";
  confidential?: boolean;
  links?: { live?: string; repo?: string; site?: string };

  // Case study (all optional)
  context?: Localized;
  goals?: Localized[];
  users?: Localized[];
  solution?: Localized;
  features?: Localized[];
  responsibilities?: Localized[];
  architecture?: ArchitectureLayer[];
  decisions?: { name: string; why: Localized }[];
  challenges?: { problem: Localized; solution: Localized }[];
  nextSteps?: Localized[];
  related?: string[];
}

export const projects: Project[] = [
  {
    slug: "gebook",
    published: true,
    featured: true,
    category: "saas",
    tagline: { fr: "Marketplace · Édition numérique", en: "Marketplace · Digital publishing" },
    title: "GeBook",
    summary: {
      fr: "Une marketplace qui permet aux auteurs congolais de publier et vendre leurs livres numériques, et aux lecteurs de les découvrir, les acheter et les lire.",
      en: "A marketplace where Congolese authors publish and sell digital books, and readers discover, buy and read them.",
    },
    problem: {
      fr: "Les auteurs ont peu de moyens de diffuser et monétiser leurs ouvrages numériques, et les lecteurs n'ont pas de point d'accès unique à ces œuvres.",
      en: "Authors have few ways to distribute and monetise digital books, and readers have no single place to find them.",
    },
    contribution: {
      fr: "Conception du produit, architecture et développement Full-Stack : catalogue, espaces auteurs, commandes, rôles et administration.",
      en: "Product design, architecture and Full-Stack development: catalogue, author spaces, orders, roles and administration.",
    },
    status: "stabilizing",
    stack: ["Next.js", "TypeScript", "NestJS", "PostgreSQL"],
    stackPlanned: true,
    visual: "marketplace",
    domain: "fullstack",
    context: {
      fr: "GeBook s'adresse en priorité au marché congolais de l'édition numérique, où la publication, la vente et la lecture de livres en ligne restent peu structurées.",
      en: "GeBook primarily targets the Congolese digital publishing market, where publishing, selling and reading books online is still poorly structured.",
    },
    goals: [
      { fr: "Permettre à un auteur de publier et commercialiser un livre numérique sans intermédiaire technique.", en: "Let an author publish and sell a digital book without a technical intermediary." },
      { fr: "Offrir aux lecteurs un parcours simple : découvrir, acheter, lire.", en: "Give readers a simple path: discover, buy, read." },
      { fr: "Protéger les contenus numériques distribués.", en: "Protect the digital content being distributed." },
    ],
    users: [
      { fr: "Auteurs et éditeurs indépendants.", en: "Independent authors and publishers." },
      { fr: "Lecteurs, au Congo et dans la diaspora.", en: "Readers, in Congo and in the diaspora." },
      { fr: "Administrateurs de la plateforme.", en: "Platform administrators." },
    ],
    solution: {
      fr: "Une plateforme web à trois espaces (lecteur, auteur, administration), reposant sur une API et un modèle de rôles distinguant clairement ce que chacun peut faire.",
      en: "A web platform with three spaces (reader, author, administration), built on an API and a role model that clearly separates what each user can do.",
    },
    features: [
      { fr: "Catalogue de livres et découverte d'auteurs.", en: "Book catalogue and author discovery." },
      { fr: "Espaces dédiés aux auteurs.", en: "Dedicated author spaces." },
      { fr: "Parcours d'achat et gestion des commandes.", en: "Purchase flow and order management." },
      { fr: "Rôles et espaces d'administration.", en: "Roles and administration spaces." },
      { fr: "Accès aux livres numériques et protection des contenus.", en: "Access to digital books and content protection." },
    ],
    architecture: [
      { label: { fr: "Interface", en: "Interface" }, items: ["Next.js", "Espaces lecteur / auteur / admin"] },
      { label: { fr: "API", en: "API" }, items: ["NestJS", "Rôles & permissions"] },
      { label: { fr: "Données", en: "Data" }, items: ["PostgreSQL"] },
    ],
    decisions: [
      {
        name: "Rôles explicites",
        why: {
          fr: "Séparer lecteur, auteur et administrateur dès le modèle de données évite de greffer les permissions plus tard.",
          en: "Separating reader, author and administrator in the data model avoids bolting permissions on later.",
        },
      },
    ],
    nextSteps: [
      { fr: "Terminer la stabilisation et préparer le lancement.", en: "Finish stabilisation and prepare the launch." },
      {
        fr: "Valider l'intégration du paiement avant de l'annoncer : elle n'est pas présentée comme opérationnelle.",
        en: "Validate the payment integration before announcing it: it is not presented as operational.",
      },
    ],
    related: ["kivoa", "basketball-congolais"],
  },
  {
    slug: "kivoa",
    published: true,
    featured: true,
    category: "entrepreneurship",
    tagline: { fr: "Studio technologique", en: "Technology studio" },
    title: "Kivoa",
    summary: {
      fr: "Un studio tech basé à Brazzaville qui conçoit des solutions numériques pour les entreprises, et dans lequel s'inscrivent FlashMenu et Maintivo.",
      en: "A tech studio based in Brazzaville that designs digital solutions for businesses, and the umbrella for FlashMenu and Maintivo.",
    },
    problem: {
      fr: "Les entreprises locales manquent de logiciels adaptés à leurs réalités : outils importés, trop chers ou inadaptés aux usages du terrain.",
      en: "Local businesses lack software that fits their reality: imported tools that are too expensive or ill-suited to field practice.",
    },
    contribution: {
      fr: "Fondation du studio, vision produit, architecture technique et développement des solutions métier.",
      en: "Founding the studio, product vision, technical architecture and development of business solutions.",
    },
    status: "studio",
    stack: ["Next.js", "NestJS", "PostgreSQL"],
    stackPlanned: true,
    visual: "studio",
    domain: "fullstack",
    context: {
      fr: "Kivoa n'est pas un produit unique : c'est une initiative entrepreneuriale qui regroupe plusieurs produits numériques construits pour les entreprises du Congo-Brazzaville.",
      en: "Kivoa is not a single product: it is an entrepreneurial initiative bringing together several digital products built for businesses in Congo-Brazzaville.",
    },
    goals: [
      { fr: "Concevoir des produits qui répondent à des besoins métier réels.", en: "Design products that answer real business needs." },
      { fr: "Construire des solutions maintenables et évolutives.", en: "Build maintainable, scalable solutions." },
    ],
    solution: {
      fr: "Un studio produit : chaque solution part d'un problème identifié sur le terrain, avec une architecture commune et réutilisable d'un produit à l'autre.",
      en: "A product studio: each solution starts from a problem identified in the field, with a common architecture reused from one product to the next.",
    },
    responsibilities: [
      { fr: "Vision et choix de produits.", en: "Vision and product choices." },
      { fr: "Architecture et mise en œuvre technique.", en: "Architecture and technical implementation." },
      { fr: "Orientation vers les besoins des entreprises locales.", en: "Focus on the needs of local businesses." },
    ],
    nextSteps: [
      { fr: "Faire aboutir FlashMenu et Maintivo vers un premier déploiement.", en: "Bring FlashMenu and Maintivo to a first deployment." },
    ],
    related: ["flashmenu", "maintivo"],
  },
  {
    slug: "flashmenu",
    published: true,
    featured: true,
    category: "saas",
    tagline: { fr: "SaaS B2B · Restauration", en: "B2B SaaS · Restaurants" },
    title: "FlashMenu",
    summary: {
      fr: "Un logiciel de gestion pour restaurants : caisse, commandes, menus, stocks, tables et rapports, en multi-tenant avec abonnements.",
      en: "Restaurant management software: point of sale, orders, menus, stock, tables and reports, multi-tenant with subscriptions.",
    },
    problem: {
      fr: "Beaucoup de restaurants gèrent caisse, stocks et commandes sur papier ou sur plusieurs outils séparés, sans vision d'ensemble de leur activité.",
      en: "Many restaurants run the till, stock and orders on paper or across separate tools, with no overall view of their activity.",
    },
    contribution: {
      fr: "Conception du produit, modèle multi-tenant, architecture technique et développement Full-Stack.",
      en: "Product design, multi-tenant model, technical architecture and Full-Stack development.",
    },
    status: "development",
    stack: ["Next.js", "NestJS", "PostgreSQL", "Better Auth"],
    stackPlanned: true,
    visual: "pos",
    domain: "fullstack",
    goals: [
      { fr: "Centraliser la gestion quotidienne d'un restaurant dans un seul outil.", en: "Centralise a restaurant's daily operations in one tool." },
      { fr: "Isoler les données de chaque établissement dans une architecture multi-tenant.", en: "Isolate each venue's data in a multi-tenant architecture." },
    ],
    users: [
      { fr: "Propriétaires et gérants de restaurants.", en: "Restaurant owners and managers." },
      { fr: "Serveurs, caissiers et cuisine.", en: "Waiters, cashiers and kitchen staff." },
    ],
    features: [
      { fr: "Caisse et gestion des commandes.", en: "Point of sale and order management." },
      { fr: "Menus et catégories.", en: "Menus and categories." },
      { fr: "Suivi des stocks.", en: "Stock tracking." },
      { fr: "Tables et QR codes.", en: "Tables and QR codes." },
      { fr: "Rapports et indicateurs d'activité.", en: "Reports and activity indicators." },
      { fr: "Utilisateurs et rôles.", en: "Users and roles." },
      { fr: "Multi-tenant et offres d'abonnement.", en: "Multi-tenancy and subscription plans." },
    ],
    architecture: [
      { label: { fr: "Interface", en: "Interface" }, items: ["Next.js", "Caisse · Salle · Admin"] },
      { label: { fr: "API", en: "API" }, items: ["NestJS", "Better Auth", "Rôles par établissement"] },
      { label: { fr: "Données", en: "Data" }, items: ["PostgreSQL", "Isolation par tenant"] },
    ],
    decisions: [
      {
        name: "Multi-tenant dès le départ",
        why: {
          fr: "Servir plusieurs restaurants avec une seule base de code évite de dupliquer le produit et simplifie la facturation par abonnement.",
          en: "Serving several restaurants from one codebase avoids duplicating the product and simplifies subscription billing.",
        },
      },
    ],
    nextSteps: [
      { fr: "Livrer un premier périmètre utilisable en restaurant : commandes, menus, caisse.", en: "Ship a first usable scope in a restaurant: orders, menus, till." },
    ],
    related: ["kivoa", "maintivo"],
  },
  {
    slug: "basketball-congolais",
    published: true,
    featured: false,
    category: "impact",
    tagline: { fr: "Impact numérique · Sport", en: "Digital impact · Sport" },
    title: "Basketball congolais",
    summary: {
      fr: "La digitalisation du basketball congolais : une application web pour gérer les compétitions et une application mobile pour suivre les matchs.",
      en: "Digitalising Congolese basketball: a web app to run competitions and a mobile app to follow games.",
    },
    problem: {
      fr: "Les informations sportives sont dispersées, les changements de calendrier sont difficiles à suivre et les statistiques ne sont pas toujours accessibles.",
      en: "Sports information is scattered, schedule changes are hard to follow and statistics are not always accessible.",
    },
    contribution: {
      fr: "Conception du produit et de l'architecture, API commune, applications web et mobile.",
      en: "Product and architecture design, shared API, web and mobile applications.",
    },
    status: "designdev",
    stack: ["NestJS", "Prisma", "React Native", "Next.js"],
    stackPlanned: true,
    visual: "sports",
    domain: "fullstack",
    context: {
      fr: "Le projet vise à faciliter l'accès à l'information sportive et à améliorer la gestion des compétitions de basketball au Congo.",
      en: "The project aims to make sports information easier to access and to improve how basketball competitions are run in Congo.",
    },
    users: [
      { fr: "Organisateurs et gestionnaires de compétitions, via l'application web.", en: "Competition organisers and managers, through the web app." },
      { fr: "Supporters et passionnés, via l'application mobile.", en: "Fans and enthusiasts, through the mobile app." },
    ],
    solution: {
      fr: "Deux interfaces complémentaires reposant sur une même API : la gestion d'un côté, la consultation de l'autre.",
      en: "Two complementary interfaces on a single API: management on one side, consultation on the other.",
    },
    features: [
      { fr: "Calendriers et horaires des rencontres.", en: "Fixtures and schedules." },
      { fr: "Résultats et classements.", en: "Results and standings." },
      { fr: "Statistiques des joueurs.", en: "Player statistics." },
      { fr: "Gestion des clubs et des compétitions.", en: "Club and competition management." },
      { fr: "Saisie des feuilles de match.", en: "Match sheet entry." },
      { fr: "Notifications de changements et de résultats.", en: "Notifications for changes and results." },
    ],
    architecture: [
      { label: { fr: "Clients", en: "Clients" }, items: ["Web (gestion)", "Mobile (supporters)"] },
      { label: { fr: "API commune", en: "Shared API" }, items: ["NestJS", "Prisma"] },
      { label: { fr: "Données", en: "Data" }, items: ["Base relationnelle"] },
    ],
    decisions: [
      {
        name: "Une API pour deux clients",
        why: {
          fr: "La saisie d'une feuille de match met à jour immédiatement ce que voit le supporter : une source de vérité unique.",
          en: "Entering a match sheet immediately updates what the fan sees: a single source of truth.",
        },
      },
    ],
    nextSteps: [
      { fr: "Finaliser le modèle de compétition et la saisie des feuilles de match.", en: "Finalise the competition model and match sheet entry." },
    ],
    related: ["gebook", "kivoa"],
  },
  {
    slug: "maintivo",
    published: true,
    featured: false,
    category: "saas",
    tagline: { fr: "SaaS B2B · Maintenance", en: "B2B SaaS · Maintenance" },
    title: "Maintivo",
    summary: {
      fr: "Centraliser la gestion de la maintenance : équipements, interventions, techniciens et historique des opérations.",
      en: "Centralising maintenance management: equipment, interventions, technicians and operation history.",
    },
    problem: {
      fr: "Les interventions techniques sont souvent suivies par appels et messages dispersés, sans historique exploitable ni vision de l'état du parc d'équipements.",
      en: "Technical interventions are often tracked through scattered calls and messages, with no usable history or view of equipment status.",
    },
    contribution: {
      fr: "Conception du produit et de son architecture.",
      en: "Product and architecture design.",
    },
    status: "concept",
    stack: ["Next.js", "NestJS", "PostgreSQL"],
    stackPlanned: true,
    visual: "maintenance",
    domain: "fullstack",
    users: [
      { fr: "Responsables maintenance.", en: "Maintenance managers." },
      { fr: "Techniciens sur le terrain.", en: "Field technicians." },
    ],
    features: [
      { fr: "Gestion des équipements.", en: "Equipment management." },
      { fr: "Planification des interventions.", en: "Intervention scheduling." },
      { fr: "Suivi des techniciens et de l'état des interventions.", en: "Technician and intervention status tracking." },
      { fr: "Historique des opérations.", en: "Operation history." },
      { fr: "Rapports et indicateurs de maintenance.", en: "Maintenance reports and indicators." },
    ],
    nextSteps: [
      { fr: "Définir le périmètre d'une première version à tester avec un utilisateur réel.", en: "Define the scope of a first version to test with a real user." },
    ],
    related: ["flashmenu", "kivoa"],
  },
  {
    slug: "elite-network-devops",
    published: true,
    featured: true,
    category: "infra",
    tagline: { fr: "Infrastructure · Expérience professionnelle", en: "Infrastructure · Professional experience" },
    title: "ELITE NETWORK",
    summary: {
      fr: "Mon travail de Junior DevOps : déploiement, automatisation, Linux, pipelines CI/CD et sécurité autour d'applications internes.",
      en: "My work as a Junior DevOps: deployment, automation, Linux, CI/CD pipelines and security around internal applications.",
    },
    problem: {
      fr: "Livrer et exploiter des applications de manière reproductible et sûre, plutôt que par des opérations manuelles.",
      en: "Delivering and operating applications reproducibly and safely, rather than through manual operations.",
    },
    contribution: {
      fr: "Junior DevOps au sein de l'équipe : développement d'applications internes, déploiement, automatisation et exploitation.",
      en: "Junior DevOps within the team: internal application development, deployment, automation and operations.",
    },
    status: "professional",
    stack: ["Linux", "Docker", "GitLab CI/CD", "Git"],
    stackPlanned: false,
    visual: "pipeline",
    domain: "devops",
    confidential: true,
    context: {
      fr: "Cette entrée décrit des compétences développées dans un cadre professionnel. Le travail appartient à l'entreprise et n'est pas présenté comme un projet personnel.",
      en: "This entry describes skills developed in a professional setting. The work belongs to the company and is not presented as a personal project.",
    },
    responsibilities: [
      { fr: "Développement d'applications internes.", en: "Internal application development." },
      { fr: "Conteneurisation et déploiement avec Docker.", en: "Containerisation and deployment with Docker." },
      { fr: "Pipelines CI/CD et automatisation des livraisons.", en: "CI/CD pipelines and delivery automation." },
      { fr: "Administration Linux et bonnes pratiques de sécurité.", en: "Linux administration and security good practices." },
    ],
    architecture: [
      { label: { fr: "Code", en: "Code" }, items: ["Git", "Revue de code"] },
      { label: { fr: "Pipeline", en: "Pipeline" }, items: ["Build", "Tests", "Image Docker"] },
      { label: { fr: "Exploitation", en: "Operations" }, items: ["Serveurs Linux", "Déploiement"] },
    ],
    nextSteps: [
      { fr: "Approfondir l'observabilité et la sécurité des pipelines (DevSecOps).", en: "Go deeper into observability and pipeline security (DevSecOps)." },
    ],
    related: ["kivoa", "flashmenu"],
  },

  // Earlier work, kept out of the public list while the portfolio focuses on the six products above.
  // Set `published: true` and complete the fields to show them again.
];

export const publishedProjects = projects.filter((p) => p.published);
export const featuredProjects = publishedProjects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return publishedProjects.find((p) => p.slug === slug);
}
