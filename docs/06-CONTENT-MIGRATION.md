# Content Migration — `portfolioData.ts` → Convex, field by field

> **Owner: P2.** This is the field-level map from `data/portfolioData.ts` (540 lines, every
> string on the site) onto the frozen schema in `02-DATA-MODEL.md`. Every source field has a
> destination or an explicit reason it has none.
>
> **Copy is Milan's.** Strings move verbatim. `00-MASTER-PLAN.md §8` — never improve his words
> in passing, not a capital letter, not a stray space.

Source read at commit `c753fe9`. Paths below are post-P0: `apps/web/data/portfolioData.ts`.

---

## 1. What the source file actually contains

One exported object, `PORTFOLIO_DATA`, plus four TypeScript interfaces.

| Source key | Shape | Count | Destination |
|---|---|---|---|
| `personal` | object, 13 scalars **+ 6 nested collections** | — | `siteSettings.personal` **and** five hoisted fields |
| `projects` | `ProjectItem[]` | 4 | `projects` table |
| `experience` | `ExperienceItem[]` | 3 | `experience` table |
| `skillCategories` | `SkillCategory[]` | 6 (36 skills) | `skillCategories` table |
| `howIBuildSteps` | object[] | 5 | `siteSettings.howIBuildSteps` |
| `howIBuildPillars` | object[] | 4 | `siteSettings.howIBuildPillars` |
| `articles` | `ArticleItem[]` | 4 | `blogPosts` table |
| `contactCards` | object[] | 4 | `siteSettings.contactCards` |

The four interfaces — `ProjectItem`, `ArticleItem`, `ExperienceItem`, `SkillCategory` — are
**dropped**. They are replaced by Convex's generated `Doc<"projects">` etc. `app/page.tsx`
imports `ProjectItem` and `ArticleItem` today; retyping that is P3's job, not P2's.

### The nesting change — read this before writing the seed

In the source, six collections live **inside** `personal`. In `siteSettings` they are
**siblings of** `personal`. This is the single most error-prone part of the import.

```
SOURCE                                  DESTINATION
PORTFOLIO_DATA.personal.stats         → siteSettings.stats
PORTFOLIO_DATA.personal.heroTechStack → siteSettings.heroTechStack
PORTFOLIO_DATA.personal.aboutPillars  → siteSettings.aboutPillars
PORTFOLIO_DATA.personal.whatIWorkOn   → siteSettings.whatIWorkOn
PORTFOLIO_DATA.personal.quotes        → siteSettings.quotes
PORTFOLIO_DATA.personal.handwriting   → siteSettings.handwriting
```

`siteSettings.personal` contains **exactly 13 scalar strings** and nothing else. Spreading
`...PORTFOLIO_DATA.personal` into `personal` will fail the validator.

---

## 2. Mapping tables

### 2.1 `personal` → `siteSettings`

| Source | Destination | Value / note |
|---|---|---|
| `personal.name` | `personal.name` | `Milan Kumawat` |
| `personal.role` | `personal.role` | `AI ENGINEER \| BACKEND DEVELOPER` |
| `personal.location` | `personal.location` | `Jaipur, India` |
| `personal.headline` | `personal.headline` | `Milan Kumawat` |
| `personal.subheadline` | `personal.subheadline` | `Building AI-powered products and scalable systems for a better tomorrow.` |
| `personal.email` | `personal.email` | `hey@milankumawat.in` |
| `personal.bio` | `personal.bio` | 47-word paragraph, contains a typographic apostrophe in `I'm` |
| `personal.linkedin` | `personal.linkedin` | display form, `linkedin.com/in/milankumawat` |
| `personal.linkedinUrl` | `personal.linkedinUrl` | — |
| `personal.github` | `personal.github` | display form, `github.com/milankumawat` |
| `personal.githubUrl` | `personal.githubUrl` | — |
| `personal.twitterUrl` | `personal.twitterUrl` | `https://x.com/milankumawat` |
| `personal.resumeUrl` | `personal.resumeUrl` | `/documents/Milan_Kumawat_Resume.pdf` — file stays in `public/` |
| `personal.stats[3]` | `stats` | **hoisted.** Shape `{ value, label }` — value first |
| `personal.heroTechStack[8]` | `heroTechStack` | **hoisted.** `{ name, iconKey }` |
| `personal.aboutPillars[3]` | `aboutPillars` | **hoisted.** `{ title, description, icon }` |
| `personal.whatIWorkOn[4]` | `whatIWorkOn` | **hoisted.** `{ title, description, icon }` |
| `personal.quotes` (6 keys) | `quotes` | **hoisted.** `about`, `skills`, `howIBuild`, `experience`, `writing`, `contact` |
| `personal.handwriting` (12 keys) | `handwriting` | **hoisted.** See §3.7 — byte-for-byte, and read the warning |
| `howIBuildSteps[5]` | `howIBuildSteps` | root-level in source, `{ step, title, icon, description, items[4] }` |
| `howIBuildPillars[4]` | `howIBuildPillars` | root-level in source, `{ title, subtitle, icon }` |
| `contactCards[4]` | `contactCards` | root-level in source, `{ id, title, value, hint, icon, action, copyable }` |
| — | `key` | `"main"` — the singleton literal |
| — | `updatedAt` | `SEED_AT` (§4) |

