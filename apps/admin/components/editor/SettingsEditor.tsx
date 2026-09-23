'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import { VALID_ICON_KEYS } from './SkillsEditor'

type SiteSettings = {
  _id: string
  key: 'main'
  personal: {
    name: string; role: string; location: string
    headline: string; subheadline: string
    email: string; bio: string
    linkedin: string; linkedinUrl: string
    github: string; githubUrl: string
    twitterUrl: string; resumeUrl: string
  }
  stats: { value: string; label: string }[]
  heroTechStack: { name: string; iconKey: string }[]
  aboutPillars: { title: string; description: string; icon: string }[]
  whatIWorkOn: { title: string; description: string; icon: string }[]
  quotes: {
    about: string; skills: string; howIBuild: string
    experience: string; writing: string; contact: string
  }
  handwriting: {
    aboutPhoto: string; aboutBottom: string; projects: string
    skillsPhoto: string; skillsBottom: string
    experienceLeft: string; experienceRight: string
    howIBuildTop: string; howIBuildBottom: string
    writingTop: string; contactTop: string; footer: string
  }
  howIBuildSteps: { step: string; title: string; icon: string; description: string; items: string[] }[]
  howIBuildPillars: { title: string; subtitle: string; icon: string }[]
  contactCards: { id: string; title: string; value: string; hint: string; icon: string; action: string; copyable: boolean }[]
  updatedAt: number
}

const tabs = [
  'Personal',
  'Stats & Tech',
  'About',
  'Quotes',
  'Handwriting',
  'How I Build',
  'Contact Cards',
] as const

type Tab = (typeof tabs)[number]

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

const groupStyle: React.CSSProperties = { marginBottom: '0.875rem' }

function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
  type,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  hint?: string
  type?: string
}) {
  return (
    <div style={groupStyle}>
      <label style={labelStyle}>{label}</label>
      {hint && (
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
          {hint}
        </div>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={fieldStyle}
        />
      ) : (
        <input
          type={type ?? 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={fieldStyle}
        />
      )}
    </div>
  )
}

function IconKeySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle}>
      <option value="">— pick an icon —</option>
      {VALID_ICON_KEYS.map((k) => (
        <option key={k} value={k}>
          {k}
        </option>
      ))}
    </select>
  )
}

