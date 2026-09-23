# Build Status — the board

> **Start here. Finish here.** `/portfolio` reads this file first, every session, and the
> session that ends must leave it accurate. A phase updates **only its own row** and
> **appends** to the log — never rewrites someone else's line.

**Last updated:** 2026-09-23 — **Live.** Public site on `https://milankumawat.is-a.dev`, admin on `https://milan-portfolio-admin.vercel.app`, Convex prod `polite-hornet-484` seeded. Pre-launch review fixed 5 bugs (contact form lost every lead, media covers invisible, new-post create failed, lead notes wiped, error text masked). See `docs/DEPLOY.md`.
**Next action:** (1) Milan: working contact email (`hey@milankumawat.in` bounces) + Resend key/`LEAD_NOTIFY_TO`; real `liveUrl`s. (2) Perf: home refactor + deferred section rendering done (2026-09-23, local mobile Lighthouse 83–85 → 92); deploy, then re-run PageSpeed on the live site. (3) Delete the two test leads (`launch-check@example.com` on prod, `reviewtest@example.com` on dev) from the admin inbox.

---

## Phase board

| Phase | Name | Status | Wave | Notes |
|---|---|---|---|---|
| P0 | Monorepo & Convex foundation | ✅ Done | 1 | Solo. Own branch. Moves every file. |
| P1 | Schema & API contract freeze | ✅ Done | 1 | Solo. **Contract freeze.** |
| P2 | Content migration & seed | ✅ Done | 2 | Dev deployment `sincere-duck-662` seeded. Parity: zero diffs. Second run: no count change. |
| P3 | Public read path + routing shell | ✅ Done | 2 | Home reads from Convex. HomeClient.tsx created. Navbar/Footer multi-route fixed. |
| P4A | Projects pages | ✅ Done | 3 | Parallel-safe with P4B, P4C |
| P4B | Blog pages | ✅ Done | 3 | Parallel-safe with P4A, P4C |
| P4C | Leads pipeline | ✅ Done | 3 | Parallel-safe with P4A, P4B |
| P5 | Dark / light theme | ✅ Done | 4 | Reworked 2026-09-23: sub-pages on `SubPageShell` (real Navbar/Footer), raw colors tokenized, `--blue-light` dark value, `dark:prose-invert` on posts. |
| P6A | Admin: auth, shell, projects | ✅ Done | 5 | Auth reworked 2026-09-23: email + password (was GitHub OAuth, which never worked — `convex/http.ts` was missing). |
| P6B | Admin: blog editor + media | ✅ Done | 5 | Blog editor, live Markdown preview, MediaLibrary, MediaPicker wired. |
| P6C | Admin: leads + site content | ✅ Done | 5 | Leads inbox, Experience/Skills/Settings editors all wired. |
| P7 | SEO, performance, QA, deploy | ✅ Done | 6 | Live 2026-09-23. Lighthouse (mobile, live): project/post 98–99 perf, 95+ a11y, 100 BP/SEO; home 74 perf (see next action). Open: Resend, real contact email, social-preview debugger check. |
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
| 2026-09-22 | **`cacheComponents: false`** | Default (off). `generateStaticParams` returning `[]` is a build error when on, and P4A/P4B need runtime ISR. All content pages use `'use cache'` + `cacheTag()` + `cacheLife()` explicitly. |
| 2026-09-22 | **Blog `publishedAt` is admin-editable** | Milan backdates posts, so the publish date is a real field he sets, not a stamp. Backdating is supported; scheduled publishing is not — a future date publishes now and just displays a future date. |
| 2026-09-22 | **Markdown rendering stack: remark + remark-gfm + remark-html** | Server component, no client JS, sanitize=false (admin-authored content). P6B preview must match. |
| 2026-09-23 | **Production domain is `milankumawat.is-a.dev`** | `milankumawat.in` has no DNS. Code fallbacks switched. Admin lives on `milan-portfolio-admin.vercel.app`. Convex is deployed from the CLI, not by Vercel. |
| 2026-09-23 | **Admin auth: email + password, not GitHub** | Milan's call. Convex Auth `Password` provider; `profile()` refuses any email but `ADMIN_EMAIL`, so no second account can exist. `requireAdmin` now loads the user and compares email to `ADMIN_EMAIL` and **fails closed** — replaces `ADMIN_IDENTITY`, which failed open. Docs 01/04/P01 still mention GitHub/`ADMIN_IDENTITY`; this row supersedes them. |
| 2026-09-23 | **Home-only data uses the `home` cache tag** | `getSiteSettings`/`getExperience`/`getSkillCategories` were tagged `siteSettings`/`experience`/`skills`, which `/api/revalidate` rejects. Now `home`, per the 5-tag taxonomy in `03-ROUTES §6.1`. |
| 2026-09-23 | **OG images are generated cards, not cover photos** | `opengraph-image.tsx` at `/`, `/projects/[slug]`, `/blog/[slug]`. Post `generateMetadata` no longer passes `imageUrl`, so every share shows title + excerpt consistently. |
| 2026-09-23 | **`importLegacy` takes `{"overwrite": true}`** | Dev-only repair: patches existing legacy rows back to seed content. Default stays insert-if-missing so admin edits survive. Never use on prod. |
| 2026-09-23 | **P5 theme design: option A (recessed inversion)** | Feature surfaces (Hero, Footer, 404) stay darkest element on page in both themes. Dark-theme body lighter at `--bg-primary: #080B10`. Footer intentionally stays dark in both light and dark mode. |