Nothing from `personal` is dropped.

### 2.2 `projects[]` → `projects`

| Source | Destination | Note |
|---|---|---|
| `id` | `slug` **and** `legacyId` | Verbatim. See §3.1 |
| `title` | `title` | — |
| `subtitle` | `subtitle` | — |
| `description` | `description` | card blurb |
| `longDescription` | `longDescription` | detail-page intro |
| `image` | `imageUrl` | `/images/project-*.png`. `imageStorageId` stays undefined. See §3.5 |
| `tags[]` | `tags` | 4 per project |
| `keyFeatures[]` | `keyFeatures` | 5 per project (20 total) |
| `architecture[]` | `architecture` | 5/4/4/4 (17 total) |
| `stats?[]` | `stats` | `{ label, value }` — **label first**, opposite of `personal.stats`. 3 per project. Default `[]` if absent |
| `liveUrl` | `liveUrl` | **All four are `example.com` placeholders.** See §7 |
| `githubUrl` | `githubUrl` | unverified. See §7 |
| — | `status` | `"published"` |
| — | `featured` | `true` for all four. See §3.6 |
| — | `order` | `10, 20, 30, 40` in source array order |
| — | `seo` | `undefined` — Milan fills it from the admin |
| — | `publishedAt` | `SEED_AT` |
| — | `updatedAt` | `SEED_AT` |

Source order, which fixes `order` and `slug`:

| # | `id` → `slug` | `order` | Title |
|---:|---|---:|---|
| 1 | `hiro` | 10 | Hiro |
| 2 | `salezo` | 20 | Salezo |
| 3 | `autoresumebot` | 30 | AutoResumeBot |
| 4 | `internal-tools` | 40 | Internal Tools |

### 2.3 `articles[]` → `blogPosts`

| Source | Destination | Note |
|---|---|---|
| `id` | `slug` **and** `legacyId` | Verbatim. See §3.1 |
| `title` | `title` | — |
| `date` | `publishedAt` | Display string → epoch ms. See §3.2 |
| `tag` | `tags` | Single string → one-element array. See §3.4 |
| `readTime` | `readTimeMinutes` | `'6 min read'` → `6`. See §3.3 |
| `image` | `imageUrl` | `/images/blog-*.png`. See §3.5 |
| `excerpt` | `excerpt` | — |
| `content[]` | `body` | Paragraph array → one Markdown string. See §3.4 |
| — | `status` | `"published"` |
| — | `featured` | `false` for all four. See §3.6 |
| — | `views` | `0` |
| — | `seo` | `undefined` |
| — | `updatedAt` | `SEED_AT` |

| # | `id` → `slug` | `date` → `publishedAt` | `readTime` → `readTimeMinutes` | `tag` → `tags` | paragraphs |
|---:|---|---|---:|---|---:|
| 1 | `building-ai-powered-fastapi` | `12 Sep 2026` → `1789171200000` | 6 | `['AI / LLMs']` | 4 |
| 2 | `designing-scalable-backend-systems` | `05 Sep 2026` → `1788566400000` | 8 | `['Engineering']` | 4 |
| 3 | `lessons-from-autoresumebot` | `28 Aug 2026` → `1787875200000` | 5 | `['Projects']` | 4 |
| 4 | `from-idea-to-production` | `18 Aug 2026` → `1787011200000` | 7 | `['Product']` | 3 |

