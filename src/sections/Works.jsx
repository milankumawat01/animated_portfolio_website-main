import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa'
import { projects, projectFilters } from '../data/content'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'

export default function Works() {
  const [filter, setFilter] = useState('All')

  const visible =
    filter === 'All' ? projects : projects.filter((p) => p.tags.includes(filter))

  return (
    <section id="works" className="relative bg-dark py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-25" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading kicker="Portfolio" title="SELECTED" accent="WORK" />

          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-2">
              {projectFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    filter === f
                      ? 'gradient-bg text-white'
                      : 'border border-white/12 text-white/50 hover:border-white/35 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <motion.div layout className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <motion.article
                key={project.title}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col overflow-hidden rounded-2xl glass glass-hover gradient-border"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-70 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-black/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-white/80 backdrop-blur"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-white transition-colors group-hover:gradient-text">
                    {project.title}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-accent-orange">{project.tech}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/45">
                    {project.description}
                  </p>

                  {(project.demo || project.code) && (
                    <div className="mt-4 flex gap-4 border-t border-line pt-4">
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-white/70 transition-colors hover:text-accent-orange"
                        >
                          <FaExternalLinkAlt size={10} /> Live
                        </a>
                      )}
                      {project.code && (
                        <a
                          href={project.code}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-white/70 transition-colors hover:text-accent-pink"
                        >
                          <FaGithub size={12} /> Code
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
