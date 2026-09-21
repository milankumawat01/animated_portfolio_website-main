'use client'

import { useCallback } from 'react'
import { motion } from 'motion/react'
import {
  ArrowLink,
  CarouselNav,
  Card,
  Chip,
  Eyebrow,
  Headline,
  Reveal,
  Script,
  SectionShell,
  useStationProgress,
} from '@/components/ui'
import { copy } from '@/data/copy'
import { projects, projectsCopy } from '@/data/projects'
import { STATION_RANGES } from '@/lib/curves'
import { clamp } from '@/lib/math'
import { getLenis } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'
import { useInteraction } from '@/store/useInteraction'

/**
 * The DOM half of station 03.
 *
 * The middle of the viewport is left deliberately empty — that band is where the
 * glass slabs sit, and anything placed there would simply cover them. Copy goes
 * above, the four cards below, footer last.
 *
 * The carousel is scroll-driven, so `CarouselNav` does not move a track: it scrolls
 * the page to the progress value that puts a given slab at the centre of the arc.
 * One mechanism, two affordances.
 */

const LAST = projects.length - 1

/** Which slab the 3D has centred, from the same formula `Scene.tsx` uses. */
const indexFromProgress = (p: number): number => clamp(Math.round(p * LAST), 0, LAST)

/**
 * A link with no destination yet. It stays an `<a>` — markup a crawler and a screen
 * reader should see — but announces itself disabled and does not jump the page to
 * the top, which is all `href="#"` would otherwise do and which fights Lenis.
 * Matches the treatment in `Writing.tsx`. Delete when A9 supplies real URLs.
 */
const DEAD = {
  'aria-disabled': true,
  onClick: (e: React.MouseEvent) => e.preventDefault(),
} as const

export function Projects() {
  return (
    <SectionShell id="projects" theme="light" contained={false}>
      <ProjectsBody />
    </SectionShell>
  )
}

function ProjectsBody() {
  const c = copy.projects
  const progress = useStationProgress()
  const activeIndex = indexFromProgress(progress)
  const setInteractionHovered = useInteraction((s) => s.setHovered)
  const setHovered = useCallback(
    (id: string | null) => setInteractionHovered(id ? { station: 'projects', id } : null),
    [setInteractionHovered],
  )
  const hovered = useInteraction((s) =>
    s.hovered?.station === 'projects' ? s.hovered.id : null,
  )
  const reducedMotion = useQuality((s) => s.reducedMotion)

  const goTo = useCallback((index: number) => {
    const i = clamp(index, 0, LAST)
    const [start, end] = STATION_RANGES.projects
    const target = start + (end - start) * (i / LAST)
    const lenis = getLenis()
    // `scrollState.progress` is `lenis.scroll / lenis.limit`, so the nav has to
    // measure against the same limit or it lands on the wrong slab.
    if (lenis) {
      lenis.scrollTo(target * lenis.limit, {
        duration: 1.1,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      })
    } else {
      window.scrollTo({
        top: target * (document.body.scrollHeight - window.innerHeight),
        behavior: 'smooth',
      })
    }
  }, [])

  return (
    <div
      className="flex w-full flex-col justify-between"
      style={{ minHeight: '100svh', padding: '112px var(--gutter) 56px' }}
    >
      {/* ---------------------------------------------------------- header */}
      <div
        className="mx-auto grid w-full gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        style={{ maxWidth: 'var(--content-max)' }}
      >
        <div>
          <Reveal>
            <Eyebrow n={c.eyebrowN}>{c.eyebrow}</Eyebrow>
          </Reveal>
          <Headline
            lines={c.headline}
            id="projects-heading"
            className="mt-5"
            delay={0.05}
          />
          <Reveal delay={0.24} className="mt-6 max-w-[54ch]">
            <p className="t-body-lg" style={{ color: 'var(--fg-body)' }}>
              {c.intro}
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col items-start gap-6 lg:items-end">
          <Script rotate={-6} underline delay={0.32} className="pr-6">
            {c.scripts[0]}
          </Script>
          <Reveal delay={0.4}>
            <div className="flex items-center gap-5">
              <span className="t-eyebrow" style={{ color: 'var(--fg-muted)' }}>
                {projectsCopy.carouselLabel}
              </span>
              <CarouselNav
                label="project"
                onPrev={() => goTo(activeIndex - 1)}
                onNext={() => goTo(activeIndex + 1)}
                disabledPrev={activeIndex <= 0}
                disabledNext={activeIndex >= LAST}
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* ------------------------------------------------- cards + footer */}
      <div className="mx-auto w-full" style={{ maxWidth: 'var(--content-max)' }}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {projects.map((project, i) => {
            const isActive = i === activeIndex
            const isHovered = hovered === project.id
            return (
              <Reveal key={project.id} delay={0.24 + i * 0.06}>
                <Card
                  interactive
                  // Only the active card is frosted. Four blurred surfaces would
                  // break the design system's three-at-once cap on backdrop-filter.
                  blur={isActive}
                  onMouseEnter={() => setHovered(project.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocusCapture={() => setHovered(project.id)}
                  onBlurCapture={() => setHovered(null)}
                  data-active={isActive || undefined}
                  data-cursor="view"
                  style={{
                    padding: 20,
                    height: '100%',
                    borderColor: isActive || isHovered ? 'var(--brand)' : undefined,
                    transform:
                      reducedMotion || !(isActive || isHovered)
                        ? undefined
                        : `translateY(${isHovered ? -8 : -4}px)`,
                    boxShadow: isActive || isHovered ? 'var(--shadow-lift)' : undefined,
                  }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="t-title-sm m-0" style={{ color: 'var(--fg)' }}>
                      {project.name}
                    </h3>
                    <span
                      className="t-meta tabular-nums"
                      style={{ color: isActive ? 'var(--brand)' : 'var(--fg-muted)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <p className="t-body mt-2" style={{ color: 'var(--fg-body)' }}>
                    {project.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>

                  <div className="mt-5">
                    <ArrowLink
                      href={project.href}
                      aria-label={`${projectsCopy.cardCta}: ${project.name}`}
                      {...(project.href === '#' ? DEAD : null)}
                    >
                      {projectsCopy.cardCta}
                    </ArrowLink>
                  </div>
                </Card>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.5} className="mt-8">
          <div
            className="flex flex-wrap items-center justify-between gap-4 pt-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <span className="t-eyebrow" style={{ color: 'var(--fg-muted)' }}>
              {projectsCopy.footerLine}
            </span>
            <span
              className="t-meta inline-flex items-center gap-2"
              style={{ color: 'var(--fg-strong)' }}
            >
              {projectsCopy.footerRight}
              {reducedMotion ? (
                <span
                  aria-hidden
                  className="inline-block rounded-full"
                  style={{ width: 8, height: 8, background: 'var(--brand)' }}
                />
              ) : (
                <motion.span
                  aria-hidden
                  className="inline-block rounded-full"
                  style={{ width: 8, height: 8, background: 'var(--brand)' }}
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.82, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </span>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
