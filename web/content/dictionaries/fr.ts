const fr = {
  meta: {
    siteTitle: "Riche Makso — Développeur Full-Stack & DevOps",
    description:
      "Riche Makso, développeur Full-Stack (Next.js, NestJS, TypeScript) qui développe son expertise DevOps : Docker, CI/CD, automatisation des déploiements.",
    pages: {
      projects: {
        title: "Projets",
        description:
          "Études de cas et projets de Riche Makso : applications web, intégrations et déploiements.",
      },
      about: {
        title: "À propos",
        description:
          "Parcours, méthode de travail et principes de Riche Makso, développeur Full-Stack en progression vers le DevOps.",
      },
      skills: {
        title: "Compétences",
        description:
          "Compétences Full-Stack et DevOps de Riche Makso, organisées par usage concret.",
      },
      contact: {
        title: "Contact",
        description: "Discutons de votre projet : LinkedIn, GitHub et WhatsApp.",
      },
    },
  },
  common: {
    skip: "Aller au contenu",
    menu: "Menu",
    closeMenu: "Fermer le menu",
    language: "Langue",
    switchTo: "Passer en anglais",
    viewProject: "Voir l'étude de cas",
    allProjects: "Tous les projets",
    contactMe: "Me contacter",
    discuss: "Discutons de votre projet",
    backToProjects: "Retour aux projets",
    external: "(s'ouvre dans un nouvel onglet)",
    notFoundTitle: "Page introuvable",
    notFoundText: "Cette page n'existe pas ou a été déplacée.",
    backHome: "Retour à l'accueil",
  },
  nav: {
    home: "Accueil",
    projects: "Projets",
    about: "À propos",
    skills: "Compétences",
    contact: "Contact",
  },
  hero: {
    eyebrow: "Développeur Full-Stack · Junior DevOps",
    title:
      "Je conçois des applications modernes et les systèmes qui les font fonctionner.",
    subtitle:
      "Développement Full-Stack et DevOps : de l'architecture applicative à l'automatisation des déploiements.",
    ctaProjects: "Voir les projets",
    ctaContact: "Démarrer une discussion",
  },
  expertise: {
    eyebrow: "Deux expertises, un même produit",
    title: "Construire l'application. Faire tourner le système.",
    intro:
      "Le développement applicatif et l'exploitation sont deux métiers complémentaires. Je travaille sur les deux, avec une base Full-Stack solide et un DevOps que je construis projet après projet.",
    more: "Voir les détails",
    fullstack: {
      tag: "Build",
      title: "Full-Stack Development",
      text: "Concevoir et livrer des applications web et mobiles : interface, API, base de données et logique métier.",
      points: [
        "Interfaces React / Next.js en TypeScript",
        "API REST avec NestJS et FastAPI",
        "Modélisation PostgreSQL, authentification et sécurité applicative",
        "Applications métier et SaaS",
      ],
      flow: ["Interface", "API", "Données"],
    },
    devops: {
      tag: "Run",
      title: "DevOps & Infrastructure",
      text: "Rendre les applications reproductibles, livrables automatiquement et exploitables, avec une montée en compétence assumée.",
      points: [
        "Conteneurisation avec Docker",
        "Git et pipelines GitLab CI/CD",
        "Linux et administration système",
        "Observabilité et sécurité des pipelines : en apprentissage",
      ],
      flow: ["Commit", "Pipeline", "Conteneur", "Environnement"],
    },
  },
  featured: {
    eyebrow: "Projets sélectionnés",
    title: "Des réalisations concrètes, présentées honnêtement.",
    intro:
      "Chaque étude de cas indique mon rôle réel et ce qui peut être vérifié.",
  },
  approach: {
    eyebrow: "Approche technique",
    title: "Une démarche, du besoin à l'exploitation.",
    note: "Un cadre de référence que j'adapte à la taille et au contexte de chaque projet.",
    steps: [
      {
        title: "Comprendre le besoin",
        text: "Clarifier le problème, les utilisateurs et les contraintes avant de choisir une solution.",
      },
      {
        title: "Concevoir l'architecture",
        text: "Choisir des découpages simples, un modèle de données propre et des interfaces claires.",
      },
      {
        title: "Développer et tester",
        text: "Livrer par petites étapes, avec un code lisible, typé et vérifié.",
      },
      {
        title: "Automatiser la livraison",
        text: "Conteneuriser et construire des pipelines pour des déploiements reproductibles.",
      },
      {
        title: "Surveiller et améliorer",
        text: "Observer le comportement réel, corriger et faire évoluer le système.",
      },
    ],
  },
  stack: {
    eyebrow: "Stack technique",
    title: "Les outils, regroupés par usage.",
    legend: { practice: "Utilisé en pratique", learning: "En apprentissage" },
  },
  cta: {
    eyebrow: "Contact",
    title: "Un projet logiciel sérieux ? Parlons-en.",
    text: "Application métier, intégration d'API, mise en place d'un pipeline : décrivez-moi votre contexte, je vous réponds avec une approche claire.",
  },
  projects: {
    title: "Des idées aux produits numériques.",
    intro:
      "Je conçois et développe des solutions numériques qui répondent à des problèmes concrets. Du développement Full-Stack à l'infrastructure, chaque projet est une occasion de transformer une idée en produit fonctionnel.",
    stats: { projects: "Projets présentés", domains: "Domaines", stack: "Technologies récurrentes" },
    filterLabel: "Filtrer par catégorie",
    filters: {
      all: "Tous les projets",
      saas: "Produits SaaS",
      entrepreneurship: "Entrepreneuriat",
      impact: "Impact numérique",
      infra: "Infrastructure & DevOps",
    },
    categories: {
      saas: "Produit SaaS",
      entrepreneurship: "Entrepreneuriat",
      impact: "Impact numérique",
      infra: "Infrastructure & DevOps",
    },
    status: {
      stabilizing: "En stabilisation, avant lancement",
      development: "En développement",
      concept: "En conception",
      designdev: "En conception et développement",
      studio: "Studio actif",
      professional: "Expérience professionnelle",
    },
    problem: "Problème traité",
    contribution: "Ma contribution",
    stackLabel: "Technologies",
    stackPlanned: "Stack envisagée",
    previewNote: "Aperçu conceptuel de l'interface, pas une capture d'écran du produit.",
    viewCase: "Lire l'étude de cas",
    emptyFilter: "Aucun projet dans cette catégorie pour le moment.",
    confidential:
      "Étude de cas anonymisée : les détails internes, configurations et noms de systèmes ne sont volontairement pas publiés.",
    sections: {
      overview: "Présentation",
      problem: "Contexte et problème",
      goals: "Objectifs",
      users: "Utilisateurs ciblés",
      solution: "Solution proposée",
      features: "Fonctionnalités prévues",
      role: "Mon rôle",
      architecture: "Architecture technique",
      decisions: "Décisions techniques",
      challenges: "Difficultés et solutions",
      preview: "Aperçu",
      state: "État actuel et prochaines étapes",
      links: "Liens utiles",
      related: "Autres projets",
    },
    challengeProblem: "Difficulté",
    challengeSolution: "Réponse",
    linkLabels: { live: "Voir le produit", repo: "Dépôt GitHub", site: "Site officiel" },
    ctaTitle: "Un besoin similaire ?",
    ctaText: "Discutons de votre contexte et de la meilleure approche.",
    diagramLabel: "Schéma d'architecture",
  },
  aboutTeaser: {
    eyebrow: "À propos",
    title: "Un développeur qui pense produit.",
    cta: "Lire mon parcours",
  },
  about: {
    portraitAlt: "Portrait de Riche Makso, en costume noir, regard face caméra.",
    eyebrow: "À propos",
    title: "Développeur Full-Stack, en route vers le DevOps.",
    blocks: [
      {
        title: "Profil",
        text: "Je suis développeur Full-Stack et Junior DevOps chez ELITE NETWORK, entrepreneur tech basé à Brazzaville. Je construis des applications web et mobiles avec React, Next.js, NestJS et Node.js, du modèle de données jusqu'à l'interface, et je conçois des produits pour des problèmes concrets.",
      },
      {
        title: "Vers le DevOps",
        text: "En livrant des applications, j'ai constaté que la qualité d'un produit dépend autant de la façon dont il est déployé et exploité que de son code. J'ai donc commencé à travailler sur Docker, Git, GitLab CI/CD et Linux, et j'approfondis aujourd'hui l'observabilité et la sécurité des pipelines.",
      },
      {
        title: "Ma façon d'apprendre",
        text: "J'apprends en construisant : je choisis un problème réel, je le résous avec l'outil visé, puis je documente ce qui a fonctionné et ce qui n'a pas fonctionné. Les sujets en cours d'apprentissage sont signalés comme tels sur ce site.",
      },
      {
        title: "Qualité logicielle",
        text: "Un code typé, lisible et vérifiable par des contrôles automatiques vaut mieux qu'une architecture ambitieuse que personne ne maîtrise. Je préfère des solutions simples, documentées, et faciles à faire évoluer.",
      },
    ],
    principlesTitle: "Principes de travail",
    principles: [
      "Dire ce qui est vérifié, et seulement cela.",
      "Choisir la solution la plus simple qui répond au besoin.",
      "Automatiser ce qui est répété, documenter ce qui est décidé.",
      "Mesurer avant d'optimiser.",
    ],
    goalsTitle: "Objectifs",
    goals:
      "Consolider mes compétences d'architecture applicative, et continuer à développer mon expertise DevOps et DevSecOps sur des projets réels, au sein d'une équipe ou pour des clients qui ont des projets logiciels sérieux.",
  },
  skills: {
    eyebrow: "Compétences",
    title: "Ce que je sais construire, et avec quoi.",
    intro:
      "Pas de pourcentages : pour chaque technologie, ce qu'elle permet de construire et où elle intervient. Les niveaux sont modifiables dans les données du site.",
    levels: { practice: "Utilisé en pratique", learning: "En apprentissage" },
    usedFor: "Usage",
  },
  contact: {
    eyebrow: "Contact",
    title: "Discutons de votre projet.",
    text: "Le plus simple est de m'écrire directement. Indiquez le contexte, l'objectif et les délais souhaités : je reviens vers vous avec une première analyse.",
    channels: "Canaux de contact",
    linkedin: "LinkedIn",
    github: "GitHub",
    whatsapp: "WhatsApp",
    email: "Email",
    copyEmail: "Copier l'adresse",
    copied: "Adresse copiée",
    location: "Localisation",
    noForm:
      "Pour un échange immédiat, WhatsApp est le canal le plus rapide.",
    form: {
      name: "Nom",
      email: "Adresse email",
      subject: "Sujet (facultatif)",
      message: "Message",
      messageHint: "Contexte, objectif, délais souhaités.",
      send: "Envoyer le message",
      sending: "Envoi en cours…",
      successTitle: "Message envoyé",
      successText:
        "Merci, j'ai bien reçu votre message. Un email de confirmation peut vous être envoyé ; je reviens vers vous très bientôt.",
      sendAnother: "Envoyer un autre message",
      errors: {
        nameRequired: "Indiquez votre nom (2 caractères minimum).",
        emailInvalid: "Indiquez une adresse email valide.",
        messageShort: "Votre message est trop court (10 caractères minimum).",
        messageLong: "Votre message est trop long (5 000 caractères maximum).",
        rateLimited: "Trop de tentatives. Réessayez dans quelques minutes.",
        notConfigured:
          "L'envoi de messages n'est pas encore activé sur ce site. Utilisez l'un des canaux ci-dessus.",
        server:
          "Le message n'a pas pu être envoyé. Réessayez dans un instant ou utilisez l'un des canaux ci-dessus.",
        fix: "Corrigez les champs signalés.",
      },
    },
  },
  footer: {
    tagline: "Full-Stack & DevOps",
    rights: "Tous droits réservés.",
    built: "Conçu et développé avec Next.js.",
  },
};

export default fr;
