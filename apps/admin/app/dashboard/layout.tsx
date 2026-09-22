'use client'
import { Authenticated, Unauthenticated } from 'convex/react'
import { Sidebar } from '@/components/shell/Sidebar'
import { TopBar } from '@/components/shell/TopBar'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
  return (
    <>
      <Authenticated>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#f9fafb',
          }}
        >
          <Sidebar />
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            <TopBar />
            <main
              style={{
                flex: 1,
                padding: '2rem',
                overflowY: 'auto',
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <RedirectToLogin />
      </Unauthenticated>
    </>
  )
}