`listTags` therefore returns four distinct tags with a count of 1 each.

### 2.4 `experience[]` → `experience`

| Source | Destination | Note |
|---|---|---|
| `id` | `legacyId` | **No `slug`** — the schema has none for this table. `legacyId` is the idempotency key |
| `company` | `company` | — |
| `role` | `role` | — |
| `period` | `period` | display string, kept verbatim (`May 2025 – Present`) — uses an en dash, not a hyphen |
| `timeframe` | `timeframe` | `2025 – Present` — also an en dash |
| `badge` | `badge` | duplicates `period` in all three rows today |
| `logo` | `logo` | `TV`, `eA`, `🎓` — the third is an emoji |
| `logoBg` | `logoBg` | Raw Tailwind classes. Seeded verbatim; **`05-DESIGN-SYSTEM.md §6.1` is where this gets fixed, in P5, not here** |
| `points[]` | `points` | 5 / 4 / 3 (12 total) |
| `tags[]` | `tags` | 6 / 5 / 4 (15 total) |
| — | `order` | `10, 20, 30` |
| — | `visible` | `true` |
| — | `updatedAt` | `SEED_AT` |

| # | `id` → `legacyId` | `order` | Company |
|---:|---|---:|---|
| 1 | `tv-infosoft` | 10 | True Value Infosoft Pvt. Ltd. |
| 2 | `eadmin` | 20 | eAdmin Business Process Pvt. Ltd. |
| 3 | `freelance` | 30 | Freelance & Personal Projects |

### 2.5 `skillCategories[]` → `skillCategories`

| Source | Destination | Note |
|---|---|---|
| `title` | `title` | **Also the idempotency key** — see below |
| `subtitle` | `subtitle` | — |
| `icon` | `icon` | icon key resolved by `components/icons/TechIcons.tsx` |
| `skills[]` | `skills` | `{ name, iconKey }`, exactly 6 per category |
| — | `order` | `10, 20, 30, 40, 50, 60` |
| — | `visible` | `true` |
| — | `updatedAt` | `SEED_AT` |

**`skillCategories` has no `legacyId` field in the frozen schema**, and no `slug`. The seed
must therefore key idempotency on `title`, which is unique across the six rows today. Note
this in the seed's comments: renaming a category from the admin and re-running the seed would
create a duplicate. That is acceptable for a one-shot P2 import; it is not acceptable as a
recurring job, and the seed is not one.

| `order` | `title` | `icon` |
|---:|---|---|
| 10 | Backend | `server` |
| 20 | AI / Machine Learning | `brain` |
| 30 | Frontend | `monitor` |
| 40 | Database & BaaS | `database` |
| 50 | DevOps & Infrastructure | `cloud` |
| 60 | Tools & Others | `wrench` |

### 2.6 Dropped

| Source | Why |
|---|---|
| `interface ProjectItem` / `ArticleItem` / `ExperienceItem` / `SkillCategory` | Replaced by Convex generated `Doc<>` types. P3 retypes the consumers. |
| `ArticleItem.content`'s **array shape** | The paragraphs survive; the array does not. `body` is one Markdown string (§3.4). |

That is the complete list. No string is dropped.

---

## 3. Transforms that are not 1:1

### 3.1 `id` → `slug` + `legacyId`

The existing ids already read like slugs, so they become the permalinks **verbatim**. Every
one already satisfies the `^[a-z0-9]+(?:-[a-z0-9]+)*$` rule in `02-DATA-MODEL.md`. No
normalisation, no lowercasing, no re-slugging — a changed slug is a broken URL forever
(`01-ARCHITECTURE.md §8.4`).

```
projects   hiro · salezo · autoresumebot · internal-tools
blogPosts  building-ai-powered-fastapi · designing-scalable-backend-systems
           lessons-from-autoresumebot · from-idea-to-production
experience tv-infosoft · eadmin · freelance        (legacyId only — no slug)
```

`legacyId` carries the same value. It is redundant with `slug` on day one and is not
redundant the moment Milan renames something from the admin — it is the rollback and parity
anchor.

### 3.2 `articles[].date` → `publishedAt`

`'12 Sep 2026'` is a display string. It becomes epoch milliseconds.

