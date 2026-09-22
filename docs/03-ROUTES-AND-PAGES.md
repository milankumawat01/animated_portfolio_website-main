# Routes & Pages

> What exists at every URL after the build, what fetches its data, what invalidates it, and
> which phase builds it. `01-ARCHITECTURE.md §3` sets the rendering strategy and `§7` the
> Next.js 16 traps — this document is the route-level application of both. Function names
> come from `02-DATA-MODEL.md` and are frozen.

Today there are exactly two routes: `/` (one `'use client'` component, 8 sections, 4 modals)
and the global `not-found`. Everything below is new except where it says otherwise.

---

## 1. Sitemap

All paths are relative to `apps/web/app/` after the P0 monorepo move.

| Route | File | Rendering | Convex data | Cache tag | Phase | In `sitemap.xml` |
|---|---|---|---|---|---|---|
| `/` | `page.tsx` | Static, `'use cache'` | `siteSettings.get`, `projects.listPublished`, `blog.listPublished`, `experience.listVisible`, `skills.listVisible` | `home` | **P3** | yes — priority 1.0 |
| `/projects` | `projects/page.tsx` | Static, `'use cache'` | `projects.listPublished` | `projects` | **P4A** | yes |
| `/projects/[slug]` | `projects/[slug]/page.tsx` | Static + `generateStaticParams` | `projects.bySlug` | `project:<slug>` | **P4A** | yes — one entry per published project |
| `/blog` | `blog/page.tsx` | Static, `'use cache'` | `blog.listPublished`, `blog.listTags` | `blog` | **P4B** | yes |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | Static + `generateStaticParams` | `blog.bySlug` | `post:<slug>` | **P4B** | yes — one entry per published post |
| `/feed.xml` | `feed.xml/route.ts` | Route handler, body from a cached helper | `blog.listPublished` (limit 20) | `blog` | **P4B** | no — linked via `<link rel="alternate">` |
| `/api/revalidate` | `api/revalidate/route.ts` | Route handler, always dynamic | none | — | **P7** | no — and `Disallow`ed in robots |
| `/sitemap.xml` | `sitemap.ts` | Generated, cached | `projects.listPublished`, `blog.listPublished` | `projects` + `blog` | **P7** | n/a |
| `/robots.txt` | `robots.ts` | Static | none | — | **P7** | n/a |
| not-found | `not-found.tsx` | Static, exists today | none | — | exists; P7 adds links | no |

Notes on the table:

- **Nothing is server-rendered per request.** Every content route is static and invalidated by
  tag. The only dynamic handler is `/api/revalidate`.
- **`/sitemap.xml` carries two tags.** `cacheTag('projects', 'blog')` — publishing either kind
  of content regenerates it without a separate tag.
- **The admin app has no routes here.** `apps/admin` is a different Vercel project on
  `admin.milankumawat.in` with its own `robots.txt` (`Disallow: /`). It never appears in the
  public sitemap and shares no route table with the public site.
- **`/contact` does not exist.** Contact stays a modal plus the `#contact` section (P4C). The
  `leads.source` union in `02-DATA-MODEL.md` already reserves `"contact-page"` for the day
  that changes; nothing in this build uses it.

### Cache lifetime, and the P7 gap

`/api/revalidate` is owned by P7 but needed by P3/P4A/P4B. Until it exists, those phases ship
`cacheLife('hours')` so stale content self-heals within the day. **P7 flips every cached
helper to `cacheLife('max')` in one pass** once on-demand revalidation is live. Do not invent
the route handler early — `08-PLAYBOOK.md §2` is explicit about the ownership.

---

## 2. Page specs

### 2.0 Where the data helpers live

Every page fetches through `apps/web/lib/convex.ts` (created by P3, extended by P4A/P4B).
That file is the only place `fetchQuery` is called, and therefore the only place the
`'use cache'` wrapper and the tag names live.

```ts
// apps/web/lib/convex.ts
import { fetchQuery } from 'convex/nextjs'
import { api } from '@portfolio/backend/convex/_generated/api'
import { cacheTag, cacheLife } from 'next/cache'

export async function getHomeData() {
  'use cache'
  cacheTag('home')
  cacheLife('max')                       // 'hours' until P7 ships /api/revalidate
  const [settings, projects, posts, experience, skills] = await Promise.all([
    fetchQuery(api.siteSettings.get, {}),
    fetchQuery(api.projects.listPublished, {}),
    fetchQuery(api.blog.listPublished, { limit: 4 }),
    fetchQuery(api.experience.listVisible, {}),
    fetchQuery(api.skills.listVisible, {}),
  ])
  return { settings, projects, posts, experience, skills }
}
```

