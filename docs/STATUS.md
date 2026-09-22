# Build Status — the board

> **Start here. Finish here.** `/portfolio` reads this file first, every session, and the
> session that ends must leave it accurate. A phase updates **only its own row** and
> **appends** to the log — never rewrites someone else's line.

**Last updated:** 2026-09-22 — planning complete, docs written, **no code written yet**.
**Next action:** `/portfolio p0` — monorepo conversion and Convex scaffold.

---

## Phase board

| Phase | Name | Status | Wave | Notes |
|---|---|---|---|---|
| P0 | Monorepo & Convex foundation | ⬜ Not started | 1 | Solo. Own branch. Moves every file. |
| P1 | Schema & API contract freeze | ⬜ Not started | 1 | Solo. **Contract freeze.** |
| P2 | Content migration & seed | ⬜ Not started | 2 | Needs P1 |
| P3 | Public read path + routing shell | ⬜ Not started | 2 | Needs P2. Owns `page.tsx`, `Navbar`, `Footer` |
| P4A | Projects pages | ⬜ Not started | 3 | Parallel-safe with P4B, P4C |
| P4B | Blog pages | ⬜ Not started | 3 | Parallel-safe with P4A, P4C |
| P4C | Leads pipeline | ⬜ Not started | 3 | Parallel-safe with P4A, P4B |
| P5 | Dark / light theme | ⬜ Not started | 4 | **Never parallel** — ~20 files |
| P6A | Admin: auth, shell, projects | ⬜ Not started | 5 | Needs only P1. Separate app. |
| P6B | Admin: blog editor + media | ⬜ Not started | 5 | Needs P6A |
| P6C | Admin: leads + site content | ⬜ Not started | 5 | Needs P6A |
| P7 | SEO, performance, QA, deploy | ⬜ Not started | 6 | Needs P5 + P6 |
| P8 | AI assistant bot | 🔒 Future | — | Do not start unless Milan asks |

Status values: `⬜ Not started` · `🟦 In progress` · `✅ Done` · `⚠️ Blocked` · `🔁 Needs rework` · `🔒 Future`

**Critical path:** P0 → P1 → P2 → P3 → P4* → P5 → P7
**Parallel opportunity:** the entire P6 admin track needs only P1, lives in `apps/admin`, and
can run alongside P3/P4/P5 without a file collision.

---

## Decisions

Append as they are made. Each phase that makes a call records it here so the next session
does not re-litigate it.

