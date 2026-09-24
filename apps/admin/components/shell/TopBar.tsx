'use client'


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

export function TopBar() {
  return (
    <header style={topBarStyle}>
      <span style={titleStyle}>Milan Admin</span>
    </header>
  )
}
