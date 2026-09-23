import type { MetadataRoute } from 'next'
import { getProjects, getPosts } from '@/lib/convex'

// Next.js 16: sitemap() may receive { id } as a Promise — we don't shard,
// so we accept but don't use it. The function signature must NOT destructure
// it synchronously (Next 16 trap — see docs/01-ARCHITECTURE.md §7).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev'

  const [projects, posts] = await Promise.all([
    getProjects().catch(() => [] as Awaited<ReturnType<typeof getProjects>>),
    getPosts().catch(() => [] as Awaited<ReturnType<typeof getPosts>>),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...projectRoutes, ...postRoutes]
}
