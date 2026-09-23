import type { Metadata } from 'next'
import { openGraph } from '@/lib/seo'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, CheckCircle2, Layers, Cpu, BarChart2, Home, ChevronRight } from 'lucide-react'
import { getProject, getProjects, getSiteSettings } from '@/lib/convex'
import { SubPageShell } from '@/components/SubPageShell'
import { JsonLd, creativeWorkSchema } from '@/components/seo/JsonLd'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const projects = await getProjects()
    return projects.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const project = await getProject(slug)
    if (!project) return { title: 'Project Not Found' }
    return {
      title: project.seo?.title ?? project.title,
      description: project.seo?.description ?? project.description,
      alternates: { canonical: `/projects/${slug}` },
      openGraph: openGraph(`/projects/${slug}`, {
        type: 'article',
        title: project.seo?.title ?? project.title,
        description: project.seo?.description ?? project.description,
        modifiedTime: new Date(project.updatedAt).toISOString(),
        tags: project.tags,
      }),
    }
  } catch {
    return { title: 'Project' }
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params

  let project
  try {
    project = await getProject(slug)
  } catch {
    project = null
  }

  if (!project) notFound()

  const settings = await getSiteSettings().catch(() => null)

  return (
    <SubPageShell settings={settings}>
      <JsonLd data={creativeWorkSchema(project)} />
        {/* Breadcrumb */}
        <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 pt-8 pb-0">
          <nav className="flex items-center gap-2 text-xs text-text-muted font-medium" aria-label="Breadcrumb">
            <Link href="/" className="flex items-center gap-1 hover:text-ink transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <Link href="/projects" className="hover:text-ink transition-colors">Projects</Link>
            <ChevronRight className="w-3.5 h-3.5 text-border" />
            <span className="text-text-primary font-semibold truncate max-w-[200px]">{project.title}</span>
          </nav>
        </div>

        {/* Hero — title + subtitle */}
        <section className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 pt-10 pb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue mb-4">
            <span className="inline-block w-6 h-[2px] bg-blue" />
            Case Study
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-heading leading-none mb-3">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="text-lg sm:text-xl text-blue font-semibold">{project.subtitle}</p>
          )}
        </section>

        {/* Cover Image */}
        {project.imageUrl && (
          <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 pb-8">
            <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden border border-border bg-surface-feature shadow-card">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 pb-16 space-y-10">
          {/* Tag row */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-light text-blue border border-blue/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          {project.longDescription && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Overview</h2>
              <p className="text-text-primary text-base sm:text-lg leading-relaxed max-w-3xl">
                {project.longDescription}
              </p>
            </div>
          )}

          {/* Key Features */}
          {project.keyFeatures.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue" />
                Key Features &amp; Capabilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
                {project.keyFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl bg-bg-soft border border-border text-sm text-text-primary"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue mt-2 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture */}
          {project.architecture.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue" />
                Technical Architecture
              </h2>
              <ul className="space-y-3 max-w-2xl">
                {project.architecture.map((arch, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-text-secondary">
                    <Cpu className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                    <span>{arch}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats */}
          {project.stats.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue" />
                Impact &amp; Results
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-2xl">
                {project.stats.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-blue-light border border-blue/10 text-center"
                  >
                    <div className="text-2xl sm:text-3xl font-black text-blue">{s.value}</div>
                    <div className="text-xs font-medium text-text-secondary mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-white font-semibold text-sm transition shadow-sm shadow-blue/20"
              >
                <span>Live Preview</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-soft hover:bg-border border border-border text-text-primary font-semibold text-sm transition"
              >
                <span>Source Repository</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Back link */}
          <div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to all projects
            </Link>
          </div>

          {/* Contact CTA */}
          <div className="rounded-2xl bg-bg-soft border border-border p-8 sm:p-10 text-center space-y-4">
            <h3 className="text-2xl font-black text-text-primary">Interested in working together?</h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              I&apos;m open to new projects and collaborations. Let&apos;s build something great.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue hover:bg-blue-dark text-white font-semibold text-sm transition shadow-sm"
            >
              Get in touch
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
    </SubPageShell>
  )
}
