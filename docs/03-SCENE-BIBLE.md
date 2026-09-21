# Scene Bible — the eight stations

> The 3D spec. Each station agent implements exactly one section of this document.
> Everything here is **procedural** unless explicitly marked as needing an asset.

Shared vocabulary:
- `p` = local progress, 0 at station entry, 1 at station exit
- `v` = damped scroll velocity, signed, roughly -1..1
- All geometry is authored around local origin `(0,0,0)`

---

## 01 — HERO · "The idea, before it has a shape"

**Mood:** dark, volumetric, a single warm lamp somewhere off-frame.

**The set piece.** A GPU particle field of up to 150k points. At `p = 0` the points
are settled into a **3D signed-distance field of the MK monogram**, floating and
breathing. As `p` climbs the monogram dissolves: each particle lerps from its target
position toward a curl-noise-driven free position, with the dissolve front sweeping
left-to-right so the M releases before the K.

**Technique**
- One `THREE.Points` with a custom `ShaderMaterial`. Positions live in an attribute
  buffer; the target (monogram) position is a second attribute. The vertex shader
  mixes between them by `uDissolve` plus a per-particle random offset so the
  transition frays instead of wiping cleanly.
- Monogram target positions are generated at build time from an SVG path sampled into
  points and extruded on Z with jitter. Write the sampler as a small script in
  `scenes/hero/lib/sampleMonogram.ts`; no external asset needed.
- Curl noise via a `simplex3d` GLSL chunk in `lib/shader.ts`.
- Additive blending, size attenuation, a soft radial sprite drawn in the fragment
  shader (no texture file).

**Extra layers**
- A very slow-rotating fog volume: a large inverted sphere with a noise-scrolling
  fragment shader at 8% opacity. Sells depth for almost nothing.
- Four "dust" instanced quads drifting near the camera for parallax.
- Bloom, threshold 0.75, intensity 0.9. Chromatic aberration scaled by `|v|` so fast
  scrolling smears the light — this is the single best scroll-feedback trick on the page.

**Camera.** Starts *inside* the cloud at `z = 4`, pulls back to `z = 14` across `p`,
with a 3° roll. Mouse parallax ±0.6 units, damped at 0.06.

**DOM overlay.** Name in `display-xl` with per-word reveal. The word "Kumawat" is
blue. Stat block, tech-logo strip, scroll hint. Nav is fixed and lives outside stations.

**Low tier.** 8k particles, no fog volume, no post FX. Still reads as a constellation.

**Budget.** 24 draw calls, 180k triangles (points count as tris here).

**Assets needed:** monogram SVG (see manifest A1), tech logos (A5).

---

## 02 — ABOUT · "The idea gets a desk"

**Mood:** light, calm, soft ambient with one warm rim.

**The set piece.** The hero's particles are *conceptually* the same points — as the
camera arrives, a **low-poly isometric desk** assembles from the fog: monitor, laptop,
mug, plant, book stack, lamp. Each object scales in from 0 with a stagger driven by
`p`, with a slight overshoot.

**Technique**
- All objects are composed from `BoxGeometry` / `CylinderGeometry` /
  `IcosahedronGeometry` with bevelled edges via `RoundedBox` from drei. No GLB.
  Target: 18 meshes, merged into 3 draw calls by material.
- Three materials only: matte white-blue plastic, dark screen, warm wood. Flat
  `MeshStandardMaterial`, roughness 0.8. The whole look is the mockup's pastel
  isometric register, not photorealism.
- The monitor and laptop screens are `MeshBasicMaterial` with a procedurally animated
  canvas texture: scrolling code-like bars in brand blue. Regenerate at 12fps, not 60.
- The plant is instanced: 40 leaf quads on a `InstancedMesh` with a gentle vertex sway.

**The portrait.** Milan's photo on a rounded plane, floating slightly in front of the
desk, rendered through a **`MeshTransmissionMaterial` frame** so the edges refract the
scene behind. On `high` tier only; `medium` uses a simple glass-tinted standard
material; `low` uses a plain textured plane.

**Camera.** Orbits 22° around the desk across `p`, descending from a 30° high angle to
18°. Look-at target eases from the monitor toward the portrait.

**DOM overlay.** Headline, bio paragraph, three trait tiles, the "What I work on"
right rail of four cards.

**Low tier.** Desk renders, screens static, no transmission, no plant instancing sway.

**Budget.** 14 draw calls, 60k triangles.

**Assets needed:** portrait photo (A2).

---

## 03 — PROJECTS · "Four things that shipped"

**Mood:** light, high specular, the most kinetic station.

**The set piece.** Four **glass slabs** arranged on a shallow arc facing the camera.
Scroll within the station rotates the arc horizontally — `p` maps to a 3-slab
traverse, so the carousel advances as you scroll rather than requiring a click. The
active slab is scaled 1.08, lifted 0.3 units, and tilted to face camera.

