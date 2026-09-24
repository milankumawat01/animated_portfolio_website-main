import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { requireAdmin } from './lib/auth'
import { scheduleRevalidate } from './lib/revalidate'

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
    employmentType: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    current: v.optional(v.boolean()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
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
    const id = await ctx.db.insert('experience', {
      ...args,
      updatedAt: Date.now(),
    })
    await scheduleRevalidate(ctx, ['home'])
    return id
  },
})

export const update = mutation({
  args: {
    id:        v.id('experience'),
    company:   v.optional(v.string()),
    role:      v.optional(v.string()),
    employmentType: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    current: v.optional(v.boolean()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
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
    await scheduleRevalidate(ctx, ['home'])
  },
})

export const remove = mutation({
  args: { id: v.id('experience') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    await ctx.db.delete(id)
    await scheduleRevalidate(ctx, ['home'])
  },
})

export const reorder = mutation({
  args: { ids: v.array(v.id('experience')) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx)
    for (let i = 0; i < ids.length; i++) {
      await ctx.db.patch(ids[i], { order: (i + 1) * 10, updatedAt: Date.now() })
    }
    await scheduleRevalidate(ctx, ['home'])
  },
})

export const migrateDates = mutation({
  args: {},
  handler: async ctx => {
    await requireAdmin(ctx)
    const rows = await ctx.db.query('experience').collect()
    const months: Record<string, string> = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' }
    const parse = (text: string, end = false) => {
      const match = text.trim().match(/^(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+)?(\d{4})/i)
      return match ? `${match[2]}-${match[1] ? months[match[1].toLowerCase()] : end ? '12' : '01'}` : undefined
    }
    for (const row of rows) {
      if (row.startDate) continue
      const [start, end = ''] = row.period.split(/\s+[–—-]\s+/)
      const current = /present|current/i.test(end)
      const startDate = parse(start)
      const endDate = current ? undefined : parse(end, true)
      if (startDate) await ctx.db.patch(row._id, { startDate, endDate, current })
    }
    return rows.length
  },
})