Three rules that are not optional:

1. **The wrapper is what makes the page static.** `fetchQuery` sets `cache: "no-store"`
   internally (`01-ARCHITECTURE.md §3`), so an unwrapped `await fetchQuery` in a Server
   Component makes that page dynamic. `'use cache'` caches the *return value*, which makes the
   inner fetch irrelevant.
2. **`ConvexHttpClient` is stateless — five `fetchQuery` calls are five snapshots.** For the
   home page that is fine: nothing on it has to agree with anything else. If two values ever
   must be consistent, add one Convex query that returns both, not a sixth fetch.
3. **Props crossing into a client component must be plain JSON.** Convex documents already
   are. Never pass a `Date`, a function, or a class instance across the boundary.

### 2.1 `/` — home

**Blocks, in render order** (unchanged from `app/page.tsx` today):

| # | Component | Section id | Data it needs |
|---|---|---|---|
| — | `Navbar` | — | nothing (links are static) |
| 01 | `HeroSection` | `home` | `settings.personal`, `settings.stats`, `settings.heroTechStack` |
| 02 | `AboutSection` | `about` | `settings.personal.bio`, `aboutPillars`, `whatIWorkOn`, `quotes.about`, `handwriting.*` |
| 03 | `ProjectsSection` | `projects` | `projects[]` |
| 04 | `ExperienceSection` | `experience` | `experience[]`, `quotes.experience` |
| 05 | `SkillsSection` | `skills` | `skills[]`, `quotes.skills` |
| 06 | `HowIBuildSection` | `how-i-build` | `howIBuildSteps`, `howIBuildPillars`, `quotes.howIBuild` |
| 07 | `WritingSection` | `writing` | `posts[]` (4 newest), `quotes.writing` |
| 08 | `ContactSection` | `contact` | `contactCards`, `quotes.contact` |
| — | `Footer` | — | `settings.personal` (social URLs) |
| — | `ContactModal` · `ProjectModal` · `ResumeModal` | — | client state, see §4 |

**Queries:** one call to `getHomeData()`. No page-level `fetchQuery`.

**`generateStaticParams`:** n/a — not a dynamic segment.

**`generateMetadata`:**

```ts
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getHomeData()
  const p = settings?.personal
  return {
    title: p ? `${p.name} | ${p.role}` : 'Milan Kumawat',
    description: p?.subheadline,
    alternates: { canonical: '/' },
    openGraph: { type: 'website', url: '/', title: …, description: …, images: ['/opengraph-image'] },
  }
}
```

`app/layout.tsx` keeps `metadataBase`, the title template, the font `<link>`s and the icons.
It stops hardcoding the home page's title and description — those move to `generateMetadata`
so the admin can change them.

**States:**

| State | Behaviour |
|---|---|
| Empty | `/` **never** calls `notFound()`. If `siteSettings.get` returns `null` (pre-seed, or a wiped dev deployment) the page still renders: every section takes optional data, arrays default to `[]`, and a section whose collection is empty renders its header and skips its grid. |
| Loading | None. The page is static; the HTML ships with content in it. No `loading.tsx`. |
| Error | A Convex outage at build time fails the build, which is the correct loud failure. At request time the cached HTML keeps serving. P7 adds `app/error.tsx` / `app/global-error.tsx`. |
| 404 | Impossible — `/` always resolves. |

### 2.2 `/projects` — index

**Blocks:** page header (eyebrow `PROJECTS`, title, description, reusing `ui/SectionHeader`) →
project grid, every card a `<Link href={'/projects/' + slug}>` → contact CTA linking to
`/#contact` → `Footer`. `Navbar` and `Footer` come from the shared shell (§3).

**Queries:** `getProjects()` → `fetchQuery(api.projects.listPublished, {})`, `cacheTag('projects')`.

**`generateMetadata`:** static object — `title: 'Projects'` (the layout template appends the
name), description from copy, `alternates: { canonical: '/projects' }`.

**States:** empty list renders a single line — "No projects published yet." — and still shows
the CTA. Never 404s: `/projects` is a real page even with zero rows. No loading state.

### 2.3 `/projects/[slug]` — case study

**Blocks:** breadcrumb (`Home / Projects / <title>`) → title + `subtitle` → banner image →
tag row → **Overview** (`longDescription`) → **Key Features** (`keyFeatures`) → **Technical
Architecture** (`architecture`) → **Stats** (`stats`) → actions (`liveUrl`, `githubUrl`) →
"Back to all projects" → contact CTA.

