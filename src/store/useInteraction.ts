'use client'

import { create } from 'zustand'
import type { StationId } from '@/engine/types'

/**
 * The one interaction store.
 *
 * Wave 4 shipped before this file existed, so Projects, Skills and Contact each
 * grew an identical local hover store. All three are folded in here and deleted.
 *
 * **Read this from `useFrame` with `useInteraction.getState()`, never as a
 * subscription.** A hovered slab that re-renders its siblings on every pointer move
 * is the exact cost this store exists to avoid.
 */

export type CursorVariant = 'default' | 'link' | 'drag' | 'view' | 'hidden'

export interface HoverTarget {
  station: StationId
  /** a stable id — `Project.id`, a skills category id, a contact tile id */
  id: string
}

interface InteractionState {
  hovered: HoverTarget | null
  cursorVariant: CursorVariant
  /** normalized -1..1, damped, written by Cursor's raf */
  pointer: { x: number; y: number }
  audioEnabled: boolean
  /** Konami: pulses the hero monogram wherever you are, for 3 seconds */
  easterEgg: boolean

  setHovered: (target: HoverTarget | null) => void
  /** convenience for the common case of "the hovered thing in station X" */
  hoveredIn: (station: StationId) => string | null
  setCursorVariant: (v: CursorVariant) => void
  setAudioEnabled: (on: boolean) => void
  setEasterEgg: (on: boolean) => void
}

export const useInteraction = create<InteractionState>((set, get) => ({
  hovered: null,
  cursorVariant: 'default',
  pointer: { x: 0, y: 0 },
  audioEnabled: false,
  easterEgg: false,

  setHovered: (target) =>
    set((s) => {
      const a = s.hovered
      if (a === target) return s
      if (a && target && a.station === target.station && a.id === target.id) return s
      return { hovered: target }
    }),

  hoveredIn: (station) => {
    const h = get().hovered
    return h && h.station === station ? h.id : null
  },

  setCursorVariant: (v) => set((s) => (s.cursorVariant === v ? s : { cursorVariant: v })),
  setAudioEnabled: (on) => set({ audioEnabled: on }),
  setEasterEgg: (on) => set({ easterEgg: on }),
}))

/**
 * Non-reactive read for `useFrame`. Returns the hovered id within a station, or null.
 *
 *   const hovered = hoveredIdIn('projects')   // inside useFrame
 */
export const hoveredIdIn = (station: StationId): string | null => {
  const h = useInteraction.getState().hovered
  return h && h.station === station ? h.id : null
}

/** Live pointer, mutated in place by `Cursor`. Safe to read every frame. */
export const pointerState = { x: 0, y: 0 }
