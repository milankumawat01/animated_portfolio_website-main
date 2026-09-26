import type { ProjectDoc } from '@/lib/convex'

export function ProjectContext({ project }: { project: ProjectDoc }) {
  const method = project.buildMethod === 'ai-assisted' ? 'AI-assisted' : project.buildMethod === 'manual' ? 'Manually built' : null
  const work = project.workType && project.workType !== 'unspecified' ? { company: 'Company project', freelance: 'Freelance', personal: 'Personal project' }[project.workType] : null
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2 text-xs font-semibold">{[work, method].filter(Boolean).map(label => <span key={label} className="rounded-full border border-blue/20 bg-blue-light px-3 py-1.5 text-blue">{label}</span>)}</div>
    {(project.company || project.role) && <dl className="grid grid-cols-2 gap-3 text-sm">
      {project.company && <div><dt className="text-xs text-text-muted">Company / client</dt><dd className="mt-1 font-semibold">{project.company}</dd></div>}
      {project.role && <div><dt className="text-xs text-text-muted">Role</dt><dd className="mt-1 font-semibold">{project.role}</dd></div>}
    </dl>}
    {project.contribution && <div><h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">My contribution</h2><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-secondary">{project.contribution}</p></div>}
  </div>
}