---

## Open questions for Milan

Answer before the content becomes published database rows (P2).

- [ ] **`liveUrl`s point at `example.com`** — `hiro-hire.example.com`, `salezo.example.com`,
      `autoresumebot.example.com`, `tools.example.com`. Real URLs, or should these links be
      hidden until they exist?
- [ ] **Do the GitHub URLs resolve?** `github.com/milankumawat/*` — the earlier 3D build
      recorded that the profile 404s.
- [ ] **Are the existing article dates real?** `12 Sep 2026`, `05 Sep 2026`, `28 Aug 2026`,
      `18 Aug 2026` — all within the last five weeks. Real publication dates, or placeholders
      to overwrite? Milan has said he will backdate posts, so these become editable on import.
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
      ⚠️ `milankumawat.in` does not exist, so `hey@milankumawat.in` bounces — and it is the
      email shown on the live site (ContactSection, ContactModal, ResumeModal, contact card
      in siteSettings). Needs a working address from Milan; site copy fixable in admin Settings.
- [ ] **Rate limit keys on submitted email** (`leads.ts`) — spammers rotate addresses; anyone
      can lock a real address out for an hour. Proper fix hashes the IP via an httpAction.
- [x] **Admin login** — answered: email + password, `milankumawat01@gmail.com`. See Decisions.
- [ ] **Analytics** — add Vercel Analytics (P7 step 7 default), or nothing?

---

## Cross-phase requests

When a phase needs a change in a file it does not own (`08-PLAYBOOK.md §4`), it files here
rather than editing across the line.

| Date | From | Request | Owner | Status |
|---|---|---|---|---|
| 2026-09-22 | P4B | **Delete `ArticleModal.tsx`** — blocked on `app/page.tsx` still importing it. P3 must remove the import first, then P4B's delete can be applied. The file has NOT been deleted yet. | P3 | ✅ Done — P3 removed ArticleModal import from page.tsx. File can now be deleted. |
| 2026-09-22 | P4A/P4B | **`api.js` stub had TypeScript syntax in a .js file** — fixed in-place (`anyApi as any` → JSDoc cast). Will also be overwritten correctly when `npx convex dev` runs. | P1 infra | ✅ Fixed |
| 2026-09-22 | P4C | **`leads.ts:setStatus` patch type was `string` instead of union** — caused TS error during web build. Fixed in-place. | P1 infra | ✅ Fixed |

---

## Session log

Append one line per session. Never rewrite.

