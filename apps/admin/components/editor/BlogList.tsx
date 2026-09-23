'use client'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import Link from 'next/link'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'

function formatDate(ts?: number) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function BlogList() {
  const posts = useQuery(api.blog.listAll) ?? []
  const remove = useMutation(api.blog.remove)

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
          All Posts
        </h2>
        <Link
          href="/dashboard/blog/new"
          style={{
            padding: '0.625rem 1.25rem',
            background: '#4f46e5',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: '#6b7280' }}>
          No posts yet. Create your first one.
        </p>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          {posts.map((post, i) => (
            <div
              key={post._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderBottom: i < posts.length - 1 ? '1px solid #f3f4f6' : 'none',
                gap: '1rem',
              }}
            >
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {post.title}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  {post.tags.join(', ') || 'No tags'} ·{' '}
                  {formatDate(post.publishedAt)} · {post.views} views ·{' '}
                  {post.readTimeMinutes} min read
                </div>
              </div>

              {/* Status badge */}
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  background: post.status === 'published' ? '#d1fae5' : '#fef3c7',
                  color: post.status === 'published' ? '#065f46' : '#92400e',
                }}
              >
                {post.status}
              </span>

              {/* Edit */}
              <Link
                href={`/dashboard/blog/${post._id}`}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  color: '#1d4ed8',
                  flexShrink: 0,
                }}
              >
                Edit
              </Link>

              {/* Delete */}
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete "${post.title}"? This cannot be undone.`,
                    )
                  ) {
                    void remove({ id: post._id as Id<'blogPosts'> })
                  }
                }}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#fff5f5',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: '#dc2626',
                  flexShrink: 0,
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
