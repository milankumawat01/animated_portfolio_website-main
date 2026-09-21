'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Card,
  Chip,
  Eyebrow,
  Headline,
  Icon,
  IconTile,
  Quote,
  Reveal,
  Script,
  SectionShell,
  useStationProgress,
} from '@/components/ui'
import type { IconName } from '@/components/ui'
import { copy } from '@/data/copy'
import { experience, experienceRail } from '@/data/experience'
import { useQuality } from '@/store/useQuality'
import { MARKER_PROGRESS } from '@/scenes/experience/Helix'

/**
 * 04 — EXPERIENCE.
 *
 * THE LAYOUT IS A CHANNEL. The camera looks straight down the helix axis for most
 * of the station, so the tube of light lands dead centre of the frame. The overlay
 * is built as two outer columns with a deliberately empty one between them, and
 * the 3D climbs up the gap.
 *
 * THE TIMELINE IS A FILMSTRIP. The three roles are a real `<ol role="list">` — a list of jobs
 * that is not a list is an accessibility failure — inside a masked window that
 * slides so the role the camera is level with sits in the middle. The thresholds
 * come from `scenes/experience/Helix`, the same constants that place the rings, so
 * a card and its ring cannot drift apart.
 *
 * ORDER IS CHRONOLOGICAL, EARLIEST FIRST. `data/experience` is newest-first, as a
 * CV should be, and this station reverses it: the camera climbs, the left rail
 * says "from intern to engineer, with increasing ownership", and running the
 * timeline the other way would have the visitor descending through a career.
 *
 * KNOWN LIMIT — the third card is never truly centred. `SectionShell`'s 100vh
 * sticky child pins for `H − 100vh`, which on a 192vh station is local 0 → 0.479.
 * Cards one and two are centred on their markers inside that window; by the third
 * marker at 0.80 the whole block is 65vh up the viewport and no transform inside
 * this file can put it back without overlapping Skills. So the strip still slides
 * to card three — it lands high in the frame rather than centred — and the
 * highlight, the rail dot and the ring in 3D all still arrive together. Fixing it
 * properly needs the shell to pin for the full station.
 */

const RAIL_ICONS: readonly IconName[] = ['code', 'users', 'spark']

/** Earliest first, to climb with the camera. */
const ROLES = [...experience].reverse()

/** Halfway between one marker and the next — where the strip hands over. */
const HANDOVER = MARKER_PROGRESS.slice(0, -1).map(
  (p, i) => (p + MARKER_PROGRESS[i + 1]) / 2,
)

const activeIndexAt = (p: number): number => {
  let i = 0
  while (i < HANDOVER.length && p >= HANDOVER[i]) i++
  return i
}