```
2026-09-22  Planning session. Explored the codebase, researched Next 16 + Convex
            integration, confirmed four decisions with Milan, wrote the full docs set
            (00–08, STATUS, 13 phase briefs) and the /portfolio driver skill.
            No application code touched. Next: P0.
2026-09-22  P1 complete. All 8 tables + auth tables in schema.ts (frozen). Every
            function in 02-DATA-MODEL.md implemented: projects, blog, leads, experience,
            skills, siteSettings, media + internal/{notify,revalidate,seed}. requireAdmin()
            written as single auth primitive. leads.submit has full validation, honeypot,
            rate limiting. Seed has all portfolioData.ts content. Backend typechecks clean.
            Root npm run build passes. Next: P2 + P6A can run in parallel.
2026-09-22  P6A complete. Admin shell, GitHub auth (convex-dev/auth), projects CRUD.
            Flat routes: /login, /dashboard, /dashboard/projects, /dashboard/projects/new,
            /dashboard/projects/[id]. No middleware (convex-auth#271). Shell gates on
            <Authenticated>/<Unauthenticated>. Real auth boundary = requireAdmin(ctx).
            ConvexAdminProvider wraps root layout. ProjectsList + ProjectEditor wired to
            api.projects.listAll / create / update / remove / setStatus.
            DashboardPage shows live stats via api.projects.listAll + api.blog.listAll +
            api.leads.unreadCount. Build: ✅ passes. tsc --noEmit: ✅ zero errors.
2026-09-23  P3 complete. Home page converted from static data to Convex reads.
            page.tsx: async Server Component, NO 'use client'. Fetches all 5 data
              sources (settings, projects, posts, experience, skills) via Promise.all.
            HomeClient.tsx: new 'use client' boundary. Modal state lives here.
              ArticleModal removed. WritingSection no longer takes onSelectArticle.
            lib/convex.ts: added SiteSettingsDoc, ExperienceDoc, SkillCategoryDoc types,
              formatLegacyDate(), getSiteSettings, getExperience, getSkillCategories.
              Function names verified: api.siteSettings.get, api.experience.listVisible,
              api.skills.listVisible.
            Navbar.tsx: usePathname, isHome guard on scroll-spy, hash-aware linkHref(),
              logo href flips home↔'/' on non-home routes. Scroll-spy early-return on
              non-home routes.
            Footer.tsx: usePathname, isHome-aware nav hrefs, settings prop for social
              links with fallbacks. PORTFOLIO_DATA import removed.
            All 8 section components updated: PORTFOLIO_DATA import removed, props
              accept Convex doc types + null guards, all ?? [] / ?? '' fallbacks.
              HeroSection, AboutSection, ProjectsSection, ExperienceSection,
              SkillsSection, HowIBuildSection, WritingSection, ContactSection.
            WritingSection: onSelectArticle removed, card click → Link /blog/[slug],
              "View all articles" → Link /blog, formatLegacyDate used on publishedAt.
            ProjectsSection: project.id → project.slug key, project.image → project.imageUrl.
            ProjectModal.tsx (outside P3 ownership — updated to fix build): switched from
              ProjectItem to ProjectDoc; project.image → project.imageUrl; slug lookup fixed.
            data/portfolioData.ts: NOT deleted.
            Build: ✅ passes. tsc --noEmit: ✅ zero errors.
            globals.css: scrollbar hex → var(--text-muted) / var(--text-secondary).
            HeroSection: text-white/slate-* → text-text-on-dark/*, bg-white → bg-text-on-dark,
              bg-black/40 → bg-surface-feature/60, border-white/* → border-text-on-dark/*.
            Footer: text-white/slate-* → text-text-on-dark/*, border-white/* →
              border-text-on-dark/*, from/via-white/* → from/via-text-on-dark/*, placeholder fixed.
            AboutSection: bg-black/80 → bg-surface-feature/80, bg-surface-well sticky note,
              text-white/slate-100 → text-text-on-dark, border-white/10 → border-text-on-dark/10.
            HowIBuildSection: text-slate-* in terminal → text-text-on-dark/*, bg-white/10 pill.
            SkillsSection: floating badge text-white/slate-300 → text-text-on-dark/*.
            ContactSection: bg-black/45 → bg-surface-feature/80, text-white → text-text-on-dark.
            ExperienceSection: logoVariantMap values text-white → text-text-on-dark,
              border-blue-300 → border-blue/30.
            UI: SectionHeader dark branch text-white/slate-* → text-text-on-dark/*.
              QuoteBox dark branch slate-* → text-on-dark/*. TechBadge all 4 variants cleaned.
              Handwriting colorMap blue→text-blue, charcoal→text-text-primary,
                white→text-text-on-dark, slate→text-text-secondary.
              CustomCursor text-white → text-text-on-dark.
            not-found.tsx: full dark surface token pass.
            Modals: ContactModal, ProjectModal, ResumeModal — all slate/white/gray/hex
              replaced with semantic tokens. bg-black/* → bg-surface-overlay.
            Permitted exception: ExperienceSection.tsx logoVariantMap keys remain as
              string identifiers matching portfolioData.ts values (not applied to DOM).
            Build: ✅ passes. tsc --noEmit: ✅ zero errors.
2026-09-23  P2 seed fixed. UTC date parsing (parseLegacyDate), correct body format
              (no injected headings), featured:false for all 4 blog posts,
              featured:true for all 4 projects. scripts/parity-check.mjs written —
              full field-by-field verification against expected constants.
              Needs: CONVEX_URL + npx convex run internal/seed:importLegacy to actually run.
            P5 complete. Design decision A (recessed inversion). Feature surfaces
              (bg-surface-feature) stay intentionally dark in both themes. 19 files
              updated, zero raw color classes remaining in components/ or app/.
              Build: ✅ passes. tsc --noEmit: ✅ zero errors.
            P6B complete. Blog list, editor (live Markdown preview, auto read-time,
              slug auto-derive, publishedAt datepicker, featured, SEO overrides, unsaved
              guard), MediaPicker dialog, MediaLibrary (upload, grid, alt required,
              dimensions, delete). All wired to api.blog.* and api.media.*.
            P6C complete. Leads inbox (status tabs, auto-mark-read, mailto: reply,
              private notes, status transitions). Experience editor (reorder, all fields,
              points list). Skills editor (iconKey dropdown validated against valid keys).
              Settings editor (7 tabs: Personal, Stats&Tech, About, Quotes, Handwriting
              with literal-\n handling + dead-data warning, How I Build, Contact Cards).
            P7 partial. /api/revalidate (REVALIDATE_SECRET guard), sitemap.ts (from
              Convex), robots.ts done. JSON-LD, OG images, and full deploy QA remain.
            Both apps: npm run build ✅ passes. tsc --noEmit ✅ zero errors.
            P2/P3 — see cross-phase requests below). Files created:
              lib/convex.ts (data helpers with unstable_cache, cacheComponents=false)
              app/projects/page.tsx, app/projects/[slug]/page.tsx
              app/blog/page.tsx, app/blog/BlogTagFilter.tsx (client filter)
              app/blog/[slug]/page.tsx, app/blog/[slug]/ViewCounter.tsx
              app/feed.xml/route.ts (RSS, dynamic)
              components/markdown/MarkdownRenderer.tsx (remark+remark-gfm+remark-html)
              components/modals/ContactModal.tsx (real Convex mutation, honeypot, errors)
            ProjectModal.tsx updated: "Full case study →" link added.
            Packages installed: remark, remark-html, remark-gfm, @tailwindcss/typography.
            Two P1 bugs fixed in-place (api.js TS-in-JS syntax, leads.ts patch type).
            NOTE: ArticleModal.tsx NOT deleted — app/page.tsx still imports it (P3 owns remove).
            NOTE: Navbar/Footer on sub-pages are static stubs — P3 will wire real components.
            NOTE: 'use cache' replaced with unstable_cache because cacheComponents=false.
            Build: ✅ passes. tsc --noEmit: ✅ zero errors.
2026-09-23  P2 done. Pushed functions to dev (sincere-duck-662) and ran the seed.
              Rows were stale from a pre-fix seed (bodies had `# Title`, featured flags
              wrong) and insert-if-missing skipped them — added {"overwrite": true} and
              repaired in place. parity-check.mjs compared with key-order-sensitive
              JSON.stringify (Convex sorts keys) → fixed with a stable serializer.
              Parity: zero diffs. Re-run: counts unchanged. portfolioData.ts untouched.
            P7 code. Found no mutation ever called internal.revalidate.ping — admin
              edits only reached the site after the 1h ISR window. Added
              convex/lib/revalidate.ts and wired every projects/blog/experience/skills/
              siteSettings mutation per 03-ROUTES §6.2 (old + new slug on rename).
              Home-only data re-tagged `home`. JSON-LD: Person (home), CreativeWork
              (projects), BlogPosting (posts), `<` escaped. OG cards via lib/og.tsx at
              /, /projects/[slug], /blog/[slug] — rendered and eyeballed, 1200×630.
              Removed static hero-desk og image from layout. Admin: robots.ts Disallow /
              + noindex meta. docs/DEPLOY.md written.
              Verified on `next start`: /api/revalidate 401 without / with wrong secret,
              200 with right one; sitemap 11 URLs; og:image + ld+json present on all 3
              page types. Not verifiable locally: end-to-end publish→revalidate (Convex
              cloud can't reach localhost, and no env vars are set on Convex yet).
            Found: sub-pages never got the real Navbar or P5 tokens → P5 🔁.
            Build: ✅ passes (both apps). tsc --noEmit: ✅ web, admin, backend.
2026-09-23  P5 rework. New components/SubPageShell.tsx (Navbar + Footer + contact/resume
              modals) wraps /projects, /projects/[slug], /blog, /blog/[slug]; the four
              copy-pasted stub headers/footers are gone. Navbar: solid on non-home routes
              (was transparent white-on-white — the P3 fix never landed), active link
              follows the route, "Let's Talk" no longer white-on-white in dark. Raw colors
              on those pages → tokens. --blue-light had no dark value (15 chips site-wide
              stayed pale) → added. Post bodies: dark:prose-invert.
              Verified via curl on `next start`: all 5 routes 200, real navbar/footer,
              zero stub classes. Chrome extension not connected — no visual pass.
            Admin auth → email + password (Milan's request). Added convex/http.ts (was
              missing, so Convex Auth never had routes). requireAdmin fails closed on
              ADMIN_EMAIL. Dev env: ADMIN_EMAIL, JWT_PRIVATE_KEY, JWKS set. Admin account
              created on dev. Verified: correct password → token; wrong password and
              another email → refused; users table has exactly 1 row.
            Build: ✅ both apps. tsc --noEmit: ✅ web, admin, backend.
2026-09-23  Pre-launch review + production deploy.
            Review (subagent, verified by hand) fixed: (1) leads.submit scheduled a
              nonexistent path (`internal` cast to any) → every contact submit threw and
              rolled back — reproduced on dev, fixed, re-tested: lead stored. notify.ts
              called an admin-gated query from a scheduled action and a missing
              _markNotified → added internal _get/_markNotified; sender now
              LEAD_NOTIFY_FROM ?? onboarding@resend.dev. (2) media-library covers
              (imageStorageId) never resolved → lib/images.ts in public queries.
              (3) blog.create rejected imageStorageId/seo/publishedAt → args added (schema
              unchanged). (4) LeadDetail notes box could save '' over notes. (5) user-facing
              errors now ConvexError + errorMessage() helper (prod masks plain Error).
              Also: ProjectModal hides Live/GitHub buttons without URLs; site-URL fallbacks
              → milankumawat.is-a.dev.
            Deploy: Convex prod env set (ADMIN_EMAIL, JWT keys, SITE_URL, REVALIDATE_SECRET),
              functions deployed, seeded, parity clean, admin account created on prod.
              Vercel: existing project re-rooted to apps/web + 3 env vars; new project
              milan-portfolio-admin (apps/admin). Pushed main → both build from GitHub.
            Admin build failed on Vercel: MarkdownPreview imports remark-* / unified that
              were only hoisted from apps/web → declared in apps/admin. Both Ready.
            Live checks (milankumawat.is-a.dev): 13 routes correct status incl. 404s;
              content from prod Convex; canonical/og:image/JSON-LD right on all 3 page
              types; sitemap 11 URLs; /api/revalidate 401; no secrets in client JS;
              Convex→site revalidate ping OK; prod lead stored (email skipped: no Resend).
              Admin: login form + noindex; scripted prod sign-in → admin queries OK,
              anon + wrong password refused.
            Lighthouse home perf 68 (LCP 5.1s) — Google Fonts @import was render-
              blocking → next/font. Now 74 home / 98 project / 99 post. Also title
              template, removed dead /favicon.ico link.
2026-09-23  Perf: home off the client tree. HomeClient deleted; page.tsx renders the
              sections as server components inside <ModalProvider> (context, modals
              loaded via next/dynamic on first open). Client islands: Navbar, CustomCursor,
              ModalTriggers, ScrollButtons, ContactCards, FooterIslands. Footer and
              SubPageShell are server components now. ConvexProvider removed from the
              root layout: ContactModal and the blog ViewCounter (dynamic, ssr:false)
              wrap themselves, so no Convex client/WebSocket on page load. About/Contact
              images lost `priority` (below the fold). Startup JS (gz): home 241→188KB,
              sub-pages 218→186KB. Local Lighthouse mobile, 3 runs each: before 83–85
              (TBT 40–170ms), after 85–88 (TBT 50–60ms); LCP ~3.7–4.1s on both.
              experimental.inlineCss tried: no LCP change, not kept.
2026-09-23  Perf pass 2 + fixes. LCP was Lighthouse-simulated (observed LCP = FCP
              ≈ 0.6s): offscreen fonts/images requested before first paint counted
              against it. Below-hero sections get `.defer-render`
              (content-visibility:auto); <DeferRenderGuard> adds `.render-all` before
              any in-page #jump or on /#hash arrival — without it mobile anchor jumps
              landed up to 5000px off. Caveat pinned to weight 400 (73→48KB). Local
              mobile Lighthouse: 92/92/92 (FCP 1.7s, LCP 3.2s, TBT 50ms, CLS 0.001).
              Anchors verified desktop + mobile, incl. deep links. Theme toggle used
              `theme` ('system') → first click was a no-op in dark OS mode; now
              `resolvedTheme`. ResumeModal mojibake (•, –) fixed.
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
