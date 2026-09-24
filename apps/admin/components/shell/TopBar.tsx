'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import { useAuthActions } from '@convex-dev/auth/react'
import { Icon } from './icons'

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuthActions()
  const projects = useQuery(api.projects.listAll)
  const posts = useQuery(api.blog.listAll)
  const leads = useQuery(api.leads.list, {})
  const media = useQuery(api.media.list)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { const key = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); input.current?.focus() } if (event.key === 'Escape') { input.current?.blur(); setFocused(false); setAccountOpen(false) } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [])
  const term = query.trim().toLowerCase()
  const results = term ? [
    ...(projects ?? []).filter(x => x.title.toLowerCase().includes(term)).slice(0, 4).map(x => ({ label: x.title, type: 'Project', href: `/dashboard/projects/${x._id}` })),
    ...(posts ?? []).filter(x => x.title.toLowerCase().includes(term)).slice(0, 4).map(x => ({ label: x.title, type: 'Post', href: `/dashboard/blog/${x._id}` })),
    ...(leads ?? []).filter(x => `${x.name} ${x.email}`.toLowerCase().includes(term)).slice(0, 4).map(x => ({ label: x.name, type: 'Lead', href: `/dashboard/leads/${x._id}` })),
    ...(media ?? []).filter(x => x.filename.toLowerCase().includes(term)).slice(0, 4).map(x => ({ label: x.filename, type: 'Media', href: '/dashboard/media' })),
  ].slice(0, 8) : []
  const page = pathname.split('/')[2] ?? 'dashboard'
  return <header className="admin-topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={onMenu}><Icon name="menu" /></button>
    <div className="global-search" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false) }}><Icon name="search" /><input ref={input} aria-label="Search projects, posts and leads" placeholder="Search projects, posts, leads..." value={query} onFocus={() => setFocused(true)} onChange={e => setQuery(e.target.value)} /><kbd>Ctrl K</kbd>{focused && term && <div className="search-results">{results.length ? results.map(item => <button key={item.href} onMouseDown={e => e.preventDefault()} onClick={() => { router.push(item.href); setQuery(''); setFocused(false) }}><span>{item.label}</span><small>{item.type}</small></button>) : <p>No results for “{query}”</p>}</div>}</div>
    <div className="topbar-actions"><span className="topbar-page">{page.replace('-', ' ')}</span><button className="icon-button notification-button" aria-label="View leads" onClick={() => router.push('/dashboard/leads')}><Icon name="bell" />{(leads ?? []).some(x => x.status === 'new') && <i />}</button><div className="account-wrap"><button className="account-button" aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)}><span className="account-avatar">MK</span><span className="account-name"><strong>Milan Kumawat</strong><small>Admin</small></span><Icon name="chevron" size={14} /></button>{accountOpen && <div className="account-menu"><button onClick={() => { router.push('/dashboard/settings'); setAccountOpen(false) }}>Account settings</button><button onClick={() => void signOut()}>Sign out</button></div>}</div></div>
  </header>
}