**Technique**
- Each slab: `RoundedBox` at `1.6 × 1.0 × 0.06`, `MeshTransmissionMaterial`
  (thickness 0.3, roughness 0.05, chromaticAberration 0.04, samples by tier).
- The project UI screenshot is a texture on a plane inset 0.04 in front of the slab
  so it reads as *behind glass*. Slight vertex displacement on the plane driven by
  `|v|` makes the image ripple while scrolling fast.
- A caustic pool under each slab: a plane with a cheap animated voronoi fragment
  shader, additive, 30% opacity. Sells the glass for one extra draw call.
- Hover (driven from DOM via `useInteraction`): slab tilts toward the cursor by up to
  6°, rim light intensifies, bloom threshold drops locally via a per-slab emissive.

**Camera.** Dollies in slightly and tracks the active slab laterally. Subtle DOF with
focus locked to the active slab — this is where DOF earns its cost.

**DOM overlay.** Headline, intro, `CarouselNav`, and four cards below the slabs with
title, description, chips, `View Project →`. The DOM cards and the 3D slabs are
horizontally aligned; hovering either drives both.

**Low tier.** Slabs become opaque `MeshStandardMaterial` with the screenshot as an
emissive map. No caustics, no DOF, no ripple.

**Budget.** 28 draw calls, 40k triangles. Transmission is fill-rate bound, not
triangle bound — watch the GPU frame time, not the tri count.

**Assets needed:** four project screenshots (A3).

---

## 04 — EXPERIENCE · "Climbing"

**Mood:** light drifting cool. Vertical. The only station where the camera gains height.

**The set piece.** A **helix of light** — a tube along a helical curve rising 18 units
over three turns. The camera climbs it. At each of three heights sits a **year marker**:
a glowing ring with the year extruded in 3D text.

**Technique**
- `TubeGeometry` on a `CatmullRomCurve3` sampled from a helix function. A custom
  shader draws a travelling energy pulse along the tube using `vUv.x` versus a
  `uProgress` uniform, plus a persistent dim base glow. The pulse position tracks
  scroll, so the light literally leads you upward.
- Year rings: `TorusGeometry`, emissive brand blue, plus drei `<Text3D>` using the
  Satoshi typeface JSON. Rings rotate slowly and pulse on arrival.
- Ambient motes: 2k instanced points drifting downward, so the ascent is legible.
  This is the cheapest possible "you are moving up" cue and it works.
- A ground grid far below, fading with distance fog, to anchor the height.

**Camera.** `y` goes 0 → 18 across `p`, orbiting the helix axis by 200°. This is the
station where the camera path does the most work, so keep the geometry calm.

**DOM overlay.** The three timeline cards, pinned so each card is centred as the
camera passes its year marker. Left rail with the three value tiles.

**Low tier.** The tube stays, the pulse becomes a static gradient, motes drop to 200,
`Text3D` becomes a DOM label.

**Budget.** 12 draw calls, 90k triangles.

**Assets needed:** Satoshi typeface JSON for `Text3D` (A6) — or fall back to DOM labels.

---

## 05 — SKILLS · "The stack, as a structure"

**Mood:** light, flat, playful. The one directly manipulable station.

**The set piece.** A **force-directed 3D graph**. Six category hubs, each with its
tech logos as satellite nodes, connected by glowing edges. The whole graph rotates
slowly; the user can **drag to orbit it**.

**Technique**
- Node positions come from a tiny force simulation run for 200 iterations **once at
  mount**, then frozen and cached. Do not simulate per frame.
- Nodes are one `InstancedMesh` of icosahedrons plus one `InstancedMesh` of billboarded
  quads carrying logo sprites from a **texture atlas**. Two draw calls for up to 80 nodes.
- Edges are a single `LineSegments` with vertex colours, plus a shader that animates a
  dash offset so energy appears to flow toward the hubs.
- Hovering a DOM category card highlights that cluster: its nodes scale to 1.3 and
  saturate, everything else desaturates to 20%. Driven through `useInteraction`.
- Drag-orbit uses a pointer handler on the canvas with inertia, clamped to ±35° so the
  user cannot lose the composition. Releases back to the idle rotation after 2s.

**Camera.** Nearly static — slow push-in only. The graph moves, not the camera. After
four stations of camera travel this stillness is a deliberate rest beat.

**DOM overlay.** Headline, the six category cards with their logo rows, the photo
card, the closing quote.

**Low tier.** 24 nodes, no atlas sprites (coloured spheres only), no edge animation,
no drag.

**Budget.** 8 draw calls, 25k triangles.

**Assets needed:** tech logo atlas (A5).

---

## 06 — HOW I BUILD · "The pipeline"

**Mood:** light, technical. Blueprint. Grid paper in three dimensions.

**The set piece.** A **wireframe schematic** of the five-step pipeline: five node
frames connected by flowing dashed conduits, drawn on as `p` advances. The camera
dollies along the pipeline left to right so steps arrive one at a time.

