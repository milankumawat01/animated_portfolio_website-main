'use client'
import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { errorMessage } from '@/lib/errors'
import { AdminModal } from './AdminModal'
import { useFeedback } from '@/components/ui/Feedback'

type ExperienceDoc = {
  _id: Id<'experience'>
  company: string
  role: string
  employmentType?: string
  startDate?: string
  endDate?: string
  current?: boolean
  location?: string
  description?: string
  period: string
  timeframe: string
  badge: string
  logo: string
  logoBg: string
  points: string[]
  tags: string[]
  order: number
  visible: boolean
  updatedAt: number
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontFamily: 'system-ui, sans-serif',
  boxSizing: 'border-box',
  color: '#111827',
  background: '#fff',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.25rem',
  fontFamily: 'system-ui, sans-serif',
}

function ExperienceRow({ exp, onSaved, onMove, canMoveUp, canMoveDown }: { exp: ExperienceDoc; onSaved: () => void; onMove: (direction: -1 | 1) => void; canMoveUp: boolean; canMoveDown: boolean }) {
  const { confirm, toast } = useFeedback()
  const update = useMutation(api.experience.update)
  const remove = useMutation(api.experience.remove)

  const [expanded, setExpanded] = useState(false)
  const [company, setCompany] = useState(exp.company)
  const [role, setRole] = useState(exp.role)
  const [employmentType, setEmploymentType] = useState(exp.employmentType ?? '')
  const [startDate, setStartDate] = useState(exp.startDate ?? '')
  const [endDate, setEndDate] = useState(exp.endDate ?? '')
  const [current, setCurrent] = useState(exp.current ?? /present|current/i.test(exp.period))
  const [location, setLocation] = useState(exp.location ?? '')
  const [description, setDescription] = useState(exp.description ?? '')
  const [period] = useState(exp.period)
  const [timeframe] = useState(exp.timeframe)
  const [logo] = useState(exp.logo)
  const [logoBg] = useState(exp.logoBg)
  const [points, setPoints] = useState<string[]>(exp.points)
  const [tags, setTags] = useState(exp.tags.join(', '))
  const [visible, setVisible] = useState(exp.visible)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (startDate && !current && endDate && endDate < startDate) throw new Error('End date must be after start date.')
      const format = (value: string) => new Date(`${value}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
      const displayPeriod = startDate ? `${format(startDate)} – ${current ? 'Present' : endDate ? format(endDate) : 'Present'}` : period
      const displayTimeframe = startDate ? `${startDate.slice(0,4)} – ${current ? 'Present' : endDate.slice(0,4) || 'Present'}` : timeframe
      await update({
        id: exp._id,
        company,
        role,
        employmentType,
        startDate,
        endDate: current ? undefined : endDate,
        current,
        location,
        description,
        period: displayPeriod,
        timeframe: displayTimeframe,
        badge: current ? 'Current' : '',
        logo,
        logoBg,
        points: points.filter(Boolean),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        visible,
      })
      onSaved()
      toast('Experience saved')
      setExpanded(false)
    } catch (err: unknown) {
      setError(errorMessage(err, 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  const addPoint = () => setPoints([...points, ''])
  const updatePoint = (i: number, v: string) => {
    const next = [...points]
    next[i] = v
    setPoints(next)
  }
  const removePoint = (i: number) => setPoints(points.filter((_, idx) => idx !== i))
  const movePoint = (i: number, dir: -1 | 1) => {
    const next = [...points]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setPoints(next)
  }

  return (
    <div className="content-entry"
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        overflow: 'hidden',
        opacity: visible ? 1 : 0.6,
      }}
    >
      {/* Summary row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          gap: '1rem',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setExpanded(!expanded) } }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
            {company}
            {current && (
              <span
                style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.7rem',
                  padding: '0.125rem 0.5rem',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  borderRadius: '9999px',
                  fontWeight: 600,
                }}
              >
                Current
              </span>
            )}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
            {role} · {period}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          <button type="button" disabled={!canMoveUp} onClick={e => { e.stopPropagation(); onMove(-1) }} aria-label={`Move ${company} up`}>↑</button>
          <button type="button" disabled={!canMoveDown} onClick={e => { e.stopPropagation(); onMove(1) }} aria-label={`Move ${company} down`}>↓</button>
          {!visible && (
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>hidden</span>
          )}
          <span style={{ color: '#9ca3af', fontSize: '1rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <AdminModal title="Edit experience" onClose={() => setExpanded(false)}>
        <div
          style={{
            padding: '1.25rem',
            borderTop: '1px solid #f3f4f6',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.875rem',
          }}
        >
          {error && (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '0.625rem 1rem',
                background: '#fff5f5',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '0.82rem',
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Company *</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Role *</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} style={fieldStyle} />
          </div>
          <div><label style={labelStyle}>Employment type</label><input value={employmentType} onChange={e => setEmploymentType(e.target.value)} style={fieldStyle} placeholder="Full-time" /></div>
          <div><label style={labelStyle}>Location</label><input value={location} onChange={e => setLocation(e.target.value)} style={fieldStyle} /></div>
          <div><label style={labelStyle}>Start date</label><input type="month" value={startDate} onChange={e => setStartDate(e.target.value)} style={fieldStyle} /></div>
          <div><label style={labelStyle}>End date</label><input type="month" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={current} style={fieldStyle} /></div>
          <div><label><input type="checkbox" checked={current} onChange={e => setCurrent(e.target.checked)} /> Currently working</label></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={fieldStyle} /></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={fieldStyle}
              placeholder="Python, FastAPI, AI"
            />
          </div>

          {/* Points */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Points</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {points.map((pt, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    value={pt}
                    onChange={(e) => updatePoint(i, e.target.value)}
                    style={{ ...fieldStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => movePoint(i, -1)}
                    disabled={i === 0}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => movePoint(i, 1)}
                    disabled={i === points.length - 1}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removePoint(i)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '4px', color: '#dc2626' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPoint}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  alignSelf: 'flex-start',
                }}
              >
                + Add Point
              </button>
            </div>
          </div>

          {/* Visible toggle */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id={`visible-${exp._id}`}
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor={`visible-${exp._id}`} style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>
              Visible on public site
            </label>
          </div>

          {/* Actions */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              style={{
                padding: '0.625rem 1.5rem',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => void (async () => { if (await confirm({ title: 'Delete experience?', description: `Permanently delete the experience at ${company}?`, confirmLabel: 'Delete', danger: true })) { await remove({ id: exp._id }); toast('Experience deleted') } })()}
              style={{
                padding: '0.625rem 1.5rem',
                background: '#fff5f5',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Delete
            </button>
          </div>
        </div>
        </AdminModal>
      )}
    </div>
  )
}

export function ExperienceEditor() {
  const experienceQuery = useQuery(api.experience.listAll)
  const items = (experienceQuery ?? []) as ExperienceDoc[]
  const { toast } = useFeedback()
  const migrateDates = useMutation(api.experience.migrateDates)
  useEffect(() => { if (localStorage.getItem('milan-experience-dates-v1')) return; void migrateDates({}).then(() => localStorage.setItem('milan-experience-dates-v1','done')).catch(() => {}) }, [migrateDates])
  const create = useMutation(api.experience.create)
  const reorder = useMutation(api.experience.reorder)
  const [creating, setCreating] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  useEffect(() => { if (!new URLSearchParams(window.location.search).has('new')) return; const timer = window.setTimeout(() => setNewOpen(true), 0); return () => window.clearTimeout(timer) }, [])
  const [newItem, setNewItem] = useState({ company: '', role: '', employmentType: '', startDate: '', endDate: '', current: false, location: '', description: '', technologies: '' })
  const [createError, setCreateError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = async () => {
    setCreating(true)
    try {
      if (!newItem.company.trim() || !newItem.role.trim() || !newItem.startDate) throw new Error('Company, role and start date are required.')
      if (!newItem.current && newItem.endDate && newItem.endDate < newItem.startDate) throw new Error('End date must be after start date.')
      const format = (value: string) => new Date(`${value}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
      const period = `${format(newItem.startDate)} – ${newItem.current ? 'Present' : newItem.endDate ? format(newItem.endDate) : 'Present'}`
      await create({
        company: newItem.company.trim(),
        role: newItem.role.trim(),
        employmentType: newItem.employmentType,
        startDate: newItem.startDate,
        endDate: newItem.current ? undefined : newItem.endDate,
        current: newItem.current,
        location: newItem.location,
        description: newItem.description,
        period,
        timeframe: `${newItem.startDate.slice(0,4)} – ${newItem.current ? 'Present' : newItem.endDate.slice(0,4) || 'Present'}`,
        badge: newItem.current ? 'Current' : '',
        logo: newItem.company.trim().slice(0, 2).toUpperCase(),
        logoBg: 'bg-slate-900 text-white',
        points: [],
        tags: newItem.technologies.split(',').map(s => s.trim()).filter(Boolean),
        order: (items.length + 1) * 10,
        visible: true,
      })
      toast('Experience added')
      setRefreshKey((k) => k + 1)
      setNewOpen(false)
      setNewItem({ company: '', role: '', employmentType: '', startDate: '', endDate: '', current: false, location: '', description: '', technologies: '' })
      setCreateError('')
    } catch (err) {
      setCreateError(errorMessage(err, 'Create failed'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="cms-page-head"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ margin: 0 }}>
          Experience
        </h1>
        <button
          onClick={() => setNewOpen(true)}
          disabled={creating}
          style={{
            padding: '0.625rem 1.25rem',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: creating ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          + Add Experience
        </button>
      </div>

      {newOpen && <AdminModal title="Add experience" onClose={() => setNewOpen(false)}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 12 }}>
        <label>Company<input required value={newItem.company} onChange={e => setNewItem({ ...newItem, company: e.target.value })} style={fieldStyle} /></label>
        <label>Role<input required value={newItem.role} onChange={e => setNewItem({ ...newItem, role: e.target.value })} style={fieldStyle} /></label>
        <label>Employment type<input value={newItem.employmentType} onChange={e => setNewItem({ ...newItem, employmentType: e.target.value })} style={fieldStyle} /></label>
        <label>Location<input value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} style={fieldStyle} /></label>
        <label>Start date<input type="month" required value={newItem.startDate} onChange={e => setNewItem({ ...newItem, startDate: e.target.value })} style={fieldStyle} /></label>
        <label>End date<input type="month" disabled={newItem.current} value={newItem.endDate} onChange={e => setNewItem({ ...newItem, endDate: e.target.value })} style={fieldStyle} /></label>
        <label><input type="checkbox" checked={newItem.current} onChange={e => setNewItem({ ...newItem, current: e.target.checked })} /> Currently working</label>
        <label style={{ gridColumn: '1 / -1' }}>Description<textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} style={fieldStyle} /></label>
        <label style={{ gridColumn: '1 / -1' }}>Technologies (comma separated)<input value={newItem.technologies} onChange={e => setNewItem({ ...newItem, technologies: e.target.value })} style={fieldStyle} /></label>
      </div>{createError && <p role="alert" style={{ color: '#b91c1c' }}>{createError}</p>}<div style={{ marginTop: 16, display: 'flex', gap: 10 }}><button disabled={creating} onClick={() => void handleCreate()}>Save experience</button><button onClick={() => setNewOpen(false)}>Cancel</button></div></AdminModal>}

      <div key={refreshKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {experienceQuery === undefined ? <div className="skeleton" style={{height:210}}/> : items.length === 0 ? (
          <div className="cms-empty"><span>▣</span><strong>No experience added</strong><p>Add roles and projects from your career journey.</p><button onClick={()=>setNewOpen(true)}>+ Add Experience</button></div>
        ) : (
          items
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((exp, index, sorted) => (
              <ExperienceRow
                key={exp._id}
                exp={exp}
                onSaved={() => setRefreshKey((k) => k + 1)}
                canMoveUp={index > 0}
                canMoveDown={index < sorted.length - 1}
                onMove={direction => { const ids = sorted.map(item => item._id); const other = index + direction; [ids[index], ids[other]] = [ids[other], ids[index]]; void reorder({ ids }) }}
              />
            ))
        )}
      </div>
    </div>
  )
}
