# Build Status

> Live tracker. Agents update **only their own row**, and **append** to the log.
> Never rewrite another agent's line. See `docs/05-PARALLEL-PLAYBOOK.md` §5.

**Last updated:** 2026-09-21 — P0 done, P1 in progress.

---

## Phase board

| Phase | Name | Status | Owner | Notes |
|---|---|---|---|---|
| P0 | Foundation & Scaffold | ✅ Done | main | Next 15.5.25 · R3F 9.7 · three 0.186 |
| P1 | Core 3D Engine & Contracts | 🟦 In progress | main | — |
| P2 | Design System & DOM Kit | ⬜ Not started | — | Blocked by P1 |
| P3A | Hero station | ⬜ Not started | — | Blocked by P2 · batch 1 |
| P3B | About station | ⬜ Not started | — | Blocked by P2 · batch 2 |
| P3C | Projects station | ⬜ Not started | — | Blocked by P2 · batch 1 |
| P3D | Experience station | ⬜ Not started | — | Blocked by P2 · batch 2 |
| P3E | Skills station | ⬜ Not started | — | Blocked by P2 · batch 1 |
| P3F | How I Build station | ⬜ Not started | — | Blocked by P2 · batch 2 |
| P3G | Writing station | ⬜ Not started | — | Blocked by P2 · batch 3 |
| P3H | Contact station | ⬜ Not started | — | Blocked by P3A + P3B · batch 3 |
| P4 | Interaction & Polish | ⬜ Not started | — | Blocked by all P3 |
| P5 | Performance & Assets | ⬜ Not started | — | Blocked by P4 |
| P6 | A11y, SEO, Fallback | ⬜ Not started | — | Blocked by P4 |
| P7 | QA & Deploy | ⬜ Not started | — | Blocked by P5 + P6 |

Status values: `⬜ Not started` · `🟦 In progress` · `✅ Done` · `⚠️ Blocked` · `🔁 Needs rework`

---

## Asset checklist

See `docs/04-ASSET-MANIFEST.md` for specs. Tick when the file lands in `assets/incoming/`.

- [ ] A1 `monogram.svg` 🔴
- [ ] A2 `portrait.jpg` 🔴
- [ ] A2 `desk-dark.jpg` 🔴
- [ ] A2 `workspace.jpg` 🟡
- [ ] A3 `project-hiro.png` 🔴
- [ ] A3 `project-salezo.png` 🔴
- [ ] A3 `project-autoresumebot.png` 🔴
- [ ] A3 `project-internal-tools.png` 🔴
- [ ] A4 four `article-*.jpg` 🟡
- [ ] A5 gap-list logos 🟡
- [ ] A6 Satoshi woff2 🟡
- [ ] A7 `Milan_Kumawat_Resume.pdf` 🔴
- [ ] A8 audio 🟢
- [ ] A9 answers: eAdmin dates · email domain live · article URLs 🟡

---

## Measured budgets

Filled in by each station agent from the `?debug=1` HUD.

| Station | Draw calls (budget) | Triangles (budget) | FPS high | FPS low |
|---|---|---|---|---|
| hero | — / 24 | — / 180k | — | — |
| about | — / 14 | — / 60k | — | — |
| projects | — / 28 | — / 40k | — | — |
| experience | — / 12 | — / 90k | — | — |
| skills | — / 8 | — / 25k | — | — |
| build | — / 16 | — / 30k | — | — |
| writing | — / 10 | — / 20k | — | — |
| contact | — / 20 | — / 70k | — | — |

---

## Cross-phase requests

> Append only. Format: `- [from P3C → P2] need a <Chip variant="ghost"> — worked around with a local style.`

- [from P0 → P5/assets] `simple-icons@16.32.0` has **no mark** for: **OpenAI**,
  **LlamaIndex**, **VS Code**, **RAG**. `TechLogo` renders a monogram tile for these
  until Milan supplies 128×128 SVGs. Aliases resolved for the rest — see
  `src/data/techIcons.ts`. (`FastAPI`, `Claude` and `Convex`, which the manifest
  predicted would be missing, all resolve fine.)
- [from P0 → all] Display face is **Sora** (`next/font/google`), not Satoshi — no
  woff2 was supplied in `assets/incoming/`. Swap is a one-line change in
  `src/app/layout.tsx` when the file lands.

---

## Log

> Append only. Format: `- [P0] 2026-09-21 — done. Next 15 scaffolded, 6 data files written.`

- [plan] 2026-09-21 — Master plan, architecture, design system, scene bible, asset
  manifest, parallel playbook, content doc, and 16 phase briefs authored. `/me` skill
  installed. Ready for P0.
- [P0] 2026-09-21 — done. Next 15.5.25 scaffolded by hand (not create-next-app, the
  repo root was non-empty). Version triple pinned and verified: three 0.186.0 /
  @react-three/fiber 9.7.0 / @react-three/drei 10.7.8 / postprocessing 6.39.5, and
  react pinned to 19.2.8 because R3F 9.7 declares `react: >=19 <19.3`. Seven data
  files written from `docs/06-CONTENT.md` verbatim (the six planned plus `copy.ts`
  for per-station strings and `techIcons.ts` for the icon slug map). GLSL raw import
  verified through both the webpack rule and the turbopack rule. Resume PDF copied
  from `.old/` to `public/`. Build, lint and typecheck all clean.
