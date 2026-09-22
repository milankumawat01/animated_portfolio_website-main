'use client'

import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { api as _api } from '@portfolio/backend/convex/_generated/api'
const api = _api as any // eslint-disable-line @typescript-eslint/no-explicit-any

// Inner component — only mounts after hydration so useMutation runs inside
// a live ConvexProvider, not during SSR/static prerender.
function ViewCounterInner({ slug }: { slug: string }) {
  const increment = useMutation(api.blog.incrementViews)

  useEffect(() => {
    increment({ slug }).catch(() => {
      // Fire and forget — view count is best-effort
    })
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export function ViewCounter({ slug }: { slug: string }) {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => { setIsMounted(true) }, [])

  if (!isMounted) return null
  return <ViewCounterInner slug={slug} />
}
