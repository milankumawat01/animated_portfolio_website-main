'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react'
import type { ProjectDoc } from '@/lib/convex'
import { useModals } from './modals/ModalProvider'
import { slideOffset, wrapSlide } from '@/lib/project-carousel'

export function ProjectsCarousel({ projects }: { projects: ProjectDoc[] }) {
  const { openProject } = useModals()
  const [active, setActive] = useState(0)
  const [input, setInput] = useState<'pointer' | 'keyboard'>('pointer')
  const gesture = useRef<{ x: number; y: number } | null>(null)
  const suppressClick = useRef(false)
  const count = projects.length
  const current = wrapSlide(active, count)
  const navigate = (delta: number, keyboard = false) => {
    setInput(keyboard ? 'keyboard' : 'pointer')
    setActive(index => wrapSlide(index + delta, count))
  }
  if (!count) return <p className="py-12 text-center text-text-muted">Projects are on the way.</p>

  return <div className="project-carousel" role="region" aria-roledescription="carousel" aria-label="Selected projects" data-input={input}>
    <div className="project-carousel-stage" tabIndex={0} aria-label="Use left and right arrow keys to browse projects" onKeyDown={event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      event.currentTarget.focus()
      navigate(event.key === 'ArrowLeft' ? -1 : 1, true)
    }} onPointerDown={event => {
      if (event.pointerType === 'mouse') return
      suppressClick.current = false
      gesture.current = { x: event.clientX, y: event.clientY }
    }} onPointerCancel={() => { gesture.current = null }} onPointerUp={event => {
      const start = gesture.current
      gesture.current = null
      if (!start) return
      const x = event.clientX - start.x, y = event.clientY - start.y
      if (Math.abs(x) > 48 && Math.abs(x) > Math.abs(y) * 1.3) {
        suppressClick.current = true
        navigate(x < 0 ? 1 : -1)
      }
    }}>
      {projects.map((project, index) => {
        const offset = slideOffset(index, current, count)
        const visible = Math.abs(offset) <= 2
        const selected = offset === 0
        return <article key={project._id} className="project-carousel-card" data-position={visible ? offset : 'hidden'} aria-hidden={!selected} aria-roledescription="slide" aria-label={`${index + 1} of ${count}: ${project.title}`}>
          <div className="relative aspect-video overflow-hidden border-b border-border bg-bg-blue-soft">
            {project.imageUrl && visible ? <Image src={project.imageUrl} alt={project.title} fill sizes="(max-width: 639px) 90vw, (max-width: 1023px) 70vw, 590px" className="object-cover object-top" draggable={false} /> : <div className="flex h-full items-center justify-center gap-3 text-blue"><Layers className="h-10 w-10 stroke-1" /><span className="text-sm font-semibold">{project.subtitle}</span></div>}
            <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">{project.workType === 'company' ? (project.company || 'Company project') : project.workType === 'freelance' ? 'Freelance project' : 'Selected work'}</span>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><h3 className="line-clamp-2 text-xl font-extrabold tracking-tight sm:text-2xl">{project.title}</h3><span className="pt-1 font-mono text-xs text-text-muted">{String(index + 1).padStart(2, '0')}</span></div>
            <p className="line-clamp-2 min-h-[2.75rem] text-xs leading-relaxed text-text-secondary sm:text-sm">{project.description}</p>
            <div className="flex min-h-6 flex-wrap gap-1.5">{project.tags.slice(0, 4).map(tag => <span key={tag} className="rounded-full border border-border bg-bg-soft px-2.5 py-1 text-[10px] font-semibold text-text-secondary">{tag}</span>)}{project.buildMethod && project.buildMethod !== 'unspecified' && <span className="rounded-full bg-blue-light px-2.5 py-1 text-[10px] font-bold text-blue">{project.buildMethod === 'manual' ? 'Manually built' : 'AI-assisted'}</span>}</div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-xs font-bold text-blue"><span>Explore project</span><ArrowRight className="h-4 w-4" /></div>
          </div>
          <button type="button" tabIndex={selected ? 0 : -1} className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue" aria-label={selected ? `View ${project.title}` : `Select ${project.title}`} onClick={() => {
            if (suppressClick.current) { suppressClick.current = false; return }
            if (selected) openProject(project)
            else { setInput('pointer'); setActive(index) }
          }} />
        </article>
      })}
    </div>
    <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
      <div className="flex items-center gap-3">
        <button type="button" disabled={count < 2} onClick={event => navigate(-1, event.detail === 0)} aria-label="Previous project" className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-text-primary transition-colors hover:border-blue disabled:opacity-40"><ArrowLeft className="h-4 w-4" /></button>
        <p aria-live="polite" aria-atomic="true" className="min-w-20 text-center font-mono text-sm"><span className="font-bold text-text-primary">{String(current + 1).padStart(2, '0')}</span><span className="text-text-muted"> / {String(count).padStart(2, '0')}</span><span className="sr-only"> — {projects[current].title}</span></p>
        <button type="button" disabled={count < 2} onClick={event => navigate(1, event.detail === 0)} aria-label="Next project" className="flex h-11 w-11 items-center justify-center rounded-full bg-blue text-white transition-colors hover:bg-blue-dark disabled:opacity-40"><ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="flex flex-wrap justify-center gap-1" aria-label="Choose project">{projects.map((project, index) => <button type="button" key={project._id} aria-label={`Show ${project.title}`} aria-current={current === index ? 'true' : undefined} onClick={event => { setInput(event.detail === 0 ? 'keyboard' : 'pointer'); setActive(index) }} className="flex h-8 w-6 items-center justify-center"><span className={`h-1.5 rounded-full ${current === index ? 'w-4 bg-blue' : 'w-1.5 bg-border'}`} /></button>)}</div>
      <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted lg:block">Swipe. Explore. Discover.</p>
    </div>
  </div>
}
