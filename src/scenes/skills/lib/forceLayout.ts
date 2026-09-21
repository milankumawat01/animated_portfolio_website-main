/**
 * A tiny 3D force-directed layout for the Skills graph.
 *
 * Runs 200 iterations ONCE, at mount, and freezes. Never in `useFrame` — the result
 * is memoised per node-count so remounting the station or flipping quality tier
 * re-uses the cached positions rather than re-solving.
 *
 * The RNG is seeded, the iteration order is fixed and nothing here reads the clock,
 * so the layout is byte-identical on every reload. That matters: a graph that
 * reshuffles itself between visits reads as a bug, not as life.
 */

import { skills } from '@/data/skills'

export interface GraphNode {
  /** `backend` for a hub, `backend:Python` for a leaf */
  id: string
  name: string
  /** index into `skills` */
  cluster: number
  isHub: boolean
  /** world radius of the sphere */
  radius: number
  /** atlas cell index, -1 for hubs */
  cell: number
  x: number
  y: number
  z: number
}

export type EdgeKind = 'ring' | 'spoke' | 'shared'

export interface GraphEdge {
  a: number
  b: number
  /** cluster this edge belongs to for highlighting, -1 = structural */
  cluster: number
  kind: EdgeKind
}

export interface GraphLayout {
  nodes: readonly GraphNode[]
  edges: readonly GraphEdge[]
  /** the radius the layout was normalised to */
  radius: number
}

// --------------------------------------------------------------------------
// Tuning
// --------------------------------------------------------------------------

const SEED = 0x5ee_d17
const ITERATIONS = 200
const DT = 1
const DAMPING = 0.82
const REPULSION = 1.15
const SPRING = 0.085
const CENTERING = 0.014
const MIN_DIST_SQ = 0.08

/** Rest length of a hub→leaf spoke. */
const SPOKE_LENGTH = 1.15
/** Rest length between neighbouring hubs. */
const RING_LENGTH = 3.1
/** Rest length of a cross-category link between two copies of the same tech. */
const SHARED_LENGTH = 2.2

const HUB_WEIGHT = 2.6
const LEAF_WEIGHT = 1

const HUB_RADIUS = 0.44
const LEAF_RADIUS = 0.26

/** Half-extent the finished layout is normalised to, in world units. */
export const GRAPH_RADIUS = 3.6
/** The graph reads better slightly flattened — it is a diagram, not a cloud. */
const Z_SQUASH = 0.72

/** Leaves per category at each tier. 6 hubs + 6*n leaves. */
export const LEAVES_PER_TIER = { low: 3, medium: 6, high: 6 } as const

// --------------------------------------------------------------------------

/** mulberry32 — small, fast, and identical across engines. */
const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const buildTopology = (
  leavesPerCategory: number,
): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  skills.forEach((cat, ci) => {
    nodes.push({
      id: cat.id,
      name: cat.title,
      cluster: ci,
      isHub: true,
      radius: HUB_RADIUS,
      cell: -1,
      x: 0,
      y: 0,
      z: 0,
    })
  })

  const hubCount = nodes.length

  skills.forEach((cat, ci) => {
    cat.items.slice(0, leavesPerCategory).forEach((name, ii) => {
      const index = nodes.length
      nodes.push({
        id: `${cat.id}:${name}`,
        name,
        cluster: ci,
        isHub: false,
        radius: LEAF_RADIUS,
        // Cell index is the FULL-graph ordinal so the atlas stays tier-independent.
        cell: ci * 6 + ii,
        x: 0,
        y: 0,
        z: 0,
      })
      edges.push({ a: ci, b: index, cluster: ci, kind: 'spoke' })
    })
  })

  // Hub ring — gives the six clusters something to push against so they spread
  // evenly instead of drifting into a line.
  for (let i = 0; i < hubCount; i++) {
    edges.push({ a: i, b: (i + 1) % hubCount, cluster: -1, kind: 'ring' })
  }

  // The same technology named in two categories gets a cross-link. PostgreSQL and
  // MongoDB are the only two today; the lookup finds any future ones for free.
  const byName = new Map<string, number[]>()
  nodes.forEach((n, i) => {
    if (n.isHub) return
    const list = byName.get(n.name)
    if (list) list.push(i)
    else byName.set(n.name, [i])
  })
  for (const list of byName.values()) {
    for (let i = 1; i < list.length; i++) {
      edges.push({ a: list[i - 1], b: list[i], cluster: -1, kind: 'shared' })
    }
  }

  return { nodes, edges }
}

const restLength = (kind: EdgeKind): number =>
  kind === 'spoke' ? SPOKE_LENGTH : kind === 'ring' ? RING_LENGTH : SHARED_LENGTH