**Do not use `Date.parse()` or `new Date(str)`.** Both interpret a bare date in the runner's
local timezone, so a seed run in IST and a parity check run in UTC produce values 5h30m apart
and every date in the table is wrong by half a day. Parse explicitly to UTC midnight:

```js
const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
                 Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

function parseLegacyDate(s) {           // '12 Sep 2026'
  const [d, m, y] = s.split(' ');
  return Date.UTC(Number(y), MONTHS[m], Number(d));
}
```

Expected values are in the §2.3 table. They are load-bearing: the parity check asserts them
as constants, not by re-running the parser.

**P3 must format back.** `WritingSection.tsx:126` renders `{article.date}` raw. To stay
pixel-identical the read path has to produce `'12 Sep 2026'` again — zero-padded day, English
three-letter month, four-digit year, single spaces, formatted in **UTC**. A naïve
`toLocaleDateString()` gives `Sep 12, 2026` and changes the page.

### 3.3 `articles[].readTime` → `readTimeMinutes`

`'6 min read'` → `6`. Values: `6, 8, 5, 7`.

```js
const readTimeMinutes = Number(readTime.match(/^(\d+)/)[1]);
```

Do **not** recompute from the body at seed time. `02-DATA-MODEL.md` calls the field "derived
from body, admin-overridable" — deriving it now would change the displayed value (see §7.2:
the bodies are ~100 words each, nowhere near 6–8 minutes). Migration preserves; it does not
correct. P3 renders `${readTimeMinutes} min read`.

### 3.4 `tag` → `tags[]`, and `content[]` → `body`

```js
tags: [article.tag]                    // 'AI / LLMs' → ['AI / LLMs']
body: article.content.join('\n\n')     // paragraphs, blank line between
```

The join separator is a real `\n\n`, which is Markdown's paragraph break. No heading is
synthesised, no front matter is added, no trailing newline — `body` starts at the first
character of the first paragraph and ends at the last character of the last one. The `title`
column already holds the `h1`; putting one in the body too would double it on the post page.

Nothing in the four bodies contains a Markdown special character that needs escaping. There
are no code fences, no links and no lists — they are plain prose. Do not add any.

### 3.5 `image` → `imageUrl`

```
'/images/project-hiro.png'  →  imageUrl: '/images/project-hiro.png'
                               imageStorageId: undefined
```

The files stay exactly where they are, in `apps/web/public/images/`. All eight referenced
files exist today (four `project-*.png`, four `blog-*.png`), as does
`public/documents/Milan_Kumawat_Resume.pdf`.

`02-DATA-MODEL.md` §Conventions: readers prefer `imageStorageId` and fall back to `imageUrl`.
`imageStorageId` is populated **only** when Milan re-uploads through the admin media library
(P6B). P2 does not upload anything, does not touch `public/`, and does not create `media`
rows. Deleting the `public/images` files before every row has a `storageId` breaks the site.

### 3.6 Fields with no source

| Field | Seed value | Why |
|---|---|---|
| `status` | `"published"` | Everything on the live site today is public. Nothing is a draft. |
| `projects.featured` | `true` (all four) | `ProjectsSection` renders all four projects today. `api.projects.listFeatured` must return the same four or the home page loses a card — and `00-MASTER-PLAN.md §8` forbids that. Milan curates from the admin afterwards. |
| `blogPosts.featured` | `false` (all four) | Nothing renders a featured post, and `02-DATA-MODEL.md §blog.ts` has no `listFeatured`. `false` is inert and safe. |
| `order` | `10, 20, 30, …` | Sparse, in current array order, so a row can be dragged between two others without renumbering (`02-DATA-MODEL.md §Conventions`). |
| `visible` | `true` | `experience` and `skillCategories`. Everything is visible today. |
| `views` | `0` | No analytics existed. Starting anywhere else would be inventing a number. |
| `publishedAt` (projects) | `SEED_AT` | No per-project date exists in the source. Blog posts use their real parsed date. |
| `updatedAt` | `SEED_AT` | Every table carries it. |
| `seo` | `undefined` | Optional. P7 and the admin fill it. Do not synthesise titles from `title`. |

`SEED_AT` is **one constant captured once at the top of the seed**, not `Date.now()` called
per row. Identical timestamps across the import are what make the parity check's "did this
row come from the seed" question answerable.

### 3.7 `handwriting` — byte-for-byte, and a warning

