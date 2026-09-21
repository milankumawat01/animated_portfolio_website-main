/**
 * The monitor and laptop screens: a `CanvasTexture` of scrolling code-like bars in
 * brand blue, drawn procedurally.
 *
 * **Redrawn at 12fps, not 60.** A 512 × 288 canvas re-uploaded to the GPU every
 * frame costs more than the whole rest of this station; at 12fps it is invisible in
 * the frame time and reads *better*, because a code editor that scrolls smoothly at
 * 60fps looks like a video, and one that steps looks like someone typing.
 *
 * React-free on purpose, like `desk.ts` — `Scene.tsx` owns one of these per screen
 * in a `useMemo` and calls `update(elapsed)` from its `useFrame`.
 */

import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'

/* Palette. Deliberately a shade brighter than the DOM's dark tokens: the screen is
 * `MeshBasicMaterial`, so it is unlit, and it is read at ~150 screen pixels wide
 * through ACES tone mapping. A true #05080E panel goes to mud. */
const BG_TOP = '#0B1524'
const BG_BOT = '#060C16'
const GUTTER = 'rgba(139,154,175,0.30)'
const BRAND = '#3B82F6'
const BRAND_DIM = 'rgba(59,130,246,0.45)'
const MUTED = 'rgba(178,196,220,0.42)'
const KEYWORD = 'rgba(147,197,253,0.85)'
const GREEN = 'rgba(22,163,74,0.75)'
const CHROME = '#111B2C'

export interface ScreenPanelOptions {
  /** changes the code pattern, so the two screens are not the same picture */
  seed: number
  /** how fast the code scrolls, rows per second */
  speed?: number
  /** draw a window title bar */
  chrome?: boolean
}

export interface ScreenTextureOptions {
  /**
   * One entry per panel, stacked TOP TO BOTTOM in the canvas. `desk.ts` UV-maps
   * the merged screen mesh into the same slices in the same order, which is what
   * lets both screens be one mesh, one material and one draw call.
   */
  panels: readonly ScreenPanelOptions[]
  width?: number
  /** total canvas height across all panels */
  height?: number
  /** redraw rate. 12 by the scene bible; 0 draws exactly one frame, ever. */
  fps?: number
}

export interface ScreenTexture {
  readonly texture: CanvasTexture
  /**
   * Advance by `dt` seconds and redraw if the 12fps accumulator has come round.
   * Returns true on the frames it actually redrew.
   */
  update(dt: number): boolean
  /** Draw one frame at an explicit time. Used for the static `low`-tier frame. */
  draw(time: number): void
  dispose(): void
}

const ROW_H = 17
const PAD_X = 22
const PAD_TOP = 10
const GUTTER_W = 26

interface Row {
  indent: number
  /** segment widths, in canvas px, with their colour */
  spans: { w: number; c: string }[]
}

/** Deterministic pseudo-random; the same seed always gives the same "file". */
const rand = (n: number): number => {
  const s = Math.sin(n * 91.3458) * 47453.5453
  return s - Math.floor(s)
}

/**
 * A plausible page of source. Indentation walks up and down like real code, lines
 * open with a keyword-coloured token, and roughly one line in seven is a comment.
 */
const makeRows = (seed: number, count: number, maxW: number): Row[] => {
  const rows: Row[] = []
  let indent = 0
  for (let i = 0; i < count; i++) {
    const r = rand(seed + i * 3.7)
    const r2 = rand(seed + i * 7.1 + 11)

    if (r < 0.1) {
      rows.push({ indent, spans: [] }) // blank line
      continue
    }

    const comment = r > 0.86
    const spans: { w: number; c: string }[] = []
    const budget = maxW - indent * 16

    if (comment) {
      spans.push({ c: GREEN, w: Math.max(30, budget * (0.35 + r2 * 0.45)) })
    } else {
      spans.push({ c: KEYWORD, w: 18 + r2 * 26 })
      const rest = 1 + Math.floor(rand(seed + i * 2.3 + 5) * 3)
      let used = spans[0].w + 8
      for (let k = 0; k < rest; k++) {
        const rr = rand(seed + i * 13.7 + k * 5.1)
        const w = 16 + rr * 74
        if (used + w > budget) break
        // every third token is brand blue — that is the identity signal at 150px
        spans.push({ c: k % 3 === 1 ? BRAND : rr > 0.62 ? BRAND_DIM : MUTED, w })
        used += w + 8
      }
    }

    rows.push({ indent, spans })

    // walk the indentation
    const step = rand(seed + i * 17.3 + 3)
    if (step > 0.76 && indent < 3) indent++
    else if (step < 0.2 && indent > 0) indent--
  }
  return rows
}

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void => {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
  ctx.fill()
}

