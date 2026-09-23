import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, Home, ChevronRight } from 'lucide-react'
import { getPost, getPosts } from '@/lib/convex'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { ViewCounter } from './ViewCounter'
import { JsonLd, blogPostingSchema } from '@/components/seo/JsonLd'

interface Props {
  params: Promise<{ slug: string }>
}

function formatDate(epochMs: number) {
  return new Date(epochMs).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export async function generateStaticParams() {
  try {
    const posts = await getPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await getPost(slug)
    if (!post) return { title: 'Article Not Found' }
    return {
      title: post.seo?.title ?? post.title,
      description: post.seo?.description ?? post.excerpt,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        type: 'article',
        title: post.seo?.title ?? post.title,
        description: post.seo?.description ?? post.excerpt,
        publishedTime: post.publishedAt
          ? new Date(post.publishedAt).toISOString()
          : undefined,
      },
    }
  } catch {
    return { title: 'Article' }
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  let post
  try {
    post = await getPost(slug)
  } catch {
    post = null
  }

  if (!post) notFound()

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans">
      <JsonLd data={blogPostingSchema(post)} />
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
            <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      {/* View counter — fires and forgets on mount */}
      <ViewCounter slug={slug} />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto px-5 sm:px-7 md:px-10 pt-8 pb-0">
          <nav className="flex items-center gap-2 text-xs text-text-muted font-medium" aria-label="Breadcrumb">
            <Link href="/" className="flex items-center gap-1 hover:text-ink transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <span className="text-text-primary font-semibold truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>

        {/* Article header */}
        <article className="max-w-3xl mx-auto px-5 sm:px-7 md:px-10 pt-10 pb-16 space-y-8">
          <header className="space-y-4">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-full bg-blue-light text-blue text-xs font-semibold border border-blue/20 hover:bg-blue hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-heading leading-[1.1]">
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(post.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readTimeMinutes} min read
              </span>
              {post.views > 0 && (
                <span className="text-text-muted">{post.views.toLocaleString()} views</span>
              )}
            </div>
          </header>

          {/* Cover image */}
          {post.imageUrl && (
            <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-border bg-slate-950 shadow-card">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Body */}
          <div className="pt-2">
            <MarkdownRenderer body={post.body} />
          </div>

          {/* Back link */}
          <div className="pt-8 border-t border-border">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to the blog
            </Link>
          </div>

          {/* Contact CTA */}
          <div className="rounded-2xl bg-bg-soft border border-border p-8 text-center space-y-4">
            <h3 className="text-xl font-black text-text-primary">Enjoyed this article?</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              I write about AI engineering, backend systems, and building in public. Let&apos;s connect.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue hover:bg-blue-dark text-white font-semibold text-sm transition shadow-sm"
            >
              Get in touch
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-[#070A0F] text-white border-t border-slate-800/80 py-8">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>© 2026 Milan Kumawat. All rights reserved.</div>
          <Link href="/blog" className="hover:text-white transition-colors">← All articles</Link>
        </div>
      </footer>
    </div>
  )
}
