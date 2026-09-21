import { ImageResponse } from 'next/og'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { heroStack, profile } from '@/data/profile'

/**
 * The social card, drawn — not screenshotted.
 *
 * Screenshotting the 3D would need a headless GPU in the build, would change every
 * time a station is tuned, and at 1200×630 the particle monogram reads as noise.
 * This is the hero's *composition* in flat vector: the same near-black, the same
 * blue bloom off to the right where the mark sits, the monogram, the name, the role.
 *
 * FONTS. Satori embeds a real font binary; it cannot use a `next/font` handle and it
 * cannot read woff2. The order below is deliberate:
 *   1. `public/fonts/Sora-*.ttf` if it is there — this is where asset A6 lands, and
 *      dropping the file in is the only change needed to get the display face.
 *   2. Google Fonts, fetched as TTF, with a short timeout.
 *   3. Satori's bundled sans.
 * Step 3 is what an offline build ships, and the layout is built for it: it leans on
 * scale, weight and colour rather than on the typeface being Sora.
 *
 * ONE TRAP, found the hard way. Satori reads the style object straight off the JSX
 * element — it never passes through React DOM, which is the thing that normally
 * drops `undefined` values. So `style={{ fontFamily: maybeUndefined }}` does not
 * render without a family, it **throws inside the response stream**, and the request
 * dies with an empty reply rather than a 500. Hence `FONT_STYLE`: either the key is
 * there with a string, or the key is not there at all.
 */

export const alt = `${profile.name} — ${profile.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BRAND = '#3B82F6'
const INK = '#05080E'

/** The A1 placeholder mark, recoloured. Satori renders SVG via a data URI. */
const MONOGRAM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><path fill="${BRAND}" d="M56 372 L56 140 L92 140 L152 232 L212 140 L248 140 L248 372 L212 372 L212 200 L152 292 L92 200 L92 372 Z"/><path fill="${BRAND}" d="M272 140 L308 140 L308 238 L400 140 L448 140 L348 246 L456 372 L408 372 L322 270 L308 286 L308 372 L272 372 Z"/></svg>`

const MONOGRAM_URI = `data:image/svg+xml;base64,${Buffer.from(MONOGRAM).toString('base64')}`

/** Google's CSS2 endpoint only serves TTF to a user agent that cannot take woff2. */
const LEGACY_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Version/5.1 Safari/534.30'

async function loadDisplayFont(weight: number): Promise<ArrayBuffer | null> {
  // 1 — the self-hosted face, once A6 lands.
  for (const name of [`Sora-${weight}.ttf`, 'Sora-Bold.ttf', 'Satoshi-Bold.ttf']) {
    try {
      const file = join(process.cwd(), 'public', 'fonts', name)
      if (existsSync(file)) {
        const buf = readFileSync(file)
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
      }
    } catch {
      /* fall through */
    }
  }

  // 2 — Google Fonts, best effort. A build with no network gets null, not an error.
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Sora:wght@${weight}`,
      { headers: { 'User-Agent': LEGACY_UA }, signal: AbortSignal.timeout(4000) },
    ).then((r) => (r.ok ? r.text() : ''))
    const url = /src:\s*url\((https:[^)]+)\)\s*format\('truetype'\)/.exec(css)?.[1]
    if (!url) return null
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
    return res.ok ? await res.arrayBuffer() : null
  } catch {
    return null
  }
}

export default async function Image() {
  const [bold, semi] = await Promise.all([loadDisplayFont(800), loadDisplayFont(600)])

  const fonts = [
    bold ? { name: 'Display', data: bold, weight: 800 as const, style: 'normal' as const } : null,
    semi ? { name: 'Display', data: semi, weight: 600 as const, style: 'normal' as const } : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null)

  /** Present only when there is a font to name. See the note at the top. */
  const FONT_STYLE = fonts.length > 0 ? { fontFamily: 'Display' } : {}

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: INK,
          padding: 72,
          position: 'relative',
          ...FONT_STYLE,
        }}
      >
        {/* the bloom where the particle mark sits in the real hero */}
        <div
          style={{
            position: 'absolute',
            top: -220,
            right: -180,
            width: 860,
            height: 860,
            borderRadius: 999,
            background:
              'radial-gradient(circle, rgba(59,130,246,0.34) 0%, rgba(59,130,246,0.10) 46%, rgba(5,8,14,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -320,
            left: -200,
            width: 820,
            height: 820,
            borderRadius: 999,
            background:
              'radial-gradient(circle, rgba(29,78,216,0.26) 0%, rgba(5,8,14,0) 68%)',
          }}
        />

        {/* --------------------------------------------------------- top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MONOGRAM_URI} width={52} height={52} alt="" />
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#8B9AAF',
              fontWeight: 600,
            }}
          >
            milankumawat.in
          </div>
        </div>

        {/* ----------------------------------------------------------- name */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 128,
              lineHeight: 1,
              letterSpacing: -5,
              fontWeight: 800,
              color: '#F2F6FC',
            }}
          >
            {profile.firstName}
            <span style={{ color: BRAND, marginLeft: 26 }}>{profile.lastName}</span>
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 34,
              fontWeight: 600,
              color: '#B9C6D8',
            }}
          >
            {profile.role}
          </div>
        </div>

        {/* -------------------------------------------------------- bottom */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 26,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, maxWidth: 760 }}>
            {heroStack.map((tech) => (
              <div
                key={tech}
                style={{
                  display: 'flex',
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: 21,
                  color: '#B9C6D8',
                }}
              >
                {tech}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#8B9AAF' }}>
            {profile.location}
          </div>
        </div>

      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  )
}