That is the `ProjectModal` content, unrolled onto a page. Same fields, same order — the modal
stays the quick look, this is the linkable version.

**Queries:**

```ts
export async function getProject(slug: string) {
  'use cache'
  cacheTag(`project:${slug}`)
  cacheLife('max')
  return fetchQuery(api.projects.bySlug, { slug })
}
```

**`generateStaticParams`:**

```ts
export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ slug: p.slug }))
}
```

**`generateMetadata`:**

```ts
export async function generateMetadata(
  { params }: PageProps<'/projects/[slug]'>,
): Promise<Metadata> {
  const { slug } = await params                    // params is a Promise in 16
  const project = await getProject(slug)
  if (!project) return { title: 'Project not found', robots: { index: false } }
  return {
    title: project.seo?.title ?? project.title,
    description: project.seo?.description ?? project.description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { type: 'article', url: `/projects/${slug}`, images: [ogFor(project)] },
  }
}
```

`generateMetadata` **returns** a metadata object for a missing project; it does not call
`notFound()`. The page does that, once.

**States:**

| State | Behaviour |
|---|---|
| 404 | `bySlug` returns `null` → `notFound()`. Drafts are filtered inside the query (`02-DATA-MODEL.md`), so a draft slug is indistinguishable from a typo, which is exactly what we want — an unpublished case study must not be discoverable by guessing. |
| Empty fields | `stats`, `architecture`, `liveUrl` and `githubUrl` are optional or can be empty arrays. Each block renders only when its array has length; the action buttons render only for the URLs that exist. `ProjectModal` already guards `architecture` and `stats` — mirror that. |
| Loading | None for known slugs. An unknown slug that was not in `generateStaticParams` renders on demand, hits `notFound()`, and gets a 404 — no spinner. |
| Error | Bubbles to `app/error.tsx` (P7). |

### 2.4 `/blog` — index

**Blocks:** header (eyebrow `WRITING`, title, description) → tag filter chips → post grid
(cover, tag, date, title, excerpt, "N min read"), every card a `<Link href={'/blog/' + slug}>`
→ RSS link → contact CTA.

**Queries:** `getPosts()` → `fetchQuery(api.blog.listPublished, {})` with `cacheTag('blog')`,
plus `fetchQuery(api.blog.listTags, {})` inside the same cached helper.

**Tag filtering — a decision worth stating.** The URL contract is `/blog?tag=ai-llms`. Reading
`searchParams` in a Server Component makes the route dynamic, which costs us the static page
for a filter over four posts. So: **the page fetches the full published list statically and a
thin client component filters it from `useSearchParams()`.** The `tag` argument on
`blog.listPublished` stays in the frozen contract and is used by `/feed.xml` and the admin —
this changes no signature. Revisit when the post count passes ~50, at which point `/blog`
becomes paginated and the filter moves back into the query.

**`generateMetadata`:** static — `title: 'Blog'`, `alternates: { canonical: '/blog' }`,
`alternates.types: { 'application/rss+xml': '/feed.xml' }`.

**States:** empty list renders "Nothing published yet." and keeps the RSS link. A `?tag=` that
matches nothing renders "No posts tagged <tag>" plus a "clear filter" link — it is **not** a
404, because the tag list is data and a stale bookmark is not an error.

### 2.5 `/blog/[slug]` — post

**Blocks:** breadcrumb → title → meta row (formatted `publishedAt`, `readTimeMinutes`, tags) →
cover image → Markdown body, rendered **server-side** with syntax highlighting
(`components/markdown/**`, P4B) → author card → share → prev/next post → "Back to the blog" →
contact CTA.

**Queries:**

```ts
export async function getPost(slug: string) {
  'use cache'
  cacheTag(`post:${slug}`)
  cacheLife('max')
  return fetchQuery(api.blog.bySlug, { slug })
}
```

**`generateStaticParams`:** `(await getPosts()).map((p) => ({ slug: p.slug }))`.

**`generateMetadata`:** same shape as §2.3 with `openGraph.type: 'article'`,
`publishedTime: new Date(post.publishedAt).toISOString()`, `modifiedTime` from `updatedAt`,
`authors`, and `keywords: post.tags`.

**States:**

| State | Behaviour |
|---|---|
| 404 | **`bySlug` returns `null` → `notFound()`, always.** `status: "published"` is filtered inside the Convex query, so a draft post returns `null` exactly like a missing one. If the component ever filtered drafts itself, an unpublished draft would be one URL guess away. It does not. |
| Empty body | A published post with an empty `body` renders title, meta and cover, and nothing else. Do not special-case it — it is a content bug, visible in the admin. |
| Loading | None. Static. |
| Error | Markdown that fails to render must not take the page down — the renderer falls back to escaped plain text. |

