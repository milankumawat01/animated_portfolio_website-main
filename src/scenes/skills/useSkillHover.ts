'use client'

import { create } from 'zustand'

/**
 * TEMPORARY, LOCAL STORE — migrate into P4's `store/useInteraction.ts`.
 *
 * The scene bible drives the cluster highlight through `useInteraction`, which does
 * not exist yet. Rather than block on P4 or reach into a file this phase does not
 * own, Skills carries its own one-field store with the same shape the interaction
 * store will need:
 *
 *   { hoveredCategory: string | null, setHoveredCategory(id) }
 *
 * When P4 lands, move these two members onto `useInteraction`, update the two call
 * sites (`sections/Skills.tsx` writes, `scenes/skills/Graph.tsx` reads) and delete
 * this file. Nothing else imports it.
 *
 * The 3D side reads it with `useSkillHover.getState()` inside `useFrame`, never as a
 * subscription — hover must not re-render the graph.
 */
export interface SkillHoverState {
  /** `id` of the hovered category in `data/skills.ts`, or null */
  hoveredCategory: string | null
  setHoveredCategory: (id: string | null) => void
}

export const useSkillHover = create<SkillHoverState>((set) => ({
  hoveredCategory: null,
  setHoveredCategory: (id) => set({ hoveredCategory: id }),
}))
