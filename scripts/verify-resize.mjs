import { chromium } from '@playwright/test'

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto('http://localhost:3000/?debug=1', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(3000)

const probe = async (label) => {
  const r = await page.evaluate(() => ({
    h: document.body.scrollHeight,
    vw: window.innerWidth,
    vh: window.innerHeight,
    scroll: window.scrollY,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
  }))
  const hud = await page.locator('[data-debug-hud]').innerText().catch(() => '')
  const p = /page p\s+([\d.]+)/.exec(hud)?.[1]
  const st = /station\s+(\w+)/.exec(hud)?.[1]
  console.log(
    `${label.padEnd(12)} ${r.vw}x${r.vh}  height=${r.h}  (${(r.h / r.vh).toFixed(1)}vh)  scroll=${r.scroll}  page p=${p}  station=${st}  h-overflow=${r.overflowX}`,
  )
}

// Park the camera mid-page, then resize and confirm the mapping survives.
await page.evaluate(() => window.__lenis?.scrollTo(document.body.scrollHeight * 0.5, { immediate: true, force: true }))
await page.waitForTimeout(500)
await probe('1440x900')

for (const [w, h] of [[390, 844], [768, 1024], [1920, 1080], [2560, 1440], [1280, 720]]) {
  await page.setViewportSize({ width: w, height: h })
  await page.waitForTimeout(700)
  await probe(`${w}x${h}`)
}

console.log('\nerrors:', errors.length)
errors.slice(0, 5).forEach((e) => console.log('  ', e.slice(0, 180)))
await browser.close()
