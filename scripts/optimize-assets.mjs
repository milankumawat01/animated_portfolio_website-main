/**
 * The asset pipeline. `assets/incoming/` in, `public/` out.
 *
 *   node scripts/optimize-assets.mjs           run it (this is what `pnpm build` does)
 *   node scripts/optimize-assets.mjs --force   reprocess even if the output is fresh
 *   node scripts/optimize-assets.mjs --strict  exit 1 when a BLOCKING asset is missing
 *   node scripts/optimize-assets.mjs --quiet   only print warnings and errors
 *
 * It is chained into `pnpm build` rather than hung off a `prebuild` script: pnpm
 * does not run pre/post scripts unless `enable-pre-post-scripts` is turned on, and
 * `vercel.json` invokes `pnpm build` directly, so a `prebuild` hook would silently
 * never fire in the one place it matters.
 *
 * ## The three rules this script is built around
 *
 * 1. **A missing asset is never an error.** Every slot on this site already has a
 *    working procedural fallback — that is a deliberate design decision recorded in
 *    `docs/ASSET-PROMPTS.md`, not a gap. So the default exit code is 0 even with an
 *    empty `assets/incoming/`, and `pnpm build` works on a clean checkout. What the
 *    script will not do is let a missing asset pass quietly: every 🔴 BLOCKING slot
 *    that is still empty is named, with its spec, at the end of every run.
 *
 * 2. **It only ever writes. It never deletes.** `public/` already contains two real
 *    deliverables that no incoming file corresponds to — `Milan_Kumawat_Resume.pdf`
 *    and the hand-built `monogram.svg` placeholder that the hero particle sampler
 *    reads at runtime. A pipeline that "owns" `public/` and cleans it would delete
 *    both. This one overwrites a path only when an incoming file maps onto it.
 *
 * 3. **The canonical filename is frozen.** `scenes/about/Portrait.tsx`,
 *    `scenes/projects/Slab.tsx` and `scenes/writing/Sheet.tsx` load exact paths
 *    (`/images/portrait.jpg`, `/images/project-hiro.png`, …) through
 *    `THREE.TextureLoader`, which does no content negotiation. So the pipeline always
 *    writes the original extension at the canonical path, and puts AVIF/WebP beside
 *    it for the DOM layer rather than instead of it.
 *
 * ## sharp
 *
 * `sharp` is an optional peer of this script, not a hard dependency, because adding
 * it to `package.json` without regenerating `pnpm-lock.yaml` would break
 * `pnpm install --frozen-lockfile` on CI and on Vercel. If it is installed the full
 * resize/encode path runs. If it is not, incoming files are copied to their
 * canonical paths verbatim — the site still gets the real artwork, just unoptimised
 * — and the script prints the one command that fixes it.
 */
import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const INCOMING = join(ROOT, 'assets', 'incoming')
const PUBLIC = join(ROOT, 'public')
const MANIFEST_OUT = join(ROOT, 'src', 'data', 'assetManifest.ts')

const argv = process.argv.slice(2)
const FORCE = argv.includes('--force')
const STRICT = argv.includes('--strict')
const QUIET = argv.includes('--quiet')

const C = process.stdout.isTTY
  ? {
      dim: (s) => `\x1b[2m${s}\x1b[0m`,
      red: (s) => `\x1b[31m${s}\x1b[0m`,
      yellow: (s) => `\x1b[33m${s}\x1b[0m`,
      green: (s) => `\x1b[32m${s}\x1b[0m`,
      bold: (s) => `\x1b[1m${s}\x1b[0m`,
    }
  : { dim: (s) => s, red: (s) => s, yellow: (s) => s, green: (s) => s, bold: (s) => s }

const log = (...a) => !QUIET && console.log(...a)
const warn = (...a) => console.log(...a)

