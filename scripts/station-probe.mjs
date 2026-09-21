/**
 * Look at one station, in a real browser, without touching the shared build.
 *
 *   node scripts/station-probe.mjs <stationId> [--out DIR] [--q high|medium|low]
 *                                  [--port 3000] [--reduced] [--at 0.1,0.5,0.9]
 *
 * Prints the debug HUD readout (draw calls, triangles, fps, budget verdict) at each
 * sampled point in the station's own local progress, plus any console errors, and
 * writes a screenshot per sample.
 *
 * It drives a dev server that is ALREADY RUNNING. Do not start your own and do not
 * run `pnpm build` while other agents are working — every one of you shares a single
 * `.next` directory and concurrent builds corrupt it.
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const STATION_RANGES = {
  hero: [0.0, 0.11],
  about: [0.11, 0.23],
  projects: [0.23, 0.4],
  experience: [0.4, 0.55],
  skills: [0.55, 0.68],
  build: [0.68, 0.8],
  writing: [0.8, 0.91],
  contact: [0.91, 1.0],
}

const argv = process.argv.slice(2)
const station = argv.find((a) => !a.startsWith('--'))
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i > -1 ? argv[i + 1] : fallback
}

if (!station || !STATION_RANGES[station]) {
  console.error(`usage: node scripts/station-probe.mjs <${Object.keys(STATION_RANGES).join('|')}>`)
  process.exit(2)
}

const PORT = flag('port', '3000')
const Q = flag('q', null)
const OUT = flag('out', `.probe/${station}`)
const REDUCED = argv.includes('--reduced')
const AT = flag('at', '0.02,0.25,0.5,0.75,0.98')
  .split(',')
  .map(Number)

mkdirSync(OUT, { recursive: true })

const [lo, hi] = STATION_RANGES[station]
const url = `http://localhost:${PORT}/?debug=1${Q ? `&q=${Q}` : ''}`

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--no-sandbox',
  ],
})

const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  ...(REDUCED ? { reducedMotion: 'reduce' } : null),
})
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('response', (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${r.url()}`))

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(3500)

console.log(`\n${station}  range ${lo}–${hi}  tier=${Q ?? 'auto'}${REDUCED ? '  reduced-motion' : ''}`)
console.log('local   draw        triangles      passes  fps   verdict')

for (const local of AT) {
  const global = lo + (hi - lo) * local
  await page.evaluate((g) => {
    const l = window.__lenis
    const top = (document.body.scrollHeight - window.innerHeight) * g
    if (l) l.scrollTo(top, { immediate: true, force: true })
    else window.scrollTo({ top, behavior: 'instant' })
  }, global)
  // Let the damping settle and a few frames accumulate.
  await page.waitForTimeout(900)

  const hud = await page.locator('[data-debug-hud]').innerText().catch(() => '')
  const pick = (re) => re.exec(hud)?.slice(1) ?? []
  const [calls, callBudget] = pick(/draw calls\s+(\d+)\s*\/\s*(\d+)/)
  const [tris, trisBudget] = pick(/triangles\s+([\d.k]+)\s*\/\s*([\d.k]+)/)
  const [passes] = pick(/render passes\s+(\d+)/)
  const [fps] = pick(/fps\s+(\d+)/)
  const [active] = pick(/station\s+(\w+)/)
  const over = /OVER BUDGET/.test(hud)

  console.log(
    `${local.toFixed(2)}    ${`${calls}/${callBudget}`.padEnd(11)} ${`${tris}/${trisBudget}`.padEnd(14)} ${String(passes).padEnd(7)} ${String(fps).padEnd(5)} ${over ? 'OVER BUDGET' : 'ok'}${active !== station ? `   (HUD says ${active})` : ''}`,
  )

  await page.screenshot({ path: `${OUT}/${station}-${local.toFixed(2)}${Q ? `-${Q}` : ''}.png` })
}

console.log(`\nscreenshots -> ${OUT}`)
console.log('console errors:', errors.length)
errors.slice(0, 10).forEach((e) => console.log('  ', e.slice(0, 200)))

await browser.close()
process.exit(errors.length ? 1 : 0)
