import { CatmullRomCurve3, Vector3 } from 'three'
import type { CameraKeyframe, SceneManifest, StationId } from '@/engine/types'
import { lerp, smoothstep } from './math'

/**
 * THE CAMERA PATH — authoritative.
 *
 * The world is one continuous space. Eight station anchors are strung along -Z with
 * lateral offsets so the flight path curves rather than running straight.
 *
 * A station's camera keyframes are NOT hand-written in its manifest. They are derived
 * here: station `i`'s `to` IS station `i+1`'s `from`, the same waypoint. That makes a
 * seam at a station boundary structurally impossible rather than something an agent
 * has to remember. Manifests call `stationCamera(id)`.
 *
 * Between two boundary waypoints a station may carry extra *shaping* waypoints
 * (`mids`) — control points the curve passes through that are not boundaries. This is
 * how the hero pulls back to z=13 and still hands off to About on its way forward:
 * the pull-back is a mid, the hand-off is the boundary.
 */

export interface Waypoint {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  /** camera roll in degrees */
  roll?: number
  /** how far mouse parallax may push the camera here, in world units */
  parallax?: number
}

interface StationPath {
  id: StationId
  /** world position of the station group; scenes author around local (0,0,0) */
  anchor: [number, number, number]
  range: [number, number]
  /** the waypoint at this station's range start */
  from: Waypoint
  /** shaping waypoints inside the station, in order */
  mids?: Waypoint[]
}

/** Total page height as a multiple of 100vh — see docs/02-ARCHITECTURE.md §3. */
export const SECTION_SCALE = 1.6
export const PAGE_VH_TOTAL = 8 * 100 * SECTION_SCALE

const STATION_PATHS: readonly StationPath[] = [
  {
    id: 'hero',
    anchor: [0, 0, 0],
    range: [0.0, 0.11],
    from: { position: [0, 0, 4], lookAt: [0, 0, 0], fov: 62, roll: 0, parallax: 0.6 },
    mids: [{ position: [0, 0.5, 13], lookAt: [0, 0, -1], fov: 55, roll: 1.5, parallax: 0.6 }],
  },
  {
    id: 'about',
    anchor: [6, 0, -40],
    range: [0.11, 0.23],
    from: { position: [3, 5, -18], lookAt: [5, 0.6, -34], fov: 50, roll: 0.5, parallax: 0.35 },
    mids: [{ position: [4, 6.5, -28], lookAt: [6, 0.8, -40], fov: 46, roll: 0, parallax: 0.3 }],
  },
  {
    id: 'projects',
    anchor: [-4, 0, -85],
    range: [0.23, 0.4],
    from: { position: [9.5, 2.8, -32.5], lookAt: [6, 0.2, -40], fov: 44, roll: 0, parallax: 0.3 },
    mids: [
      { position: [2, 3, -58], lookAt: [-4, 0.5, -85], fov: 44, roll: 0, parallax: 0.25 },
      { position: [-6.5, 1.3, -76], lookAt: [-4, 0.3, -85], fov: 41, roll: 0, parallax: 0.25 },
    ],
  },
  {
    id: 'experience',
    anchor: [8, 0, -125],
    range: [0.4, 0.55],
    from: { position: [-2, 1.1, -77], lookAt: [-4, 0.2, -85], fov: 40, roll: 0, parallax: 0.25 },
    mids: [
      { position: [6, 5, -104], lookAt: [8, 7, -125], fov: 46, roll: -1, parallax: 0.2 },
      { position: [19, 12, -126], lookAt: [8, 12, -125], fov: 48, roll: -2, parallax: 0.2 },
    ],
  },
  {
    id: 'skills',
    anchor: [-10, 6, -168],
    range: [0.55, 0.68],
    from: { position: [8, 19, -140], lookAt: [8, 17, -127], fov: 48, roll: -1, parallax: 0.2 },
    mids: [{ position: [-6, 10, -152], lookAt: [-10, 6, -168], fov: 46, roll: 0, parallax: 0.4 }],
  },
  {
    id: 'build',
    anchor: [10, 0, -210],
    range: [0.68, 0.8],
    from: {
      position: [-9.5, 6.8, -155.5],
      lookAt: [-10, 6, -168],
      fov: 42,
      roll: 0,
      parallax: 0.4,
    },
    mids: [
      { position: [-4, 2, -186], lookAt: [8, 0.6, -210], fov: 46, roll: 0, parallax: 0.2 },
      { position: [-4, 1.5, -198], lookAt: [4, 0.5, -210], fov: 44, roll: 0, parallax: 0.2 },
    ],
  },
  {
    id: 'writing',
    anchor: [-8, 0, -255],
    range: [0.8, 0.91],
    from: { position: [24, 1.5, -198], lookAt: [16, 0.5, -210], fov: 44, roll: 0, parallax: 0.2 },
    mids: [{ position: [2, 2, -228], lookAt: [-8, 1, -255], fov: 48, roll: 0, parallax: 0.3 }],
  },
  {
    id: 'contact',
    anchor: [0, 0, -300],
    range: [0.91, 1.0],
    from: { position: [-7, 3.2, -244], lookAt: [-8, 4.5, -256], fov: 50, roll: 0, parallax: 0.3 },
    mids: [
      { position: [-2, 2.5, -282], lookAt: [0, 1, -300], fov: 46, roll: 0, parallax: 0.18 },
      { position: [0.5, 2.0, -288], lookAt: [0, 0.8, -300], fov: 42, roll: 0, parallax: 0.1 },
    ],
  },
]

