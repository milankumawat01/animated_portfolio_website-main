'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

// NEXT_PUBLIC_CONVEX_URL is set in .env.local (dev) and Vercel env (prod).
// During CI/static build without a deployment the provider is a no-op.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // No Convex URL configured — renders children without a provider.
    // This happens during dev before `convex dev` has been run.
    return <>{children}</>
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}

