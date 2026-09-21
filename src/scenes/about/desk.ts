/**
 * THE DESK — 02 About's set piece, and the one public export this station has.
 *
 *   createDeskGroup(quality: QualityTier): THREE.Group
 *
 * **This is a pure function. No React, no hooks, no context, no store reads.**
 * P3H (Contact) calls `createDeskGroup('low')` to place a dim, distant desk behind
 * the closing panel, so anything React-shaped in here breaks the site's bookend.
 * There is a standalone test for exactly that in `scripts/` — see the phase report.
 *
 * ---------------------------------------------------------------------------
 * HOW IT STAYS INSIDE 4 DRAW CALLS
 *
 * three.js does not batch meshes that merely share a material — a draw call is a
 * mesh, not a material. So ~24 primitives are baked into world space and merged,
 * by material, into a handful of merged `BufferGeometry`s:
 *
 *   1. matte plastic   2. warm wood   3. dark screen/plastic   4. the screens
 *
 * The two screen panels are one mesh too: they share a single unlit material whose
 * map is a stacked atlas, with each panel UV-mapped into its own half. Four meshes,
 * four draw calls, one texture upload per redraw.
 *
 * The cost of merging is that no object has its own transform any more, which is a
 * problem because the scene bible wants each one to scale in from zero with a
 * stagger. That is solved in the vertex shader instead: every vertex carries the
 * origin of the object it belongs to (`aPivot`) and that object's place in the
 * stagger (`aDelay`), and a chunk injected into the standard material scales the
 * vertex about its own pivot with an `easeOutBack` overshoot. One uniform,
 * `uReveal`, drives every one of them.
 *
 * Author-space: the desk surface is the y = 0.09 plane, the desk is 8.4 × 3.4 and
 * centred on the local origin. Sized for the mid-station framing (camera ~14 units
 * out at fov 46), not for the close-up.
 */

import {
  BufferGeometry,
  CylinderGeometry,
  Euler,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  TorusGeometry,
  Vector3,
  type IUniform,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { QualityTier } from '@/engine/types'
import { saturate } from '@/lib/math'

/* -------------------------------------------------------------------------- */
/* Palette — the three body materials of docs/03-SCENE-BIBLE.md § 02, plus the */
/* unlit screen the same section asks for.                                     */
/* -------------------------------------------------------------------------- */

const PLASTIC = '#E6EDF8'
const WOOD = '#C9A47C'
const DARK = '#141C2B'
/** The unlit colour a screen shows before (or without) a ScreenTexture. */
const SCREEN_OFF = '#0B1322'

type MatKey = 'plastic' | 'wood' | 'dark' | 'screen'

/* -------------------------------------------------------------------------- */
/* The assemble chunk                                                          */
/* -------------------------------------------------------------------------- */

/**
 * `uReveal` runs 0 → 1. An object whose `aDelay` is d starts moving at d and has
 * landed by d + SPAN. Delays are authored in 0 … 1 − SPAN so the last object still
 * finishes exactly at uReveal = 1.
 */
export const REVEAL_SPAN = 0.42

/** How far below its resting place an object starts. Small; this is a settle. */
const DROP = 0.3

const ASSEMBLE_VERTEX = `
uniform float uReveal;
attribute vec3 aPivot;
attribute float aDelay;

float deskEase(float t){
  float c1 = 1.70158;
  float c3 = c1 + 1.0;
  float u = t - 1.0;
  return 1.0 + c3 * u * u * u + c1 * u * u;
}
`

const ASSEMBLE_BODY = `
  float dReveal = clamp((uReveal - aDelay) / ${REVEAL_SPAN.toFixed(4)}, 0.0, 1.0);
  float dScale = deskEase(dReveal);
  transformed = aPivot + (transformed - aPivot) * dScale;
  transformed.y -= (1.0 - dReveal) * ${DROP.toFixed(3)};
`

/* -------------------------------------------------------------------------- */
/* Part collection                                                             */
/* -------------------------------------------------------------------------- */

type Bucket = Record<MatKey, BufferGeometry[]>

/** Merge order. The screen mesh is last so it draws after the shells around it. */
const MAT_KEYS = ['plastic', 'wood', 'dark', 'screen'] as const

/**
 * The per-object builder handed to each object definition. Geometry is authored in
 * the object's own space (origin at its footprint on the desk); `push` bakes the
 * object matrix in and tags every vertex with the object's pivot and delay.
 */
interface PartSink {
  push(geometry: BufferGeometry, material: MatKey): void
}

const tagAndBake = (
  geometry: BufferGeometry,
  matrix: Matrix4,
  pivot: Vector3,
  delay: number,
): BufferGeometry => {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry
  if (geo !== geometry) geometry.dispose()

  geo.applyMatrix4(matrix)

  const count = geo.attributes.position.count
  const pivots = new Float32Array(count * 3)
  const delays = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pivots[i * 3] = pivot.x
    pivots[i * 3 + 1] = pivot.y
    pivots[i * 3 + 2] = pivot.z
    delays[i] = delay
  }
  geo.setAttribute('aPivot', new Float32BufferAttribute(pivots, 3))
  geo.setAttribute('aDelay', new Float32BufferAttribute(delays, 1))

  // mergeGeometries requires identical attribute sets; drop anything exotic a
  // primitive may have brought along.
  for (const name of Object.keys(geo.attributes)) {
    if (!['position', 'normal', 'uv', 'aPivot', 'aDelay'].includes(name)) {
      geo.deleteAttribute(name)
    }
  }
  return geo
}

