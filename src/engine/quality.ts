import type { QualityTier } from './types'

/**
 * Device tiering. Runs once, client-side, before the canvas mounts.
 *
 * The heuristics below are deliberately pessimistic: a wrongly-demoted desktop loses
 * some bloom, a wrongly-promoted phone drops to 12fps and the whole site feels broken.
 * The live FPS probe in `useQuality` can demote further but never promotes.
 */

export interface DeviceProfile {
  tier: QualityTier
  hasWebGL: boolean
  dpr: number
  reducedMotion: boolean
  /** renderer string, when the browser will tell us; '' otherwise */
  renderer: string
  isTouch: boolean
}

export const DPR_CAP: Record<QualityTier, number> = {
  low: 1.0,
  medium: 1.5,
  high: 2.0,
}

/** Per-tier knobs the scenes branch on. See docs/02-ARCHITECTURE.md §6. */
export const TIER = {
  low: { particles: 8_000, graphNodes: 24, transmissionSamples: 0, shadows: false, postFX: false },
  medium: {
    particles: 40_000,
    graphNodes: 48,
    transmissionSamples: 2,
    shadows: false,
    postFX: true,
  },
  high: {
    particles: 150_000,
    graphNodes: 80,
    transmissionSamples: 6,
    shadows: true,
    postFX: true,
  },
} as const satisfies Record<QualityTier, Record<string, number | boolean>>

const WEAK_GPU = /(mali-[45]|mali-t[0-7]|adreno \(tm\) [2-5]|powervr|videocore|swiftshader|llvmpipe|software|apple gpu \(low)/i
const STRONG_GPU = /(rtx|radeon rx|geforce gtx 1[06]|geforce rtx|apple m[1-9]|adreno \(tm\) 7|mali-g7|mali-g[89])/i

export const detectWebGL = (): { ok: boolean; renderer: string } => {
  if (typeof document === 'undefined') return { ok: false, renderer: '' }
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return { ok: false, renderer: '' }

    let renderer = ''
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    if (ext) {
      renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '')
    }
    if (!renderer) renderer = String(gl.getParameter(gl.RENDERER) ?? '')

    const lose = gl.getExtension('WEBGL_lose_context')
    lose?.loseContext()

    return { ok: true, renderer }
  } catch {
    return { ok: false, renderer: '' }
  }
}

const readUrlOverride = (): QualityTier | null => {
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(window.location.search).get('q')
  return q === 'low' || q === 'medium' || q === 'high' ? q : null
}

export const detectProfile = (): DeviceProfile => {
  if (typeof window === 'undefined') {
    return {
      tier: 'high',
      hasWebGL: true,
      dpr: 1,
      reducedMotion: false,
      renderer: '',
      isTouch: false,
    }
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isTouch = window.matchMedia('(pointer: coarse)').matches
  const { ok: hasWebGL, renderer } = detectWebGL()

  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory ?? (isTouch ? 4 : 8)
  const cores = navigator.hardwareConcurrency ?? (isTouch ? 4 : 8)
  const shortSide = Math.min(window.innerWidth, window.innerHeight)

  let score = 0
  if (STRONG_GPU.test(renderer)) score += 3
  if (WEAK_GPU.test(renderer)) score -= 4
  if (memory >= 8) score += 2
  else if (memory <= 3) score -= 2
  if (cores >= 8) score += 2
  else if (cores <= 4) score -= 1
  if (isTouch) score -= 2
  if (shortSide < 480) score -= 1

  let tier: QualityTier = score >= 4 ? 'high' : score >= 0 ? 'medium' : 'low'
  if (!hasWebGL) tier = 'low'

  const override = readUrlOverride()
  if (override) tier = override

  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP[tier])

  return { tier, hasWebGL, dpr, reducedMotion, renderer, isTouch }
}

/** True when the tier was pinned via `?q=`, in which case the FPS probe must not demote. */
export const hasTierOverride = (): boolean => readUrlOverride() !== null

export const isDebug = (): boolean => {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('debug') === '1'
}

export const demote = (tier: QualityTier): QualityTier =>
  tier === 'high' ? 'medium' : tier === 'medium' ? 'low' : 'low'
