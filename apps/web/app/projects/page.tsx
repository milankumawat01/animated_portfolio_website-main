import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getProjects, getSiteSettings } from '@/lib/convex'
import { SubPageShell } from '@/components/SubPageShell'
import { openGraph } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'AI products, backend platforms and internal tools built and shipped by Milan Kumawat.',
  alternates: { canonical: '/projects' },
  openGraph: openGraph('/projects', {
    type: 'website',
    title: 'Projects | Milan Kumawat',
    description: 'AI products, backend platforms and internal tools built and shipped by Milan Kumawat.',
  }),
}

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()])

  return (
    <SubPageShell settings={settings}>
        {/* Page Header */}
        <section className="py-16 sm:py-20 bg-bg-soft border-b border-border">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue mb-4">
              <span className="inline-block w-6 h-[2px] bg-blue" />
              Portfolio
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-heading leading-none">
              Projects that<br />
              <span className="text-blue">create real impact.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
              A showcase of the systems, products, and ideas I&apos;ve built — from AI-powered platforms to scalable backend services.
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
            {projects.length === 0 ? (
              <div className="text-center py-24 text-text-muted text-sm font-medium">
                No projects published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project.slug}`}
                    className="bg-surface-elevated rounded-2xl border border-border shadow-soft hover:shadow-card hover:border-blue/30 transition-all duration-300 flex flex-col group overflow-hidden"
                  >
                    {/* Preview Image */}
                    <div className="relative w-full h-48 sm:h-52 bg-surface-feature overflow-hidden border-b border-border/60">
                      {project.imageUrl ? (
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          fill
                          className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-on-dark/40 text-xs font-semibold">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h2 className="text-xl font-black text-text-primary group-hover:text-blue transition-colors">
                          {project.title}
                        </h2>
                        {project.subtitle && (
                          <p className="text-xs text-blue font-semibold">{project.subtitle}</p>
                        )}
                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        {/* Tech Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-bg-soft text-text-secondary border border-border/80 group-hover:border-blue/20 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 4 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-bg-soft text-text-muted border border-border/80">
                              +{project.tags.length - 4}
                            </span>
                          )}
                        </div>

                        {/* View Link */}
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue group-hover:text-blue-dark transition-colors">
                            <span>Full case study</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
    </SubPageShell>
  )
}
