import { v } from 'convex/values'
import { internalAction } from '../_generated/server'
import { internal } from '../_generated/api'

export const newLead = internalAction({
  args: { leadId: v.id('leads') },
  handler: async (ctx, { leadId }) => {
    const resendKey = process.env.RESEND_API_KEY
    const notifyTo = process.env.LEAD_NOTIFY_TO

    if (!resendKey || !notifyTo) {
      // Environment not configured — log and exit gracefully.
      // The lead is already stored; this is non-fatal.
      console.warn('RESEND_API_KEY or LEAD_NOTIFY_TO not set — skipping email notification.')
      return
    }

    const lead = await ctx.runQuery(internal.leads._get, { id: leadId })

    if (!lead) {
      console.warn(`Lead ${leadId} not found — skipping notification.`)
      return
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Resend only sends from verified domains; onboarding@resend.dev works
          // without one (to the Resend account owner's address).
          from: process.env.LEAD_NOTIFY_FROM ?? 'Portfolio <onboarding@resend.dev>',
          reply_to: lead.email,
          to: [notifyTo],
          subject: `New message from ${lead.name}`,
          text: [
            `Name: ${lead.name}`,
            `Email: ${lead.email}`,
            `Source: ${lead.source}`,
            ``,
            lead.message,
          ].join('\n'),
        }),
      })

      if (response.ok) {
        await ctx.runMutation(internal.leads._markNotified, { id: leadId })
      } else {
        const body = await response.text()
        console.error(`Resend error ${response.status}: ${body}`)
      }
    } catch (err) {
      console.error('Failed to send lead notification:', err)
    }
  },
})
