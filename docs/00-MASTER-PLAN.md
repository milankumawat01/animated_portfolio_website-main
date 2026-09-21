# Master Plan — Milan Kumawat Portfolio (3D / Scroll-Driven)

> Single source of truth. Every phase doc, every agent, every session starts here.

---

## 1. The Vision

**One continuous 3D world. One camera. Eight stations. Scroll is the only control.**

The site is not eight pages with 3D decoration. It is a single persistent WebGL canvas
containing one world, and scrolling flies a camera rig through it. The DOM content
(headings, cards, links) floats *over* the canvas, pinned to the camera's current station.

The narrative through-line: **"A developer's mind as a navigable space."**
The camera starts inside a dark, dense particle cloud (the idea), travels through
structure and system (the work), and lands back in a quiet dark room (the invitation).

### Non-negotiables

- 60fps desktop / 30fps mid-tier mobile. The frame budget is a hard gate, not a wish.
- **No Blender dependency.** Everything is procedural — shaders, instanced geometry,
  generated meshes. Only two optional GLBs, both replaceable with primitives.
- Every scene has a working degraded mode (low quality tier) and a no-WebGL fallback.
- The DOM layer alone must be a complete, readable, indexable portfolio with zero 3D.

### The eight stations

| # | Station | World idea | Lighting |
|---|---------|-----------|----------|
| 01 | Hero | Particle constellation forms the MK monogram, then disperses | Dark, volumetric, single warm key |
| 02 | About | Particles regather into a low-poly isometric desk; portrait on refractive glass | Light, soft ambient |
| 03 | Projects | Four glass slabs orbiting in a 3D carousel, each a live project surface | Light, high specular |
| 04 | Experience | A helix of light the camera climbs; year markers dock to it | Light shifting cool |
| 05 | Skills | Force-directed 3D node graph of the stack, drag-orbitable | Light, flat |
| 06 | How I Build | Wireframe blueprint pipeline; camera dollies along five nodes | Light, technical grid |
| 07 | Writing | Drifting pages with a vertex-curl shader | Light, airy |
| 08 | Contact | Camera pulls back into the dark room; monogram reforms | Dark, warm lamp |

Full per-scene spec: **`docs/03-SCENE-BIBLE.md`**

---

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) + TypeScript | SSG for SEO, image optimization, Vercel-native |
| 3D | **React Three Fiber** + `@react-three/drei` | Declarative Three.js inside React |
| Post FX | `@react-three/postprocessing` | Bloom, DOF, chromatic aberration, vignette |
| Scroll | **Lenis** + **GSAP ScrollTrigger** | Deterministic scroll-to-progress mapping |
| DOM motion | **Motion** (`motion/react`) | Section reveals, layout transitions |
| Styling | **Tailwind CSS v4** + CSS custom properties | Tokens live in CSS, Tailwind consumes them |
| State | **Zustand** | Scroll progress, quality tier, active station, hover targets |
| Deploy | **Vercel** | Edge CDN for GLB/KTX2, zero-config |

Full architecture and folder contract: **`docs/02-ARCHITECTURE.md`**

---

## 3. Phase Map

Phases are sized so that **each one owns a disjoint set of files**. Two agents working
different phases in the same wave will never edit the same file. That is the entire
reason the phase boundaries are drawn where they are.

```
WAVE 1  ──  P0  Foundation & Scaffold                    [solo, blocking]
              │
WAVE 2  ──  P1  Core 3D Engine & Contracts               [solo, blocking]  ← CONTRACT FREEZE
              │
WAVE 3  ──  P2  Design System & DOM Kit                  [solo, blocking]
              │
              ├──────┬──────┬──────┬──────┬──────┬──────┬──────┐
WAVE 4     P3A    P3B    P3C    P3D    P3E    P3F    P3G    P3H   [8-way parallel]
           Hero  About  Proj   Exp   Skills Build  Write  Contact
              └──────┴──────┴──────┴──────┴──────┴──────┴──────┘
              │
WAVE 5  ──  P4  Interaction Layer & Polish               [solo]
              │
              ├──────────────┐
WAVE 6  ──  P5 Performance   P6 A11y / SEO / Fallback    [2-way parallel]
              └──────────────┘
              │
WAVE 7  ──  P7  QA, Cross-browser, Deploy                [solo]
```

