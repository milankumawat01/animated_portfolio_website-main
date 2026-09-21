'use client'

import { Cursor } from './Cursor'
import { StationTransition } from './StationTransition'
import { Konami } from './Konami'

/**
 * Everything in the interaction layer, mounted once.
 *
 * `app/page.tsx` is P1's and otherwise frozen; it gains exactly one line for this,
 * so P4 has a mount point without reaching into the page for each component.
 *
 * There is deliberately no audio system. The A8 assets were never supplied, and the
 * phase brief is explicit that omitting it beats shipping a toggle that does nothing.
 */
export function InteractionLayer() {
  return (
    <>
      <Cursor />
      <StationTransition />
      <Konami />
    </>
  )
}
