# P7 — QA, Cross-browser & Deploy

**Mode:** solo · **Depends on:** P5, P6 · **Est:** 4h

Ship it.

---

## Files you own

```
.github/workflows/ci.yml
vercel.json
playwright.config.ts
tests/**
README.md                 (final version)
```

---

## 1. Test matrix

Every cell gets a full scroll through all eight stations, checking for visual breakage,
frame drops, and console errors.

| | Chrome | Safari | Firefox | Edge |
|---|---|---|---|---|
| macOS | ✅ | ✅ | ✅ | — |
| Windows | ✅ | — | ✅ | ✅ |
| iOS 17+ | ✅ | ✅ | — | — |
| Android (mid-tier) | ✅ | — | ✅ | — |

**Known risk areas, check these specifically:**
- **Safari** — `MeshTransmissionMaterial` and `backdrop-filter` together are a common
  perf cliff. Projects station is where it will show.
- **iOS** — memory pressure kills WebGL contexts silently. Test a long session, and
  handle `webglcontextlost` by reloading gracefully rather than showing a dead canvas.
- **Firefox** — `dpr` handling and `EffectComposer` differ subtly; check bloom intensity.
- **Android mid-tier** — this is what the `low` tier exists for. Confirm it auto-demotes.

## 2. Viewport matrix

`390×844` · `768×1024` · `1280×720` · `1440×900` · `1920×1080` · `2560×1440`

At every one: no horizontal scroll, no DOM element overlapping the 3D illegibly, the
nav and footer intact, and all text readable.

## 3. Automated tests (`tests/`)

Keep it small and high-value. Playwright:
- **Smoke:** page loads, preloader dismisses, all eight `data-station` sections exist.
- **Scroll:** programmatically scroll to each station, assert `activeStation` updates
  and the theme attribute flips correctly.
- **Links:** every external link resolves (200), the resume downloads, `mailto:` is
  well-formed.
- **A11y:** `@axe-core/playwright` on the main page and the fallback page, zero
  violations at the serious and critical levels.
- **Budgets:** invoke `scripts/check-budgets.mjs` from P5.

## 4. CI (`.github/workflows/ci.yml`)
On push and PR: install, `typecheck`, `lint`, `build`, `playwright test`. Fail the
build on any budget violation or axe violation.

## 5. Deploy
- Vercel project, connected to `main`, preview deploys on PRs.
- `vercel.json`: long-lived immutable cache headers for `/textures`, `/fonts`,
  `/images`; standard headers otherwise.
- Custom domain + SSL. Confirm `hey@milankumawat.in` resolves if the domain is new.
- Vercel Analytics + Speed Insights.
- Verify the OG card in the LinkedIn, X, and WhatsApp preview debuggers — these three
  render it differently and all three matter for a portfolio.

## 6. Final content pass
- Every string against `docs/06-CONTENT.md`.
- **Resolve the A9 open questions** — the eAdmin date overlap especially. Do not ship
  overlapping employment dates on a portfolio a recruiter will read.
- Every project and article link points somewhere real, or is honestly marked as
  coming soon.
- Resume PDF is the current version.

## 7. Handover
Rewrite `README.md`: what this is, how to run it, the architecture in a paragraph, how
to add a ninth station, how to swap an asset, and where the docs live. Assume the
reader is Milan in eight months having forgotten everything.

---

## Acceptance criteria

- [ ] Full matrix passed, with any deviations recorded in `STATUS.md`
- [ ] No console errors or warnings on any browser
- [ ] CI green
- [ ] Lighthouse on production: Performance ≥ 85 mobile / ≥ 95 desktop, A11y ≥ 95, SEO 100
- [ ] Deployed to the custom domain with SSL
- [ ] OG card correct on LinkedIn, X, and WhatsApp
- [ ] All A9 questions resolved, no placeholder content anywhere
- [ ] README rewritten
- [ ] `STATUS.md` — every phase ✅
