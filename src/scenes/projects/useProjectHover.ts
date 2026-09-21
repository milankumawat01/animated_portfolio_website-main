'use client'

import { create } from 'zustand'

/**
 * TEMPORARY, LOCAL TO THIS STATION — migrate into `store/useInteraction.ts` in P4.
 *
 * The scene bible wires Projects' hover through `useInteraction().hovered`, but P4
 * has not landed yet and P3C may not write outside `scenes/projects` +
 * `sections/Projects.tsx`. So the link between the DOM cards and the 3D slabs lives
 * here for now.
 *
 * Migration for P4: this is the whole contract. Replace the two imports in
 * `Scene.tsx` / `Slab.tsx` / `sections/Projects.tsx` with the global store, keep the
 * id-based shape (`hovered` is a `Project.id`, not an index), and delete this file.
 *
 * Read it from `useFrame` with `useProjectHover.getState().hovered` — never
 * subscribe a 3D component to it, or every slab re-renders on every hover.
 */

interface ProjectHoverStore {
  /** `Project.id` of the hovered project, or null */
  hovered: string | null
  setHovered: (id: string | null) => void
}

export const useProjectHover = create<ProjectHoverStore>((set) => ({
  hovered: null,
  setHovered: (id) => set((s) => (s.hovered === id ? s : { hovered: id })),
}))