/* -------------------------------------------------------------------------- */
/* Geometry helpers                                                            */
/* -------------------------------------------------------------------------- */

interface Detail {
  /** RoundedBoxGeometry corner segments */
  box: number
  /** cylinder radial segments */
  radial: number
  /** icosahedron subdivision */
  ico: number
}

const DETAIL: Record<QualityTier, Detail> = {
  low: { box: 1, radial: 8, ico: 0 },
  medium: { box: 2, radial: 12, ico: 1 },
  high: { box: 2, radial: 16, ico: 1 },
}

const _euler = new Euler()
const _matrix = new Matrix4()

/** Compose a placement matrix. Reused — these run once, at build time. */
const place = (x: number, y: number, z: number, rx: number, ry: number, rz: number): Matrix4 => {
  _euler.set(rx, ry, rz, 'XYZ')
  _matrix.makeRotationFromEuler(_euler)
  _matrix.setPosition(x, y, z)
  return _matrix
}

/** Rounded box, placed. `r` is clamped by the geometry itself. */
const rbox = (
  d: Detail,
  w: number,
  h: number,
  dp: number,
  r: number,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0,
): BufferGeometry => {
  const g: BufferGeometry = new RoundedBoxGeometry(w, h, dp, d.box, r)
  g.applyMatrix4(place(x, y, z, rx, ry, rz))
  return g
}

const cyl = (
  d: Detail,
  rTop: number,
  rBottom: number,
  h: number,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0,
): BufferGeometry => {
  const g: BufferGeometry = new CylinderGeometry(rTop, rBottom, h, d.radial, 1, false)
  g.applyMatrix4(place(x, y, z, rx, ry, rz))
  return g
}

/**
 * A screen panel, UV-mapped into its slice of the shared atlas.
 *
 * Both screens live in ONE mesh reading ONE canvas, stacked vertically, because a
 * second material would be a fourth draw call and a second per-frame texture
 * upload for no visual gain. `ScreenTexture` draws the panels in this same order.
 * Panel 0 is the TOP of the canvas, which with the default `flipY` is uv.y → 1.
 */
export const SCREEN_PANELS = ['monitor', 'laptop'] as const
export type ScreenPanel = (typeof SCREEN_PANELS)[number]

const screenPlane = (
  panel: number,
  w: number,
  h: number,
  x: number,
  y: number,
  z: number,
  tilt: number,
): BufferGeometry => {
  const g = new PlaneGeometry(w, h)
  const uv = g.attributes.uv
  const slice = 1 / SCREEN_PANELS.length
  const base = (SCREEN_PANELS.length - 1 - panel) * slice
  for (let i = 0; i < uv.count; i++) uv.setY(i, base + uv.getY(i) * slice)
  uv.needsUpdate = true
  g.applyMatrix4(place(x, y, z, tilt, 0, 0))
  return g
}

/* -------------------------------------------------------------------------- */
/* The objects                                                                 */
/* -------------------------------------------------------------------------- */

interface DeskObject {
  name: string
  /** footprint origin in desk space — also the pivot the scale-in happens about */
  at: [number, number, number]
  /** yaw, radians */
  yaw?: number
  /** 0 … 1 − REVEAL_SPAN */
  delay: number
  build(sink: PartSink, d: Detail): void
}