**Technique**
- Node frames: `EdgesGeometry` of rounded boxes, rendered as lines in `--ink-700`,
  with a blue fill plane at 8% opacity inside each.
- Conduits: `TubeGeometry` with a dashed shader (`fract(vUv.x * 30 - uTime)`), drawn
  on via a `uDraw` uniform that clips the tube by `vUv.x`. The draw-on is tied to `p`
  so scrolling literally constructs the diagram.
- A blueprint grid floor: a single plane with a procedural grid fragment shader
  (`abs(fract(uv*N)-0.5)` thresholded, anti-aliased with `fwidth`). One draw call,
  infinite-looking, no texture.
- Small orbiting glyph particles around each node — 5 instanced quads per node,
  rotating on local axes. Cheap, adds life.
- As each node activates, its frame edges flash to brand blue and its fill brightens.

**Camera.** A straight lateral dolly, `x: -14 → 14`, with a gentle 4° look-ahead yaw.
Predictable on purpose, to contrast with the helix before it.

**DOM overlay.** Headline, the `build.sh` code block with a typewriter effect, the
five step cards with checklists, the four-value bottom bar, the quote card.

**Low tier.** Static wireframe, no dash animation, no orbiting glyphs, grid stays.

**Budget.** 16 draw calls, 30k triangles.

**Assets needed:** none. Fully procedural.

---

## 07 — WRITING · "Thoughts in the air"

**Mood:** light, airy, weightless.

**The set piece.** Sheets of **paper drifting past the camera**, each one a plane with
a vertex-curl shader that makes it bend and flutter like it is falling. Four of them
carry the article cover images; the rest are blank and out of focus.

**Technique**
- Paper geometry: `PlaneGeometry(1.4, 0.9, 24, 16)` — enough segments for the curl to
  read. Vertex shader applies a sine curl on X modulated by noise on Y, plus a
  per-sheet phase offset.
- Two-sided material with a subtle back-face tint so the flutter is readable.
- 4 featured sheets (textured) + 14 blank sheets (one instanced mesh, shared shader).
- Sheets travel toward the camera on Z at a rate tied to `p`, wrapping around when
  they pass. Scroll direction reverses their travel — small detail, feels great.
- A soft depth-of-field with near blur so the passing sheets go soft as they leave
  frame. On `high` only.

**Camera.** Slow forward drift with a slight upward pitch, as if watching pages rise.

**DOM overlay.** Headline, intro, `CarouselNav`, four article cards with category chip,
date, title, excerpt, `Read Article →`, and the closing quote line.

**Low tier.** 4 static tilted sheets, no curl, no DOF.

**Budget.** 10 draw calls, 20k triangles.

**Assets needed:** four article cover images (A4).

---

## 08 — CONTACT · "Back to the room"

**Mood:** dark again. Warm lamp. Quiet. The bookend to the hero.

**The set piece.** The camera pulls back and **the About desk reappears**, far away
and dim, lit by one warm lamp — you are seeing where you started, from outside. The
hero's particles drift back in and **reform the MK monogram** one last time, smaller,
off to the side, and hold.

**Technique**
- Reuse the desk assembly from About via a shared module. **This is the one
  cross-station dependency.** P3B exports `createDeskGroup(quality)` from
  `scenes/about/desk.ts`; P3H imports it. P3B must ship that export — it is in P3B's
  acceptance criteria.
- The monogram reform reuses the hero particle system at 30% count, running the
  dissolve shader in reverse. P3A exports `MonogramPoints` from
  `scenes/hero/MonogramPoints.tsx` with a `dissolve` prop. Also in P3A's criteria.
- Volumetric lamp cone: a cylinder with an additive gradient shader, vertex-faded at
  the tip. Two triangles of cost, enormous atmosphere.
- The four contact tiles get a 3D echo: four small glass panels floating behind the
  DOM tiles, which brighten when the DOM tile is hovered.

**Camera.** A long pull-back and slight downward settle. Ends at rest — the final
20% of `p` has almost no camera motion, so the footer feels like solid ground.

**DOM overlay.** Split layout: left is the contact headline, paragraph, four contact
tiles, and the `Let's Talk` CTA. Right is the dark bleed where the 3D shows through
unobstructed. Then the dark footer bar with nav, socials, location, copyright.

**Low tier.** No desk, no monogram reform, just the lamp cone and a dark gradient.

**Budget.** 20 draw calls, 70k triangles.

**Assets needed:** none new. Reuses A1 and A2.

---

## Cross-station dependency summary

Only two exist, both one-directional and both declared up front:

| Producer | Export | Consumer |
|---|---|---|
| P3A hero | `MonogramPoints` component with `dissolve: number` prop | P3H contact |
| P3B about | `createDeskGroup(quality): THREE.Group` | P3H contact |

**Therefore: P3H should be scheduled in the last parallel batch**, after 3A and 3B
have landed. If P3H must run earlier, it stubs both with primitives and a follow-up
task is filed in `STATUS.md`.
