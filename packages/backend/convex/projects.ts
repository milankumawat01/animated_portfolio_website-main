import { ConvexError, v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { requireAdmin } from './lib/auth'
import { scheduleRevalidate } from './lib/revalidate'
import { withImageUrl } from './lib/images'
import { validateSlug } from './lib/validation'

// ── Public read queries ────────────────────────────────────────────────────

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const results = await ctx.db
      .query('projects')
      .withIndex('by_status_order', (q) => q.eq('status', 'published'))
      .order('asc')
      .collect()
    return await Promise.all(results.map((p) => withImageUrl(ctx, p)))
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
    const sliced = limit ? results.slice(0, limit) : results
    return await Promise.all(sliced.map((p) => withImageUrl(ctx, p)))
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
    return await withImageUrl(ctx, project)
  },
})

// ── Admin queries ──────────────────────────────────────────────────────────

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    const rows = await ctx.db.query('projects').order('asc').collect()
    return Promise.all(rows.sort((a, b) => a.order - b.order).map(row => withImageUrl(ctx, row)))
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
    workType: v.optional(v.union(v.literal('unspecified'), v.literal('company'), v.literal('freelance'), v.literal('personal'))),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    contribution: v.optional(v.string()),
    buildMethod: v.optional(v.union(v.literal('unspecified'), v.literal('ai-assisted'), v.literal('manual'))),
    galleryUrls:     v.optional(v.array(v.string())),
    caseStudyUrl:    v.optional(v.string()),
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
    if (existing) throw new ConvexError(`Slug "${args.slug}" is already taken.`)
    const id = await ctx.db.insert('projects', {
      ...args,
      status: 'draft',
      updatedAt: Date.now(),
    })
    await scheduleRevalidate(ctx, ['projects', 'home'])
    return id
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
    imageStorageId:  v.optional(v.union(v.id('_storage'), v.null())),
    imageUrl:        v.optional(v.string()),
    workType: v.optional(v.union(v.literal('unspecified'), v.literal('company'), v.literal('freelance'), v.literal('personal'))),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    contribution: v.optional(v.string()),
    buildMethod: v.optional(v.union(v.literal('unspecified'), v.literal('ai-assisted'), v.literal('manual'))),
    galleryUrls:     v.optional(v.array(v.string())),
    caseStudyUrl:    v.optional(v.string()),
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
      if (existing && existing._id !== id) throw new ConvexError(`Slug "${patch.slug}" is already taken.`)
    }
    const before = await ctx.db.get(id)
    if (!before) throw new ConvexError('Project not found.')
    const { imageStorageId, ...rest } = patch
    await ctx.db.patch(id, { ...rest, ...(imageStorageId !== undefined ? { imageStorageId: imageStorageId ?? undefined } : {}), updatedAt: Date.now() })
    await scheduleRevalidate(ctx, [
      'projects', 'home', `project:${before.slug}`, `project:${patch.slug ?? before.slug}`,
    ])
  },
})

export const remove = mutation({
  args: { id: v.id('projects') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    const project = await ctx.db.get(id)
    await ctx.db.delete(id)
    await scheduleRevalidate(ctx, project
      ? ['projects', 'home', `project:${project.slug}`]
      : ['projects', 'home'])
  },
})

export const duplicate = mutation({
  args: { id: v.id('projects') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    const source = await ctx.db.get(id)
    if (!source) throw new ConvexError('Project not found.')
    let slug = `${source.slug}-copy`
    let n = 2
    while (await ctx.db.query('projects').withIndex('by_slug', q => q.eq('slug', slug)).unique()) slug = `${source.slug}-copy-${n++}`
    const { _id, _creationTime, legacyId, ...copy } = source
    return ctx.db.insert('projects', { ...copy, slug, title: `${source.title} (Copy)`, status: 'draft', featured: false, publishedAt: undefined, updatedAt: Date.now() })
  },
})

export const reorder = mutation({
  args: { ids: v.array(v.id('projects')) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx)
    const projects = await ctx.db.query('projects').collect()
    const unique = new Set(ids)
    if (unique.size !== ids.length || projects.length !== ids.length || projects.some(project => !unique.has(project._id))) {
      throw new ConvexError('The project list changed. Close Arrange projects, reopen it and try again.')
    }
    const now = Date.now()
    for (let i = 0; i < ids.length; i++) {
      await ctx.db.patch(ids[i], { order: (i + 1) * 10, updatedAt: now })
    }
    await scheduleRevalidate(ctx, ['projects', 'home'])
  },
})

export const setStatus = mutation({
  args: {
    id:     v.id('projects'),
    status: v.union(v.literal('draft'), v.literal('published'), v.literal('archived')),
  },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx)
    const project = await ctx.db.get(id)
    if (!project) throw new ConvexError('Project not found.')
    const patch: { status: 'draft' | 'published' | 'archived'; publishedAt?: number; updatedAt: number } = {
      status,
      updatedAt: Date.now(),
    }
    if (status === 'published' && !project.publishedAt) {
      patch.publishedAt = Date.now()
    }
    await ctx.db.patch(id, patch)
    await scheduleRevalidate(ctx, ['projects', 'home', `project:${project.slug}`])
  },
})
