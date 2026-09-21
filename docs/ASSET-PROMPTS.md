# Asset Prompts — everything left to generate

> **Milan: this is your morning list.** Every asset the site still wants, with a
> ready-to-paste generation prompt, the exact spec, and what it changes.
>
> **The site is finished and works right now.** Nothing here is required to run,
> build or deploy — every slot already has a working fallback, so this is a
> replace-and-improve list, not a fix-it list. You can do them in any order, and you
> can stop at any point.
>
> **Where everything goes:** drop finished files into `assets/incoming/` with the
> exact filename given. Then run `pnpm build` — the asset pipeline picks them up,
> optimises them, and writes them into `public/`. Do not put raw files in `public/`
> yourself; that folder is generated.

---

## Priority: what actually changes the site

| Do first | Why |
|---|---|
| **1. `monogram.svg`** | It is the first and last thing on the page. 150,000 particles form it in the hero and reform it in the footer. Right now they form a geometric placeholder MK. |
| **2. Four `project-*.png`** | The Projects station is four glass slabs with your screenshots behind them. Placeholders read as unfinished. |
| **3. `portrait.jpg`** | The About station floats your photo on refracting glass. Currently a grey plane. |
| **4. Answer the three questions in §9** | One of them — the overlapping employment dates — is a real problem on a portfolio a recruiter will read. |
| Everything else | Genuinely optional. The fallbacks are deliberate, not apologies. |

---

## A1 · MK monogram 🔴 — highest impact

**File:** `assets/incoming/monogram.svg`
**Spec:** SVG, 512×512 viewBox, artwork centred with ~40px margin, **closed filled
paths only — no strokes** (in Illustrator/Figma: Object → Expand, or Outline Stroke).
Colour is irrelevant, only the geometry is sampled.

**Why the constraints:** the hero samples random points inside the filled shape and
rejects anything outside it. An open path or a stroked path has no interior, so the
sampler finds nothing and you get an empty cloud.

A logo is a vector job, not really an image-model job. Two good routes:

**Route A — describe it, then trace.** Paste into ChatGPT/Claude with image generation:

```
A minimalist geometric monogram logomark combining the letters "M" and "K".
Single flat colour (solid black) on a pure white background, no gradients, no
shadows, no texture, no 3D, no outline, no text other than the mark itself.
Heavy geometric sans-serif construction with thick even strokes and sharp
mitred corners — think Swiss/International Style. The M and K sit side by side
as one balanced lockup, roughly square overall. Centred with generous even
margins. Flat vector style, crisp edges, high contrast.
```

Then convert the PNG to SVG at https://vectorizer.ai or https://svgco.de, open the
result, and make sure it is filled paths (not a traced outline).

**Route B — build it directly.** Ask an LLM for the SVG source:

```
Write an SVG file, 512x512 viewBox, containing a geometric "MK" monogram as
exactly two closed filled <path> elements (one for M, one for K) with fill
attributes and no stroke attributes. Heavy geometric sans-serif letterforms,
thick even stems, sharp mitred corners. The lockup should be centred with about
40px of margin on all sides. Output only the SVG source.
```

Route B is usually better here — it produces genuinely clean geometry, and you can
iterate by asking for thicker stems or tighter spacing.

**Also generate, from the same mark:**
- `favicon.svg` — the same lockup, simplified, no margin
- `icon.png` — 512×512, for social and PWA

**Currently shipping:** a hand-built geometric MK at `public/monogram.svg`. It is
real, closed, filled geometry and it works — it is just not *yours*.

---

## A2 · Photos 🔴

### `portrait.jpg` — this one has to be you

**Spec:** 3:4 portrait crop, minimum 1600×2133, JPG or PNG, subject centred, clean
uncluttered background.

Do not generate this. It goes on the About station as the human anchor of the whole
page; an AI face undermines the one thing the section is for. Any decent phone photo
works: stand about a metre from a plain wall, face a window so the light comes from
the side, have someone shoot from chest height.

**Bonus, optional:** `portrait-cutout.png` — the same photo with the background
removed (remove.bg does this in one click). It enables a nicer layered depth effect
where the 3D desk shows through behind you.

### `desk-dark.jpg` — your actual desk, or generated

**Spec:** 16:9 landscape, minimum 2400×1350, dark ambient lighting.

A real photo of your setup is better and takes thirty seconds. If you want to
generate one:

```
A moody photograph of a modern software developer's desk at night, shot from a
low three-quarter angle. A single warm desk lamp on the left is the only strong
light source, casting long soft shadows across the desk. Dark navy-black room,
deep shadows, cool blue monitor glow filling in from the right. On the desk: an
ultrawide monitor showing blurred code, a mechanical keyboard, a ceramic mug, a
small plant, a closed notebook. Cinematic, shallow depth of field, 35mm, film
grain, high dynamic range. No people, no text, no visible logos or brands.
```

### `workspace.jpg` — optional side card

**Spec:** 4:5 portrait crop, minimum 1200×1500.

