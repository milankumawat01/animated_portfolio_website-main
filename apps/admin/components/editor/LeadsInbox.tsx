'use client'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { AdminModal } from './AdminModal'
import { errorMessage } from '@/lib/errors'

type LeadStatus = 'new' | 'contacted' | 'in_discussion' | 'converted' | 'closed'
const statuses: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' },
  { value: 'in_discussion', label: 'In Discussion' }, { value: 'converted', label: 'Converted' }, { value: 'closed', label: 'Closed' },
]
const normalized = (status: string): LeadStatus => status === 'replied' ? 'contacted' : status === 'archived' ? 'closed' : status === 'read' ? 'new' : status as LeadStatus
const pageSize = 12

export function LeadDetailsModal({ id, onClose }: { id: Id<'leads'>; onClose: () => void }) {
  const lead = useQuery(api.leads.get, { id })
  const events = useQuery(api.leads.events, { id }) ?? []
  const setStatus = useMutation(api.leads.setStatus)
  const addNote = useMutation(api.leads.addNote)
  const remove = useMutation(api.leads.remove)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  if (!lead) return <AdminModal title="Lead details" onClose={onClose}><p>Loading lead…</p></AdminModal>
  const act = async (run: () => Promise<unknown>) => { try { setError(''); await run() } catch (err) { setError(errorMessage(err, 'Action failed')) } }
  const activity = events.length ? events : [
    ...(lead.notes ? [{ _id: 'legacy-note', kind: 'note' as const, text: lead.notes, author: 'Imported', createdAt: lead.createdAt }] : []),
    { _id: 'legacy-created', kind: 'created' as const, text: 'Lead received', author: 'Website', createdAt: lead.createdAt },
  ]
  return <AdminModal title={`Lead · ${lead.name}`} onClose={onClose}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}><a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.subject ?? 'Your enquiry'}`)}`}>Email {lead.email}</a>{lead.phone && <a href={`tel:${lead.phone}`}>Call {lead.phone}</a>}</div>
    <dl style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 8 }}><dt>Name</dt><dd>{lead.name}</dd><dt>Email</dt><dd>{lead.email}</dd><dt>Phone</dt><dd>{lead.phone ?? '—'}</dd><dt>Company</dt><dd>{lead.company ?? '—'}</dd><dt>Subject</dt><dd>{lead.subject ?? '—'}</dd><dt>Source</dt><dd>{lead.source}</dd><dt>Created</dt><dd>{new Date(lead.createdAt).toLocaleString()}</dd><dt>Last contact</dt><dd>{lead.lastContactAt ? new Date(lead.lastContactAt).toLocaleString() : '—'}</dd></dl>
    <section style={{ background: '#f9fafb', borderRadius: 10, padding: 16, whiteSpace: 'pre-wrap' }}><h3>Message</h3>{lead.message}</section>
    <section><h3>Status</h3><select aria-label="Lead status" value={normalized(lead.status)} onChange={e => void act(() => setStatus({ id, status: e.target.value as LeadStatus }))} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }}>{statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></section>
    <section><h3>Notes</h3>{activity.filter(e => e.kind === 'note').map(e => <div key={e._id} style={{ borderLeft: '3px solid #4f46e5', padding: '8px 14px', marginBottom: 8, background: '#f9fafb' }}><p style={{ whiteSpace: 'pre-wrap' }}>{e.text}</p><small>{e.author} · {new Date(e.createdAt).toLocaleString()}</small></div>)}<textarea aria-label="New note" value={note} onChange={e => setNote(e.target.value)} rows={3} style={{ width: '100%', boxSizing: 'border-box' }} /><button disabled={!note.trim()} onClick={() => void act(async () => { await addNote({ id, text: note }); setNote('') })}>+ Add Note</button></section>
    <section><h3>Activity</h3><ol style={{ paddingLeft: 20 }}>{activity.map(e => <li key={e._id} style={{ marginBottom: 10 }}><strong>{e.kind === 'note' ? 'Note added' : e.text}</strong><div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(e.createdAt).toLocaleString()} · {e.author}</div></li>)}</ol></section>
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    <button style={{ color: '#b91c1c' }} onClick={() => { if (confirm(`Permanently delete ${lead.name}'s lead?`)) void act(async () => { await remove({ id }); onClose() }) }}>Delete lead</button>
  </AdminModal>
}

export function LeadsList() {
  const leads = useQuery(api.leads.list, {}) ?? []
  const migrateLegacy = useMutation(api.leads.migrateLegacy)
  useEffect(() => {
    if (localStorage.getItem('milan-lead-migration-v1')) return
    void migrateLegacy({}).then(() => localStorage.setItem('milan-lead-migration-v1', 'done')).catch(() => {})
  }, [migrateLegacy])
  const [selected, setSelected] = useState<Id<'leads'> | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const filtered = leads.filter(lead => (filter === 'all' || normalized(lead.status) === filter) && `${lead.name} ${lead.email} ${lead.subject ?? ''} ${lead.company ?? ''} ${lead.message}`.toLowerCase().includes(search.toLowerCase()))
  return <div style={{ fontFamily: 'system-ui, sans-serif' }}><header><h1>Leads</h1><p style={{ color: '#6b7280' }}>{leads.length} enquiries</p></header>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>{statuses.map(s => <div key={s.value} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, minWidth: 100 }}><strong>{leads.filter(l => normalized(l.status) === s.value).length}</strong><div style={{ fontSize: 12 }}>{s.label}</div></div>)}</div>
    <input aria-label="Search leads" placeholder="Search leads" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ padding: 10, border: '1px solid #d1d5db', borderRadius: 8, marginRight: 10 }} /><select aria-label="Filter leads" value={filter} onChange={e => { setFilter(e.target.value as LeadStatus | 'all'); setPage(1) }} style={{ padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }}><option value="all">All</option>{statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
    {filtered.length ? <div style={{ overflowX: 'auto', marginTop: 18, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 850 }}><thead><tr>{['Name','Email','Subject','Source','Status','Created','Last contact','Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>{h}</th>)}</tr></thead><tbody>{filtered.slice((page - 1) * pageSize, page * pageSize).map(l => <tr key={l._id} style={{ borderBottom: '1px solid #f3f4f6' }}><td style={{ padding: 12 }}>{l.name}</td><td style={{ padding: 12 }}>{l.email}</td><td style={{ padding: 12 }}>{l.subject ?? '—'}</td><td style={{ padding: 12 }}>{l.source}</td><td style={{ padding: 12 }}>{normalized(l.status).replace('_', ' ')}</td><td style={{ padding: 12 }}>{new Date(l.createdAt).toLocaleDateString()}</td><td style={{ padding: 12 }}>{l.lastContactAt ? new Date(l.lastContactAt).toLocaleDateString() : '—'}</td><td style={{ padding: 12 }}><button onClick={() => setSelected(l._id)}>Open</button></td></tr>)}</tbody></table></div> : <div style={{ padding: 40, marginTop: 18, textAlign: 'center', background: '#fff' }}>No leads match this view.</div>}
    {filtered.length > pageSize && <nav aria-label="Lead pages" style={{ display: 'flex', gap: 8, marginTop: 18 }}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length / pageSize)}</span><button disabled={page * pageSize >= filtered.length} onClick={() => setPage(page + 1)}>Next</button></nav>}
    {selected && <LeadDetailsModal id={selected} onClose={() => setSelected(null)} />}
  </div>
}

export function LeadDetail({ id }: { id: Id<'leads'> }) {
  const router = useRouter()
  return <LeadDetailsModal id={id} onClose={() => router.push('/dashboard/leads')} />
}
