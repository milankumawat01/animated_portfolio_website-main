# P0 — Monorepo & Convex Foundation

| | |
|---|---|
| **Wave** | 1 — solo, blocking |
| **Depends on** | nothing |
| **Runs with** | nothing. This phase moves every file in the repo. |
| **Branch** | `feat/p0-monorepo` — the only phase that gets its own branch, merged to `main` once green |

## Goal

Turn a single-app repo into the three-workspace monorepo, stand up a Convex deployment, and
have the public site build and render **exactly as it does today**. No feature work. No
content changes. If a visitor could tell P0 ran, P0 did too much.

This is the highest-churn, lowest-visibility phase in the build. Everything else depends on
getting it boring and right.

## Files owned

Everything, transiently — this phase *is* the restructure:

- root `package.json` (new, workspaces), root `tsconfig.json`
- `git mv` of `app/`, `components/`, `data/`, `public/` → `apps/web/`
- `apps/web/{next.config.mjs,tailwind.config.js,postcss.config.js,tsconfig.json,package.json}`
- `packages/backend/**` — `convex.json`, `package.json`, `convex/` scaffold
- `apps/admin/**` — minimal skeleton that boots and nothing more
- `.gitignore`

## Read first

1. `docs/00-MASTER-PLAN.md`
2. `docs/01-ARCHITECTURE.md` — §1 topology, §4 env, §7 Next 16. All three matter here.
3. `AGENTS.md` at the repo root

## Steps

1. **Install first.** `node_modules` currently has no `next` in it. Run `npm install` and
   confirm the site builds *before* touching anything, so a later failure is attributable.
2. **Read the Next docs.** Once `next` is installed, `node_modules/next/dist/docs/` exists.
   `AGENTS.md` says to read it before writing code. Do that.
3. **Decide `cacheComponents`.** On or off — this changes how every later phase writes pages
   (`01-ARCHITECTURE.md §7`). Record the decision and the reason in `STATUS.md §Decisions`.
   Default recommendation: **off** for now, because `generateStaticParams` returning `[]`
   is a build error when it is on, and P4A/P4B lean on runtime ISR.
4. **Root workspace.** New root `package.json` with `"workspaces": ["apps/*", "packages/*"]`
   and the scripts that fan out to the apps.
5. **Move the app.** `git mv` (not `mv` — preserve history) `app/`, `components/`, `data/`,
   `public/` into `apps/web/`. Move the four config files alongside them.
6. **Fix the path alias.** `tsconfig.json` maps `@/*` → `./*` from the repo root today. It
   must now resolve from `apps/web`. Every component imports `@/components/...` and
   `@/data/portfolioData` — if this is wrong, everything fails at once, which is at least
   easy to spot.
7. **Fix the broken lint script.** `package.json` still has `"lint": "next lint"`. `next lint`
   was **removed** in Next 16. Replace it with a direct `eslint` invocation.
8. **Fix the image config.** `apps/web/next.config.mjs` sets `images: { unoptimized: true }`.
   Remove it and add `remotePatterns` for `*.convex.cloud` so admin-uploaded images work
   later. Ten components already use `next/image`; none of them change.
9. **Scaffold the backend.** `packages/backend` with `package.json`
   (`"name": "@portfolio/backend"`) and `convex.json` **beside that package.json, not at the
   repo root**. Run `npx convex dev` **once, from `packages/backend`** — never from an app
   directory, or you get a second deployment and a confusing afternoon.
10. **Wire the provider.** A `'use client'` `ConvexClientProvider` holding
    `new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)`, imported into
    `apps/web/app/layout.tsx` (which stays a Server Component).
11. **Admin skeleton.** `apps/admin` boots, renders one page that says it is the admin, and
    connects to Convex. No auth, no screens — that is P6A.
12. **Commit `_generated/`.** It is the shared contract and CI typechecks against it.

## Acceptance criteria

- [ ] `npm install` at the root installs all three workspaces
- [ ] `npm run build` passes from the repo root
- [ ] `npx tsc --noEmit` passes in `apps/web` and `apps/admin`
- [ ] `npm run lint` runs and does not error on a removed command
- [ ] `npm run dev` serves the public site and it is **visually identical to `main`** — all
      eight sections, all four modals, fonts, cursor, animations. Check against a screenshot
      taken before the move.
- [ ] A Convex deployment exists; `npx convex dev` from `packages/backend` connects
- [ ] `apps/web` and `apps/admin` both read `NEXT_PUBLIC_CONVEX_URL`
- [ ] `apps/admin` boots on a different port and reaches Convex
- [ ] `git log --follow apps/web/app/page.tsx` shows history across the move
- [ ] `.env.local` is still gitignored; no key is in the diff
- [ ] `STATUS.md` records the `cacheComponents` decision

## Gotchas

- **Use `git mv`.** A plain `mv` plus `git add` loses per-file history and makes every later
  `git blame` useless.
- **Turbopack is the default builder in 16.** If a webpack config survives the move, the
  build fails.
- The site still reads from `data/portfolioData.ts` at the end of P0. Convex is connected
  but unused. That is correct — migration is P2.

## Commit

`feat(p0): convert to workspaces and scaffold the convex backend`
