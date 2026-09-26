import { SITE_URL } from '@/lib/site'
import type { MetadataRoute } from 'next'
import { getProjects, getPosts } from '@/lib/convex'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    getProjects(),
    getPosts(),
  ])

  // Real content dates instead of new Date(), which changed on every request
  // and taught crawlers to ignore lastModified.
  const latest = (docs: { updatedAt: number }[]) =>
    docs.length ? new Date(Math.max(...docs.map((d) => d.updatedAt))) : undefined
  const projectsModified = latest(projects)
  const postsModified = latest(posts)
  const siteModified = latest([...projects, ...posts])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: siteModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: projectsModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: postsModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...projectRoutes, ...postRoutes]
}