`02-DATA-MODEL.md` is explicit: the handwriting strings contain literal `\n` escapes and must
migrate **byte-for-byte**. P2 does exactly that — copy the values, change nothing.

What P2 must also record, because P3 will trip over it:

**The `handwriting` object is not read by any component.** Verified:

```
grep -rn "handwriting\." apps/web/components/   →  no matches other than `font-handwriting`
```

All ten `<Handwriting>` call sites pass inline string literals, and the two remaining
handwritten blocks (`AboutSection.tsx:85-92` and `:127-133`) are hand-built `<div>` stacks
that do not use the component at all. The stored object is a stale mirror that drifted from
what renders.

Two concrete mismatches, both of which would change the page if P3 wired the field up naïvely:

1. **Escaping.** The file contains `\\n` — in the evaluated string that is a **backslash
   followed by `n`, two characters**, not a newline. `Handwriting.tsx` renders inside
   `whitespace-pre-line`, which breaks on real newlines only. Feeding the stored value
   straight in prints a literal `\n` on screen. The call sites pass real `"\n"`.
2. **Content drift.** Several stored values use spaces where the page breaks lines.

| Key | Stored (evaluated) | Rendered on the page | Match? |
|---|---|---|---|
| `aboutPhoto` | `_Same Curiosity\nDifferent Problems` | `_Same` / `Curiosity` / `Different` / `Problems` (4 lines, `AboutSection.tsx:85`) | ✗ |
| `aboutBottom` | `Let's Build What's Next.` | `Let's` / `Build` / `What's` / `Next.` (`:191`) | ✗ |
| `projects` | `Build Ship Improve Repeat.` | same, one line (`ProjectsSection.tsx:43`) | ✓ |
| `skillsPhoto` | `Same\nCuriosity\nDifferent\nTools` | same 4 lines (`SkillsSection.tsx:52`) | ✓ |
| `skillsBottom` | `Build Learn Improve Repeat.` | same, one line (`SkillsSection.tsx:166`) | ✓ |
| `experienceLeft` | `Better\nSystems\nBrighter\nTomorrow.` | same 4 lines (`ExperienceSection.tsx:69`) | ✓ |
| `experienceRight` | `Good\nPeople\nGreat\nProducts.` | same 4 lines (`ExperienceSection.tsx:167`) | ✓ |
| `howIBuildTop` | `Ideas Code Deploy Impact` | `Ideas` / `Code` / `Deploy` / `Impact` (`:71`) | ✗ |
| `howIBuildBottom` | `Build Learn Improve Repeat.` | `Build` / `Learn` / `Improve` / `Repeat.` (`:210`) | ✗ |
| `writingTop` | `Better Ideas Through Writing.` | `Better` / `Ideas` / `Through` / `Writing.` (`:54`) | ✗ |
| `contactTop` | `Good Ideas Lead to Great Things.` | `Good` / `Ideas` / `Lead to` / `Great` / `Things.` (`:78`) | ✗ |
| `footer` | `Keep Building.` | **nothing — `Footer.tsx` renders no handwriting** | ✗ |

There is also a rendered block with **no key at all**: the `Good / Code / Better / Products`
sticky note at `AboutSection.tsx:127-133`.

**P2's action:** seed verbatim per the contract, and file a cross-phase note in `STATUS.md`
addressed to P3 pointing at this table. **P3's action:** do not wire `siteSettings.handwriting`
into the components until the values are reconciled — doing so visibly changes seven
annotations and violates the pixel-identical rule. Reconciliation is a content decision for
Milan (§7.5), not a migration one.

### 3.8 Other stored-but-unread fields

Same class of problem as §3.7, smaller blast radius. Each of these is in the source, will be
in the database, and is **not read by any component today** because the component hardcodes an
equivalent literal. When P3 switches the read path, each one goes live.

