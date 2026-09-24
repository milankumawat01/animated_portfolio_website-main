'use client'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'

export default function LoginPage() {
  const { signIn } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => { if (!isLoading && isAuthenticated) router.replace('/dashboard') }, [isAuthenticated, isLoading, router])
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setSubmitting(true)
    const form = new FormData(e.currentTarget); form.set('flow', flow)
    try { await signIn('password', form) } catch { setError(flow === 'signIn' ? 'Invalid email or password.' : 'Could not create the account. Use the admin email and a password of 10+ characters.') } finally { setSubmitting(false) }
  }
  return <div className="login-page"><div className="login-art"><div className="login-brand"><span>⌘</span><span><strong>MILAN KUMAWAT</strong><small>Portfolio Admin</small></span></div><div className="login-art-copy"><h1>Manage your portfolio with <em>ease.</em></h1><p>Update projects, write articles, and keep your best work in view.</p></div><div className="login-art-caption">Built for the work behind the work.</div></div><div className="login-form-side"><form className="login-card" onSubmit={onSubmit}><div className="login-mark">⌘</div><h2>Portfolio <span>Admin</span></h2><p className="login-subtitle">{flow === 'signIn' ? 'Sign in to manage your portfolio' : 'Create the admin account'}</p><label htmlFor="login-email">Email</label><input id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required/><label htmlFor="login-password">Password</label><div className="password-field"><input id="login-password" name="password" type={visible ? 'text' : 'password'} placeholder="Enter your password" autoComplete={flow === 'signIn' ? 'current-password' : 'new-password'} minLength={flow === 'signUp' ? 10 : undefined} required/><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</button></div>{error && <p className="login-error" role="alert">{error}</p>}<button className="login-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : flow === 'signIn' ? 'Sign in →' : 'Create account →'}</button><div className="login-divider"><span>ADMIN ACCESS</span></div><button className="login-switch" type="button" onClick={() => { setFlow(flow === 'signIn' ? 'signUp' : 'signIn'); setError(null) }}>{flow === 'signIn' ? 'First time? Create the admin account' : 'Already set up? Sign in'}</button></form></div></div>
}
