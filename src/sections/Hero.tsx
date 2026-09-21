'use client'

import {
  Button,
  Eyebrow,
  Headline,
  Icon,
  Reveal,
  Script,
  SectionShell,
  StatBlock,
  TechRow,
} from '@/components/ui'
import { copy } from '@/data/copy'
import { heroStack, profile, stats } from '@/data/profile'

/**
 * 01 — HERO, the DOM half.
 *
 * The particle monogram owns the right of the frame, so the type stays in a single
 * left column and stops well short of it. Everything enters on the shared reveal —
 * `Headline`, `Reveal` and `Script` all read the station's progress themselves, so
 * there is nothing to wire up here beyond the delays that set the cadence.
 *
 * `ScrollHint` is mounted globally by `app/page.tsx`; do not add a second one.
 */

const c = copy.hero

export function Hero() {
  return (
    <SectionShell id="hero" theme="dark">
      <div className="flex flex-col" style={{ gap: 'clamp(24px, 3.2vw, 40px)' }}>
        <div style={{ maxWidth: '62ch' }}>
          <Reveal at={0}>
            <Eyebrow>{c.eyebrow}</Eyebrow>
          </Reveal>

          <Headline
            lines={c.headline}
            as="h1"
            size="xl"
            id="hero-heading"
            className="mt-5"
            at={0}
          />

          <Reveal delay={0.28} at={0}>
            <p className="t-body-lg mt-6" style={{ maxWidth: '46ch' }}>
              {c.sub}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.4} at={0}>
          <div className="flex flex-wrap items-center" style={{ gap: 14 }}>
            <Button
              href="#projects"
              variant="primary"
              icon={<Icon name="arrowRight" size={18} />}
            >
              {c.primaryCta}
            </Button>
            <Button
              href={profile.resume}
              variant="ghost"
              download="Milan_Kumawat_Resume.pdf"
              icon={<Icon name="download" size={18} />}
            >
              {c.ghostCta}
            </Button>

            <Script rotate={-6} delay={0.72} at={0} className="ml-2 hidden sm:inline-block">
              {c.scripts[0]}
            </Script>
          </div>
        </Reveal>

        <Reveal delay={0.5} at={0}>
          <StatBlock stats={stats} />
        </Reveal>

        <Reveal delay={0.6} at={0}>
          <div className="flex flex-col" style={{ gap: 14 }}>
            <p className="t-eyebrow m-0">{c.stripLabel}</p>
            <TechRow names={heroStack} size={24} gap={26} />
          </div>
        </Reveal>

        <Reveal delay={0.7} at={0}>
          <p className="t-meta m-0" style={{ maxWidth: '32ch' }}>
            {c.sideNote}
          </p>
        </Reveal>
      </div>
    </SectionShell>
  )
}
