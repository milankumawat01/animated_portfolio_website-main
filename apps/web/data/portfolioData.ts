export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tags: string[];
  longDescription: string;
  keyFeatures: string[];
  architecture: string[];
  stats?: { label: string; value: string }[];
  liveUrl: string;
  githubUrl: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  date: string;
  tag: string;
  readTime: string;
  image: string;
  excerpt: string;
  content: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  timeframe: string;
  badge: string;
  logo: string;
  logoBg: string;
  points: string[];
  tags: string[];
}

export interface SkillCategory {
  title: string;
  subtitle: string;
  icon: string;
  skills: { name: string; iconKey: string }[];
}

export const PORTFOLIO_DATA = {
  personal: {
    name: 'Milan Kumawat',
    role: 'AI ENGINEER | BACKEND DEVELOPER',
    location: 'Jaipur, India',
    headline: 'Milan Kumawat',
    subheadline: 'Building AI-powered products and scalable systems for a better tomorrow.',
    email: 'hey@milankumawat.in',
    linkedin: 'linkedin.com/in/milankumawat',
    linkedinUrl: 'https://linkedin.com/in/milankumawat',
    github: 'github.com/milankumawat',
    githubUrl: 'https://github.com/milankumawat',
    twitterUrl: 'https://x.com/milankumawat',
    resumeUrl: '/documents/Milan_Kumawat_Resume.pdf',
    bio: "I'm Milan Kumawat, an AI Engineer and Backend Developer from India. I build scalable backend systems, AI-powered applications, and modern web products that solve real-world problems. I enjoy working at the intersection of AI, automation, and clean product development.",
    stats: [
      { value: '5K+', label: 'Users Impacted' },
      { value: '10+', label: 'Projects Built' },
      { value: '2+', label: 'Years Experience' },
    ],
    heroTechStack: [
      { name: 'Python', iconKey: 'python' },
      { name: 'FastAPI', iconKey: 'fastapi' },
      { name: 'Next.js', iconKey: 'nextjs' },
      { name: 'PostgreSQL', iconKey: 'postgresql' },
      { name: 'MongoDB', iconKey: 'mongodb' },
      { name: 'Redis', iconKey: 'redis' },
      { name: 'Docker', iconKey: 'docker' },
      { name: 'OpenAI', iconKey: 'openai' },
    ],
    aboutPillars: [
      {
        title: 'Clean Code',
        description: 'Maintainable & scalable solutions',
        icon: 'code',
      },
      {
        title: 'Problem Solver',
        description: 'Turn ideas into working products',
        icon: 'lightbulb',
      },
      {
        title: 'Team Player',
        description: 'Love building with people',
        icon: 'users',
      },
    ],
    whatIWorkOn: [
      {
        title: 'AI Integration',
        description: 'LLMs, Agents, Automation',
        icon: 'brain',
      },
      {
        title: 'Backend Systems',
        description: 'APIs, Databases, Microservices',
        icon: 'database',
      },
      {
        title: 'Product Development',
        description: 'Idea → Design → Deploy',
        icon: 'box',
      },
      {
        title: 'Real World Impact',
        description: 'Solutions that create value',
        icon: 'chart',
      },
    ],
    quotes: {
      about: 'Good code, better products, brighter possibilities.',
      skills: "The right tools don't make a developer. How you use them does.",
      howIBuild: "I don't just write code, I build solutions that solve real problems.",
      experience: "Every role has taught me something new, and I'm still just getting started.",
      writing: 'Writing is how I debug my thoughts.',
      contact: 'Same Developer. Bigger Things Ahead.',
    },
    handwriting: {
      aboutPhoto: '_Same Curiosity\\nDifferent Problems',
      aboutBottom: "Let's Build What's Next.",
      projects: 'Build Ship Improve Repeat.',
      skillsPhoto: 'Same\\nCuriosity\\nDifferent\\nTools',
      skillsBottom: 'Build Learn Improve Repeat.',
      experienceLeft: 'Better\\nSystems\\nBrighter\\nTomorrow.',
      experienceRight: 'Good\\nPeople\\nGreat\\nProducts.',
      howIBuildTop: 'Ideas Code Deploy Impact',
      howIBuildBottom: 'Build Learn Improve Repeat.',
      writingTop: 'Better Ideas Through Writing.',
      contactTop: 'Good Ideas Lead to Great Things.',
      footer: 'Keep Building.',
    }
  },

  projects: [
    {
      id: 'hiro',
      title: 'Hiro',
      subtitle: 'Smarter Hiring with AI',
      description: 'AI-powered resume management platform with parsing, filtering and candidate matching.',
      image: '/images/project-hiro.png',
      tags: ['FastAPI', 'Next.js', 'PostgreSQL', 'OpenAI'],
      longDescription: 'Hiro is an end-to-end recruitment intelligence platform built to eliminate screening bottlenecks for HR teams and fast-growing tech companies. By combining high-precision document parsing with OpenAI large language models, Hiro evaluates candidate credentials, generates semantic match scores against complex job criteria, and shortlists candidates with 95% accuracy in seconds.',
      keyFeatures: [
        'Multi-format resume parsing (PDF, DOCX, Images) with structured schema validation',
        'Semantic candidate scoring based on role-specific competency requirements',
        'Dynamic talent pipeline visualization with real-time candidate status updates',
        'Automated initial screening questions generation and feedback summaries',
        'Enterprise-grade role-based access control (RBAC) and privacy compliance'
      ],
      architecture: [
        'Next.js 14 App Router for interactive recruiter dashboard and applicant portal',
        'FastAPI asynchronous microservice for document ingestion and AI pipelines',
        'PostgreSQL with pgvector for hybrid keyword and vector semantic search',
        'Redis for task queues, rate-limiting, and cached candidate profiles',
        'Dockerized deployment orchestrated with automated CI/CD workflows'
      ],
      stats: [
        { label: 'Screening Time Saved', value: '85%' },
        { label: 'Parsing Accuracy', value: '98.4%' },
        { label: 'Resumes Processed', value: '15,000+' }
      ],
      liveUrl: 'https://hiro-hire.example.com',
      githubUrl: 'https://github.com/milankumawat/hiro-ai'
    },
    {
      id: 'salezo',
      title: 'Salezo',
      subtitle: 'Automate Your Sales Outreach',
      description: 'AI sales outreach platform with multi-channel messaging (WhatsApp, Email, SMS, RCS).',
      image: '/images/project-salezo.png',
      tags: ['Python', 'FastAPI', 'Redis', 'OpenAI'],
      longDescription: 'Salezo transforms outbound sales prospecting into an automated, multi-touch omnichannel engine. Leveraging conversational AI models, it drafts hyper-personalized copy tailored to individual prospect profiles and orchestrates timed messaging sequences across WhatsApp Business API, RCS messaging, SMS, and cold email.',
      keyFeatures: [
        'Omnichannel campaign builder supporting WhatsApp, RCS, SMS, and Email',
        'Contextual AI sequence generator analyzing prospect LinkedIn and website data',
        'Distributed queue engine handling 50,000+ scheduled outbound messages daily',
        'Real-time engagement telemetry including read receipts, replies, and click-throughs',
        'Smart inbox with automated reply classification (Positive, Not Interested, Out of Office)'
      ],
      architecture: [
        'FastAPI backend with Python 3.12 utilizing Celery and Redis broker',
        'Meta WhatsApp Cloud API and Google RCS Business Messaging integration',
        'PostgreSQL database optimized with partitioning for high-volume logs',
        'OpenAI API for contextual personalization and reply intent classification'
      ],
      stats: [
        { label: 'Average Open Rate', value: '42%' },
        { label: 'Leads Reached', value: '100K+' },
        { label: 'Response Uplift', value: '3.4x' }
      ],
      liveUrl: 'https://salezo.example.com',
      githubUrl: 'https://github.com/milankumawat/salezo-outreach'
    },
    {
      id: 'autoresumebot',
      title: 'AutoResumeBot',
      subtitle: 'Apply Smarter. Get Hired Faster.',
      description: 'Automated job application platform with AI resume parsing and smart job matching.',
      image: '/images/project-autoresumebot.png',
      tags: ['Next.js', 'FastAPI', 'OpenAI', 'MongoDB'],
      longDescription: 'AutoResumeBot bridges the gap between ambitious job seekers and top companies. It analyzes a job seekers comprehensive career portfolio, crawls live job postings, customizes their resume bullets specifically for Applicant Tracking Systems (ATS), and streamlines application submissions with intelligent form completion.',
      keyFeatures: [
        'One-click resume parsing extracting work history, skills, and quantified metrics',
        'ATS keyword optimization scoring resumes against job description requirements',
        'Vector similarity search matching candidates with fresh job board openings',
        'Automated cover letter generator highlighting relevant accomplishments',
        'Centralized tracking dashboard monitoring submitted applications and statuses'
      ],
      architecture: [
        'Next.js frontend with responsive modern UI and real-time state management',
        'FastAPI service managing PDF generation and LLM prompt engineering',
        'MongoDB Atlas for flexible unstructured candidate profile storage',
        'OpenAI embeddings and Pinecone vector store for candidate-job matching'
      ],
      stats: [
        { label: 'Active Users', value: '5,000+' },
        { label: 'Interviews Booked', value: '450+' },
        { label: 'Average ATS Score', value: '94/100' }
      ],
      liveUrl: 'https://autoresumebot.example.com',
      githubUrl: 'https://github.com/milankumawat/autoresumebot'
    },
    {
      id: 'internal-tools',
      title: 'Internal Tools',
      subtitle: 'Enterprise Document & Workflow Systems',
      description: 'Various internal tools for document parsing, workflow automation, and backend integrations.',
      image: '/images/project-internal-tools.png',
      tags: ['Python', 'FastAPI', 'Docker', 'Supabase'],
      longDescription: 'A comprehensive suite of internal microservices and developer infrastructure engineered to power mission-critical operations. The platform integrates high-throughput document parsing pipelines, webhook dispatchers with exponential backoff, automated billing sync, and role-based operational dashboards.',
      keyFeatures: [
        'High-speed batch document processing supporting invoices, receipts, and IDs',
        'Reliable webhook dispatcher with automated retries and dead-letter queues',
        'Unified authentication gateway supporting JWT and OAuth2 SSO',
        'Real-time system telemetry and Grafana monitoring integration',
        'Self-hosted Supabase instances with Row Level Security (RLS) enforcement'
      ],
      architecture: [
        'Modular Python FastAPI services built using Clean Architecture patterns',
        'Docker compose and containerized orchestration on cloud VPS nodes',
        'Supabase PostgreSQL for transactional persistence and real-time subscriptions',
        'Nginx reverse proxy with SSL termination and rate limiting'
      ],
      stats: [
        { label: 'Daily Jobs', value: '25,000+' },
        { label: 'Uptime', value: '99.98%' },
        { label: 'Internal Users', value: '50+' }
      ],
      liveUrl: 'https://tools.example.com',
      githubUrl: 'https://github.com/milankumawat/internal-tools-suite'
    }
  ] as ProjectItem[],

  experience: [
    {
      id: 'tv-infosoft',
      company: 'True Value Infosoft Pvt. Ltd.',
      role: 'AI Engineer',
      period: 'May 2025 – Present',
      timeframe: '2025 – Present',
      badge: 'May 2025 – Present',
      logo: 'TV',
      logoBg: 'bg-slate-900 text-white',
      points: [
        'Building AI-powered backend systems using FastAPI, Python and OpenAI APIs.',
        'Developed products like Hiro (resume management), Salezo (sales automation), and AutoResumeBot (ATS-AI).',
        'Worked on document parsing, workflow automation, and backend integrations.',
        'Integrated WhatsApp, RCS, SMS, email and other platforms for client solutions.',
        'Handling scalable systems, authentication, and deployment for enterprise products.'
      ],
      tags: ['Python', 'FastAPI', 'OpenAI', 'PostgreSQL', 'Redis', 'Docker']
    },
    {
      id: 'eadmin',
      company: 'eAdmin Business Process Pvt. Ltd.',
      role: 'Full Stack Developer',
      period: 'Jul 2024 – Dec 2025',
      timeframe: '2024 – 2025',
      badge: 'Jul 2024 – Dec 2025',
      logo: 'eA',
      logoBg: 'bg-blue-600 text-white',
      points: [
        'Built and maintained web applications using React, Node.js and MongoDB.',
        'Developed internal tools and client projects with focus on performance and scalability.',
        'Worked on APIs, authentication, and database design.',
        'Collaborated with cross-functional teams to deliver end-to-end solutions.'
      ],
      tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind']
    },
    {
      id: 'freelance',
      company: 'Freelance & Personal Projects',
      role: 'Independent Developer',
      period: '2022 – 2024',
      timeframe: 'Earlier',
      badge: '2022 – 2024',
      logo: '🎓',
      logoBg: 'bg-blue-50 text-blue-600 border border-blue-200',
      points: [
        'Built and deployed multiple web applications and tools.',
        'Explored AI integrations, automation, and new technologies.',
        'Worked on client websites, school projects, and product prototypes.'
      ],
      tags: ['Next.js', 'Python', 'Supabase', 'Vercel']
    }
  ] as ExperienceItem[],

  skillCategories: [
    {
      title: 'Backend',
      subtitle: 'Building scalable and reliable systems',
      icon: 'server',
      skills: [
        { name: 'Python', iconKey: 'python' },
        { name: 'FastAPI', iconKey: 'fastapi' },
        { name: 'Node.js', iconKey: 'nodejs' },
        { name: 'PostgreSQL', iconKey: 'postgresql' },
        { name: 'MongoDB', iconKey: 'mongodb' },
        { name: 'Redis', iconKey: 'redis' }
      ]
    },
    {
      title: 'AI / Machine Learning',
      subtitle: 'Integrating AI into real-world applications',
      icon: 'brain',
      skills: [
        { name: 'OpenAI', iconKey: 'openai' },
        { name: 'Claude', iconKey: 'claude' },
        { name: 'Gemini', iconKey: 'gemini' },
        { name: 'LangChain', iconKey: 'langchain' },
        { name: 'LlamaIndex', iconKey: 'llamaindex' },
        { name: 'RAG', iconKey: 'rag' }
      ]
    },
    {
      title: 'Frontend',
      subtitle: 'Building modern and responsive interfaces',
      icon: 'monitor',
      skills: [
        { name: 'Next.js', iconKey: 'nextjs' },
        { name: 'React', iconKey: 'react' },
        { name: 'TypeScript', iconKey: 'typescript' },
        { name: 'Tailwind CSS', iconKey: 'tailwind' },
        { name: 'HTML', iconKey: 'html' },
        { name: 'CSS', iconKey: 'css' }
      ]
    },
    {
      title: 'Database & BaaS',
      subtitle: 'Storing, managing and scaling data',
      icon: 'database',
      skills: [
        { name: 'PostgreSQL', iconKey: 'postgresql' },
        { name: 'MongoDB', iconKey: 'mongodb' },
        { name: 'Supabase', iconKey: 'supabase' },
        { name: 'Convex', iconKey: 'convex' },
        { name: 'Cloudflare R2', iconKey: 'cloudflare' },
        { name: 'Firebase', iconKey: 'firebase' }
      ]
    },
    {
      title: 'DevOps & Infrastructure',
      subtitle: 'Deploying and keeping things running',
      icon: 'cloud',
      skills: [
        { name: 'Docker', iconKey: 'docker' },
        { name: 'Nginx', iconKey: 'nginx' },
        { name: 'Vercel', iconKey: 'vercel' },
        { name: 'DigitalOcean', iconKey: 'digitalocean' },
        { name: 'Cloudflare', iconKey: 'cloudflare' },
        { name: 'Ubuntu', iconKey: 'ubuntu' }
      ]
    },
    {
      title: 'Tools & Others',
      subtitle: 'Productivity, collaboration and more',
      icon: 'wrench',
      skills: [
        { name: 'GitHub', iconKey: 'github' },
        { name: 'Postman', iconKey: 'postman' },
        { name: 'Figma', iconKey: 'figma' },
        { name: 'Resend', iconKey: 'resend' },
        { name: 'VS Code', iconKey: 'vscode' },
        { name: 'Notion', iconKey: 'notion' }
      ]
    }
  ] as SkillCategory[],

  howIBuildSteps: [
    {
      step: '01',
      title: 'Understand',
      icon: 'lightbulb',
      description: 'I start by understanding the problem, users and business goals.',
      items: ['Research', 'User needs', 'Define scope', 'Set milestones']
    },
    {
      step: '02',
      title: 'Design',
      icon: 'fileText',
      description: 'I design the architecture, database schema and product flow.',
      items: ['System design', 'Database design', 'API structure', 'Scalability planning']
    },
    {
      step: '03',
      title: 'Build',
      icon: 'code',
      description: 'I write clean, maintainable code and integrate modern AI capabilities.',
      items: ['Backend development', 'AI integration', 'Frontend (if needed)', 'Testing & iteration']
    },
    {
      step: '04',
      title: 'Deploy',
      icon: 'rocket',
      description: 'I deploy, monitor, and optimize for real users in production.',
      items: ['Cloud deployment', 'Monitoring & logs', 'Performance tuning', 'Feedback loop']
    },
    {
      step: '05',
      title: 'Iterate',
      icon: 'chart',
      description: 'I learn from real-world usage and keep improving the product.',
      items: ['User feedback', 'New features', 'Refactoring', 'Long-term scaling']
    }
  ],

  howIBuildPillars: [
    { title: 'Real Problems', subtitle: 'User-focused solutions', icon: 'users' },
    { title: 'Clean Code', subtitle: 'Maintainable & scalable', icon: 'code' },
    { title: 'Real Users', subtitle: 'Products used in the real world', icon: 'rocket' },
    { title: 'Continuous Growth', subtitle: 'Always learning, always building', icon: 'chart' }
  ],

  articles: [
    {
      id: 'building-ai-powered-fastapi',
      title: 'Building AI-Powered Applications with FastAPI',
      date: '12 Sep 2026',
      tag: 'AI / LLMs',
      readTime: '6 min read',
      image: '/images/blog-fastapi.png',
      excerpt: 'A practical guide to integrating LLMs into real-world applications using FastAPI, with patterns, examples and lessons learned.',
      content: [
        'When integrating Large Language Models into user-facing production systems, the primary challenges are rarely about prompting alone—they center around latency, streaming performance, fault tolerance, and API reliability.',
        'FastAPI provides native asynchronous support (asyncio), robust Pydantic data validation, and built-in dependency injection, making it the premier choice for AI backend services.',
        'Key architectural patterns include Server-Sent Events (SSE) for zero-latency streaming responses, background Celery workers for heavy document parsing, and Redis caching for recurring semantic queries.',
        'By decoupling user request cycles from AI completion generation, we maintain under-200ms TTFB while delivering rich, continuous completions to clients.'
      ]
    },
    {
      id: 'designing-scalable-backend-systems',
      title: 'Designing Scalable Backend Systems',
      date: '05 Sep 2026',
      tag: 'Engineering',
      readTime: '8 min read',
      image: '/images/blog-scalability.png',
      excerpt: 'Key principles and architecture patterns I follow while building scalable, maintainable and production-ready backend systems.',
      content: [
        'Designing systems that gracefully handle 10x traffic spikes requires disciplined adherence to stateless services, database partitioning, and intelligent caching layers.',
        'In this deep dive, I explore the anatomy of high-throughput API design: from connection pool sizing in PostgreSQL to caching hot keys in Redis with cache stampede prevention.',
        'We examine rate limiting strategies using token bucket algorithms, idempotent API endpoints, and asynchronous worker queues for long-running batch operations.',
        'Scalability is not about over-engineering on day one; it is about establishing clean boundaries that can be distributed horizontally when the load demands it.'
      ]
    },
    {
      id: 'lessons-from-autoresumebot',
      title: 'Lessons from Building AutoResumeBot',
      date: '28 Aug 2026',
      tag: 'Projects',
      readTime: '5 min read',
      image: '/images/blog-autoresume.png',
      excerpt: 'How I built an AI-powered job application platform, the challenges I faced, and what I learned about automation, resume parsing and real user needs.',
      content: [
        'AutoResumeBot was born out of personal frustration with repetitive job application workflows. The dream was simple: upload your resume once, and let an intelligent agent handle the tailoring and submission.',
        'However, real-world resumes are notoriously messy. Tables, multi-column designs, arbitrary date formats, and obscure fonts cause traditional regex and rule-based parsers to fail catastrophically.',
        'I built a hybrid two-stage parsing pipeline: OCR bounding-box reconstruction followed by targeted LLM schema extraction with strict JSON validation.',
        'The core lesson was that users value transparency above automation: giving applicants an interactive preview to verify extracted data before submission dramatically boosted user trust.'
      ]
    },
    {
      id: 'from-idea-to-production',
      title: 'From Idea to Production',
      date: '18 Aug 2026',
      tag: 'Product',
      readTime: '7 min read',
      image: '/images/blog-production.png',
      excerpt: 'My end-to-end process of turning an idea into a real product — from research and design to development, deployment and user feedback.',
      content: [
        'Shipping software is a craft that extends far beyond writing code. The greatest ideas mean nothing without relentless execution, tight feedback loops, and empathetic user research.',
        'My playbook follows five clear milestones: Discover the real friction point, Wireframe the minimal path to delight, Build with robust core architecture, Deploy to production immediately with automated telemetry, and Iterate based on real metrics.',
        'By avoiding premature optimization and focusing on delivering immediate user value, you create products that people genuinely love to use.'
      ]
    }
  ] as ArticleItem[],

  contactCards: [
    {
      id: 'email',
      title: 'Email',
      value: 'hey@milankumawat.in',
      hint: 'Drop a message anytime.',
      icon: 'mail',
      action: 'mailto:hey@milankumawat.in',
      copyable: true
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      value: 'linkedin.com/in/milankumawat',
      hint: "Let's connect professionally.",
      icon: 'linkedin',
      action: 'https://linkedin.com/in/milankumawat',
      copyable: false
    },
    {
      id: 'github',
      title: 'GitHub',
      value: 'github.com/milankumawat',
      hint: 'Check out my code.',
      icon: 'github',
      action: 'https://github.com/milankumawat',
      copyable: false
    },
    {
      id: 'resume',
      title: 'Resume',
      value: 'Download Resume',
      hint: 'View my latest resume.',
      icon: 'fileText',
      action: '/documents/Milan_Kumawat_Resume.pdf',
      copyable: false
    }
  ]
};
