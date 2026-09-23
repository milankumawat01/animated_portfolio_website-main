'use client'
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { errorMessage } from '@/lib/errors'

// Valid icon keys from apps/web/components/icons/TechIcons.tsx
// The TechIcon component maps name.toLowerCase().replace(/[^a-z0-9]/g, '') to the switch cases
export const VALID_ICON_KEYS = [
  'python',
  'fastapi',
  'nextjs',
  'postgresql',
  'postgres',
  'mongodb',
  'redis',
  'docker',
  'openai',
  'claude',
  'gemini',
  'langchain',
  'llamaindex',
  'rag',
  'nodejs',
  'react',
  'typescript',
  'tailwind',
  'tailwindcss',
  'html',
  'css',
  'supabase',
  'convex',
  'cloudflare',
  'cloudflarer2',
  'firebase',
  'nginx',
  'vercel',
  'digitalocean',
  'ubuntu',
  'github',
  'postman',
  'figma',
  'resend',
  'vscode',
  'notion',
] as const

type SkillCategoryDoc = {
  _id: Id<'skillCategories'>
  title: string
  subtitle: string
  icon: string
  skills: { name: string; iconKey: string }[]
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
}

function IconKeySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <select
      value={VALID_ICON_KEYS.includes(value as (typeof VALID_ICON_KEYS)[number]) ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      style={fieldStyle}
    >
      <option value="">— pick an icon —</option>
      {VALID_ICON_KEYS.map((k) => (
        <option key={k} value={k}>
          {k}
        </option>
      ))}
      {value && !VALID_ICON_KEYS.includes(value as (typeof VALID_ICON_KEYS)[number]) && (
        <option value={value}>{value} (unknown — fix this)</option>
      )}
    </select>
  )
}

function SkillCategoryRow({
  cat,
  onSaved,
}: {
  cat: SkillCategoryDoc
  onSaved: () => void
}) {
  const update = useMutation(api.skills.update)
  const remove = useMutation(api.skills.remove)

  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState(cat.title)
  const [subtitle, setSubtitle] = useState(cat.subtitle)
  const [icon, setIcon] = useState(cat.icon)
  const [skills, setSkills] = useState<{ name: string; iconKey: string }[]>(cat.skills)
  const [visible, setVisible] = useState(cat.visible)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    // Validate all iconKeys
    const badKeys = skills.filter(
      (s) => s.iconKey && !VALID_ICON_KEYS.includes(s.iconKey as (typeof VALID_ICON_KEYS)[number]),
    )
    if (badKeys.length > 0) {
      setError(
        `Unknown icon key(s): ${badKeys.map((s) => s.iconKey).join(', ')}. Please select from the dropdown.`,
      )
      return
    }

    setSaving(true)
    setError('')
    try {
      await update({
        id: cat._id,
        title,
        subtitle,
        icon,
        skills,
        visible,
      })
      onSaved()
    } catch (err: unknown) {
      setError(errorMessage(err, 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => setSkills([...skills, { name: '', iconKey: '' }])
  const updateSkill = (
    i: number,
    field: 'name' | 'iconKey',
    v: string,
  ) => {
    const next = [...skills]
    next[i] = { ...next[i], [field]: v }
    setSkills(next)
  }
  const removeSkill = (i: number) => setSkills(skills.filter((_, idx) => idx !== i))
  const moveSkill = (i: number, dir: -1 | 1) => {
    const next = [...skills]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setSkills(next)
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
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
            {cat.title}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
            {cat.subtitle} · {cat.skills.length} skills · icon: {cat.icon}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          {!visible && <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>hidden</span>}
          <span style={{ color: '#9ca3af' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid #f3f4f6' }}>
          {error && (
            <div
              style={{
                marginBottom: '1rem',
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <label style={labelStyle}>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Subtitle</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>
                Category Icon (iconKey)
              </label>
              <IconKeySelect value={icon} onChange={setIcon} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '0.125rem' }}>
              <input
                type="checkbox"
                id={`vis-${cat._id}`}
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor={`vis-${cat._id}`} style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>
                Visible on public site
              </label>
            </div>
          </div>

          {/* Skills list */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Skills</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {skills.map((sk, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    value={sk.name}
                    onChange={(e) => updateSkill(i, 'name', e.target.value)}
                    placeholder="Skill name"
                    style={{ ...fieldStyle, flex: 1 }}
                  />
                  <div style={{ flex: 1 }}>
                    <IconKeySelect
                      value={sk.iconKey}
                      onChange={(v) => updateSkill(i, 'iconKey', v)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => moveSkill(i, -1)}
                    disabled={i === 0}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSkill(i, 1)}
                    disabled={i === skills.length - 1}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '4px', color: '#dc2626' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
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
                + Add Skill
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                if (window.confirm(`Delete category "${cat.title}"?`)) {
                  void remove({ id: cat._id })
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

export function SkillsEditor() {
  const categories = (useQuery(api.skills.listAll) ?? []) as SkillCategoryDoc[]
  const create = useMutation(api.skills.create)
  const [creating, setCreating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = async () => {
    setCreating(true)
    try {
      await create({
        title: 'New Category',
        subtitle: '',
        icon: 'python',
        skills: [],
        order: (categories.length + 1) * 10,
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
          Skills
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
          + New Category
        </button>
      </div>

      <div key={refreshKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {categories.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No skill categories yet.</p>
        ) : (
          categories
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((cat) => (
              <SkillCategoryRow
                key={cat._id}
                cat={cat}
                onSaved={() => setRefreshKey((k) => k + 1)}
              />
            ))
        )}
      </div>
    </div>
  )
}
