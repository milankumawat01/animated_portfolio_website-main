'use client'
import { useEffect } from 'react'
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error('Admin page failed:', error) }, [error])
  return <div className="cms-empty" role="alert"><span>!</span><strong>Something went wrong</strong><p>We couldn’t load this admin page. Please try again.</p><button onClick={reset}>Retry</button></div>
}
