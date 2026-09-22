# P3 — Public Read Path & Routing Shell

| | |
|---|---|
| **Wave** | 2 |
| **Depends on** | P2 (content is in Convex) |
| **Runs with** | the P6 admin track |

## Goal

The home page starts reading from Convex, and the navigation stops assuming there is only
one page. Two jobs in one phase because they touch the same files and splitting them would
mean two phases fighting over `Navbar.tsx`.

**The rendered page must be pixel-identical when this phase ends.** Same sections, same
words, same spacing, same animations. Only the data's origin changes.

## Files owned

- `apps/web/app/page.tsx`, `apps/web/app/layout.tsx`
- `apps/web/components/HomeClient.tsx` — **new**
- `apps/web/lib/convex.ts` — **new**, the server-side fetch helpers
- `apps/web/components/Navbar.tsx`, `apps/web/components/Footer.tsx`
- All eight section components: `HeroSection`, `AboutSection`, `ProjectsSection`,
  `ExperienceSection`, `SkillsSection`, `HowIBuildSection`, `WritingSection`,
  `ContactSection` — their data source changes, so their props change

## Read first

1. `docs/03-ROUTES-AND-PAGES.md` — §Routing shell and §Home client boundary
2. `docs/01-ARCHITECTURE.md` — **§3, including the `no-store` trap.** Not optional.
3. `docs/02-DATA-MODEL.md` — the query names

## Steps

1. **Split the client boundary.** `app/page.tsx` becomes an `async` Server Component that
   fetches from Convex. A new thin `HomeClient.tsx` (`'use client'`) owns the four modal
   `useState` hooks that currently live in `page.tsx`. The eight sections keep their exact
   markup and receive data as props.
2. **Cache the fetches.** `fetchQuery` from `convex/nextjs` is `cache: "no-store"` internally,
   so an awaiting Server Component is dynamic by default. Wrap each fetch so the return
   value is cached — `'use cache'` + `cacheTag('home')` + `cacheLife('max')`. Put these
   helpers in `lib/convex.ts` so every later phase reuses them instead of reinventing them.
3. **One query per concern, and mind consistency.** `ConvexHttpClient` is stateless, so two
   `preloadQuery` calls on one page have no cross-query consistency. Data that must agree
   with itself is fetched in one query.
4. **Fix the navbar.** It is currently 100% hash anchors (`#home`, `#about`, …) driving a
   scroll-spy over eight section ids. Per `03-ROUTES-AND-PAGES.md`: links resolve to `#about`
   on the home page and `/#about` everywhere else, and the scroll-spy must not run — or
   crash — on routes that have no sections. `Footer.tsx` has its own six-item hash list
   including `#experience`; fix it the same way.
5. **Remove the `ArticleModal` usage** from `page.tsx`/`HomeClient.tsx` now, so P4B can
   delete the component without touching a file it does not own. Leave the file in place;
   deleting it is P4B's.
6. **Handle empty and failed states.** A query returning `null` or `[]` must render a sane
   page, not a crash. Milan could unpublish everything from the admin at any moment.

## Acceptance criteria

- [ ] `npm run build` passes; `npx tsc --noEmit` passes
- [ ] The home page renders **entirely from Convex** — verified by changing a value in the
      Convex dashboard and seeing it appear after revalidation
- [ ] Visual diff against `main`: identical. All eight sections, both quote boxes, every
      handwriting annotation, the custom cursor, all scroll animations
- [ ] Handwriting annotations still line-break correctly. Note they are **hardcoded at their
      call sites** today, not read from data — do not "fix" that in this phase, because
      wiring up the stored `handwriting` object would change the rendered page
      (`06-CONTENT-MIGRATION.md §Handwriting`)
- [ ] Project and article cards still open their modals
- [ ] `view-source` on `/` contains the actual content — this is the SEO proof that the page
      is server-rendered, not client-fetched
- [ ] Nav links scroll correctly on `/`, and a hash link from a future non-home route is
      written as `/#section`
- [ ] The scroll-spy does not throw when no spied section exists
- [ ] The page renders without crashing when a query returns `[]`
- [ ] No component imports `data/portfolioData.ts` any more **except** as a type source;
      the file itself is untouched

## Gotchas

- This is the phase where a tiny prop-shape mistake shows up as a blank section. Compare
  against a before-screenshot rather than trusting the page to look right.
- Do not "tidy" a section component while converting it. Props in, same JSX out.

## Commit

`refactor(p3): read home page content from convex and fix the routing shell`