**`views`.** `blog.incrementViews` is a public fire-and-forget mutation called from a tiny
`'use client'` effect on mount. It **must not** touch the cache (see §6) — a view counter that
revalidates the page would invalidate the post on every read.

**Date formatting is a hydration trap.** `publishedAt` is epoch ms; `readTimeMinutes` is a
number. Format both in one shared helper with an explicit `timeZone: 'UTC'` and a fixed
locale, or the server and the visitor's browser will disagree and React will scream. The
legacy strings (`'12 Sep 2026'`, `'6 min read'`) are gone — see `06-CONTENT-MIGRATION.md`.

### 2.6 `/feed.xml`

`apps/web/app/feed.xml/route.ts`, `GET` only, `Content-Type: application/rss+xml; charset=utf-8`.

- 20 newest published posts, from the same cached helper as `/blog` — so it carries the `blog`
  tag and refreshes with the index.
- Per item: `title`, `link` (absolute, from `NEXT_PUBLIC_SITE_URL`), `guid` (= link,
  `isPermaLink="true"`), `description` (= `excerpt`), `pubDate`
  (`new Date(publishedAt).toUTCString()`), one `<category>` per tag.
- **Escape everything.** Titles and excerpts are admin-authored free text; an unescaped `&`
  makes the feed invalid XML.
- Linked from every page's `<head>` via `alternates.types` in the root layout.

### 2.7 `/api/revalidate`

The only dynamic route on the public site. Full contract in §6.

### 2.8 `not-found`

`app/not-found.tsx` exists today and needs no structural change: it is a standalone dark
screen with no `Navbar` and no `Footer`, which means it is immune to the routing-shell problem
in §3. It renders for `notFound()` from `/projects/[slug]` and `/blog/[slug]`, and for any
unmatched URL.

**P7 adds two links** beside "Return to Portfolio" — "Browse projects" (`/projects`) and "Read
the blog" (`/blog`) — because by then a 404 is most likely a stale post URL, and the useful
next step is the index, not the home page. No per-segment `not-found.tsx` files: one 404
screen, one place to change it.

The 404 status code comes from `notFound()` being called in the **page**. Calling it only in
`generateMetadata` renders the page body with a 200.

---

## 3. The routing shell problem

### 3.1 What breaks the moment a second route exists

`components/Navbar.tsx` today:

- Five nav items, **all raw hash anchors** — `#home`, `#about`, `#projects`, `#writing`,
  `#contact` (`Navbar.tsx:16-22`). On `/blog`, `href="#about"` resolves to `/blog#about`,
  which scrolls nowhere.
- The logo is `<Link href="#home">` (`Navbar.tsx:64`) — on `/blog` it is a dead link. It should
  be the site-home link.
- A scroll-spy over **eight** section ids — `home, about, projects, experience, skills,
  how-i-build, writing, contact` (`Navbar.tsx:36`) — that runs on every scroll event
  regardless of route. On `/blog` none of those elements exist, the loop matches nothing, and
  `activeSection` **keeps whatever it had** (initial `'home'`), so the Home dot stays lit
  forever. The spy has no "nothing is active" branch.
- The `scrolled` flag is derived from `#home`'s bounding rect, with `window.scrollY > 100` as
  the fallback (`Navbar.tsx:27-33`). The fallback works, but it means **the navbar renders its
  transparent variant — white text, no background — for the first 100px of `/blog`**, on top of
  a white page. That is the failure nobody notices until it ships: the header is invisible.

`components/Footer.tsx:18-25` has its own six-item hash list, including `#experience`, which
the navbar does not have. Same breakage, plus a second copy of the link list to keep in sync.

**Owner: P3.** Both files are in P3's ownership map, and this must land *before* P4A/P4B add
routes for the shell to break on.

### 3.2 The link model

One rule, applied in both components:

```ts
const pathname = usePathname()
const isHome = pathname === '/'
const anchor = (id: string) => (isHome ? `#${id}` : `/#${id}`)
```

Navbar after P3:

| Label | Href | Why |
|---|---|---|
| Home | `isHome ? '#home' : '/'` | Off-home, "Home" means the home page, not a fragment of it. |
| About | `anchor('about')` | Section anchor. |
| Projects | `anchor('projects')` | The home Projects section is the full showcase; `/projects` is reached from its "View all" (§5). |
| **Blog** | `/blog` — **always a route** | Renamed from "Writing". The home Writing section is a four-card teaser; the blog index is the real destination and must be one click from every page and crawlable as a plain `href`. The `#writing` section stays reachable by scrolling and from the footer. |
| Contact | `anchor('contact')` | Section anchor. |
| Let's Talk | button, opens `ContactModal` | On non-home routes the modal is not mounted (§4) — the button becomes a `<Link href="/#contact">` off-home. |

