'use client'

import { create } from 'zustand'

/**
 * TEMPORARY, LOCAL TO THIS STATION — migrate into `store/useInteraction.ts` in P4.
 *
 * The scene bible wires the contact tiles' hover through `useInteraction().hovered`,
 * but P4 has not landed and P3H may not write outside `scenes/contact` +
 * `sections/Contact.tsx`. So the link between the four DOM contact tiles and the
 * four 3D glass panels lives here for now. Projects (`useProjectHover`) and Skills
 * (`useSkillHover`) both did exactly the same thing; P4 absorbs all three.
 *
 * Migration for P4: this is the whole contract. `hovered` is a `ContactTileId` —
 * which is also the tile's `Icon` name, because the copy happens to use one per
 * tile — never an index. Replace the two imports in `GlassPanels.tsx` and
 * `sections/Contact.tsx` with the global store and delete this file.
 *
 * Read it from `useFrame` with `useTileHover.getState().hovered` — never subscribe
 * a 3D component to it, or the panels re-render on every pointer move.
 */

/** Tile order is the order of `copy.contact.tiles`, and of the 3D panels. */
export const CONTACT_TILE_IDS = ['mail', 'linkedin', 'github', 'file'] as const

export type ContactTileId = (typeof CONTACT_TILE_IDS)[number]

interface TileHoverStore {
  hovered: ContactTileId | null
  setHovered: (id: ContactTileId | null) => void
}

export const useTileHover = create<TileHoverStore>((set) => ({
  hovered: null,
  setHovered: (id) => set((s) => (s.hovered === id ? s : { hovered: id })),
}))
