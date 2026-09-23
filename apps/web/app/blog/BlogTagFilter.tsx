'use client'

import { useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import type { PostDoc } from '@/lib/convex'

interface Props {
  posts: PostDoc[]
  allTags: string[]
}

function formatDate(epochMs: number) {
  return new Date(epochMs).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function BlogTagFilter({ posts, allTags }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag') ?? ''

  const setTag = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tag) {
        params.set('tag', tag)
      } else {
        params.delete('tag')
      }
      router.push(`/blog?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 space-y-10">
        {/* Tag chips */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTag('')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${
                !activeTag
                  ? 'bg-blue text-white border-blue'
                  : 'bg-surface-elevated text-text-secondary border-border hover:border-blue/40 hover:text-blue'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTag(tag === activeTag ? '' : tag)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${
                  tag === activeTag
                    ? 'bg-blue text-white border-blue'
                    : 'bg-surface-elevated text-text-secondary border-border hover:border-blue/40 hover:text-blue'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Posts grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-text-muted text-sm font-medium">
            Nothing published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="bg-surface-elevated rounded-2xl border border-border shadow-soft hover:shadow-card hover:border-blue/30 transition-all duration-300 flex flex-col group overflow-hidden"
              >
                {/* Cover image */}
                <div className="relative w-full h-44 bg-surface-feature overflow-hidden border-b border-border/60">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-light to-bg-soft">
                      <span className="text-blue font-bold text-xs uppercase tracking-wider">
                        Article
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Tag badge + date */}
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      {post.tags[0] && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-light text-blue font-semibold border border-blue/20">
                          {post.tags[0]}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.publishedAt)}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-black text-text-primary group-hover:text-blue transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer row */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {post.readTimeMinutes} min read
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue group-hover:text-blue-dark transition-colors">
                      Read
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