/* ------------------------------------------------------------------ the spec

   Transcribed from docs/04-ASSET-MANIFEST.md and docs/ASSET-PROMPTS.md. `maxWidth`
   is the widest the canonical (2x) output is allowed to be; the 1x variants are
   half that. `priority` mirrors the manifest's key: 🔴 blocking, 🟡 needed,
   🟢 optional.                                                                 */

/** @typedef {'blocking'|'needed'|'optional'} Priority */

const IMAGES = [
  {
    key: 'portrait',
    src: 'portrait.jpg',
    out: 'images/portrait.jpg',
    maxWidth: 1600,
    priority: 'blocking',
    spec: '3:4 portrait, min 1600×2133',
    usedBy: 'About — scenes/about/Portrait.tsx (USE_PORTRAIT_IMAGE)',
    fallback: 'a procedural grey plane',
  },
  {
    key: 'portraitCutout',
    src: 'portrait-cutout.png',
    out: 'images/portrait-cutout.png',
    maxWidth: 1600,
    priority: 'optional',
    spec: 'same crop as portrait.jpg, background removed',
    usedBy: 'About — enables the layered depth effect',
    fallback: 'the flat portrait plane',
  },
  {
    key: 'deskDark',
    src: 'desk-dark.jpg',
    out: 'images/desk-dark.jpg',
    maxWidth: 2400,
    priority: 'blocking',
    spec: '16:9 landscape, min 2400×1350, dark ambient light',
    usedBy: 'Hero background, Contact right bleed',
    fallback: 'no photographic backdrop',
  },
  {
    key: 'workspace',
    src: 'workspace.jpg',
    out: 'images/workspace.jpg',
    maxWidth: 1200,
    priority: 'needed',
    spec: '4:5 portrait, min 1200×1500',
    usedBy: 'Skills side card',
    fallback: 'the card ships without a photo',
  },
  ...['hiro', 'salezo', 'autoresumebot', 'internal-tools'].map((id) => ({
    key: `project-${id}`,
    src: `project-${id}.png`,
    out: `images/project-${id}.png`,
    maxWidth: 2000,
    priority: /** @type {Priority} */ ('blocking'),
    spec: '16:10, min 2000×1250, no browser chrome',
    usedBy: 'Projects — scenes/projects/Slab.tsx (USE_PROJECT_IMAGES)',
    fallback: 'a procedural canvas texture behind the glass',
  })),
  ...['fastapi', 'backend', 'autoresumebot', 'idea-to-production'].map((id) => ({
    key: `article-${id}`,
    src: `article-${id}.jpg`,
    out: `images/article-${id}.jpg`,
    maxWidth: 1600,
    priority: /** @type {Priority} */ ('needed'),
    spec: '16:9, min 1600×900',
    usedBy: 'Writing — scenes/writing/Sheet.tsx (USE_ARTICLE_IMAGES)',
    fallback: 'a brand-gradient cover with the category name',
  })),
  ...['hiro', 'salezo', 'autoresumebot', 'internal-tools'].map((id) => ({
    key: `logo-${id}`,
    src: `logo-${id}.png`,
    out: `images/logo-${id}.png`,
    maxWidth: 256,
    priority: /** @type {Priority} */ ('optional'),
    spec: '256×256 PNG with transparency',
    usedBy: 'Projects card headers',
    fallback: 'no logo mark on the card',
  })),
  {
    key: 'icon',
    src: 'icon.png',
    out: 'icon.png',
    maxWidth: 512,
    priority: 'needed',
    spec: '512×512 PNG, for PWA and social',
    usedBy: 'social cards, PWA manifest',
    fallback: 'the generated app/icon.svg only',
    // A social/PWA icon is fetched by crawlers that do not negotiate. Ship the PNG
    // alone; AVIF/WebP siblings would never be requested.
    variants: false,
  },
]

