'use client'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import Link from 'next/link'
import { useState } from 'react'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'

type LeadStatus = 'new' | 'read' | 'replied' | 'archived'

function formatRelative(ts: number) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

const STATUS_TABS: { label: string; value: LeadStatus | undefined }[] = [
  { label: 'New', value: 'new' },
  { label: 'Read', value: 'read' },
  { label: 'Replied', value: 'replied' },
  { label: 'Archived', value: 'archived' },
  { label: 'All', value: undefined },
]

export function LeadsList() {
  const [activeStatus, setActiveStatus] = useState<LeadStatus | undefined>('new')
  const leads = useQuery(api.leads.list, { status: activeStatus }) ?? []
  const unreadCount = useQuery(api.leads.unreadCount) ?? 0

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
        <h2
          style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#111827' }}
        >
          Leads Inbox
        </h2>
        {unreadCount > 0 && (
          <span
            style={{
              padding: '0.25rem 0.75rem',
              background: '#dc2626',
              color: 'white',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Status tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '0',
        }}
      >
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setActiveStatus(value)}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              borderBottom: activeStatus === value ? '2px solid #4f46e5' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeStatus === value ? 700 : 400,
              color: activeStatus === value ? '#4f46e5' : '#6b7280',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {leads.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No leads in this category.</p>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          {leads.map((lead, i) => (
            <Link
              key={lead._id}
              href={`/dashboard/leads/${lead._id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderBottom: i < leads.length - 1 ? '1px solid #f3f4f6' : 'none',
                gap: '1rem',
                textDecoration: 'none',
                color: 'inherit',
                background: lead.status === 'new' ? '#fefce8' : 'white',
              }}
            >
              {/* Unread dot */}
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: lead.status === 'new' ? '#dc2626' : 'transparent',
                  border: lead.status === 'new' ? 'none' : '1px solid #d1d5db',
                  flexShrink: 0,
                }}
              />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: lead.status === 'new' ? 700 : 500,
                    fontSize: '0.9rem',
                    color: '#111827',
                  }}
                >
                  {lead.name}
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 400, marginLeft: '0.5rem' }}>
                    {lead.email}
                  </span>
                </div>
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '0.8rem',
                    marginTop: '0.2rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {lead.message.slice(0, 120)}
                </div>
              </div>

              {/* Meta */}
              <div
                style={{
                  flexShrink: 0,
                  textAlign: 'right',
                  fontSize: '0.78rem',
                  color: '#9ca3af',
                }}
              >
                <div>{formatRelative(lead.createdAt)}</div>
                {lead.notified && (
                  <div style={{ color: '#059669', fontSize: '0.72rem' }}>✓ notified</div>
                )}
              </div>

              {/* Status badge */}
              <span
                style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  background:
                    lead.status === 'new'
                      ? '#fee2e2'
                      : lead.status === 'replied'
                      ? '#d1fae5'
                      : lead.status === 'archived'
                      ? '#f3f4f6'
                      : '#dbeafe',
                  color:
                    lead.status === 'new'
                      ? '#dc2626'
                      : lead.status === 'replied'
                      ? '#065f46'
                      : lead.status === 'archived'
                      ? '#6b7280'
                      : '#1d4ed8',
                }}
              >
                {lead.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Detail view component
export function LeadDetail({ id }: { id: Id<'leads'> }) {
  const lead = useQuery(api.leads.get, { id })
  const setStatus = useMutation(api.leads.setStatus)
  const setNotes = useMutation(api.leads.setNotes)
  const remove = useMutation(api.leads.remove)
  const [notes, setNotes2] = useState(lead?.notes ?? '')
  const [noteSaved, setNoteSaved] = useState(false)
  const router = typeof window !== 'undefined' ? null : null // use Link back

  // Mark read on open
  useQuery(api.leads.get, { id }) // reactive re-fetch
  // We call setStatus when the lead loads as 'new'
  const [markedRead, setMarkedRead] = useState(false)

  if (!lead) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', color: '#6b7280' }}>
        Loading…
      </div>
    )
  }

  // Mark as read on first open
  if (lead.status === 'new' && !markedRead) {
    setMarkedRead(true)
    void setStatus({ id, status: 'read' })
  }

  const handleNoteBlur = async () => {
    await setNotes({ id, notes: notes ?? '' })
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const handleDelete = () => {
    if (
      window.confirm(
        'Permanently delete this lead? This cannot be undone.',
      )
    ) {
      void remove({ id })
      window.history.back()
    }
  }

  const mailtoLink = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(`Re: ${lead.message.slice(0, 50)}`)}&body=${encodeURIComponent(`\n\n---\nOriginal message from ${lead.name}:\n\n${lead.message}`)}`

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '720px' }}>
      {/* Back */}
      <Link
        href="/dashboard/leads"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          textDecoration: 'none',
          marginBottom: '1.5rem',
        }}
      >
        ← Back to Inbox
      </Link>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2
            style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}
          >
            {lead.name}
          </h2>
          <a
            href={`mailto:${lead.email}`}
            style={{ color: '#4f46e5', fontSize: '0.9rem', textDecoration: 'none' }}
          >
            {lead.email}
          </a>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href={mailtoLink}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#4f46e5',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Reply (mailto:)
          </a>

          {lead.status !== 'replied' && (
            <button
              onClick={() => void setStatus({ id, status: 'replied' })}
              style={{
                padding: '0.5rem 1.25rem',
                background: '#d1fae5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Mark Replied
            </button>
          )}

          {lead.status !== 'archived' && (
            <button
              onClick={() => void setStatus({ id, status: 'archived' })}
              style={{
                padding: '0.5rem 1.25rem',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Archive
            </button>
          )}

          <button
            onClick={handleDelete}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#fff5f5',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Message */}
      <div
        style={{
          padding: '1.25rem',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          whiteSpace: 'pre-wrap',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          color: '#111827',
        }}
      >
        {lead.message}
      </div>

      {/* Meta */}
      <details style={{ marginBottom: '1.25rem' }}>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#6b7280',
            marginBottom: '0.5rem',
            userSelect: 'none',
          }}
        >
          Technical details
        </summary>
        <div
          style={{
            padding: '1rem',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#6b7280',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
          }}
        >
          <div>Path: {lead.meta.path ?? '—'}</div>
          <div>Referrer: {lead.meta.referrer ?? '—'}</div>
          <div>User-Agent: {lead.meta.userAgent ?? '—'}</div>
          <div>Source: {lead.source}</div>
          <div>
            Submitted:{' '}
            {new Date(lead.createdAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
          </div>
          {lead.repliedAt && (
            <div>
              Replied:{' '}
              {new Date(lead.repliedAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
            </div>
          )}
        </div>
      </details>

      {/* Status */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '0.375rem',
          }}
        >
          Status
        </label>
        <select
          value={lead.status}
          onChange={(e) => {
            void setStatus({ id, status: e.target.value as LeadStatus })
          }}
          style={{
            padding: '0.5rem 0.875rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontFamily: 'system-ui, sans-serif',
            background: 'white',
          }}
        >
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Private notes */}
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
          Private Notes{' '}
          <span style={{ fontWeight: 400, color: '#9ca3af' }}>
            (never shown publicly)
          </span>
          {noteSaved && (
            <span style={{ marginLeft: '0.5rem', color: '#059669' }}>✓ saved</span>
          )}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes2(e.target.value)}
          onBlur={() => void handleNoteBlur()}
          rows={4}
          placeholder="Your private notes about this lead…"
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontFamily: 'system-ui, sans-serif',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  )
}
