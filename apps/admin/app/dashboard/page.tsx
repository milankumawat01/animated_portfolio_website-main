'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'

const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }
const links = [
  ['+ New Project', '/dashboard/projects/new'],
  ['+ New Blog', '/dashboard/blog/new'],
  ['+ Add Experience', '/dashboard/experience?new=1'],
  ['+ Add Skill', '/dashboard/skills?new=1'],
]

export default function DashboardPage() {
  const projects = useQuery(api.projects.listAll) ?? []
  const posts = useQuery(api.blog.listAll) ?? []
  const experience = useQuery(api.experience.listAll) ?? []
  const leads = useQuery(api.leads.list, {}) ?? []
  const leadEvents = useQuery(api.leads.recentEvents) ?? []
  const stats = [
    ['Total Projects', projects.length],
    ['Published Blogs', posts.filter(p => p.status === 'published').length],
    ['Current Experience', experience.filter(e => e.visible && (e.current || /present|current/i.test(e.period))).length],
    ['Total Leads', leads.length],
  ] as const
  const leadStates = ['new', 'contacted', 'in_discussion', 'converted'] as const
  const activity = [
    ...projects.map(p => ({ id: p._id, label: `Project updated: ${p.title}`, at: p.updatedAt })),
    ...posts.map(p => ({ id: p._id, label: `Blog updated: ${p.title}`, at: p.updatedAt })),
    ...leads.map(l => ({ id: l._id, label: `Lead received: ${l.name}`, at: l.createdAt })),
    ...leadEvents.filter(e => e.kind !== 'created').map(e => ({ id: e._id, label: `Lead ${e.kind}: ${e.text.slice(0, 70)}`, at: e.createdAt })),
  ].sort((a, b) => b.at - a.at).slice(0, 6)
  return <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111827', display: 'grid', gap: 24 }}>
    <header><h1 style={{ margin: 0 }}>Dashboard</h1><p style={{ color: '#6b7280' }}>Portfolio content and enquiries at a glance.</p></header>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
      {stats.map(([label, count]) => <div key={label} style={card}><strong style={{ fontSize: 30 }}>{count}</strong><div style={{ color: '#6b7280', marginTop: 6 }}>{label}</div></div>)}
    </div>
    <section style={card}><h2 style={{ marginTop: 0, fontSize: 18 }}>Quick actions</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{links.map(([label, href]) => <Link key={href} href={href} style={{ background: '#111827', color: '#fff', padding: '9px 14px', borderRadius: 8, textDecoration: 'none' }}>{label}</Link>)}</div></section>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
      <section style={card}><h2 style={{ marginTop: 0, fontSize: 18 }}>Recent projects</h2>{[...projects].sort((a,b) => b.updatedAt-a.updatedAt).slice(0,5).map(p => <p key={p._id}><Link href={`/dashboard/projects/${p._id}`}>{p.title}</Link> · {p.status}</p>)}{!projects.length && <p>No projects yet.</p>}</section>
      <section style={card}><h2 style={{ marginTop: 0, fontSize: 18 }}>Recent blogs</h2>{[...posts].sort((a,b) => b.updatedAt-a.updatedAt).slice(0,5).map(p => <p key={p._id}><Link href={`/dashboard/blog/${p._id}`}>{p.title}</Link> · {p.status}</p>)}{!posts.length && <p>No posts yet.</p>}</section>
      <section style={card}><h2 style={{ marginTop: 0, fontSize: 18 }}>Recent leads</h2>{leads.slice(0,5).map(l => <p key={l._id}><Link href={`/dashboard/leads/${l._id}`}>{l.name}</Link> · {l.status}</p>)}{!leads.length && <p>No leads yet.</p>}<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{leadStates.map(s => <span key={s} style={{ background: '#f3f4f6', borderRadius: 20, padding: '5px 9px', fontSize: 12 }}>{s.replace('_',' ')}: {leads.filter(l => l.status === s).length}</span>)}</div></section>
    </div>
    <section style={card}><h2 style={{ marginTop: 0, fontSize: 18 }}>Recent activity</h2>{activity.map(a => <p key={a.id} style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>{a.label}<small style={{ float: 'right', color: '#6b7280' }}>{new Date(a.at).toLocaleDateString()}</small></p>)}{!activity.length && <p>No activity yet.</p>}</section>
  </div>
}