| Phase | Name | Mode | Depends on | Doc |
|---|---|---|---|---|
| **P0** | Foundation & Scaffold | solo | — | `phases/PHASE-00-foundation.md` |
| **P1** | Core 3D Engine & Contracts | solo | P0 | `phases/PHASE-01-engine.md` |
| **P2** | Design System & DOM Kit | solo | P1 | `phases/PHASE-02-design-system.md` |
| **P3A** | Hero station | parallel | P2 | `phases/PHASE-03A-hero.md` |
| **P3B** | About station | parallel | P2 | `phases/PHASE-03B-about.md` |
| **P3C** | Projects station | parallel | P2 | `phases/PHASE-03C-projects.md` |
| **P3D** | Experience station | parallel | P2 | `phases/PHASE-03D-experience.md` |
| **P3E** | Skills station | parallel | P2 | `phases/PHASE-03E-skills.md` |
| **P3F** | How I Build station | parallel | P2 | `phases/PHASE-03F-how-i-build.md` |
| **P3G** | Writing station | parallel | P2 | `phases/PHASE-03G-writing.md` |
| **P3H** | Contact + Footer station | parallel | P2 | `phases/PHASE-03H-contact.md` |
| **P4** | Interaction Layer & Polish | solo | all P3 | `phases/PHASE-04-interaction-polish.md` |
| **P5** | Performance & Asset Pipeline | parallel | P4 | `phases/PHASE-05-performance.md` |
| **P6** | A11y, SEO, Fallbacks | parallel | P4 | `phases/PHASE-06-a11y-seo-fallback.md` |
| **P7** | QA, Cross-browser, Deploy | solo | P5, P6 | `phases/PHASE-07-qa-deploy.md` |

**Recommended parallelism in Wave 4:** three to four agents at a time, not all eight.
Each section agent writes 400–700 lines; eight at once makes review unmanageable.
Suggested batches: `[3A, 3C, 3E]` then `[3B, 3D, 3F]` then `[3G, 3H]`.

---

## 4. Effort Estimate

| Phase | Est. agent-hours | Notes |
|---|---:|---|
| P0 | 2 | Mostly scaffolding commands |
| P1 | 8 | The hardest phase. Get this right. |
| P2 | 5 | Mechanical once tokens are set |
| P3A–P3H | 5 each (40 total) | Wall-clock ~15h if run three-wide |
| P4 | 6 | Cursor, sound, transitions, easter eggs |
| P5 | 5 | Compression, LOD, lazy mounting |
| P6 | 4 | The fallback page is the bulk |
| P7 | 4 | Matrix testing and deploy |
| **Total** | **~74 agent-hours** | **~35h wall-clock with parallelism** |

---

## 5. Where Things Live

```
docs/00-MASTER-PLAN.md       <- you are here
docs/01-DESIGN-SYSTEM.md     tokens, type, color, motion curves
docs/02-ARCHITECTURE.md      stack, folders, the registry contract, conventions
docs/03-SCENE-BIBLE.md       the eight stations in 3D detail
docs/04-ASSET-MANIFEST.md    what Milan must supply, with exact specs
docs/05-PARALLEL-PLAYBOOK.md file-ownership map and agent rules
docs/06-CONTENT.md           every string, every project, every date
docs/STATUS.md               live phase tracker, agents update this
docs/phases/PHASE-*.md       one brief per phase
.claude/skills/me/SKILL.md   the /me command
assets/incoming/             drop zone for Milan's raw assets
references/                  the eight design mockups and research report
```

---

## 6. Rules That Apply To Every Phase

1. **Read `docs/02-ARCHITECTURE.md` before writing a single line.** The registry
   contract is what makes parallel work safe.
2. **Never edit a file you do not own.** Your phase doc lists the files you own. If you
   need a change in someone else's file, record it in `docs/STATUS.md` under
   *Cross-phase requests* and work around it.
3. **Never edit `src/scenes/index.ts`.** All eight entries are created, stubbed, in P1.
4. **Every scene must respect `useQuality()`.** If the tier is `low`, render a cheap
   variant. No exceptions.
5. **Every scene must honor `prefers-reduced-motion`.** The camera still moves (it is
   scroll-bound), but idle and autonomous animation stops.
6. **Budget check before you finish.** Your phase doc states a draw-call and triangle
   budget. Verify it with the debug HUD (`?debug=1`).
7. **Update `docs/STATUS.md`** when you start and when you finish.
8. **No placeholder lorem.** All copy comes from `docs/06-CONTENT.md`.
