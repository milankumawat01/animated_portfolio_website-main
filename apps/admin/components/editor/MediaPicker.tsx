'use client'
import { useState, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { errorMessage } from '@/lib/errors'
import { useUploadMedia } from '@/lib/uploadMedia'

const MEDIA_SIZE_MAX = 10 * 1024 * 1024 // 10 MB

interface MediaPickerProps {
  onSelect: (url: string) => void
  onClose: () => void
}

export function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const mediaItems = useQuery(api.media.list) ?? []
  const uploadMedia = useUploadMedia()

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [altText, setAltText] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingDims, setPendingDims] = useState<{ w: number; h: number } | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed.')
      return
    }
    if (file.size > MEDIA_SIZE_MAX) {
      setUploadError('File exceeds 10 MB limit.')
      return
    }

    // Read dimensions
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
      await uploadMedia(pendingFile, altText.trim(), pendingDims)

      setPendingFile(null)
      setPendingDims(null)
      setAltText('')
      setShowUpload(false)
    } catch (err: unknown) {
      setUploadError(errorMessage(err, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'system-ui, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '90vw',
          maxWidth: '800px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            Media Library
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowUpload(!showUpload)}
              style={{
                padding: '0.5rem 1rem',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Upload
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Upload panel */}
        {showUpload && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
            }}
          >
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
                  File (image/*, max 10MB)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ fontSize: '0.85rem' }}
                />
                {pendingDims && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {pendingDims.w} × {pendingDims.h}px
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.375rem',
                  }}
                >
                  Alt text (required)
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
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                onClick={() => void handleUpload()}
                disabled={uploading || !pendingFile}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: uploading || !pendingFile ? '#a5b4fc' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: uploading || !pendingFile ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {uploading ? 'Uploading…' : 'Add to Library'}
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div
          style={{
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            flex: 1,
          }}
        >
          {mediaItems.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>
              No images yet. Upload one above.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {mediaItems.map((item) => (
                <MediaPickerItem
                  key={item._id}
                  item={item}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type MediaItem = {
  _id: Id<'media'>
  url: string | null
  filename: string
  alt: string
  width?: number
  height?: number
  size: number
}

function MediaPickerItem({
  item,
  onSelect,
}: {
  item: MediaItem
  onSelect: (url: string) => void
}) {
  const url = item.url

  return (
    <div
      onClick={() => { if (url) onSelect(url) }}
      style={{
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = '#4f46e5'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
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
      <div style={{ padding: '0.5rem', fontSize: '0.7rem', color: '#6b7280' }}>
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.alt || item.filename}
        </div>
        {item.width && item.height && (
          <div>
            {item.width}×{item.height}
          </div>
        )}
      </div>
    </div>
  )
}
