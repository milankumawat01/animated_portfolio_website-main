/** Shared numeric helpers. Pure, allocation-free, safe to call inside useFrame. */

export const clamp = (v: number, min = 0, max = 1): number =>
  v < min ? min : v > max ? max : v

export const saturate = (v: number): number => clamp(v, 0, 1)

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const invLerp = (a: number, b: number, v: number): number =>
  a === b ? 0 : (v - a) / (b - a)

export const remap = (v: number, inA: number, inB: number, outA: number, outB: number): number =>
  lerp(outA, outB, invLerp(inA, inB, v))

/** Remap and clamp to the output range. The one you usually want. */
export const remapClamped = (
  v: number,
  inA: number,
  inB: number,
  outA: number,
  outB: number,
): number => lerp(outA, outB, saturate(invLerp(inA, inB, v)))

export const smoothstep = (edge0: number, edge1: number, v: number): number => {
  const t = saturate(invLerp(edge0, edge1, v))
  return t * t * (3 - 2 * t)
}

/**
 * Framerate-independent exponential smoothing.
 * `lambda` is the decay rate — higher is snappier. 6 is a good camera default.
 */
export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))

export const mod = (n: number, m: number): number => ((n % m) + m) % m

/** Shortest signed angular delta, in radians. */
export const deltaAngle = (a: number, b: number): number =>
  mod(b - a + Math.PI, Math.PI * 2) - Math.PI

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const hash11 = (n: number): number => {
  const s = Math.sin(n * 127.1) * 43758.5453123
  return s - Math.floor(s)
}

/** Cubic-bezier easing curves from docs/01-DESIGN-SYSTEM.md §4. */
export const EASE = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.76, 0, 0.24, 1],
  camera: [0.22, 1, 0.36, 1],
  snap: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>

export type EaseName = keyof typeof EASE

/** Scalar easings, for driving values inside useFrame where a bezier is overkill. */
export const easeOutExpo = (t: number): number =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export const easeOutBack = (t: number): number => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/** Linear-interpolate two hex colour strings. Returns `#rrggbb`. */
export const lerpHex = (a: string, b: string, t: number): string => {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t))
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t))
  const bl = Math.round(lerp(pa & 255, pb & 255, t))
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`
}
