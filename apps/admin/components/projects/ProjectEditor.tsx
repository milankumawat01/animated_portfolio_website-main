'use client'
import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/slugify'

type ProjectDoc = {
  _id: Id<'projects'>
  slug: string
  title: string
  subtitle: string
  description: string
  longDescription: string
  tags: string[]
  keyFeatures: string[]
  architecture: string[]
  stats: { label: string; value: string }[]
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  order: number
  status: 'draft' | 'published'
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontFamily: 'system-ui, sans-serif',
  boxSizing: 'border-box',
  color: '#111827',
  background: '#fff',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.375rem',
  fontFamily: 'system-ui, sans-serif',
}

const groupStyle: React.CSSProperties = {
  marginBottom: '1.25rem',
}

export function ProjectEditor({ project }: { project?: ProjectDoc }) {
  const router = useRouter()
  const create = useMutation(api.projects.create)
  const update = useMutation(api.projects.update)

  const [title, setTitle] = useState(project?.title ?? '')
  const [slug, setSlug] = useState(project?.slug ?? '')
  const [subtitle, setSubtitle] = useState(project?.subtitle ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [longDescription, setLongDescription] = useState(project?.longDescription ?? '')
  const [tags, setTags] = useState((project?.tags ?? []).join(', '))
  const [keyFeatures, setKeyFeatures] = useState((project?.keyFeatures ?? []).join('\n'))
  const [architecture, setArchitecture] = useState((project?.architecture ?? []).join('\n'))
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? '')
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? '')
  const [featured, setFeatured] = useState(project?.featured ?? false)
  const [order, setOrder] = useState(String(project?.order ?? 10))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Auto-generate slug from title on create only
  useEffect(() => {
    if (!project && title) setSlug(slugify(title))
  }, [title, project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const payload = {
        title,
        subtitle,
        description,
        longDescription,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        keyFeatures: keyFeatures.split('\n').map((t) => t.trim()).filter(Boolean),
        architecture: architecture.split('\n').map((t) => t.trim()).filter(Boolean),
        liveUrl: liveUrl || undefined,
        githubUrl: githubUrl || undefined,
        featured,
        order: Number(order) || 10,
        stats: project?.stats ?? [],
      }

      if (project) {
        await update({
          id: project._id,
          ...payload,
          // Only send slug if it changed — warns the user above
          slug: slug !== project.slug ? slug : undefined,
        })
      } else {
        const id = await create({ slug, ...payload })
        router.push(`/dashboard/projects/${id}`)
        return
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const slugChanged = project && slug !== project.slug
  const isPublished = project?.status === 'published'

  return (
    <form onSubmit={(e) => void handleSubmit(e)} style={{ maxWidth: '720px', fontFamily: 'system-ui, sans-serif' }}>
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#fff5f5',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={groupStyle}>
        <label style={labelStyle}>Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={fieldStyle}
          placeholder="My Awesome Project"
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>
          Slug *{' '}
          {isPublished && slugChanged && (
            <span style={{ color: '#dc2626', fontWeight: 400 }}>
              ⚠ Changing a published slug breaks live URLs!
            </span>
          )}
        </label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          style={fieldStyle}
          placeholder="my-awesome-project"
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Subtitle</label>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          style={fieldStyle}
          placeholder="A short tagline"
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Description (card blurb)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={fieldStyle}
          placeholder="Shown on project cards and in lists."
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Long Description (detail page)</label>
        <textarea
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          rows={5}
          style={fieldStyle}
          placeholder="Full description shown on the project detail page."
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Tags (comma-separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={fieldStyle}
          placeholder="FastAPI, Next.js, OpenAI"
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Key Features (one per line)</label>
        <textarea
          value={keyFeatures}
          onChange={(e) => setKeyFeatures(e.target.value)}
          rows={5}
          style={fieldStyle}
          placeholder="Feature one&#10;Feature two&#10;Feature three"
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Architecture (one per line)</label>
        <textarea
          value={architecture}
          onChange={(e) => setArchitecture(e.target.value)}
          rows={5}
          style={fieldStyle}
          placeholder="Next.js frontend&#10;FastAPI backend&#10;PostgreSQL database"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={groupStyle}>
          <label style={labelStyle}>Live URL</label>
          <input
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            style={fieldStyle}
            placeholder="https://…"
            type="url"
          />
        </div>
        <div style={groupStyle}>
          <label style={labelStyle}>GitHub URL</label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            style={fieldStyle}
            placeholder="https://github.com/…"
            type="url"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={groupStyle}>
          <label style={labelStyle}>Order (sparse: 10, 20, …)</label>
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            type="number"
            min="1"
            step="1"
            style={fieldStyle}
          />
        </div>
        <div
          style={{
            ...groupStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingTop: '1.5rem',
          }}
        >
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label
            htmlFor="featured"
            style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}
          >
            Featured project
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.75rem 2rem',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            opacity: saving ? 0.7 : 1,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {saving ? 'Saving…' : project ? 'Save Changes' : 'Create Project'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: 'system-ui, sans-serif',
            color: '#374151',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
