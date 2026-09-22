import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { requireAdmin } from './lib/auth'

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('skillCategories')
      .withIndex('by_visible_order', (q) => q.eq('visible', true))
      .order('asc')
      .collect()
  },
})

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.db.query('skillCategories').order('asc').collect()
  },
})

export const create = mutation({
  args: {
    title:    v.string(),
    subtitle: v.string(),
    icon:     v.string(),
    skills:   v.array(v.object({ name: v.string(), iconKey: v.string() })),
    order:    v.number(),
    visible:  v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    return await ctx.db.insert('skillCategories', {
      ...args,
      updatedAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id:       v.id('skillCategories'),
    title:    v.optional(v.string()),
    subtitle: v.optional(v.string()),
    icon:     v.optional(v.string()),
    skills:   v.optional(v.array(v.object({ name: v.string(), iconKey: v.string() }))),
    order:    v.optional(v.number()),
    visible:  v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx)
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() })
  },
})

export const remove = mutation({
  args: { id: v.id('skillCategories') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    await ctx.db.delete(id)
  },
})

export const reorder = mutation({
  args: { ids: v.array(v.id('skillCategories')) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx)
    for (let i = 0; i < ids.length; i++) {
      await ctx.db.patch(ids[i], { order: (i + 1) * 10, updatedAt: Date.now() })
    }
  },
})
