'use client'
/* eslint-disable @next/next/no-img-element -- Editor previews the selected original asset. */
import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/slugify'
import { errorMessage } from '@/lib/errors'
import { MediaPicker } from '@/components/editor/MediaPicker'
import { useFeedback } from '@/components/ui/Feedback'

type ProjectDoc = {
  _id: Id<'projects'>
  slug: string
  title: string
  subtitle: string
  description: string
  longDescription: string
  imageUrl?: string
  imageStorageId?: Id<'_storage'>
  workType?: 'unspecified' | 'company' | 'freelance' | 'personal'
  company?: string
  role?: string
  contribution?: string
  buildMethod?: 'unspecified' | 'ai-assisted' | 'manual'
  galleryUrls?: string[]
  caseStudyUrl?: string
  tags: string[]
  keyFeatures: string[]
  architecture: string[]
  stats: { label: string; value: string }[]
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  order: number
  status: 'draft' | 'published' | 'archived'
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

export function ProjectEditor({ project, onClose, onCancel, onDirtyChange }: { project?: ProjectDoc; onClose?: () => void; onCancel?: () => void; onDirtyChange?: (dirty: boolean) => void }) {
  const { toast, confirm } = useFeedback()
  const router = useRouter()
  const create = useMutation(api.projects.create)
  const update = useMutation(api.projects.update)
  const setStatus = useMutation(api.projects.setStatus)

  const [title, setTitle] = useState(project?.title ?? '')
  const [slug, setSlug] = useState(project?.slug ?? '')
  const [subtitle, setSubtitle] = useState(project?.subtitle ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [longDescription, setLongDescription] = useState(project?.longDescription ?? '')
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? '')
  const [galleryUrls, setGalleryUrls] = useState(project?.galleryUrls ?? [])
  const [caseStudyUrl, setCaseStudyUrl] = useState(project?.caseStudyUrl ?? '')
  const [workType, setWorkType] = useState<NonNullable<ProjectDoc['workType']>>(project?.workType ?? 'unspecified')
  const [company, setCompany] = useState(project?.company ?? '')
  const [role, setRole] = useState(project?.role ?? '')
  const [contribution, setContribution] = useState(project?.contribution ?? '')
  const [buildMethod, setBuildMethod] = useState<NonNullable<ProjectDoc['buildMethod']>>(project?.buildMethod ?? 'unspecified')
  const [picking, setPicking] = useState<'cover' | 'gallery' | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [tags, setTags] = useState((project?.tags ?? []).join(', '))
  const [keyFeatures, setKeyFeatures] = useState((project?.keyFeatures ?? []).join('\n'))
  const [architecture, setArchitecture] = useState((project?.architecture ?? []).join('\n'))
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? '')
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? '')
  const [featured, setFeatured] = useState(project?.featured ?? false)
  const [published, setPublished] = useState(project?.status === 'published')
  const [order, setOrder] = useState(String(project?.order ?? 10))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const snapshot = JSON.stringify([workType,company,role,contribution,buildMethod,title,slug,subtitle,description,longDescription,imageUrl,galleryUrls,caseStudyUrl,tags,keyFeatures,architecture,liveUrl,githubUrl,featured,published,order])
  const [initial] = useState(snapshot)
  const dirty = snapshot !== initial
  useEffect(() => { onDirtyChange?.(dirty) }, [dirty, onDirtyChange])
  useEffect(() => { const handler = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }; window.addEventListener('beforeunload', handler); return () => window.removeEventListener('beforeunload', handler) }, [dirty])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const payload = {
        workType, company, role, contribution, buildMethod,
        title,
        subtitle,
        description,
        longDescription,
        imageUrl: imageUrl.trim(),
        galleryUrls,
        caseStudyUrl: caseStudyUrl.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        keyFeatures: keyFeatures.split('\n').map((t) => t.trim()).filter(Boolean),
        architecture: architecture.split('\n').map((t) => t.trim()).filter(Boolean),
        liveUrl: liveUrl.trim(),
        githubUrl: githubUrl.trim(),
        featured,
        order: Number(order) || 10,
        stats: project?.stats ?? [],
      }

      if (project) {
        await update({
          id: project._id,
          ...payload,
          imageStorageId: imageUrl !== (project.imageUrl ?? '') ? null : undefined,
          // Only send slug if it changed — warns the user above
          slug: slug !== project.slug ? slug : undefined,
        })
        if (published !== (project.status === 'published')) await setStatus({ id: project._id, status: published ? 'published' : 'draft' })
        if (!onClose) toast('Project saved')
        onClose?.()
      } else {
        const id = await create({ slug, ...payload })
        if (published) await setStatus({ id, status: 'published' })
        if (!onClose) toast('Project created')
        if (onClose) onClose()
        else router.push(`/dashboard/projects/${id}`)
        return
      }
    } catch (err: unknown) {
      const msg = errorMessage(err, 'An error occurred')
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const slugChanged = project && slug !== project.slug
  const isPublished = project?.status === 'published'

  return (
    <form onSubmit={(e) => void handleSubmit(e)} style={{ maxWidth: '720px', fontFamily: 'system-ui, sans-serif' }}>
      {picking && <MediaPicker multiple={picking === 'gallery'} onSelectMany={urls => setGalleryUrls(current => [...current, ...urls.filter(url => !current.includes(url))])} onClose={() => setPicking(null)} onSelect={url => { if (picking === 'cover') setImageUrl(url); else setGalleryUrls(current => [...current, url]); setPicking(null) }} />}
      <button type="button" onClick={() => setShowPreview(!showPreview)} style={{ marginBottom: 16 }}>{showPreview ? 'Hide preview' : 'Preview project'}</button>
      {showPreview && <article style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, marginBottom: 18 }}>{imageUrl && <img src={imageUrl} alt={title} style={{ width: '100%', maxHeight: 250, objectFit: 'cover' }} />}<h2>{title || 'Untitled project'}</h2><p>{description}</p><div>{tags}</div><p style={{ whiteSpace: 'pre-wrap' }}>{longDescription}</p><div>{galleryUrls.map((url, index) => <img key={index} src={url} alt={`Gallery ${index + 1}`} style={{ width: 120, marginRight: 8 }} />)}</div></article>}
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
          aria-label="Project title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (!project) setSlug(slugify(e.target.value)) }}
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
          aria-label="Project slug"
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
          aria-label="Project subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          style={fieldStyle}
          placeholder="A short tagline"
        />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Description (card blurb)</label>
        <textarea
          aria-label="Project short description"
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
          aria-label="Project full description"
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
          aria-label="Technologies"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={fieldStyle}
          placeholder="FastAPI, Next.js, OpenAI"
        />
      </div>

      <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 20 }}>
        <legend>Project context</legend>
        <label style={labelStyle} htmlFor="work-type">Work type</label>
        <select id="work-type" value={workType} onChange={e => setWorkType(e.target.value as NonNullable<ProjectDoc['workType']>)} style={fieldStyle}>
          <option value="unspecified">Not specified (hidden)</option><option value="company">Company</option><option value="freelance">Freelance</option><option value="personal">Personal</option>
        </select>
        <label style={labelStyle} htmlFor="project-company">Company / client</label>
        <input id="project-company" value={company} onChange={e => setCompany(e.target.value)} style={fieldStyle} />
        <label style={labelStyle} htmlFor="project-role">Your role</label>
        <input id="project-role" value={role} onChange={e => setRole(e.target.value)} style={fieldStyle} />
        <label style={labelStyle} htmlFor="project-contribution">Your contribution</label>
        <textarea id="project-contribution" value={contribution} onChange={e => setContribution(e.target.value)} rows={3} style={fieldStyle} />
        <label style={labelStyle} htmlFor="build-method">Development tag</label>
        <select id="build-method" value={buildMethod} onChange={e => setBuildMethod(e.target.value as NonNullable<ProjectDoc['buildMethod']>)} style={fieldStyle}>
          <option value="unspecified">Off (hidden)</option><option value="ai-assisted">AI-assisted</option><option value="manual">Manually built</option>
        </select>
        <p style={{ fontSize: 12, color: '#6b7280' }}>Choose this manually. AI features in a product do not mean AI was used to build it. Only publish approved screenshots and public source links.</p>
      </fieldset>

      <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 20 }}><legend>Media</legend>
        <label style={labelStyle}>Cover image</label><input aria-label="Cover image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={fieldStyle} placeholder="Image URL" />
        <button type="button" onClick={() => setPicking('cover')}>Choose from Media</button>
        {imageUrl && <img src={imageUrl} alt="Cover preview" style={{ display: 'block', maxWidth: 180, marginTop: 10 }} />}
        <p>Gallery images</p>{galleryUrls.map((url, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}><input aria-label={`Gallery image ${i+1} URL`} value={url} onChange={e => setGalleryUrls(galleryUrls.map((v, j) => j === i ? e.target.value : v))} style={fieldStyle} /><button type="button" onClick={() => setGalleryUrls(galleryUrls.filter((_, j) => j !== i))}>Remove</button></div>)}
        <button type="button" onClick={() => setPicking('gallery')}>Add gallery image</button>
      </fieldset>

      <div style={groupStyle}>
        <label style={labelStyle}>Key Features (one per line)</label>
        <textarea
          aria-label="Key features"
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
          aria-label="Architecture"
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
            aria-label="Live URL"
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
            aria-label="GitHub URL"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            style={fieldStyle}
            placeholder="https://github.com/…"
            type="url"
          />
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Published on public site</label>
      <div style={groupStyle}><label style={labelStyle}>Case Study URL</label><input aria-label="Case study URL" value={caseStudyUrl} onChange={e => setCaseStudyUrl(e.target.value)} type="url" style={fieldStyle} /></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={groupStyle}>
          <label style={labelStyle}>Order (sparse: 10, 20, …)</label>
          <input
            aria-label="Display order"
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
          onClick={() => void (async () => { if (onCancel) return onCancel(); if (!dirty || await confirm({ title: 'Discard changes?', description: 'Your unsaved project changes will be lost.', confirmLabel: 'Discard changes', danger: true })) { if (onClose) onClose(); else router.back() } })()}
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
