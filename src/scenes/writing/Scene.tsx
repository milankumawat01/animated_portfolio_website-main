'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry, Quaternion, Vector3, type Group } from 'three'
import type { SceneProps } from '@/engine/types'
import { focusAtDistance, postState } from '@/engine/PostFX'
import { STATION_ANCHORS, STATION_RANGES } from '@/lib/curves'
import { damp, smoothstep } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { articles } from '@/data/articles'
import { SHEET_H, SHEET_W, Sheet, type FieldDrive } from './Sheet'
import { SheetField } from './SheetField'

/**
 * 07 — WRITING · "Thoughts in the air"
 *
 * Four printed pages and fourteen blank ones, falling toward the lens through
 * empty white sky. FIVE DRAW CALLS: one per cover, one for the whole blank field,
 * nothing else. The station adds no lights — the key lives in `paper.frag` as a
 * fixed view-space direction, which is both cheaper and a better model of a sheet
 * of paper in a bright room than any DirectionalLight aimed at a field that moves.
 *
 * THE FIELD FOLLOWS THE LENS. `Sheet.tsx` explains why at length; the short
 * version is that this station's camera covers 60 local units and swings 30
 * degrees doing it, and a corridor pinned to the local Z axis would sit outside
 * the frame for the first half of the station. The group below is pinned to the
 * live camera every frame, so the sheets are authored in plain camera-relative
 * coordinates and are framed correctly at every progress value.
 *
 * It reads `state.camera`, NOT `getCameraAt(progress)`, and the difference is not
 * cosmetic. `CameraRig` damps position and look at lambda 6 and 5.5 and pumps the
 * FOV with scroll velocity, so the lens trails the path by metres during a flick.
 * A field placed on the path instead of on the lens runs out ahead of the camera
 * exactly when the camera is moving fastest, and the sheets shrink into the
 * distance at the one moment they are supposed to be streaming past. Only the
 * orientation is damped here, which leaves the field a little inertia when the
 * path turns — the sheets swing wide of the corner, like something with mass.
 *
 * TRAVEL IS SIGNED BY SCROLL DIRECTION. Sheets fall toward the lens at an idle
 * 2 units a second, up to about 18 with a hard flick, and `scrollState.direction`
 * multiplies the whole thing — so scrolling up genuinely reverses the fall rather
 * than just slowing it. The damped speed means the reversal reads as the field
 * settling and turning over, not as a switch being thrown.
 */

const [RANGE_START, RANGE_END] = STATION_RANGES.writing
const ANCHOR = new Vector3(...STATION_ANCHORS.writing)

/** Units per second with the page at rest. */
const IDLE_SPEED = 2.0
/** Extra units per second at full damped scroll velocity. */
const SCROLL_GAIN = 16

/**
 * The field is alive slightly before the station and gone slightly before the
 * hand-off to Contact. Arriving early is a lead-in — paper starts drifting past
 * while How I Build is still on screen. Leaving early is not optional: Contact is
 * a dark station and white paper hanging over it would be the brightest thing on
 * the page.
 */
const FADE_IN: [number, number] = [RANGE_START - 0.014, RANGE_START + 0.006]
const FADE_OUT: [number, number] = [RANGE_END - 0.022, RANGE_END - 0.002]

const _target = new Quaternion()

export function WritingScene({ quality, reducedMotion }: SceneProps) {
  const low = quality === 'low'
  const still = low || reducedMotion

  /** 24 x 16 — the printed sheets are the ones you look at. */
  const geometry = useMemo(() => new PlaneGeometry(SHEET_W, SHEET_H, 24, 16), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  // Seeded at the tier's own target so the field is not visibly flat for its
  // first second on mount, then damped from there whenever the tier changes.
  const drive = useMemo<FieldDrive>(
    () => ({ clock: 0, travel: 0, curl: still ? 0 : 1, fade: 0 }),
    [still],
  )

  const frame = useRef<Group>(null)
  const speed = useRef(0)
  const settled = useRef(false)

  // No renderPriority. Ever.
  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const p = scrollState.progress

    // ---- the field's own clock and travel ---------------------------------
    if (still) {
      speed.current = 0
    } else {
      drive.clock += dt
      const wanted =
        (IDLE_SPEED + SCROLL_GAIN * Math.abs(scrollState.velocity)) * scrollState.direction
      speed.current = damp(speed.current, wanted, 5, dt)
      drive.travel += speed.current * dt
    }

    drive.curl = damp(drive.curl, still ? 0 : 1, 3, dt)
    drive.fade =
      smoothstep(FADE_IN[0], FADE_IN[1], p) * (1 - smoothstep(FADE_OUT[0], FADE_OUT[1], p))

    // ---- carry the field with the lens ------------------------------------
    const g = frame.current
    if (g) {
      g.visible = drive.fade > 0.003
      // The station group is a pure translation by the anchor, so world minus
      // anchor is this group's local space and the camera's world quaternion is
      // its local one. A child at (x, y, -d) therefore sits d units down the lens.
      g.position.copy(camera.position).sub(ANCHOR)
      _target.copy(camera.quaternion)
      if (settled.current) {
        g.quaternion.slerp(_target, 1 - Math.exp(-7 * dt))
      } else {
        g.quaternion.copy(_target)
        settled.current = true
      }
    }

    // ---- post --------------------------------------------------------------
    if (scrollState.activeStation !== 'writing') return

    // White paper on a near-white sky. The 0.75 bloom threshold turns the whole
    // station into a single glowing smear, so it goes up near the clip point and
    // the intensity comes right down — what is left is the masthead band on the
    // covers catching a little light, which is the only thing here bright enough
    // to deserve it.
    postState.bloomIntensity = 0.32
    postState.bloomThreshold = 0.96
    postState.vignette = 0.16
    postState.chromaticAberration = 0

    // Near-field defocus: hold the plane at 15 units, which is where a sheet is
    // big enough to read, and let everything closer go soft on its way out of
    // frame. 2.2 bokeh dissolves a 1.4-unit plane completely — this is thin,
    // detailed geometry and it needs a fraction of that.
    postState.dofFocusDistance = focusAtDistance(15)
    postState.dofBokehScale = 0.85
  })

  return (
    <group name="writing">
      <group ref={frame} name="writing-field">
        <SheetField quality={quality} reducedMotion={reducedMotion} drive={drive} />
        {articles.map((article, i) => (
          <Sheet
            key={article.id}
            article={article}
            index={i}
            geometry={geometry}
            quality={quality}
            reducedMotion={reducedMotion}
            drive={drive}
          />
        ))}
      </group>
    </group>
  )
}