export function createScreenTexture(options: ScreenTextureOptions): ScreenTexture {
  const { panels, width = 512, height = 288 * panels.length, fps = 12 } = options
  const panelH = height / panels.length

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false

  // One long buffer per panel that wraps, so the scroll never reaches an end.
  const TOTAL_ROWS = 96
  const rowSets = panels.map((p) => makeRows(p.seed, TOTAL_ROWS, width - PAD_X - GUTTER_W - 24))

  /** Draw one panel into the region the caller has already translated to. */
  const drawPanel = (
    ctx: CanvasRenderingContext2D,
    index: number,
    time: number,
  ): void => {
    const panel = panels[index]
    const rows = rowSets[index]
    const speed = panel.speed ?? 1.35
    const chrome = panel.chrome ?? true
    const seed = panel.seed
    const height = panelH

    const chromeH = chrome ? 20 : 0
    const bodyTop = chromeH + PAD_TOP
    const visibleRows = Math.ceil((height - bodyTop) / ROW_H) + 2

    const bg = ctx.createLinearGradient(0, 0, 0, height)
    bg.addColorStop(0, BG_TOP)
    bg.addColorStop(1, BG_BOT)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    // brand glow, bottom right — keeps the panel from reading as a black rectangle
    const glow = ctx.createRadialGradient(width * 0.9, height, 0, width * 0.9, height, height)
    glow.addColorStop(0, 'rgba(37,99,235,0.28)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)

    if (chrome) {
      ctx.fillStyle = CHROME
      ctx.fillRect(0, 0, width, chromeH)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fillRect(0, chromeH - 1, width, 1)
      const dots = ['rgba(255,95,87,0.8)', 'rgba(254,188,46,0.8)', 'rgba(40,200,64,0.8)']
      dots.forEach((c, i) => {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.arc(14 + i * 13, chromeH / 2, 3.6, 0, Math.PI * 2)
        ctx.fill()
      })
      // active tab
      ctx.fillStyle = 'rgba(59,130,246,0.22)'
      roundRect(ctx, 62, 4, 76, chromeH - 8, 4)
    }

    const offset = (time * speed * ROW_H) % (TOTAL_ROWS * ROW_H)
    const first = Math.floor(offset / ROW_H)
    const sub = offset - first * ROW_H

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, chromeH, width, height - chromeH)
    ctx.clip()

    for (let i = 0; i < visibleRows; i++) {
      const row = rows[(first + i) % TOTAL_ROWS]
      const y = bodyTop + i * ROW_H - sub

      // gutter line number
      ctx.fillStyle = GUTTER
      roundRect(ctx, PAD_X, y + 5, 11, 3.5, 1.75)

      let x = PAD_X + GUTTER_W + row.indent * 16
      for (const span of row.spans) {
        ctx.fillStyle = span.c
        roundRect(ctx, x, y + 3.5, span.w, 6.5, 3.25)
        x += span.w + 8
      }
    }

    // caret — the one thing that says "live", and it blinks off the 12fps grid
    const caretRow = Math.floor(visibleRows * 0.42)
    if (Math.floor(time * 1.6) % 2 === 0) {
      ctx.fillStyle = BRAND
      const y = bodyTop + caretRow * ROW_H - sub
      ctx.fillRect(PAD_X + GUTTER_W + 8, y + 2, 2, 11)
    }

    ctx.restore()

    // status strip
    ctx.fillStyle = 'rgba(59,130,246,0.55)'
    ctx.fillRect(0, height - 6, width, 6)
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.fillRect(0, height - 6, width * (0.25 + 0.2 * Math.sin(time * 0.4 + seed)), 6)

  }

  const draw = (time: number): void => {
    if (!ctx) return
    for (let i = 0; i < panels.length; i++) {
      ctx.save()
      ctx.translate(0, i * panelH)
      ctx.beginPath()
      ctx.rect(0, 0, width, panelH)
      ctx.clip()
      drawPanel(ctx, i, time)
      ctx.restore()
    }
    texture.needsUpdate = true
  }

  let clock = 0
  let accumulator = 0
  const interval = fps > 0 ? 1 / fps : Infinity

  draw(0)

  return {
    texture,
    draw,
    update(dt: number): boolean {
      if (interval === Infinity) return false
      clock += dt
      accumulator += dt
      if (accumulator < interval) return false
      accumulator %= interval
      draw(clock)
      return true
    },
    dispose() {
      texture.dispose()
    },
  }
}
