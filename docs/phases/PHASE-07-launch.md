# P7 — SEO, Performance, QA & Deploy

| | |
|---|---|
| **Wave** | 6 |
| **Depends on** | P5 and the P6 track |
| **Runs with** | nothing |

## Goal

Ship it. Close the loop on revalidation, make the site legible to crawlers and social
previews, and get both apps live on their own domains.

## Files owned

- `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`
- `apps/web/app/opengraph-image.tsx`
- `apps/web/app/api/revalidate/route.ts`
- analytics wiring, `vercel.json`, deployment notes in `docs/`

## Read first

1. `docs/03-ROUTES-AND-PAGES.md` — §Revalidation and §SEO
2. `docs/01-ARCHITECTURE.md` — §5 deployment, §6 security

## Steps

1. **`/api/revalidate`** — the endpoint every earlier phase deferred to this one. It verifies
   `REVALIDATE_SECRET` and returns 401 otherwise, then calls `revalidateTag(tag, 'max')`.
   **`revalidateTag` requires a second argument in Next 16**; a single-argument call is a
   type error.
2. Wire `internal.revalidate.ping` to it and switch the P4A/P4B pages from their interim
   finite `cacheLife` to on-demand revalidation.
3. `sitemap.ts` generated from Convex — home, `/projects`, every published project, `/blog`,
   every published post. Drafts must never appear. Note that `sitemap({ id })` receives `id`
   as a Promise in Next 16.
4. `robots.ts` — allow the public site, **disallow everything on the admin domain**.
5. OG images: a default for the site, per-project and per-post images from P4A/P4B. Verify in
   a real social preview debugger, not by eye.
6. JSON-LD: `Person` on the home page, `BlogPosting` on posts, `CreativeWork` on projects.
7. Analytics (Vercel Analytics is the low-friction default). No third-party script that
   watches visitors beyond what Milan actually wants.
8. Performance pass: Lighthouse on home, a project page and a post page. Check image sizing,
   font loading (four families are loaded from Google Fonts), and the client bundle after all
   the phases have added to it.
9. Deploy: two Vercel projects per `01-ARCHITECTURE.md §5`. **Only `apps/web` runs
   `npx convex deploy --cmd 'npm run build'`** — two projects deploying the same backend is a
   race. Wire the domains.
10. Full QA pass across both apps and both themes.

## Acceptance criteria

- [ ] Publishing from the admin updates the public site **within seconds**, end to end
- [ ] `/api/revalidate` returns 401 without the secret — tested with curl
- [ ] `sitemap.xml` lists every published route and **no drafts**
- [ ] `robots.txt` disallows the admin domain
- [ ] OG previews render correctly for home, a project and a post, verified in a preview
      debugger
- [ ] JSON-LD validates in a structured-data tester
- [ ] Lighthouse ≥ 90 for Performance, Accessibility, Best Practices and SEO on all three
      page types
- [ ] Both apps deploy; both domains resolve over HTTPS
- [ ] The admin domain is not indexable and not linked from the public site
- [ ] A full click-through of the live site in **both themes** on desktop and mobile
- [ ] A real lead submitted on production arrives in the inbox and in Milan's email
- [ ] No secret is present in any client bundle — grep the build output

## Post-launch

- Decide, deliberately, whether `data/portfolioData.ts` can now be deleted
  (`PHASE-02-migration.md §Rollback`). It is Milan's call, not a phase's.
- Record anything that diverged from these docs in `STATUS.md`, so `/portfolio` starts the
  next session from the truth.

## Commit

`feat(p7): seo, revalidation, analytics and production deploy`
