import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { requireAdmin } from './lib/auth'
import { scheduleRevalidate } from './lib/revalidate'
import { validateSlug, BLOG_BODY_MAX } from './lib/validation'

// ── Public read queries ────────────────────────────────────────────────────

export const listPublished = query({
  args: {
    tag:    v.optional(v.string()),
    limit:  v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { tag, limit }) => {
    let results = await ctx.db
      .query('blogPosts')
      .withIndex('by_status_publishedAt', (q) => q.eq('status', 'published'))
      .order('desc')
      .collect()

    if (tag) {
      results = results.filter((p) => p.tags.includes(tag))
    }
    if (limit) {
      results = results.slice(0, limit)
    }
    return results
  },
})

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query('blogPosts')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()
    if (!post || post.status !== 'published') return null
    return post
  },
})

export const listTags = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query('blogPosts')
      .withIndex('by_status_publishedAt', (q) => q.eq('status', 'published'))
      .collect()
    const counts: Record<string, number> = {}
    for (const post of posts) {
      for (const tag of post.tags) {
        counts[tag] = (counts[tag] ?? 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  },
})

// ── Admin queries ──────────────────────────────────────────────────────────

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.db
      .query('blogPosts')
      .withIndex('by_status_publishedAt')
      .order('desc')
      .collect()
  },
})

// ── Admin mutations ────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    slug:            v.string(),
    title:           v.string(),
    excerpt:         v.string(),
    body:            v.string(),
    imageUrl:        v.optional(v.string()),
    tags:            v.array(v.string()),
    readTimeMinutes: v.number(),
    featured:        v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    validateSlug(args.slug)
    if (args.body.length > BLOG_BODY_MAX) throw new Error('Blog body too long.')
    const existing = await ctx.db
      .query('blogPosts')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
    if (existing) throw new Error(`Slug "${args.slug}" is already taken.`)
    const id = await ctx.db.insert('blogPosts', {
      ...args,
      status: 'draft',
      views: 0,
      updatedAt: Date.now(),
    })
    await scheduleRevalidate(ctx, ['blog', 'home'])
    return id
  },
})

export const update = mutation({
  args: {
    id:              v.id('blogPosts'),
    slug:            v.optional(v.string()),
    title:           v.optional(v.string()),
    excerpt:         v.optional(v.string()),
    body:            v.optional(v.string()),
    imageStorageId:  v.optional(v.id('_storage')),
    imageUrl:        v.optional(v.string()),
    tags:            v.optional(v.array(v.string())),
    readTimeMinutes: v.optional(v.number()),
    featured:        v.optional(v.boolean()),
    seo:             v.optional(v.object({
                       title: v.optional(v.string()),
                       description: v.optional(v.string()),
                     })),
    publishedAt:     v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx)
    if (patch.slug) {
      validateSlug(patch.slug)
      const existing = await ctx.db
        .query('blogPosts')
        .withIndex('by_slug', (q) => q.eq('slug', patch.slug!))
        .unique()
      if (existing && existing._id !== id) throw new Error(`Slug "${patch.slug}" is already taken.`)
    }
    if (patch.body && patch.body.length > BLOG_BODY_MAX) throw new Error('Blog body too long.')
    const before = await ctx.db.get(id)
    if (!before) throw new Error('Post not found.')
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() })
    await scheduleRevalidate(ctx, [
      'blog', 'home', `post:${before.slug}`, `post:${patch.slug ?? before.slug}`,
    ])
  },
})

export const remove = mutation({
  args: { id: v.id('blogPosts') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    const post = await ctx.db.get(id)
    await ctx.db.delete(id)
    await scheduleRevalidate(ctx, post
      ? ['blog', 'home', `post:${post.slug}`]
      : ['blog', 'home'])
  },
})

export const setStatus = mutation({
  args: {
    id:          v.id('blogPosts'),
    status:      v.union(v.literal('draft'), v.literal('published')),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, status, publishedAt }) => {
    await requireAdmin(ctx)
    const post = await ctx.db.get(id)
    if (!post) throw new Error('Post not found.')
    const patch: {
      status: 'draft' | 'published'
      publishedAt?: number
      updatedAt: number
    } = { status, updatedAt: Date.now() }

    if (status === 'published') {
      // An explicit publishedAt overrides (backdating). Otherwise stamp now.
      patch.publishedAt = publishedAt ?? post.publishedAt ?? Date.now()
    }
    await ctx.db.patch(id, patch)
    await scheduleRevalidate(ctx, ['blog', 'home', `post:${post.slug}`])
  },
})

// ── Public mutation ────────────────────────────────────────────────────────

export const incrementViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query('blogPosts')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()
    if (post) {
      await ctx.db.patch(post._id, { views: post.views + 1 })
    }
  },
})
