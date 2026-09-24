'use client'
import { Authenticated, Unauthenticated } from 'convex/react'
import { Sidebar } from '@/components/shell/Sidebar'
import { TopBar } from '@/components/shell/TopBar'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useState } from 'react'
import { FeedbackProvider } from '@/components/ui/Feedback'
import type { ReactNode } from 'react'

function RedirectToLogin() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/login')
  }, [router])
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
      Redirecting…
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <Authenticated>
        <FeedbackProvider>
        <div className="admin-shell">
          <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
          <div className="admin-workspace">
            <TopBar onMenu={() => setMenuOpen(true)} />
            <main className="admin-main">{children}</main>
          </div>
        </div>
        </FeedbackProvider>
      </Authenticated>
      <Unauthenticated>
        <RedirectToLogin />
      </Unauthenticated>
    </>
  )
}
