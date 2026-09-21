'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CodeBlock,
  Eyebrow,
  Headline,
  Quote,
  Reveal,
  Script,
  SectionShell,
  useStationProgress,
} from '@/components/ui'
import { copy } from '@/data/copy'
import { buildScript, pillars, process } from '@/data/process'

/**
 * 06 — HOW I BUILD.
 *
 * COMPOSED FOR A SHELL THAT UNPINS EARLY. `SectionShell`'s sticky child holds for
 * `H − 100vh`, and this station is 153.6vh, so the overlay is pinned for the first
 * ~35% of local progress and then scrolls away. Everything therefore has to land as
 * ONE screen inside that window — no second beat further down the station, no
 * content that only arrives at 0.6. What happens after 0.35 is the 3D: the camera
 * leaves the copy behind and dollies along the finished pipeline.
 *
 * The five steps are an `<ol role="list">` and each checklist a `<ul role="list">`, which is both the
 * correct semantics for an ordered process and what the P6 a11y pass audits.
 */

const Tick = () => (
  <svg
    aria-hidden
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M2.5 6.4 L4.8 8.7 L9.5 3.6"
      stroke="var(--brand)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * The `build.sh` block.
 *
 * `CodeBlock` restarts its typewriter whenever the station goes inactive and then
 * active again, so scrolling up past this station and back down retypes the whole
 * script. That component belongs to P2 and I do not own it, so the fix is local:
 * once the station has been read through, the `typewriter` prop is dropped for
 * good, which makes the block resolve to its full text immediately on every later
 * entry. Same component instance throughout — nothing remounts, nothing flashes.
 */
function BuildCode() {
  const progress = useStationProgress()
  const [typed, setTyped] = useState(false)

  useEffect(() => {
    if (!typed && progress >= 0.4) setTyped(true)
  }, [typed, progress])

  return (
    <CodeBlock
      code={buildScript.code}
      filename={buildScript.filename}
      badge={buildScript.badge}
      typewriter={!typed}
    />
  )
}

export function Build() {
  const c = copy.build

  return (
    <SectionShell id="build" theme="light">
      <div className="flex flex-col gap-7 lg:gap-9">
        {/* ------------------------------------------------ header band */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-14">
          <div>
            <Reveal>
              <Eyebrow n={c.eyebrowN}>{c.eyebrow}</Eyebrow>
            </Reveal>
            <Headline lines={c.headline} id="build-heading" className="mt-4" delay={0.05} />
          </div>

          <div className="flex flex-col items-start gap-3">
            <Reveal delay={0.18}>
              <p className="t-body-lg" style={{ maxWidth: '52ch' }}>
                {c.intro}
              </p>
            </Reveal>
            <Script rotate={-3} delay={0.34} underline>
              {c.scripts[0]}
            </Script>
          </div>
        </div>

        {/* -------------------------------------------------- main band */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
          {/* left — the script, the promise */}
          <div className="flex flex-col gap-6">
            <Reveal delay={0.24}>
              <BuildCode />
            </Reveal>

            <Reveal delay={0.44}>
              <Quote by={c.quote.by} className="max-w-[44ch]">
                {c.quote.text}
              </Quote>
            </Reveal>
          </div>

          {/* right — the five steps, in order */}
          <ol role="list" className="flex flex-col gap-3">
            {process.map((step, i) => (
              <Reveal as="li" key={step.n} delay={0.28 + i * 0.06}>
                <Card className="flex items-start gap-4 px-5 py-4">
                  <span
                    aria-hidden
                    className="t-meta"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontWeight: 600,
                      color: 'var(--brand)',
                      paddingTop: 2,
                    }}
                  >
                    {step.n}
                  </span>

                  <div className="min-w-0">
                    <h3 className="t-title-sm" style={{ color: 'var(--fg)' }}>
                      {step.title}
                    </h3>
                    <p className="t-meta mt-0.5">{step.description}</p>

                    <ul role="list" className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {step.checklist.map((item) => (
                        <li key={item} className="t-meta flex items-center gap-1.5">
                          <Tick />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* -------------------------------------------------- bottom bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          <Reveal delay={0.62} className="min-w-0 flex-1">
            <Card className="overflow-hidden">
              {/* 1px gaps over a border-coloured backing draw the dividers, so the
                  bar reads the same whether it wraps to two columns or four. */}
              <div
                className="grid grid-cols-2 gap-px md:grid-cols-4"
                style={{ background: 'var(--border)' }}
              >
                {pillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="flex flex-col gap-1 px-5 py-4"
                    style={{ background: 'var(--card-bg)' }}
                  >
                    <span className="t-title-sm" style={{ color: 'var(--fg)' }}>
                      {pillar.title}
                    </span>
                    <span className="t-meta">{pillar.sub}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Script rotate={2} delay={0.74} className="shrink-0 self-end lg:self-center">
            {c.scripts[1]}
          </Script>
        </div>
      </div>
    </SectionShell>
  )
}
