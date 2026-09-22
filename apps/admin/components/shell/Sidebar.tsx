'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Projects', href: '/dashboard/projects' },
  { label: 'Blog', href: '/dashboard/blog' },
  { label: 'Leads', href: '/dashboard/leads' },
  { label: 'Media', href: '/dashboard/media' },
  { label: 'Experience', href: '/dashboard/experience' },
  { label: 'Skills', href: '/dashboard/skills' },
  { label: 'Settings', href: '/dashboard/settings' },
]

const sidebarStyle: React.CSSProperties = {
  width: '220px',
  minHeight: '100vh',
  borderRight: '1px solid #e5e7eb',
  background: '#fafafa',
  padding: '1.5rem 0',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
}

const logoStyle: React.CSSProperties = {
  padding: '0 1.25rem 1.25rem',
  fontWeight: 700,
  fontSize: '1.1rem',
  fontFamily: 'system-ui, sans-serif',
  color: '#111',
  borderBottom: '1px solid #e5e7eb',
  marginBottom: '0.75rem',
}

const navStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
}

function getLinkStyle(active: boolean): React.CSSProperties {
  return {
    display: 'block',
    padding: '0.5rem 1.25rem',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '0.9rem',
    textDecoration: 'none',
    borderRadius: '6px',
    margin: '0.125rem 0.5rem',
    background: active ? '#111' : 'transparent',
    color: active ? '#fff' : '#374151',
    fontWeight: active ? 600 : 400,
    transition: 'background 0.15s',
  }
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>Milan Admin</div>
      <ul style={navStyle}>
        {navItems.map(({ label, href }) => {
          // Exact match for /dashboard, prefix match for sub-routes
          const active =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)
          return (
            <li key={href}>
              <Link href={href} style={getLinkStyle(active)}>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
