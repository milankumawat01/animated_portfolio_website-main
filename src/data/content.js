export const personalInfo = {
  name: 'Milan Kumawat',
  firstName: 'Milan',
  logo: 'Milan.',
  title: 'AI Engineer',
  roleLine: 'AI Engineer · Backend Developer',
  tagline: 'I build AI systems, backends and agents that actually ship.',
  location: 'Jaipur',
  country: 'India',
  phone: '+91 7340053710',
  email: 'milankumawat01@gmail.com',
  age: '22 yrs',
  address: 'Jaipur, Rajasthan, India',
  linkedin: 'https://linkedin.com/in/milankumawat',
  github: 'https://github.com/milankumawat01',
  portfolio: 'https://milankumawat.vercel.app',
  telegram: 'https://t.me/milankumawat',
  whatsapp: 'https://wa.me/917340053710',
  instagram: 'https://instagram.com/milankumawat',
  resume: '/Milan_Kumawat_Resume.pdf',
  photo: '/dp.png',
  availability: 'Open to AI / Backend Engineering roles',
}

export const stats = [
  { value: 3, suffix: '+', label: 'Years', sub: 'building production software' },
  { value: 20, suffix: '+', label: 'Projects', sub: 'shipped end-to-end' },
  { value: 8, suffix: '+', label: 'Freelance', sub: 'deliveries in 2026 alone' },
  { value: 5, suffix: '', label: 'Roles', sub: 'across AI, backend & mobile' },
]

export const heroMarquee = [
  'FastAPI', 'Python', 'LLM Agents', 'Claude Code', 'MongoDB', 'Docker',
  'React', 'Next.js', 'n8n', 'Redis', 'PostgreSQL', 'Prompt Engineering',
  'Microservices', 'Voice Agents', 'Cloudflare', 'TypeScript',
]

export const aboutIntro = `I'm an AI Engineer and backend developer working full-time at True Value Infosoft, where I build LLM-powered agents, automation systems and production APIs. Before this I co-founded CodeRift, shipped Flutter and full-stack products at eAdmin, and I still run an independent practice on the side — 8+ deliveries in 2026 across websites, ecommerce, MVPs and automation tools.`

export const aboutApproach = `My default is to design the system first, then write the code — with AI in the loop for generation, review and test coverage, and my own judgement on what actually ships. I'm currently going deeper on distributed systems: Redis, Celery, queues, caching and scale.`

export const quote = `"Building intelligent systems isn't just about algorithms — it's about understanding the problem deeply enough to know which solution will truly make a difference."`

export const experience = [
  {
    period: 'Jan 2026 — Present',
    role: 'AI ENGINEER',
    company: 'True Value Infosoft (P) Ltd.',
    description: 'Full-time, On-site — Jaipur',
    points: [
      'Build LLM-powered agents, chatbots and voice agents for production use.',
      'Design and ship FastAPI services, REST APIs and integration layers.',
      'Own AI feature evaluation — prompt design, output validation and guardrails.',
    ],
  },
  {
    period: 'May 2025 — Dec 2025',
    role: 'AI INTERN',
    company: 'True Value Infosoft (P) Ltd.',
    description: 'Trainee, Remote — AI & Software Agents',
    points: [
      'Prototyped agentic workflows and LLM integrations on internal products.',
      'Built automation pipelines with n8n, WhatsApp APIs and third-party services.',
    ],
  },
  {
    period: 'Jul 2024 — Dec 2025',
    role: 'FULL-STACK DEVELOPER',
    company: 'eAdmin Business Process Pvt. Ltd.',
    description: 'Full-time, Hybrid — Flutter & Python',
    points: [
      'Delivered cross-platform Flutter apps backed by Python services.',
      'Handled API design, database modelling and production deployment.',
    ],
  },
  {
    period: 'Feb 2023 — Jan 2025',
    role: 'CO-FOUNDER',
    company: 'CodeRift',
    description: 'Client delivery — web, ecommerce & mobile',
    points: [
      'Ran client communication, scoping, delivery and handover end-to-end.',
      'Shipped websites, ecommerce builds, WordPress, Flutter apps and payment gateways.',
    ],
  },
  {
    period: 'Jun 2023 — Aug 2023',
    role: 'DATA SCIENCE INTERN',
    company: 'Learn and Build',
    description: 'Internship — AI/ML & Deep Learning',
    points: ['Trained and evaluated ML models on real datasets; Pandas, NumPy, scikit-learn.'],
  },
]

