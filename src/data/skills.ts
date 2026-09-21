export interface SkillCategory {
  readonly id: string
  readonly title: string
  readonly sub: string
  readonly items: readonly string[]
}

export const skills: readonly SkillCategory[] = [
  {
    id: 'backend',
    title: 'Backend',
    sub: 'Building scalable and reliable systems',
    items: ['Python', 'FastAPI', 'Node.js', 'PostgreSQL', 'MongoDB', 'Redis'],
  },
  {
    id: 'ai',
    title: 'AI / Machine Learning',
    sub: 'Integrating AI into real-world applications',
    items: ['OpenAI', 'Claude', 'Gemini', 'LangChain', 'LlamaIndex', 'RAG'],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    sub: 'Building modern and responsive interfaces',
    items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'HTML', 'CSS'],
  },
  {
    id: 'database',
    title: 'Database & BaaS',
    sub: 'Storing, managing and scaling data',
    items: ['PostgreSQL', 'MongoDB', 'Supabase', 'Convex', 'Cloudflare R2', 'Firebase'],
  },
  {
    id: 'devops',
    title: 'DevOps & Infrastructure',
    sub: 'Deploying and keeping things running',
    items: ['Docker', 'Nginx', 'Vercel', 'DigitalOcean', 'Cloudflare', 'Ubuntu'],
  },
  {
    id: 'tools',
    title: 'Tools & Others',
    sub: 'Productivity, collaboration and more',
    items: ['GitHub', 'Postman', 'Figma', 'Resend', 'VS Code', 'Notion'],
  },
] as const

export const skillsCopy = {
  photoBadgeTop: 'Always learning',
  photoBadgeBottom: 'Always building',
  kicker: 'TECHNOLOGY TURNS IDEAS INTO IMPACT.',
} as const

/** Flat, de-duplicated list of every technology named on the site. */
export const allTech: readonly string[] = Array.from(
  new Set(skills.flatMap((c) => c.items)),
)
