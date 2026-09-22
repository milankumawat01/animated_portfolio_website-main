'use client'

import { Suspense, memo, useCallback, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Color,
  Fog,
  WebGLRenderTarget,
  type Camera,
  type Group,
  type Object3D,
  type Scene,
  type WebGLRenderer,
} from 'three'
import { scenes } from '@/scenes'
import { STATION_ANCHORS } from '@/lib/curves'
import { lerp, lerpHex, smoothstep } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'
import { DEFAULT_MOUNT_PADDING, type QualityTier, type StationId } from './types'
import { useFirstFrame } from './Preloader'
import { isDebug } from './quality'
import { StationLightHost, attachLightHosts } from './StationLights'

/**
 * Mounts stations, places each one at its world anchor, shows the ones near the
 * camera, and cross-fades the environment between the two nearest stations.
 *
 * Environments are interpolated between station *centres*, not edges. That puts the
 * whole transition across the boundary — the background has finished changing by the
 * time you are properly inside the next station, which is what makes the hand-off
 * read as a fade rather than a switch.
 *
 * ## Mounting, and why it no longer stutters
 *
 * Mounting a station used to be the single worst thing this site did. The chunk was
 * fetched, the geometry built and the shaders linked on the frame the camera
 * arrived — and a WebGL driver links a program synchronously. A CPU profile of one
 * read-through scroll spent 7.4s of 21s inside `getProgramInfoLog`, in stalls of
 * 0.9–2.8 SECONDS, one at every station boundary. No amount of easing survives that.
 *
 * So mounting is decoupled from arrival, in three steps:
 *
 *  1. **Prefetch.** Every station's chunk is imported during idle time after the
 *     first frame, while the visitor is still reading the hero.
 *  2. **Compile off the hot path.** The station mounts *invisible* and is handed to
 *     `renderer.compileAsync`, which uses `KHR_parallel_shader_compile` to link on
 *     the driver's own threads without blocking. The renderer skips an invisible
 *     group, so nothing can force a synchronous link before the warm-up gets there.
 *  3. **Keep it.** Once warm, a station stays mounted and is toggled with
 *     `object.visible` — free — instead of being torn down and paying the whole
 *     cost again on the way back up.
 *
 * On the `low` tier only step 1 applies: holding eight stations' buffers resident is
 * the worse trade on the devices that tier means, so those keep the mount window.
 */

/**
 * Which stations are actually being RENDERED right now — the ones whose draw calls
 * land in `gl.info`. The debug HUD reads this to compare against the SUM of their
 * budgets, because a station is almost never on screen alone: a neighbour is kept
 * visible across every boundary so nothing pops at the seam.
 *
 * This is the *visible* set, not the mounted one. Warm stations waiting off in the
 * dark are mounted but invisible, and an invisible group costs nothing to draw.
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

/** Precomputed visibility window per station — `find()` has no business in a frame. */
const WINDOWS: readonly { id: StationId; lo: number; hi: number }[] = scenes.map((m) => {
  const pad = m.mountPadding ?? DEFAULT_MOUNT_PADDING
  return { id: m.id, lo: m.range[0] - pad, hi: m.range[1] + pad }
})

/**
 * Colour blend steps across a boundary.
 *
 * `lerpHex` allocates a string and the result is written to a CSS custom property on
 * the root element. Unstepped, that is a style invalidation every 16ms for the whole
 * of every boundary crossing — a profiled scroll spent 2.5s in style recalculation.
 * 128 steps is far more than the eye resolves in a ~1.5s cross-fade.
 */
const BLEND_STEPS = 128