```
A bright daytime photograph of a tidy minimalist developer workspace, shot from
above at a slight angle. Light wood desk, white walls, soft natural window
light from the left. A laptop with a plain screen, a notebook and pen, a small
green plant, a coffee cup. Clean Scandinavian aesthetic, muted palette, lots of
negative space. Vertical 4:5 crop. No people, no text, no visible logos.
```

---

## A3 · Project screenshots 🔴 — second highest impact

**Spec (all four):** 16:10, minimum 2000×1250, PNG, **no browser chrome** — crop to
the app UI itself.

These sit behind glass slabs, so they read as products, not pictures. The one rule
that matters: **all four must share a visual style and crop.** Generate them in one
session, same model, same settings.

The alternation of dark and light is deliberate — it is what makes the carousel read
as four distinct products rather than one repeated texture.

### `project-hiro.png` — dark UI

```
A clean dark-mode SaaS dashboard UI screenshot for an AI resume management
platform called "Hiro". Deep navy-charcoal background (#0F1520), blue accent
colour (#2563EB). Left sidebar with small icon navigation. Main area shows a
candidate list table with avatar circles, names, role titles, and coloured
match-score badges from 70 to 98 percent. A right-hand detail panel shows a
parsed resume with extracted skill tags. Top bar has a search field and filter
chips. Modern product design, Inter typeface, generous whitespace, subtle 1px
borders, soft rounded corners, flat design with no drop shadows. Straight-on
flat view, no browser chrome, no perspective, no mockup device frame.
16:10 aspect ratio, crisp and high resolution.
```

### `project-salezo.png` — light UI

```
A clean light-mode SaaS dashboard UI screenshot for an AI sales outreach
platform called "Salezo". Very light blue-grey background (#F5F8FC), white
cards, blue accent (#2563EB). Main area shows a multi-channel campaign view:
four channel columns labelled WhatsApp, Email, SMS and RCS, each with small
message preview cards and delivery status pills in green and amber. A line
chart panel at the top shows reply rate over time. Left sidebar with text
navigation. Modern product design, Inter typeface, generous whitespace, thin
grey borders, rounded corners, flat with no heavy shadows. Straight-on flat
view, no browser chrome, no perspective, no device frame.
16:10 aspect ratio, crisp and high resolution.
```

### `project-autoresumebot.png` — dark UI

```
A clean dark-mode web app UI screenshot for an automated job application
platform called "AutoResumeBot". Deep navy-charcoal background (#0F1520), blue
accent (#2563EB). Main area shows a job-matching board: a vertical list of job
cards each with company name, role, location, a circular match percentage ring,
and an "Auto-applied" status pill. A left panel shows an uploaded resume with
highlighted parsed fields. A small stats strip across the top shows applications
sent, responses, and interviews. Modern product design, Inter typeface, flat,
rounded corners, subtle borders, no drop shadows. Straight-on flat view, no
browser chrome, no perspective, no device frame.
16:10 aspect ratio, crisp and high resolution.
```

### `project-internal-tools.png` — light UI

```
A clean light-mode internal admin tool UI screenshot. Very light blue-grey
background (#F5F8FC), white panels, blue accent (#2563EB). Main area shows a
document-parsing workflow: a file upload queue on the left with PDF items and
progress bars, a central preview of a parsed document with coloured field
highlights, and a right panel showing extracted key-value pairs in a table. A
workflow status bar across the top shows four pipeline stages with the second
one active. Utilitarian but well-designed, Inter typeface, dense but readable,
thin borders, flat design. Straight-on flat view, no browser chrome, no
perspective, no device frame.
16:10 aspect ratio, crisp and high resolution.
```

**Optional 🟡:** a square logo mark per project, 256×256 PNG with transparency, named
`logo-hiro.png`, `logo-salezo.png`, `logo-autoresumebot.png`, `logo-internal-tools.png`.

---

## A4 · Article covers 🟡 — optional

**Spec:** 16:9, minimum 1600×900, JPG.

If these are missing the site generates brand-gradient covers with the category name,
which look fine. Only bother if you want them richer.

### `article-fastapi.jpg`
```
A minimal technical illustration on a very light blue-grey background. An
abstract diagram showing a central rounded rectangle labelled with a generic API
symbol, connected by thin blue lines to three smaller nodes representing a
language model, a database, and a client. Flat vector style, single blue accent
colour (#2563EB) on grey and white, thin consistent line weights, lots of
negative space. Editorial tech-blog header illustration. No text, no words, no
letters. 16:9.
```

### `article-backend.jpg`
```
A minimal system-architecture diagram illustration on a very light blue-grey
background. Layered horizontal bands representing a load balancer, application
servers, a cache, and a database cluster, connected by thin directional arrows.
Flat vector style, single blue accent (#2563EB) on grey and white, thin even
line weights, generous negative space, slightly isometric. Editorial tech-blog
header illustration. No text, no words, no letters. 16:9.
```

