import type { ProjectDoc } from '@/lib/convex'
import { ProjectMark } from './ProjectMark'

export function ProjectArchitecture({ project }: { project: ProjectDoc }) {
  const sales = project.slug === 'salezo'
  const left = sales ? ['Meta Ads', 'Google Ads', 'JustDial'] : project.tags.slice(0, Math.ceil(project.tags.length / 2))
  const right = sales ? ['WhatsApp', 'RCS', 'SMS', 'Email'] : project.tags.slice(Math.ceil(project.tags.length / 2))
  return <div className="case-architecture-diagram" aria-label={sales ? 'Lead sources connect to Salezo and its outreach channels' : `${project.title} technology overview`}>
    <svg viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={`line-${project.slug}`}><stop stopColor="#064d85" /><stop offset=".5" stopColor="#00cdae" /><stop offset="1" stopColor="#064d85" /></linearGradient></defs>{[55, 120, 185, 250].map(y => <g key={y} stroke={`url(#line-${project.slug})`} strokeWidth="1.4" fill="none"><path d={`M 125 ${y} C 230 ${y}, 200 150, 300 150`} /><path d={`M 300 150 C 400 150, 370 ${y}, 475 ${y}`} /></g>)}</svg>
    <div className="case-architecture-nodes">{left.map(label => <span key={label}>{label}</span>)}</div>
    <div className="case-architecture-center"><ProjectMark slug={project.slug} /><strong>{project.title}</strong></div>
    <div className="case-architecture-nodes">{right.map(label => <span key={label}>{label}</span>)}</div>
  </div>
}