Use `next/link` for every item, including the pure-hash ones. `Link` handles a same-route
hash and a cross-route `/#id` identically, and off-home it prefetches.

`html { scroll-smooth }` in `app/layout.tsx` already gives the scroll animation for both cases.
A `/#about` navigation from `/blog` lands at the top and then jumps to the anchor; that is
Next's behaviour and it is acceptable. Do not try to hand-roll a scroll-restore.

### 3.3 The scroll-spy, off-home

The effect must not run at all when there are no sections to spy on:

```ts
useEffect(() => {
  if (!isHome) {
    setScrolled(true)        // solid header from the first paint — see §3.1
    setActiveSection('')     // nothing is active
    return                   // no listener attached, nothing to clean up
  }
  const handleScroll = () => { /* unchanged */ }
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  return () => window.removeEventListener('scroll', handleScroll)
}, [isHome])
```

Then derive the active item instead of reading `activeSection` directly:

```ts
const activeId = isHome
  ? activeSection
  : pathname.startsWith('/blog') ? 'blog'
  : pathname.startsWith('/projects') ? 'projects'
  : ''
```

So `/blog` and `/blog/anything` light the Blog dot, `/projects/*` lights Projects, and nothing
else lights anything. Two more small fixes while in the file:

- **`setScrolled(true)` off-home is mandatory, not cosmetic.** The transparent variant exists
  only to sit over the dark hero; on a light page it is white-on-white.
- **Close the mobile drawer on route change** — `useEffect(() => setMobileMenuOpen(false), [pathname])`.
  The existing per-link `onClick` handles clicks but not the browser back button.

### 3.4 Footer

Same `anchor()` rule for the six existing items. The NAVIGATION column additionally gains
**All Projects** (`/projects`) and **Blog** (`/blog`).

The footer is the right place for the complete link list: it is a vertical list where two more
items cost nothing, it appears on every page, and it gives a crawler a path to both index
routes from anywhere on the site.

While in the file: the newsletter form (`Footer.tsx:27-36`) is theatre in the same way the
contact form is — it sets `'subscribed'` and throws the address away. It is **out of scope for
this build**. Leave it exactly as it is; do not quietly wire it to `leads`. A newsletter is a
different product decision and a different table.

### 3.5 Sanctioned visual changes

`00-MASTER-PLAN.md §8` forbids visual changes outside the phase that owns them, "unless the
phase brief explicitly says otherwise". This document is where it says otherwise. Exactly four
changes are approved, and nothing else:

| Change | File | Phase |
|---|---|---|
| Nav item "Writing" → "Blog", pointing at `/blog` | `Navbar.tsx` | P3 |
| Footer NAVIGATION gains "All Projects" and "Blog" | `Footer.tsx` | P3 |
| Projects section bottom bar gains "View all projects →" | `ProjectsSection.tsx` | P4A |
| `ProjectModal` gains "Full case study →" | `modals/ProjectModal.tsx` | P4A |

Everything else on the home page must stay pixel-identical through P3 and Wave 3.

---

## 4. The home page client boundary

### Today

`app/page.tsx` is `'use client'` and holds four `useState` hooks — `isContactOpen`,
`isResumeOpen`, `selectedProject`, `selectedArticle` — which is why the entire page, every
section and all of `portfolioData.ts` ships to the browser.

### Target

```
app/page.tsx                    async Server Component
  ├─ getHomeData()              cached, tag: home
  ├─ generateMetadata()         from settings
  └─ <HomeClient data={…} />

components/HomeClient.tsx       'use client' — owns modal state only
  ├─ <Navbar onOpenContact={…} />
  ├─ the eight sections, each receiving its slice of `data` as props
  ├─ <Footer … />
  ├─ <CustomCursor />
  └─ <ContactModal /> <ProjectModal /> <ResumeModal />       ← three, not four
```

`HomeClient.tsx` is **thin**: state, handlers, and the same JSX tree `page.tsx` has today. It
contains no markup of its own and no data logic. The eight section components keep their
current markup verbatim; only their data source changes, from
`const { … } = PORTFOLIO_DATA` to `props`.