| Field | Hardcoded instead at | Stored value matches what renders? |
|---|---|---|
| `personal.name` | `HeroSection.tsx:63-64` (`Milan` / `Kumawat`, split across two spans) | yes, after the split |
| `personal.role` | `HeroSection.tsx:58` | yes |
| `personal.subheadline` | `HeroSection.tsx:69` | yes |
| `personal.location` | `HeroSection.tsx:150`, `AboutSection.tsx:122` | yes |
| `personal.headline` | nothing renders it | n/a — duplicate of `name` |
| `personal.resumeUrl` | `ResumeModal.tsx` uses a literal path | yes |
| `personal.linkedin` / `personal.github` | display forms, only `contactCards` renders them | yes |
| `quotes.howIBuild` | `HowIBuildSection.tsx:84`, with a `<br />` mid-sentence | yes, modulo the `<br />` |
| `quotes.contact` | `ContactSection.tsx:163`, with a `<br />` mid-sentence | yes, modulo the `<br />` |
| `experience[].period` | `ExperienceSection.tsx:86-90` hardcodes `2025 – Present` / `2024 – 2025`; the card shows `badge` | yes |
| `experience[].timeframe` | same | yes |
| `contactCards[].copyable` | `ContactSection` does not branch on it | n/a — stored, inert |

The four `quotes` keys that *are* read (`about`, `skills`, `experience`, `writing`) come
through `personal.quotes.*` and are fine.

Migrate all of it. The list exists so P3 knows where the landmines are and so the visual
parity check in §6.2 knows what to look at.

---

## 4. The seed mechanism

### Shape

```
packages/backend/convex/internal/seed.ts
  export const importLegacy = internalMutation({ args: {}, handler: … })
```

Referenced as `internal.seed.importLegacy` per `02-DATA-MODEL.md`. P2 must confirm the
generated reference path — a module at `convex/internal/seed.ts` may surface under a nested
namespace depending on how the directory is laid out. **If the generated identifier differs,
record it in `STATUS.md`; do not rename the contract.**

### Getting the data into the Convex bundle

Preferred: `seed.ts` imports the object directly.

```ts
import { PORTFOLIO_DATA } from '../../../../apps/web/data/portfolioData'
```

It is plain, isomorphic data — no DOM, no Node built-ins — so it bundles cleanly. If Convex's
bundler rejects a relative import that escapes the convex root, fall back to generating
`packages/backend/convex/internal/legacyData.ts` from `portfolioData.ts` with a small
committed script, and say so in `STATUS.md`. Do **not** hand-copy 540 lines; a hand copy
drifts and the parity check in §5 would then be checking a copy against itself.

### Idempotency

The mutation is re-runnable. Every row is looked up before it is written, and the key differs
per table because the schema differs:

| Table | Lookup key | Index |
|---|---|---|
| `projects` | `legacyId` (equal to `slug`) | `by_slug` |
| `blogPosts` | `legacyId` (equal to `slug`) | `by_slug` |
| `experience` | `legacyId` | full scan — 3 rows, no index needed |
| `skillCategories` | `title` — **no `legacyId` in the schema** (§2.5) | full scan — 6 rows |
| `siteSettings` | `key === "main"` | `by_key` |

Found → `patch`. Not found → `insert`. Never `replace`, or a second run wipes any admin edit
made in a field the seed does not set.

Two fields are **insert-only** and must not be patched on a re-run, because overwriting them
would destroy real data:

- `blogPosts.views` — set on insert, left alone afterwards.
- `publishedAt` — set on insert; a post Milan later unpublished and republished has a real
  date the seed must not stamp over.

### Invoking it

```bash
cd packages/backend

# dev deployment
npx convex run internal/seed:importLegacy '{}'

# production — deliberate, and only after the dev run has passed §5
npx convex run internal/seed:importLegacy '{}' --prod
```

Expected output on a clean deployment: 4 projects, 4 blogPosts, 3 experience,
6 skillCategories, 1 siteSettings. On a second run: 0 inserts, 18 patches.

The mutation returns a counts object (`{ inserted, patched }` per table) so the run is
self-reporting and the parity check has something to assert against.

---

## 5. Parity verification

### 5.1 `scripts/parity-check.mjs`

Owned by P2 (`08-PLAYBOOK.md §2`). It reads both sides and diffs them field by field.

```bash
npx tsx scripts/parity-check.mjs              # against the dev deployment
CONVEX_URL=<prod url> npx tsx scripts/parity-check.mjs
```

`tsx` is used because the script imports a `.ts` file. `node --experimental-strip-types` works
too — `portfolioData.ts` contains only erasable syntax (`interface`, `as X[]`) — pick one and
put it in `package.json` as `"parity": "…"`.

**What it does:**