| Date | Decision | Why |
|---|---|---|
| 2026-09-22 | **Convex** over Supabase | Typed end to end, reactive by default, file storage and vector search built in — the future bot needs no new service. |
| 2026-09-22 | **Monorepo, separate deploys** | Both apps share generated Convex types; the admin still ships as its own Vercel project on its own domain. Two repos would mean untyped string function references. |
| 2026-09-22 | **Hybrid projects UX** | Quick-look modal stays on home; every project also gets a permalink page. |
| 2026-09-22 | **Blog is full-page only** | `ArticleModal` is deleted. Long-form content in a modal cannot be linked or indexed. |
| 2026-09-22 | **All content in Convex from day one** | Including experience, skills and every line of site copy. One migration, not two. |
| 2026-09-22 | **Convex Auth, no middleware** | convex-auth is 0.0.x beta and [#271](https://github.com/get-convex/convex-auth/issues/271) breaks `isAuthenticated()` on Next 16. We use neither `middleware.ts` nor `proxy.ts`; `requireAdmin()` inside every mutation is the real boundary. Clerk is the escape hatch. |
| 2026-09-22 | **Markdown for blog bodies** | Portable, code-block friendly, chunks cleanly for the future bot. |
| | **`cacheComponents` on/off** | ⬅ **P0 must decide and record this.** It changes how every later phase writes pages. |
| | **Markdown rendering stack** | ⬅ **P4B must decide and record this.** P6B's preview has to match it. |
| | **Footer in light mode** | ⬅ **P5 must decide and record this.** The footer is dark by design today. |

---

## Open questions for Milan

Answer before the content becomes published database rows (P2).

- [ ] **`liveUrl`s point at `example.com`** — `hiro-hire.example.com`, `salezo.example.com`,
      `autoresumebot.example.com`, `tools.example.com`. Real URLs, or should these links be
      hidden until they exist?
- [ ] **Do the GitHub URLs resolve?** `github.com/milankumawat/*` — the earlier 3D build
      recorded that the profile 404s.
- [ ] **Article dates are in the future** (`12 Sep 2026`, `05 Sep 2026`, …). Intentional, or
      placeholder?
- [ ] **The footer has a SECOND fake form.** `components/Footer.tsx:27-33` — the newsletter
      subscribe box sets `status: 'subscribed'`, clears the field after 4s and **discards the
      email**, exactly like the contact modal did. Do you want a real newsletter (needs a
      `subscribers` table and a phase), or should the box be removed? No phase owns it today.
- [ ] **The four article bodies are stubs** — 85–109 words each, but labelled "5 min read"
      through "8 min read". Publish them as-is, or rewrite before they become live blog posts?
- [ ] **`personal.handwriting` is dead data** — nothing reads it, and 7 of 12 values have
      drifted from the annotations actually on the page. Wire it up, or delete it?
- [ ] **Admin domain** — is `admin.milankumawat.in` the intended hostname?
- [ ] **Lead notification address** — `hey@milankumawat.in`, or somewhere else?
- [ ] **GitHub identity for admin login** — which account is the single admin?

---

## Cross-phase requests

When a phase needs a change in a file it does not own (`08-PLAYBOOK.md §4`), it files here
rather than editing across the line.

| Date | From | Request | Owner | Status |
|---|---|---|---|---|
| — | — | none yet | — | — |

---

## Session log

Append one line per session. Never rewrite.

```
2026-09-22  Planning session. Explored the codebase, researched Next 16 + Convex
            integration, confirmed four decisions with Milan, wrote the full docs set
            (00–08, STATUS, 13 phase briefs) and the /portfolio driver skill.
            No application code touched. Next: P0.
```

---

## Verified facts worth not rediscovering

- The contact form at `components/modals/ContactModal.tsx:22-40` is a **fake `setTimeout`**
  that discards every message. P4C fixes it.
- `Navbar.tsx` is 100% hash anchors with a scroll-spy over 8 section ids — it breaks on any
  non-`/` route. P3 fixes it.
- `WritingSection.tsx:69` "View all articles" calls `onSelectArticle(articles[0])` — it opens
  the first article's modal instead of a listing. P4B fixes it.
- `package.json` has `"lint": "next lint"`, and **`next lint` was removed in Next 16**. P0
  fixes it.
- `next.config.mjs` sets `images.unoptimized: true`, which must go before Convex-hosted
  images work. P0 fixes it.
- `HeroSection.tsx`, `Footer.tsx` and `app/not-found.tsx` are **already dark** — P5 is a
  two-way theme pass, not an additive one.
- Existing content ids are already slug-shaped (`hiro`, `building-ai-powered-fastapi`), so
  permalinks are stable from migration onward.
- `Navbar.tsx` has a second bug beyond the hash links: `scrolled` falls back to
  `scrollY > 100`, so on a non-home route the header renders white-on-white for the first
  100px, and the scroll-spy never clears — leaving "Home" lit forever. P3 fixes both.
- `app/layout.tsx` hardcodes `https://milankumawat.in` in `metadataBase` and
  `openGraph.url`, which breaks preview deploys. Should read `NEXT_PUBLIC_SITE_URL`.
- Dead code spotted in passing: unused `onOpenContact` prop in `HeroSection.tsx:13`, unused
  `personal` destructure in `ProjectsSection.tsx:15`. Clean up only in the phase that owns
  the file.
- `siteSettings` deliberately **flattens** `stats`, `heroTechStack`, `aboutPillars`,
  `whatIWorkOn` and `quotes` to the top level, while the current code nests them under
  `personal`. That is a migration mapping, not a contradiction — see `06-CONTENT-MIGRATION.md`.
- `convex/nextjs` helpers are all `cache: "no-store"` internally — wrap them in `'use cache'`
  or content pages will not be static.

---

## Quick commands

```bash
npm run build                 # from the repo root — the gate for every phase
npx tsc --noEmit              # per app
npx convex dev                # ONCE, from packages/backend — never from an app
npx convex run internal/seed:importLegacy
node scripts/parity-check.mjs # P2 onward
```
