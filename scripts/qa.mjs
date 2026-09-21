/**
 * The standing verification run.
 *
 *   node scripts/qa.mjs            build, serve, check, tear down
 *   node scripts/qa.mjs --no-build reuse the existing .next
 *   node scripts/qa.mjs --shots D  also write full-page screenshots to D
 *
 * It runs against `next start`, not `next dev`. The dev server goes stale after a
 * long editing session on Windows and starts 404-ing its own chunks, which reads as
 * a component bug when it is nothing of the sort. The production bundle is both
 * stable and closer to what ships.
 */
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import net from 'node:net'

const args = process.argv.slice(2)
const NO_BUILD = args.includes('--no-build')
const shotsIdx = args.indexOf('--shots')
const SHOTS = shotsIdx > -1 ? args[shotsIdx + 1] : null
const PORT = 3100
const BASE = `http://localhost:${PORT}`
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const run = (cmd, cmdArgs, opts = {}) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, cmdArgs, { stdio: 'inherit', shell: true, ...opts })
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))))
  })

const fail = []
const note = (ok, label, detail = '') => {
  if (!ok) fail.push(label)
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${detail ? '  ' + detail : ''}`)
}

if (!NO_BUILD) {
  console.log('--- building ---')
  await run('pnpm', ['build'])
}

/**
 * Refuse to start if something is already on the port. Two overlapping qa runs
 * otherwise attach to each other's server and report nonsense against a stale build,
 * which looks exactly like a catastrophic regression.
 */
const portInUse = await new Promise((resolve) => {
  const probe = net.createConnection({ port: PORT, host: '127.0.0.1' })
  probe.on('connect', () => {
    probe.destroy()
    resolve(true)
  })
  probe.on('error', () => resolve(false))
  setTimeout(() => {
    probe.destroy()
    resolve(false)
  }, 2000)
})
if (portInUse) {
  console.error(
    `\nport ${PORT} is already serving something. Another qa run is probably still ` +
      `going. Wait for it, or free the port:\n` +
      `  powershell -Command "Get-NetTCPConnection -LocalPort ${PORT} -State Listen | ` +
      `ForEach-Object { Stop-Process -Id \\$_.OwningProcess -Force }"`,
  )
  process.exit(2)
}

console.log(`\n--- serving on ${PORT} ---`)
const server = spawn('pnpm', ['exec', 'next', 'start', '-p', String(PORT)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
})
const stop = () => {
  try {
    process.kill(-server.pid)
  } catch {
    server.kill('SIGKILL')
  }
}

await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('server did not start in 60s')), 60000)
  const onData = (b) => {
    const text = String(b)
    if (/EADDRINUSE|address already in use/i.test(text)) {
      clearTimeout(timer)
      reject(new Error(`port ${PORT} is still occupied — refusing to test a foreign server`))
      return
    }
    if (/Ready in|started server|Local:/i.test(text)) {
      clearTimeout(timer)
      resolve()
    }
  }
  server.stdout.on('data', onData)
  server.stderr.on('data', onData)
})
await new Promise((r) => setTimeout(r, 1200))

/**
 * Locally we drive the installed Chrome: Playwright's own Chromium download fails on
 * the dev machine. On CI that channel does not exist, so use the bundled browser.
 */
const USE_BUNDLED = args.includes('--ci') || process.env.CI === 'true'

const browser = await chromium.launch({
  ...(USE_BUNDLED ? null : { channel: 'chrome' }),
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--no-sandbox',
  ],
})

