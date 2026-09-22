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
