'use client'
import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { errorMessage } from '@/lib/errors'
import { AdminModal } from './AdminModal'
import { useFeedback } from '@/components/ui/Feedback'

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
  skills: { name: string; iconKey: string; visible?: boolean }[]
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

function SkillEditorModal({ category, categories, initial, onClose, onSave, onDelete }: {
  category: SkillCategoryDoc
  categories: SkillCategoryDoc[]
  initial?: { name: string; iconKey: string; visible?: boolean }
  onClose: () => void
  onSave: (skill: { name: string; iconKey: string; visible?: boolean }, categoryId: Id<'skillCategories'>) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const { confirm, toast } = useFeedback()
  const [name, setName] = useState(initial?.name ?? '')
  const [iconKey, setIconKey] = useState(initial?.iconKey ?? '')
  const [categoryId, setCategoryId] = useState<Id<'skillCategories'>>(category._id)
  const [visible, setVisible] = useState(initial?.visible !== false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  return <AdminModal title={initial ? 'Edit skill' : 'Add skill'} onClose={onClose}>
    <div style={{ display: 'grid', gap: 12 }}><label>Skill name<input value={name} onChange={e => setName(e.target.value)} style={fieldStyle} /></label><label>Icon<IconKeySelect value={iconKey} onChange={setIconKey} /></label><label>Category<select value={categoryId} onChange={e => setCategoryId(e.target.value as Id<'skillCategories'>)} style={fieldStyle}>{categories.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}</select></label><label><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /> Visible</label></div>
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button disabled={saving} onClick={() => { if (!name.trim() || !iconKey) { setError('Name and icon are required.'); return } setSaving(true); void onSave({ name: name.trim(), iconKey, visible }, categoryId).then(() => toast('Skill saved')).catch(err => setError(errorMessage(err, 'Save failed'))).finally(() => setSaving(false)) }}>Save</button><button onClick={onClose}>Cancel</button>{onDelete && <button style={{ color: '#b91c1c' }} onClick={() => void (async()=>{ if(await confirm({title:'Delete skill?',description:`Permanently delete ${name}?`,confirmLabel:'Delete',danger:true})) await onDelete().then(()=>toast('Skill deleted')).catch(err=>setError(errorMessage(err,'Delete failed'))) })()}>Delete</button>}</div>
  </AdminModal>
}

function SkillCategoryRow({
  cat,
  categories,
  onSaved,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  cat: SkillCategoryDoc
  categories: SkillCategoryDoc[]
  onSaved: () => void
  onMove: (direction: -1 | 1) => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const { confirm, toast } = useFeedback()
  const update = useMutation(api.skills.update)
  const saveSkill = useMutation(api.skills.saveSkill)
  const deleteSkill = useMutation(api.skills.deleteSkill)
  const remove = useMutation(api.skills.remove)

  const [expanded, setExpanded] = useState(false)
  const [editingSkill, setEditingSkill] = useState<number | null>(null)
  const [title, setTitle] = useState(cat.title)
  const [subtitle, setSubtitle] = useState(cat.subtitle)
  const [icon, setIcon] = useState(cat.icon)
  const [skills, setSkills] = useState<{ name: string; iconKey: string; visible?: boolean }[]>(cat.skills)
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
      toast('Category saved')
    } catch (err: unknown) {
      setError(errorMessage(err, 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => setEditingSkill(-1)
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
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
            {cat.title}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
            {cat.subtitle} · {cat.skills.length} skills · icon: {cat.icon}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          <button type="button" disabled={!canMoveUp} onClick={e => { e.stopPropagation(); onMove(-1) }} aria-label={`Move ${cat.title} up`}>↑</button>
          <button type="button" disabled={!canMoveDown} onClick={e => { e.stopPropagation(); onMove(1) }} aria-label={`Move ${cat.title} down`}>↓</button>
          {!visible && <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>hidden</span>}
          <span style={{ color: '#9ca3af' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <AdminModal title={`Edit ${cat.title}`} onClose={() => setExpanded(false)}>
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
                  <button type="button" onClick={() => setEditingSkill(i)}>Edit</button>
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
              onClick={() => void (async()=>{ if(await confirm({title:'Delete category?',description:`Delete “${cat.title}” and its skills?`,confirmLabel:'Delete category',danger:true})) { await remove({id:cat._id}); toast('Category deleted') } })()}
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
      {editingSkill !== null && <SkillEditorModal category={cat} categories={categories} initial={editingSkill < 0 ? undefined : skills[editingSkill]} onClose={() => setEditingSkill(null)} onDelete={editingSkill < 0 ? undefined : async () => { await deleteSkill({ categoryId: cat._id, index: editingSkill }); setSkills(skills.filter((_, i) => i !== editingSkill)); setEditingSkill(null); onSaved() }} onSave={async (skill, targetId) => {
        const next = editingSkill < 0 ? [...skills, skill] : skills.map((item, i) => i === editingSkill ? skill : item)
        await saveSkill({ categoryId: cat._id, targetId, index: editingSkill < 0 ? undefined : editingSkill, skill })
        setSkills(targetId === cat._id ? next : editingSkill < 0 ? skills : skills.filter((_, i) => i !== editingSkill))
        setEditingSkill(null); onSaved()
      }} />}
    </div>
  )
}

export function SkillsEditor() {
  const skillsQuery = useQuery(api.skills.listAll)
  const categories = (skillsQuery ?? []) as SkillCategoryDoc[]
  const { toast } = useFeedback()
  const create = useMutation(api.skills.create)
  const reorder = useMutation(api.skills.reorder)
  const saveSkill = useMutation(api.skills.saveSkill)
  const [quickSkillOpen, setQuickSkillOpen] = useState(false)
  useEffect(() => { if (!new URLSearchParams(window.location.search).has('new')) return; const timer = window.setTimeout(() => setQuickSkillOpen(true), 0); return () => window.clearTimeout(timer) }, [])
  const [creating, setCreating] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSubtitle, setNewSubtitle] = useState('')
  const [newIcon, setNewIcon] = useState('python')
  const [newVisible, setNewVisible] = useState(true)
  const [createError, setCreateError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreate = async () => {
    setCreating(true)
    try {
      if (!newTitle.trim()) throw new Error('Category name is required.')
      await create({
        title: newTitle.trim(),
        subtitle: newSubtitle.trim(),
        icon: newIcon,
        skills: [],
        order: (categories.length + 1) * 10,
        visible: newVisible,
      })
      toast('Category added')
      setRefreshKey((k) => k + 1)
      setNewOpen(false)
      setNewTitle(''); setNewSubtitle(''); setCreateError('')
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
          Skills
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
          + Add Category
        </button>
      </div>
      {quickSkillOpen && categories.length > 0 && <SkillEditorModal category={categories[0]} categories={categories} onClose={() => setQuickSkillOpen(false)} onSave={async (skill, targetId) => { await saveSkill({ categoryId: targetId, targetId, skill }); setQuickSkillOpen(false); setRefreshKey(k => k + 1) }} />}
      {quickSkillOpen && categories.length === 0 && <AdminModal title="Add skill" onClose={() => setQuickSkillOpen(false)}><p>Create a skill category first.</p><button onClick={() => { setQuickSkillOpen(false); setNewOpen(true) }}>Create category</button></AdminModal>}
      {newOpen && <AdminModal title="New skill category" onClose={() => setNewOpen(false)}><div style={{ display: 'grid', gap: 12 }}><label>Category name<input value={newTitle} onChange={e => setNewTitle(e.target.value)} style={fieldStyle} /></label><label>Subtitle<input value={newSubtitle} onChange={e => setNewSubtitle(e.target.value)} style={fieldStyle} /></label><label>Icon<IconKeySelect value={newIcon} onChange={setNewIcon} /></label><label><input type="checkbox" checked={newVisible} onChange={e => setNewVisible(e.target.checked)} /> Visible</label></div>{createError && <p role="alert" style={{ color: '#b91c1c' }}>{createError}</p>}<div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button disabled={creating} onClick={() => void handleCreate()}>Save category</button><button onClick={() => setNewOpen(false)}>Cancel</button></div></AdminModal>}

      <div key={refreshKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {skillsQuery === undefined ? <div className="skeleton" style={{height:210}}/> : categories.length === 0 ? (
          <div className="cms-empty"><span>✦</span><strong>No skill categories yet</strong><p>Create a category to organize your skills.</p><button onClick={()=>setNewOpen(true)}>+ Add Category</button></div>
        ) : (
          categories
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((cat, index, sorted) => (
              <SkillCategoryRow
                key={cat._id}
                cat={cat}
                categories={categories}
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