### `article-autoresumebot.jpg`
```
A minimal flat illustration on a very light blue-grey background showing an
abstract document transforming into structured data: a page outline on the left,
a series of small extracted blocks in the middle, and a tidy grid of rows on the
right, connected by thin blue arrows. Flat vector style, single blue accent
(#2563EB) on grey and white, thin line weights, lots of negative space.
Editorial tech-blog header illustration. No text, no words, no letters. 16:9.
```

### `article-idea-to-production.jpg`
```
A minimal flat illustration on a very light blue-grey background showing a
left-to-right pipeline of five connected rounded nodes, increasing slightly in
solidity from an empty outline on the left to a filled blue node on the right,
joined by a thin dashed line. Flat vector style, single blue accent (#2563EB) on
grey and white, generous negative space. Editorial tech-blog header
illustration. No text, no words, no letters. 16:9.
```

---

## A5 · Missing tech logos 🟡

`simple-icons` supplies 30 of the 34 marks the site uses. These four it does not have,
and they currently render as small lettered tiles (`AI`, `LI`, `VS`, `RAG`), which
looks deliberate rather than broken:

| Mark | Why it is missing | What to do |
|---|---|---|
| **OpenAI** | removed from simple-icons | grab the official SVG from openai.com/brand |
| **VS Code** | removed over trademark | grab from the VS Code brand page |
| **LlamaIndex** | never included | grab from the LlamaIndex GitHub |
| **RAG** | not a brand at all | leave as the `RAG` tile — that is correct |

Drop any you collect into `assets/incoming/logos/` as `openai.svg`, `vscode.svg`,
`llamaindex.svg`. Single-colour, 128×128 viewBox, filled paths.

LinkedIn is also absent from simple-icons, but the site already draws its own stroke
glyph for it, so nothing is needed there.

---

## A6 · Satoshi font 🟡

The display face is currently **Sora** (Google Fonts), which is the approved fallback
and looks good. If you want the real thing:

1. Go to https://www.fontshare.com/fonts/satoshi — free, no account needed.
2. Download and take `Satoshi-Bold.woff2` and `Satoshi-Black.woff2`.
3. Put both in `assets/incoming/fonts/`.
4. In `src/app/layout.tsx`, swap the `Sora` import for `next/font/local`. It is about
   a ten-line change and the comment there explains it.

---

## A7 · Resume ✅ done

`public/Milan_Kumawat_Resume.pdf` is in place, copied from the old site. **Check it is
current** — if you have a newer version, drop it at
`assets/incoming/Milan_Kumawat_Resume.pdf` and it will replace it.

---

## A8 · Audio 🟢 — skip unless you want it

Entirely optional. The sound layer is only built if the files exist; there is no muted
toggle sitting there doing nothing.

If you want it: an ambient pad loop (20–40s, seamless, −24 LUFS, under 400KB as
`.webm` + `.mp3`), a hover tick under 120ms, and an arrival swell under 800ms. Free
sources: freesound.org, or generate with Suno/Udio. Drop into `assets/incoming/audio/`.

---

## A9 · Three questions only you can answer 🟡

These are not assets, and one of them matters more than any image on this page.

**1. The employment dates overlap.** The site currently says:

- eAdmin Business Process — **Jul 2024 – Dec 2025**
- True Value Infosoft — **May 2025 – Present**

That is seven months of overlap. A recruiter will notice. Tell me the correct dates
and I will fix `src/data/experience.ts`.

**2. Is `hey@milankumawat.in` live?** It is the `mailto:` on the Contact station and
in the footer. If the domain is not registered or the mailbox does not exist, the
site's main call to action goes nowhere.

**3. The four articles have no URLs.** Every "Read Article →" currently points at `#`.
Either send four real links, or say the word and I will relabel them honestly as
"Coming soon" rather than leaving dead links.

---

## Quick checklist

```
assets/incoming/
  monogram.svg                    🔴  the hero and footer particles
  favicon.svg                     🟡
  icon.png                        🟡  512x512
  portrait.jpg                    🔴  3:4, 1600x2133+   (photo of you, not generated)
  desk-dark.jpg                   🔴  16:9, 2400x1350+
  workspace.jpg                   🟡  4:5, 1200x1500+
  project-hiro.png                🔴  16:10, 2000x1250+  dark UI
  project-salezo.png              🔴  16:10, 2000x1250+  light UI
  project-autoresumebot.png       🔴  16:10, 2000x1250+  dark UI
  project-internal-tools.png      🔴  16:10, 2000x1250+  light UI
  article-fastapi.jpg             🟡  16:9, 1600x900+
  article-backend.jpg             🟡
  article-autoresumebot.jpg       🟡
  article-idea-to-production.jpg  🟡
  logos/openai.svg                🟡
  logos/vscode.svg                🟡
  logos/llamaindex.svg            🟡
  fonts/Satoshi-Bold.woff2        🟡
  fonts/Satoshi-Black.woff2       🟡
  audio/*                         🟢
```

Then:

```bash
pnpm build     # the pipeline optimises and places everything, and
               # tells you exactly which 🔴 assets are still missing
```
