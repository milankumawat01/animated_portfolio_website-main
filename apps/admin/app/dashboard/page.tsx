'use client'
import { useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'

export default function DashboardPage() {
  const projects = useQuery(api.projects.listAll) ?? []
  const posts = useQuery(api.blog.listAll) ?? []
  const unreadLeads = useQuery(api.leads.unreadCount) ?? 0

  const publishedProjects = projects.filter((p: { status: string }) => p.status === 'published').length
  const publishedPosts = posts.filter((p: { status: string }) => p.status === 'published').length

  const stats = [
    { label: 'Published Projects', value: publishedProjects },
    { label: 'Published Posts', value: publishedPosts },
    { label: 'Unread Leads', value: unreadLeads },
    { label: 'Total Projects', value: projects.length },
  ]

  return (
    <div>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          marginBottom: '1.5rem',
          margin: '0 0 1.5rem',
          fontFamily: 'system-ui, sans-serif',
          color: '#111827',
        }}
      >
        Dashboard
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        {stats.map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#4f46e5',
              }}
            >
              {value}
            </div>
            <div
              style={{
                color: '#6b7280',
                marginTop: '0.375rem',
                fontSize: '0.875rem',
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
