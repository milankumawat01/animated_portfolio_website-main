'use client'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'

export default function SettingsPage() {
  const { signOut } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  return <div className="settings-page"><header><h1>Settings</h1><p>Account and access for Milan Admin.</p></header><section className="settings-card"><div className="settings-profile"><span className="account-avatar">MK</span><div><strong>Milan Kumawat</strong><small>Portfolio administrator</small></div></div><div className="settings-row"><span>Session</span><strong>{isLoading ? 'Checking…' : isAuthenticated ? 'Signed in' : 'Signed out'}</strong></div><div className="settings-row"><span>Portfolio content</span><small>Managed on the Content pages</small></div><button onClick={() => void signOut()}>Sign out</button></section></div>
}
