import { defineConfig, devices } from '@playwright/test'

/**
 * The suite drives a **production build**, not `next dev`.
 *
 * Two reasons, both learned the hard way during the build: the dev server goes
 * stale after a long editing session on Windows and starts 404-ing its own chunks
 * (which reads as a component bug and is not one), and `next dev` and `next build`
 * sharing `.next` corrupts the manifest outright.
 *
 * Locally we drive the installed Chrome — Playwright's own Chromium download fails
 * on the dev machine. On CI the channel does not exist, so the bundled browser is
 * used instead.
 */

const PORT = Number(process.env.PW_PORT ?? 3111)
const isCI = !!process.env.CI

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 90_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
    /**
     * Headless Chrome here rasterises in software (SwiftShader). That is fine for
     * structure, semantics and resource counts — it is useless for frame rate, and
     * nothing in this suite asserts one.
     */
    launchOptions: {
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--no-sandbox',
      ],
    },
  },

  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        ...(isCI ? {} : { channel: 'chrome' }),
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        ...(isCI ? {} : { channel: 'chrome' }),
        isMobile: false, // Lenis needs a real wheel; emulate size, not touch.
      },
      testMatch: /smoke\.spec\.ts/,
    },
  ],

  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
