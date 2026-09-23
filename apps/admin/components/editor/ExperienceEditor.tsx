'use client'
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'

type ExperienceDoc = {
  _id: Id<'experience'>
  company: string
  role: string
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

const LOGOBG_SUGGESTIONS = [
  'bg-slate-900 text-white',
  'bg-blue-600 text-white',
  'bg-purple-600 text-white',
  'bg-green-700 text-white',
  'bg-orange-500 text-white',
  'bg-red-700 text-white',
]

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

function ExperienceRow({ exp, onSaved }: { exp: ExperienceDoc; onSaved: () => void }) {
  const update = useMutation(api.experience.update)
  const remove = useMutation(api.experience.remove)

  const [expanded, setExpanded] = useState(false)
  const [company, setCompany] = useState(exp.company)
  const [role, setRole] = useState(exp.role)
  const [period, setPeriod] = useState(exp.period)
  const [timeframe, setTimeframe] = useState(exp.timeframe)
  const [badge, setBadge] = useState(exp.badge)
  const [logo, setLogo] = useState(exp.logo)
  const [logoBg, setLogoBg] = useState(exp.logoBg)
  const [points, setPoints] = useState<string[]>(exp.points)
  const [tags, setTags] = useState(exp.tags.join(', '))
  const [visible, setVisible] = useState(exp.visible)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await update({
        id: exp._id,
        company,
        role,
        period,
        timeframe,
        badge,
        logo,
        logoBg,
        points: points.filter(Boolean),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        visible,
      })
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
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
    <div
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
            {badge && (
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
                {badge}
              </span>
            )}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
            {role} · {period}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          {!visible && (
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>hidden</span>
          )}
          <span style={{ color: '#9ca3af', fontSize: '1rem' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
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
          <div>
            <label style={labelStyle}>
              Period (display string — kept verbatim)
            </label>
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={fieldStyle}
              placeholder="May 2025 – Present"
            />
          </div>
          <div>
            <label style={labelStyle}>Timeframe</label>
            <input
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={fieldStyle}
              placeholder="2025 – Present"
            />
          </div>
          <div>
            <label style={labelStyle}>Badge (short label)</label>
            <input value={badge} onChange={(e) => setBadge(e.target.value)} style={fieldStyle} placeholder="Current" />
          </div>
          <div>
            <label style={labelStyle}>Logo (initials or emoji)</label>
            <input value={logo} onChange={(e) => setLogo(e.target.value)} style={fieldStyle} placeholder="TV" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              logoBg (Tailwind classes — wart: these won&apos;t respond to theme)
            </label>
            <input
              value={logoBg}
              onChange={(e) => setLogoBg(e.target.value)}
              style={fieldStyle}
              list="logobg-suggestions"
              placeholder="bg-slate-900 text-white"
            />
            <datalist id="logobg-suggestions">
              {LOGOBG_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
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
              onClick={() => {
                if (window.confirm(`Delete experience at ${company}?`)) {
                  void remove({ id: exp._id })
                }
              }}
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
      )}
    </div>
  )
}

export function ExperienceEditor() {
  const items = (useQuery(api.experience.listAll) ?? []) as ExperienceDoc[]
  const create = useMutation(api.experience.create)
  const [creating, setCreating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = async () => {
    setCreating(true)
    try {
      await create({
        company: 'New Company',
        role: 'Role',
        period: 'Month Year – Present',
        timeframe: 'Year – Present',
        badge: '',
        logo: '?',
        logoBg: 'bg-slate-900 text-white',
        points: [],
        tags: [],
        order: (items.length + 1) * 10,
        visible: false,
      })
      setRefreshKey((k) => k + 1)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
          Experience
        </h2>
        <button
          onClick={() => void handleCreate()}
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
          + New Entry
        </button>
      </div>

      <div key={refreshKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No experience entries yet.</p>
        ) : (
          items
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((exp) => (
              <ExperienceRow
                key={exp._id}
                exp={exp}
                onSaved={() => setRefreshKey((k) => k + 1)}
              />
            ))
        )}
      </div>
    </div>
  )
}
