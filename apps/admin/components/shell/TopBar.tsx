'use client'

import { useAuthActions } from '@convex-dev/auth/react'

const topBarStyle: React.CSSProperties = {
  height: '56px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 1.5rem',
  background: '#fff',
  flexShrink: 0,
}

const titleStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: '1rem',
  fontFamily: 'system-ui, sans-serif',
  color: '#111',
}

const rightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  fontFamily: 'system-ui, sans-serif',
}

const signOutBtnStyle: React.CSSProperties = {
  padding: '0.375rem 1rem',
  background: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  color: '#374151',
}

export function TopBar() {
  const { signOut } = useAuthActions()

  return (
    <header style={topBarStyle}>
      <span style={titleStyle}>Admin Panel</span>
      <div style={rightStyle}>
        <button
          style={signOutBtnStyle}
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
