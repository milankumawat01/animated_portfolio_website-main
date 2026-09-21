/**
 * Turns `/monogram.svg` into a point cloud the hero particle system can settle into.
 *
 * Runs in the browser, once per distinct count, memoised at module scope. The SVG is
 * rasterised into a one-bit coverage mask with `Path2D` on a 2D canvas, then points
 * are drawn uniformly from the filled pixels. A mask lookup is an array index, which
 * is why this stays fast at 150k points where per-candidate `isPointInPath` calls
 * would not — and it is still the same fill rule, so the result is identical.
 *
 * Output is NORMALISED: the mark's longest axis spans 1.0 and it is centred on the
 * ink bounds, not the viewBox. `MonogramPoints` multiplies by its `scale` prop, so a
 * new monogram with different margins drops in without retuning the scene.
 *
 * If the fetch or the parse fails the caller still gets geometry — a torus knot,
 * normalised the same way, so the station degrades to "abstract" rather than "blank".
 */

/** Raster resolution of the coverage mask. 512 matches the asset's viewBox. */
const MASK_RES = 512

/** Half-depth of the Z extrusion, in normalised units. */
const EXTRUDE = 0.055

interface Mask {
  /** indices into a MASK_RES² grid that fall inside the fill */
  filled: Int32Array
  /** svg user-space bounds of the ink */
  minX: number
  minY: number
  span: number
  cx: number
  cy: number
  /** svg user units per mask pixel */
  unitX: number
  unitY: number
  vbX: number
  vbY: number
}

const maskCache = new Map<string, Promise<Mask | null>>()
const cloudCache = new Map<number, Promise<Float32Array>>()

const parseViewBox = (svg: SVGSVGElement): [number, number, number, number] => {
  const raw = svg.getAttribute('viewBox')
  if (!raw) {
    const w = Number(svg.getAttribute('width')) || MASK_RES
    const h = Number(svg.getAttribute('height')) || MASK_RES
    return [0, 0, w, h]
  }
  const n = raw
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  return n.length === 4 && n.every((v) => Number.isFinite(v))
    ? [n[0], n[1], n[2], n[3]]
    : [0, 0, MASK_RES, MASK_RES]
}

const buildMask = async (url: string): Promise<Mask | null> => {
  if (typeof document === 'undefined') return null

  const res = await fetch(url)
  if (!res.ok) throw new Error(`monogram: HTTP ${res.status}`)
  const text = await res.text()

  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  if (doc.querySelector('parsererror')) throw new Error('monogram: malformed SVG')

  const svg = doc.documentElement as unknown as SVGSVGElement
  const ds = Array.from(doc.querySelectorAll('path'))
    .map((p) => p.getAttribute('d'))
    .filter((d): d is string => Boolean(d))
  if (ds.length === 0) throw new Error('monogram: no <path> to sample')

  const [vbX, vbY, vbW, vbH] = parseViewBox(svg)

  const canvas = document.createElement('canvas')
  canvas.width = MASK_RES
  canvas.height = MASK_RES
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('monogram: no 2D context')

  ctx.fillStyle = '#ffffff'
  ctx.setTransform(MASK_RES / vbW, 0, 0, MASK_RES / vbH, (-vbX * MASK_RES) / vbW, (-vbY * MASK_RES) / vbH)
  // The asset is closed, filled, stroke-free paths; nonzero is the SVG default.
  for (const d of ds) ctx.fill(new Path2D(d))
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  const { data } = ctx.getImageData(0, 0, MASK_RES, MASK_RES)

  const filled: number[] = []
  let minPX = MASK_RES
  let minPY = MASK_RES
  let maxPX = -1
  let maxPY = -1
  for (let i = 0, px = 0; i < data.length; i += 4, px++) {
    if (data[i + 3] < 128) continue
    filled.push(px)
    const x = px % MASK_RES
    const y = (px / MASK_RES) | 0
    if (x < minPX) minPX = x
    if (x > maxPX) maxPX = x
    if (y < minPY) minPY = y
    if (y > maxPY) maxPY = y
  }
  if (filled.length === 0) throw new Error('monogram: fill is empty')

  const unitX = vbW / MASK_RES
  const unitY = vbH / MASK_RES
  const minX = vbX + minPX * unitX
  const minY = vbY + minPY * unitY
  const maxX = vbX + (maxPX + 1) * unitX
  const maxY = vbY + (maxPY + 1) * unitY

  return {
    filled: Int32Array.from(filled),
    minX,
    minY,
    span: Math.max(maxX - minX, maxY - minY),
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    unitX,
    unitY,
    vbX,
    vbY,
  }
}

const fromMask = (mask: Mask, count: number): Float32Array => {
  const out = new Float32Array(count * 3)
  const n = mask.filled.length
  const inv = 1 / mask.span

  for (let i = 0; i < count; i++) {
    const px = mask.filled[(Math.random() * n) | 0]
    // Sub-pixel jitter, or the cloud sits on a visible 512-wide lattice.
    const sx = mask.vbX + ((px % MASK_RES) + Math.random()) * mask.unitX
    const sy = mask.vbY + (((px / MASK_RES) | 0) + Math.random()) * mask.unitY

    const o = i * 3
    out[o] = (sx - mask.cx) * inv
    // SVG Y grows downward; the world's does not.
    out[o + 1] = -(sy - mask.cy) * inv
    out[o + 2] = (Math.random() * 2 - 1) * EXTRUDE * (0.4 + Math.random() * 0.6)
  }
  return out
}

/**
 * Fallback geometry: a (2,3) torus knot, tube-jittered and normalised to the same
 * unit box as the monogram so the rest of the scene needs no special case.
 */
export const torusKnotCloud = (count: number): Float32Array => {
  const out = new Float32Array(count * 3)
  const R = 1
  const r = 0.34
  const p = 2
  const q = 3
  let maxAbs = 1e-6

  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2
    const cu = Math.cos(q * t)
    const x = (R + r * cu) * Math.cos(p * t)
    const y = (R + r * cu) * Math.sin(p * t)
    const z = r * Math.sin(q * t)

    // Fatten the curve into a tube so it reads as a volume, not a wire.
    const a = Math.random() * Math.PI * 2
    const rad = 0.09 * Math.cbrt(Math.random())
    const jx = x + Math.cos(a) * rad
    const jy = y + Math.sin(a) * rad
    const jz = z + (Math.random() * 2 - 1) * rad

    const o = i * 3
    out[o] = jx
    out[o + 1] = jy
    out[o + 2] = jz
    maxAbs = Math.max(maxAbs, Math.abs(jx), Math.abs(jy))
  }

  const s = 0.5 / maxAbs
  for (let i = 0; i < out.length; i++) out[i] *= s
  return out
}

/**
 * `count` points filling the monogram, normalised to a unit-wide mark centred on
 * the origin. Memoised — asking twice for the same count returns the same buffer.
 */
export const sampleMonogram = (count: number, url = '/monogram.svg'): Promise<Float32Array> => {
  const cached = cloudCache.get(count)
  if (cached) return cached

  let maskPromise = maskCache.get(url)
  if (!maskPromise) {
    maskPromise = buildMask(url).catch((err: unknown) => {
      console.warn('[hero] monogram sampling failed, using torus-knot fallback:', err)
      return null
    })
    maskCache.set(url, maskPromise)
  }

  const promise = maskPromise.then((mask) =>
    mask ? fromMask(mask, count) : torusKnotCloud(count),
  )
  cloudCache.set(count, promise)
  return promise
}
