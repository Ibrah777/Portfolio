export const portfolioData = {
  profile: {
    firstName: "El Hadj Ibrahima",
    lastName: "Dione",
    title: "Étudiant en informatique",
    subtitle: "Développement d'applications",
    email: "dionesarr84@gmail.com",
    location: "Troyes (10600)",
    linkedin: "https://www.linkedin.com/in/el-hadj-ibrahima-dione777/",
    github: "https://github.com/LejteH0P",
    cv: "/cv_ibrahima_dione.pdf"
  },

  about: `Je suis en 1ère année de BTS SIO option SLAM au CNED. Avant ça, j'ai fait deux ans de Licence AES à Paris-Assas (antenne de Melun) avant de me réorienter vers l'informatique — un choix que j'aurais dû faire plus tôt.

Ce qui me plaît vraiment, c'est le jeu vidéo et la 3D. Je joue depuis longtemps, j'ai commencé à scripter sur Roblox Studio, et depuis j'explore Unity, Unreal Engine 5 et Blender. Le BTS SLAM, c'est pour poser des bases solides côté développement.

Je suis basé à Troyes, en formation à distance, et je cherche un stage en développement pour la fin de l'année scolaire.`,

  timeline: [
    {
      period: "2020",
      title: "Brevet des collèges",
      description: "",
      location: "Troyes"
    },
    {
      period: "2020 — 2023",
      title: "Lycée général — Baccalauréat 2023",
      description: "Spécialités SVT & Anglais, Mathématiques complémentaires",
      location: "Melun"
    },
    {
      period: "2023 — 2025",
      title: "Licence 1 AES",
      description: "Administration Économique et Sociale — Université Paris-Assas",
      location: "Melun"
    },
    {
      period: "2025 — Aujourd'hui",
      title: "BTS SIO option SLAM",
      description: "Services Informatiques aux Organisations — formation à distance",
      location: "CNED"
    }
  ],

  formation: {
    title: "BTS SIO - SLAM",
    description: "Le BTS SIO, option SLAM, c'est 2 ans de dev : langages, bases de données, architecture logicielle, travail en équipe avec Git. J'ai choisi cette voie pour avoir de vraies bases en programmation avant de me spécialiser.",
    topics: [
      "La programmation en C#, Java, PHP et Python",
      "La conception de bases de données (MySQL, PostgreSQL, MongoDB)",
      "L'architecture logicielle (MVC, POO)",
      "La qualité du code (tests unitaires, SonarLint, normes SOLID)",
      "Le travail collaboratif avec Git et GitHub",
      "Les méthodes de conception Merise et UML"
    ],
    note: "Je suis cette formation en distanciel via le CNED, ce qui développe également mon autonomie et ma rigueur dans l'organisation personnelle."
  },

  careers: [
    {
      title: "Développeur Jeu Vidéo",
      subtitle: "Game Developer",
      description: "C'est le métier que je vise en priorité. Je bidouille déjà avec Unity (C#) et Unreal Engine 5 (Blueprints, un peu de C++). Après le BTS, j'aimerais intégrer une école spécialisée — ISART Digital ou Brassart.",
      icon: "gamepad"
    },
    {
      title: "Animateur 3D",
      subtitle: "3D Animator",
      description: "Je suis initié à Blender — modélisation, matériaux, un peu d'animation. C'est un domaine qui m'attire autant que le code, surtout pour le jeu vidéo où les deux se rejoignent.",
      icon: "box"
    },
    {
      title: "Développeur Web Full-Stack",
      subtitle: "Web Developer",
      description: "Ce portfolio tourne sur React + FastAPI + MongoDB — c'est déjà du full-stack. C'est une compétence utile partout, et j'y prends goût même si ce n'est pas ma priorité numéro 1.",
      icon: "globe"
    }
  ],

  skills: {
    programming: ["C#", "Java", "PHP", "HTML/CSS", "JavaScript", "Python"],
    databases: ["MySQL", "PostgreSQL", "MongoDB"],
    tools: ["GitHub", "Architecture MVC", "Merise / UML", "Tests unitaires", "SonarLint", "WordPress"],
    quality: ["Normes KISS, DRY, SOLID", "Analyse de code"],
    softSkills: ["Autonomie (formation à distance)", "Rigueur", "Curiosité technologique"],
    personal: ["Lua", "Luau", "Roblox Studio", "C++", "Blueprints (UE5)", "HLSL (shaders UE5)", "GDScript (Godot)", "Blender (initiation)"]
  },

  projects: [
    {
      title: "Agenda C#",
      description: "Application console de gestion de contacts en C# — Programmation Orientée Objet et sérialisation JSON.",
      tech: "C#, POO, JSON",
      status: "Terminé",
      icon: "calendar",
      github: "https://github.com/LejteH0P/agenda-csharp",
      color: "from-blue-100 to-indigo-100",
      iconColor: "text-indigo-500",
      competences: ["Conception et développement d'applications", "Qualité logicielle (POO, SOLID)", "Travail collaboratif (GitHub)"]
    },
    {
      title: "Gestion des habilitations",
      description: "Gestion des droits d'accès utilisateurs — Architecture MVC, base MySQL, authentification BCrypt.",
      tech: "C#, MVC, MySQL, BCrypt",
      status: "Terminé",
      icon: "lock",
      github: "https://github.com/LejteH0P/gestion-habilitations",
      color: "from-salmon-100 to-orange-100",
      iconColor: "text-salmon-500",
      competences: ["Gérer le patrimoine informatique", "Mettre en place des niveaux d'habilitation", "Architecture MVC, base de données"]
    },
    {
      title: "Jeu de combat 2D Client/Serveur",
      description: "Jeu multijoueur en réseau avec architecture client-serveur, gestion des états et tours de jeu.",
      tech: "Java, Sockets",
      status: "En cours",
      icon: "swords",
      github: null,
      color: "from-red-100 to-orange-100",
      iconColor: "text-red-500",
      competences: ["Conception et développement d'applications", "Architecture réseau client/serveur", "Programmation orientée objet"]
    },
    {
      title: "Site responsive d'articles",
      description: "Corrections, conformité RGPD, déploiement et référencement d'un site de présentation d'articles.",
      tech: "PHP, HTML/CSS, JavaScript",
      status: "En cours",
      icon: "globe",
      github: null,
      color: "from-green-100 to-teal-100",
      iconColor: "text-green-600",
      competences: ["Développer la présence en ligne", "Référencement et visibilité", "Déployer un service web"]
    },
    {
      title: "Site e-commerce",
      description: "Création d'une boutique en ligne avec gestion des produits, du panier et des commandes.",
      tech: "WordPress",
      status: "En cours",
      icon: "shopping-cart",
      github: null,
      color: "from-purple-100 to-pink-100",
      iconColor: "text-purple-500",
      competences: ["Développer la présence en ligne", "Valorisation de l'image via CMS", "Mise à disposition d'un service"]
    },
    {
      title: "Stage en entreprise",
      description: "Expérience professionnelle en développement — mission à déterminer selon l'entreprise.",
      tech: "À déterminer",
      status: "À venir",
      icon: "briefcase",
      github: null,
      color: "from-slate-100 to-gray-100",
      iconColor: "text-slate-400",
      competences: ["Répondre aux demandes d'assistance", "Travailler en mode projet", "Développement professionnel"]
    },
    {
      title: "Atelier 2",
      description: "Projet de développement collaboratif en équipe — à définir en 2e année de BTS.",
      tech: "À déterminer",
      status: "À venir",
      icon: "wrench",
      github: null,
      color: "from-yellow-100 to-amber-100",
      iconColor: "text-amber-500",
      competences: ["Travailler en mode projet", "Travail collaboratif (Git)", "Mise à disposition d'un service"]
    },
    {
      title: "Jeux Web & News Gaming",
      description: "Mini-jeux jouables dans le navigateur (Snake, Tetris, Platformer) + actualités gaming en direct via l'API RAWG.io — sorties récentes, jeux à venir et top notés.",
      tech: "React, FastAPI, RAWG API, Canvas",
      status: "En cours",
      icon: "gamepad",
      github: null,
      color: "from-slate-700 to-slate-900",
      iconColor: "text-salmon-400",
      internalLink: "/news",
      competences: ["Développer la présence en ligne", "Consommer une API REST", "Frontend React + Backend FastAPI"]
    }
  ],

  veille: {
    intro: "Ma veille repose sur trois dispositifs : Google Alertes (mots-clés ciblés envoyés par mail), Feedly pour agréger les flux RSS en un seul endroit, et une liste de sites consultés régulièrement. J'évalue les sources selon la méthode QQOQCCP — auteur, date, origine, fréquence de l'information — avant de les retenir.",
    themes: [
      {
        title: "Développement de jeux vidéo & moteurs graphiques",
        description: "Unity et Unreal Engine sortent régulièrement des mises à jour majeures. Je suis ce thème en priorité car c'est mon domaine cible : il est essentiel de connaître les nouvelles fonctionnalités (Lumen, Nanite, DOTS...) pour rester compétitif. Sources vérifiées via les blogs officiels des éditeurs.",
        sources: ["80.lv", "Game Developer Magazine", "Brackeys (YouTube)", "Unity Blog", "Epic Games Dev"]
      },
      {
        title: "Animation 3D & outils de création numérique",
        description: "Blender évolue vite grâce à une communauté très active. Je l'utilise pour la modélisation et l'initiation à l'animation — des compétences complémentaires au code dans le jeu vidéo. Je surveille les nouvelles versions et les workflows d'exportation vers Unity/Unreal.",
        sources: ["Blender.org", "CGTrader", "ArtStation", "YouTube — Blender Guru"]
      },
      {
        title: "Développement web & technologies back-end",
        description: "React, FastAPI et MongoDB sont au cœur de ce portfolio — je dois donc rester à jour sur leurs évolutions. Ce thème couvre aussi les bonnes pratiques (SOLID, tests, sécurité) apprises en BTS SIO que j'applique sur mes projets. Je consulte Dev.to et HackerNews pour les retours d'expérience de la communauté.",
        sources: ["Dev.to", "HackerNews", "MDN Web Docs", "FastAPI Docs", "OpenClassrooms"]
      }
    ]
  }
};

// Note: skills.personal est ajouté ici
