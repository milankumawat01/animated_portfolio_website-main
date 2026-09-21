'use client'

import { copy } from '@/data/copy'
import { stationVh } from '@/lib/curves'

/**
 * P1 STUB — replaced wholesale by the station agent that owns this file.
 * Carries the eyebrow and headline so the scroll length and the camera mapping are
 * already correct before any real content lands.
 */
export function Hero() {
  const c = copy.hero

  return (
    <section
      id="hero"
      data-station="hero"
      data-theme-section="dark"
      aria-labelledby="hero-heading"
      style={{
        position: 'relative',
        minHeight: `${stationVh('hero')}vh`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 clamp(24px, 5vw, 96px)',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', width: '100%' }}>
        <p
          style={{
            font: '600 0.75rem/1 var(--font-body)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            opacity: 0.6,
            marginBottom: 16,
          }}
        >
          {c.eyebrow}
        </p>
        <h2
          id="hero-heading"
          style={{
            font: '800 clamp(2.5rem, 5.2vw, 4.25rem)/1.02 var(--font-display)',
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          {c.headline[0]}
          <br />
          {c.headline[1].replace(/[[\]]/g, '')}
        </h2>
      </div>
    </section>
  )
}