function SaveBar({
  onSave,
  saving,
  label,
}: {
  onSave: () => void
  saving: boolean
  label: string
}) {
  return (
    <div
      style={{
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <button
        onClick={onSave}
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
        {saving ? 'Saving…' : label}
      </button>
    </div>
  )
}

// ── Tab content components ─────────────────────────────────────────────────

function PersonalTab({
  data,
  onChange,
  onSave,
  saving,
  error,
}: {
  data: SiteSettings['personal']
  onChange: (patch: Partial<SiteSettings['personal']>) => void
  onSave: () => void
  saving: boolean
  error: string
}) {
  const p = data
  return (
    <div>
      {error && <ErrorBanner msg={error} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <Field label="Name" value={p.name} onChange={(v) => onChange({ name: v })} />
        <Field label="Role / Title" value={p.role} onChange={(v) => onChange({ role: v })} />
        <Field label="Location" value={p.location} onChange={(v) => onChange({ location: v })} />
        <Field label="Email" value={p.email} onChange={(v) => onChange({ email: v })} type="email" />
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Headline" value={p.headline} onChange={(v) => onChange({ headline: v })} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Subheadline" value={p.subheadline} onChange={(v) => onChange({ subheadline: v })} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Bio" value={p.bio} onChange={(v) => onChange({ bio: v })} multiline />
        </div>
        <Field
          label="LinkedIn (display text)"
          value={p.linkedin}
          onChange={(v) => onChange({ linkedin: v })}
          hint="e.g. linkedin.com/in/milankumawat — do NOT paste the full URL here"
        />
        <Field
          label="LinkedIn URL"
          value={p.linkedinUrl}
          onChange={(v) => onChange({ linkedinUrl: v })}
          hint="Full href e.g. https://linkedin.com/in/milankumawat"
        />
        <Field
          label="GitHub (display text)"
          value={p.github}
          onChange={(v) => onChange({ github: v })}
          hint="e.g. github.com/milankumawat"
        />
        <Field
          label="GitHub URL"
          value={p.githubUrl}
          onChange={(v) => onChange({ githubUrl: v })}
          hint="Full href"
        />
        <Field
          label="Twitter URL"
          value={p.twitterUrl}
          onChange={(v) => onChange({ twitterUrl: v })}
        />
        <Field
          label="Resume URL"
          value={p.resumeUrl}
          onChange={(v) => onChange({ resumeUrl: v })}
          hint="May be site-relative e.g. /documents/resume.pdf — not validated as absolute"
        />
      </div>
      <SaveBar onSave={onSave} saving={saving} label="Save Personal" />
    </div>
  )
}

function StatsTechTab({
  stats,
  heroTechStack,
  onChangeStats,
  onChangeHero,
  onSave,
  saving,
  error,
}: {
  stats: SiteSettings['stats']
  heroTechStack: SiteSettings['heroTechStack']
  onChangeStats: (v: SiteSettings['stats']) => void
  onChangeHero: (v: SiteSettings['heroTechStack']) => void
  onSave: () => void
  saving: boolean
  error: string
}) {
  const updateStat = (i: number, field: 'value' | 'label', v: string) => {
    const next = [...stats]
    next[i] = { ...next[i], [field]: v }
    onChangeStats(next)
  }
  const updateHero = (i: number, field: 'name' | 'iconKey', v: string) => {
    const next = [...heroTechStack]
    next[i] = { ...next[i], [field]: v }
    onChangeHero(next)
  }

  return (
    <div>
      {error && <ErrorBanner msg={error} />}
      <h3 style={{ margin: '0 0 0.875rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
        Stats (3 items, value is a string like &quot;5K+&quot;)
      </h3>
      {stats.map((s, i) => (
        <div
          key={i}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}
        >
          <Field
            label={`Stat ${i + 1} — Value`}
            value={s.value}
            onChange={(v) => updateStat(i, 'value', v)}
            hint={'String e.g. "5K+" — never a number (not a JavaScript number)'}
          />
          <Field
            label={`Stat ${i + 1} — Label`}
            value={s.label}
            onChange={(v) => updateStat(i, 'label', v)}
          />
        </div>
      ))}

      <h3 style={{ margin: '1.5rem 0 0.875rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
        Hero Tech Stack (8 items)
      </h3>
      {heroTechStack.map((h, i) => (
        <div
          key={i}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}
        >
          <Field
            label={`Stack ${i + 1} — Name`}
            value={h.name}
            onChange={(v) => updateHero(i, 'name', v)}
          />
          <div style={groupStyle}>
            <label style={labelStyle}>Stack {i + 1} — Icon Key</label>
            <IconKeySelect value={h.iconKey} onChange={(v) => updateHero(i, 'iconKey', v)} />
          </div>
        </div>
      ))}

      <SaveBar onSave={onSave} saving={saving} label="Save Stats & Tech" />
    </div>
  )
}

function AboutTab({
  aboutPillars,
  whatIWorkOn,
  onChangePillars,
  onChangeWork,
  onSave,
  saving,
  error,
}: {
  aboutPillars: SiteSettings['aboutPillars']
  whatIWorkOn: SiteSettings['whatIWorkOn']
  onChangePillars: (v: SiteSettings['aboutPillars']) => void
  onChangeWork: (v: SiteSettings['whatIWorkOn']) => void
  onSave: () => void
  saving: boolean
  error: string
}) {
  const updatePillar = (i: number, field: 'title' | 'description' | 'icon', v: string) => {
    const next = [...aboutPillars]
    next[i] = { ...next[i], [field]: v }
    onChangePillars(next)
  }
  const updateWork = (i: number, field: 'title' | 'description' | 'icon', v: string) => {
    const next = [...whatIWorkOn]
    next[i] = { ...next[i], [field]: v }
    onChangeWork(next)
  }

  return (
    <div>
      {error && <ErrorBanner msg={error} />}
      <h3 style={{ margin: '0 0 0.875rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
        About Pillars (3 items)
      </h3>
      {aboutPillars.map((p, i) => (
        <div
          key={i}
          style={{
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field label={`Pillar ${i + 1} — Title`} value={p.title} onChange={(v) => updatePillar(i, 'title', v)} />
            <div style={groupStyle}>
              <label style={labelStyle}>Pillar {i + 1} — Icon Key</label>
              <IconKeySelect value={p.icon} onChange={(v) => updatePillar(i, 'icon', v)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Description" value={p.description} onChange={(v) => updatePillar(i, 'description', v)} multiline />
            </div>
          </div>
        </div>
      ))}

      <h3 style={{ margin: '1.5rem 0 0.875rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
        What I Work On (4 items)
      </h3>
      {whatIWorkOn.map((w, i) => (
        <div
          key={i}
          style={{
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field label={`Item ${i + 1} — Title`} value={w.title} onChange={(v) => updateWork(i, 'title', v)} />
            <div style={groupStyle}>
              <label style={labelStyle}>Item {i + 1} — Icon Key</label>
              <IconKeySelect value={w.icon} onChange={(v) => updateWork(i, 'icon', v)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Description" value={w.description} onChange={(v) => updateWork(i, 'description', v)} multiline />
            </div>
          </div>
        </div>
      ))}

      <SaveBar onSave={onSave} saving={saving} label="Save About" />
    </div>
  )
}

function QuotesTab({
  quotes,
  onChange,
  onSave,
  saving,
  error,
}: {
  quotes: SiteSettings['quotes']
  onChange: (patch: Partial<SiteSettings['quotes']>) => void
  onSave: () => void
  saving: boolean
  error: string
}) {
  return (
    <div>
      {error && <ErrorBanner msg={error} />}
      <Field label="About section quote" value={quotes.about} onChange={(v) => onChange({ about: v })} multiline hint="Renders at the top of the About section" />
      <Field label="Skills section quote" value={quotes.skills} onChange={(v) => onChange({ skills: v })} multiline hint="Renders above the skills grid" />
      <Field label="How I Build quote" value={quotes.howIBuild} onChange={(v) => onChange({ howIBuild: v })} multiline hint="Renders on the How I Build section" />
      <Field label="Experience section quote" value={quotes.experience} onChange={(v) => onChange({ experience: v })} multiline hint="Renders above the experience timeline" />
      <Field label="Writing/Blog quote" value={quotes.writing} onChange={(v) => onChange({ writing: v })} multiline hint="Renders on the writing section" />
      <Field label="Contact section quote" value={quotes.contact} onChange={(v) => onChange({ contact: v })} multiline hint="Renders on the contact section" />
      <SaveBar onSave={onSave} saving={saving} label="Save Quotes" />
    </div>
  )
}

// Handwriting tab — special handling for literal \n sequences
function HandwritingTab({
  handwriting,
  onChange,
  onSave,
  saving,
  error,
}: {
  handwriting: SiteSettings['handwriting']
  onChange: (patch: Partial<SiteSettings['handwriting']>) => void
  onSave: () => void
  saving: boolean
  error: string
}) {
  const fields: { key: keyof SiteSettings['handwriting']; label: string }[] = [
    { key: 'aboutPhoto', label: 'About Photo' },
    { key: 'aboutBottom', label: 'About Bottom' },
    { key: 'projects', label: 'Projects' },
    { key: 'skillsPhoto', label: 'Skills Photo' },
    { key: 'skillsBottom', label: 'Skills Bottom' },
    { key: 'experienceLeft', label: 'Experience Left' },
    { key: 'experienceRight', label: 'Experience Right' },
    { key: 'howIBuildTop', label: 'How I Build Top' },
    { key: 'howIBuildBottom', label: 'How I Build Bottom' },
    { key: 'writingTop', label: 'Writing Top' },
    { key: 'contactTop', label: 'Contact Top' },
    { key: 'footer', label: 'Footer' },
  ]

  return (
    <div>
      {error && <ErrorBanner msg={error} />}
      <div
        style={{
          padding: '0.875rem 1rem',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
          color: '#92400e',
          lineHeight: 1.6,
        }}
      >
        ⚠ <strong>These fields are currently dead data</strong> — no component reads from them yet.
        Changes won&apos;t appear on the public site until wiring is complete.
        <br /><br />
        The values contain <strong>literal \n sequences</strong> (backslash + n, two characters), NOT real
        newlines. Use the &quot;Insert \n&quot; button to add them. Do NOT press Enter in these fields.
      </div>

      {fields.map(({ key, label }) => (
        <HandwritingField
          key={key}
          label={label}
          value={handwriting[key]}
          onChange={(v) => onChange({ [key]: v })}
        />
      ))}

      <SaveBar onSave={onSave} saving={saving} label="Save Handwriting" />
    </div>
  )
}

function HandwritingField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  // Preview: replace literal \n with real newlines for display
  const preview = value.replace(/\\n/g, '\n')

  const insertNewlineEscape = () => {
    onChange(value + '\\n')
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...fieldStyle, flex: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}
        />
        <button
          type="button"
          onClick={insertNewlineEscape}
          style={{
            padding: '0.5rem 0.75rem',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
        >
          Insert \n
        </button>
      </div>
      {preview && (
        <div
          style={{
            marginTop: '0.375rem',
            padding: '0.5rem 0.75rem',
            background: '#f9fafb',
            border: '1px solid #f3f4f6',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: '#6b7280',
            whiteSpace: 'pre-line',
            fontStyle: 'italic',
          }}
        >
          Preview: {preview}
        </div>
      )}
    </div>
  )
}

function HowIBuildTab({
  steps,
  pillars,
  onChangeSteps,
  onChangePillars,
  onSave,
  saving,
  error,
}: {
  steps: SiteSettings['howIBuildSteps']
  pillars: SiteSettings['howIBuildPillars']
  onChangeSteps: (v: SiteSettings['howIBuildSteps']) => void
  onChangePillars: (v: SiteSettings['howIBuildPillars']) => void
  onSave: () => void
  saving: boolean
  error: string
}) {
  const updateStep = (
    i: number,
    field: 'step' | 'title' | 'icon' | 'description',
    v: string,
  ) => {
    const next = [...steps]
    next[i] = { ...next[i], [field]: v }
    onChangeSteps(next)
  }
  const updateStepItem = (si: number, ii: number, v: string) => {
    const next = [...steps]
    const items = [...next[si].items]
    items[ii] = v
    next[si] = { ...next[si], items }
    onChangeSteps(next)
  }
  const addStepItem = (si: number) => {
    const next = [...steps]
    next[si] = { ...next[si], items: [...next[si].items, ''] }
    onChangeSteps(next)
  }
  const removeStepItem = (si: number, ii: number) => {
    const next = [...steps]
    const items = next[si].items.filter((_, idx) => idx !== ii)
    next[si] = { ...next[si], items }
    onChangeSteps(next)
  }

  const updatePillar = (i: number, field: 'title' | 'subtitle' | 'icon', v: string) => {
    const next = [...pillars]
    next[i] = { ...next[i], [field]: v }
    onChangePillars(next)
  }

  return (
    <div>
      {error && <ErrorBanner msg={error} />}
      <h3 style={{ margin: '0 0 0.875rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
        How I Build Steps (5 items)
      </h3>
      {steps.map((s, i) => (
        <div
          key={i}
          style={{
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Field label="Step" value={s.step} onChange={(v) => updateStep(i, 'step', v)} />
            <Field label="Title" value={s.title} onChange={(v) => updateStep(i, 'title', v)} />
            <div style={groupStyle}>
              <label style={labelStyle}>Icon Key</label>
              <IconKeySelect value={s.icon} onChange={(v) => updateStep(i, 'icon', v)} />
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <Field label="Description" value={s.description} onChange={(v) => updateStep(i, 'description', v)} multiline />
          </div>
          <div>
            <label style={labelStyle}>Items (bullet list)</label>
            {s.items.map((item, ii) => (
              <div key={ii} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <input
                  value={item}
                  onChange={(e) => updateStepItem(i, ii, e.target.value)}
                  style={{ ...fieldStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => removeStepItem(i, ii)}
                  style={{ padding: '0.25rem 0.5rem', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: '#dc2626' }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addStepItem(i)}
              style={{ padding: '0.375rem 0.75rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              + Add Item
            </button>
          </div>
        </div>
      ))}

      <h3 style={{ margin: '1.5rem 0 0.875rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
        How I Build Pillars (4 items)
      </h3>
      {pillars.map((p, i) => (
        <div
          key={i}
          style={{
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '0.75rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.75rem',
          }}
        >
          <Field label="Title" value={p.title} onChange={(v) => updatePillar(i, 'title', v)} />
          <Field label="Subtitle" value={p.subtitle} onChange={(v) => updatePillar(i, 'subtitle', v)} />
          <div style={groupStyle}>
            <label style={labelStyle}>Icon Key</label>
            <IconKeySelect value={p.icon} onChange={(v) => updatePillar(i, 'icon', v)} />
          </div>
        </div>
      ))}

      <SaveBar onSave={onSave} saving={saving} label="Save How I Build" />
    </div>
  )
}

function ContactCardsTab({
  cards,
  onChange,
  onSave,
  saving,
  error,
}: {
  cards: SiteSettings['contactCards']
  onChange: (v: SiteSettings['contactCards']) => void
  onSave: () => void
  saving: boolean
  error: string
}) {
  const updateCard = (
    i: number,
    field: keyof SiteSettings['contactCards'][number],
    v: string | boolean,
  ) => {
    const next = [...cards]
    next[i] = { ...next[i], [field]: v }
    onChange(next)
  }

  return (
    <div>
      {error && <ErrorBanner msg={error} />}
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field
              label="ID (stable key — changing may break layout)"
              value={c.id}
              onChange={(v) => updateCard(i, 'id', v)}
              hint="⚠ Changing the id affects components that key off it"
            />
            <Field label="Title" value={c.title} onChange={(v) => updateCard(i, 'title', v)} />
            <Field label="Value (what's shown and copied)" value={c.value} onChange={(v) => updateCard(i, 'value', v)} />
            <Field label="Hint" value={c.hint} onChange={(v) => updateCard(i, 'hint', v)} />
            <div style={groupStyle}>
              <label style={labelStyle}>Icon Key</label>
              <IconKeySelect value={c.icon} onChange={(v) => updateCard(i, 'icon', v)} />
            </div>
            <Field label="Action (click behaviour string)" value={c.action} onChange={(v) => updateCard(i, 'action', v)} />
            <div style={{ ...groupStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id={`copyable-${i}`}
                checked={c.copyable}
                onChange={(e) => updateCard(i, 'copyable', e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <label htmlFor={`copyable-${i}`} style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>
                Copyable
              </label>
            </div>
          </div>
        </div>
      ))}
      <SaveBar onSave={onSave} saving={saving} label="Save Contact Cards" />
    </div>
  )
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        background: '#fff5f5',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626',
        fontSize: '0.875rem',
        marginBottom: '1rem',
      }}
    >
      {msg}
    </div>
  )
}

// ── Main Settings component ────────────────────────────────────────────────

export function SettingsEditor() {
  const rawSettings = useQuery(api.siteSettings.get)
  const updateMutation = useMutation(api.siteSettings.update)
  const settings = rawSettings as SiteSettings | null | undefined

  const [activeTab, setActiveTab] = useState<Tab>('Personal')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Local state mirrors — one per tab to avoid coupling
  const [personal, setPersonal] = useState<SiteSettings['personal'] | null>(null)
  const [stats, setStats] = useState<SiteSettings['stats']>([])
  const [heroTechStack, setHeroTechStack] = useState<SiteSettings['heroTechStack']>([])
  const [aboutPillars, setAboutPillars] = useState<SiteSettings['aboutPillars']>([])
  const [whatIWorkOn, setWhatIWorkOn] = useState<SiteSettings['whatIWorkOn']>([])
  const [quotes, setQuotes] = useState<SiteSettings['quotes'] | null>(null)
  const [handwriting, setHandwriting] = useState<SiteSettings['handwriting'] | null>(null)
  const [howIBuildSteps, setHowIBuildSteps] = useState<SiteSettings['howIBuildSteps']>([])
  const [howIBuildPillars, setHowIBuildPillars] = useState<SiteSettings['howIBuildPillars']>([])
  const [contactCards, setContactCards] = useState<SiteSettings['contactCards']>([])

  // Initialise local state when settings loaded
  useEffect(() => {
    if (!settings) return
    setPersonal(settings.personal)
    setStats(settings.stats)
    setHeroTechStack(settings.heroTechStack)
    setAboutPillars(settings.aboutPillars)
    setWhatIWorkOn(settings.whatIWorkOn)
    setQuotes(settings.quotes)
    setHandwriting(settings.handwriting)
    setHowIBuildSteps(settings.howIBuildSteps)
    setHowIBuildPillars(settings.howIBuildPillars)
    setContactCards(settings.contactCards)
  }, [settings])

  if (settings === undefined) {
    return <div style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280' }}>Loading…</div>
  }
  if (settings === null) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', color: '#dc2626' }}>
        Settings not found. Run the seed first.
      </div>
    )
  }
  if (!personal || !quotes || !handwriting) {
    return <div style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280' }}>Loading…</div>
  }

  const doSave = async (patch: Parameters<typeof updateMutation>[0]) => {
    setSaving(true)
    setError('')
    setSuccessMsg('')
    try {
      await updateMutation(patch)
      setSuccessMsg('Saved!')
      setTimeout(() => setSuccessMsg(''), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
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
          Site Settings
        </h2>
        {successMsg && (
          <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.875rem' }}>
            ✓ {successMsg}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              setError('')
            }}
            style={{
              padding: '0.625rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
              marginBottom: '-2px',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#4f46e5' : '#6b7280',
              fontFamily: 'system-ui, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '1.5rem',
        }}
      >
        {activeTab === 'Personal' && (
          <PersonalTab
            data={personal}
            onChange={(patch) => setPersonal({ ...personal, ...patch })}
            onSave={() => void doSave({ personal })}
            saving={saving}
            error={error}
          />
        )}
        {activeTab === 'Stats & Tech' && (
          <StatsTechTab
            stats={stats}
            heroTechStack={heroTechStack}
            onChangeStats={setStats}
            onChangeHero={setHeroTechStack}
            onSave={() => void doSave({ stats, heroTechStack })}
            saving={saving}
            error={error}
          />
        )}
        {activeTab === 'About' && (
          <AboutTab
            aboutPillars={aboutPillars}
            whatIWorkOn={whatIWorkOn}
            onChangePillars={setAboutPillars}
            onChangeWork={setWhatIWorkOn}
            onSave={() => void doSave({ aboutPillars, whatIWorkOn })}
            saving={saving}
            error={error}
          />
        )}
        {activeTab === 'Quotes' && (
          <QuotesTab
            quotes={quotes}
            onChange={(patch) => setQuotes({ ...quotes, ...patch })}
            onSave={() => void doSave({ quotes })}
            saving={saving}
            error={error}
          />
        )}
        {activeTab === 'Handwriting' && (
          <HandwritingTab
            handwriting={handwriting}
            onChange={(patch) => setHandwriting({ ...handwriting, ...patch })}
            onSave={() => void doSave({ handwriting })}
            saving={saving}
            error={error}
          />
        )}
        {activeTab === 'How I Build' && (
          <HowIBuildTab
            steps={howIBuildSteps}
            pillars={howIBuildPillars}
            onChangeSteps={setHowIBuildSteps}
            onChangePillars={setHowIBuildPillars}
            onSave={() => void doSave({ howIBuildSteps, howIBuildPillars })}
            saving={saving}
            error={error}
          />
        )}
        {activeTab === 'Contact Cards' && (
          <ContactCardsTab
            cards={contactCards}
            onChange={setContactCards}
            onSave={() => void doSave({ contactCards })}
            saving={saving}
            error={error}
          />
        )}
      </div>
    </div>
  )
}
