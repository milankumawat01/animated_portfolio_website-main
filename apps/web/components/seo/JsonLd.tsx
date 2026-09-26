import type { PostDoc, ProjectDoc, SiteSettingsDoc } from '@/lib/convex'

import { SITE_URL, absoluteUrl } from '@/lib/site'

// Structured data as a <script> in the page, per the Next.js JSON-LD guide.
// `<` is escaped so content from the CMS can never close the script tag.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

const iso = (ms?: number) => (ms ? new Date(ms).toISOString() : undefined)

function author(settings?: SiteSettingsDoc | null) {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: settings?.personal.name ?? 'Milan Kumawat',
    url: SITE_URL,
  }
}

export function personSchema(settings: SiteSettingsDoc | null) {
  const p = settings?.personal
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: p?.name ?? 'Milan Kumawat',
    url: SITE_URL,
    jobTitle: 'AI Engineer & Backend Developer',
    description: p?.bio,
    image: absoluteUrl('/images/milan-profile.jpg'),
    email: p?.email ? `mailto:${p.email}` : undefined,
    address: p?.location
      ? { '@type': 'PostalAddress', addressLocality: p.location.split(',')[0]?.trim(), addressCountry: 'IN' }
      : undefined,
    sameAs: [p?.linkedinUrl, p?.githubUrl, p?.twitterUrl].filter(Boolean),
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Milan Kumawat',
    url: SITE_URL,
    inLanguage: 'en',
    author: { '@id': `${SITE_URL}/#person` },
  }
}

export function blogPostingSchema(post: PostDoc) {
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    url,
    mainEntityOfPage: url,
    image: post.imageUrl ? new URL(post.imageUrl, SITE_URL).toString() : `${url}/opengraph-image`,
    datePublished: iso(post.publishedAt),
    dateModified: iso(post.updatedAt),
    keywords: post.tags.join(', '),
    author: author(),
    publisher: author(),
  }
}

export function creativeWorkSchema(project: ProjectDoc) {
  const url = `${SITE_URL}/projects/${project.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    alternativeHeadline: project.subtitle,
    description: project.seo?.description ?? project.description,
    url,
    image: project.imageUrl ? new URL(project.imageUrl, SITE_URL).toString() : `${url}/opengraph-image`,
    datePublished: iso(project.publishedAt),
    dateModified: iso(project.updatedAt),
    keywords: project.tags.join(', '),
    author: author(),
    sameAs: [project.liveUrl, project.githubUrl].filter(Boolean),
  }
}
