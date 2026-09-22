'use client'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { signIn } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, isLoading, router])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          textAlign: 'center',
          minWidth: '320px',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
            margin: '0 0 0.5rem',
          }}
        >
          Portfolio Admin
        </h1>
        <p
          style={{
            color: '#6b7280',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            margin: '0 0 2rem',
          }}
        >
          Sign in to manage your portfolio
        </p>
        <button
          onClick={() => void signIn('github', { redirectTo: '/dashboard' })}
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            background: '#24292e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxSizing: 'border-box',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Sign in with GitHub
        </button>
      </div>
    </div>
  )
}