1. Imports `PORTFOLIO_DATA` from `apps/web/data/portfolioData.ts`.
2. Reads Convex through the **public** queries with a `ConvexHttpClient` — no auth needed,
   because everything seeds as `published` / `visible`:
   - `api.projects.listPublished`
   - `api.blog.listPublished`
   - `api.experience.listVisible`
   - `api.skills.listVisible`
   - `api.siteSettings.get`
3. Joins by `legacyId` (by `title` for `skillCategories`, by the singleton for `siteSettings`).
4. Compares **byte-for-byte**. No trimming, no case folding, no Unicode normalisation — the
   source has typographic apostrophes (`I'm`), en dashes (`May 2025 – Present`) and an emoji
   (`🎓`), and all three must survive intact. A trim would hide exactly the bug it exists to
   catch.
5. For derived fields it asserts the expected *computed* value from the §2.3 table, not the
   raw source string — `publishedAt === 1789171200000`, not `publishedAt === '12 Sep 2026'`.
6. Prints one line per mismatch as `table/key/field: source ≠ convex` and exits `1`. Exits `0`
   and prints the counts table on a clean run.

**Checksums it asserts** (the cheap tripwire — a wrong `.map()` shows up here first):

| Assertion | Expected |
|---|---:|
| `projects` rows | 4 |
| `blogPosts` rows | 4 |
| `experience` rows | 3 |
| `skillCategories` rows | 6 |
| skills across all categories | 36 |
| `siteSettings` rows | 1 |
| `stats` / `heroTechStack` / `aboutPillars` / `whatIWorkOn` | 3 / 8 / 3 / 4 |
| `quotes` keys / `handwriting` keys | 6 / 12 |
| `howIBuildSteps` / `howIBuildPillars` / `contactCards` | 5 / 4 / 4 |
| project `keyFeatures` / `architecture` / `stats` totals | 20 / 17 / 12 |
| experience `points` / `tags` totals | 12 / 15 |
| article body paragraphs (`body.split('\n\n').length`) | 4 / 4 / 4 / 3 |

### 5.2 Visual check

P2 changes no rendering code, so the page during P2 is byte-identical by construction. The
visual check is defined here so **P3 runs this exact procedure** as its own gate.

1. `git stash` any working changes, check out `c753fe9`, `npm run dev`, and capture
   full-page screenshots at 1440px and 390px of `/` — all eight sections — plus the three
   surviving modals and `/404`.
2. Return to the branch, run the seed, `npm run dev`, capture the same set.
3. Diff the pairs. **Zero pixel difference** outside font-rendering noise.
4. Spot-check the transforms by eye, because they are the ones that can pass a byte diff and
   still be wrong on screen:
   - `12 Sep 2026` on the Writing cards — not `Sep 12, 2026`, not `2026-09-12`
   - project card order: Hiro, Salezo, AutoResumeBot, Internal Tools
   - blog order: newest first
   - experience order and the three logo chips (`TV`, `eA`, `🎓`) with their backgrounds
   - all six skill categories, six skills each
   - every handwritten annotation reads as it did — see §3.7

### 5.3 Pass criteria

All five, no exceptions:

