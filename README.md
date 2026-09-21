# Milan Kumawat — Portfolio

A single-page, scroll-driven 3D portfolio. One persistent WebGL canvas, one camera,
eight stations. Scrolling flies the camera through the world; the DOM content floats
over it and recolours as the camera crosses each station boundary.

## Stack

Next.js 15 (App Router) · TypeScript · React Three Fiber + drei · postprocessing ·
Lenis + GSAP ScrollTrigger · Motion · Tailwind CSS v4 · Zustand · deployed on Vercel.

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server on http://localhost:3000 |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |

## Dev URLs

| URL | Effect |
|---|---|
| `?debug=1` | Stats HUD — FPS, draw calls, triangles, station, budget violations |
| `?q=low` · `?q=medium` · `?q=high` | Force a quality tier |

## Where things live

```
docs/                 the build plan — start at docs/00-MASTER-PLAN.md
docs/STATUS.md        live phase board
src/engine/           canvas, camera rig, scene director, post FX, quality tiering
src/scenes/<id>/      one folder per 3D station
src/sections/<Name>   the DOM overlay for each station
src/components/ui/    the shared design-system kit
src/data/             all copy, typed — sourced from docs/06-CONTENT.md
assets/incoming/      drop zone for raw assets; see docs/04-ASSET-MANIFEST.md
```

## Assets

The 3D is fully procedural — there is nothing to model. The outstanding image and
font assets, with generation prompts, are listed in `docs/ASSET-PROMPTS.md`.