/** The waypoint the camera rests at when the page is fully scrolled. */
const END_WAYPOINT: Waypoint = {
  position: [0.5, 1.7, -288.6],
  lookAt: [0, 0.7, -300],
  fov: 42,
  roll: 0,
  parallax: 0.06,
}

// ---------------------------------------------------------------------------
// Derived tables
// ---------------------------------------------------------------------------

/** Every control point, in path order. */
const CONTROL: readonly Waypoint[] = [
  ...STATION_PATHS.flatMap((s) => [s.from, ...(s.mids ?? [])]),
  END_WAYPOINT,
]

/** Index into CONTROL of each station's `from`. Length 9 — the last is the page end. */
const BOUNDARY_INDEX: readonly number[] = (() => {
  const out: number[] = []
  let i = 0
  for (const s of STATION_PATHS) {
    out.push(i)
    i += 1 + (s.mids?.length ?? 0)
  }
  out.push(i)
  return out
})()

const SEGMENTS = CONTROL.length - 1

const positionCurve = new CatmullRomCurve3(
  CONTROL.map((w) => new Vector3(...w.position)),
  false,
  'catmullrom',
  0.5,
)

const lookCurve = new CatmullRomCurve3(
  CONTROL.map((w) => new Vector3(...w.lookAt)),
  false,
  'catmullrom',
  0.5,
)

export const STATION_RANGES = Object.fromEntries(
  STATION_PATHS.map((s) => [s.id, s.range]),
) as Record<StationId, [number, number]>

export const STATION_ANCHORS = Object.fromEntries(
  STATION_PATHS.map((s) => [s.id, s.anchor]),
) as Record<StationId, [number, number, number]>

export const STATION_ORDER: readonly StationId[] = STATION_PATHS.map((s) => s.id)

/** Share of total page scroll, and therefore of total page height. */
export const stationShare = (id: StationId): number => {
  const [a, b] = STATION_RANGES[id]
  return b - a
}

/** DOM height of a station, in vh units. P2's SectionShell reads this. */
export const stationVh = (id: StationId): number => stationShare(id) * PAGE_VH_TOTAL

const toKeyframe = (w: Waypoint): CameraKeyframe => ({
  position: w.position,
  lookAt: w.lookAt,
  fov: w.fov,
})

/**
 * The camera block for a manifest. Station `i`'s `to` is literally station `i+1`'s
 * `from`, so boundaries cannot drift apart.
 */
export const stationCamera = (id: StationId): SceneManifest['camera'] => {
  const i = STATION_ORDER.indexOf(id)
  return {
    from: toKeyframe(CONTROL[BOUNDARY_INDEX[i]]),
    to: toKeyframe(CONTROL[BOUNDARY_INDEX[i + 1]]),
  }
}

/** Which station a global progress value falls in, and its local 0..1 progress. */
export const resolveStation = (progress: number): { id: StationId; local: number } => {
  const p = progress < 0 ? 0 : progress > 1 ? 1 : progress
  for (let i = STATION_PATHS.length - 1; i >= 0; i--) {
    const [a, b] = STATION_PATHS[i].range
    if (p >= a || i === 0) {
      const local = b === a ? 0 : (p - a) / (b - a)
      return { id: STATION_PATHS[i].id, local: local < 0 ? 0 : local > 1 ? 1 : local }
    }
  }
  return { id: 'hero', local: 0 }
}

/** Global progress → floating control-point index along the path. */
const progressToControlIndex = (progress: number): number => {
  const p = progress < 0 ? 0 : progress > 1 ? 1 : progress
  for (let i = 0; i < STATION_PATHS.length; i++) {
    const [a, b] = STATION_PATHS[i].range
    if (p <= b || i === STATION_PATHS.length - 1) {
      const raw = b === a ? 0 : (p - a) / (b - a)
      const t = raw < 0 ? 0 : raw > 1 ? 1 : raw
      const lo = BOUNDARY_INDEX[i]
      const hi = BOUNDARY_INDEX[i + 1]
      return lo + t * (hi - lo)
    }
  }
  return 0
}

/** Smoothly interpolate a scalar field across the control points. */
const sampleScalar = (idx: number, pick: (w: Waypoint) => number): number => {
  const i0 = Math.max(0, Math.min(Math.floor(idx), CONTROL.length - 1))
  const i1 = Math.min(i0 + 1, CONTROL.length - 1)
  const f = smoothstep(0, 1, idx - i0)
  return lerp(pick(CONTROL[i0]), pick(CONTROL[i1]), f)
}

export interface CameraSample {
  fov: number
  /** radians */
  roll: number
  parallax: number
}

/**
 * Sample the camera path. Writes into the supplied vectors, so this is safe to call
 * every frame — it allocates nothing.
 */
export const getCameraAt = (
  progress: number,
  outPosition: Vector3,
  outLookAt: Vector3,
): CameraSample => {
  const idx = progressToControlIndex(progress)
  const u = SEGMENTS === 0 ? 0 : idx / SEGMENTS

  positionCurve.getPoint(u, outPosition)
  lookCurve.getPoint(u, outLookAt)

  return {
    fov: sampleScalar(idx, (w) => w.fov),
    roll: sampleScalar(idx, (w) => w.roll ?? 0) * (Math.PI / 180),
    parallax: sampleScalar(idx, (w) => w.parallax ?? 0.25),
  }
}

/** Debug helper: the whole path as points, for a line overlay. */
export const samplePath = (divisions = 240): Vector3[] => positionCurve.getPoints(divisions)