**Why one boundary at the top instead of per-section islands.** Four different components open
the contact modal — `Navbar`, `HeroSection`, `ContactSection` and `Footer`. Lifting that state
anywhere lower means prop-drilling it back up or adding a context. One client component
wrapping the tree is the smallest change that leaves the rendered markup identical, and the
sections stay `'use client'` anyway because they use `useRef`, `framer-motion` and
`canvas-confetti`.

### `ArticleModal` — removed in P3, deleted in P4B

`08-PLAYBOOK.md §2`: all three Wave 3 phases need `page.tsx` to stop importing `ArticleModal`,
and no Wave 3 phase may touch `page.tsx`. So **P3 removes the import, the `selectedArticle`
state and the `<ArticleModal />` element**, leaving the file with nothing pointing at
`components/modals/ArticleModal.tsx`. P4B then deletes the file, and the delete is safe because
nothing references it.

Consequence P3 must handle: with the modal gone, `WritingSection`'s `onSelectArticle` prop has
no implementation. P3 replaces it with links — cards to `/blog/<slug>`, the header button to
`/blog`. **Those links 404 until P4B lands.** That window is accepted: P4B runs in the very next
wave, P3's brief records it in `STATUS.md`, and P4B verifies the links resolve as part of its
acceptance criteria. The alternative — dead, unclickable cards — is worse and costs a second
edit of the same file.

### Cleanups allowed while converting sections to props

Dead code only, no behaviour change: `HeroSection` accepts `onOpenContact` and never uses it
(`HeroSection.tsx:13`); `ProjectsSection` destructures `personal` and never uses it
(`ProjectsSection.tsx:15`). Drop both.

---

## 5. Projects and blog UX

The two content types deliberately behave differently. `00-MASTER-PLAN.md §3` calls it
hybrid for projects, full-page for blog.

| | Projects | Blog |
|---|---|---|
| Home card click | Opens `ProjectModal` — **unchanged** | Navigates to `/blog/<slug>` |
| Modal | Stays. Gains a **"Full case study →"** link to `/projects/<slug>` in its action row, beside "Live Preview" and "Source Repository" | **`ArticleModal` is deleted** |
| Section "view all" | `ProjectsSection` bottom bar gains **"View all projects →"** → `/projects` | `WritingSection` header button → `/blog` |
| Permalink | `/projects/<slug>` | `/blog/<slug>` |

**Why the asymmetry.** A project card's entire payload already fits in the modal and the modal
is fast and good. An article is long-form: a modal cannot be linked, cannot be indexed, cannot
be scrolled comfortably, and cannot carry `BlogPosting` structured data.

### The `ProjectsSection` bottom bar

