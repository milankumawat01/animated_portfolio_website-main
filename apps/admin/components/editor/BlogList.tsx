'use client'
/* eslint-disable @next/next/no-img-element -- Admin uses original media URLs for small previews. */
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { AdminModal } from './AdminModal'
import { BlogEditor } from './BlogEditor'
import { errorMessage } from '@/lib/errors'

const filters = ['All', 'Published', 'Draft', 'Scheduled', 'Archived'] as const
const PAGE_SIZE = 10
export function BlogList() {
  const posts = useQuery(api.blog.listAll) ?? []
  const setStatus = useMutation(api.blog.setStatus)
  const remove = useMutation(api.blog.remove)
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Id<'blogPosts'> | 'new' | null>(null)
  const [error, setError] = useState('')
  const filtered = posts.filter(p => (filter === 'All' || p.status === filter.toLowerCase()) && `${p.title} ${p.excerpt} ${p.tags.join(' ')} ${p.category ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const action = async (run: () => Promise<unknown>) => { try { setError(''); await run() } catch (err) { setError(errorMessage(err, 'Action failed')) } }
  return <div style={{ fontFamily: 'system-ui, sans-serif' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><h1>Blog</h1><p style={{ color: '#6b7280' }}>{posts.length} posts</p></div><button onClick={() => setEditing('new')} style={{ background: '#111827', color: '#fff', border: 0, borderRadius: 8, padding: '10px 16px' }}>+ New Blog</button></header>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>{filters.map(f => <button key={f} onClick={() => { setFilter(f); setPage(1) }} style={{ padding: '7px 12px', borderRadius: 20, border: '1px solid #d1d5db', background: f === filter ? '#111827' : '#fff', color: f === filter ? '#fff' : '#374151' }}>{f}</button>)}</div>
    <input aria-label="Search blogs" placeholder="Search blogs" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: 10, marginBottom: 20, width: 'min(100%,360px)' }} />
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    {rows.length ? <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}><thead><tr>{['Cover','Post','Category / Tags','Date','Read','Status','Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>{h}</th>)}</tr></thead><tbody>{rows.map(p => <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}><td style={{ padding: 12 }}>{p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: 70, height: 45, objectFit: 'cover', borderRadius: 5 }} /> : '—'}</td><td style={{ padding: 12 }}><strong>{p.title}</strong><div style={{ color: '#6b7280', fontSize: 12 }}>{p.excerpt.slice(0, 85)}</div></td><td style={{ padding: 12, fontSize: 12 }}>{p.category ?? '—'}<br />{p.tags.join(', ')}</td><td style={{ padding: 12 }}>{p.scheduledAt || p.publishedAt ? new Date(p.scheduledAt ?? p.publishedAt!).toLocaleDateString() : '—'}</td><td style={{ padding: 12 }}>{p.readTimeMinutes} min</td><td style={{ padding: 12 }}>{p.status}</td><td style={{ padding: 12, whiteSpace: 'nowrap' }}><button onClick={() => setEditing(p._id)}>Edit</button> {p.status === 'published' ? <a href={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev'}/blog/${p.slug}`} target="_blank" rel="noreferrer">Preview</a> : <button onClick={() => setEditing(p._id)}>Preview draft</button>} <button onClick={() => void action(() => setStatus({ id: p._id, status: p.status === 'archived' ? 'draft' : 'archived' }))}>{p.status === 'archived' ? 'Restore' : 'Archive'}</button> <button onClick={() => { if (confirm(`Delete ${p.title}?`)) void action(() => remove({ id: p._id })) }}>Delete</button></td></tr>)}</tbody></table></div> : <div style={{ padding: 40, textAlign: 'center', background: '#fff' }}>No blog posts match this view.</div>}
    {filtered.length > PAGE_SIZE && <nav aria-label="Blog pages" style={{ display: 'flex', gap: 8, marginTop: 18 }}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length / PAGE_SIZE)}</span><button disabled={page * PAGE_SIZE >= filtered.length} onClick={() => setPage(page + 1)}>Next</button></nav>}
    {editing && <AdminModal title={editing === 'new' ? 'New blog' : 'Edit blog'} onClose={() => setEditing(null)}><BlogEditor key={editing} post={editing === 'new' ? undefined : posts.find(p => p._id === editing)} onClose={() => setEditing(null)} /></AdminModal>}
  </div>
}
