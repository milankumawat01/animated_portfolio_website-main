import type { ElementType, ReactNode } from 'react'

/**
 * Off-screen for sighted users, present for assistive tech.
 *
 * `display: none` and `visibility: hidden` both remove a node from the accessibility
 * tree, and `text-indent: -9999px` breaks RTL, so this is the clip-rect recipe —
 * the same one `globals.css` exposes as `.sr-only`, expressed as a component so a
 * caller can pick the element and keep the semantics (`<li>`, `<span>`, `<p>`).
 *
 * `focusable` releases the clip when anything inside takes focus, which is what
 * turns a hidden element into a skip link.
 */

const CLIPPED: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
}

export interface VisuallyHiddenProps {
  children: ReactNode
  as?: ElementType
  className?: string
  id?: string
  role?: string
  /** live regions need these; everything else a caller might want is rare enough
   *  that adding it here beats a permissive index signature. */
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  'aria-label'?: string
}

export function VisuallyHidden({
  children,
  as = 'span',
  className,
  ...rest
}: VisuallyHiddenProps) {
  const Tag = as as React.ComponentType<React.HTMLAttributes<HTMLElement>>
  return (
    <Tag className={className} style={CLIPPED} {...rest}>
      {children}
    </Tag>
  )
}

export { CLIPPED as visuallyHiddenStyle }
