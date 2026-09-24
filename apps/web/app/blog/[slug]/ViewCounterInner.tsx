'use client'

import { useEffect } from 'react'
import { api as _api } from '@portfolio/backend/convex/_generated/api'
import { convexMutation } from '@/lib/convex-http'
const api = _api as any

export default function ViewCounterInner({ slug }: { slug: string }) {
  useEffect(() => {
    // Count a post once per browser tab session, so reloads don't hit Convex.
    const seenKey = `viewed:${slug}`
    try {
      if (sessionStorage.getItem(seenKey)) return
      sessionStorage.setItem(seenKey, '1')
    } catch {
      // Storage blocked: still count the view.
    }
    convexMutation(api.blog.incrementViews, { slug }).catch(() => {
      // Fire and forget — view count is best-effort
    })
  }, [slug])

  return null
}
