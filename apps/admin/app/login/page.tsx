'use client'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 0.875rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  marginBottom: '0.875rem',
}

export default function LoginPage() {
  const { signIn } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()

  // 'signIn' normally; 'signUp' only the very first time, to create the admin account.
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, isLoading, router])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    form.set('flow', flow)
    try {
      await signIn('password', form)
    } catch {
      setError(
        flow === 'signIn'
          ? 'Invalid email or password.'
          : 'Could not create the account. Use the admin email and a password of 10+ characters.',
      )
    } finally {
      setSubmitting(false)
    }
  }

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
      <form
        onSubmit={onSubmit}
        style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '380px',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', textAlign: 'center' }}>
          Portfolio Admin
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 2rem', textAlign: 'center' }}>
          {flow === 'signIn' ? 'Sign in to manage your portfolio' : 'Create the admin account (one time)'}
        </p>

        <input name="email" type="email" placeholder="Email" autoComplete="email" required style={inputStyle} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete={flow === 'signIn' ? 'current-password' : 'new-password'}
          minLength={flow === 'signUp' ? 10 : undefined}
          required
          style={inputStyle}
        />

        {error && (
          <p role="alert" style={{ color: '#b91c1c', fontSize: '0.85rem', margin: '0 0 0.875rem' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            background: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: submitting ? 'wait' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Please wait…' : flow === 'signIn' ? 'Sign in' : 'Create account'}
        </button>

        <button
          type="button"
          onClick={() => {
            setFlow(flow === 'signIn' ? 'signUp' : 'signIn')
            setError(null)
          }}
          style={{
            width: '100%',
            marginTop: '1rem',
            background: 'none',
            border: 'none',
            color: '#6b7280',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          {flow === 'signIn' ? 'First time? Create the admin account' : 'Already set up? Sign in'}
        </button>
      </form>
    </div>
  )
}
