'use client'

import { useCallback } from 'react'
import {
  Card,
  Eyebrow,
  Headline,
  Quote,
  Reveal,
  Script,
  SectionShell,
  TechRow,
} from '@/components/ui'
import { copy } from '@/data/copy'
import { skills, skillsCopy } from '@/data/skills'
import { useInteraction } from '@/store/useInteraction'

/**
 * 05 — SKILLS & STACK.
 *
 * Two things about this overlay are load-bearing:
 *
 * 1. THE SECTION IS `pointer-events: none`, and only the pieces that need a pointer
 *    — the six category cards, the quote, the badge card — turn it back on. Skills
 *    is the one station where the canvas takes pointer events, and a full-viewport
 *    section would otherwise swallow every drag before it reached the graph.
 *
 * 2. The content sits in the LEFT column on a wide viewport. `scenes/skills/Scene`
 *    pushes the graph into the open right-hand third to match; the two layouts are
 *    a pair and should move together.
 *
 * Hovering a card highlights exactly that cluster in 3D through `useSkillHover` —
 * a local stand-in for P4's `useInteraction`, see that file's header.
 */

/** A2 — `workspace.jpg` does not exist yet, so the side card is a brand-gradient
 *  block. The "Always learning / Always building" badge is on it either way; when
 *  the photo lands it drops straight in behind the same badge. */
const GRADIENT: React.CSSProperties = {
  background:
    'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 48%, #6FA8F5 100%)',
}

function CategoryCard({ index, id }: { index: number; id: string }) {
  const category = skills[index]
  const setInteractionHovered = useInteraction((s) => s.setHovered)
  const setHovered = useCallback(
    (id: string | null) => setInteractionHovered(id ? { station: 'skills', id } : null),
    [setInteractionHovered],
  )

  const enter = useCallback(() => setHovered(id), [setHovered, id])
  const leave = useCallback(() => setHovered(null), [setHovered])

  return (
    <Card
      interactive
      // Focusable and named, so it works — but without a role a screen reader
      // announces an unnamed group, and an axe run flags a bare div[tabindex].
      role="group"
      tabIndex={0}
      aria-label={`${category.title} — ${category.sub}`}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={leave}
      className="pointer-events-auto px-5 py-4 transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1"
    >
      <h3 className="t-title-sm" style={{ color: 'var(--fg)' }}>
        {category.title}
      </h3>
      <p className="t-meta mt-1">{category.sub}</p>
      <TechRow names={category.items} size={19} gap={16} className="mt-4" />
    </Card>
  )
}

export function Skills() {
  const c = copy.skills

  return (
    <SectionShell id="skills" theme="light" className="pointer-events-none">
      <div className="flex flex-col gap-8 lg:gap-10">
        {/* ------------------------------------------------ header band */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow n={c.eyebrowN}>{c.eyebrow}</Eyebrow>
            </Reveal>
            <Headline lines={c.headline} id="skills-heading" className="mt-4" delay={0.05} />
          </div>

          <div className="flex flex-col gap-4">
            <Reveal delay={0.18}>
              <p className="t-body-lg" style={{ maxWidth: '46ch' }}>
                {c.intro}
              </p>
            </Reveal>
            <Script rotate={-4} delay={0.34} underline className="self-start">
              {c.scripts[0]}
            </Script>
          </div>
        </div>

        {/* ------------------------------------------------- main band */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16">
          {/* left — the six categories */}
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {skills.map((category, i) => (
                <Reveal key={category.id} delay={0.24 + i * 0.06}>
                  <CategoryCard index={i} id={category.id} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.6}>
              <p
                className="t-eyebrow"
                style={{ color: 'var(--brand)', fontWeight: 700 }}
              >
                {skillsCopy.kicker}
              </p>
            </Reveal>

            <Reveal delay={0.66} className="pointer-events-auto">
              <Quote by={c.quote.by} className="max-w-[46ch]">
                {c.quote.text}
              </Quote>
            </Reveal>
          </div>

          {/* right — the graph lives here. Only the badge card takes pointer
              events; everything above it stays open sky, which is both the
              composition and the region the drag-orbit needs. */}
          <div className="flex flex-col justify-end gap-5">
            <Reveal delay={0.46} className="pointer-events-auto self-end">
              <Card className="w-[min(300px,100%)] overflow-hidden">
                <div
                  aria-hidden
                  className="relative"
                  style={{ ...GRADIENT, aspectRatio: '16 / 10' }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(120% 90% at 18% 12%, rgba(255,255,255,0.32), transparent 62%)',
                    }}
                  />
                </div>
                <div className="flex items-baseline gap-2 px-5 py-4">
                  <span className="t-title-sm" style={{ color: 'var(--fg)' }}>
                    {skillsCopy.photoBadgeTop}
                  </span>
                  <span aria-hidden style={{ color: 'var(--border)' }}>
                    /
                  </span>
                  <span className="t-meta">{skillsCopy.photoBadgeBottom}</span>
                </div>
              </Card>
            </Reveal>

            <Script rotate={3} delay={0.62} className="self-end">
              {c.scripts[1]}
            </Script>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