/** Files that are copied through byte-for-byte. Vectors, fonts, documents, audio. */
const COPIES = [
  {
    key: 'monogram',
    src: 'monogram.svg',
    out: 'monogram.svg',
    priority: 'blocking',
    spec: 'SVG, 512×512 viewBox, CLOSED FILLED paths, no strokes',
    usedBy: 'Hero + Contact particle clouds — scenes/hero/lib/sampleMonogram.ts',
    fallback: 'the hand-built geometric MK already at public/monogram.svg',
  },
  {
    key: 'favicon',
    src: 'favicon.svg',
    out: 'favicon.svg',
    priority: 'needed',
    spec: 'the same mark, simplified, no margin',
    usedBy: 'browser tab',
    fallback: 'src/app/icon.svg',
  },
  {
    key: 'resume',
    src: 'Milan_Kumawat_Resume.pdf',
    out: 'Milan_Kumawat_Resume.pdf',
    priority: 'blocking',
    spec: 'current PDF',
    usedBy: 'Hero + Contact download links',
    // The only slot whose fallback is already a real, shipping file.
    fallback: 'the copy already at public/Milan_Kumawat_Resume.pdf',
    satisfiedBy: 'Milan_Kumawat_Resume.pdf',
  },
]

/** Whole folders that are mirrored into `public/`, with an allowed extension list. */
const FOLDERS = [
  {
    key: 'logos',
    src: 'logos',
    out: 'logos',
    exts: ['.svg'],
    priority: 'needed',
    spec: 'openai.svg, vscode.svg, llamaindex.svg — single colour, 128×128 viewBox',
    usedBy: 'Hero strip + Skills graph, for the four marks simple-icons lacks',
    fallback: 'lettered monogram tiles (AI / VS / LI / RAG) — a deliberate look',
  },
  {
    key: 'fonts',
    src: 'fonts',
    out: 'fonts',
    exts: ['.woff2'],
    priority: 'needed',
    spec: 'Satoshi-Bold.woff2, Satoshi-Black.woff2 from fontshare.com',
    usedBy: 'the display face',
    fallback: 'Sora via next/font/google — the approved substitute',
    // Dropping the files in is not enough on its own.
    postStep:
      'swap the Sora import in src/app/layout.tsx for next/font/local — see the comment there',
  },
  {
    key: 'audio',
    src: 'audio',
    out: 'audio',
    exts: ['.webm', '.mp3', '.ogg'],
    priority: 'optional',
    spec: 'ambient pad loop + hover tick + arrival swell',
    usedBy: 'nothing yet',
    fallback: 'P4 omitted the audio system entirely rather than ship a dead toggle',
    postStep: 'P4 would need to be revisited — there is no audio system to feed',
  },
]

/* ------------------------------------------------------------------- helpers */

const ensureDir = (p) => mkdirSync(dirname(p), { recursive: true })

/** Idempotency: skip when the output already exists and is not older than the input. */
const fresh = (src, out) => {
  if (FORCE) return false
  if (!existsSync(out)) return false
  try {
    return statSync(out).mtimeMs >= statSync(src).mtimeMs
  } catch {
    return false
  }
}