function Timeline({ active }: { active: number }) {
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const windowRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const [offset, setOffset] = useState(0)

  const measure = useCallback(() => {
    const view = windowRef.current
    const item = itemRefs.current[active]
    if (!view || !item) return
    // offsetTop is relative to the <ol role="list">, which is the positioned ancestor.
    setOffset(view.clientHeight / 2 - (item.offsetTop + item.offsetHeight / 2))
  }, [active])

  useLayoutEffect(measure, [measure])

  useEffect(() => {
    const view = windowRef.current
    const list = listRef.current
    if (!view || !list || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(view)
    ro.observe(list)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div
      ref={windowRef}
      className="relative w-full"
      style={{
        height: 'clamp(300px, 50vh, 470px)',
        // The strip runs past the window at both ends; feathering the edges is
        // what makes that read as a timeline rather than as clipped content.
        maskImage:
          'linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%)',
      }}
    >
      <ol role="list"
        ref={listRef}
        className="relative m-0 flex list-none flex-col gap-5 p-0"
        style={{
          transform: `translate3d(0, ${offset}px, 0)`,
          transition: reducedMotion
            ? 'none'
            : 'transform 720ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      >
        {ROLES.map((role, i) => {
          const on = i === active
          return (
            <li
              key={role.id}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              aria-current={on ? 'step' : undefined}
              style={{
                opacity: on ? 1 : 0.34,
                transform: on ? 'scale(1)' : 'scale(0.965)',
                transformOrigin: 'left center',
                transition: reducedMotion
                  ? 'opacity 200ms linear'
                  : 'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1), transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Elevation on a wrapper, active border on an overlay, rather
                  than a `style` prop on `Card`. `Card` spread `{...rest}` after
                  its own `style=` for most of tonight, so a `style` prop replaced
                  the whole object — background, radius and border included — and
                  every timeline card rendered transparent with the helix drawing
                  through the text. P2 has since fixed the spread order; this
                  shape also keeps `Card`'s own shadow token intact, so it stays. */}
              <div
                style={{
                  borderRadius: 'var(--r-lg)',
                  boxShadow: on
                    ? '0 1px 2px rgba(10,18,32,.05), 0 18px 44px rgba(10,18,32,.10)'
                    : 'none',
                  transition: 'box-shadow 420ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
              <Card className="relative px-6 py-4">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    borderRadius: 'var(--r-lg)',
                    border: `1.5px solid ${on ? 'var(--brand)' : 'transparent'}`,
                    transition: 'border-color 420ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className="t-eyebrow"
                    style={{ color: 'var(--brand)', fontWeight: 700 }}
                  >
                    {role.marker}
                  </span>
                  <span className="t-meta">{role.period}</span>
                </div>

                <h3 className="t-title-md mt-2" style={{ color: 'var(--fg-strong)' }}>
                  {role.company}
                </h3>
                <p className="t-title-sm" style={{ color: 'var(--brand)' }}>
                  {role.title}
                </p>

                <ul role="list" className="mt-3 flex list-none flex-col gap-1.5 p-0">
                  {role.bullets.map((bullet) => (
                    <li key={bullet} className="t-body flex gap-3">
                      <span
                        aria-hidden
                        className="mt-[0.55em] h-[5px] w-[5px] shrink-0 rounded-full"
                        style={{ background: 'var(--brand)' }}
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap gap-2">
                  {role.tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
              </Card>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** The climb, as a DOM object: a filling rail with a stop per year marker. */
function ClimbRail({ progress, active }: { progress: number; active: number }) {
  return (
    <div
      aria-hidden
      className="relative hidden w-[3px] shrink-0 self-stretch rounded-full lg:block"
      style={{ background: 'var(--border)' }}
    >
      <span
        className="absolute inset-x-0 bottom-0 rounded-full"
        style={{
          height: `${Math.min(progress, 1) * 100}%`,
          background: 'linear-gradient(to top, var(--brand-600), var(--brand-400))',
          transition: 'height 240ms linear',
        }}
      />
      {MARKER_PROGRESS.map((p, i) => (
        <span
          key={p}
          className="absolute left-1/2 rounded-full"
          style={{
            bottom: `${p * 100}%`,
            width: i === active ? 13 : 9,
            height: i === active ? 13 : 9,
            marginLeft: i === active ? -6.5 : -4.5,
            background: i <= active ? 'var(--brand)' : 'var(--card-bg)',
            border: '2px solid var(--brand)',
            boxShadow: i === active ? '0 0 0 5px rgba(37,99,235,0.16)' : undefined,
            transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      ))}
    </div>
  )
}

export function Experience() {
  return (
    <SectionShell id="experience" theme="light">
      <ExperienceContent />
    </SectionShell>
  )
}

/**
 * `useStationProgress` reads the context `SectionShell` provides, so it can only
 * be called from INSIDE the shell — a hook call in `Experience` itself sits above
 * the provider and silently returns the out-of-station default of 1, which would
 * peg the timeline to its last card forever.
 */
function ExperienceContent() {
  const c = copy.experience
  const progress = useStationProgress()
  const active = activeIndexAt(progress)

  return (
    <div className="grid gap-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.2fr)_minmax(0,0.92fr)] lg:items-center lg:gap-8">
      {/* ------------------------------------------------------ left column.
          All of the copy lives here so the timeline on the right can be
          vertically centred against the whole block: the active card has to
          land at eye level, which is where the year ring is. */}
      <div className="flex flex-col gap-5">
        <Reveal>
          <Eyebrow n={c.eyebrowN}>{c.eyebrow}</Eyebrow>
        </Reveal>

        <Headline lines={c.headline} id="experience-heading" delay={0.05} />

        <Reveal delay={0.18}>
          <p className="t-body-lg" style={{ maxWidth: '48ch' }}>
            {c.intro}
          </p>
        </Reveal>

        <Script rotate={-4} delay={0.3} underline className="self-start">
          {c.scripts[0]}
        </Script>

        <ul role="list" className="mt-1 flex list-none flex-col gap-4 p-0">
          {experienceRail.map((item, i) => (
            <Reveal as="li" key={item.title} delay={0.36 + i * 0.07}>
              <div className="flex gap-4">
                <IconTile>
                  <Icon name={RAIL_ICONS[i]} size={20} />
                </IconTile>
                <div>
                  <h3 className="t-title-sm" style={{ color: 'var(--fg-strong)' }}>
                    {item.title}
                  </h3>
                  <p className="t-meta mt-1" style={{ maxWidth: '34ch' }}>
                    {item.sub}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.58}>
          <Quote by={c.quote.by} className="max-w-[42ch]">
            {c.quote.text}
          </Quote>
        </Reveal>

        <Script rotate={3} delay={0.66} className="self-start">
          {c.scripts[1]}
        </Script>
      </div>

      {/* ------------------------------------------------- the light channel.
          Empty on purpose: the camera looks straight down the helix axis, so
          the tube climbs through this gap. Do not fill it. */}
      <div aria-hidden className="hidden lg:block" />

      {/* ----------------------------------------------------- the roles */}
      <Reveal delay={0.26} className="flex min-w-0 gap-5">
        <ClimbRail progress={progress} active={active} />
        <Timeline active={active} />
      </Reveal>
    </div>
  )
}