export const education = [
  {
    period: '2026 — Present',
    degree: 'M.Tech, Artificial Intelligence & Machine Learning',
    institution: 'BITS Pilani',
    details: 'Working professional track — alongside full-time engineering role',
  },
  {
    period: '2020 — 2024',
    degree: 'B.Tech, Computer Science & Engineering',
    institution: 'Govt. Engineering College, Bikaner',
    details: 'CGPA 8.5 / 10 — DSA, Software Engineering, AI Fundamentals',
  },
]

// The differentiator section — how AI is actually used in the workflow.
export const aiPractice = {
  heading: 'AI-ASSISTED ENGINEERING',
  kicker: 'How I actually work',
  intro: `AI is part of my daily toolchain, not a demo. I use it to move faster on the boring 80% and keep full ownership of the 20% that decides whether the system holds up.`,
  pillars: [
    {
      title: 'AI-Assisted Development',
      tools: 'Claude Code · Claude · Cursor · Copilot-style workflows',
      body: 'Agentic coding for scaffolding, refactors and migrations across a repo. I drive it with tight specs and small diffs instead of one-shot prompts.',
    },
    {
      title: 'Review & Validation',
      tools: 'AI code review · Output validation · Guardrails',
      body: 'Every AI-generated change goes through a review pass — I read the diff, check the edge cases, and never merge what I cannot explain in an interview.',
    },
    {
      title: 'Test Generation',
      tools: 'Unit tests · Edge cases · Regression coverage',
      body: 'AI drafts the test matrix, I decide what actually matters. Coverage goes up without the tests turning into assertion noise.',
    },
    {
      title: 'Building With LLMs',
      tools: 'AI agents · RAG · Prompt engineering · Voice & chat',
      body: 'Beyond using AI, I ship it: agentic systems, LLM integrations, chatbots, voice agents and automation flows running in production.',
    },
  ],
  principles: [
    'Spec first, prompt second — vague prompts produce vague systems.',
    'Small diffs, reviewable changes, no unexplained code in the codebase.',
    'Evaluate the output: correctness, edge cases, cost and latency.',
    'AI accelerates the engineer — it does not replace the engineering.',
  ],
}

export const skillGroups = [
  {
    label: 'Languages',
    items: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'C++', 'Dart'],
  },
  {
    label: 'Backend',
    items: ['FastAPI', 'Django', 'Flask', 'REST APIs', 'Microservices', 'Async Programming', 'JWT & Auth', 'API Design'],
  },
  {
    label: 'AI / ML',
    items: ['LLM Integration', 'OpenAI APIs', 'AI Agents', 'Prompt Engineering', 'Chatbots', 'Voice Agents', 'Machine Learning', 'AI Automation'],
    highlight: true,
  },
  {
    label: 'AI-Assisted Development',
    items: ['Claude Code', 'Claude', 'Cursor', 'AI Code Generation', 'AI Code Review', 'AI-Assisted Debugging', 'Test Generation', 'Output Validation'],
    highlight: true,
  },
  {
    label: 'Frontend',
    items: ['React', 'Next.js', 'Flutter', 'Tailwind CSS', 'Vite', 'HTML / CSS'],
  },
  {
    label: 'Databases',
    items: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase', 'Convex', 'SQLite'],
  },
  {
    label: 'Automation & Integrations',
    items: ['n8n', 'WhatsApp APIs', 'RCS', 'SMS', 'Email APIs', 'Payment Gateways', 'Third-Party APIs'],
  },
  {
    label: 'Cloud & DevOps',
    items: ['Docker', 'Linux', 'VPS', 'Vercel', 'Cloudflare', 'Cloudflare R2', 'Git', 'GitHub', 'CI/CD'],
  },
]

export const services = [
  {
    title: 'AI ENGINEERING',
    description: 'LLM applications, AI agents, RAG pipelines, chatbots and voice agents — from prompt design and tool calling through to evaluation, guardrails and production deployment.',
  },
  {
    title: 'BACKEND DEVELOPMENT',
    description: 'FastAPI, Django and Flask services built for scale. API architecture, database modelling, authentication, async workloads, caching and performance tuning.',
  },
  {
    title: 'AI-ASSISTED DELIVERY',
    description: 'Shipping faster with Claude Code, Claude and Cursor in the loop — spec-driven generation, AI code review, automated test coverage, and human validation on every change.',
  },
  {
    title: 'AUTOMATION & INTEGRATIONS',
    description: 'n8n workflows, WhatsApp / RCS / SMS pipelines, payment gateways and third-party API orchestration that removes manual work from a business.',
  },
  {
    title: 'FULL-STACK PRODUCT BUILDS',
    description: 'End-to-end delivery with React, Next.js and Flutter on the front and Python on the back — MVPs, ecommerce systems, dashboards and installable applications.',
  },
]

