import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { requireAdmin } from './lib/auth'

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('experience')
      .withIndex('by_visible_order', (q) => q.eq('visible', true))
      .order('asc')
      .collect()
  },
})

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.db.query('experience').order('asc').collect()
  },
})

export const create = mutation({
  args: {
    company:   v.string(),
    role:      v.string(),
    period:    v.string(),
    timeframe: v.string(),
    badge:     v.string(),
    logo:      v.string(),
    logoBg:    v.string(),
    points:    v.array(v.string()),
    tags:      v.array(v.string()),
    order:     v.number(),
    visible:   v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    return await ctx.db.insert('experience', {
      ...args,
      updatedAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id:        v.id('experience'),
    company:   v.optional(v.string()),
    role:      v.optional(v.string()),
    period:    v.optional(v.string()),
    timeframe: v.optional(v.string()),
    badge:     v.optional(v.string()),
    logo:      v.optional(v.string()),
    logoBg:    v.optional(v.string()),
    points:    v.optional(v.array(v.string())),
    tags:      v.optional(v.array(v.string())),
    order:     v.optional(v.number()),
    visible:   v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx)
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() })
  },
})

export const remove = mutation({
  args: { id: v.id('experience') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    await ctx.db.delete(id)
  },
})

export const reorder = mutation({
  args: { ids: v.array(v.id('experience')) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx)
    for (let i = 0; i < ids.length; i++) {
      await ctx.db.patch(ids[i], { order: (i + 1) * 10, updatedAt: Date.now() })
    }
  },
})
