import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import net from 'node:net'

const PORT = 3101
const busy = await new Promise((r) => {
  const s = net.createConnection({ port: PORT, host: '127.0.0.1' })
  s.on('connect', () => { s.destroy(); r(true) })
  s.on('error', () => r(false))
  setTimeout(() => { s.destroy(); r(false) }, 1500)
})
if (busy) { console.error(`port ${PORT} busy`); process.exit(2) }

const server = spawn('pnpm', ['exec', 'next', 'start', '-p', String(PORT)], { stdio: ['ignore','pipe','pipe'], shell: true })
await new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error('no start')), 60000)
  const on = (b) => { if (/Ready in|Local:/i.test(String(b))) { clearTimeout(t); res() } }
  server.stdout.on('data', on); server.stderr.on('data', on)
})
await new Promise((r) => setTimeout(r, 1200))

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] })

for (const [w, h] of [[390, 844], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2500)
  const rows = await page.evaluate((vh) => {
    const out = []
    for (const el of document.querySelectorAll('[data-station]')) {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      const child = el.firstElementChild
      out.push({
        id: el.getAttribute('data-station'),
        actual: Math.round(r.height),
        minH: cs.minHeight,
        actualVh: +(r.height / vh).toFixed(2),
        childH: child ? Math.round(child.getBoundingClientRect().height) : 0,
        scrollW: el.scrollWidth,
      })
    }
    return out
  }, h)
  const total = await page.evaluate(() => document.body.scrollHeight)
  console.log(`\n=== ${w}x${h} — total ${total}px = ${(total/h).toFixed(2)} viewports ===`)
  console.log('station      actual  minHeight        vh     sticky-child  scrollW')
  for (const r of rows) {
    const over = r.actual > parseFloat(r.minH) * (h/100) + 2
    console.log(`${r.id.padEnd(12)} ${String(r.actual).padEnd(7)} ${r.minH.padEnd(16)} ${String(r.actualVh).padEnd(6)} ${String(r.childH).padEnd(13)} ${r.scrollW}${over ? '   <-- OVERFLOWS' : ''}`)
  }
  await page.close()
}
await browser.close()
try { process.kill(-server.pid) } catch { server.kill('SIGKILL') }