It currently renders a static label — `MORE PROJECTS COMING SOON...` (`ProjectsSection.tsx:131-134`)
— a divider, and "Always building". P4A replaces the label with a real link ("View all
projects →" → `/projects`), keeping the divider and the right-hand element untouched.

### `WritingSection.tsx:69` — a live bug

```tsx
<button onClick={() => onSelectArticle(articles[0])}>
  <span>View all articles</span>
```

The "View all articles" button opens **the first article's modal**. It does not show a listing,
because there has never been a listing to show. It also throws if `articles` is ever empty.

Fixed by **P4B**: the button becomes `<Link href="/blog">` and lands on the real index.
Mechanically the change is forced earlier — P3 removes the `onSelectArticle` prop along with
the modal (§4) and points the button and the cards at `/blog` routes — but P4B owns the
section from Wave 3 on and is the phase that verifies the destination actually renders.

---

## 6. Revalidation

The public site is statically cached, so a publish in the admin changes nothing until Next is
told to drop the page. Convex has **no official Next.js revalidation recipe**
(`01-ARCHITECTURE.md §2`). This chain is ours.

```
admin mutation (requireAdmin passes, document patched, transaction commits)
        │  ctx.scheduler.runAfter(0, internal.revalidate.ping, { tags })
        ▼
internal action  packages/backend/convex/internal/revalidate.ts
        │  POST ${SITE_URL}/api/revalidate   header: x-revalidate-secret
        ▼
route handler  apps/web/app/api/revalidate/route.ts
        │  verify secret → validate tags → revalidateTag(tag, 'max')
        ▼
next request for that route rebuilds from Convex
```

`runAfter(0)` rather than an inline call is load-bearing: a Convex mutation is a transaction
and cannot do I/O, and scheduling means **a failed revalidation never rolls back a successful
write**. Worst case the content is saved and the page is stale until `cacheLife` expires.

### 6.1 Tag taxonomy

Five tags. No others exist.

| Tag | Invalidates | Declared in |
|---|---|---|
| `home` | `/` | `getHomeData()` |
| `projects` | `/projects`, `/sitemap.xml` | `getProjects()`, `sitemap.ts` |
| `project:<slug>` | `/projects/<slug>` | `getProject(slug)` |
| `blog` | `/blog`, `/feed.xml`, `/sitemap.xml` | `getPosts()`, `feed.xml/route.ts`, `sitemap.ts` |
| `post:<slug>` | `/blog/<slug>` | `getPost(slug)` |

Page-level tags stay **canonical and singular** — `/` is tagged `home` and nothing else. The
fan-out lives in the mutations, where the author knows exactly what changed.

### 6.2 Which mutation fires which tags

| Mutation | Tags scheduled |
|---|---|
| `projects.create` | `projects`, `home` |
| `projects.update` | `projects`, `project:<slug>`, `home` — **plus `project:<oldSlug>` if the slug changed** |
| `projects.remove` | `projects`, `project:<slug>`, `home` |
| `projects.reorder` | `projects`, `home` |
| `projects.setStatus` | `projects`, `project:<slug>`, `home` |
| `blog.create` | `blog`, `home` |
| `blog.update` | `blog`, `post:<slug>`, `home` — **plus `post:<oldSlug>` if the slug changed** |
| `blog.remove` | `blog`, `post:<slug>`, `home` |
| `blog.setStatus` | `blog`, `post:<slug>`, `home` |
| `blog.incrementViews` | **none — deliberately** |
| `siteSettings.update` | `home` |
| `experience.create/update/remove/reorder` | `home` |
| `skills.create/update/remove/reorder` | `home` |
| `leads.*` | none — leads are never rendered on the public site |
| `media.*` | none directly. The row that *references* the media fires its own tags when it is saved. |

Three things that are easy to get wrong:

1. **`home` on every content mutation.** The home page renders project cards and the four
   newest posts. Publishing a post without busting `home` leaves the Writing section showing
   yesterday's list.
2. **`incrementViews` must never revalidate.** It runs on every page view. Firing `post:<slug>`
   from it would invalidate the post each time it is read — a cache that deletes itself.
3. **Slug changes fire both slugs.** `02-DATA-MODEL.md §8` says slugs are frozen forever, but
   the admin can still rename one before publishing. The old tag must be cleared or a stale
   page survives at a URL nobody links to any more.

### 6.3 The route handler

```ts
// apps/web/app/api/revalidate/route.ts        (P7)
import { revalidateTag } from 'next/cache'

const TAG = /^(home|projects|blog|project:[a-z0-9]+(?:-[a-z0-9]+)*|post:[a-z0-9]+(?:-[a-z0-9]+)*)$/

export async function POST(req: Request) {
  const secret = req.headers.get('x-revalidate-secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }
  const { tags } = (await req.json()) as { tags?: unknown }
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > 20) {
    return new Response('Bad Request', { status: 400 })
  }
  const valid = tags.filter((t): t is string => typeof t === 'string' && TAG.test(t))
  for (const tag of valid) revalidateTag(tag, 'max')   // second argument is REQUIRED in 16
  return Response.json({ revalidated: valid, now: Date.now() })
}
```

- **`GET` is not exported** → Next returns 405. The endpoint is POST-only.
- **The secret is checked before the body is read.** No parsing work for an unauthenticated
  caller.
- **Tags are validated against the taxonomy, not trusted.** This is a public URL. A leaked
  secret with unbounded tag input is a cache-eviction denial of service; the allowlist and the
  20-tag cap make the blast radius the size of the site.
- **`revalidateTag(tag, 'max')` — the second argument is mandatory in Next 16**
  (`01-ARCHITECTURE.md §7`). A one-argument call is a TypeScript error. `updateTag()` is Server
  Actions only and is not usable here; `revalidatePath` is not used at all, because tags are
  more precise and survive a route rename.
- Add `Disallow: /api/` in `robots.ts`.

### 6.4 The Convex side, and one gap to close

```ts
// packages/backend/convex/internal/revalidate.ts
export const ping = internalAction({
  args: { tags: v.array(v.string()) },
  handler: async (_ctx, { tags }) => {
    const origin = process.env.SITE_URL
    if (!origin) return                          // local dev: no-op, see below
    await fetch(`${origin}/api/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': process.env.REVALIDATE_SECRET!,
      },
      body: JSON.stringify({ tags }),
    }).catch(() => {})                            // never throw — the write already succeeded
  },
})
```

> **Gap for P0/P1.** `01-ARCHITECTURE.md §4` gives the web app `NEXT_PUBLIC_SITE_URL` and the
> Convex deployment `REVALIDATE_SECRET`, but **nothing tells the Convex deployment what the
> site's origin is**. Add `SITE_URL` to the Convex environment when `revalidate.ping` is
> created, and add the row to the env table in the same commit.

**In local development this chain does not work, by design.** The Convex cloud deployment
cannot reach `http://localhost:3000`. Leave `SITE_URL` unset locally: `ping` returns
immediately, and `next dev` reads through to Convex on every request anyway.

