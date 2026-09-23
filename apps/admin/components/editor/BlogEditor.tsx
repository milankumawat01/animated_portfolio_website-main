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
  tags: string[]
  readTimeMinutes: number
  featured: boolean
  status: 'draft' | 'published'
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

export function BlogEditor({ post }: { post?: PostDoc }) {
  const router = useRouter()
  const create = useMutation(api.blog.create)
  const update = useMutation(api.blog.update)
  const setStatus = useMutation(api.blog.setStatus)
  const allTags = useQuery(api.blog.listTags) ?? []

  // Field state
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!post)
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [tags, setTags] = useState((post?.tags ?? []).join(', '))
  const [featured, setFeatured] = useState(post?.featured ?? false)
  const [publishedAtStr, setPublishedAtStr] = useState(() => {
    if (!post?.publishedAt) return ''
    return new Date(post.publishedAt).toISOString().slice(0, 16)
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
  const [saving, setSaving] = useState(false)
  const [saveLabel, setSaveLabel] = useState<'save' | 'saving' | 'saved'>('save')
  const [error, setError] = useState('')

  // Publish dialog
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<'draft' | 'published' | null>(null)

  // Preview pane
  const [showPreview, setShowPreview] = useState(true)

  // Mark dirty on any field change
  useEffect(() => {
    setIsDirty(true)
  }, [title, slug, excerpt, body, tags, featured, publishedAtStr, imageStorageId, imageUrl, seoTitle, seoDesc, readTimeOverride, readTimePinned])

  // Auto-slug from title (only when not touched)
  useEffect(() => {
    if (!slugTouched && title) setSlug(slugify(title))
  }, [title, slugTouched])

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
        setIsDirty(false)
        setSaveLabel('saved')
        router.push(`/dashboard/blog/${id}`)
        return
      }
      setIsDirty(false)
      setSaveLabel('saved')
      setTimeout(() => setSaveLabel('save'), 2000)
    } catch (err: unknown) {
      setError(errorMessage(err, 'Save failed'))
      setSaveLabel('save')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = () => {
    const newStatus = post?.status === 'published' ? 'draft' : 'published'
    setPendingStatus(newStatus)
    setShowPublishConfirm(true)
  }

  const confirmStatusChange = async () => {
    if (!post || !pendingStatus) return
    setShowPublishConfirm(false)
    setSaving(true)
    try {
      await setStatus({
        id: post._id,
        status: pendingStatus,
        publishedAt: pendingStatus === 'published'
          ? (publishedAtStr ? new Date(publishedAtStr).getTime() : undefined)
          : undefined,
      })
    } catch (err: unknown) {
      setError(errorMessage(err, 'Status change failed'))
    } finally {
      setSaving(false)
    }
  }

  const isPublished = post?.status === 'published'
  const slugChanged = post && slug !== post.slug
  const isFutureDate = publishedAtStr ? new Date(publishedAtStr).getTime() > Date.now() : false

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
          {post && (
            <button
              onClick={handleStatusToggle}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                background: isPublished ? '#fef3c7' : '#d1fae5',
                color: isPublished ? '#92400e' : '#065f46',
                border: `1px solid ${isPublished ? '#fde68a' : '#a7f3d0'}`,
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {isPublished ? 'Unpublish' : 'Publish'}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="A short summary of the post…"
              maxLength={1000}
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
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const t = e.currentTarget
                  const start = t.selectionStart
                  const end = t.selectionEnd
                  const next = t.value.slice(0, start) + '  ' + t.value.slice(end)
                  setBody(next)
                  requestAnimationFrame(() => {
                    t.selectionStart = t.selectionEnd = start + 2
                  })
                }
              }}
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
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImageStorageId(undefined) }}
                placeholder="Or paste a URL"
                style={{ ...fieldStyle, flex: 1 }}
              />
            </div>
          </div>

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
                  ⚠ Future date — post publishes immediately with this date
                </span>
              )}
            </label>
            <input
              type="datetime-local"
              value={publishedAtStr}
              onChange={(e) => setPublishedAtStr(e.target.value)}
              style={fieldStyle}
            />
          </div>

          {/* Flags */}
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

      {/* Publish confirm dialog */}
      {showPublishConfirm && pendingStatus && post && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '480px',
              width: '90vw',
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>
              {pendingStatus === 'published' ? 'Publish this post?' : 'Unpublish this post?'}
            </h3>
            {pendingStatus === 'published' ? (
              <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  This will make the post publicly accessible at:
                </p>
                <p style={{ margin: '0 0 0.75rem', fontFamily: 'monospace', color: '#4f46e5' }}>
                  {siteUrl}/blog/{post.slug}
                </p>
                <p style={{ margin: '0 0 0.75rem' }}>
                  It will be indexable by search engines.
                </p>
                {!publishedAtStr && (
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.82rem' }}>
                    Published date will be set to now. You can change it in the editor.
                  </p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>
                The URL{' '}
                <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>
                  {siteUrl}/blog/{post.slug}
                </span>{' '}
                will return 404 after revalidation.
              </p>
            )}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.5rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowPublishConfirm(false)}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Keep editing
              </button>
              <button
                onClick={() => void confirmStatusChange()}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: pendingStatus === 'published' ? '#4f46e5' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {pendingStatus === 'published' ? 'Publish' : 'Unpublish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
