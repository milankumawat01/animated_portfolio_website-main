'use client'

import {
  siClaude,
  siCloudflare,
  siConvex,
  siCss,
  siDigitalocean,
  siDocker,
  siExpress,
  siFastapi,
  siFigma,
  siFirebase,
  siGithub,
  siGooglegemini,
  siHtml5,
  siLangchain,
  siMongodb,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siNotion,
  siPostgresql,
  siPostman,
  siPython,
  siReact,
  siRedis,
  siResend,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siUbuntu,
  siVercel,
  siX,
} from 'simple-icons'
import { ICON_MONOGRAM, MISSING_ICONS } from '@/data/techIcons'
import { cn } from '@/lib/cn'

/**
 * Resolves a technology name to its simple-icons mark.
 *
 * The imports above are explicit and the map is static on purpose. A namespace
 * import plus a dynamic lookup defeats tree-shaking and drags the entire
 * ~3,300-icon package into the client bundle — it cost 2.2MB before this was fixed.
 * Adding a technology means adding an import here.
 *
 * Five names have no mark in simple-icons@16: OpenAI, LlamaIndex, VS Code, RAG
 * (not a brand at all) and LinkedIn (dropped over trademark). The first four render
 * as a monogram tile; LinkedIn has a hand-drawn glyph in `Icon.tsx`.
 * See docs/04-ASSET-MANIFEST.md §A5.
 */

interface SimpleIcon {
  path: string
  title: string
  hex: string
}

const ICONS: Readonly<Record<string, SimpleIcon>> = {
  Python: siPython,
  FastAPI: siFastapi,
  'Node.js': siNodedotjs,
  PostgreSQL: siPostgresql,
  MongoDB: siMongodb,
  Redis: siRedis,
  Claude: siClaude,
  Gemini: siGooglegemini,
  LangChain: siLangchain,
  'Next.js': siNextdotjs,
  React: siReact,
  TypeScript: siTypescript,
  'Tailwind CSS': siTailwindcss,
  Tailwind: siTailwindcss,
  HTML: siHtml5,
  HTML5: siHtml5,
  CSS: siCss,
  CSS3: siCss,
  Supabase: siSupabase,
  Convex: siConvex,
  Cloudflare: siCloudflare,
  'Cloudflare R2': siCloudflare,
  Firebase: siFirebase,
  Docker: siDocker,
  Nginx: siNginx,
  Vercel: siVercel,
  DigitalOcean: siDigitalocean,
  Ubuntu: siUbuntu,
  GitHub: siGithub,
  Postman: siPostman,
  Figma: siFigma,
  Resend: siResend,
  Notion: siNotion,
  Express: siExpress,
  X: siX,
}

export const hasIcon = (name: string): boolean => Boolean(ICONS[name])

export interface TechLogoProps {
  name: string
  size?: number
  /** `brand` uses the vendor's own colour, `mono` inherits currentColor */
  tone?: 'brand' | 'mono'
  className?: string
  title?: boolean
}

export function TechLogo({
  name,
  size = 24,
  tone = 'mono',
  className,
  title = true,
}: TechLogoProps) {
  const icon = ICONS[name]

  if (!icon) {
    const label = ICON_MONOGRAM[name] ?? name.slice(0, 2).toUpperCase()
    const known = MISSING_ICONS.includes(name)
    return (
      <span
        role="img"
        aria-label={name}
        title={title ? name : undefined}
        data-icon-fallback={known ? 'known-gap' : 'unmapped'}
        className={cn('inline-grid place-items-center font-semibold', className)}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(4, size * 0.22),
          background: 'var(--card-sunk)',
          color: 'var(--fg-muted)',
          fontSize: Math.max(7, size * (label.length > 2 ? 0.3 : 0.38)),
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <svg
      role="img"
      aria-label={name}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={tone === 'brand' ? `#${icon.hex}` : 'currentColor'}
    >
      {title ? <title>{name}</title> : null}
      <path d={icon.path} />
    </svg>
  )
}

/** A horizontal run of marks — the hero tech strip and the skills card rows. */
export function TechRow({
  names,
  size = 22,
  tone = 'mono',
  gap = 22,
  className,
}: {
  names: readonly string[]
  size?: number
  tone?: 'brand' | 'mono'
  gap?: number
  className?: string
}) {
  return (
    <ul role="list"
      className={cn('flex list-none flex-wrap items-center p-0', className)}
      style={{ gap, margin: 0, color: 'var(--fg-muted)' }}
    >
      {/* Keyed by index too: a station may legitimately list the same tech twice. */}
      {names.map((n, i) => (
        <li key={`${n}-${i}`} className="transition-colors duration-200 hover:text-[var(--fg)]">
          <TechLogo name={n} size={size} tone={tone} />
        </li>
      ))}
    </ul>
  )
}
