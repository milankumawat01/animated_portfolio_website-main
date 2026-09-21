/**
 * Runtime verification harness.
 * Drives the dev server in real Chrome and reports console errors, station
 * transitions, theme flips and camera continuity.
 *
 *   node verify.mjs [url] [--shots outdir]
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const URL = process.argv[2] ?? 'http://localhost:3000/?debug=1'
const shotsIdx = process.argv.indexOf('--shots')
const SHOTS = shotsIdx > -1 ? process.argv[shotsIdx + 1] : null
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--disable-gpu-sandbox',
    '--no-sandbox',
  ],
})

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const errors = []
const warnings = []
page.on('console', (m) => {
  const t = m.type()
  if (t === 'error') errors.push(m.text())
  else if (t === 'warning') warnings.push(m.text())
})
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`))
const failedRequests = []
page.on('response', (r) => {
  if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`)
})

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(3500)

// --- preloader -------------------------------------------------------------
const preloaderGone = await page
  .locator('[role="status"]')
  .count()
  .then((n) => n === 0)

// --- DOM structure ---------------------------------------------------------
const stations = await page.$$eval('[data-station]', (els) =>
  els.map((e) => e.getAttribute('data-station')),
)

const pageHeight = await page.evaluate(() => document.body.scrollHeight)
const viewportH = 900

// --- scroll sweep ----------------------------------------------------------
const samples = []
const STEPS = 40
let lastPos = null
let maxJump = 0
let maxJumpAt = 0

for (let i = 0; i <= STEPS; i++) {
  const frac = i / STEPS
  // Drive Lenis directly. A raw window.scrollTo would be undone on the next raf.
  await page.evaluate((f) => {
    const lenis = window.__lenis
    const limit = (document.body.scrollHeight - window.innerHeight) * f
    if (lenis) lenis.scrollTo(limit, { immediate: true, force: true })
    else window.scrollTo({ top: limit, behavior: 'instant' })
  }, frac)
  await page.waitForTimeout(220)

  const s = await page.evaluate(() => {
    const cam = window.__cameraProbe ?? null
    const html = document.documentElement
    return {
      theme: html.getAttribute('data-theme'),
      bg: getComputedStyle(html).getPropertyValue('--page-bg').trim(),
      cam,
    }
  })

  const hud = await page
    .locator('[data-debug-hud]')
    .innerText()
    .catch(() => '')

  const station = /station\s+(\w+)/.exec(hud)?.[1] ?? '?'
  const fps = /fps\s+(\d+)/.exec(hud)?.[1] ?? '?'
  const calls = /draw calls\s+(\d+)\s*\/\s*(\d+)/.exec(hud)
  const tris = /triangles\s+([\d.k]+)\s*\/\s*([\d.k]+)/.exec(hud)

  if (s.cam) {
    if (lastPos) {
      const d = Math.hypot(s.cam[0] - lastPos[0], s.cam[1] - lastPos[1], s.cam[2] - lastPos[2])
      if (d > maxJump) {
        maxJump = d
        maxJumpAt = frac
      }
    }
    lastPos = s.cam
  }

  samples.push({
    frac: frac.toFixed(3),
    station,
    theme: s.theme,
    bg: s.bg,
    fps,
    calls: calls ? `${calls[1]}/${calls[2]}` : '?',
    tris: tris ? `${tris[1]}/${tris[2]}` : '?',
    cam: s.cam ? s.cam.map((v) => v.toFixed(1)).join(',') : '—',
  })

  if (SHOTS && i % 5 === 0) {
    await page.screenshot({ path: `${SHOTS}/p${String(i).padStart(2, '0')}.png` })
  }
}

console.log('\n=== STRUCTURE ===')
console.log('preloader dismissed :', preloaderGone)
console.log('page height         :', pageHeight, `px (${(pageHeight / viewportH).toFixed(1)} viewports)`)
console.log('data-station count  :', stations.length, '->', stations.join(', '))

console.log('\n=== SCROLL SWEEP ===')
console.log('frac    station      theme  fps  calls      tris          bg        camera')
for (const s of samples) {
  console.log(
    `${s.frac}   ${s.station.padEnd(11)} ${String(s.theme).padEnd(6)} ${String(s.fps).padEnd(4)} ${s.calls.padEnd(10)} ${s.tris.padEnd(13)} ${s.bg.padEnd(9)} ${s.cam}`,
  )
}

if (lastPos) {
  console.log(`\nlargest camera step between samples: ${maxJump.toFixed(2)} units at frac ${maxJumpAt.toFixed(3)}`)
}

console.log('\n=== NETWORK ===')
console.log('failed requests:', failedRequests.length)
failedRequests.slice(0, 10).forEach((r) => console.log('  ', r))

console.log('\n=== CONSOLE ===')
console.log('errors  :', errors.length)
errors.slice(0, 20).forEach((e) => console.log('  ERR ', e.slice(0, 220)))
const interesting = warnings.filter((w) => !/Download the React DevTools|webgl|Deprecat/i.test(w))
console.log('warnings:', warnings.length, `(${interesting.length} not boilerplate)`)
interesting.slice(0, 20).forEach((w) => console.log('  WARN', w.slice(0, 220)))

await browser.close()
process.exit(errors.length > 0 ? 1 : 0)
