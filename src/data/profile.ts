export interface SocialLink {
  readonly id: 'github' | 'linkedin' | 'x' | 'mail'
  readonly label: string
  readonly href: string
}

export interface Stat {
  readonly value: string
  readonly label: string
}

export interface NavItem {
  readonly label: string
  readonly station: string
}

export const profile = {
  name: 'Milan Kumawat',
  firstName: 'Milan',
  lastName: 'Kumawat',
  role: 'AI Engineer | Backend Developer',
  location: 'Jaipur, India',
  email: 'hey@milankumawat.in',
  linkedin: 'linkedin.com/in/milankumawat',
  linkedinUrl: 'https://linkedin.com/in/milankumawat',
  github: 'github.com/milankumawat',
  githubUrl: 'https://github.com/milankumawat',
  xUrl: 'https://x.com/milankumawat',
  resume: '/Milan_Kumawat_Resume.pdf',
  copyright: '© 2026 Milan Kumawat. All rights reserved.',
  tagline: 'Building AI-powered products and scalable systems for a better tomorrow.',
} as const

export const stats: readonly Stat[] = [
  { value: '5K+', label: 'Users Impacted' },
  { value: '10+', label: 'Projects Built' },
  { value: '2+', label: 'Years Experience' },
] as const

export const navItems: readonly NavItem[] = [
  { label: 'Home', station: 'hero' },
  { label: 'About', station: 'about' },
  { label: 'Projects', station: 'projects' },
  { label: 'Writing', station: 'writing' },
  { label: 'Contact', station: 'contact' },
] as const

export const footerNavItems: readonly NavItem[] = [
  { label: 'Home', station: 'hero' },
  { label: 'About', station: 'about' },
  { label: 'Projects', station: 'projects' },
  { label: 'Experience', station: 'experience' },
  { label: 'Writing', station: 'writing' },
  { label: 'Contact', station: 'contact' },
] as const

export const socials: readonly SocialLink[] = [
  { id: 'github', label: 'GitHub', href: profile.githubUrl },
  { id: 'linkedin', label: 'LinkedIn', href: profile.linkedinUrl },
  { id: 'x', label: 'X', href: profile.xUrl },
  { id: 'mail', label: 'Email', href: `mailto:${profile.email}` },
] as const

/** Logos in the hero tech strip, in order. */
export const heroStack: readonly string[] = [
  'Python',
  'FastAPI',
  'Next.js',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'OpenAI',
] as const