const bytes = (n) =>
  n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)}MB` : `${Math.round(n / 1024)}kB`

const PRIORITY_LABEL = {
  blocking: { mark: 'BLOCKING', colour: C.red },
  needed: { mark: 'NEEDED  ', colour: C.yellow },
  optional: { mark: 'OPTIONAL', colour: C.dim },
}

/**
 * Reads width and height out of an image header without decoding it, so
 * `assetManifest.ts` has real dimensions even when sharp is not installed.
 * Covers PNG, JPEG (baseline and progressive) and WebP — the three formats the
 * manifest asks Milan for.
 */
const probeSize = (file) => {
  let buf
  try {
    buf = readFileSync(file)
  } catch {
    return null
  }

  // PNG: IHDR is always the first chunk.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }

  // WebP: RIFF....WEBP, then VP8 / VP8L / VP8X.
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const tag = buf.toString('ascii', 12, 16)
    if (tag === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
    if (tag === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
    if (tag === 'VP8L') {
      const b = buf.readUInt32LE(21)
      return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 }
    }
  }

  // JPEG: walk the segment chain to the first SOFn that is not a DHT/DAC/RST.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) {
        i++
        continue
      }
      const marker = buf[i + 1]
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2
        continue
      }
      const len = buf.readUInt16BE(i + 2)
      const isSOF =
        marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
      if (isSOF) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
      i += 2 + len
    }
  }

  return null
}

/* ------------------------------------------------------------------- the run */

log(C.bold('\nasset pipeline'))
log(C.dim(`  in   ${relative(ROOT, INCOMING)}`))
log(C.dim(`  out  ${relative(ROOT, PUBLIC)}`))

if (!existsSync(INCOMING)) {
  mkdirSync(INCOMING, { recursive: true })
}

/** Everything in `assets/incoming/`, minus the README the folder ships with. */
const present = new Set(
  readdirSync(INCOMING, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.toLowerCase() !== 'readme.md')
    .map((e) => e.name),
)

let sharp = null
try {
  ;({ default: sharp } = await import('sharp'))
} catch {
  /* optional — handled below */
}

const written = []
const skipped = []
const missing = []
const manifestEntries = []
const notes = []

const recordMissing = (entry) => {
  missing.push(entry)
}

/* --- images ------------------------------------------------------------- */

for (const spec of IMAGES) {
  const src = join(INCOMING, spec.src)
  if (!existsSync(src)) {
    recordMissing(spec)
    continue
  }

  const canonical = join(PUBLIC, spec.out)
  ensureDir(canonical)

  const ext = extname(spec.src).toLowerCase()
  const size = probeSize(src)

  if (!sharp) {
    if (!fresh(src, canonical)) {
      copyFileSync(src, canonical)
      written.push([spec.out, statSync(canonical).size, 'copied verbatim — sharp not installed'])
    } else {
      skipped.push(spec.out)
    }
    manifestEntries.push({
      key: spec.key,
      src: `/${spec.out}`,
      width: size?.width ?? 0,
      height: size?.height ?? 0,
      variants: {},
    })
    continue
  }

  // ---- canonical: same format, same path, capped at maxWidth -------------
  const input = sharp(src, { failOn: 'none' })
  const meta = await input.metadata()
  const targetW = Math.min(meta.width ?? spec.maxWidth, spec.maxWidth)
  const scale = targetW / (meta.width ?? targetW)
  const targetH = Math.round((meta.height ?? 0) * scale) || 0

  if (!fresh(src, canonical)) {
    const pipe = sharp(src, { failOn: 'none' }).resize({
      width: targetW,
      withoutEnlargement: true,
    })
    const encoded =
      ext === '.png'
        ? pipe.png({ compressionLevel: 9, palette: true })
        : pipe.jpeg({ quality: 82, mozjpeg: true, progressive: true })
    await encoded.toFile(canonical)
    written.push([spec.out, statSync(canonical).size, `${targetW}×${targetH}`])
  } else {
    skipped.push(spec.out)
  }

  // ---- AVIF + WebP at 1x and 2x -----------------------------------------
  /** @type {Record<string, { src: string; width: number; height: number }>} */
  const variants = {}
  if (spec.variants !== false) {
    const base = spec.out.replace(/\.[^.]+$/, '')
    for (const [density, width] of [
      ['1x', Math.round(targetW / 2)],
      ['2x', targetW],
    ]) {
      if (width < 16) continue
      for (const [format, encode] of [
        ['avif', (p) => p.avif({ quality: 55, effort: 4 })],
        ['webp', (p) => p.webp({ quality: 80, effort: 4 })],
      ]) {
        const rel = `${base}@${density}.${format}`
        const abs = join(PUBLIC, rel)
        ensureDir(abs)
        if (!fresh(src, abs)) {
          await encode(
            sharp(src, { failOn: 'none' }).resize({ width, withoutEnlargement: true }),
          ).toFile(abs)
          written.push([rel, statSync(abs).size, `${width}px`])
        } else {
          skipped.push(rel)
        }
        variants[`${format}${density}`] = {
          src: `/${rel}`,
          width,
          height: Math.round((targetH * width) / targetW) || 0,
        }
      }
    }
  }

  manifestEntries.push({
    key: spec.key,
    src: `/${spec.out}`,
    width: targetW,
    height: targetH,
    variants,
  })
}

/* --- straight copies ----------------------------------------------------- */

for (const spec of COPIES) {
  const src = join(INCOMING, spec.src)
  if (!existsSync(src)) {
    // The resume already ships from public/. Report it as satisfied, not missing.
    if (spec.satisfiedBy && existsSync(join(PUBLIC, spec.satisfiedBy))) {
      notes.push(
        `${spec.key}: nothing incoming, and public/${spec.satisfiedBy} is already in place. ` +
          'Confirm it is current.',
      )
      continue
    }
    recordMissing(spec)
    continue
  }
  const out = join(PUBLIC, spec.out)
  ensureDir(out)
  if (fresh(src, out)) {
    skipped.push(spec.out)
    continue
  }
  copyFileSync(src, out)
  written.push([spec.out, statSync(out).size, ''])
  if (spec.key === 'monogram') {
    notes.push(
      'monogram.svg replaced. It must be CLOSED FILLED paths — an open or stroked ' +
        'path has no interior, the hero sampler finds no points, and the cloud is empty.',
    )
  }
}

/* --- folders ------------------------------------------------------------- */

for (const spec of FOLDERS) {
  const dir = join(INCOMING, spec.src)
  if (!existsSync(dir)) {
    recordMissing(spec)
    continue
  }
  const files = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && spec.exts.includes(extname(e.name).toLowerCase()))
    .map((e) => e.name)

  if (files.length === 0) {
    recordMissing(spec)
    continue
  }

  for (const name of files) {
    const src = join(dir, name)
    const rel = `${spec.out}/${name}`
    const out = join(PUBLIC, rel)
    ensureDir(out)
    if (fresh(src, out)) {
      skipped.push(rel)
      continue
    }
    copyFileSync(src, out)
    written.push([rel, statSync(out).size, ''])
  }
  if (spec.postStep) notes.push(`${spec.key}: ${spec.postStep}`)
}

/* --- unrecognised incoming files ----------------------------------------- */

const claimed = new Set([...IMAGES.map((s) => s.src), ...COPIES.map((s) => s.src)])
const strays = [...present].filter((n) => !claimed.has(n))

/* --- generated manifest -------------------------------------------------- */

/**
 * Only written when there is something to describe. On a clean checkout no file
 * appears in `src/data/`, which keeps the pipeline a true no-op and keeps a
 * generated file out of a hand-authored folder until it earns its place.
 */
if (manifestEntries.length > 0) {
  const body = manifestEntries
    .map((e) => {
      const lines = Object.entries(e.variants).map(
        ([k, v]) => `      ${k}: { src: '${v.src}', width: ${v.width}, height: ${v.height} },`,
      )
      const variants = lines.length ? `{\n${lines.join('\n')}\n    }` : '{}'
      // Only quote a key that is not a plain identifier — `project-hiro` needs it,
      // `icon` does not.
      const key = /^[A-Za-z_$][\w$]*$/.test(e.key) ? e.key : `'${e.key}'`
      return (
        `  ${key}: {\n` +
        `    src: '${e.src}',\n` +
        `    width: ${e.width},\n` +
        `    height: ${e.height},\n` +
        `    variants: ${variants},\n` +
        `  },`
      )
    })
    .join('\n')

  const hash = createHash('sha1').update(body).digest('hex').slice(0, 8)
  const file = `/**
 * GENERATED by scripts/optimize-assets.mjs — do not edit.
 *
 * Real pixel dimensions for every asset the pipeline placed in \`public/\`, so
 * \`next/image\` gets width and height without a runtime probe and nothing on the
 * page reflows when a photograph decodes.
 *
 * fingerprint ${hash}
 */

