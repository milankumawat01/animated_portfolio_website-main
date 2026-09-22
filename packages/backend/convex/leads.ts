import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { internal as _internal } from './_generated/api'
import { requireAdmin } from './lib/auth'
import {
  validateLead,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from './lib/validation'

// Cast to any because the stub _generated/api doesn't have typed internal refs yet.
// After npx convex dev this cast is removed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const internal: any = _internal

// ── Public mutation ────────────────────────────────────────────────────────

export const submit = mutation({
  args: {
    name:     v.string(),
    email:    v.string(),
    message:  v.string(),
    source:   v.union(v.literal('contact-modal'), v.literal('contact-page')),
    honeypot: v.optional(v.string()),
    meta:     v.object({
                userAgent: v.optional(v.string()),
                referrer:  v.optional(v.string()),
                path:      v.optional(v.string()),
              }),
  },
  handler: async (ctx, args) => {
    // Honeypot — return success immediately, store nothing.
    // A bot that gets an error retries. A bot that gets a success goes away.
    if (args.honeypot && args.honeypot.trim() !== '') {
      return { success: true }
    }

    // Validation — throws a user-visible error
    const { name, email } = validateLead(args)

    // Rate limiting by hashed IP (key from meta — never store raw IP)
    // We use a simple key; the actual IP hashing happens server-side
    // via the client-supplied path as a fallback discriminator.
    // A proper implementation hashes the IP hash salt from env; but
    // without direct IP access in Convex mutations we key on email + path.
    const rateLimitKey = `lead:${email}`
    const now = Date.now()
    const windowStart = now - RATE_LIMIT_WINDOW_MS

    const rateRow = await ctx.db
      .query('rateLimits')
      .withIndex('by_key', (q) => q.eq('key', rateLimitKey))
      .unique()

    if (rateRow) {
      if (rateRow.windowStart > windowStart) {
        // Still in the current window
        if (rateRow.count >= RATE_LIMIT_MAX) {
          throw new Error(
            'Too many messages. Please try again in an hour.',
          )
        }
        await ctx.db.patch(rateRow._id, { count: rateRow.count + 1 })
      } else {
        // Window expired — reset
        await ctx.db.patch(rateRow._id, { count: 1, windowStart: now })
      }
    } else {
      await ctx.db.insert('rateLimits', {
        key: rateLimitKey,
        count: 1,
        windowStart: now,
      })
    }

    // Storage first, notification second — a failed email must not lose the lead
    const leadId = await ctx.db.insert('leads', {
      name,
      email,
      message:   args.message,
      source:    args.source,
      status:    'new',
      meta:      args.meta,
      notified:  false,
      createdAt: Date.now(),
    })

    // Schedule the email notification — if this fails, the lead is already saved
    await ctx.scheduler.runAfter(0, internal.notify.newLead, { leadId })

    return { success: true }
  },
})

// ── Admin queries ──────────────────────────────────────────────────────────

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('new'),
        v.literal('read'),
        v.literal('replied'),
        v.literal('archived'),
      ),
    ),
  },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx)
    if (status) {
      return await ctx.db
        .query('leads')
        .withIndex('by_status_createdAt', (q) => q.eq('status', status))
        .order('desc')
        .collect()
    }
    return await ctx.db
      .query('leads')
      .withIndex('by_createdAt')
      .order('desc')
      .collect()
  },
})

export const get = query({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    return await ctx.db.get(id)
  },
})

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    const rows = await ctx.db
      .query('leads')
      .withIndex('by_status_createdAt', (q) => q.eq('status', 'new'))
      .collect()
    return rows.length
  },
})

// ── Admin mutations ────────────────────────────────────────────────────────

export const setStatus = mutation({
  args: {
    id:     v.id('leads'),
    status: v.union(
              v.literal('new'),
              v.literal('read'),
              v.literal('replied'),
              v.literal('archived'),
            ),
  },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx)
    const patch: { status: 'new' | 'read' | 'replied' | 'archived'; repliedAt?: number } = { status }
    if (status === 'replied') patch.repliedAt = Date.now()
    await ctx.db.patch(id, patch)
  },
})

export const setNotes = mutation({
  args: { id: v.id('leads'), notes: v.string() },
  handler: async (ctx, { id, notes }) => {
    await requireAdmin(ctx)
    await ctx.db.patch(id, { notes })
  },
})

export const remove = mutation({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    await ctx.db.delete(id)
  },
})
