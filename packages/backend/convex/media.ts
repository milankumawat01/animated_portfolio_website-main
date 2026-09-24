import { v } from 'convex/values'
import { query, mutation, action, internalQuery, internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { requireAdmin } from './lib/auth'
import { scheduleRevalidate } from './lib/revalidate'
import { MEDIA_SIZE_MAX } from './lib/validation'
import { R2_PREFIX, isR2Key, r2PublicUrl, presignPut, deleteObject } from './lib/r2'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
function validateType(type: string, size?: number) {
  if (!allowedTypes.has(type)) throw new Error('Unsupported file type.')
  if (size && size > (type.startsWith('image/') ? 10 * 1024 * 1024 : MEDIA_SIZE_MAX)) throw new Error('File exceeds the size limit.')
}

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
    validateType(contentType)
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
    caption:     v.optional(v.string()),
    collection:  v.optional(v.string()),
    width:       v.optional(v.number()),
    height:      v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    if (!isR2Key(args.r2Key)) throw new Error('Invalid media key.')
    validateType(args.contentType, args.size)
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
    const projects = await ctx.db.query('projects').collect()
    const posts = await ctx.db.query('blogPosts').collect()
    // Older rows were uploaded to Convex storage before the move to R2.
    return await Promise.all(rows.map(async (row) => {
      const url = row.r2Key
        ? r2PublicUrl(row.r2Key)
        : row.storageId ? await ctx.storage.getUrl(row.storageId) : null
      return {
        ...row,
        url,
        usedIn: [
          ...(projects.some(p => url && (p.imageUrl === url || p.galleryUrls?.includes(url)) || row.storageId && p.imageStorageId === row.storageId) ? ['projects'] : []),
          ...(posts.some(p => url && (p.imageUrl === url || p.body.includes(url)) || row.storageId && p.imageStorageId === row.storageId) ? ['blog'] : []),
        ],
      }
    }))
  },
})

export const remove = mutation({
  args: { id: v.id('media') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    const row = await ctx.db.get(id)
    if (!row) return
    const url = row.r2Key ? r2PublicUrl(row.r2Key) : row.storageId ? await ctx.storage.getUrl(row.storageId) : null
    if (url) {
      const projects = await ctx.db.query('projects').collect()
      const posts = await ctx.db.query('blogPosts').collect()
      if (projects.some(p => p.imageUrl === url || p.galleryUrls?.includes(url) || (row.storageId && p.imageStorageId === row.storageId)) || posts.some(p => p.imageUrl === url || p.body.includes(url) || (row.storageId && p.imageStorageId === row.storageId))) throw new Error('This asset is used by content. Replace its references first.')
    }
    if (row.storageId) await ctx.storage.delete(row.storageId)
    if (row.r2Key) await ctx.scheduler.runAfter(0, internal.media.deleteR2Object, { key: row.r2Key })
    await ctx.db.delete(id)
  },
})

export const updateMetadata = mutation({
  args: { id: v.id('media'), alt: v.string(), caption: v.optional(v.string()), collection: v.optional(v.string()) },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx)
    if (!await ctx.db.get(id)) throw new Error('Asset not found.')
    await ctx.db.patch(id, patch)
  },
})

export const usage = query({
  args: { id: v.id('media') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    const row = await ctx.db.get(id)
    if (!row) return []
    const url = row.r2Key ? r2PublicUrl(row.r2Key) : row.storageId ? await ctx.storage.getUrl(row.storageId) : null
    if (!url) return []
    const projects = await ctx.db.query('projects').collect()
    const posts = await ctx.db.query('blogPosts').collect()
    return [
      ...projects.filter(p => p.imageUrl === url || p.galleryUrls?.includes(url) || (row.storageId && p.imageStorageId === row.storageId)).map(p => ({ title: p.title, kind: 'Project', id: p._id })),
      ...posts.filter(p => p.imageUrl === url || p.body.includes(url) || (row.storageId && p.imageStorageId === row.storageId)).map(p => ({ title: p.title, kind: 'Blog', id: p._id })),
    ]
  },
})

export const replace = mutation({
  args: { id: v.id('media'), r2Key: v.string(), filename: v.string(), contentType: v.string(), size: v.number(), width: v.optional(v.number()), height: v.optional(v.number()) },
  handler: async (ctx, { id, ...file }) => {
    await requireAdmin(ctx)
    if (!isR2Key(file.r2Key)) throw new Error('Invalid media key.')
    validateType(file.contentType, file.size)
    const row = await ctx.db.get(id)
    if (!row) throw new Error('Asset not found.')
    const family = (type: string) => type.startsWith('image/') ? 'image' : type.startsWith('video/') ? 'video' : 'document'
    if (family(row.contentType) !== family(file.contentType)) throw new Error('Replacement must be the same media type.')
    const oldUrl = row.r2Key ? r2PublicUrl(row.r2Key) : row.storageId ? await ctx.storage.getUrl(row.storageId) : null
    const newUrl = r2PublicUrl(file.r2Key)
    const projects = await ctx.db.query('projects').collect()
    const posts = await ctx.db.query('blogPosts').collect()
    for (const p of projects) {
      if (oldUrl && (p.imageUrl === oldUrl || p.galleryUrls?.includes(oldUrl) || (row.storageId && p.imageStorageId === row.storageId))) await ctx.db.patch(p._id, { imageUrl: p.imageUrl === oldUrl || (row.storageId && p.imageStorageId === row.storageId) ? newUrl : p.imageUrl, imageStorageId: row.storageId && p.imageStorageId === row.storageId ? undefined : p.imageStorageId, galleryUrls: p.galleryUrls?.map(url => url === oldUrl ? newUrl : url), updatedAt: Date.now() })
    }
    for (const p of posts) {
      if (oldUrl && (p.imageUrl === oldUrl || p.body.includes(oldUrl) || (row.storageId && p.imageStorageId === row.storageId))) await ctx.db.patch(p._id, { imageUrl: p.imageUrl === oldUrl || (row.storageId && p.imageStorageId === row.storageId) ? newUrl : p.imageUrl, imageStorageId: row.storageId && p.imageStorageId === row.storageId ? undefined : p.imageStorageId, body: p.body.split(oldUrl).join(newUrl), updatedAt: Date.now() })
    }
    await ctx.db.patch(id, { ...file, storageId: undefined, uploadedAt: Date.now() })
    if (row.storageId) await ctx.storage.delete(row.storageId)
    if (row.r2Key) await ctx.scheduler.runAfter(0, internal.media.deleteR2Object, { key: row.r2Key })
    await scheduleRevalidate(ctx, ['home', 'projects', 'blog', ...projects.filter(p => oldUrl && (p.imageUrl === oldUrl || p.galleryUrls?.includes(oldUrl))).map(p => `project:${p.slug}`), ...posts.filter(p => oldUrl && (p.imageUrl === oldUrl || p.body.includes(oldUrl))).map(p => `post:${p.slug}`)])
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
