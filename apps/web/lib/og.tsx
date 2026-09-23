import { ImageResponse } from 'next/og'

// Shared 1200×630 social card. Colors are the literal values of the design tokens
// (--surface-feature, --blue, --text-on-dark) — satori cannot read CSS variables.
export const OG_SIZE = { width: 1200, height: 630 }

const FEATURE = '#080B10'
const BLUE = '#1677FF'
const ON_DARK = '#F7F9FC'

export function ogCard({
  eyebrow,
  title,
  subtitle,
  footer,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  footer?: string
}) {
  const titleSize = title.length > 60 ? 60 : title.length > 36 ? 72 : 88

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: FEATURE,
          backgroundImage: `radial-gradient(circle at 85% 15%, rgba(22,119,255,0.35), transparent 45%)`,
          color: ON_DARK,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, letterSpacing: -2 }}>
            <span>M</span>
            <span style={{ color: BLUE }}>K</span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: BLUE,
              fontWeight: 700,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: 'flex', fontSize: 32, lineHeight: 1.35, opacity: 0.72 }}>
              {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            opacity: 0.6,
          }}
        >
          <span>Milan Kumawat</span>
          <span>{footer ?? 'milankumawat.in'}</span>
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
