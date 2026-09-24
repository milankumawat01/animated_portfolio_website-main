'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/slugify'
import { MarkdownPreview } from './MarkdownPreview'
import { MediaPicker } from './MediaPicker'
import { errorMessage } from '@/lib/errors'
import { useFeedback } from '@/components/ui/Feedback'

const BODY_MAX = 200_000

function computeReadTime(body: string): number {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

type PostDoc = {
  _id: Id<'blogPosts'>
  slug: string
  title: string
  excerpt: string
  body: string
  imageStorageId?: Id<'_storage'>
  imageUrl?: string
  category?: string
  scheduledAt?: number
  tags: string[]
  readTimeMinutes: number
  featured: boolean
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  views: number
  publishedAt?: number
  updatedAt: number
  seo?: { title?: string; description?: string }
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

export function BlogEditor({ post, onClose, onCancel, onDirtyChange }: { post?: PostDoc; onClose?: () => void; onCancel?: () => void; onDirtyChange?: (dirty: boolean) => void }) {
  const { confirm, toast } = useFeedback()
  const router = useRouter()
  const create = useMutation(api.blog.create)
  const update = useMutation(api.blog.update)
  const setStatus = useMutation(api.blog.setStatus)
  const allTags = useQuery(api.blog.listTags) ?? []
  const categoryOptions = [...new Set((useQuery(api.blog.listAll) ?? []).map(item => item.category).filter(Boolean))]

  // Field state
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!post)
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [tags, setTags] = useState((post?.tags ?? []).join(', '))
  const [category, setCategory] = useState(post?.category ?? '')
  const [featured, setFeatured] = useState(post?.featured ?? false)
  const [publishOnCreate, setPublishOnCreate] = useState(false)
  const [publishedAtStr, setPublishedAtStr] = useState(() => {
    if (!post?.publishedAt && !post?.scheduledAt) return ''
    const date = new Date(post.scheduledAt ?? post.publishedAt!)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
  })
  const [imageStorageId, setImageStorageId] = useState<Id<'_storage'> | undefined>(
    post?.imageStorageId,
  )
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? '')
  const [seoTitle, setSeoTitle] = useState(post?.seo?.title ?? '')
  const [seoDesc, setSeoDesc] = useState(post?.seo?.description ?? '')

  // Read time
  const [readTimeOverride, setReadTimeOverride] = useState<number | null>(
    post ? post.readTimeMinutes : null,
  )
  const [readTimePinned, setReadTimePinned] = useState(!!post) // start pinned for existing posts

  const autoReadTime = computeReadTime(body)
  const displayReadTime = readTimePinned && readTimeOverride !== null ? readTimeOverride : autoReadTime

  // Media picker
  const [showPicker, setShowPicker] = useState(false)
  const coverUrl = useQuery(
    api.media.urlFor,
    imageStorageId ? { storageId: imageStorageId } : 'skip',
  )

  // Dirty state tracking
  const [isDirty, setIsDirty] = useState(false)
  const initializedDirty = useRef(false)
  const [saving, setSaving] = useState(false)
  const [saveLabel, setSaveLabel] = useState<'save' | 'saving' | 'saved'>('save')
  const [error, setError] = useState('')

  // Preview pane
  const [showPreview, setShowPreview] = useState(true)

  // Mark dirty on any field change
  useEffect(() => {
    if (!initializedDirty.current) { initializedDirty.current = true; return }
    const timer = window.setTimeout(() => setIsDirty(true), 0)
    return () => window.clearTimeout(timer)
  }, [title, slug, excerpt, body, tags, category, featured, publishedAtStr, imageStorageId, imageUrl, seoTitle, seoDesc, readTimeOverride, readTimePinned])
  useEffect(() => { onDirtyChange?.(isDirty) }, [isDirty, onDirtyChange])

  // Auto-slug from title (only when not touched)
  // The title change handler keeps untouched slugs in sync.

  // Unsaved-changes guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Update read time auto-compute when body changes (debounced)
  const bodyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleBodyChange = useCallback((val: string) => {
    setBody(val)
    if (!readTimePinned) {
      if (bodyTimerRef.current) clearTimeout(bodyTimerRef.current)
      bodyTimerRef.current = setTimeout(() => {
        setReadTimeOverride(computeReadTime(val))
      }, 500)
    }
  }, [readTimePinned])

  const buildPayload = () => ({
    title: title.trim(),
    excerpt: excerpt.trim(),
    body,
    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    category: category.trim() || undefined,
    readTimeMinutes: displayReadTime,
    featured,
    imageStorageId: imageStorageId ?? undefined,
    imageUrl: imageUrl.trim() || undefined,
    seo:
      seoTitle.trim() || seoDesc.trim()
        ? { title: seoTitle.trim() || undefined, description: seoDesc.trim() || undefined }
        : undefined,
    publishedAt: publishedAtStr ? new Date(publishedAtStr).getTime() : undefined,
  })

  const handleSave = async () => {
    setError('')
    setSaving(true)
    setSaveLabel('saving')
    try {
      if (post) {
        const payload = buildPayload()
        await update({
          id: post._id,
          ...payload,
          // Send explicit empties so a removed or replaced cover is cleared server-side.
          imageStorageId: imageStorageId ?? null,
          imageUrl: imageUrl.trim(),
          slug: slug !== post.slug ? slug : undefined,
        })
      } else {
        const id = await create({
          slug,
          ...buildPayload(),
        })
        if (publishOnCreate) await setStatus({ id, status: publishedAtStr && new Date(publishedAtStr).getTime() > Date.now() ? 'scheduled' : 'published', publishedAt: publishedAtStr ? new Date(publishedAtStr).getTime() : undefined })
        setIsDirty(false)
        setSaveLabel('saved')
        if (!onClose) toast('Post created')
        if (onClose) onClose()
        else router.push(`/dashboard/blog/${id}`)
        return
      }
      setIsDirty(false)
      setSaveLabel('saved')
      if (!onClose) toast('Post saved')
      onClose?.()
      setTimeout(() => setSaveLabel('save'), 2000)
    } catch (err: unknown) {
      setError(errorMessage(err, 'Save failed'))
      setSaveLabel('save')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = async () => {
    if (isDirty) { setError('Save your changes before changing publication status.'); return }
    const newStatus = post?.status === 'published' || post?.status === 'scheduled' ? 'draft' : (publishedAtStr && new Date(publishedAtStr).getTime() > Date.now() ? 'scheduled' : 'published')
    if (!post) return
    const label = newStatus === 'draft' ? 'Unpublish' : newStatus === 'scheduled' ? 'Schedule' : 'Publish'
    if (!await confirm({ title: `${label} post?`, description: newStatus === 'draft' ? `The public URL for “${post.title}” will become unavailable.` : newStatus === 'scheduled' ? `“${post.title}” will publish at the selected date.` : `“${post.title}” will become public on your portfolio.`, confirmLabel: label })) return
    setSaving(true)
    try {
      await setStatus({
        id: post._id,
        status: newStatus,
        publishedAt: newStatus === 'published' || newStatus === 'scheduled'
          ? (publishedAtStr ? new Date(publishedAtStr).getTime() : undefined)
          : undefined,
      })
      toast(`Post ${newStatus === 'draft' ? 'unpublished' : newStatus}`)
    } catch (err: unknown) {
      setError(errorMessage(err, 'Status change failed'))
    } finally {
      setSaving(false)
    }
  }

  const isPublished = post?.status === 'published'
  const isScheduled = post?.status === 'scheduled'
  const slugChanged = post && slug !== post.slug
  const [openedAt] = useState(() => Date.now())
  const isFutureDate = publishedAtStr ? new Date(publishedAtStr).getTime() > openedAt : false

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev'

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <h1
          style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}
        >
          {post ? 'Edit Post' : 'New Post'}
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => void (async()=>{if(!isDirty||await confirm({title:'Discard changes?',description:'Your unsaved blog changes will be lost.',confirmLabel:'Discard changes',danger:true})){if(onCancel) onCancel(); else router.back()}})()}>Cancel</button>
          {post && (
            <button
              onClick={handleStatusToggle}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                background: isPublished || isScheduled ? '#fef3c7' : '#d1fae5',
                color: isPublished || isScheduled ? '#92400e' : '#065f46',
                border: `1px solid ${isPublished || isScheduled ? '#fde68a' : '#a7f3d0'}`,
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {isScheduled ? 'Unschedule' : isPublished ? 'Unpublish' : isFutureDate ? 'Schedule' : 'Publish'}
            </button>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '0.5rem 1rem',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
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
              fontWeight: 700,
              fontSize: '0.9rem',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saveLabel === 'saving' ? 'Saving…' : saveLabel === 'saved' ? 'Saved ✓' : post ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </div>

      {/* Error banner */}
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
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {error}
          <button
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Status badge */}
      {post && (
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: isPublished ? '#d1fae5' : '#fef3c7',
              color: isPublished ? '#065f46' : '#92400e',
            }}
          >
            {post.status}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            {post.views} views
          </span>
        </div>
      )}

      {/* Two-pane layout */}
      <div
        className="blog-editor-columns"
        style={{
          display: 'grid',
          gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left pane — fields */}
        <div>
          {/* Title */}
          <div style={groupStyle}>
            <label style={labelStyle}>Title *</label>
            <input
              aria-label="Post title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)) }}
              required
              style={fieldStyle}
              placeholder="Post title"
            />
          </div>

          {/* Slug */}
          <div style={groupStyle}>
            <label style={labelStyle}>
              Slug *{' '}
              {isPublished && slugChanged && (
                <span style={{ color: '#dc2626', fontWeight: 400 }}>
                  ⚠ Changing a published slug breaks live URLs!{' '}
                  <a
                    href={`${siteUrl}/blog/${post?.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#dc2626' }}
                  >
                    {siteUrl}/blog/{post?.slug}
                  </a>
                </span>
              )}
            </label>
            <input
              aria-label="Post slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              required
              style={fieldStyle}
              placeholder="my-post-slug"
            />
          </div>

          {/* Excerpt */}
          <div style={groupStyle}>
            <label style={labelStyle}>
              Excerpt{' '}
              <span style={{ fontWeight: 400, color: '#9ca3af' }}>
                ({excerpt.length}/300 chars — used in cards and SEO)
              </span>
            </label>
            <textarea
              aria-label="Post excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="A short summary of the post…"
              maxLength={300}
            />
          </div>

          {/* Body */}
          <div style={groupStyle}>
            <label style={labelStyle}>
              Body (Markdown){' '}
              <span style={{ fontWeight: 400, color: body.length > BODY_MAX ? '#dc2626' : '#9ca3af' }}>
                {body.length}/{BODY_MAX.toLocaleString()}
              </span>
            </label>
            <textarea
              aria-label="Post body in Markdown"
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              rows={20}
              style={{
                ...fieldStyle,
                fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                resize: 'vertical',
              }}
              placeholder="Write your post in Markdown…"
            />
          </div>

          {/* Cover image */}
          <div style={groupStyle}>
            <label style={labelStyle}>Cover Image</label>
            {(imageStorageId ? coverUrl : imageUrl.trim()) && (
              <div style={{ marginBottom: '0.5rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={(imageStorageId ? coverUrl : imageUrl.trim()) ?? ''}
                  alt="Cover"
                  style={{ maxWidth: '200px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                />
                <button
                  type="button"
                  onClick={() => { setImageStorageId(undefined); setImageUrl('') }}
                  style={{
                    display: 'block',
                    marginTop: '0.375rem',
                    fontSize: '0.75rem',
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                Pick from media library
              </button>
              <input
                aria-label="Cover image URL"
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImageStorageId(undefined) }}
                placeholder="Or paste a URL"
                style={{ ...fieldStyle, flex: 1 }}
              />
            </div>
          </div>

          <div style={groupStyle}><label style={labelStyle}>Category</label><input aria-label="Post category" list="blog-categories" value={category} onChange={e => setCategory(e.target.value)} style={fieldStyle} placeholder="Engineering" /><datalist id="blog-categories">{categoryOptions.map(option => <option key={option} value={option} />)}</datalist></div>
          {/* Tags */}
          <div style={groupStyle}>
            <label style={labelStyle}>
              Tags (comma-separated)
              {allTags.length > 0 && (
                <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: '0.5rem' }}>
                  Existing: {allTags.slice(0, 10).map((t) => t.tag).join(', ')}
                </span>
              )}
            </label>
            <input
              aria-label="Post tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={fieldStyle}
              placeholder="AI, Python, Tutorial"
            />
          </div>

          {/* Read time */}
          <div style={groupStyle}>
            <label style={labelStyle}>Read Time (minutes)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                aria-label="Reading time in minutes"
                type="number"
                value={displayReadTime}
                min={1}
                onChange={(e) => {
                  setReadTimePinned(true)
                  setReadTimeOverride(Number(e.target.value) || 1)
                }}
                style={{ ...fieldStyle, width: '80px' }}
                disabled={!readTimePinned}
              />
              {!readTimePinned ? (
                <button
                  type="button"
                  onClick={() => {
                    setReadTimePinned(true)
                    setReadTimeOverride(autoReadTime)
                  }}
                  style={{
                    fontSize: '0.8rem',
                    color: '#4f46e5',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Override
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setReadTimePinned(false)
                    setReadTimeOverride(null)
                  }}
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Reset to auto ({autoReadTime} min)
                </button>
              )}
              {!readTimePinned && (
                <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                  Auto-derived from body
                </span>
              )}
            </div>
          </div>

          {/* Published At */}
          <div style={groupStyle}>
            <label style={labelStyle}>
              Published At (date/time)
              {isFutureDate && (
                <span style={{ color: '#d97706', fontWeight: 400, marginLeft: '0.5rem' }}>
                  Future date — post will publish automatically at this time
                </span>
              )}
            </label>
            <input
              aria-label="Publish date and time"
              type="datetime-local"
              value={publishedAtStr}
              onChange={(e) => setPublishedAtStr(e.target.value)}
              style={fieldStyle}
            />
          </div>

          {/* Flags */}
          {!post && <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><input type="checkbox" checked={publishOnCreate} onChange={e => setPublishOnCreate(e.target.checked)} /> Publish after saving (future date schedules automatically)</label>}
          <div style={{ ...groupStyle, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                Featured
              </span>
            </label>
          </div>

          {/* SEO */}
          <details style={{ marginBottom: '1.25rem' }}>
            <summary
              style={{
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#374151',
                marginBottom: '0.75rem',
                userSelect: 'none',
              }}
            >
              SEO overrides (optional)
            </summary>
            <div style={{ paddingLeft: '1rem' }}>
              <div style={groupStyle}>
                <label style={labelStyle}>
                  SEO Title{' '}
                  <span style={{ fontWeight: 400, color: '#9ca3af' }}>
                    (default: {title || 'post title'})
                  </span>
                </label>
                <input
                  aria-label="SEO title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>
                  SEO Description{' '}
                  <span style={{ fontWeight: 400, color: '#9ca3af' }}>
                    (default: excerpt)
                  </span>
                </label>
                <textarea
                  aria-label="SEO description"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={2}
                  style={fieldStyle}
                />
              </div>
            </div>
          </details>

          {/* Read-only strip */}
          {post && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#6b7280',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span>ID: {post._id}</span>
              <span>
                Updated:{' '}
                {new Date(post.updatedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Right pane — live preview */}
        {showPreview && (
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'sticky',
              top: '1rem',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              Live Preview
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <MarkdownPreview markdown={body} />
            </div>
          </div>
        )}
      </div>

      {/* Media picker dialog */}
      {showPicker && (
        <MediaPicker
          onSelect={(url) => {
            setImageStorageId(undefined)
            setImageUrl(url)
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

    </div>
  )
}