/** Top surface of the desk, in desk space. Everything else sits on it. */
const TOP = 0.09

const OBJECTS: readonly DeskObject[] = [
  {
    name: 'desk',
    at: [0, 0, 0],
    delay: 0,
    build(s, d) {
      s.push(rbox(d, 8.4, 0.18, 3.4, 0.05, 0, 0, 0), 'wood')
      // modesty panel — stops the desk reading as a floating slab from the front
      s.push(rbox(d, 7.6, 0.9, 0.1, 0.03, 0, -0.52, -1.5), 'wood')
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          s.push(rbox(d, 0.2, 1.6, 0.2, 0.05, sx * 3.85, -0.89, sz * 1.42), 'wood')
        }
      }
    },
  },
  {
    name: 'monitor',
    at: [-1.1, TOP, -1.0],
    yaw: 0.08,
    delay: 0.1,
    build(s, d) {
      s.push(cyl(d, 0.62, 0.62, 0.06, 0, 0.03, 0), 'dark')
      s.push(rbox(d, 0.22, 1.1, 0.16, 0.05, 0, 0.6, 0), 'dark')
      s.push(rbox(d, 3.5, 2.1, 0.14, 0.07, 0, 2.12, -0.08, -0.08), 'plastic')
      // 6mm proud of the bezel's front face, along the bezel's own tilted normal
      s.push(screenPlane(0, 3.2, 1.82, 0, 2.1261, -0.0043, -0.08), 'screen')
    },
  },
  {
    name: 'keyboard',
    at: [-1.1, TOP, 0.78],
    yaw: 0.06,
    delay: 0.3,
    build(s, d) {
      s.push(rbox(d, 1.95, 0.06, 0.68, 0.02, 0, 0.03, 0), 'plastic')
      s.push(rbox(d, 1.78, 0.02, 0.52, 0.01, 0, 0.066, 0), 'dark')
    },
  },
  {
    name: 'mouse',
    at: [0.35, TOP, 0.88],
    yaw: -0.12,
    delay: 0.36,
    build(s, d) {
      const g: BufferGeometry = new IcosahedronGeometry(0.17, d.ico)
      g.scale(1, 0.55, 1.45)
      g.translate(0, 0.07, 0)
      s.push(g, 'plastic')
    },
  },
  {
    name: 'laptop',
    at: [2.45, TOP, 0.45],
    yaw: -0.42,
    delay: 0.2,
    build(s, d) {
      s.push(rbox(d, 2.1, 0.09, 1.45, 0.03, 0, 0.045, 0), 'plastic')
      s.push(rbox(d, 1.8, 0.02, 0.62, 0.01, 0, 0.096, 0.16), 'dark')
      s.push(rbox(d, 0.6, 0.014, 0.4, 0.007, 0, 0.096, 0.62), 'dark')
      // lid, hinged at the back edge and leaning 16° back
      s.push(rbox(d, 2.1, 1.42, 0.07, 0.03, 0, 0.773, -0.921, -0.28), 'plastic')
      s.push(screenPlane(1, 1.86, 1.2, 0, 0.7843, -0.8816, -0.28), 'screen')
    },
  },
  {
    name: 'mug',
    at: [0.95, TOP, 0.05],
    yaw: 0.3,
    delay: 0.44,
    build(s, d) {
      s.push(cyl(d, 0.24, 0.2, 0.46, 0, 0.23, 0), 'plastic')
      s.push(cyl(d, 0.21, 0.21, 0.02, 0, 0.45, 0), 'dark')
      const handle: BufferGeometry = new TorusGeometry(
        0.13,
        0.033,
        Math.max(4, d.radial >> 1),
        Math.max(8, d.radial),
        Math.PI * 1.4,
      )
      handle.rotateY(Math.PI / 2)
      handle.translate(0.24, 0.25, 0)
      s.push(handle, 'plastic')
    },
  },
  {
    name: 'books',
    at: [-3.45, TOP, 0.82],
    yaw: -0.22,
    delay: 0.4,
    build(s, d) {
      s.push(rbox(d, 1.28, 0.15, 0.92, 0.02, 0, 0.075, 0), 'wood')
      s.push(rbox(d, 1.2, 0.13, 0.86, 0.02, 0.04, 0.215, 0.03, 0, 0.13, 0), 'plastic')
      s.push(rbox(d, 1.1, 0.11, 0.8, 0.02, -0.03, 0.335, -0.02, 0, -0.1, 0), 'dark')
    },
  },
  {
    name: 'lamp',
    at: [-3.55, TOP, -1.02],
    delay: 0.15,
    build(s, d) {
      s.push(cyl(d, 0.36, 0.36, 0.07, 0, 0.035, 0), 'dark')
      s.push(cyl(d, 0.05, 0.05, 1.55, 0, 0.82, 0), 'plastic')
      // shade: the wide end of the cone points down and to the right, at the desk
      s.push(cyl(d, 0.12, 0.44, 0.48, 0.13, 1.62, 0.06, -0.12, 0, 0.58), 'plastic')
    },
  },
  {
    name: 'plant-pot',
    at: [3.6, TOP, -1.05],
    delay: 0.25,
    build(s, d) {
      s.push(cyl(d, 0.34, 0.24, 0.5, 0, 0.25, 0), 'wood')
      s.push(cyl(d, 0.37, 0.37, 0.08, 0, 0.46, 0), 'wood')
      s.push(cyl(d, 0.32, 0.32, 0.04, 0, 0.5, 0), 'dark')
    },
  },
  {
    name: 'notebook',
    at: [-2.35, TOP, 1.08],
    yaw: 0.22,
    delay: 0.48,
    build(s, d) {
      s.push(rbox(d, 1.05, 0.07, 0.74, 0.015, 0, 0.035, 0), 'plastic')
      s.push(rbox(d, 0.06, 0.05, 0.74, 0.015, -0.5, 0.036, 0), 'dark')
      s.push(cyl(d, 0.024, 0.024, 0.62, 0.05, 0.095, 0.05, 0, 0.35, Math.PI / 2), 'dark')
    },
  },
  {
    name: 'phone',
    at: [1.05, TOP, 1.12],
    yaw: -0.38,
    delay: 0.52,
    build(s, d) {
      s.push(rbox(d, 0.4, 0.035, 0.78, 0.018, 0, 0.018, 0), 'dark')
      s.push(rbox(d, 0.33, 0.01, 0.68, 0.012, 0, 0.038, 0), 'plastic')
    },
  },
  {
    name: 'coaster',
    at: [0.95, TOP, 0.05],
    delay: 0.44,
    build(s, d) {
      s.push(cyl(d, 0.3, 0.3, 0.02, 0, 0.01, 0), 'dark')
    },
  },
]