const lastBlend = { t: -1, i: -1 }

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

  // Numeric fields stay continuous; only the string-producing ones are stepped.
  envState.fogNear = lerp(a.environment.fogNear, b.environment.fogNear, t)
  envState.fogFar = lerp(a.environment.fogFar, b.environment.fogFar, t)

  const darkA = a.environment.theme === 'dark' ? 1 : 0
  const darkB = b.environment.theme === 'dark' ? 1 : 0
  envState.darkness = lerp(darkA, darkB, t)
  envState.theme = t < 0.5 ? a.environment.theme : b.environment.theme

  const stepped = Math.round(t * BLEND_STEPS) / BLEND_STEPS
  if (stepped === lastBlend.t && i === lastBlend.i) return
  lastBlend.t = stepped
  lastBlend.i = i
  envState.background = lerpHex(a.environment.background, b.environment.background, stepped)
  envState.fogColor = lerpHex(a.environment.fogColor, b.environment.fogColor, stepped)
}

const bgColor = new Color()
const fogColor = new Color()

const inRange = (id: StationId, progress: number): boolean => {
  for (const w of WINDOWS) {
    if (w.id === id) return progress >= w.lo && progress <= w.hi
  }
  return false
}

/**
 * Station id → its group. Module scope because there is exactly one SceneDirector
 * and the slots need to register without a prop that would defeat their memo.
 */
const stationGroups = new Map<StationId, Group>()

/** Scratch for the per-frame visibility pass. Hoisted — a frame must not allocate. */
const visibleNow: StationId[] = []

// ---------------------------------------------------------------------------
// Warm-up helpers
// ---------------------------------------------------------------------------

const wait = (ms: number): Promise<void> => new Promise((r) => window.setTimeout(r, ms))

const idle = (timeout = 2000): Promise<void> =>
  new Promise((resolve) => {
    const ric = (
      window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => number }
    ).requestIdleCallback
    if (ric) ric(() => resolve(), { timeout })
    else window.setTimeout(resolve, 32)
  })

