'use client'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import Link from 'next/link'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'

export function ProjectsList() {
  const projects = useQuery(api.projects.listAll) ?? []
  const remove = useMutation(api.projects.remove)
  const setStatus = useMutation(api.projects.setStatus)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            margin: 0,
            color: '#111827',
          }}
        >
          All Projects
        </h2>
        <Link
          href="/dashboard/projects/new"
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
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p style={{ color: '#6b7280', fontFamily: 'system-ui, sans-serif' }}>
          No projects yet. Create your first one.
        </p>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {projects.map((project, i) => (
            <div
              key={project._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderBottom:
                  i < projects.length - 1 ? '1px solid #f3f4f6' : 'none',
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
                  {project.title}
                </div>
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '0.8rem',
                    marginTop: '0.25rem',
                  }}
                >
                  {project.slug} · Order {project.order}
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
                  background:
                    project.status === 'published' ? '#d1fae5' : '#fef3c7',
                  color:
                    project.status === 'published' ? '#065f46' : '#92400e',
                }}
              >
                {project.status}
              </span>

              {/* Publish/Unpublish */}
              <button
                onClick={() =>
                  void setStatus({
                    id: project._id as Id<'projects'>,
                    status:
                      project.status === 'published' ? 'draft' : 'published',
                  })
                }
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  color: '#374151',
                }}
              >
                {project.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>

              {/* Edit */}
              <Link
                href={`/dashboard/projects/${project._id}`}
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
                  if (window.confirm('Delete this project? This cannot be undone.')) {
                    void remove({ id: project._id as Id<'projects'> })
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