/* -------------------------------------------------------------------------- */
/* Public handle                                                               */
/* -------------------------------------------------------------------------- */

export interface DeskHandle {
  /** The group `createDeskGroup` returned. */
  readonly group: Group
  /**
   * The single unlit material both screen panels share. Assign a `ScreenTexture`
   * atlas to its `.map` (and set `.color` white) to light them up; leave it alone
   * and they read as two switched-off panels, which is what Contact wants.
   */
  readonly screenMaterial: MeshBasicMaterial
  /**
   * Local-space attachment points, in desk space (i.e. before whatever transform
   * the consumer puts on the group).
   */
  readonly anchors: {
    /** top of the pot — where foliage starts */
    readonly plant: Vector3
    /** inside the lamp shade — where a warm point light belongs */
    readonly lampLight: Vector3
    /** centre of the monitor screen — the natural look/focus target */
    readonly monitor: Vector3
    /**
     * Clear air off the front-LEFT edge of the desk, for the floating portrait.
     * Left, not right: the camera finishes its orbit from the right, and the
     * laptop and the plant already own that half of the frame.
     */
    readonly portrait: Vector3
  }
  /** 0 → 1 assembly. 1 is fully built. Safe to call every frame. */
  setReveal(reveal: number): void
  /** Everything this group owns. Call on unmount. */
  dispose(): void
}

const HANDLE_KEY = 'aboutDeskHandle'

/** Read the handle back off a group returned by `createDeskGroup`. */
export const getDeskHandle = (group: Group): DeskHandle | undefined =>
  (group.userData as Record<string, unknown>)[HANDLE_KEY] as DeskHandle | undefined

