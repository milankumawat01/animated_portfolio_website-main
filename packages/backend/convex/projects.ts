import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { requireAdmin } from './lib/auth'
import { validateSlug } from './lib/validation'

// ── Public read queries ────────────────────────────────────────────────────

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('projects')
      .withIndex('by_status_order', (q) => q.eq('status', 'published'))
      .order('asc')
      .collect()
  },
})

export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const results = await ctx.db
      .query('projects')
      .withIndex('by_status_featured', (q) =>
        q.eq('status', 'published').eq('featured', true),
      )
      .collect()
    return limit ? results.slice(0, limit) : results
  },
})

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const project = await ctx.db
      .query('projects')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()
    if (!project || project.status !== 'published') return null
    return project
  },
})

// ── Admin queries ──────────────────────────────────────────────────────────

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.db.query('projects').order('asc').collect()
  },
})

// ── Admin mutations ────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    slug:            v.string(),
    title:           v.string(),
    subtitle:        v.string(),
    description:     v.string(),
    longDescription: v.string(),
    imageUrl:        v.optional(v.string()),
    tags:            v.array(v.string()),
    keyFeatures:     v.array(v.string()),
    architecture:    v.array(v.string()),
    stats:           v.array(v.object({ label: v.string(), value: v.string() })),
    liveUrl:         v.optional(v.string()),
    githubUrl:       v.optional(v.string()),
    featured:        v.boolean(),
    order:           v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    validateSlug(args.slug)
    const existing = await ctx.db
      .query('projects')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique()
    if (existing) throw new Error(`Slug "${args.slug}" is already taken.`)
    return await ctx.db.insert('projects', {
      ...args,
      status: 'draft',
      updatedAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id:              v.id('projects'),
    slug:            v.optional(v.string()),
    title:           v.optional(v.string()),
    subtitle:        v.optional(v.string()),
    description:     v.optional(v.string()),
    longDescription: v.optional(v.string()),
    imageStorageId:  v.optional(v.id('_storage')),
    imageUrl:        v.optional(v.string()),
    tags:            v.optional(v.array(v.string())),
    keyFeatures:     v.optional(v.array(v.string())),
    architecture:    v.optional(v.array(v.string())),
    stats:           v.optional(v.array(v.object({ label: v.string(), value: v.string() }))),
    liveUrl:         v.optional(v.string()),
    githubUrl:       v.optional(v.string()),
    featured:        v.optional(v.boolean()),
    order:           v.optional(v.number()),
    seo:             v.optional(v.object({
                       title: v.optional(v.string()),
                       description: v.optional(v.string()),
                     })),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx)
    if (patch.slug) {
      validateSlug(patch.slug)
      const existing = await ctx.db
        .query('projects')
        .withIndex('by_slug', (q) => q.eq('slug', patch.slug!))
        .unique()
      if (existing && existing._id !== id) throw new Error(`Slug "${patch.slug}" is already taken.`)
    }
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() })
  },
})

export const remove = mutation({
  args: { id: v.id('projects') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    await ctx.db.delete(id)
  },
})

export const reorder = mutation({
  args: { ids: v.array(v.id('projects')) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx)
    for (let i = 0; i < ids.length; i++) {
      await ctx.db.patch(ids[i], { order: (i + 1) * 10, updatedAt: Date.now() })
    }
  },
})

export const setStatus = mutation({
  args: {
    id:     v.id('projects'),
    status: v.union(v.literal('draft'), v.literal('published')),
  },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx)
    const project = await ctx.db.get(id)
    if (!project) throw new Error('Project not found.')
    const patch: { status: 'draft' | 'published'; publishedAt?: number; updatedAt: number } = {
      status,
      updatedAt: Date.now(),
    }
    if (status === 'published' && !project.publishedAt) {
      patch.publishedAt = Date.now()
    }
    await ctx.db.patch(id, patch)
  },
})
