# Master Plan — Milan Kumawat Portfolio → Full-Stack Product

> **Single source of truth.** Every session, every phase, every agent starts here and at
> `docs/STATUS.md`. If the code and this document disagree, one of them is a bug — say so
> in `STATUS.md` rather than silently picking a side.

**Plan written:** 2026-09-22 · **Driver skill:** `/portfolio` · **Backend:** Convex

---

## 1. What we are building

The portfolio stops being a page and becomes a product.

Today the site is a single scrolling page where every word is a TypeScript string literal.
Adding a project means editing `data/portfolioData.ts`, committing, and waiting for a
deploy. Writing an article means the same. The contact form is theatre — it plays a
confetti animation and throws the message away.

After this build:

- **Milan writes, the site updates.** Projects, blog posts, experience, skills and every
  line of site copy live in Convex and are edited from a private admin panel. No commit,
  no deploy, no developer.
- **Leads are real.** The contact form writes to the database and emails Milan. Every
  enquiry is answerable, searchable and never lost.
- **The blog is a blog.** Real URLs, real pages, Markdown with code blocks, an index page,
  tags, RSS, and metadata that Google and LinkedIn can read.
- **The site has two skins.** Dark and light, chosen by the visitor, remembered.
- **There is room for the bot.** The content is stored as structured, chunk-able text in a
  database with native vector search, so an AI assistant that answers questions about
  Milan's work is a later phase, not a rewrite.

### What this is not

Not a redesign. The current visual design is good and stays. Phases that touch existing
components must keep the rendered page **pixel-identical** unless the phase brief explicitly
says otherwise. "While I was in there I also improved…" is how this build breaks.

---

## 2. Starting point (snapshot, 2026-09-22)

Branch `main`, commit `c753fe9`, clean tree.

| | |
|---|---|
| Framework | Next.js **16.3.5**, React 19.3, TypeScript 7 |
| Styling | Tailwind 3.4 + CSS custom properties in `app/globals.css` |
| Motion | `framer-motion` 13, `lucide-react` icons, `canvas-confetti` |
| Structure | `app/page.tsx` — one `'use client'` component, 8 sections + 4 modals |
| Content | `data/portfolioData.ts` — 540 lines, every string on the site |
| Backend | **None** |
| Routes | `/` and `not-found` only |
| Deploy | Vercel |

Three facts from that snapshot that shape the whole plan:

1. **The contact form is fake.** `components/modals/ContactModal.tsx:22-40` runs a 800ms
   `setTimeout`, shows "Message Sent!", and discards `name`, `email` and `message`. Fixing
   this is the single highest-value change in the build.
2. **The navbar cannot survive a second route.** `Navbar.tsx` is 100% hash anchors
   (`#home`, `#about`, …) driving a scroll-spy over eight section ids. The moment `/blog`
   exists, those links break. The routing shell must be fixed *before* new pages land.
3. **Nothing has a slug** — but the existing ids already read like slugs (`hiro`,
   `building-ai-powered-fastapi`), so they become the permalinks verbatim and no URL ever
   has to change.

---

## 3. Decisions, and why

| Decision | Choice | Why |
|---|---|---|
| Backend | **Convex** | Typed end-to-end with TypeScript, reactive by default, file storage and **vector search built in** (the future bot needs no new service), generous free tier, no SQL migration ceremony for a content model this small. |
| Repo topology | **Monorepo, separate deploys** | `apps/web`, `apps/admin`, `packages/backend`. The admin ships as its own Vercel project on its own domain — zero admin code in the public bundle — while both apps import the *same generated Convex types*. Two separate repos would mean the admin calls functions by untyped string reference, and every schema change becomes a manual sync across repos. |
| Projects UX | **Hybrid** | The quick-look modal stays on the home page (it is good, and it is fast), and every project also gets a permalink page for sharing and indexing. |
| Blog UX | **Full pages only** | `ArticleModal` is removed. Long-form writing in a modal cannot be linked, cannot be indexed, and cannot be read comfortably. |
| Content scope | **Everything in Convex** | Projects, posts, leads, experience, skills *and* all site copy — headline, bio, quotes, handwriting annotations, contact cards. One migration, not two. The admin becomes a real mini-CMS. |
| Admin auth | **Convex Auth, no middleware** | See §6 — this is a deliberate, risk-managed choice, not the default one. |
| Blog format | **Markdown in Convex** | Portable, diff-able, code-block friendly, no vendor lock-in, and chunks cleanly for the future bot's embeddings. Rendered server-side with syntax highlighting. |
| Media | **Convex file storage** | Admin uploads go straight to Convex; no S3/R2 account needed on day one. Swappable later — `media` rows store a storage id behind an accessor, not a baked URL. |

