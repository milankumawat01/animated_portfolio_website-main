import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getProjects } from '@/lib/convex'

export const metadata: Metadata = {
  title: 'Projects',
  alternates: { canonical: '/projects' },
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans">
      {/* Simple static header for subpages — P3 will replace with wired Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E4E9F1] shadow-soft py-3">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="flex items-center font-extrabold text-2xl tracking-tighter">
              <span className="text-ink group-hover:text-blue transition-colors">M</span>
              <span className="text-blue transition-colors group-hover:opacity-80">K</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-ink hidden sm:inline-block">
              Milan Kumawat
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold text-text-secondary">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <Link href="/projects" className="text-ink">Projects</Link>
            <Link href="/blog" className="hover:text-ink transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
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
                    className="bg-white rounded-2xl border border-border shadow-soft hover:shadow-card hover:border-blue/30 transition-all duration-300 flex flex-col group overflow-hidden"
                  >
                    {/* Preview Image */}
                    <div className="relative w-full h-48 sm:h-52 bg-slate-950 overflow-hidden border-b border-border/60">
                      {project.imageUrl ? (
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          fill
                          className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-semibold">
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
      </main>

      {/* Footer */}
      <footer className="bg-[#070A0F] text-white border-t border-slate-800/80 py-8">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>© 2026 Milan Kumawat. All rights reserved.</div>
          <Link href="/" className="hover:text-white transition-colors">← Back to home</Link>
        </div>
      </footer>
    </div>
  )
}
