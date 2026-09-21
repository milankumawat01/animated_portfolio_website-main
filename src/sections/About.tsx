'use client'

import {
  Card,
  Eyebrow,
  Headline,
  Icon,
  IconTile,
  Quote,
  Reveal,
  Script,
  SectionShell,
} from '@/components/ui'
import { copy } from '@/data/copy'

/**
 * 02 — ABOUT ME.
 *
 * COMPOSED FOR THE PIN LENGTH, NOT FOR THE STATION LENGTH. `SectionShell`'s sticky
 * child pins for `H − 100vh`, and this station is 153.6vh, so the overlay holds
 * still for roughly the first 35% of local progress and then scrolls up and out.
 * That is deliberately in step with the 3D: the desk is 22 units away and still
 * assembling while the copy is on screen, and the camera has closed to 9 units and
 * finished its orbit by the time the copy has gone. Everything here therefore has
 * to have arrived by `p ≈ 0.3` — nothing is placed low enough to need a late
 * reveal, and nothing waits for a scroll that will not come.
 *
 * The two columns leave the middle-right of the viewport open, which is where the
 * desk sits once the camera has come round. The cards are deliberately NOT `blur`
 * variants: the design system caps the page at three frosted surfaces and Projects
 * and Writing have already claimed them.
 */
export function About() {
  const c = copy.about

  return (
    <SectionShell id="about" theme="light">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.58fr)] lg:gap-20">
        {/* ------------------------------------------------------ left column */}
        <div className="flex flex-col gap-7">
          <Reveal>
            <Eyebrow n={c.eyebrowN}>{c.eyebrow}</Eyebrow>
          </Reveal>

          <Headline lines={c.headline} id="about-heading" delay={0.05} />

          <Reveal delay={0.2}>
            <p className="t-body-lg" style={{ maxWidth: '54ch' }}>
              {c.body}
            </p>
          </Reveal>

          {/* three traits — code / bulb / users, exactly as the copy names them */}
          <div className="grid gap-4 sm:grid-cols-3">
            {c.traits.map((trait, i) => (
              <Reveal key={trait.title} delay={0.28 + i * 0.06} className="h-full">
                <Card className="flex h-full flex-col gap-3 px-5 py-5">
                  <IconTile>
                    <Icon name={trait.icon} />
                  </IconTile>
                  <div>
                    <h3 className="t-title-sm" style={{ color: 'var(--fg)' }}>
                      {trait.title}
                    </h3>
                    <p className="t-meta mt-1">{trait.sub}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Reveal delay={0.46}>
              <span
                className="inline-flex items-center gap-2 t-meta"
                style={{
                  background: 'var(--card-sunk)',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  padding: '7px 14px',
                  color: 'var(--fg-strong)',
                }}
              >
                <span style={{ color: 'var(--brand)', display: 'inline-flex' }}>
                  <Icon name="location" size={15} />
                </span>
                {c.photoPin}
              </span>
            </Reveal>

            <Script rotate={-5} delay={0.52} underline>
              {c.scripts[0]}
            </Script>
          </div>

          <Reveal delay={0.58}>
            <Quote by={c.quote.by} className="max-w-[46ch]">
              {c.quote.text}
            </Quote>
          </Reveal>
        </div>

        {/* ----------------------------------------------------- right column */}
        <div className="flex flex-col gap-4">
          <Reveal delay={0.22}>
            <p className="t-eyebrow" style={{ color: 'var(--fg-muted)' }}>
              {c.railHeading}
            </p>
          </Reveal>

          {c.rail.map((item, i) => (
            <Reveal key={item.title} delay={0.3 + i * 0.07}>
              <Card className="flex items-start gap-4 px-5 py-4">
                <span
                  aria-hidden
                  className="mt-1 shrink-0"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: 'var(--brand)',
                  }}
                />
                <div>
                  <h3 className="t-title-sm" style={{ color: 'var(--fg)' }}>
                    {item.title}
                  </h3>
                  <p className="t-meta mt-1">{item.sub}</p>
                </div>
              </Card>
            </Reveal>
          ))}

          <Script rotate={3} delay={0.6} className="mt-2 self-end">
            {c.scripts[1]}
          </Script>
        </div>
      </div>
    </SectionShell>
  )
}
