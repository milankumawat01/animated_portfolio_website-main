/**
 * The standing performance gate. This is what keeps the site fast after tonight.
 *
 *   node scripts/check-budgets.mjs                  build, serve on 3102, check, tear down
 *   node scripts/check-budgets.mjs --no-build       reuse the existing build
 *   node scripts/check-budgets.mjs --url http://…   check a server you already have
 *   node scripts/check-budgets.mjs --tiers high     only one tier
 *   node scripts/check-budgets.mjs --cycles 3       scroll cycles for the leak check
 *   node scripts/check-budgets.mjs --ci             use Playwright's bundled Chromium
 *
 * ## What it asserts
 *
 * 1. **Draw calls and triangles** at 24 scroll samples per tier, at all three tiers,
 *    against the manifest budgets.
 * 2. **No geometry or texture leak** across N full scroll cycles.
 * 3. **Initial JS payload**, read out of the build output on disk — the one budget
 *    that does not need a browser, and the one most likely to regress by accident.
 *
 * ## Why the budget denominator comes from the HUD and not from a table here
 *
 * `mountPadding` deliberately keeps a neighbour station alive across every scroll
 * boundary, so the renderer's totals are almost never one station's cost alone.
 * `DebugHUD` already sums the budgets of exactly the stations `SceneDirector` has
 * mounted this frame, and exports that sum in its readout. Re-deriving it here from
 * a copy of the ranges would drift from the manifests the first time anyone tunes a
 * `mountPadding` — and would report failures that are not real, which is how a
 * budget gate gets switched off. So the measured numbers come from the live
 * `window.__frameStats`, and the denominator comes from the HUD that owns the rule.
 *
 * ## What it deliberately does NOT assert
 *
 * **Frame rate.** Headless Chrome here runs on SwiftShader, a software rasteriser.
 * It reports 0–5fps at every tier no matter what is on screen. Any fps threshold in
 * this file would either be vacuous or permanently red, and either one teaches the
 * next person to ignore the gate. Frame rate needs real hardware and a real phone.
 */
import { chromium } from '@playwright/test'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import net from 'node:net'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback
}
const NO_BUILD = argv.includes('--no-build')
const USE_BUNDLED = argv.includes('--ci') || process.env.CI === 'true'
const EXTERNAL_URL = flag('url', null)
const PORT = Number(flag('port', '3102'))
const SAMPLES = Number(flag('samples', '24'))
const CYCLES = Number(flag('cycles', '3'))
const TIERS = flag('tiers', 'low,medium,high').split(',')
const DIST = process.env.NEXT_DIST_DIR || '.next'

/**
 * Initial JS budget, gzipped, for `/`. The phase target is "under 400KB excluding
 * the Three core chunk", so the three chunk is measured and subtracted rather than
 * hidden — regressing it still shows up in the printout.
 */
const JS_BUDGET_GZ = 400 * 1024

