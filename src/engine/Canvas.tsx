'use client'

import { useEffect } from 'react'
import { Canvas as R3FCanvas, useFrame } from '@react-three/fiber'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { useQuality } from '@/store/useQuality'
import { CameraRig } from './CameraRig'
import { Lighting } from './Lighting'
import { SceneDirector } from './SceneDirector'
import { PostFX } from './PostFX'
import { StatsCollector } from './DebugHUD'
import { notifyFirstFrame } from './Preloader'

/** Tells the preloader the world is actually on screen. */
function FirstFrameSignal() {
  // No renderPriority — see the note in DebugHUD's StatsCollector.
  useFrame(() => notifyFirstFrame())
  return null
}

/**
 * The one persistent WebGL canvas. It is fixed, never scrolls, never unmounts, and
 * does not take pointer events — every link and button on the site is real DOM.
 * A station that needs dragging (Skills) re-enables pointer events on its own.
 */
export function Experience() {
  const ready = useQuality((s) => s.ready)
  const hasWebGL = useQuality((s) => s.hasWebGL)
  const tier = useQuality((s) => s.tier)
  const dpr = useQuality((s) => s.dpr)

  useEffect(() => {
    document.documentElement.dataset.webgl = hasWebGL ? 'on' : 'off'
  }, [hasWebGL])

  if (!ready || !hasWebGL) return null

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <R3FCanvas
        dpr={dpr}
        /**
         * R3F forces `pointerEvents: 'auto'` on the container div it creates, which
         * silently defeated the `pointer-events: none` on the wrapper above. Nothing
         * broke — the DOM overlay is z-10 and always won — but the guarantee the
         * comment describes was not real. Setting it here merges into that container.
         * A station that needs dragging re-enables it on the canvas element itself,
         * which still works: none on the parent, auto on the child.
         */
        style={{ pointerEvents: 'none' }}
        frameloop="always"
        shadows={tier === 'high'}
        gl={{
          antialias: tier !== 'low',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.outputColorSpace = SRGBColorSpace
        }}
      >
        <FirstFrameSignal />
        <CameraRig />
        <Lighting />
        <SceneDirector />
        <PostFX />
        <StatsCollector />
      </R3FCanvas>
    </div>
  )
}
