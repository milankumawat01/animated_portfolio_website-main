/**
 * The design-system kit. Station agents import everything from here:
 *
 *   import { SectionShell, Headline, Eyebrow, Card, Chip } from '@/components/ui'
 *
 * If a station needs a component that is not in this file, that is a gap in P2 —
 * file a cross-phase request in docs/STATUS.md rather than inventing one locally.
 */
export { SectionShell, useStation, useStationProgress } from './SectionShell'
export type { SectionShellProps } from './SectionShell'

export { Reveal, RevealGroup, REVEAL_THRESHOLD } from './Reveal'
export type { RevealProps } from './Reveal'

export { Headline } from './Headline'
export type { HeadlineProps } from './Headline'

export { Eyebrow } from './Eyebrow'
export { Script } from './Script'
export type { ScriptProps } from './Script'

export {
  Card,
  Chip,
  IconTile,
  ArrowLink,
  Button,
  Quote,
  StatBlock,
  CarouselNav,
  Monogram,
} from './primitives'
export type { CardProps, ButtonProps } from './primitives'

export { TechLogo, TechRow, hasIcon } from './TechLogo'
export type { TechLogoProps } from './TechLogo'

export { CodeBlock } from './CodeBlock'
export type { CodeBlockProps } from './CodeBlock'

export { Icon } from './Icon'
export type { IconName } from './Icon'
