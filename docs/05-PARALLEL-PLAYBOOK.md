# Parallel Execution Playbook

> How multiple agents work on this repo at the same time without stepping on
> each other. Read this before dispatching any parallel wave.

---

## 1. The core idea

Conflicts happen when two agents write the same file. So: **every file in this
project has exactly one owning phase.** A phase may only create or edit files it
owns. The ownership map below is the contract.

Everything that would normally be a shared mutable file — the scene registry, the
section index, the type definitions, the store — is written **once in P1** with all
eight stations already stubbed in. After P1, those files are **frozen**. A station
agent never needs to edit them, because its entry already exists and points at its
own folder.

---

## 2. File ownership map

| Path | Owner | Frozen after |
|---|---|---|
| `package.json`, configs, `next.config.ts`, `tsconfig.json` | **P0** | P0 (P5 may add build steps) |
| `src/data/*.ts` | **P0** | P0 |
| `src/app/layout.tsx` | **P0** | P0 (P6 may edit metadata) |
| `src/engine/**` | **P1** | P1 (P5 may tune `quality.ts`) |
| `src/store/useScroll.ts`, `useQuality.ts` | **P1** | P1 |
| `src/lib/**` | **P1** | P1 |
| `src/scenes/index.ts` | **P1** | **P1 — permanently frozen** |
| `src/sections/index.ts` | **P1** | **P1 — permanently frozen** |
| `src/app/page.tsx` | **P1** | P1 |
| `src/app/globals.css` | **P2** | P2 |
| `src/components/ui/**` | **P2** | P2 |
| `src/components/chrome/**` | **P2** | P2 |
| `src/scenes/hero/**` + `src/sections/Hero.tsx` | **P3A** | — |
| `src/scenes/about/**` + `src/sections/About.tsx` | **P3B** | — |
| `src/scenes/projects/**` + `src/sections/Projects.tsx` | **P3C** | — |
| `src/scenes/experience/**` + `src/sections/Experience.tsx` | **P3D** | — |
| `src/scenes/skills/**` + `src/sections/Skills.tsx` | **P3E** | — |
| `src/scenes/build/**` + `src/sections/Build.tsx` | **P3F** | — |
| `src/scenes/writing/**` + `src/sections/Writing.tsx` | **P3G** | — |
| `src/scenes/contact/**` + `src/sections/Contact.tsx` | **P3H** | — |
| `src/components/interaction/**`, `src/store/useInteraction.ts` | **P4** | — |
| `scripts/**`, `public/**` | **P5** | — |
| `src/app/fallback/**`, `src/app/sitemap.ts`, `robots.ts` | **P6** | — |
| `docs/STATUS.md` | **everyone** (append-only, see §5) | — |

If a phase needs something outside its ownership, it **does not edit that file**. It
files a cross-phase request in `STATUS.md` and works around it locally.

---

## 3. Dispatching a wave

The `/me` skill does this automatically, but here is the shape.

For a parallel wave, send **one message containing multiple Agent tool calls** so they
run concurrently. Each agent gets a brief built from this template:

```
You are implementing PHASE <ID> of the Milan Kumawat 3D portfolio.

MANDATORY READING, in this order:
  1. docs/02-ARCHITECTURE.md   — the contracts. Non-negotiable.
  2. docs/01-DESIGN-SYSTEM.md  — tokens and motion. Use these values, invent none.
  3. docs/03-SCENE-BIBLE.md    — read ONLY your station's section.
  4. docs/06-CONTENT.md        — your copy. Use it verbatim.
  5. docs/phases/PHASE-<ID>.md — your task list and acceptance criteria.

YOU OWN EXACTLY THESE FILES:
  <list from the phase doc>

YOU MAY READ ANYTHING. YOU MAY WRITE NOTHING ELSE.
If you need a change in a file you do not own, append a Cross-phase request to
docs/STATUS.md and work around it. Do not edit the other file.

Before you finish:
  - pnpm build and pnpm lint must pass
  - verify your draw-call and triangle budget with ?debug=1
  - confirm the low quality tier renders
  - mark your phase Done in docs/STATUS.md

Report back: what you built, budget numbers measured, anything you stubbed,
and any cross-phase requests you filed.
```

---

## 4. Recommended wave batching

Do not run all eight station agents at once. Three at a time is the sweet spot —
enough parallelism to matter, few enough that you can actually review the output.

| Batch | Phases | Why this grouping |
|---|---|---|
| 1 | **P3A, P3C, P3E** | Three very different techniques (particles, transmission, instancing). No shared deps. 3A unblocks 3H. |
| 2 | **P3B, P3D, P3F** | 3B unblocks 3H. 3D and 3F are the two "drawn geometry" stations. |
| 3 | **P3G, P3H** | 3H must be last — it consumes exports from 3A and 3B. |

After each batch: run `pnpm build`, open the site, scroll the whole page, then
commit. Do not start the next batch on a broken build.

---

## 5. STATUS.md protocol

`docs/STATUS.md` is the only file multiple agents touch. Rules that keep it safe:

- **Append-only** for the log and the cross-phase request sections. Never rewrite
  another agent's line.
- The phase table has one row per phase. An agent edits **only its own row**.
- Every edit is a single small `Edit` operation, never a whole-file rewrite.
- Format for a log entry: `- [P3C] 2026-09-21 — finished. 26 draw calls, 38k tris. Stubbed: caustics on low tier.`

If two agents collide on STATUS.md, it is a one-line merge. That is acceptable
friction; the alternative — per-agent status files — is worse to read.

---

## 6. When something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Two agents edited the same file | Ownership map ignored | Revert both, re-dispatch one at a time |
| Scene does not appear | Manifest `range` wrong, or not exported | Check `scenes/index.ts` points at your `manifest.ts` |
| Build fails after a wave | One agent shipped a TS error | `pnpm build` locally, fix in place, do not re-dispatch |
| FPS tanked after a wave | Budgets not checked | Open `?debug=1`, find the station over budget, fix that one |
| Camera jumps at a station edge | `camera.to` of station N does not match `camera.from` of N+1 | The curve in `lib/curves.ts` is authoritative — fix the manifest, not the curve |

---

## 7. Using a worktree (optional)

For true isolation, dispatch an agent with `isolation: "worktree"` so it works on its
own copy of the repo. Worth it when two phases have any chance of overlap — for
example running P5 and P6 together, since both touch build config adjacent files.

For the P3 station waves it is **not** needed: ownership is already disjoint, and
worktrees make the cross-station exports (P3A→P3H) harder to wire up.
