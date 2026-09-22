# P6A — Admin: Auth, Shell & Projects

| | |
|---|---|
| **Wave** | 5 — separate app; runs alongside Waves 2–4 |
| **Depends on** | P1 (frozen schema) only |
| **Blocks** | P6B, P6C — they mount inside this shell |

## Goal

A working, locked-down admin at `apps/admin`, and the first thing Milan can actually edit:
projects. Because this lives in a different app from the public site, the whole P6 track can
run in parallel with the public-site phases without a single file collision.

## Files owned

- `apps/admin/app/layout.tsx`
- `apps/admin/app/(auth)/**`
- `apps/admin/app/(dash)/layout.tsx`, `apps/admin/app/(dash)/page.tsx`
- `apps/admin/app/(dash)/projects/**`
- `apps/admin/components/shell/**`

## Read first

1. `docs/04-ADMIN-PANEL.md` — the screen specs
2. `docs/00-MASTER-PLAN.md` **§6 — the auth decision. Read it before writing any auth code.**
3. `docs/02-DATA-MODEL.md` — the `projects` functions

## Steps

1. **Auth, exactly as decided.** Convex Auth with GitHub OAuth, single admin identity.
   **No `middleware.ts`. No `proxy.ts`** — convex-auth#271 breaks `isAuthenticated()` on
   Next 16 and we route around it rather than through it.
2. The dashboard layout gates on `<Authenticated>` / `<Unauthenticated>`. **This is UX, not
   security.** The real boundary is `requireAdmin(ctx)` inside every Convex function, which
   P1 already wrote.
3. Admin shell: sidebar (Dashboard, Projects, Blog, Media, Leads, Experience, Skills,
   Settings), the signed-in identity, sign out. Later phases mount into this.
4. Dashboard: published project count, published post count, draft count, unread lead count,
   recent activity.
5. Projects list: all projects including drafts, status badges, drag-to-reorder writing the
   sparse `order` float, delete with confirmation.
6. Projects editor: every field in the `projects` table — title, subtitle, description,
   `longDescription`, tags, `keyFeatures`, `architecture`, `stats` pairs, `liveUrl`,
   `githubUrl`, `featured`, SEO fields.
7. **Slug handling.** Auto-generate from the title on create; editable; validated against
   the slug regex; uniqueness checked. Editing the slug of a published project must warn
   loudly — **it breaks a live URL**.
8. Draft/publish toggle. Publishing sets `publishedAt` on first publish and fires
   revalidation.
9. Use `preloadQuery` + `usePreloadedQuery`: the admin wants live reactivity, the opposite of
   the public site's static caching.

## Acceptance criteria

- [ ] Signing in with the admin GitHub identity works; signing out works
- [ ] A **different** GitHub account cannot read or write anything — test with a second
      account, do not assume
- [ ] **Calling a mutation directly from outside the UI while unauthenticated throws.** This
      is the security test that matters; the UI gate is not it.
- [ ] Creating, editing and deleting a project all work and appear in the public site after
      revalidation
- [ ] Drag-to-reorder persists and the public `/projects` order matches
- [ ] Draft projects are invisible on the public site
- [ ] Slug validation rejects invalid slugs and duplicates; editing a published slug warns
- [ ] The editor guards against navigating away with unsaved changes
- [ ] A Convex validation error surfaces as a readable message, not a blank screen
- [ ] `npm run build` passes for `apps/admin`; `npx tsc --noEmit` passes
- [ ] **No admin code appears in the public bundle** — check `apps/web`'s build output

## Commit

`feat(p6a): admin auth, shell and projects management`