/* -------------------------------------------------------------------------- */
/* createDeskGroup                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Build a desk. **Pure — no React, no hooks.** Requires a WebGL-less environment
 * only in so far as three.js itself does: it allocates geometry and materials but
 * never touches a renderer, a canvas or the DOM.
 *
 * @example
 *   const desk = createDeskGroup('low')
 *   desk.position.set(0, -1.2, -6)
 *   scene.add(desk)
 */
export function createDeskGroup(quality: QualityTier): Group {
  const d = DETAIL[quality] ?? DETAIL.medium

  const group = new Group()
  group.name = 'about-desk'

  const buckets: Bucket = { plastic: [], wood: [], dark: [], screen: [] }
  const objectMatrix = new Map<string, Matrix4>()
  const objectDelay = new Map<string, number>()

  for (const o of OBJECTS) {
    const pivot = new Vector3(o.at[0], o.at[1], o.at[2])
    const matrix = new Matrix4()
      .makeRotationY(o.yaw ?? 0)
      .premultiply(new Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z))
    objectMatrix.set(o.name, matrix)
    objectDelay.set(o.name, o.delay)

    const sink: PartSink = {
      push(geometry, material) {
        buckets[material].push(tagAndBake(geometry, matrix, pivot, o.delay))
      },
    }
    o.build(sink, d)
  }

  const uReveal: IUniform<number> = { value: 1 }

  /**
   * Injects the assemble chunk. Works on any built-in material — every one of
   * their vertex shaders has both `<common>` and `<begin_vertex>`.
   */
  const withAssemble = <T extends MeshStandardMaterial | MeshBasicMaterial>(m: T): T => {
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uReveal = uReveal
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${ASSEMBLE_VERTEX}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${ASSEMBLE_BODY}`)
    }
    // A material whose program differs from the stock one must say so, or three
    // hands it a cached program compiled without the chunk.
    m.customProgramCacheKey = () => 'about-desk-assemble'
    return m
  }

  const standard = (color: string, roughness: number, metalness: number) =>
    withAssemble(new MeshStandardMaterial({ color, roughness, metalness }))

  /** Unlit, because a screen emits rather than reflects. */
  const screenMaterial = withAssemble(
    new MeshBasicMaterial({ color: SCREEN_OFF, toneMapped: true }),
  )

  const materials: Record<MatKey, MeshStandardMaterial | MeshBasicMaterial> = {
    plastic: standard(PLASTIC, 0.85, 0.0),
    wood: standard(WOOD, 0.78, 0.0),
    dark: standard(DARK, 0.55, 0.15),
    screen: screenMaterial,
  }

  const merged: BufferGeometry[] = []
  for (const key of MAT_KEYS) {
    const parts = buckets[key]
    if (parts.length === 0) continue
    const geo = mergeGeometries(parts, false)
    for (const p of parts) p.dispose()
    if (!geo) continue
    geo.computeBoundingSphere()
    merged.push(geo)
    const mesh = new Mesh(geo, materials[key])
    mesh.name = `desk-${key}`
    // The assemble happens in the vertex shader, so the bounding sphere three
    // culls against is the *finished* desk. That is what we want — an object
    // mid-assembly is always inside its own resting bounds.
    mesh.frustumCulled = true
    mesh.renderOrder = key === 'screen' ? 1 : 0
    group.add(mesh)
  }

  /* ---- handle ----------------------------------------------------------- */

  const plantAnchor = new Vector3(3.6, TOP + 0.5, -1.05)
  const lampAnchor = new Vector3(-3.4, TOP + 1.42, -0.96)
  const monitorAnchor = new Vector3(-1.1, TOP + 2.13, -1.0)
  const portraitAnchor = new Vector3(-2.7, TOP + 1.95, 1.95)

  const handle: DeskHandle = {
    group,
    screenMaterial,
    anchors: {
      plant: plantAnchor,
      lampLight: lampAnchor,
      monitor: monitorAnchor,
      portrait: portraitAnchor,
    },
    setReveal(reveal: number) {
      uReveal.value = saturate(reveal)
    },
    dispose() {
      for (const g of merged) g.dispose()
      for (const key of MAT_KEYS) materials[key].dispose()
    },
  }

  ;(group.userData as Record<string, unknown>)[HANDLE_KEY] = handle

  // Default to fully built. A consumer that wants the assembly (About) drives it
  // down to 0 on its first frame; a consumer that just wants a desk (Contact) gets
  // one without having to know this API exists.
  handle.setReveal(1)

  return group
}
