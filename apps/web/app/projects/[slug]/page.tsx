import Image from 'next/image'
import { ArrowDown, ArrowLeft, ArrowRight, BarChart3, Code2, ExternalLink, Layers, MessageSquare, UsersRound } from 'lucide-react'
import { ProjectMark } from '@/components/ProjectMark'
import { ProjectGallery } from '@/components/ProjectGallery'
import { ProjectArchitecture } from '@/components/ProjectArchitecture'
import { OpenContactButton } from '@/components/modals/ModalTriggers'
import { GithubIcon } from '@/components/icons/SocialIcons'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import type { Metadata } from 'next'
import { openGraph } from '@/lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
  const project = await getProject(slug).catch(() => null)
  if (!project) notFound()
  const settings = await getSiteSettings().catch(() => null)
  const images = [...new Set([project.imageUrl ?? '', ...(project.galleryUrls ?? [])].filter(Boolean))]
  const featureIcons = [UsersRound, MessageSquare, BarChart3, Layers, Code2]
  const headings: Record<string, [string, string]> = {
    salezo: ['Automating sales across', 'every channel.'],
    hiro: ['One hiring workspace.', 'A clearer recruitment journey.'],
    'employee-portal': ['Everyday work,', 'in one place.'],
    'internal-tools': ['Visitor management.', 'Built around people.'],
    'kontent-ops': ['Creative production,', 'with a clearer workflow.'],
    'raas-rang': ['Dance. Learn.', 'Improve.'],
    'minaxi-marketing': ['A local business.', 'A digital storefront.'],
    daamji: ['Traditional sweets.', 'A modern ordering experience.'],
    'banarsi-cafe': ['From the table', 'to the kitchen.'],
    'yolo-trips': ['Discover destinations.', 'Plan the next adventure.'],
  }
  const [heading, highlight] = headings[project.slug] ?? ['A considered experience.', 'Built for real people.']
  const workLabel = project.workType === 'company' ? 'Company project' : project.workType === 'freelance' ? 'Freelance project' : 'Personal project'
  return <SubPageShell settings={settings} appearance="dark">
    <JsonLd data={creativeWorkSchema(project)} />
    <div className="case-container case-breadcrumb"><Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects' }, { name: project.title, href: `/projects/${project.slug}` }]} /></div>
    <section className="case-hero">
      <div className="case-container">
        <p className="case-eyebrow"><span />Case study</p>
        <h1>{project.title}</h1>
        <p className="case-subtitle">{project.subtitle}</p>
        <p className="case-intro">{project.description}</p>
        <div className="case-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        <div className="case-work-context"><span>{workLabel}</span>{project.company && <span>{project.company}</span>}{project.buildMethod && project.buildMethod !== 'unspecified' && <span>{project.buildMethod === 'manual' ? 'Manually built' : 'AI-assisted'}</span>}</div>
        <div className="case-actions">
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="case-primary">Visit Live Site <ExternalLink size={16} /></a>}
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="case-secondary"><GithubIcon className="h-4 w-4" />View Code</a>}
        </div>
      </div>
      <div className="case-device-scene">
        <div className="case-device">
          <div className="case-device-screen"><span className="case-device-camera" />{project.imageUrl ? <Image src={project.imageUrl} alt={`${project.title} product preview`} fill sizes="(max-width: 767px) 95vw, 1100px" className="object-contain" preload /> : <div className="case-device-placeholder"><ProjectMark slug={project.slug} /><h2>{project.title}</h2><p>{project.subtitle}</p><span>Preview images will be added soon</span></div>}</div>
          <div className="case-device-base"><span /></div>
        </div>
        <div className="case-device-ground" />
      </div>
      <a href="#overview" className="case-scroll"><ArrowDown size={18} /><span>Scroll to explore</span></a>
    </section>
    <div className="case-container case-content">
      <section id="overview" className="case-overview">
        <div><p className="case-section-label"><span>01</span><i />Overview</p><h2 className="case-heading">{heading}<br /><em>{highlight}</em></h2><p className="case-body">{project.longDescription}</p>{project.contribution && <p className="case-contribution">{project.contribution}</p>}{project.role && <p className="case-contribution">Role: {project.role}</p>}</div>
        <aside className="case-project-summary"><ProjectMark slug={project.slug} /><h3>{project.title}</h3><p>{project.subtitle}</p><dl><div><dd>{project.tags.length || '?'}</dd><dt>Technologies</dt></div><div><dd>{project.keyFeatures.length}</dd><dt>Capabilities</dt></div><div><dd>{images.length || 'Soon'}</dd><dt>Previews</dt></div></dl></aside>
      </section>
      {project.keyFeatures.length > 0 && <section><p className="case-section-label"><span>02</span><i />Key features &amp; capabilities<b /></p><div className="case-feature-grid">{project.keyFeatures.map((feature, index) => { const Icon = featureIcons[index % featureIcons.length]; const [title, ...detail] = feature.split(' — '); return <article key={feature}><span className="case-feature-icon"><Icon size={21} strokeWidth={1.6} /></span><h3>{title}</h3>{detail.length > 0 && <p>{detail.join(' — ')}</p>}</article> })}</div></section>}
      {project.tags.length > 0 && <section><p className="case-section-label"><span>03</span><i />Tech stack<b /></p><div className="case-tags case-tech-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></section>}
      {project.architecture.length > 0 && <section className="case-architecture"><div><p className="case-section-label"><span>04</span><i />Technical architecture</p><h2 className="case-heading case-architecture-heading">{project.slug === 'salezo' ? 'A modern frontend with a clear state layer.' : 'The technology behind the experience.'}</h2><ul>{project.architecture.map(item => <li key={item}>{item}</li>)}</ul></div><ProjectArchitecture project={project} /></section>}
      {images.length > 1 && <section><p className="case-section-label"><span>05</span><i />Explore the product<b /></p><ProjectGallery title={project.title} urls={images} variant="showcase" /></section>}
      {project.stats.length > 0 && <section><p className="case-section-label"><span>06</span><i />Project results<b /></p><dl className="case-results">{project.stats.map(stat => <div key={stat.label}><dd>{stat.value}</dd><dt>{stat.label}</dt></div>)}</dl></section>}
      {project.caseStudyUrl && <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="case-external-study">Read the full external case study <ExternalLink size={16} /></a>}
      <Link href="/projects" className="case-back"><ArrowLeft size={16} />Back to all projects</Link>
      <section className="case-contact"><div className="case-contact-ribbon" aria-hidden="true" /><div><p className="case-eyebrow">Let?s work together</p><h2>Interested in working<br /><em>together?</em></h2><p>I?m open to new projects and collaborations.<br />Let?s build something great.</p><OpenContactButton>Get in touch<ArrowRight size={17} /></OpenContactButton></div></section>
    </div>
  </SubPageShell>
}
