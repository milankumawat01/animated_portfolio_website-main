import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { requireAdmin } from './lib/auth'
import { MEDIA_SIZE_MAX } from './lib/validation'

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const create = mutation({
  args: {
    storageId:   v.id('_storage'),
    filename:    v.string(),
    contentType: v.string(),
    size:        v.number(),
    alt:         v.string(),
    width:       v.optional(v.number()),
    height:      v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    if (args.size > MEDIA_SIZE_MAX) throw new Error('File exceeds 10 MB limit.')
    if (!args.contentType.startsWith('image/')) throw new Error('Only image files are allowed.')
    return await ctx.db.insert('media', {
      ...args,
      uploadedAt: Date.now(),
    })
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.db
      .query('media')
      .withIndex('by_uploadedAt')
      .order('desc')
      .collect()
  },
})

export const remove = mutation({
  args: { id: v.id('media') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    const row = await ctx.db.get(id)
    if (!row) return
    await ctx.storage.delete(row.storageId)
    await ctx.db.delete(id)
  },
})

export const urlFor = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId)
  },
})
