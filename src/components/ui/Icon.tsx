'use client'

import type { SVGProps } from 'react'

/**
 * The small stroke icons the copy asks for by name — `docs/06-CONTENT.md` labels the
 * About traits `code / bulb / users` and the Contact tiles `mail / linkedin / github
 * / file`. They are drawn here rather than pulled from a pack so they share one
 * weight and one corner radius with the rest of the system.
 *
 * All 24×24, 1.7 stroke, currentColor.
 */

const PATHS = {
  code: (
    <>
      <path d="m8.5 8-4.5 4 4.5 4" />
      <path d="m15.5 8 4.5 4-4.5 4" />
      <path d="m13.5 5-3 14" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.2" />
      <path d="M3.5 20a6 6 0 0 1 12 0" />
      <path d="M16.5 5.6a3.2 3.2 0 0 1 0 5.8" />
      <path d="M18 14.6a6 6 0 0 1 3 5.4" />
    </>
  ),
  mail: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="2.4" />
      <path d="m3.6 7.2 8.4 5.8 8.4-5.8" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.2 10.4V17" />
      <path d="M7.2 7.3v.02" />
      <path d="M11.2 17v-3.8a2.2 2.2 0 0 1 4.4 0V17" />
      <path d="M11.2 10.4V17" />
    </>
  ),
  github: (
    <path d="M9 19.3c-4.2 1.3-4.2-2.2-5.9-2.6M15 21v-3.3a2.9 2.9 0 0 0-.8-2.3c2.6-.3 5.4-1.3 5.4-5.9a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.4 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.8 5.6 5.4 5.9a2.9 2.9 0 0 0-.8 2.2V21" />
  ),
  file: (
    <>
      <path d="M14 3H7.4A2.4 2.4 0 0 0 5 5.4v13.2A2.4 2.4 0 0 0 7.4 21h9.2a2.4 2.4 0 0 0 2.4-2.4V8Z" />
      <path d="M14 3v5h5" />
      <path d="M12 11.5v5.5" />
      <path d="m9.8 14.8 2.2 2.2 2.2-2.2" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7.8 11.2 4.2 4.2 4.2-4.2" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </>
  ),
  location: (
    <>
      <path d="M19 10.4c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </>
  ),
  spark: (
    <path d="M12 3.2 13.9 9l5.8 1.9-5.8 1.9L12 18.6l-1.9-5.8L4.3 11l5.8-1.9Z" />
  ),
} as const

export type IconName = keyof typeof PATHS

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.7,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number } & Omit<
  SVGProps<SVGSVGElement>,
  'name'
>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
