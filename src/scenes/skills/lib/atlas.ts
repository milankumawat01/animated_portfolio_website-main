/**
 * The tech-logo atlas: one 512×512 canvas texture holding all 36 marks in a 6×6 grid
 * of 85px cells, built at run time from the `simple-icons` path data.
 *
 * Why generate it instead of shipping images: 36 PNGs is 36 requests and 36 files to
 * keep in sync with the copy, and one texture keeps every sprite node inside a single
 * draw call. Built once and cached at module scope — remounting the station reuses it.
 *
 * The imports below are explicit and the map is static, exactly as in
 * `components/ui/TechLogo.tsx`. A namespace import plus a dynamic lookup defeats
 * tree-shaking and drags the whole ~3,300-icon package into the bundle; that cost
 * 2.2MB before it was fixed and it must not come back through this file.
 *
 * Four names have no mark in simple-icons@16 — OpenAI, LlamaIndex, VS Code and RAG.
 * The DOM renders them as a lettered tile and so does this atlas, so the 3D graph and
 * the cards below it never disagree about what a technology looks like.
 */

import {
  siClaude,
  siCloudflare,
  siConvex,
  siCss,
  siDigitalocean,
  siDocker,
  siFastapi,
  siFigma,
  siFirebase,
  siGithub,
  siGooglegemini,
  siHtml5,
  siLangchain,
  siMongodb,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siNotion,
  siPostgresql,
  siPostman,
  siPython,
  siReact,
  siRedis,
  siResend,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siUbuntu,
  siVercel,
} from 'simple-icons'
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import { skills } from '@/data/skills'
import { ICON_MONOGRAM } from '@/data/techIcons'

interface SimpleIcon {
  path: string
  title: string
  hex: string
}

const ICONS: Readonly<Record<string, SimpleIcon>> = {
  Python: siPython,
  FastAPI: siFastapi,
  'Node.js': siNodedotjs,
  PostgreSQL: siPostgresql,
  MongoDB: siMongodb,
  Redis: siRedis,
  Claude: siClaude,
  Gemini: siGooglegemini,
  LangChain: siLangchain,
  'Next.js': siNextdotjs,
  React: siReact,
  TypeScript: siTypescript,
  'Tailwind CSS': siTailwindcss,
  HTML: siHtml5,
  CSS: siCss,
  Supabase: siSupabase,
  Convex: siConvex,
  Cloudflare: siCloudflare,
  'Cloudflare R2': siCloudflare,
  Firebase: siFirebase,
  Docker: siDocker,
  Nginx: siNginx,
  Vercel: siVercel,
  DigitalOcean: siDigitalocean,
  Ubuntu: siUbuntu,
  GitHub: siGithub,
  Postman: siPostman,
  Figma: siFigma,
  Resend: siResend,
  Notion: siNotion,
}

export const ATLAS_SIZE = 512
export const ATLAS_COLS = 6
export const ATLAS_CELL = 85
/** UV width and height of one cell. */
export const ATLAS_CELL_UV = ATLAS_CELL / ATLAS_SIZE

/** Bottom-left UV of a cell, matching a texture uploaded with the default flipY. */
export const cellUv = (cell: number): [number, number] => {
  const col = cell % ATLAS_COLS
  const row = Math.floor(cell / ATLAS_COLS)
  return [(col * ATLAS_CELL) / ATLAS_SIZE, 1 - ((row + 1) * ATLAS_CELL) / ATLAS_SIZE]
}

/** simple-icons paths are authored on a 24×24 grid. */
const ICON_VIEWBOX = 24
const ICON_INSET = 13
const MONOGRAM_INSET = 11

const INK = '#1b2a41'
const TILE_BG = 'rgba(37, 99, 235, 0.10)'
const TILE_LINE = 'rgba(37, 99, 235, 0.42)'

const relativeLuminance = (hex: string): number => {
  const v = parseInt(hex, 16)
  const r = ((v >> 16) & 255) / 255
  const g = ((v >> 8) & 255) / 255
  const b = (v & 255) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const drawMark = (ctx: CanvasRenderingContext2D, name: string, col: number, row: number): void => {
  const ox = col * ATLAS_CELL
  const oy = row * ATLAS_CELL
  const icon = ICONS[name]

  if (icon) {
    // Very light marks would vanish against the light station; clamp them to ink.
    const colour = relativeLuminance(icon.hex) > 0.86 ? INK : `#${icon.hex}`
    const size = ATLAS_CELL - ICON_INSET * 2
    ctx.save()
    ctx.translate(ox + ICON_INSET, oy + ICON_INSET)
    ctx.scale(size / ICON_VIEWBOX, size / ICON_VIEWBOX)
    ctx.fillStyle = colour
    ctx.fill(new Path2D(icon.path))
    ctx.restore()
    return
  }

  // The four known gaps: a rounded tile with the short label, same as the DOM.
  const label = ICON_MONOGRAM[name] ?? name.slice(0, 2).toUpperCase()
  const box = ATLAS_CELL - MONOGRAM_INSET * 2
  ctx.save()
  ctx.translate(ox + MONOGRAM_INSET, oy + MONOGRAM_INSET)
  roundRect(ctx, 1, 1, box - 2, box - 2, box * 0.24)
  ctx.fillStyle = TILE_BG
  ctx.fill()
  ctx.lineWidth = 2.5
  ctx.strokeStyle = TILE_LINE
  ctx.stroke()
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${Math.round(box * (label.length > 2 ? 0.32 : 0.42))}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`
  ctx.fillText(label, box / 2, box / 2 + 1)
  ctx.restore()
}

let cached: CanvasTexture | null = null

/**
 * The atlas texture. Returns null during SSR — callers branch on it rather than
 * rendering the sprite layer.
 */
export const getTechAtlas = (): CanvasTexture | null => {
  if (cached) return cached
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_SIZE
  canvas.height = ATLAS_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  skills.forEach((cat, ci) => {
    cat.items.forEach((name, ii) => {
      const cell = ci * ATLAS_COLS + ii
      drawMark(ctx, name, cell % ATLAS_COLS, Math.floor(cell / ATLAS_COLS))
    })
  })

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.anisotropy = 1
  texture.needsUpdate = true

  cached = texture
  return texture
}

/** Only the page teardown should ever call this — the atlas outlives the station. */
export const disposeTechAtlas = (): void => {
  cached?.dispose()
  cached = null
}
