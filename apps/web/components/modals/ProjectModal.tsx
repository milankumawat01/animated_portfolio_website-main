'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, Boxes, Code2, Ellipsis, ExternalLink, MessageSquare, Star, UsersRound, X } from 'lucide-react'
import { GithubIcon } from '../icons/SocialIcons'
import type { ProjectDoc } from '@/lib/convex'
import { ProjectGallery } from '../ProjectGallery'
import { ProjectMark } from '../ProjectMark'

export function ProjectModal({ project, isOpen, onClose }: { project: ProjectDoc | null; isOpen: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const node = dialog.current
    if (!isOpen || !node) return
    const previousOverflow = document.body.style.overflow
    node.showModal()
    document.body.style.overflow = 'hidden'
    return () => { node.close(); document.body.style.overflow = previousOverflow }
  }, [isOpen])
  if (!isOpen || !project) return null
  const featureIcons = [UsersRound, MessageSquare, BarChart3, Code2]
  return <dialog ref={dialog} aria-labelledby="project-dialog-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }} className="project-showcase">
    <header className="showcase-header">
      <span className="showcase-header-icon"><Boxes size={22} /></span>
      <div><h2>Project Showcase</h2><p>A detailed look at the project, its features, and the technology behind it.</p></div>
      <button type="button" autoFocus onClick={onClose} aria-label="Close project" className="showcase-close"><X size={20} /></button>
    </header>
    <div className="showcase-grid">
      <div className="showcase-media"><ProjectGallery key={project.slug} title={project.title} urls={[project.imageUrl ?? '', ...(project.galleryUrls ?? [])]} variant="showcase" /></div>
      <div className="showcase-details">
        <div className="showcase-identity"><ProjectMark slug={project.slug} /><div><h3 id="project-dialog-title">{project.title}</h3><p>{project.subtitle}</p></div>{project.featured && <span className="showcase-featured"><Star size={12} fill="currentColor" />Featured</span>}</div>
        {project.tags.length > 0 && <div className="showcase-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
        <div className="showcase-actions">
          {project.liveUrl ? <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="showcase-live"><ExternalLink size={16} /> Visit Live Site</a> : <button type="button" disabled className="showcase-live" title="A public preview is not available for this project"><ExternalLink size={16} /> Visit Live Site</button>}
          {project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="showcase-code"><GithubIcon className="h-4 w-4" /> View Code</a> : <button type="button" disabled className="showcase-code" title="The source repository is private"><GithubIcon className="h-4 w-4" /> View Code</button>}
          <details className="showcase-more"><summary aria-label="More project actions"><Ellipsis size={20} /></summary><div><Link href={`/projects/${project.slug}`} onClick={onClose}>Open case study</Link>{project.caseStudyUrl && <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer">External case study</a>}</div></details>
        </div>
        <section className="showcase-about"><h4>About the Project</h4><p>{project.longDescription}</p></section>
        {project.keyFeatures.length > 0 && <section className="showcase-section"><h4>Key Features</h4><ul className="showcase-features">{project.keyFeatures.map((feature, index) => { const Icon = featureIcons[index % featureIcons.length]; return <li key={feature}><span><Icon size={18} /></span><p>{feature.split(' — ')[0]}</p></li> })}</ul></section>}
        {project.architecture.length > 0 && <section className="showcase-section"><h4>Technical Architecture</h4><ul className="showcase-architecture">{project.architecture.map(item => <li key={item}>{item}</li>)}</ul></section>}
        {((project.workType && project.workType !== 'unspecified') || (project.buildMethod && project.buildMethod !== 'unspecified')) && <div className="showcase-context"><span>{project.workType === 'company' ? project.company || 'Company project' : project.workType === 'freelance' ? 'Freelance project' : 'Personal project'}</span>{project.buildMethod && project.buildMethod !== 'unspecified' && <span>{project.buildMethod === 'manual' ? 'Manually built' : 'AI-assisted'}</span>}{project.role && <span>{project.role}</span>}</div>}
        {project.contribution && <p className="showcase-contribution">{project.contribution}</p>}
        <Link href={`/projects/${project.slug}`} onClick={onClose} className="showcase-full"><ExternalLink size={18} />View Full Project Details<ArrowRight size={18} /></Link>
      </div>
    </div>
  </dialog>
}
