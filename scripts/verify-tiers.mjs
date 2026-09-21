import { chromium } from '@playwright/test'

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
})

const read = async (url, opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(3000)
  await page.evaluate(() => window.__lenis?.scrollTo(3000, { immediate: true, force: true }))
  await page.waitForTimeout(600)
  const hud = await page.locator('[data-debug-hud]').innerText().catch(() => '(no hud)')
  const canvasCount = await page.locator('canvas').count()
  await ctx.close()
  return { hud, errors, canvasCount }
}

for (const q of ['low', 'medium', 'high']) {
  const r = await read(`http://localhost:3000/?debug=1&q=${q}`)
  const tier = /tier\s+(\w+)/.exec(r.hud)?.[1]
  const dpr = /dpr\s+([\d.]+)/.exec(r.hud)?.[1]
  const programs = /programs\s+(\d+)/.exec(r.hud)?.[1]
  console.log(`?q=${q.padEnd(7)} -> tier=${tier} dpr=${dpr} programs=${programs} canvas=${r.canvasCount} errors=${r.errors.length}`)
  r.errors.slice(0, 3).forEach((e) => console.log('    ', e.slice(0, 160)))
}

const rm = await read('http://localhost:3000/?debug=1', { reducedMotion: 'reduce' })
console.log('reduced-motion ->', /reduced motion\s+(\w+)/.exec(rm.hud)?.[1], 'errors=' + rm.errors.length)

// No-WebGL path: the canvas must not mount and the DOM must still be complete.
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } })
await ctx.addInitScript(() => {
  HTMLCanvasElement.prototype.getContext = function () {
    return null
  }
})
const p = await ctx.newPage()
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 60000 })
await p.waitForTimeout(2500)
console.log(
  'no-webgl     -> canvases=' + (await p.locator('canvas').count()),
  'sections=' + (await p.locator('[data-station]').count()),
  'webgl-attr=' + (await p.evaluate(() => document.documentElement.dataset.webgl)),
)
await ctx.close()
await browser.close()