const newPage = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts })
  const page = await ctx.newPage()
  const errors = []
  const bad = []
  page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('response', (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`))
  return { ctx, page, errors, bad }
}

const scrollTo = async (page, frac) => {
  await page.evaluate((f) => {
    const l = window.__lenis
    const top = (document.body.scrollHeight - window.innerHeight) * f
    if (l) l.scrollTo(top, { immediate: true, force: true })
    else window.scrollTo({ top, behavior: 'instant' })
  }, frac)
  await page.waitForTimeout(240)
}

try {
  // ======================================================= 1. structure + sweep
  console.log('\n=== structure & scroll sweep ===')
  const { ctx, page, errors, bad } = await newPage()
  await page.goto(`${BASE}/?debug=1`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(3500)

  note((await page.locator('[role="status"]').count()) === 0, 'preloader dismissed')

  const stations = await page.$$eval('[data-station]', (e) =>
    e.map((x) => x.getAttribute('data-station')),
  )
  note(stations.length === 8, 'eight station sections', stations.join(','))
  if (stations.length !== 8) {
    // Everything downstream reads as a cascade of failures otherwise.
    throw new Error(
      `page rendered ${stations.length} stations — the rest of the run would be noise. ` +
        'Check that the server on this port is the one this script started.',
    )
  }

  const vhTotal = await page.evaluate(
    () => document.body.scrollHeight / window.innerHeight,
  )
  note(Math.abs(vhTotal - 12.8) < 0.25, 'page is 12.8 viewports tall', vhTotal.toFixed(2))

  const rows = []
  let last = null
  let maxStep = 0
  for (let i = 0; i <= 40; i++) {
    const frac = i / 40
    await scrollTo(page, frac)
    const hud = await page.locator('[data-debug-hud]').innerText().catch(() => '')
    const cam = await page.evaluate(() => window.__cameraProbe ?? null)
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    const station = /station\s+(\w+)/.exec(hud)?.[1] ?? '?'
    const calls = /draw calls\s+(\d+)\s*\/\s*(\d+)/.exec(hud)
    const tris = /triangles\s+([\d.k]+)\s*\/\s*([\d.k]+)/.exec(hud)
    const over = /OVER BUDGET/.test(hud)
    if (cam && last) maxStep = Math.max(maxStep, Math.hypot(...cam.map((v, k) => v - last[k])))
    if (cam) last = cam
    rows.push({ frac, station, theme, calls, tris, over })
    if (SHOTS && i % 5 === 0) {
      await page.screenshot({ path: `${SHOTS}/p${String(i).padStart(2, '0')}.png` })
    }
  }

  const seen = [...new Set(rows.map((r) => r.station))]
  note(seen.length === 8, 'camera visits all eight stations', seen.join(' → '))
  note(maxStep < 40, 'no camera discontinuity', `largest step ${maxStep.toFixed(1)}u`)

  const overRows = rows.filter((r) => r.over)
  note(overRows.length === 0, 'every station within budget', overRows.length ? `${overRows.length} samples over` : '')

  console.log('\n  frac  station      theme  draw      tris')
  for (const r of rows.filter((_, i) => i % 4 === 0)) {
    console.log(
      `  ${r.frac.toFixed(2)}  ${r.station.padEnd(11)} ${String(r.theme).padEnd(6)} ${(r.calls ? `${r.calls[1]}/${r.calls[2]}` : '?').padEnd(9)} ${r.tris ? `${r.tris[1]}/${r.tris[2]}` : '?'}`,
    )
  }

  note(errors.length === 0, 'no console errors', errors.slice(0, 3).join(' | '))
  note(bad.length === 0, 'no failed requests', bad.slice(0, 3).join(' | '))
  await ctx.close()

  // ======================================================= 2. nav
  console.log('\n=== nav ===')
  const n = await newPage()
  await n.page.goto(`${BASE}/?debug=1`, { waitUntil: 'networkidle', timeout: 60000 })
  await n.page.waitForTimeout(3000)
  const links = await n.page.locator('header nav ul li button').allInnerTexts()
  note(links.length === 5, 'five nav links', links.join(','))

  const actives = []
  for (const f of [0, 0.15, 0.3, 0.5, 0.72, 0.85, 0.97]) {
    await scrollTo(n.page, f)
    actives.push(
      await n.page
        .locator('header nav ul li button[aria-current="true"]')
        .innerText()
        .catch(() => '-'),
    )
  }
  note(
    actives[0] === 'Home' && actives.at(-1) === 'Contact' && new Set(actives).size >= 4,
    'nav active state follows the camera',
    actives.join(' → '),
  )

  await scrollTo(n.page, 0)
  await n.page.locator('header nav ul li button', { hasText: 'Projects' }).click()
  await n.page.waitForTimeout(2200)
  const landed = await n.page.evaluate(
    () => window.scrollY / (document.body.scrollHeight - window.innerHeight),
  )
  note(landed > 0.22 && landed < 0.3, 'clicking a nav link travels there', landed.toFixed(3))
  note(n.errors.length === 0, 'nav: no console errors', n.errors.slice(0, 2).join(' | '))
  await n.ctx.close()

  // ======================================================= 3. tiers
  console.log('\n=== quality tiers ===')
  const programs = {}
  for (const q of ['low', 'medium', 'high']) {
    const t = await newPage({ viewport: { width: 1280, height: 720 } })
    await t.page.goto(`${BASE}/?debug=1&q=${q}`, { waitUntil: 'networkidle', timeout: 60000 })
    await t.page.waitForTimeout(3000)
    await scrollTo(t.page, 0.3)
    const hud = await t.page.locator('[data-debug-hud]').innerText().catch(() => '')
    programs[q] = Number(/programs\s+(\d+)/.exec(hud)?.[1] ?? 0)
    note(
      new RegExp(`tier\\s+${q}`).test(hud) && t.errors.length === 0,
      `?q=${q} applies and is clean`,
      `programs=${programs[q]}`,
    )
    await t.ctx.close()
  }
  note(
    programs.low < programs.medium && programs.medium < programs.high,
    'post FX scales with tier',
    `${programs.low} < ${programs.medium} < ${programs.high}`,
  )

  // ======================================================= 4. reduced motion
  console.log('\n=== reduced motion ===')
  const rm = await newPage({ reducedMotion: 'reduce' })
  await rm.page.goto(`${BASE}/?debug=1`, { waitUntil: 'networkidle', timeout: 60000 })
  await rm.page.waitForTimeout(3000)
  const rmHud = await rm.page.locator('[data-debug-hud]').innerText().catch(() => '')
  note(/reduced motion\s+yes/.test(rmHud), 'reduced motion detected')
  await scrollTo(rm.page, 0.35)
  note(rm.errors.length === 0, 'reduced motion: no console errors', rm.errors.slice(0, 2).join(' | '))
  await rm.ctx.close()

  // ======================================================= 5. no WebGL
  console.log('\n=== no WebGL ===')
  const nw = await newPage()
  await nw.ctx.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = function () {
      return null
    }
  })
  const p2 = await nw.ctx.newPage()
  await p2.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 })
  await p2.waitForTimeout(2500)
  note((await p2.locator('canvas').count()) === 0, 'no canvas mounts without WebGL')
  note((await p2.locator('[data-station]').count()) === 8, 'all eight sections still render')
  await nw.ctx.close()

  // ======================================================= 6. viewports
  console.log('\n=== viewports ===')
  const v = await newPage()
  await v.page.goto(`${BASE}/?debug=1`, { waitUntil: 'networkidle', timeout: 60000 })
  await v.page.waitForTimeout(3000)
  for (const [w, h] of [
    [390, 844],
    [768, 1024],
    [1280, 720],
    [1920, 1080],
    [2560, 1440],
  ]) {
    await v.page.setViewportSize({ width: w, height: h })
    await v.page.waitForTimeout(600)
    const r = await v.page.evaluate(() => ({
      ratio: document.body.scrollHeight / window.innerHeight,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    }))
    note(
      !r.overflow && Math.abs(r.ratio - 12.8) < 0.3,
      `${w}×${h}: no h-overflow, height holds`,
      `${r.ratio.toFixed(1)}vh`,
    )
  }
  note(v.errors.length === 0, 'viewports: no console errors', v.errors.slice(0, 2).join(' | '))
  await v.ctx.close()
} finally {
  await browser.close()
  stop()
}

console.log(`\n${fail.length === 0 ? 'ALL CHECKS PASSED' : `${fail.length} FAILED:`}`)
fail.forEach((f) => console.log('  -', f))
process.exit(fail.length ? 1 : 0)
