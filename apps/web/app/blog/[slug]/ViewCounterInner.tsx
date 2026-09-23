'use client'

import { useEffect } from 'react'
import { useMutation } from 'convex/react'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { api as _api } from '@portfolio/backend/convex/_generated/api'
import { ConvexClientProvider } from '@/lib/convex-client-provider'
const api = _api as any // eslint-disable-line @typescript-eslint/no-explicit-any

function IncrementViews({ slug }: { slug: string }) {
  const increment = useMutation(api.blog.incrementViews)

  useEffect(() => {
    increment({ slug }).catch(() => {
      // Fire and forget — view count is best-effort
    })
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export default function ViewCounterInner({ slug }: { slug: string }) {
  return (
    <ConvexClientProvider>
      <IncrementViews slug={slug} />
    </ConvexClientProvider>
  )
}