/** Resolve once `predicate` holds, checked once a frame, giving up after `frames`. */
const until = (predicate: () => boolean, frames = 60): Promise<boolean> =>
  new Promise((resolve) => {
    let left = frames
    const step = () => {
      if (predicate()) return resolve(true)
      if (--left <= 0) return resolve(false)
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })

const hasDrawable = (root: Object3D): boolean => {
  let found = false
  root.traverse((o) => {
    const m = o as { isMesh?: boolean; isPoints?: boolean; isLine?: boolean; isSprite?: boolean }
    if (m.isMesh || m.isPoints || m.isLine || m.isSprite) found = true
  })
  return found
}

/**
 * Link every program in `object` without blocking the main thread.
 *
 * `compileAsync(object, camera, targetScene)` walks the object for materials and the
 * target scene for lights, so the object must already be attached — which it is,
 * invisible, by the time this runs.
 *
 * ## Why a render target has to be bound
 *
 * three.js derives two of the values in a material's program cache key from whatever
 * render target is bound AT COMPILE TIME:
 *
 *     outputColorSpace: target === null ? renderer.outputColorSpace : workingColorSpace
 *     toneMapping:      target === null ? renderer.toneMapping      : NoToneMapping
 *
 * `EffectComposer` renders the scene into its own buffer, so every real draw on this
 * site happens with a target bound. Compiling with none produced a program with a
 * different cache key than the one the renderer would go on to ask for — so the
 * warm-up linked a full set of shaders that were never used, and the station
 * relinked from scratch the moment it became visible anyway. The stalls got smaller
 * and did not go away, which is exactly what that looks like.
 *
 * `compileAsync` reads the target inside the synchronous `compile()` on its first
 * line, so the target only has to be bound across the CALL, not across the await —
 * which matters, because leaving one bound between frames would break rendering.
 */
const compileAsync = async (
  gl: WebGLRenderer,
  object: Object3D,
  camera: Camera,
  scene: Scene,
  target: WebGLRenderTarget | null,
): Promise<void> => {
  if (typeof gl.compileAsync !== 'function') return
  const previous = gl.getRenderTarget()
  try {
    if (target) gl.setRenderTarget(target)
    const done = gl.compileAsync(object, camera, scene)
    gl.setRenderTarget(previous)
    await done
  } catch {
    // A compile failure is the renderer's to report, not a reason to stop warming
    // the stations after it.
    gl.setRenderTarget(previous)
  }
}

/**
 * `?debug=1` readout. The test harness waits on `__warmup.done` before timing a
 * scroll, because a run started mid-warm-up measures the warm-up.
 *
 * `parallel` is the honest answer to "is this actually off the main thread?" —
 * without `KHR_parallel_shader_compile` three.js has no way to poll link status and
 * `compileAsync` degrades to a plain `compile` on the next task.
 */
const warmupProbe = { done: false, stations: [] as StationId[], parallel: false }

// ---------------------------------------------------------------------------
// Station slot
// ---------------------------------------------------------------------------

interface SlotProps {
  id: StationId
  progress: number
  active: boolean
  quality: QualityTier
  reducedMotion: boolean
}

/**
 * One station's subtree, memoized.
 *
 * `SceneDirector` re-renders on every 0.2% of page progress. Without the memo all
 * eight mounted stations reconciled on each of those steps; with it only the one or
 * two whose own local progress actually moved do any work — for the rest `progress`
 * is clamped to a constant 0 or 1 and they bail out at the memo boundary.
 *
 * Visibility is deliberately not a prop: it changes at a boundary and would force a
 * re-render of the whole subtree to set one boolean. The group registers itself
 * below and `SceneDirector` writes `group.visible` from its own `useFrame`.
 */
const StationSlot = memo(function StationSlot({
  id,
  progress,
  active,
  quality,
  reducedMotion,
}: SlotProps) {
  const manifest = scenes.find((s) => s.id === id)

  /**
   * Hidden the instant it attaches unless the camera is already there. A station
   * that mounts visible would be drawn on the very next frame, and drawing it is
   * what forces the synchronous shader link this whole file exists to avoid.
   */
  const attach = useCallback(
    (group: Group | null) => {
      if (group) {
        group.visible = inRange(id, scrollState.progress)
        stationGroups.set(id, group)
      } else {
        stationGroups.delete(id)
      }
    },
    [id],
  )

  if (!manifest) return null
  const Scene = manifest.Scene

  return (
    <group ref={attach} position={STATION_ANCHORS[id]} name={`station-${id}`}>
      <Suspense fallback={null}>
        <StationLightHost id={id}>
          <Scene
            progress={progress}
            active={active}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        </StationLightHost>
      </Suspense>
    </group>
  )
})

// ---------------------------------------------------------------------------

export function SceneDirector() {
  const scene = useThree((s) => s.scene)
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const quality = useQuality((s) => s.tier)
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const firstFrame = useFirstFrame()

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

  /**
   * `low` still tears a station down when it leaves the window. Everywhere else a
   * station that has been mounted once is kept, which is what turns a boundary
   * crossing into a `visible` flag rather than a rebuild.
   */
  const retain = quality !== 'low'

  useEffect(() => {
    scene.fog = new Fog(envState.fogColor, envState.fogNear, envState.fogFar)
    scene.background = bgColor.set(envState.background)
    const detachLights = attachLightHosts(scene)
    return () => {
      scene.fog = null
      detachLights()
    }
  }, [scene])

  /**
   * THE WARM-UP PASS.
   *
   * Runs once, after the first frame is on screen, and walks the stations in page
   * order: fetch the chunk, mount it invisible, link its programs asynchronously,
   * move on. Every step yields to idle first, so none of it competes with the hero
   * for the frames the visitor is actually looking at.
   */
  useEffect(() => {
    if (!firstFrame) return
    let cancelled = false

    if (isDebug()) {
      warmupProbe.parallel =
        gl.extensions?.get('KHR_parallel_shader_compile') !== null &&
        gl.extensions?.get('KHR_parallel_shader_compile') !== undefined
      const w = window as unknown as {
        __warmup: typeof warmupProbe
        __three: { gl: WebGLRenderer; scene: Scene; camera: Camera }
      }
      w.__warmup = warmupProbe
      // The renderer, for a harness that needs to ask the scene graph a question —
      // "how many lights are visible right now" has no other honest answer.
      w.__three = { gl, scene, camera }
    }

    /**
     * A 1×1 stand-in for the composer's buffer. Its size and format are irrelevant —
     * the two cache-key fields above only test whether a target is bound at all.
     *
     * `retain` is `tier !== 'low'`, which is also exactly when `PostFX` mounts a
     * composer. At `low` the scene draws straight to the canvas with no target
     * bound, so the honest answer there is `null` — and the warm-up does not run
     * anyway.
     */
    const warmTarget = retain ? new WebGLRenderTarget(1, 1) : null

    const run = async () => {
      // Let the hero settle before spending anything on stations nobody can see.
      await wait(900)

      for (const manifest of scenes) {
        if (cancelled) return

        await idle()
        if (cancelled) return

        if (manifest.preload) {
          try {
            await manifest.preload()
          } catch {
            // Offline, or a chunk that failed to fetch. Leave the station cold: it
            // will mount the old way when the camera reaches it, rather than never.
            continue
          }
        }
        if (cancelled) return

        // On `low` the prefetch above is the whole warm-up. Mounting stops here.
        if (!retain) continue

        setMounted((prev) => (prev.includes(manifest.id) ? prev : [...prev, manifest.id]))

        // Wait for React to commit and R3F to attach the objects before compiling.
        await until(() => {
          const g = stationGroups.get(manifest.id)
          return !!g && hasDrawable(g)
        })
        if (cancelled) return

        const group = stationGroups.get(manifest.id)
        if (group) await compileAsync(gl, group, camera, scene, warmTarget)
        warmupProbe.stations.push(manifest.id)
      }

      /**
       * Second pass. Textures that decode after the first one — the desk screen, the
       * project stills, the paper — swap a material's map and mark it for a rebuild,
       * which means a fresh program. Sweeping the scene once more catches those
       * while the visitor is still near the top of the page.
       */
      if (!retain) {
        warmupProbe.done = true
        return
      }
      await wait(2500)
      if (cancelled) return
      await compileAsync(gl, scene, camera, scene, warmTarget)
      warmupProbe.done = true
    }

    void run()
    return () => {
      cancelled = true
      warmTarget?.dispose()
    }
  }, [firstFrame, retain, quality, scene, gl, camera])

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

    /**
     * Visibility, every frame, with no React involved.
     *
     * `visibleNow` is rebuilt rather than updated on a flip. A station that mounts
     * while ALREADY in range attaches visible and never flips, so a flip-driven
     * update silently left it out of `mountedStations` — and the budget harness,
     * which sums the budgets of the stations it names, then compared a two-station
     * frame against one station's allowance.
     */
    visibleNow.length = 0
    for (const w of WINDOWS) {
      const group = stationGroups.get(w.id)
      if (!group) continue
      const show = progress >= w.lo && progress <= w.hi
      if (group.visible !== show) group.visible = show
      if (show) visibleNow.push(w.id)
    }

    if (
      visibleNow.length !== mountedStations.length ||
      visibleNow.some((id, i) => id !== mountedStations[i])
    ) {
      mountedStations.length = 0
      mountedStations.push(...visibleNow)
    }

    const next = Math.round(progress * 500)
    if (next !== lastTick.current) {
      lastTick.current = next
      setTick(next)

      const needed = WINDOWS.filter((w) => progress >= w.lo && progress <= w.hi).map((w) => w.id)

      setMounted((prev) => {
        if (retain) {
          /**
           * The fallback path: a visitor who reaches the footer before the warm-up
           * does still gets the station, just cold. Nothing is ever removed here.
           */
          const missing = needed.filter((id) => !prev.includes(id))
          return missing.length === 0 ? prev : [...prev, ...missing]
        }
        return prev.length === needed.length && prev.every((id, i) => id === needed[i])
          ? prev
          : needed
      })
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

        return (
          <StationSlot
            key={manifest.id}
            id={manifest.id}
            progress={local}
            active={scrollState.activeStation === manifest.id}
            quality={quality}
            reducedMotion={reducedMotion}
          />
        )
      })}
    </>
  )
}
