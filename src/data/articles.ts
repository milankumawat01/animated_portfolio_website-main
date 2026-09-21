export interface Article {
  readonly id: string
  readonly category: string
  readonly date: string
  readonly title: string
  readonly excerpt: string
  readonly href: string
  readonly image: string
}

export const articles: readonly Article[] = [
  {
    id: 'fastapi',
    category: 'AI / LLMs',
    date: '12 Sep 2026',
    title: 'Building AI-Powered Applications with FastAPI',
    excerpt:
      'A practical guide to integrating LLMs into real-world applications using FastAPI, with patterns, examples and lessons learned.',
    href: '#',
    image: '/images/article-fastapi.jpg',
  },
  {
    id: 'backend',
    category: 'Engineering',
    date: '05 Sep 2026',
    title: 'Designing Scalable Backend Systems',
    excerpt:
      'Key principles and architecture patterns I follow while building scalable, maintainable and production-ready backend systems.',
    href: '#',
    image: '/images/article-backend.jpg',
  },
  {
    id: 'autoresumebot',
    category: 'Projects',
    date: '28 Aug 2026',
    title: 'Lessons from Building AutoResumeBot',
    excerpt:
      'How I built an AI-powered job application platform, the challenges I faced, and what I learned about automation, resume parsing and real user needs.',
    href: '#',
    image: '/images/article-autoresumebot.jpg',
  },
  {
    id: 'idea-to-production',
    category: 'Product',
    date: '18 Aug 2026',
    title: 'From Idea to Production',
    excerpt:
      'My end-to-end process of turning an idea into a real product — from research and design to development, deployment and user feedback.',
    href: '#',
    image: '/images/article-idea-to-production.jpg',
  },
] as const

export const writingCopy = {
  sideNote:
    'Writing helps me think clearly, learn deeper and share what I build along the way.',
  cta: 'View all articles',
  cardCta: 'Read Article',
} as const
