import type { Dictionary } from "./types";

const en: Dictionary = {
  meta: {
    siteTitle: "Riche Makso — Full-Stack & DevOps Developer",
    description:
      "Riche Makso, Full-Stack developer (Next.js, NestJS, TypeScript) growing DevOps expertise: Docker, CI/CD and deployment automation.",
    pages: {
      projects: {
        title: "Projects",
        description:
          "Case studies and projects by Riche Makso: web applications, integrations and deployments.",
      },
      about: {
        title: "About",
        description:
          "Background, working method and principles of Riche Makso, a Full-Stack developer growing into DevOps.",
      },
      skills: {
        title: "Skills",
        description:
          "Full-Stack and DevOps skills of Riche Makso, organised by concrete use.",
      },
      contact: {
        title: "Contact",
        description: "Let's talk about your project: LinkedIn, GitHub and WhatsApp.",
      },
    },
  },
  common: {
    skip: "Skip to content",
    menu: "Menu",
    closeMenu: "Close menu",
    language: "Language",
    switchTo: "Switch to French",
    viewProject: "View case study",
    allProjects: "All projects",
    contactMe: "Get in touch",
    discuss: "Let's talk about your project",
    backToProjects: "Back to projects",
    external: "(opens in a new tab)",
    notFoundTitle: "Page not found",
    notFoundText: "This page does not exist or has been moved.",
    backHome: "Back to home",
  },
  nav: {
    home: "Home",
    projects: "Projects",
    about: "About",
    skills: "Skills",
    contact: "Contact",
  },
  hero: {
    eyebrow: "Full-Stack developer · Junior DevOps",
    title: "I build modern applications and the systems that keep them running.",
    subtitle:
      "Full-Stack Development and DevOps, from application architecture to automated delivery.",
    ctaProjects: "View projects",
    ctaContact: "Start a conversation",
    scene:
      "Abstract representation of a distributed system: services linked together.",
    labelBuild: "Build",
    labelRun: "Run",
  },
  expertise: {
    eyebrow: "Two areas of expertise, one product",
    title: "Build the application. Run the system.",
    intro:
      "Application development and operations are complementary crafts. I work on both, with a solid Full-Stack foundation and DevOps skills that I build project after project.",
    more: "See details",
    fullstack: {
      tag: "Build",
      title: "Full-Stack Development",
      text: "Designing and shipping web and mobile applications: interface, API, database and business logic.",
      points: [
        "React / Next.js interfaces in TypeScript",
        "REST APIs with NestJS and FastAPI",
        "PostgreSQL modelling, authentication and application security",
        "Business applications and SaaS",
      ],
      flow: ["Interface", "API", "Data"],
    },
    devops: {
      tag: "Run",
      title: "DevOps & Infrastructure",
      text: "Making applications reproducible, automatically deliverable and operable, with a learning curve I am open about.",
      points: [
        "Containerisation with Docker",
        "Git and GitLab CI/CD pipelines",
        "Linux and system administration",
        "Observability and pipeline security: currently learning",
      ],
      flow: ["Commit", "Pipeline", "Container", "Environment"],
    },
  },
  featured: {
    eyebrow: "Selected projects",
    title: "Concrete work, presented honestly.",
    intro: "Each case study states my actual role and what can be verified.",
  },
  approach: {
    eyebrow: "Technical approach",
    title: "One method, from need to operations.",
    note: "A reference framework that I adapt to the size and context of each project.",
    steps: [
      {
        title: "Understand the need",
        text: "Clarify the problem, the users and the constraints before choosing a solution.",
      },
      {
        title: "Design the architecture",
        text: "Pick simple boundaries, a clean data model and clear interfaces.",
      },
      {
        title: "Build and test",
        text: "Ship in small steps, with readable, typed and verified code.",
      },
      {
        title: "Automate delivery",
        text: "Containerise and build pipelines for reproducible deployments.",
      },
      {
        title: "Monitor and improve",
        text: "Observe real behaviour, fix, and evolve the system.",
      },
    ],
  },
  stack: {
    eyebrow: "Tech stack",
    title: "The tools, grouped by purpose.",
    legend: { practice: "Used in practice", learning: "Learning" },
  },
  cta: {
    eyebrow: "Contact",
    title: "A serious software project? Let's talk.",
    text: "Business application, API integration, pipeline setup: describe your context and I'll come back with a clear approach.",
  },
  projects: {
    title: "From ideas to digital products.",
    intro:
      "I design and build digital solutions that answer concrete problems. From Full-Stack development to infrastructure, every project is a chance to turn an idea into a working product.",
    stats: { projects: "Projects shown", domains: "Domains", stack: "Recurring technologies" },
    filterLabel: "Filter by category",
    filters: {
      all: "All projects",
      saas: "SaaS products",
      entrepreneurship: "Entrepreneurship",
      impact: "Digital impact",
      infra: "Infrastructure & DevOps",
    },
    categories: {
      saas: "SaaS product",
      entrepreneurship: "Entrepreneurship",
      impact: "Digital impact",
      infra: "Infrastructure & DevOps",
    },
    status: {
      stabilizing: "Stabilising, pre-launch",
      development: "In development",
      concept: "In design",
      designdev: "In design and development",
      studio: "Active studio",
      professional: "Professional experience",
    },
    problem: "Problem addressed",
    contribution: "My contribution",
    stackLabel: "Technologies",
    stackPlanned: "Planned stack",
    previewNote: "Conceptual interface preview, not a screenshot of the product.",
    viewCase: "Read the case study",
    emptyFilter: "No project in this category yet.",
    confidential:
      "Anonymised case study: internal details, configurations and system names are deliberately not published.",
    sections: {
      overview: "Overview",
      problem: "Context and problem",
      goals: "Goals",
      users: "Target users",
      solution: "Proposed solution",
      features: "Planned features",
      role: "My role",
      architecture: "Technical architecture",
      decisions: "Technical decisions",
      challenges: "Challenges and solutions",
      preview: "Preview",
      state: "Current state and next steps",
      links: "Useful links",
      related: "Other projects",
    },
    challengeProblem: "Challenge",
    challengeSolution: "Response",
    linkLabels: { live: "View the product", repo: "GitHub repository", site: "Official website" },
    ctaTitle: "A similar need?",
    ctaText: "Let's discuss your context and the best approach.",
    diagramLabel: "Architecture diagram",
  },
  about: {
    eyebrow: "About",
    title: "Full-Stack developer, heading towards DevOps.",
    blocks: [
      {
        title: "Profile",
        text: "I'm a Full-Stack developer and Junior DevOps at ELITE NETWORK, and a tech entrepreneur based in Brazzaville. I build web and mobile applications with React, Next.js, NestJS, Node.js and Laravel, from the data model to the interface, and I design products for concrete problems.",
      },
      {
        title: "Towards DevOps",
        text: "Shipping applications taught me that a product's quality depends as much on how it is deployed and operated as on its code. So I started working with Docker, Git, GitLab CI/CD and Linux, and I'm now going deeper into observability and pipeline security.",
      },
      {
        title: "How I learn",
        text: "I learn by building: I pick a real problem, solve it with the target tool, then write down what worked and what didn't. Topics I'm still learning are labelled as such on this site.",
      },
      {
        title: "Software quality",
        text: "Typed, readable code that is checked by automated tests beats an ambitious architecture nobody masters. I prefer simple, documented solutions that are easy to evolve.",
      },
    ],
    principlesTitle: "Working principles",
    principles: [
      "State what is verified, and only that.",
      "Choose the simplest solution that meets the need.",
      "Automate what repeats, document what is decided.",
      "Measure before optimising.",
    ],
    goalsTitle: "Goals",
    goals:
      "Strengthen my application architecture skills and keep growing my DevOps and DevSecOps expertise on real projects, within a team or for clients with serious software projects.",
  },
  skills: {
    eyebrow: "Skills",
    title: "What I can build, and with what.",
    intro:
      "No percentages: for each technology, what it lets me build and where it fits. Levels are editable in the site data.",
    levels: { practice: "Used in practice", learning: "Learning" },
    usedFor: "Used for",
  },
  contact: {
    eyebrow: "Contact",
    title: "Let's talk about your project.",
    text: "The simplest way is to write to me directly. Share the context, the goal and the desired timeline: I'll get back to you with a first analysis.",
    channels: "Contact channels",
    linkedin: "LinkedIn",
    github: "GitHub",
    whatsapp: "WhatsApp",
    email: "Email",
    copyEmail: "Copy address",
    copied: "Address copied",
    location: "Location",
    noForm:
      "For an immediate exchange, WhatsApp is the fastest channel.",
    form: {
      name: "Name",
      email: "Email address",
      subject: "Subject (optional)",
      message: "Message",
      messageHint: "Context, goal, desired timeline.",
      send: "Send message",
      sending: "Sending…",
      successTitle: "Message sent",
      successText:
        "Thank you, I received your message. A confirmation email has just been sent to you and I will get back to you very soon.",
      sendAnother: "Send another message",
      errors: {
        nameRequired: "Please enter your name (2 characters minimum).",
        emailInvalid: "Please enter a valid email address.",
        messageShort: "Your message is too short (10 characters minimum).",
        messageLong: "Your message is too long (5,000 characters maximum).",
        rateLimited: "Too many attempts. Please try again in a few minutes.",
        notConfigured:
          "Message sending is not enabled on this site yet. Please use one of the channels above.",
        server:
          "The message could not be sent. Please try again shortly or use one of the channels above.",
        fix: "Please fix the highlighted fields.",
      },
    },
  },
  footer: {
    tagline: "Full-Stack & DevOps",
    rights: "All rights reserved.",
    built: "Designed and built with Next.js.",
  },
};

export default en;
