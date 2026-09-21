export interface Project {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly tags: readonly string[]
  readonly href: string
  readonly image: string
  /** UI tone of the screenshot behind the glass slab. */
  readonly tone: 'dark' | 'light'
}

export const projects: readonly Project[] = [
  {
    id: 'hiro',
    name: 'Hiro',
    description:
      'AI-powered resume management platform with parsing, filtering and candidate matching.',
    tags: ['FastAPI', 'Next.js', 'PostgreSQL', 'OpenAI'],
    href: '#',
    image: '/images/project-hiro.png',
    tone: 'dark',
  },
  {
    id: 'salezo',
    name: 'Salezo',
    description:
      'AI sales outreach platform with multi-channel messaging (WhatsApp, Email, SMS, RCS).',
    tags: ['Python', 'FastAPI', 'Redis', 'OpenAI'],
    href: '#',
    image: '/images/project-salezo.png',
    tone: 'light',
  },
  {
    id: 'autoresumebot',
    name: 'AutoResumeBot',
    description:
      'Automated job application platform with AI resume parsing and smart job matching.',
    tags: ['Next.js', 'FastAPI', 'OpenAI', 'MongoDB'],
    href: '#',
    image: '/images/project-autoresumebot.png',
    tone: 'dark',
  },
  {
    id: 'internal-tools',
    name: 'Internal Tools',
    description:
      'Various internal tools for document parsing, workflow automation, and backend integrations.',
    tags: ['Python', 'FastAPI', 'Docker', 'Supabase'],
    href: '#',
    image: '/images/project-internal-tools.png',
    tone: 'light',
  },
] as const

export const projectsCopy = {
  carouselLabel: 'Featured Work',
  footerLine: 'MORE PROJECTS COMING SOON...',
  footerRight: 'Always building',
  cardCta: 'View Project',
} as const
