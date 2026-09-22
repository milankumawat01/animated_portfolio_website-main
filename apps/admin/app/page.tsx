'use client'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function IndexPage() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? '/dashboard' : '/login')
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#6b7280',
      }}
    >
      Loading…
    </div>
  )
}
