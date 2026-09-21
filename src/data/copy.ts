/**
 * Every station's headline, eyebrow, intro, quote and handwritten annotation.
 * Verbatim from docs/06-CONTENT.md. Station agents import from here and never retype.
 *
 * Headlines use [bracketed] spans for the blue half — see docs/01-DESIGN-SYSTEM.md §2.
 */

export interface StationCopy {
  readonly eyebrowN?: string
  readonly eyebrow: string
  /** Two lines. Bracketed portions render in --brand-500. */
  readonly headline: readonly [string, string]
  readonly intro?: string
  readonly quote?: { readonly text: string; readonly by: string }
  readonly scripts?: readonly string[]
}

export const copy = {
  hero: {
    eyebrow: 'AI ENGINEER | BACKEND DEVELOPER',
    headline: ['Milan', '[Kumawat]'],
    sub: 'Building AI-powered products and scalable systems for a better tomorrow.',
    primaryCta: 'View My Work',
    ghostCta: 'Download Resume',
    stripLabel: 'TECH STACK I WORK WITH',
    scrollHint: 'SCROLL',
    scripts: ['Good Code Better Products.'],
    sideNote: 'Turning ideas into real products.',
  },

  about: {
    eyebrowN: '02',
    eyebrow: 'ABOUT ME',
    headline: ['Turning ideas', 'into [real solutions.]'],
    body: "I'm Milan Kumawat, an AI Engineer and Backend Developer from India. I build scalable backend systems, AI-powered applications, and modern web products that solve real-world problems. I enjoy working at the intersection of AI, automation, and clean product development.",
    traits: [
      { icon: 'code', title: 'Clean Code', sub: 'Maintainable & scalable solutions' },
      { icon: 'bulb', title: 'Problem Solver', sub: 'Turn ideas into working products' },
      { icon: 'users', title: 'Team Player', sub: 'Love building with people' },
    ],
    railHeading: 'WHAT I WORK ON',
    rail: [
      { title: 'AI Integration', sub: 'LLMs, Agents, Automation' },
      { title: 'Backend Systems', sub: 'APIs, Databases, Microservices' },
      { title: 'Product Development', sub: 'Idea → Design → Deploy' },
      { title: 'Real World Impact', sub: 'Solutions that create value' },
    ],
    photoPin: 'Jaipur, India',
    quote: {
      text: 'Good code, better products, brighter possibilities.',
      by: 'Milan Kumawat',
    },
    scripts: ['Same Curiosity Different Problems', "Let's Build What's Next."],
  },

  projects: {
    eyebrowN: '03',
    eyebrow: 'PROJECTS',
    headline: ['Projects that', 'create [real impact.]'],
    intro:
      "A showcase of the systems, products, and ideas I've built — from AI-powered platforms to scalable backend services.",
    scripts: ['Build Ship Improve Repeat.'],
  },

  experience: {
    eyebrowN: '04',
    eyebrow: 'EXPERIENCE',
    headline: ["Where I've been", '[building.]'],
    intro:
      "From startups to product teams, I've worked on real-world products, built scalable systems, and helped turn ideas into impactful solutions.",
    quote: {
      text: "Every role has taught me something new, and I'm still just getting started.",
      by: 'Milan Kumawat',
    },
    scripts: ['Good People Great Products.', 'Better Systems Brighter Tomorrow.'],
  },

  skills: {
    eyebrowN: '05',
    eyebrow: 'SKILLS & STACK',
    headline: ['Tools I use to', 'build [real solutions.]'],
    intro:
      'A carefully chosen stack that helps me build, ship and scale AI-powered products efficiently.',
    quote: {
      text: "The right tools don't make a developer. How you use them does.",
      by: 'Milan Kumawat',
    },
    scripts: ['Same Curiosity Different Tools', 'Build Learn Improve Repeat.'],
  },

  build: {
    eyebrowN: '06',
    eyebrow: 'HOW I BUILD',
    headline: ['From idea to', '[real impact.]'],
    intro:
      'A structured, hands-on approach to building scalable products — with a focus on clean code, real users, and continuous improvement.',
    quote: {
      text: "I don't just write code, I build solutions that solve real problems.",
      by: 'Milan Kumawat',
    },
    scripts: ['Ideas Code Deploy Impact', 'Build Learn Improve Repeat.'],
  },

  writing: {
    eyebrowN: '07',
    eyebrow: 'WRITING & INSIGHTS',
    headline: ["Things I'm building,", 'learning and [thinking about.]'],
    intro:
      'A collection of my technical notes, project learnings, experiments and ideas around AI, backend systems and product development.',
    quote: { text: 'Writing is how I debug my thoughts.', by: 'Milan Kumawat' },
    scripts: ['Better Ideas Through Writing.'],
  },

  contact: {
    eyebrowN: '08',
    eyebrow: 'GET IN TOUCH',
    headline: ['Have an idea', 'worth [building?]'],
    body: "I'm always open to discussing new opportunities, interesting projects or just tech conversations. Whether it's an AI product, backend system or a crazy idea — let's talk.",
    tiles: [
      {
        icon: 'mail',
        title: 'Email',
        value: 'hey@milankumawat.in',
        sub: 'Drop a message anytime.',
        href: 'mailto:hey@milankumawat.in',
      },
      {
        icon: 'linkedin',
        title: 'LinkedIn',
        value: 'linkedin.com/in/milankumawat',
        sub: "Let's connect professionally.",
        href: 'https://linkedin.com/in/milankumawat',
      },
      {
        icon: 'github',
        title: 'GitHub',
        value: 'github.com/milankumawat',
        sub: 'Check out my code.',
        href: 'https://github.com/milankumawat',
      },
      {
        icon: 'file',
        title: 'Resume',
        value: 'Download Resume',
        sub: 'View my latest resume.',
        href: '/Milan_Kumawat_Resume.pdf',
      },
    ],
    cta: "Let's Talk",
    ctaAside: "Prefer a quick chat? I'm usually active on LinkedIn.",
    floatingCard: 'Same Developer. Bigger Things Ahead.',
    scripts: ['Good Ideas Lead to Great Things.', 'Keep Building.'],
  },
} as const

export const meta = {
  title: 'Milan Kumawat — AI Engineer & Backend Developer',
  description:
    'AI Engineer and Backend Developer from Jaipur, India. Building AI-powered products and scalable systems — FastAPI, Python, Next.js, OpenAI.',
  keywords: [
    'AI Engineer',
    'Backend Developer',
    'FastAPI',
    'Python',
    'Next.js',
    'OpenAI',
    'LLM',
    'Jaipur',
  ],
} as const
