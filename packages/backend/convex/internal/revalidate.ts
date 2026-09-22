import { v } from 'convex/values'
import { internalAction } from '../_generated/server'

export const ping = internalAction({
  args: { tags: v.array(v.string()) },
  handler: async (_ctx, { tags }) => {
    const siteUrl = process.env.SITE_URL
    const secret = process.env.REVALIDATE_SECRET

    if (!siteUrl || !secret) {
      console.warn('SITE_URL or REVALIDATE_SECRET not set — skipping revalidation.')
      return
    }

    try {
      const response = await fetch(`${siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ tags }),
      })

      if (!response.ok) {
        const body = await response.text()
        console.error(`Revalidation failed ${response.status}: ${body}`)
      }
    } catch (err) {
      console.error('Failed to ping revalidation endpoint:', err)
    }
  },
})
