import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getPosts } from '@/lib/convex'
import { BlogTagFilter } from './BlogTagFilter'

export const metadata: Metadata = {
  title: 'Blog',
  alternates: { canonical: '/blog' },
  other: {
    // RSS feed discovery
    'application-name': 'Milan Kumawat Blog',
  },
}

export default async function BlogPage() {
  const posts = await getPosts()

  // Extract all unique tags from published posts
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans">
      {/* Static sub-page header (P3 will wire the real Navbar) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E4E9F1] shadow-soft py-3">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="flex items-center font-extrabold text-2xl tracking-tighter">
              <span className="text-ink group-hover:text-blue transition-colors">M</span>
              <span className="text-blue transition-colors group-hover:opacity-80">K</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-ink hidden sm:inline-block">
              Milan Kumawat
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold text-text-secondary">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <Link href="/projects" className="hover:text-ink transition-colors">Projects</Link>
            <Link href="/blog" className="text-ink">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Page Header */}
        <section className="py-16 sm:py-20 bg-bg-soft border-b border-border">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
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
          <BlogTagFilter posts={posts} allTags={allTags} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-[#070A0F] text-white border-t border-slate-800/80 py-8">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>© 2026 Milan Kumawat. All rights reserved.</div>
          <Link href="/" className="hover:text-white transition-colors">← Back to home</Link>
        </div>
      </footer>
    </div>
  )
}
