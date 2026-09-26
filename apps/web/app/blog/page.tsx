import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getPosts, getSiteSettings } from '@/lib/convex'
import { SubPageShell } from '@/components/SubPageShell'
import { BlogTagFilter } from './BlogTagFilter'
import { openGraph, RSS_FEED } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles by Milan Kumawat on AI engineering, backend systems, FastAPI and shipping products to production.',
  alternates: { canonical: '/blog', types: RSS_FEED },
  openGraph: openGraph('/blog', {
    type: 'website',
    title: 'Blog | Milan Kumawat',
    description: 'Articles on AI engineering, backend systems and shipping products to production.',
  }),
}

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([getPosts(), getSiteSettings()])

  // Extract all unique tags from published posts
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()
  // Article bodies stay on the server instead of being serialized into the
  // interactive filter's initial payload.
  const cards = posts.map(({ _id, slug, title, excerpt, imageUrl, tags, publishedAt, readTimeMinutes }) => ({
    _id, slug, title, excerpt, imageUrl, tags, publishedAt, readTimeMinutes,
  }))

  return (
    <SubPageShell settings={settings}>
        {/* Page Header */}
        <section className="py-16 sm:py-20 bg-bg-soft border-b border-border">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
            <div className="mb-6">
              <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog' }]} />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue mb-4">
              <span className="inline-block w-6 h-[2px] bg-blue" />
              Writing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-heading leading-none">
              Articles &amp;<br />
              <span className="text-blue">technical notes.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
              Thoughts on AI engineering, backend systems, and things I learn by building.
            </p>
            {/* RSS link */}
            <a
              href="/feed.xml"
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-blue transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              RSS Feed
            </a>
          </div>
        </section>

        {/* Tag filter + posts — client component handles filtering */}
        <Suspense fallback={<div className="py-16 text-center text-text-muted text-sm">Loading posts…</div>}>
          <BlogTagFilter posts={cards} allTags={allTags} />
        </Suspense>
    </SubPageShell>
  )
}
