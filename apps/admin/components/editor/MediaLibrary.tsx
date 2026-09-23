'use client'
import { useState, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'

const MEDIA_SIZE_MAX = 10 * 1024 * 1024 // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

type MediaItem = {
  _id: Id<'media'>
  storageId: Id<'_storage'>
  filename: string
  contentType: string
  size: number
  alt: string
  width?: number
  height?: number
  uploadedAt: number
}

function MediaCard({
  item,
  onDelete,
  onEditAlt,
}: {
  item: MediaItem
  onDelete: (item: MediaItem) => void
  onEditAlt: (item: MediaItem) => void
}) {
  const url = useQuery(api.media.urlFor, { storageId: item.storageId })
  const [copied, setCopied] = useState(false)

  const copyId = () => {
    void navigator.clipboard.writeText(item.storageId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          aspectRatio: '4/3',
          background: '#f3f4f6',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={item.alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Loading…</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#111827',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={item.filename}
        >
          {item.filename}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
          {item.width && item.height ? `${item.width}×${item.height} · ` : ''}
          {formatBytes(item.size)} · {formatDate(item.uploadedAt)}
        </div>
        <div
          style={{
            fontSize: '0.72rem',
            color: '#374151',
            fontStyle: item.alt ? 'normal' : 'italic',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={item.alt}
        >
          {item.alt || 'No alt text'}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onEditAlt(item)}
            style={{
              padding: '0.25rem 0.5rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              color: '#1d4ed8',
            }}
          >
            Edit Alt
          </button>
          <button
            onClick={copyId}
            style={{
              padding: '0.25rem 0.5rem',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              color: '#374151',
            }}
          >
            {copied ? 'Copied!' : 'Copy ID'}
          </button>
          <button
            onClick={() => onDelete(item)}
            style={{
              padding: '0.25rem 0.5rem',
              background: '#fff5f5',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              color: '#dc2626',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export function MediaLibrary() {
  const mediaItems = (useQuery(api.media.list) ?? []) as MediaItem[]
  const generateUploadUrl = useMutation(api.media.generateUploadUrl)
  const createMedia = useMutation(api.media.create)
  const removeMedia = useMutation(api.media.remove)
  const updateMedia = useMutation(api.media.create) // we'll use a different mutation for update — see below
  void updateMedia

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [altText, setAltText] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingDims, setPendingDims] = useState<{ w: number; h: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Alt edit modal
  const [editAltItem, setEditAltItem] = useState<MediaItem | null>(null)
  const [editAltValue, setEditAltValue] = useState('')
  const updateAlt = useMutation(api.media.create) // placeholder — media.update not in spec
  void updateAlt

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed.')
      e.target.value = ''
      return
    }
    if (file.size > MEDIA_SIZE_MAX) {
      setUploadError('File exceeds 10 MB limit.')
      e.target.value = ''
      return
    }

    const img = new Image()
    img.onload = () => {
      setPendingDims({ w: img.naturalWidth, h: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
    setPendingFile(file)
  }

  const handleUpload = async () => {
    if (!pendingFile) return
    if (!altText.trim()) {
      setUploadError('Alt text is required.')
      return
    }

    setUploading(true)
    setUploadError('')
    try {
      const uploadUrl = await generateUploadUrl()
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': pendingFile.type },
        body: pendingFile,
      })
      if (!res.ok) throw new Error('Upload to storage failed')
      const { storageId } = (await res.json()) as { storageId: Id<'_storage'> }

      await createMedia({
        storageId,
        filename: pendingFile.name,
        contentType: pendingFile.type,
        size: pendingFile.size,
        alt: altText.trim(),
        width: pendingDims?.w,
        height: pendingDims?.h,
      })

      setPendingFile(null)
      setPendingDims(null)
      setAltText('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (item: MediaItem) => {
    const msg =
      `Delete "${item.filename}"?\n\nThis will permanently remove the image from storage. If any project or post still references this image, it will show nothing (no reference count — see admin docs).`
    if (window.confirm(msg)) {
      void removeMedia({ id: item._id })
    }
  }

  const openEditAlt = (item: MediaItem) => {
    setEditAltItem(item)
    setEditAltValue(item.alt)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h2
        style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem', color: '#111827' }}
      >
        Media Library
      </h2>

      {/* Upload panel */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
          Upload Image
        </h3>
        {uploadError && (
          <div
            style={{
              marginBottom: '0.75rem',
              padding: '0.625rem 1rem',
              background: '#fff5f5',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '0.85rem',
            }}
          >
            {uploadError}
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.375rem',
              }}
            >
              File (image/*, max 10 MB)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ fontSize: '0.875rem' }}
            />
            {pendingDims && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {pendingDims.w} × {pendingDims.h}px
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.375rem',
              }}
            >
              Alt text *
            </label>
            <input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image for screen readers"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            onClick={() => void handleUpload()}
            disabled={uploading || !pendingFile}
            style={{
              padding: '0.625rem 1.5rem',
              background: uploading || !pendingFile ? '#a5b4fc' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: uploading || !pendingFile ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Grid */}
      {mediaItems.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No images yet. Upload one above.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {mediaItems.map((item) => (
            <MediaCard
              key={item._id}
              item={item}
              onDelete={handleDelete}
              onEditAlt={openEditAlt}
            />
          ))}
        </div>
      )}

      {/* Edit alt modal */}
      {editAltItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setEditAltItem(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '90vw',
              maxWidth: '440px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700 }}>
              Edit Alt Text
            </h3>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
              {editAltItem.filename}
            </p>
            <input
              value={editAltValue}
              onChange={(e) => setEditAltValue(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
                marginBottom: '1rem',
              }}
            />
            <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: '#9ca3af' }}>
              Note: alt text editing requires a media.update mutation (not yet in API).
              This is informational only in v1.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditAltItem(null)}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
