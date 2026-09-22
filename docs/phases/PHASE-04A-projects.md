# P4A — Projects Pages

| | |
|---|---|
| **Wave** | 3 — parallel with P4B and P4C |
| **Depends on** | P3 |
| **Must not touch** | anything blog or contact related |

## Goal

Every project gets a permanent, shareable, indexable URL, and an index page listing all of
them. The home page keeps its quick-look modal — this is the hybrid decision from
`00-MASTER-PLAN.md §3`, not a replacement.

## Files owned

- `apps/web/app/projects/page.tsx` — the index
- `apps/web/app/projects/[slug]/page.tsx` — the detail page
- `apps/web/app/projects/[slug]/opengraph-image.tsx`
- `apps/web/components/ProjectsSection.tsx`
- `apps/web/components/modals/ProjectModal.tsx`

## Read first

1. `docs/03-ROUTES-AND-PAGES.md` — the per-page specs
2. `docs/01-ARCHITECTURE.md` §3 and §7 — **`params` is a Promise in Next 16**
3. `docs/02-DATA-MODEL.md` — `projects.listPublished`, `projects.bySlug`

## Steps

1. `/projects` — the index, listing all published projects ordered by `order`, reusing the
   existing card design from `ProjectsSection`. Do not invent a new card.
2. `/projects/[slug]` — the detail page. It renders what `ProjectModal` renders today, but
   as a page: title, subtitle, cover image, `longDescription`, `keyFeatures`, `architecture`,
   `stats`, tags, and the live/GitHub links.
3. `generateStaticParams` from `projects.listPublished` so every project is prerendered.
   **If `cacheComponents` is on** (check `STATUS.md §Decisions`), returning `[]` is a build
   error — it must return at least one param.
4. `generateMetadata` — title, description from `seo` falling back to `description`, OG image,
   canonical URL. `params` is a Promise: `const { slug } = await params`.
5. `notFound()` when `bySlug` returns null. Drafts are filtered inside the query, so an
   unpublished project correctly 404s rather than leaking.
6. **Modal gains a permalink.** `ProjectModal` gets a "Full case study →" link to
   `/projects/[slug]`. The modal stays exactly as it is otherwise.
7. **Section gains a "View all".** `ProjectsSection` currently ends with a static
   "MORE PROJECTS COMING SOON..." status bar and left/right scroll buttons, with no way to
   reach a listing. Add a "View all projects" link to `/projects`, in the existing visual
   language.
8. Cache tags: `projects` for the index, `project:<slug>` for each detail page.

## Acceptance criteria

- [ ] `/projects` lists all 4 published projects, in `order`
- [ ] `/projects/hiro`, `/salezo`, `/autoresumebot`, `/internal-tools` all render
- [ ] A draft project 404s instead of rendering
- [ ] `/projects/does-not-exist` renders the 404 page
- [ ] `view-source` contains the project content — server-rendered, not client-fetched
- [ ] `generateMetadata` produces a unique title, description and canonical per project;
      verified by inspecting the built HTML, not by reading the code
- [ ] The home page modal still opens, and now offers the "Full case study" link
- [ ] "View all projects" reaches `/projects`
- [ ] Nav and footer links still work from `/projects/hiro` — i.e. `/#about` style, per P3
- [ ] `npm run build` prerenders the project routes; `npx tsc --noEmit` passes
- [ ] Nothing blog or contact related is in the diff

## Note

`/api/revalidate` belongs to P7. Until then, use a finite `cacheLife` rather than inventing a
revalidation endpoint here — two phases building the same endpoint is exactly what the
ownership rule exists to prevent.

## Commit

`feat(p4a): projects index and detail pages`