const fail = []
const note = (ok, label, detail = '') => {
  if (!ok) fail.push(label)
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${detail ? '  ' + detail : ''}`)
}

const run = (cmd, args, opts = {}) =>
  new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, cwd: ROOT, ...opts })
    p.on('exit', (c) => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))))
  })

/* ============================================================ 1. bundle bytes

   No browser needed, and it is the check most likely to catch a careless import.
   Reads the route's chunk list straight out of app-build-manifest.json.          */

const checkBundle = () => {
  console.log('\n=== initial JS payload ===')
  const manifestPath = join(ROOT, DIST, 'app-build-manifest.json')
  if (!existsSync(manifestPath)) {
    note(false, 'build output present', `${DIST}/app-build-manifest.json not found — build first`)
    return
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const files = manifest.pages?.['/page'] ?? []
  if (!files.length) {
    note(false, 'route "/" has chunks in the manifest')
    return
  }

  let total = 0
  let three = 0
  const rows = []
  for (const rel of files) {
    if (!rel.endsWith('.js')) continue
    const abs = join(ROOT, DIST, rel)
    if (!existsSync(abs)) continue
    const raw = readFileSync(abs)
    const gz = gzipSync(raw, { level: 9 }).length
    total += gz
    /**
     * three lands in its own hashed vendor chunks — two of them, because
     * `transpilePackages: ['three']` feeds webpack the package's own ES modules
     * and it groups the renderer separately from the scene graph. Identify them by
     * content, not by filename: the hashes change on every release, and a check
     * that keys on a filename silently stops finding anything.
     */
    const text = raw.toString('latin1')
    const isThree =
      (text.match(/THREE\.[A-Z]/g) ?? []).length >= 20 ||
      text.includes('THREE.WebGLRenderer') ||
      text.includes('WebGLRenderer: ')
    if (isThree) three += gz
    rows.push([rel.replace(/^static\/chunks\//, ''), gz, isThree])
  }

  rows.sort((a, b) => b[1] - a[1])
  for (const [name, gz, isThree] of rows) {
    console.log(
      `        ${String(Math.round(gz / 1024)).padStart(5)} kB gz  ${name}${isThree ? '   <- three core' : ''}`,
    )
  }

  const excludingThree = total - three
  console.log(
    `        ${'-'.repeat(48)}\n        ${String(Math.round(total / 1024)).padStart(5)} kB gz  total   (${Math.round(three / 1024)} kB of it three)`,
  )

  note(three > 0, 'three is in its own separately cacheable chunk', `${Math.round(three / 1024)} kB gz`)
  note(
    excludingThree <= JS_BUDGET_GZ,
    'initial JS under 400 kB gzipped, excluding three',
    `${Math.round(excludingThree / 1024)} kB gz`,
  )

  // Lazy stations: the async chunks must exist, and must not be in the route list.
  const routeSet = new Set(files)
  const chunkDir = join(ROOT, DIST, 'static', 'chunks')
  const asyncChunks = existsSync(chunkDir)
    ? readdirSync(chunkDir)
        .filter((f) => f.endsWith('.js'))
        .map((f) => `static/chunks/${f}`)
        .filter((f) => !routeSet.has(f))
    : []
  const asyncBytes = asyncChunks.reduce(
    (a, f) => a + statSync(join(ROOT, DIST, f)).size,
    0,
  )
  note(
    asyncChunks.length >= 7,
    'the later stations are in async chunks, off the initial payload',
    `${asyncChunks.length} async chunks, ${Math.round(asyncBytes / 1024)} kB raw`,
  )
}

/* ================================================================ 2. the browser */

const waitForPort = (port) =>
  new Promise((resolve) => {
    const probe = net.createConnection({ port, host: '127.0.0.1' })
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

let server = null
/**
 * `pnpm exec next start` under a shell spawns a process tree, and on Windows
 * `process.kill(-pid)` does not reach it — the server survives, keeps the port, and
 * the next run refuses to start. Same approach as scripts/qa.mjs.
 */
const stopServer = () => {
  if (!server) return
  if (process.platform === 'win32') {
    try {
      // spawnSync, not spawn: the last thing this script does is process.exit, and
      // an async taskkill never gets to run. The port then stays held and the next
      // run refuses to start against a server it did not create.
      spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], {
        stdio: 'ignore',
        shell: true,
      })
      server = null
      return
    } catch {
      /* fall through */
    }
  }
  try {
    process.kill(-server.pid)
  } catch {
    server.kill('SIGKILL')
  }
}

/**
 * Scroll, then wait for the renderer to have actually drawn a frame at the new
 * position.
 *
 * A fixed timeout does not work here. Under SwiftShader at the `high` tier a single
 * frame can take well over a second, so a 250ms settle reads `drawCalls: 0` — which
 * looks exactly like "this station is free" and would make the whole gate pass
 * vacuously. Instead, wait until two consecutive polls agree on a non-zero draw
 * count, or give up after `TIMEOUT` and let the sample be recorded as a miss.
 */
/**
 * Block until the engine's warm-up pass has finished.
 *
 * `SceneDirector` prefetches every station's chunk, mounts it hidden and links its
 * shaders during idle time after the first frame, and only then is the scene in its
 * steady state. Sampling before that point measures the warm-up: the first lap of
 * the leak check used to come back with a dozen fewer geometries than every lap
 * after it, purely because half the stations had not been built yet.
 *
 * `window.__warmup` only exists with `?debug=1` and WebGL, so this degrades to the
 * old fixed dwell rather than hanging when the probe is absent.
 */
const WARMUP_TIMEOUT = 90000

const waitForWarm = async (page) => {
  try {
    await page.waitForFunction(() => window.__warmup?.done === true, null, {
      timeout: WARMUP_TIMEOUT,
    })
  } catch {
    // No probe (no WebGL, or the low tier, which does not warm). The fixed dwell
    // at the call site is the fallback, exactly as before.
  }
}

const SETTLE_TIMEOUT = 8000

const scrollTo = async (page, frac, settle = true) => {
  await page.evaluate((f) => {
    const l = window.__lenis
    const top = (document.body.scrollHeight - window.innerHeight) * f
    if (l) l.scrollTo(top, { immediate: true, force: true })
    else window.scrollTo({ top, behavior: 'instant' })
  }, frac)

  if (!settle) {
    // Traversal for its own sake — the leak check only samples at the end of a lap.
    await page.waitForTimeout(220)
    return
  }

  const deadline = Date.now() + SETTLE_TIMEOUT
  let previous = -1
  while (Date.now() < deadline) {
    await page.waitForTimeout(220)
    const calls = await page.evaluate(() => window.__frameStats?.drawCalls ?? 0)
    if (calls > 0 && calls === previous) return
    previous = calls
  }
}

/** Live numbers from `__frameStats`, budget denominator from the HUD that owns the rule. */
const sample = async (page) => {
  const live = await page.evaluate(() => ({
    station: window.__scrollState?.activeStation ?? null,
    progress: window.__scrollState?.progress ?? -1,
    drawCalls: window.__frameStats?.drawCalls ?? -1,
    triangles: window.__frameStats?.triangles ?? -1,
    textures: window.__frameStats?.textures ?? -1,
    geometries: window.__frameStats?.geometries ?? -1,
    programs: window.__frameStats?.programs ?? -1,
  }))
  const hud = await page
    .locator('[data-debug-hud]')
    .innerText()
    .catch(() => '')
  const callBudget = Number(/draw calls\s+\d+\s*\/\s*(\d+)/.exec(hud)?.[1] ?? 0)
  const trisBudget = /triangles\s+[\d.k]+\s*\/\s*([\d.k]+)/.exec(hud)?.[1] ?? '0'
  const mounted = /mounted\s+(\S+)/.exec(hud)?.[1] ?? '?'
  const toNum = (s) => (s.endsWith('k') ? Math.round(parseFloat(s) * 1000) : Number(s))
  return { ...live, callBudget, trisBudget: toNum(trisBudget), mounted, over: /OVER BUDGET/.test(hud) }
}

async function main() {
  if (!EXTERNAL_URL && !NO_BUILD) {
    console.log('--- building ---')
    await run('pnpm', ['build'])
  }

  checkBundle()

  let base = EXTERNAL_URL
  if (!base) {
    if (await waitForPort(PORT)) {
      console.error(
        `\nport ${PORT} is already serving something. Free it, or pass --url / --port.`,
      )
      process.exit(2)
    }
    console.log(`\n--- serving on ${PORT} ---`)
    server = spawn('pnpm', ['exec', 'next', 'start', '-p', String(PORT)], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      cwd: ROOT,
    })
    await new Promise((res, rej) => {
      const timer = setTimeout(() => rej(new Error('server did not start in 60s')), 60000)
      const onData = (b) => {
        const t = String(b)
        if (/EADDRINUSE|address already in use/i.test(t)) {
          clearTimeout(timer)
          rej(new Error(`port ${PORT} is occupied — refusing to test a foreign server`))
          return
        }
        if (/Ready in|started server|Local:/i.test(t)) {
          clearTimeout(timer)
          res()
        }
      }
      server.stdout.on('data', onData)
      server.stderr.on('data', onData)
    })
    await new Promise((r) => setTimeout(r, 1200))
    base = `http://localhost:${PORT}`
  }

  /**
   * Locally we drive the installed Chrome: Playwright's own Chromium download fails
   * on the dev machine. On CI that channel does not exist, so use the bundled one.
   * Same pattern as scripts/qa.mjs and scripts/station-probe.mjs.
   */
  const browser = await chromium.launch({
    ...(USE_BUNDLED ? null : { channel: 'chrome' }),
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
  })

  const measuredAnywhere = new Set()

  try {
    /* ---------------------------------------------- draw calls and triangles */
    for (const tier of TIERS) {
      console.log(`\n=== budgets at q=${tier} ===`)
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

      await page.goto(`${base}/?debug=1&q=${tier}`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3500)
      await waitForWarm(page)

      /** Worst sample per station, so the printout names the offender. */
      const worst = new Map()
      const breaches = []

      for (let i = 0; i <= SAMPLES; i++) {
        const frac = i / SAMPLES
        await scrollTo(page, frac)
        const s = await sample(page)
        if (!s.station) {
          breaches.push(`${frac.toFixed(2)}: window.__scrollState missing — stale build?`)
          break
        }
        // A lazy station's chunk may still be in flight on the very first frames
        // after it mounts; a zero reading is "nothing drawn yet", not "under budget".
        if (s.drawCalls <= 0) continue

        const prev = worst.get(s.station)
        if (!prev || s.drawCalls > prev.drawCalls) worst.set(s.station, { ...s, frac })

        if (s.callBudget > 0 && s.drawCalls > s.callBudget) {
          breaches.push(
            `${frac.toFixed(2)} ${s.mounted}: ${s.drawCalls} draw calls > ${s.callBudget}`,
          )
        }
        if (s.trisBudget > 0 && s.triangles > s.trisBudget) {
          breaches.push(
            `${frac.toFixed(2)} ${s.mounted}: ${s.triangles} triangles > ${s.trisBudget}`,
          )
        }
      }

      console.log('        station      worst draw   triangles     mounted')
      for (const [station, s] of worst) {
        console.log(
          `        ${station.padEnd(12)} ${`${s.drawCalls}/${s.callBudget}`.padEnd(12)} ${`${s.triangles}/${s.trisBudget}`.padEnd(13)} ${s.mounted}`,
        )
      }

      for (const id of worst.keys()) measuredAnywhere.add(id)
      const unmeasured = 8 - worst.size
      if (unmeasured > 0) {
        console.log(
          `        ${unmeasured} station(s) never settled at this tier — software rasteriser, not a budget failure`,
        )
      }

      note(breaches.length === 0, `q=${tier}: every sample within the mounted budget`, breaches.slice(0, 4).join(' | '))
      note(errors.length === 0, `q=${tier}: no console errors`, errors.slice(0, 2).join(' | '))
      await ctx.close()
    }

    /**
     * Coverage is asserted across the whole run, not per tier. A station that never
     * produced a settled frame at `high` under SwiftShader is a limitation of the
     * rasteriser, not a budget failure — but a station that was never measured at
     * ANY tier means the sweep silently skipped it, and then a green result means
     * nothing.
     */
    note(
      measuredAnywhere.size === 8,
      'every station was measured at at least one tier',
      `${measuredAnywhere.size}/8`,
    )

    /* -------------------------------------------------------- the leak check */
    console.log(`\n=== GPU resource leak, ${CYCLES} full scroll cycles ===`)
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(`${base}/?debug=1&q=high`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(3500)
    await waitForWarm(page)

    /**
     * One full lap, then settle at the top where only hero is mounted — the only
     * point in the page where the counts are comparable between laps.
     *
     * The first lap is a warm-up and is NOT counted. Several stations build a
     * canvas texture the first time they mount and then cache it forever: About's
     * procedural portrait and Skills' icon atlas each add exactly one texture on
     * first visit and none after. That is a cache, not a leak, and counting the
     * first lap turns it into a permanent false failure — which is how a leak
     * detector gets deleted. What a leak actually looks like is growth that keeps
     * happening on lap three and lap four.
     */
    /**
     * Back at the top, poll until the counters stop moving.
     *
     * A fixed dwell is not enough: unmounting a station disposes its geometries
     * over the following frames, and under SwiftShader a frame can be a full
     * second, so a 2.5s wait catches a different point in the teardown every lap.
     * That produced readings that swung 4 → 12 → 2 and looked like a leak one run
     * and a fix the next. Wait for two consecutive identical readings instead.
     */
    /**
     * The resting count at the top of the page, where hero is the only station
     * mounted — the only point where two laps are comparable.
     *
     * Take the MINIMUM over a polling window rather than "the first two readings
     * that agree". Teardown is not instantaneous: the stations behind you dispose
     * over the following frames, and under SwiftShader a frame can be a second, so
     * a pair of equal readings taken 800ms apart can both land mid-teardown and
     * report 12 geometries where the resting value is 4. What "no leak" actually
     * means is that the counters come back *down* to where they started, so the
     * floor over a window is the number to compare, not a snapshot.
     */
    const RESTING_WINDOW_MS = 14000

    const restingCounters = async () => {
      const deadline = Date.now() + RESTING_WINDOW_MS
      let best = null
      while (Date.now() < deadline) {
        await page.waitForTimeout(700)
        const s = await sample(page)
        if (s.mounted !== 'hero' || s.geometries < 0) continue
        if (!best || s.geometries + s.textures < best.geometries + best.textures) best = s
      }
      return best ?? sample(page)
    }

    const lap = async () => {
      for (let i = 0; i <= 12; i++) await scrollTo(page, i / 12, false)
      for (let i = 12; i >= 0; i--) await scrollTo(page, i / 12, false)
      await scrollTo(page, 0)
      return restingCounters()
    }

    /**
     * Lap until the counters stop moving, THEN start counting.
     *
     * One warm-up lap was enough when a station was torn down the moment it left
     * the window: everything it owned was disposed, so the resting count was the
     * same on lap one as on lap ten. Stations are now retained and toggled with
     * `visible`, which means the resting count CLIMBS to a ceiling as each station
     * builds its canvas textures and buffers for the first time, and then stops.
     * Under a software rasteriser a single lap is nowhere near enough to reach
     * that ceiling, so the counted laps were measuring the climb.
     *
     * The leak assertion below is unchanged. This only makes sure it is comparing
     * two readings taken at the steady state, which is what it always meant to do.
     */
    const MAX_WARM_LAPS = 5
    let warm = await lap()
    for (let i = 1; i < MAX_WARM_LAPS; i++) {
      const next = await lap()
      const settled =
        next.geometries === warm.geometries && next.textures === warm.textures
      warm = next
      if (settled) break
    }
    console.log(
      `        warm-up: geometries ${warm.geometries}  textures ${warm.textures}  programs ${warm.programs}   ${'(not counted)'}`,
    )

    const marks = []
    for (let c = 0; c < CYCLES; c++) {
      const s = await lap()
      marks.push({ cycle: c + 1, geometries: s.geometries, textures: s.textures, programs: s.programs })
      console.log(
        `        cycle ${c + 1}: geometries ${s.geometries}  textures ${s.textures}  programs ${s.programs}`,
      )
    }

    const first = marks[0]
    const last = marks.at(-1)

    /**
     * Hero's own resting count is not a single number: between one and four of its
     * objects have their buffers uploaded depending on where the dissolve is when
     * the window closes, so lap-to-lap wobble of a few is normal. A leak is not
     * wobble — it is the same climb every lap. Assert both: the end is not
     * meaningfully above the start, and the sequence never climbs monotonically.
     */
    const SLACK = 4
    const climbing = (key) => marks.every((m, i) => i === 0 || m[key] > marks[i - 1][key])

    for (const key of ['geometries', 'textures']) {
      note(
        last[key] - first[key] <= SLACK && !climbing(key),
        `${key} do not grow across ${CYCLES} scroll cycles`,
        `${marks.map((m) => m[key]).join(' → ')}`,
      )
    }
    await ctx.close()
  } finally {
    await browser.close()
    stopServer()
  }
}

try {
  await main()
} catch (e) {
  stopServer()
  console.error(`\nchecker crashed: ${e.message}`)
  process.exit(3)
}

console.log(`\n${fail.length === 0 ? 'ALL BUDGETS PASSED' : `${fail.length} FAILED:`}`)
fail.forEach((f) => console.log('  -', f))
console.log(
  '\nnote: frame rate is deliberately not asserted here — headless Chrome rasterises\n' +
    '      in software and reports 0-5fps at every tier. 60fps desktop / 30fps mid-tier\n' +
    '      Android has to be measured on real hardware.',
)
process.exit(fail.length ? 1 : 0)