const simulate = (nodes: GraphNode[], edges: GraphEdge[]): void => {
  const rand = mulberry32(SEED)
  const n = nodes.length

  const px = new Float64Array(n)
  const py = new Float64Array(n)
  const pz = new Float64Array(n)
  const vx = new Float64Array(n)
  const vy = new Float64Array(n)
  const vz = new Float64Array(n)
  const fx = new Float64Array(n)
  const fy = new Float64Array(n)
  const fz = new Float64Array(n)
  const w = new Float64Array(n)

  // Seed: hubs on a Fibonacci sphere, leaves in a small jittered shell around theirs.
  const hubCount = skills.length
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < hubCount; i++) {
    const y = 1 - (i / (hubCount - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    px[i] = Math.cos(theta) * r * 2.6
    py[i] = y * 2.1
    pz[i] = Math.sin(theta) * r * 2.6
  }
  for (let i = hubCount; i < n; i++) {
    const h = nodes[i].cluster
    px[i] = px[h] + (rand() - 0.5) * 1.8
    py[i] = py[h] + (rand() - 0.5) * 1.8
    pz[i] = pz[h] + (rand() - 0.5) * 1.8
  }
  for (let i = 0; i < n; i++) w[i] = nodes[i].isHub ? HUB_WEIGHT : LEAF_WEIGHT

  for (let step = 0; step < ITERATIONS; step++) {
    fx.fill(0)
    fy.fill(0)
    fz.fill(0)

    // Repulsion, every pair. 42 nodes → 861 pairs → ~172k ops total. Cheap enough
    // to be honest about, and a quadtree here would be premature.
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = px[i] - px[j]
        let dy = py[i] - py[j]
        let dz = pz[i] - pz[j]
        let d2 = dx * dx + dy * dy + dz * dz
        if (d2 < MIN_DIST_SQ) {
          // Coincident points get a deterministic nudge rather than a NaN.
          dx = (i - j) * 0.001 + 0.002
          dy = 0.001
          dz = -0.0015
          d2 = MIN_DIST_SQ
        }
        const d = Math.sqrt(d2)
        const f = (REPULSION * w[i] * w[j]) / d2
        const ux = dx / d
        const uy = dy / d
        const uz = dz / d
        fx[i] += ux * f
        fy[i] += uy * f
        fz[i] += uz * f
        fx[j] -= ux * f
        fy[j] -= uy * f
        fz[j] -= uz * f
      }
    }

    // Springs.
    for (const e of edges) {
      const { a, b } = e
      const dx = px[b] - px[a]
      const dy = py[b] - py[a]
      const dz = pz[b] - pz[a]
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-4
      const f = SPRING * (d - restLength(e.kind))
      const ux = (dx / d) * f
      const uy = (dy / d) * f
      const uz = (dz / d) * f
      fx[a] += ux
      fy[a] += uy
      fz[a] += uz
      fx[b] -= ux
      fy[b] -= uy
      fz[b] -= uz
    }

    // Weak pull to the origin so the whole thing cannot drift off camera.
    for (let i = 0; i < n; i++) {
      fx[i] -= px[i] * CENTERING * w[i]
      fy[i] -= py[i] * CENTERING * w[i]
      fz[i] -= pz[i] * CENTERING * w[i]

      vx[i] = (vx[i] + (fx[i] / w[i]) * DT) * DAMPING
      vy[i] = (vy[i] + (fy[i] / w[i]) * DT) * DAMPING
      vz[i] = (vz[i] + (fz[i] / w[i]) * DT) * DAMPING

      px[i] += vx[i] * DT
      py[i] += vy[i] * DT
      pz[i] += vz[i] * DT
    }
  }

  // Centre on the centroid, flatten a little, then normalise to GRAPH_RADIUS.
  let cx = 0
  let cy = 0
  let cz = 0
  for (let i = 0; i < n; i++) {
    cx += px[i]
    cy += py[i]
    cz += pz[i]
  }
  cx /= n
  cy /= n
  cz /= n

  let maxR = 1e-4
  for (let i = 0; i < n; i++) {
    px[i] -= cx
    py[i] -= cy
    pz[i] = (pz[i] - cz) * Z_SQUASH
    const r = Math.sqrt(px[i] * px[i] + py[i] * py[i] + pz[i] * pz[i])
    if (r > maxR) maxR = r
  }

  const scale = GRAPH_RADIUS / maxR
  for (let i = 0; i < n; i++) {
    nodes[i].x = px[i] * scale
    nodes[i].y = py[i] * scale
    nodes[i].z = pz[i] * scale
  }
}

const cache = new Map<number, GraphLayout>()

/**
 * The frozen layout for a given number of leaves per category. Solved on first call,
 * returned from cache after that.
 */
export const buildGraph = (leavesPerCategory: number): GraphLayout => {
  const hit = cache.get(leavesPerCategory)
  if (hit) return hit

  const { nodes, edges } = buildTopology(leavesPerCategory)
  simulate(nodes, edges)

  const layout: GraphLayout = { nodes, edges, radius: GRAPH_RADIUS }
  cache.set(leavesPerCategory, layout)
  return layout
}