---

## 4. Stack

| Layer | Choice |
|---|---|
| Backend | **Convex** — database, functions, file storage, vector search, scheduler |
| Public site | Next.js 16 App Router, React Server Components for content |
| Admin | Next.js 16, client-rendered, Convex live queries (`preloadQuery` + `usePreloadedQuery`) |
| Auth | `@convex-dev/auth` — single admin identity, enforced inside every mutation |
| Markdown | Server-side render + syntax highlighting (library chosen in P4B) |
| Email | Resend, called from a Convex action on new lead |
| Theme | `next-themes` + Tailwind `darkMode: 'class'` |
| Deploy | Two Vercel projects, one Convex deployment |

---

## 5. Phase map

Phases are drawn so that **phases in the same wave own disjoint files**. That constraint is
the only reason the boundaries sit where they do. File ownership is enumerated in
`docs/08-PLAYBOOK.md` and is binding.

```
WAVE 1   P0   Monorepo & Convex foundation          [solo · blocking]
              │
         P1   Schema & API contract freeze          [solo · blocking]  ← CONTRACT FREEZE
              │
WAVE 2   P2   Content migration & seed
              │
         P3   Public read path + routing shell      [owns page.tsx, Navbar, Footer]
              │
WAVE 3   ├─ P4A  Projects pages        ┐
         ├─ P4B  Blog pages            ├ parallel — disjoint files
         └─ P4C  Leads pipeline        ┘
              │
WAVE 4   P5   Dark / light theme                    [touches ~20 files · never parallel]
              │
WAVE 6   P7   SEO, performance, QA, deploy

         ── separate track, different app ──────────────────────────
WAVE 5   P6A  Admin: auth, shell, projects CRUD     ┐ depends only on P1
         P6B  Admin: blog editor + media library    ├ runs alongside P3/P4/P5
         P6C  Admin: leads, experience, skills, settings ┘

FUTURE   P8   AI assistant bot                      [designed, unscheduled]
```

**Dependency graph** (no cycles):

```
P0 → P1 → P2 → P3 → {P4A, P4B, P4C} → P5 → P7
     └──────────────→ {P6A → P6B, P6C} ──────────↗
```

P6 needs only the frozen schema from P1, and lives entirely in `apps/admin`. That is the
big parallelisation win: the admin panel can be built while the public site is still being
migrated, and the two tracks cannot collide.

| Phase | Name | Brief |
|---|---|---|
| P0 | Monorepo & Convex foundation | `phases/PHASE-00-foundation.md` |
| P1 | Schema & API contract freeze | `phases/PHASE-01-schema.md` |
| P2 | Content migration & seed | `phases/PHASE-02-migration.md` |
| P3 | Public read path + routing shell | `phases/PHASE-03-read-path.md` |
| P4A | Projects pages | `phases/PHASE-04A-projects.md` |
| P4B | Blog pages | `phases/PHASE-04B-blog.md` |
| P4C | Leads pipeline | `phases/PHASE-04C-leads.md` |
| P5 | Dark / light theme | `phases/PHASE-05-theme.md` |
| P6A | Admin: auth, shell, projects | `phases/PHASE-06A-admin-core.md` |
| P6B | Admin: blog editor + media | `phases/PHASE-06B-admin-content.md` |
| P6C | Admin: leads + site settings | `phases/PHASE-06C-admin-rest.md` |
| P7 | SEO, performance, QA, deploy | `phases/PHASE-07-launch.md` |
| P8 | AI assistant bot | `phases/PHASE-08-bot.md` (future) |

---

