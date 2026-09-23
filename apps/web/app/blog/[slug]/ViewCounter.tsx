'use client'

import dynamic from 'next/dynamic'

// Client-only and code-split: the Convex client loads after hydration, off the
// critical path, and never runs during SSR/static prerender.
const ViewCounterInner = dynamic(() => import('./ViewCounterInner'), { ssr: false })

export function ViewCounter({ slug }: { slug: string }) {
  return <ViewCounterInner slug={slug} />
}
