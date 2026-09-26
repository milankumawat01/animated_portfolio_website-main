import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeader } from './ui/SectionHeader'
import { ProjectsCarousel } from './ProjectsCarousel'
import type { ProjectDoc } from '@/lib/convex'

export function ProjectsSection({ projects }: { projects: ProjectDoc[] }) {
  const company = projects.filter(project => project.workType === 'company').length
  const freelance = projects.filter(project => project.workType === 'freelance').length
  return <section id="projects" className="project-section defer-render relative overflow-hidden bg-bg-soft py-16 sm:py-20">
    <div className="mx-auto max-w-[1440px] px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeader number="03" badge="PROJECTS" title="Projects that" highlight="create real impact." description="Products built at True Value Infosoft and independent work for clients." />
        <div className="flex shrink-0 items-center gap-6 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div><span className="block text-4xl font-black tracking-tight text-blue">{String(projects.length).padStart(2, '0')}</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-text-muted">Projects</span></div>
          <div className="space-y-1 text-xs text-text-secondary"><p><strong className="text-text-primary">{company}</strong> company projects</p><p><strong className="text-text-primary">{freelance}</strong> freelance projects</p></div>
        </div>
      </div>
      <ProjectsCarousel projects={projects} />
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5 text-xs">
        <span className="font-medium text-text-muted">Built with care. Made for real people.</span>
        <Link href="/projects" className="inline-flex shrink-0 items-center gap-2 font-bold text-blue">All {projects.length} projects <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </div>
  </section>
}