## 6. The auth decision, in full

`@convex-dev/auth` is at **0.0.95** and its own documentation says it is beta. Its
`devDependency` pins `next: ^15.2.5`, and issue
[convex-auth#271](https://github.com/get-convex/convex-auth/issues/271) — open since
2025-12-15 with no fix — describes exactly our stack: on Next 16, `convexAuthNextjsMiddleware`
in `proxy.ts` makes `isAuthenticated()` always return false.

We keep Convex Auth anyway, and route around the bug:

- **No `middleware.ts`. No `proxy.ts`.** We do not use middleware-based route protection at
  all, so the broken code path is never executed.
- **The admin shell gates on client auth state** — a `<Authenticated>` / `<Unauthenticated>`
  boundary in the admin layout. This is *convenience*, not security.
- **Every single mutation and every non-public query calls `ctx.auth.getUserIdentity()`
  itself** and throws if the caller is not the admin identity. This is the real security
  boundary, it lives on the server, and it holds even if someone loads an admin route
  directly with JavaScript disabled or hits the Convex API from curl.

Accepted cost: an admin page may flash its shell for a moment before redirecting an
unauthenticated visitor. For a private single-user panel that is cosmetic.

If Convex Auth becomes a problem mid-build, the escape hatch is Clerk — it is verified
working on Next 16 with Convex, and because auth is enforced through one `requireAdmin()`
helper (`packages/backend/convex/lib/auth.ts`), swapping providers touches that helper and
the two provider components, not every mutation.

---

## 7. Definition of done

A phase is done when **all** of these are true. Not four of five.

1. Every acceptance criterion in the phase brief is verified — actually run, actually
   looked at. Not "should work".
2. `npm run build` passes from the repo root.
3. `npx tsc --noEmit` passes for every app the phase touched.
4. The public site renders correctly in a browser — golden path *and* the edge cases the
   brief names.
5. Only files the phase owns were modified. Anything else is a cross-phase request filed in
   `STATUS.md`, not a quiet edit.
6. `STATUS.md` has the row flipped to `✅ Done` and a dated log line appended.
7. The work is committed with a `feat(pN):` / `refactor(pN):` message.

---

## 8. Non-negotiables

- **Never change the public site's visual design** except in the phase that owns that
  change. Content moving from a TypeScript file to a database must be invisible to a visitor.
- **Never mark a phase done without running the build.** See §7.
- **Never change the Convex schema without updating `02-DATA-MODEL.md` in the same commit.**
  The schema doc is the contract; a schema that drifts from it silently breaks the phase
  running in parallel.
- **Never commit secrets.** `.env.local` is gitignored and stays that way. Convex deploy
  keys, Resend keys and the revalidation secret live in Vercel and Convex dashboards.
- **Never lose a lead.** If the notification email fails, the lead is still stored. Storage
  first, notify second, always.
- **Read the Next.js docs before writing Next.js code.** `AGENTS.md` is explicit that this
  version differs from training data, and §Next-16 of `01-ARCHITECTURE.md` lists the traps
  that have already bitten.
- **Copy is Milan's.** When migrating strings, move them verbatim. Never improve his words
  in passing.

---

## 9. Quick reference

```
docs/00-MASTER-PLAN.md        this file — vision, decisions, phase map
docs/01-ARCHITECTURE.md       topology, data flow, rendering, env, Next 16 traps
docs/02-DATA-MODEL.md         every table, field, index, and function name  ← the contract
docs/03-ROUTES-AND-PAGES.md   the sitemap and what each page renders
docs/04-ADMIN-PANEL.md        apps/admin — auth, screens, editors
docs/05-DESIGN-SYSTEM.md      tokens and the two-way theme model
docs/06-CONTENT-MIGRATION.md  portfolioData.ts → Convex, field by field
docs/07-FUTURE-BOT.md         the AI assistant, designed not built
docs/08-PLAYBOOK.md           file ownership, agent briefs, parallel rules
docs/STATUS.md                THE BOARD — start here, finish here
docs/phases/PHASE-*.md        one brief per phase
```

Driver skill: `.claude/skills/portfolio/SKILL.md` — type `/portfolio` in any session.
