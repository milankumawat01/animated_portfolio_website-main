'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, Fog } from 'three'
import { scenes } from '@/scenes'
import { STATION_ANCHORS } from '@/lib/curves'
import { lerp, lerpHex, smoothstep } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'
import { DEFAULT_MOUNT_PADDING, type StationId } from './types'

/**
 * Mounts and unmounts stations by scroll range, places each one at its world anchor,
 * and cross-fades the environment between the two nearest stations.
 *
 * Environments are interpolated between station *centres*, not edges. That puts the
 * whole transition across the boundary — the background has finished changing by the
 * time you are properly inside the next station, which is what makes the hand-off
 * read as a fade rather than a switch.
 */

/**
 * Which stations are mounted right now.
 *
 * `mountPadding` deliberately keeps a neighbour alive across every boundary, so the
 * renderer's draw-call total is almost never one station's cost alone. The debug HUD
 * reads this to compare against the SUM of the mounted stations' budgets — otherwise
 * a station looks over budget purely because its neighbour is warming up, which is
 * exactly what happened to About sitting next to Projects.
 */
export const mountedStations: StationId[] = ['hero']

/** Blended environment for the current frame. `Lighting` reads this. */
export const envState = {
  background: '#05080E',
  fogColor: '#05080E',
  fogNear: 6,
  fogFar: 40,
  /** 1 = fully dark station, 0 = fully light station */
  darkness: 1,
  theme: 'dark' as 'dark' | 'light',
}

const CENTRES = scenes.map((s) => (s.range[0] + s.range[1]) / 2)

const blendEnvironment = (progress: number) => {
  let i = 0
  while (i < CENTRES.length - 1 && progress > CENTRES[i + 1]) i++

  const a = scenes[i]
  const b = scenes[Math.min(i + 1, scenes.length - 1)]
  const c0 = CENTRES[i]
  const c1 = CENTRES[Math.min(i + 1, CENTRES.length - 1)]

  let t = 0
  if (c1 > c0) t = smoothstep(c0, c1, progress)
  if (progress <= CENTRES[0]) t = 0

  envState.background = lerpHex(a.environment.background, b.environment.background, t)
  envState.fogColor = lerpHex(a.environment.fogColor, b.environment.fogColor, t)
  envState.fogNear = lerp(a.environment.fogNear, b.environment.fogNear, t)
  envState.fogFar = lerp(a.environment.fogFar, b.environment.fogFar, t)

  const darkA = a.environment.theme === 'dark' ? 1 : 0
  const darkB = b.environment.theme === 'dark' ? 1 : 0
  envState.darkness = lerp(darkA, darkB, t)
  envState.theme = t < 0.5 ? a.environment.theme : b.environment.theme
}

const bgColor = new Color()
const fogColor = new Color()

export function SceneDirector() {
  const scene = useThree((s) => s.scene)
  const quality = useQuality((s) => s.tier)
  const reducedMotion = useQuality((s) => s.reducedMotion)

  /**
   * Quantized progress. The `progress` prop in the SceneProps contract comes from
   * here, so it steps rather than sliding — anything that needs true per-frame
   * precision reads `scrollState.localProgress` inside its own useFrame.
   */
  const [tick, setTick] = useState(0)
  const [mounted, setMounted] = useState<readonly StationId[]>(['hero'])
  const lastTick = useRef(-1)
  const lastBg = useRef('')
  const lastTheme = useRef<'dark' | 'light' | ''>('')

  useEffect(() => {
    scene.fog = new Fog(envState.fogColor, envState.fogNear, envState.fogFar)
    scene.background = bgColor.set(envState.background)
    return () => {
      scene.fog = null
    }
  }, [scene])

  useFrame(() => {
    const progress = scrollState.progress

    blendEnvironment(progress)

    if (scene.fog instanceof Fog) {
      scene.fog.color.set(fogColor.set(envState.fogColor))
      scene.fog.near = envState.fogNear
      scene.fog.far = envState.fogFar
    }
    scene.background = bgColor.set(envState.background)

    // The DOM overlay recolours from these two. Only touch the DOM on a real change.
    if (envState.background !== lastBg.current) {
      lastBg.current = envState.background
      document.documentElement.style.setProperty('--page-bg', envState.background)
    }
    if (envState.theme !== lastTheme.current) {
      lastTheme.current = envState.theme
      document.documentElement.setAttribute('data-theme', envState.theme)
    }

    const next = Math.round(progress * 500)
    if (next !== lastTick.current) {
      lastTick.current = next
      setTick(next)

      const nowMounted = scenes
        .filter((m) => {
          const pad = m.mountPadding ?? DEFAULT_MOUNT_PADDING
          return progress >= m.range[0] - pad && progress <= m.range[1] + pad
        })
        .map((m) => m.id)

      if (
        mountedStations.length !== nowMounted.length ||
        mountedStations.some((id, i) => id !== nowMounted[i])
      ) {
        mountedStations.length = 0
        mountedStations.push(...nowMounted)
      }

      setMounted((prev) =>
        prev.length === nowMounted.length && prev.every((id, i) => id === nowMounted[i])
          ? prev
          : nowMounted,
      )
    }
  })

  const progress = tick / 500

  return (
    <>
      {scenes.map((manifest) => {
        if (!mounted.includes(manifest.id)) return null
        const [start, end] = manifest.range
        const raw = end > start ? (progress - start) / (end - start) : 0
        const local = raw < 0 ? 0 : raw > 1 ? 1 : raw
        const anchor = STATION_ANCHORS[manifest.id]
        const Scene = manifest.Scene

        return (
          <group key={manifest.id} position={anchor} name={`station-${manifest.id}`}>
            <Suspense fallback={null}>
              <Scene
                progress={local}
                active={scrollState.activeStation === manifest.id}
                quality={quality}
                reducedMotion={reducedMotion}
              />
            </Suspense>
          </group>
        )
      })}
    </>
  )
}