---

## 7. SEO per route

### 7.1 Canonicals

`app/layout.tsx` sets `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!)` — it is
hardcoded to `https://milankumawat.in` today, which breaks preview deployments. Every page then
sets a **relative** `alternates.canonical`; `metadataBase` absolutises it. One origin, one
place to change it.

The layout also sets the title template:

```ts
title: { default: 'Milan Kumawat | AI Engineer & Backend Developer', template: '%s — Milan Kumawat' }
```

so a page exporting `title: 'Blog'` renders `Blog — Milan Kumawat`.

### 7.2 Per route

| Route | Canonical | Title source | OG image | JSON-LD |
|---|---|---|---|---|
| `/` | `/` | `siteSettings.personal.name` + `role` | `app/opengraph-image.tsx` (P7); `/images/hero-desk.png` until then | **`Person`** |
| `/projects` | `/projects` | static "Projects" | site default | `CollectionPage` + `ItemList` *(optional, P7)* |
| `/projects/[slug]` | `/projects/<slug>` | `seo.title ?? title` | project `imageUrl` / `imageStorageId`, absolutised | **`CreativeWork`** |
| `/blog` | `/blog` | static "Blog" | site default | `Blog` + `ItemList` *(optional, P7)* |
| `/blog/[slug]` | `/blog/<slug>` | `seo.title ?? title` | post cover, absolutised | **`BlogPosting`** |
| `/feed.xml` | — | — | — | — |
| `/api/revalidate` | — | — | — | — |
| not-found | — | "Page not found" | — | — · `robots: { index: false }` |

### 7.3 JSON-LD shapes

Injected from the Server Component, not `next/script`:

```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
```

- **`Person`** (`/`): `name`, `jobTitle`, `url`, `email`, `image`, `address` →
  `{ '@type': 'PostalAddress', addressLocality: 'Jaipur', addressCountry: 'IN' }`, and `sameAs`
  as `[githubUrl, linkedinUrl, twitterUrl]` — all five values come from
  `siteSettings.personal`, so the structured data updates when Milan edits his profile.
- **`BlogPosting`** (`/blog/<slug>`): `headline`, `description` (= `excerpt`), `image`,
  `datePublished` (ISO from `publishedAt`), `dateModified` (from `updatedAt`), `author` → the
  same `Person`, `keywords` (= `tags`), `mainEntityOfPage` → the canonical URL.
- **`CreativeWork`** (`/projects/<slug>`): `name`, `description` (= `description`), `url` →
  canonical, `image`, `keywords` (= `tags`), `author` → `Person`, and `sameAs` →
  `[liveUrl, githubUrl]` filtered for the ones that exist.

Dates must be ISO 8601 and must come from the epoch numbers, never from a display string.

### 7.4 `sitemap.ts` and `robots.ts` (P7)

`sitemap.ts` returns `/`, `/projects`, `/blog`, every published project and every published
post. Excluded: `/feed.xml`, `/api/*`, the 404, and the entire admin domain.

- `lastModified` comes from each row's `updatedAt`; the static routes use the newest
  `updatedAt` across their collection.
- `priority`: `/` 1.0, the two indexes 0.8, detail pages 0.6.
- **It must be wrapped in the same `'use cache'` pattern as the pages** — an unwrapped
  `fetchQuery` makes the sitemap dynamic. Tag it `cacheTag('projects', 'blog')`.
- Next 16 passes `id` to `sitemap({ id })` as a **Promise**. We do not shard, so we do not read
  it — but do not copy a pre-16 signature that destructures it synchronously.

`robots.ts`: allow everything, `Disallow: /api/`, and point `sitemap` at
`${NEXT_PUBLIC_SITE_URL}/sitemap.xml`.

### 7.5 Images

`next.config.mjs` sets `images.unoptimized: true` today. When covers start coming from Convex
storage that must be replaced with a `remotePatterns` entry for `*.convex.cloud`
(`01-ARCHITECTURE.md §7`) — otherwise every OG image and every card image is served
unoptimised at full size. It is a config change, not a component change: ten components
already use `next/image`.

OG image URLs in metadata must be **absolute**. `metadataBase` handles relative paths; a raw
Convex storage URL is already absolute and needs no help.
