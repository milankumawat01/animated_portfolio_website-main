'use client'
import { ProjectEditor } from '@/components/projects/ProjectEditor'

export default function NewProjectPage() {
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
        New Project
      </h1>
      <ProjectEditor />
    </div>
  )
}