export const projectFilters = ['All', 'AI', 'Backend', 'Full-Stack', 'Freelance']

export const projects = [
  {
    title: 'Resume Management System',
    tags: ['Backend', 'Full-Stack'],
    tech: 'FastAPI · React · MongoDB · JWT',
    description: 'Recruitment platform handling 1000+ candidate profiles with role-based access, JWT security and search over structured resume data.',
    demo: '',
    code: '',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=500&fit=crop',
  },
  {
    title: 'AI Voice & Chat Agent',
    tags: ['AI'],
    tech: 'Python · LLM APIs · FastAPI · Speech',
    description: 'Conversational agent with tool calling, context handling and output validation — deployed for real customer interactions over chat and voice.',
    demo: '',
    code: '',
    image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&h=500&fit=crop',
  },
  {
    title: 'Business Automation Suite',
    tags: ['AI', 'Freelance'],
    tech: 'n8n · WhatsApp API · Python · Webhooks',
    description: 'Automation layer connecting WhatsApp, SMS, email and payment events into one workflow engine — replacing hours of manual follow-up per day.',
    demo: '',
    code: '',
    image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=500&fit=crop',
  },
  {
    title: 'Smile Charities Platform',
    tags: ['Backend', 'Full-Stack'],
    tech: 'Django · PostgreSQL · Payments',
    description: 'Donation platform for NGOs supporting 500+ verified donation workflows with receipts, admin reporting and gateway integration.',
    demo: '',
    code: '',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=500&fit=crop',
  },
  {
    title: 'Visitor Management System',
    tags: ['Backend'],
    tech: 'Python · Tkinter · SQLite',
    description: 'Installable desktop system for visitor authentication, pass generation and automated reporting at facility entry points.',
    demo: '',
    code: '',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop',
  },
  {
    title: 'Salary Prediction App',
    tags: ['AI'],
    tech: 'Python · scikit-learn · Streamlit',
    description: 'Regression model with feature engineering and an interactive Streamlit front-end for live salary prediction and comparison.',
    demo: '',
    code: '',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
  },
  {
    title: 'Ecommerce & Storefront Builds',
    tags: ['Freelance', 'Full-Stack'],
    tech: 'React · WordPress · Payment Gateways',
    description: 'Multiple client storefronts delivered end-to-end — catalog, cart, checkout, gateway integration, deployment and handover.',
    demo: '',
    code: '',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
  },
  {
    title: 'Multiphase Digital',
    tags: ['Freelance'],
    tech: 'WordPress · SEO',
    description: 'Corporate PR website with a rebuilt information architecture, optimised page performance and on-page SEO.',
    demo: '',
    code: '',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
  },
  {
    title: 'Yolo Trips',
    tags: ['Freelance', 'Full-Stack'],
    tech: 'HTML · CSS · JavaScript',
    description: 'Travel booking website with responsive layouts, itinerary pages and enquiry capture.',
    demo: '',
    code: '',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop',
  },
]

export const freelance = {
  kicker: 'Independent practice',
  heading: 'FREELANCE & CLIENT WORK',
  intro: `Alongside my full-time role I run an independent development practice — 8+ software projects delivered in 2026 across websites, ecommerce systems, MVPs, automation tools, demos and installable applications.`,
  capabilities: [
    { title: 'Discovery & Scoping', body: 'Direct client communication, requirement gathering and honest scoping before a line of code is written.' },
    { title: 'Build & Iterate', body: 'MVPs, demos and mockups shipped fast, then hardened based on real client feedback.' },
    { title: 'Deploy & Handover', body: 'Production deployment, documentation, technical walkthrough and full project handover.' },
    { title: 'Ongoing Support', body: 'Post-launch fixes, feature additions and performance work as the product grows.' },
  ],
  cta: 'Have something to build?',
}

export const socialLinks = {
  linkedin: 'https://linkedin.com/in/milankumawat',
  github: 'https://github.com/milankumawat01',
  instagram: 'https://instagram.com/milankumawat',
  telegram: 'https://t.me/milankumawat',
  whatsapp: 'https://wa.me/917340053710',
}
