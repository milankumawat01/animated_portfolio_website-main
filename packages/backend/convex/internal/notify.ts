import { v } from 'convex/values'
import { internalAction } from '../_generated/server'

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

    const lead = await ctx.runQuery(
      // @ts-ignore — internal query reference; typed after schema freeze
      'leads:get' as any,
      { id: leadId },
    )

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
          from: 'Portfolio <no-reply@milankumawat.in>',
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
        await ctx.runMutation(
          // @ts-ignore
          'leads:_markNotified' as any,
          { id: leadId },
        )
      } else {
        const body = await response.text()
        console.error(`Resend error ${response.status}: ${body}`)
      }
    } catch (err) {
      console.error('Failed to send lead notification:', err)
    }
  },
})
