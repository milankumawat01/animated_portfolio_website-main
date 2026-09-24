'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthActions } from '@convex-dev/auth/react'
import { useEffect } from 'react'
import { Icon, type IconName } from './icons'

const groups: { label?: string; items: { label: string; href: string; icon: IconName }[] }[] = [
  { items: [{ label: 'Dashboard', href: '/dashboard', icon: 'dashboard' }] },
  { label: 'Content', items: [
    { label: 'Projects', href: '/dashboard/projects', icon: 'projects' },
    { label: 'Blog', href: '/dashboard/blog', icon: 'blog' },
    { label: 'Experience', href: '/dashboard/experience', icon: 'experience' },
    { label: 'Skills', href: '/dashboard/skills', icon: 'skills' },
    { label: 'Media', href: '/dashboard/media', icon: 'media' },
  ] },
  { label: 'CRM', items: [{ label: 'Leads', href: '/dashboard/leads', icon: 'leads' }] },
]
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { signOut } = useAuthActions()
  useEffect(() => { onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  return <>
    {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`admin-sidebar${open ? ' is-open' : ''}`} aria-label="Admin navigation">
      <div className="sidebar-brand"><span className="brand-avatar">MK</span><span><strong>Milan Admin</strong><small>Portfolio CMS</small></span></div>
      <nav className="sidebar-nav">{groups.map((group, index) => <div className="nav-group" key={index}>
        {group.label && <span className="nav-heading">{group.label}</span>}
        {group.items.map(item => { const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`nav-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}><Icon name={item.icon} /><span>{item.label}</span></Link> })}
      </div>)}</nav>
      <div className="sidebar-bottom"><span className="nav-heading">System</span><Link href="/dashboard/settings" className={`nav-link${pathname === '/dashboard/settings' ? ' active' : ''}`}><Icon name="settings" />Settings</Link><button className="nav-link" onClick={() => void signOut()}><Icon name="logout" />Sign out</button></div>
    </aside>
  </>
}
