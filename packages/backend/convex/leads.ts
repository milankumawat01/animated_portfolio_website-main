import { ConvexError, v } from 'convex/values'
import { internalMutation, internalQuery, mutation, query } from './_generated/server'
import { internal } from './_generated/api'
import { requireAdmin } from './lib/auth'
import {
  validateLead,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from './lib/validation'

// ── Public mutation ────────────────────────────────────────────────────────

export const submit = mutation({
  args: {
    name:     v.string(),
    email:    v.string(),
    message:  v.string(),
    subject:  v.optional(v.string()),
    phone:    v.optional(v.string()),
    company:  v.optional(v.string()),
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
    for (const [value, max] of [[args.subject, 150], [args.phone, 40], [args.company, 120]] as const) {
      if (value && value.length > max) throw new ConvexError('An optional contact field is too long.')
    }

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
          throw new ConvexError(
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
      subject: args.subject?.trim(),
      phone: args.phone?.trim(),
      company: args.company?.trim(),
      source:    args.source,
      status:    'new',
      meta:      args.meta,
      notified:  false,
      createdAt: Date.now(),
    })
    await ctx.db.insert('leadEvents', { leadId, kind: 'created', text: 'Lead received', author: 'Website', createdAt: now })

    // Schedule the email notification — if this fails, the lead is already saved
    await ctx.scheduler.runAfter(0, internal.internal.notify.newLead, { leadId })

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
        v.literal('contacted'), v.literal('in_discussion'),
        v.literal('converted'), v.literal('closed'),
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

// ── Internal (used by internal/notify.ts — no user session there) ──────────

export const _get = internalQuery({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => ctx.db.get(id),
})

export const _markNotified = internalMutation({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { notified: true })
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
              v.literal('archived'), v.literal('contacted'),
              v.literal('in_discussion'), v.literal('converted'), v.literal('closed'),
            ),
  },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx)
    const before = await ctx.db.get(id)
    if (!before) throw new ConvexError('Lead not found.')
    if (before.status === status) return
    const patch: { status: typeof status; repliedAt?: number; lastContactAt?: number } = { status }
    if (status === 'replied') patch.repliedAt = Date.now()
    if (status === 'contacted' || status === 'in_discussion') patch.lastContactAt = Date.now()
    await ctx.db.patch(id, patch)
    const identity = await ctx.auth.getUserIdentity()
    await ctx.db.insert('leadEvents', { leadId: id, kind: 'status', text: `Status changed to ${status.replace('_', ' ')}`, author: identity?.email ?? 'Admin', createdAt: Date.now() })
  },
})

export const createAdmin = mutation({
  args: { name: v.string(), email: v.string(), message: v.string(), subject: v.optional(v.string()), phone: v.optional(v.string()), company: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const { name, email } = validateLead(args)
    if (args.subject && args.subject.length > 150) throw new ConvexError('Subject is too long.')
    if (args.phone && args.phone.length > 40) throw new ConvexError('Phone is too long.')
    if (args.company && args.company.length > 120) throw new ConvexError('Company is too long.')
    const now = Date.now()
    const id = await ctx.db.insert('leads', { name, email, message: args.message.trim(), subject: args.subject?.trim(), phone: args.phone?.trim(), company: args.company?.trim(), source: 'admin', status: 'new', meta: {}, notified: true, createdAt: now })
    const identity = await ctx.auth.getUserIdentity()
    await ctx.db.insert('leadEvents', { leadId: id, kind: 'created', text: 'Lead created in admin', author: identity?.email ?? 'Admin', createdAt: now })
    return id
  },
})

export const updateAdmin = mutation({
  args: { id: v.id('leads'), name: v.string(), email: v.string(), message: v.string(), subject: v.optional(v.string()), phone: v.optional(v.string()), company: v.optional(v.string()) },
  handler: async (ctx, { id, ...args }) => {
    await requireAdmin(ctx)
    const before = await ctx.db.get(id)
    if (!before) throw new ConvexError('Lead not found.')
    const { name, email } = validateLead(args)
    if (args.subject && args.subject.length > 150) throw new ConvexError('Subject is too long.')
    if (args.phone && args.phone.length > 40) throw new ConvexError('Phone is too long.')
    if (args.company && args.company.length > 120) throw new ConvexError('Company is too long.')
    await ctx.db.patch(id, { name, email, message: args.message.trim(), subject: args.subject?.trim(), phone: args.phone?.trim(), company: args.company?.trim() })
    const identity = await ctx.auth.getUserIdentity()
    await ctx.db.insert('leadEvents', { leadId: id, kind: 'note', text: 'Contact details updated', author: identity?.email ?? 'Admin', createdAt: Date.now() })
  },
})

export const events = query({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    return ctx.db.query('leadEvents').withIndex('by_lead_createdAt', q => q.eq('leadId', id)).order('desc').collect()
  },
})

export const recentEvents = query({
  args: {},
  handler: async ctx => {
    await requireAdmin(ctx)
    return (await ctx.db.query('leadEvents').collect()).sort((a, b) => b.createdAt - a.createdAt).slice(0, 20)
  },
})

export const addNote = mutation({
  args: { id: v.id('leads'), text: v.string() },
  handler: async (ctx, { id, text }) => {
    await requireAdmin(ctx)
    if (!await ctx.db.get(id)) throw new ConvexError('Lead not found.')
    if (!text.trim() || text.length > 5000) throw new ConvexError('Note must be 1–5000 characters.')
    const identity = await ctx.auth.getUserIdentity()
    await ctx.db.insert('leadEvents', { leadId: id, kind: 'note', text: text.trim(), author: identity?.email ?? 'Admin', createdAt: Date.now() })
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
    const events = await ctx.db.query('leadEvents').withIndex('by_lead_createdAt', q => q.eq('leadId', id)).collect()
    for (const event of events) await ctx.db.delete(event._id)
    await ctx.db.delete(id)
  },
})

/** Idempotent upgrade for leads saved before the portfolio CRM statuses existed. */
export const migrateLegacy = mutation({
  args: {},
  handler: async ctx => {
    await requireAdmin(ctx)
    const rows = await ctx.db.query('leads').collect()
    for (const lead of rows) {
      const status = lead.status === 'read' ? 'new' : lead.status === 'replied' ? 'contacted' : lead.status === 'archived' ? 'closed' : lead.status
      if (status !== lead.status) await ctx.db.patch(lead._id, { status, lastContactAt: lead.repliedAt })
      const existing = await ctx.db.query('leadEvents').withIndex('by_lead_createdAt', q => q.eq('leadId', lead._id)).first()
      if (!existing) await ctx.db.insert('leadEvents', { leadId: lead._id, kind: 'created', text: 'Lead received', author: 'Website', createdAt: lead.createdAt })
      if (lead.status === 'replied' && lead.repliedAt && !await ctx.db.query('leadEvents').withIndex('by_lead_createdAt', q => q.eq('leadId', lead._id)).filter(q => q.eq(q.field('text'), 'Status changed to contacted')).first()) {
        await ctx.db.insert('leadEvents', { leadId: lead._id, kind: 'status', text: 'Status changed to contacted', author: 'Imported', createdAt: lead.repliedAt })
      }
      if (lead.notes && !await ctx.db.query('leadEvents').withIndex('by_lead_createdAt', q => q.eq('leadId', lead._id)).filter(q => q.eq(q.field('author'), 'Imported')).first()) {
        await ctx.db.insert('leadEvents', { leadId: lead._id, kind: 'note', text: lead.notes, author: 'Imported', createdAt: Date.now() })
      }
    }
    return rows.length
  },
})
