import { v } from 'convex/values'
import { query, mutation, action, internalQuery, internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { requireAdmin } from './lib/auth'
import { MEDIA_SIZE_MAX } from './lib/validation'
import { R2_PREFIX, isR2Key, r2PublicUrl, presignPut, deleteObject } from './lib/r2'

export const assertAdmin = internalQuery({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
  },
})

/** Presigned PUT into R2. The browser uploads directly; then calls `create` with the key. */
export const generateUploadUrl = action({
  args: { contentType: v.string() },
  handler: async (ctx, { contentType }): Promise<{ uploadUrl: string; key: string }> => {
    await ctx.runQuery(internal.media.assertAdmin, {})
    if (!contentType.startsWith('image/')) throw new Error('Only image files are allowed.')
    const ext = (contentType.split('/')[1] ?? 'bin').replace('svg+xml', 'svg').replace(/[^a-z0-9]/g, '')
    const key = `${R2_PREFIX}${crypto.randomUUID()}.${ext}`
    return { uploadUrl: await presignPut(key, contentType), key }
  },
})

export const create = mutation({
  args: {
    r2Key:       v.string(),
    filename:    v.string(),
    contentType: v.string(),
    size:        v.number(),
    alt:         v.string(),
    width:       v.optional(v.number()),
    height:      v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    if (!isR2Key(args.r2Key)) throw new Error('Invalid media key.')
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
    const rows = await ctx.db
      .query('media')
      .withIndex('by_uploadedAt')
      .order('desc')
      .collect()
    // Older rows were uploaded to Convex storage before the move to R2.
    return await Promise.all(rows.map(async (row) => ({
      ...row,
      url: row.r2Key
        ? r2PublicUrl(row.r2Key)
        : row.storageId ? await ctx.storage.getUrl(row.storageId) : null,
    })))
  },
})

export const remove = mutation({
  args: { id: v.id('media') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    const row = await ctx.db.get(id)
    if (!row) return
    if (row.storageId) await ctx.storage.delete(row.storageId)
    if (row.r2Key) await ctx.scheduler.runAfter(0, internal.media.deleteR2Object, { key: row.r2Key })
    await ctx.db.delete(id)
  },
})

export const deleteR2Object = internalAction({
  args: { key: v.string() },
  handler: async (_ctx, { key }) => {
    if (!isR2Key(key)) return
    await deleteObject(key)
  },
})

export const urlFor = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId)
  },
})
