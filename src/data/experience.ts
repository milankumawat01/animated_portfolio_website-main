export interface Role {
  readonly id: string
  readonly company: string
  readonly title: string
  readonly period: string
  /** Short label docked to the 3D helix. */
  readonly marker: string
  readonly bullets: readonly string[]
  readonly tags: readonly string[]
}

export const experience: readonly Role[] = [
  {
    id: 'true-value-infosoft',
    company: 'True Value Infosoft Pvt. Ltd.',
    title: 'AI Engineer',
    period: 'May 2025 – Present',
    marker: '2025 – Present',
    bullets: [
      'Building AI-powered backend systems using FastAPI, Python and OpenAI APIs.',
      'Developed products like Hiro (resume management), Salezo (sales automation), and AutoResumeBot (ATS-AI).',
      'Worked on document parsing, workflow automation, and backend integrations.',
      'Integrated WhatsApp, RCS, SMS, email and other platforms for client solutions.',
      'Handling scalable systems, authentication, and deployment for enterprise products.',
    ],
    tags: ['Python', 'FastAPI', 'OpenAI', 'PostgreSQL', 'Redis', 'Docker'],
  },
  {
    id: 'eadmin',
    company: 'eAdmin Business Process Pvt. Ltd.',
    title: 'Full Stack Developer',
    period: 'Jul 2024 – Dec 2025',
    marker: '2024 – 2025',
    bullets: [
      'Built and maintained web applications using React, Node.js and MongoDB.',
      'Developed internal tools and client projects with focus on performance and scalability.',
      'Worked on APIs, authentication, and database design.',
      'Collaborated with cross-functional teams to deliver end-to-end solutions.',
    ],
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind'],
  },
  {
    id: 'freelance',
    company: 'Freelance & Personal Projects',
    title: 'Independent Developer',
    period: '2022 – 2024',
    marker: 'Earlier',
    bullets: [
      'Built and deployed multiple web applications and tools.',
      'Explored AI integrations, automation, and new technologies.',
      'Worked on client websites, school projects, and product prototypes.',
    ],
    tags: ['Next.js', 'Python', 'Supabase', 'Vercel'],
  },
] as const

export interface RailItem {
  readonly title: string
  readonly sub: string
}

export const experienceRail: readonly RailItem[] = [
  { title: 'Real Products', sub: 'Worked on products used by clients and real users.' },
  { title: 'Growing Responsibility', sub: 'From intern to engineer, with increasing ownership.' },
  { title: 'Impact Driven', sub: 'Focused on building solutions that create real value.' },
] as const