1. `scripts/parity-check.mjs` exits `0` with zero mismatches.
2. Every checksum in §5.1 matches.
3. Running the seed a second time reports `0 inserted` and leaves row counts unchanged.
4. `npm run build` passes from the repo root and `npx tsc --noEmit` passes.
5. §5.2 produces zero visual difference (P3's gate; P2 records the baseline screenshots).

Anything less is not a pass. `00-MASTER-PLAN.md §7` — four of five is not done.

---

## 6. Rollback

### `data/portfolioData.ts` is not deleted in P2

`08-PLAYBOOK.md §2` gives P2 ownership of `seed.ts` and `parity-check.mjs` only, and says it
**reads** `portfolioData.ts` and does not delete or edit it. That is deliberate, not an
oversight:

- It is the **seed source of record**. Re-pointing at a fresh Convex deployment and re-running
  the seed must reproduce the site exactly. Delete the file and that stops being possible.
- It is the **fallback**. Until P3 is verified in production, reverting the read path is a
  one-commit operation only while the file still exists.
- It is the **parity check's left-hand side**. Delete it and §5 has nothing to compare against.

### When it is safe to delete

All of these, in order:

1. P3 is `✅ Done` in `STATUS.md`.
2. `apps/web` is deployed to `milankumawat.in` with the Convex read path live.
3. All eight home-page sections render from Convex in production — verified in a browser, on
   the production domain, not on a preview URL.
4. `parity-check.mjs` passes against the **production** Convex deployment.
5. P7's launch QA is green.
6. Milan has made at least one successful edit through the admin and seen it appear on the
   site. Until that round-trip works, the file is the only way content gets fixed.

Then, and only then: delete it in **its own commit**, in **P7**, with the content of the file
recoverable from git history. Tag the commit before it (`pre-content-delete`) so a restore is
`git checkout <tag> -- apps/web/data/portfolioData.ts`.

After the first real admin edit the file is stale — it is history, not a fallback. That is the
real deadline, and it is why step 6 is last.

**P2 must not delete it.** Neither must P3. If either is tempted, that is a cross-phase
request (`08-PLAYBOOK.md §4`), and the answer is no.

---

## 7. Open questions for Milan

These are things in the current data that look like placeholders. Once seeded they become
"real" database rows with permanent URLs and an RSS feed pointing at them. Confirm before
P2 runs, or accept that they ship and get corrected from the admin afterwards.

- [ ] **7.1 — Every project `liveUrl` is a placeholder.** All four point at `example.com`:
      `https://hiro-hire.example.com`, `https://salezo.example.com`,
      `https://autoresumebot.example.com`, `https://tools.example.com`. Today they are buttons
      on a modal; after P4A they are "View Live" links on an indexable, shareable permalink
      page. Per project: a real URL, or remove the link, or mark it private/NDA. The schema
      has `liveUrl` as `v.optional(v.string())`, so omitting it is supported — but
      `ProjectModal.tsx` renders the button unconditionally today, so dropping the field is a
      P4A component change as well as a data one.

- [ ] **7.2 — The article bodies do not match their stated read times.** Word counts are
      approximately **106 / 100 / 109 / 85**, labelled **6 / 8 / 5 / 7 minutes**. Roughly 100
      words is well under a minute. In a card teaser nobody notices; on a full `/blog/[slug]`
      page with the read time in the header it is obvious. Are these stubs to be replaced
      before the blog goes live, or should `readTimeMinutes` be corrected to match?

- [ ] **7.3 — Do the four GitHub URLs resolve, and are the repos public?**
      `github.com/milankumawat/hiro-ai`, `/salezo-outreach`, `/autoresumebot`,
      `/internal-tools-suite`. Several describe employer work at True Value Infosoft — check
      that publishing the repo link is allowed. Also confirm the three profile URLs:
      `github.com/milankumawat`, `linkedin.com/in/milankumawat`, `x.com/milankumawat`.

- [ ] **7.4 — Are the four article dates real publication dates?** `12 Sep 2026`,
      `05 Sep 2026`, `28 Aug 2026`, `18 Aug 2026` — evenly spaced and all recent. They become
      `publishedAt`, which orders `/blog`, fills `<time>` in the metadata and drives the RSS
      feed's `pubDate`. Changing one later reorders the index.

- [ ] **7.5 — The handwriting annotations need reconciling.** Seven of the twelve stored
      values differ from what the page renders, one (`footer`) renders nowhere, and one
      rendered annotation has no stored key (§3.7). Pick the authoritative wording and line
      breaks for each, so P3 can wire the field up without changing the page.

- [ ] **7.6 — Which projects should be featured?** Seeded as all four to preserve the current
      home page. Once `/projects` exists (P4A), the home page can show a curated subset.

- [ ] **7.7 — The footer newsletter form is fake.** `Footer.tsx:30-38` sets local state,
      shows "Subscribed!", and discards the email — the same problem as the contact form,
      which P4C fixes. There is **no `subscribers` table in `02-DATA-MODEL.md` and no phase
      owns it.** Either it gets a table and a mutation (a schema change against a frozen
      contract, so it needs a decision now), or the form comes out. Leaving it is collecting
      addresses into `/dev/null`.

- [ ] **7.8 — Two small factual items in `Footer.tsx`.** Neither migrates — both are
      hardcoded JSX, not data — but they are content and this is the content register.
      "Built with Next.js, Three.js and a lot of ☕" names Three.js, which is not a dependency.
      And `© 2026` is a literal that will be wrong on 1 Jan.
