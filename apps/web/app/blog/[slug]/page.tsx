import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import type { Metadata } from 'next'
import { openGraph } from '@/lib/seo'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { getPost, getPosts, getSiteSettings } from '@/lib/convex'
import { SubPageShell } from '@/components/SubPageShell'
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
      openGraph: openGraph(`/blog/${slug}`, {
        type: 'article',
        title: post.seo?.title ?? post.title,
        description: post.seo?.description ?? post.excerpt,
        publishedTime: post.publishedAt
          ? new Date(post.publishedAt).toISOString()
          : undefined,
        modifiedTime: new Date(post.updatedAt).toISOString(),
        authors: ['Milan Kumawat'],
        tags: post.tags,
      }),
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

  const settings = await getSiteSettings().catch(() => null)

  return (
    <SubPageShell settings={settings}>
      <JsonLd data={blogPostingSchema(post)} />
      {/* View counter — fires and forgets on mount */}
      <ViewCounter slug={slug} />

        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto px-5 sm:px-7 md:px-10 pt-8 pb-0">
          <Breadcrumbs items={[
            { name: 'Home', href: '/' },
            { name: 'Blog', href: '/blog' },
            { name: post.title, href: `/blog/${post.slug}` },
          ]} />
        </div>

        {/* Article header */}
        <article className="max-w-3xl mx-auto px-5 sm:px-7 md:px-10 pt-10 pb-16 space-y-8">
          <header className="space-y-4">
            {post.category && <span className="text-xs font-bold uppercase tracking-wider text-blue">{post.category}</span>}
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
            <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-border bg-surface-feature shadow-card">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill sizes="(max-width: 767px) 90vw, 704px"
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
    </SubPageShell>
  )
}
