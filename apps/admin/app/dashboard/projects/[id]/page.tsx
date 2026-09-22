'use client'
import { useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import { ProjectEditor } from '@/components/projects/ProjectEditor'
import { use } from 'react'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const projects = useQuery(api.projects.listAll) ?? []
  const project = projects.find((p) => p._id === (id as Id<'projects'>))

  // projects loaded but this id not found
  if (!project && projects.length > 0) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#374151' }}>
        Project not found.
      </div>
    )
  }

  return (
    <div>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          margin: '0 0 1.5rem',
          fontFamily: 'system-ui, sans-serif',
          color: '#111827',
        }}
      >
        Edit Project
      </h1>
      {project ? <ProjectEditor project={project} /> : (
        <div style={{ color: '#6b7280', fontFamily: 'system-ui, sans-serif' }}>
          Loading…
        </div>
      )}
    </div>
  )
}
