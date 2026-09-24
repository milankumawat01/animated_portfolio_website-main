import { fetchQuery } from 'convex/nextjs'
import { unstable_cache } from 'next/cache'
import { PORTFOLIO_DATA } from '@/data/portfolioData'
// The generated api is currently a stub (pending `npx convex dev`).
import { api as _api } from '@portfolio/backend/convex/_generated/api'
const api = _api as any

// ── Data helpers ─────────────────────────────────────────────────────────────
// convex/nextjs fetchQuery is no-store internally, so we wrap each helper in
// unstable_cache (Next.js ISR cache). Admin edits purge these tags through
// /api/revalidate, so the 24h revalidate is only a safety net and Convex sees
// about one read per query per day.

export const getProjects = unstable_cache(
  async () => {
    return fetchQuery(api.projects.listPublished, {}) as Promise<ProjectDoc[]>
  },
  ['projects'],
  { tags: ['projects'], revalidate: 86400 },
)

export const getProject = (slug: string) =>
  unstable_cache(
    async () => {
      return fetchQuery(api.projects.bySlug, { slug }) as Promise<ProjectDoc | null>
    },
    [`project:${slug}`],
    { tags: [`project:${slug}`], revalidate: 86400 },
  )()

export const getPosts = (opts?: { limit?: number }) =>
  unstable_cache(
    async () => {
      return fetchQuery(api.blog.listPublished, opts ?? {}) as Promise<PostDoc[]>
    },
    ['blog', JSON.stringify(opts ?? {})],
    { tags: ['blog'], revalidate: 86400 },
  )()

export const getPost = (slug: string) =>
  unstable_cache(
    async () => {
      return fetchQuery(api.blog.bySlug, { slug }) as Promise<PostDoc | null>
    },
    [`post:${slug}`],
    { tags: [`post:${slug}`], revalidate: 86400 },
  )()

// ── Shared document types ────────────────────────────────────────────────────
// Mirror the Convex schema. Used by page components.

export type SiteSettingsDoc = {
  _id: string
  key: 'main'
  personal: {
    name: string; role: string; location: string; headline: string
    subheadline: string; email: string; bio: string
    linkedin: string; linkedinUrl: string
    github: string; githubUrl: string
    twitterUrl: string; resumeUrl: string
  }
  stats: { value: string; label: string }[]
  heroTechStack: { name: string; iconKey: string }[]
  aboutPillars: { title: string; description: string; icon: string }[]
  whatIWorkOn: { title: string; description: string; icon: string }[]
  quotes: { about: string; skills: string; howIBuild: string; experience: string; writing: string; contact: string }
  handwriting: Record<string, string>
  howIBuildSteps: { step: string; title: string; icon: string; description: string; items: string[] }[]
  howIBuildPillars: { title: string; subtitle: string; icon: string }[]
  contactCards: { id: string; title: string; value: string; hint: string; icon: string; action: string; copyable: boolean }[]
  updatedAt: number
}

export type ExperienceDoc = {
  _id: string; legacyId: string
  company: string; role: string; period: string; timeframe: string; badge: string
  logo: string; logoBg: string
  employmentType?: string; startDate?: string; endDate?: string; current?: boolean
  location?: string; description?: string
  points: string[]; tags: string[]
  order: number; visible: boolean; updatedAt: number
}

export type SkillCategoryDoc = {
  _id: string; title: string; subtitle: string; icon: string
  skills: { name: string; iconKey: string; visible?: boolean }[]
  order: number; visible: boolean; updatedAt: number
}

/** Format epoch ms → '12 Sep 2026' in UTC. Must match source display dates exactly. */
export function formatLegacyDate(epochMs: number): string {
  const d = new Date(epochMs)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${day} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

// Infrequently changed portfolio copy is maintained in source control.
export const STATIC_SITE_SETTINGS: SiteSettingsDoc = {
  _id: 'static', key: 'main', updatedAt: 0,
  personal: PORTFOLIO_DATA.personal,
  stats: PORTFOLIO_DATA.personal.stats,
  heroTechStack: PORTFOLIO_DATA.personal.heroTechStack,
  aboutPillars: PORTFOLIO_DATA.personal.aboutPillars,
  whatIWorkOn: PORTFOLIO_DATA.personal.whatIWorkOn,
  quotes: PORTFOLIO_DATA.personal.quotes,
  handwriting: PORTFOLIO_DATA.personal.handwriting,
  howIBuildSteps: PORTFOLIO_DATA.howIBuildSteps,
  howIBuildPillars: PORTFOLIO_DATA.howIBuildPillars,
  contactCards: PORTFOLIO_DATA.contactCards,
}
export const getSiteSettings = async () => STATIC_SITE_SETTINGS

export const getExperience = unstable_cache(
  async () => fetchQuery(api.experience.listVisible, {}) as Promise<ExperienceDoc[]>,
  ['experience'],
  { tags: ['home'], revalidate: 86400 },
)

export const getSkillCategories = unstable_cache(
  async () => fetchQuery(api.skills.listVisible, {}) as Promise<SkillCategoryDoc[]>,
  ['skills'],
  { tags: ['home'], revalidate: 86400 },
)

export type ProjectDoc = {
  _id: string
  slug: string
  title: string
  subtitle: string
  description: string
  longDescription: string
  imageUrl?: string
  galleryUrls?: string[]
  caseStudyUrl?: string
  tags: string[]
  keyFeatures: string[]
  architecture: string[]
  stats: { label: string; value: string }[]
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  order: number
  status: 'draft' | 'published' | 'archived'
  publishedAt?: number
  updatedAt: number
  seo?: { title?: string; description?: string }
}

export type PostDoc = {
  _id: string
  slug: string
  title: string
  excerpt: string
  body: string
  imageUrl?: string
  category?: string
  tags: string[]
  readTimeMinutes: number
  featured: boolean
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  scheduledAt?: number
  views: number
  publishedAt?: number
  updatedAt: number
  seo?: { title?: string; description?: string }
}
