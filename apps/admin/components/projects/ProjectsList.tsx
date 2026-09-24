'use client'
/* eslint-disable @next/next/no-img-element -- Admin thumbnails display original portfolio assets. */
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { AdminModal } from '@/components/editor/AdminModal'
import { ProjectEditor } from './ProjectEditor'
import { errorMessage } from '@/lib/errors'

const PAGE_SIZE = 9
const filters = ['All', 'Published', 'Draft', 'Featured', 'Archived'] as const
export function ProjectsList() {
  const projects = useQuery(api.projects.listAll) ?? []
  const setStatus = useMutation(api.projects.setStatus)
  const duplicate = useMutation(api.projects.duplicate)
  const remove = useMutation(api.projects.remove)
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Id<'projects'> | 'new' | null>(null)
  const [error, setError] = useState('')
  const filtered = projects.filter(p => (filter === 'All' || (filter === 'Featured' ? p.featured : p.status === filter.toLowerCase())) && `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const action = async (run: () => Promise<unknown>) => { try { setError(''); await run() } catch (err) { setError(errorMessage(err, 'Action failed')) } }
  return <div style={{ fontFamily: 'system-ui, sans-serif' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}><div><h1>Projects</h1><p style={{ color: '#6b7280' }}>{projects.length} projects</p></div><button onClick={() => setEditing('new')} style={{ padding: '10px 16px', background: '#111827', color: '#fff', border: 0, borderRadius: 8 }}>+ New Project</button></header>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>{filters.map(f => <button key={f} onClick={() => { setFilter(f); setPage(1) }} style={{ border: '1px solid #d1d5db', background: f === filter ? '#111827' : '#fff', color: f === filter ? '#fff' : '#374151', padding: '7px 12px', borderRadius: 20 }}>{f}</button>)}</div>
    <input aria-label="Search projects" placeholder="Search projects" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ padding: 10, width: 'min(100%,360px)', border: '1px solid #d1d5db', borderRadius: 8, marginBottom: 20 }} />
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    {rows.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>{rows.map(p => <article key={p._id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      {p.imageUrl ? <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} /> : <div style={{ height: 160, background: '#f3f4f6', display: 'grid', placeItems: 'center', color: '#9ca3af' }}>No cover</div>}
      <div style={{ padding: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{p.title}</strong><small>{p.status}{p.featured ? ' · Featured' : ''}</small></div><p style={{ color: '#6b7280', minHeight: 42 }}>{p.description}</p><small>{p.tags.slice(0,4).join(' · ')}</small><p style={{ fontSize: 12, color: '#6b7280' }}>{new Date(p.updatedAt).toLocaleDateString()}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><button onClick={() => setEditing(p._id)}>Edit</button>{p.status === 'published' ? <a href={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev'}/projects/${p.slug}`} target="_blank" rel="noreferrer">Preview</a> : <button onClick={() => setEditing(p._id)}>Preview draft</button>}<button onClick={() => void action(() => duplicate({ id: p._id }))}>Duplicate</button><button onClick={() => void action(() => setStatus({ id: p._id, status: p.status === 'published' ? 'draft' : 'published' }))}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button><button onClick={() => void action(() => setStatus({ id: p._id, status: p.status === 'archived' ? 'draft' : 'archived' }))}>{p.status === 'archived' ? 'Restore' : 'Archive'}</button><button onClick={() => { if (confirm(`Delete ${p.title}?`)) void action(() => remove({ id: p._id })) }}>Delete</button></div>
      </div>
    </article>)}</div> : <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 12 }}>No projects match this view.</div>}
    {filtered.length > PAGE_SIZE && <nav aria-label="Project pages" style={{ display: 'flex', gap: 8, marginTop: 18 }}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length / PAGE_SIZE)}</span><button disabled={page * PAGE_SIZE >= filtered.length} onClick={() => setPage(page + 1)}>Next</button></nav>}
    {editing && <AdminModal title={editing === 'new' ? 'New project' : 'Edit project'} onClose={() => setEditing(null)}><ProjectEditor key={editing} project={editing === 'new' ? undefined : projects.find(p => p._id === editing)} onClose={() => setEditing(null)} /></AdminModal>}
  </div>
}
