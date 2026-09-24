# RESUME — Admin panel redesign (continue from here)

Hand-off from three Codex sessions on 2026-09-24 (the last one ran out of
context right at final verification). Read this instead of the old session
history. The full original brief is in `RESUME-spec.md` — open it only when you
need the exact wording of a requirement.

## Repo layout

- `apps/web` — public portfolio (Next 16), `next dev` on **:3000**
- `apps/admin` — admin CMS (Next 16), `next dev --port 3001`
- `packages/backend` — Convex backend (`convex dev` / `convex deploy`)
- Deploy: push to GitHub `main` → Vercel deploys **both** apps. Convex is
  deployed **separately** with `npx convex deploy` in `packages/backend`, and
  must go out *before* a frontend that calls new functions.
- Next 16 has breaking changes — read `node_modules/next/dist/docs/` before
  touching routing/config (see `AGENTS.md`).

## What is already done

**Session 1 (committed, live — commit `3006391`):** admin narrowed to
Dashboard, Projects, Blog, Experience, Skills, Media, Leads. Old content
settings (Personal, Stats & Tech, About, Quotes, Handwriting, How I Build,
Contact Cards) removed from admin; that copy is now static config in code.
Added blog scheduling/archiving (backend job publishes scheduled posts),
project gallery + case-study URL, media library for images/videos/documents on
R2 with usage lookup, replace and reference-safe delete, lead statuses
(new/contacted/in discussion/converted/closed), notes and activity timeline.

**Session 3 (the UI redesign — this is the work in progress):** following the
brief in `RESUME-spec.md` and the reference images `my_assets/image.png`,
`my_assets/image copy.png` (dashboard + empty states) and
`my_assets/image copy 2.png` (login concept).

- New admin shell: dark sidebar (`components/shell/Sidebar.tsx`, icons in
  `components/shell/icons.tsx`), top bar with Ctrl+K global search over
  projects, posts, leads and media (`components/shell/TopBar.tsx`).
- Design tokens + all page styles in `apps/admin/app/admin.css`.
- One shared confirm dialog + toast system: `components/ui/Feedback.tsx`
  (`useFeedback()` → `toast`, `confirm`). All native `alert`/`confirm` replaced.
- Dashboard redesigned, data-driven, works with zero data
  (`app/dashboard/page.tsx`), plus `app/dashboard/loading.tsx` and
  `app/dashboard/error.tsx`.
- Login restyled after the reference, **same email/password auth** (the
  reference's extra sign-in options are intentionally not implemented).
- Projects/Blog lists: shared toolbar and action patterns; Media has grid and
  list views; MediaPicker has search, filters, preview, upload, explicit
  selection (still returns the same URL values editors store).
- Experience/Skills editors restyled, keyboard-accessible expand rows, toasts.
- Leads: date filter, admin **create/edit** of leads, confirm on destructive
  actions. Backend: `leads.createAdmin`, `leads.updateAdmin` mutations and
  `'admin'` added to the lead `source` union in `schema.ts` (additive only).
- `app/dashboard/settings/page.tsx` — System settings page (auth/system only,
  no old content settings).
- `aria-label`s added across Project/Blog editor inputs.

Last verified by Codex before it stopped: admin `typecheck`, `lint`, `build`
and backend `tsc` passed; `/login` and `/dashboard` returned 200 locally.
**No visual/browser pass was done** (no browser was available).

## What is left

1. Run `npm run build`, `npm run lint`, `npm run typecheck` from the repo root
   and fix anything that fails.
2. Walk the **FINAL QA** list at the end of `RESUME-spec.md` in a real browser
   (admin on :3001): every CRUD flow for Projects, Blog, Experience, Skills,
   Media and Leads; responsive (mobile drawer, tables → cards, modals → sheets);
   keyboard nav + focus trap + Esc; loading/empty/error states; console errors;
   horizontal overflow.
3. Compare against the brief's component list (PageHeader, FilterBar,
   DataTable, EmptyState, skeletons, etc.) and fill real gaps — reuse shared
   components, don't duplicate. Don't add analytics/charts or bring back
   content settings.
4. Ship: `npx convex deploy` in `packages/backend` **first**, then commit and
   push `main` (Vercel deploys web + admin). Check both Vercel deployments are
   READY: public site https://milankumawat.is-a.dev/ and admin
   https://milan-portfolio-admin.vercel.app/login.

## Rules from the brief (short version)

Preserve all existing functionality, routes, slugs, IDs, icon keys, auth and
data. No fake APIs, no mock data, no unnecessary schema changes, no browser
alert/confirm, no lorem ipsum, no TODOs for obvious UI work. Light UI, dark
navy sidebar, indigo accent, subtle borders/shadows, minimal animation. Keep
the public portfolio (`apps/web`) untouched unless needed for compatibility.
