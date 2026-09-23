import { fetchQuery } from 'convex/nextjs'
import { unstable_cache } from 'next/cache'
// The generated api is currently a stub (pending `npx convex dev`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { api as _api } from '@portfolio/backend/convex/_generated/api'
const api = _api as any // eslint-disable-line @typescript-eslint/no-explicit-any

// ── Data helpers ─────────────────────────────────────────────────────────────
// convex/nextjs fetchQuery is no-store internally, so we wrap each helper in
// unstable_cache (Next.js ISR cache). Tags match what /api/revalidate (P7)
// will purge. cacheLife('hours') comes in P7 when cacheComponents is enabled.

export const getProjects = unstable_cache(
  async () => {
    return fetchQuery(api.projects.listPublished, {}) as Promise<ProjectDoc[]>
  },
  ['projects'],
  { tags: ['projects'], revalidate: 3600 },
)

export const getProject = (slug: string) =>
  unstable_cache(
    async () => {
      return fetchQuery(api.projects.bySlug, { slug }) as Promise<ProjectDoc | null>
    },
    [`project:${slug}`],
    { tags: [`project:${slug}`], revalidate: 3600 },
  )()

export const getPosts = (opts?: { limit?: number }) =>
  unstable_cache(
    async () => {
      return fetchQuery(api.blog.listPublished, opts ?? {}) as Promise<PostDoc[]>
    },
    ['blog', JSON.stringify(opts ?? {})],
    { tags: ['blog'], revalidate: 3600 },
  )()

export const getPost = (slug: string) =>
  unstable_cache(
    async () => {
      return fetchQuery(api.blog.bySlug, { slug }) as Promise<PostDoc | null>
    },
    [`post:${slug}`],
    { tags: [`post:${slug}`], revalidate: 3600 },
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
  points: string[]; tags: string[]
  order: number; visible: boolean; updatedAt: number
}

export type SkillCategoryDoc = {
  _id: string; title: string; subtitle: string; icon: string
  skills: { name: string; iconKey: string }[]
  order: number; visible: boolean; updatedAt: number
}

/** Format epoch ms → '12 Sep 2026' in UTC. Must match source display dates exactly. */
export function formatLegacyDate(epochMs: number): string {
  const d = new Date(epochMs)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${day} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export const getSiteSettings = unstable_cache(
  async () => fetchQuery(api.siteSettings.get, {}) as Promise<SiteSettingsDoc | null>,
  ['siteSettings'],
  { tags: ['siteSettings'], revalidate: 3600 },
)

export const getExperience = unstable_cache(
  async () => fetchQuery(api.experience.listVisible, {}) as Promise<ExperienceDoc[]>,
  ['experience'],
  { tags: ['experience'], revalidate: 3600 },
)

export const getSkillCategories = unstable_cache(
  async () => fetchQuery(api.skills.listVisible, {}) as Promise<SkillCategoryDoc[]>,
  ['skills'],
  { tags: ['skills'], revalidate: 3600 },
)

export type ProjectDoc = {
  _id: string
  slug: string
  title: string
  subtitle: string
  description: string
  longDescription: string
  imageUrl?: string
  tags: string[]
  keyFeatures: string[]
  architecture: string[]
  stats: { label: string; value: string }[]
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  order: number
  status: 'draft' | 'published'
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
  tags: string[]
  readTimeMinutes: number
  featured: boolean
  status: 'draft' | 'published'
  views: number
  publishedAt?: number
  updatedAt: number
  seo?: { title?: string; description?: string }
}