export interface AssetVariant {
  src: string
  width: number
  height: number
}

export interface AssetEntry extends AssetVariant {
  /** AVIF and WebP at 1x and 2x, keyed \`avif1x\` | \`avif2x\` | \`webp1x\` | \`webp2x\`. */
  variants: Partial<Record<'avif1x' | 'avif2x' | 'webp1x' | 'webp2x', AssetVariant>>
}

export const assetManifest = {
${body}
} as const satisfies Record<string, AssetEntry>

export type AssetKey = keyof typeof assetManifest

export const asset = (key: AssetKey): AssetEntry => assetManifest[key]
`
  ensureDir(MANIFEST_OUT)
  const previous = existsSync(MANIFEST_OUT) ? readFileSync(MANIFEST_OUT, 'utf8') : ''
  if (previous !== file) {
    writeFileSync(MANIFEST_OUT, file)
    written.push(['src/data/assetManifest.ts', file.length, `${manifestEntries.length} entries`])
  } else {
    skipped.push('src/data/assetManifest.ts')
  }
}

/* ------------------------------------------------------------------ reporting */

if (written.length) {
  log('')
  for (const [name, size, detail] of written) {
    log(`  ${C.green('+')} ${name.padEnd(42)} ${bytes(size).padStart(7)}  ${C.dim(detail)}`)
  }
}
if (skipped.length) {
  log(C.dim(`\n  ${skipped.length} output(s) already up to date (--force to redo)`))
}

if (!sharp && (written.length || IMAGES.some((s) => existsSync(join(INCOMING, s.src))))) {
  warn('')
  warn(C.yellow(C.bold('  sharp is not installed.')))
  warn(
    C.yellow(
      '  Images were copied through at full size with no AVIF/WebP variants. Run:',
    ),
  )
  warn(C.bold('      pnpm add -D sharp && pnpm build'))
}

if (strays.length) {
  warn('')
  warn(C.yellow(`  ${strays.length} file(s) in assets/incoming/ the pipeline does not recognise:`))
  for (const s of strays) warn(C.yellow(`      ${s}`))
  warn(C.dim('  Check the filename against docs/04-ASSET-MANIFEST.md — they are exact.'))
}

if (notes.length) {
  log('')
  for (const n of notes) log(C.dim(`  note  ${n}`))
}

const byPriority = {
  blocking: missing.filter((m) => m.priority === 'blocking'),
  needed: missing.filter((m) => m.priority === 'needed'),
  optional: missing.filter((m) => m.priority === 'optional'),
}

if (missing.length === 0) {
  log(C.green('\n  every asset slot is filled.\n'))
} else {
  warn('')
  warn(C.bold(`  ${missing.length} asset slot(s) still empty — the site ships a fallback for each:`))
  for (const level of ['blocking', 'needed', 'optional']) {
    const group = byPriority[level]
    if (!group.length) continue
    const { mark, colour } = PRIORITY_LABEL[level]
    warn('')
    for (const m of group) {
      warn(`  ${colour(mark)}  ${C.bold(`assets/incoming/${m.src}`)}`)
      warn(C.dim(`              spec      ${m.spec}`))
      warn(C.dim(`              used by   ${m.usedBy}`))
      warn(C.dim(`              until then ${m.fallback}`))
    }
  }
  warn('')
  warn(
    C.dim(
      '  Generation prompts and exact specs for every one of these: docs/ASSET-PROMPTS.md',
    ),
  )
  warn('')
}

if (STRICT && byPriority.blocking.length) {
  console.error(
    C.red(
      `  --strict: ${byPriority.blocking.length} BLOCKING asset(s) missing. Failing the build.`,
    ),
  )
  process.exit(1)
}

/**
 * Exit 0 even with everything missing. The site is designed to run on its
 * fallbacks; failing here would mean a clean checkout could not be built.
 */
process.exit(0)
