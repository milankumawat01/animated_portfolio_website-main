# Playbook — file ownership, parallel rules, agent briefs

> How phases run without stepping on each other. `00-MASTER-PLAN.md` says *what* to build;
> this says *who may touch which file while doing it*.

---

## 1. The ownership rule

**A phase may write only the files it owns. It may read anything.**

Ownership is scoped to the phase's run, not forever. `ProjectsSection.tsx` is owned by P3
while P3 runs and by P4A while P4A runs — that is fine, because P3 finishes before P4A
starts. What is never allowed is **two phases in the same wave owning the same file**.

If a phase needs a change in a file it does not own, it does not make the change. It files a
**cross-phase request** in `STATUS.md` (§4) and works around it or stops.

---

## 2. Ownership map

Paths are post-P0, i.e. after the monorepo move.

### Wave 1 — solo, blocking

| Phase | Owns |
|---|---|
| **P0** | Everything, transiently. P0 *is* the restructure: root `package.json` + workspaces, the move of `app/`, `components/`, `data/` into `apps/web/`, `apps/web/{next.config.mjs,tailwind.config.js,postcss.config.js,tsconfig.json}`, the `apps/admin` skeleton, `packages/backend/**` scaffold, `convex.json`, `.gitignore`. Nothing else runs concurrently. |
| **P1** | `packages/backend/convex/**` only — `schema.ts`, every function module, `lib/auth.ts`. Touches no app code. |

### Wave 2

| Phase | Owns |
|---|---|
| **P2** | `packages/backend/convex/internal/seed.ts`, `scripts/parity-check.mjs`. **Reads** `apps/web/data/portfolioData.ts` — does not delete or edit it. |
| **P3** | `apps/web/app/page.tsx`, `apps/web/app/layout.tsx`, `apps/web/components/HomeClient.tsx` (new), `apps/web/lib/convex.ts` (new), `Navbar.tsx`, `Footer.tsx`, and all eight section components (`HeroSection`, `AboutSection`, `ProjectsSection`, `ExperienceSection`, `SkillsSection`, `HowIBuildSection`, `WritingSection`, `ContactSection`) — their data source changes, so their props change. |

### Wave 3 — parallel

| Phase | Owns | Must not touch |
|---|---|---|
| **P4A** | `apps/web/app/projects/page.tsx`, `apps/web/app/projects/[slug]/**`, `components/ProjectsSection.tsx`, `components/modals/ProjectModal.tsx` | Anything blog or contact |
| **P4B** | `apps/web/app/blog/page.tsx`, `apps/web/app/blog/[slug]/**`, `apps/web/app/feed.xml/route.ts`, `components/WritingSection.tsx`, `components/markdown/**` (new), **deletes** `components/modals/ArticleModal.tsx` | Anything project or contact |
| **P4C** | `components/modals/ContactModal.tsx`, `components/ContactSection.tsx`, `packages/backend/convex/leads.ts`, `packages/backend/convex/internal/notify.ts` | Anything project or blog |

All three need `app/page.tsx` to stop importing `ArticleModal` — **P3 does that removal in
advance**, so P4B's delete is safe and no Wave 3 phase touches `page.tsx`.

### Wave 4

| Phase | Owns |
|---|---|
| **P5** | Every component in `apps/web/components/**`, `apps/web/app/globals.css`, `apps/web/tailwind.config.js`, `apps/web/app/layout.tsx`, a new `ThemeProvider`. **Runs alone.** It touches ~20 files; nothing else may be in flight. |

### Wave 5 — separate app, runs alongside Waves 2–4

| Phase | Owns |
|---|---|
| **P6A** | `apps/admin/app/layout.tsx`, `apps/admin/app/(auth)/**`, `apps/admin/app/(dash)/layout.tsx`, `apps/admin/app/(dash)/page.tsx`, `apps/admin/app/(dash)/projects/**`, `apps/admin/components/shell/**` |
| **P6B** | `apps/admin/app/(dash)/blog/**`, `apps/admin/app/(dash)/media/**`, `apps/admin/components/editor/**` |
| **P6C** | `apps/admin/app/(dash)/leads/**`, `apps/admin/app/(dash)/experience/**`, `apps/admin/app/(dash)/skills/**`, `apps/admin/app/(dash)/settings/**` |

P6A must land before P6B/P6C — they mount inside its shell and use its auth gate.

### Wave 6

| Phase | Owns |
|---|---|
| **P7** | `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`, `apps/web/app/opengraph-image.tsx`, `apps/web/app/api/revalidate/route.ts`, analytics wiring, `vercel.json`, deploy docs |

`/api/revalidate` is owned by P7 but **needed** by P4A/P4B. Those phases ship with a
short `cacheLife` and no on-demand revalidation; P7 adds the instant path. Documented in
each brief so nobody invents it early.

---

## 3. Parallel execution

- **Send all Agent calls in a single message** so they actually run concurrently.
- **Three agents at a time, maximum.** Reviewing three parallel implementations is already
  hard; reviewing six is theatre.
- **Only Wave 3 (P4A/P4B/P4C) and the P6 track are parallel-safe.** Everything else is
  sequential by design.
- After a batch returns, in this order:
  1. `npm run build` from the root. **If it fails, fix it yourself** — do not re-dispatch.
  2. `npx tsc --noEmit` in each touched app.
  3. Open the site and click through what changed.
  4. Update `STATUS.md` with each agent's result.
  5. Commit.
  6. *Then* start the next batch.

---

## 4. Cross-phase requests

When a phase needs something outside its ownership, append to the **Cross-phase requests**
table in `STATUS.md`:

```
| 2026-09-30 | P4B | Navbar needs a /blog link | P3 owns Navbar.tsx | open |
```

The phase that owns the file picks it up, or the main session does it between waves. Nobody
edits around the rule because it was faster.

---

## 5. Agent brief template

Every dispatched phase agent gets exactly this. Fill the brackets; delete nothing.

```
You are running <PHASE ID> — <name> — of the Milan Kumawat portfolio build.

CONTEXT
  Repo: <abs path>. Monorepo: apps/web (public site), apps/admin (admin panel),
  packages/backend (Convex). The site is being migrated from hardcoded content in
  data/portfolioData.ts to a Convex backend. <one line on why this phase exists>

READ FIRST, IN THIS ORDER
  1. docs/STATUS.md              — confirm your dependencies are Done
  2. docs/00-MASTER-PLAN.md      — non-negotiables
  3. docs/01-ARCHITECTURE.md     — §7 Next.js 16 traps. Not optional.
  4. docs/02-DATA-MODEL.md       — the frozen contract
  5. docs/phases/<YOUR PHASE>.md — your brief
  6. <any other doc the brief names>

FILES YOU OWN
  <exact list, copied from the phase brief>

  You may read anything. You may write nothing else. If you need a change in a file you
  do not own, file a cross-phase request in STATUS.md (docs/08-PLAYBOOK.md §4) instead.

ACCEPTANCE CRITERIA
  <copied verbatim from the phase brief>

DEFINITION OF DONE
  npm run build passes from the repo root. npx tsc --noEmit passes. Every acceptance
  criterion verified by actually running it — not by reasoning that it should work.
  The public site's visual design is unchanged unless your brief says otherwise.

REPORT BACK
  What you built in 3 lines. Anything you stubbed and why. Any cross-phase request you
  filed. Do not paste diffs or file listings.
```

---

## 6. STATUS.md protocol

- **Update only your own row.** Never rewrite another phase's line.
- **Append** to the session log; never rewrite history.
- Flip to `🟦 In progress` when you start, `✅ Done` only when §7 of the master plan is
  satisfied.
- A session that ends mid-phase **must** leave the row at `🟦 In progress` with a log line
  saying where it stopped. That line is what the next `/portfolio` reads to resume.

---

## 7. Commits

`<type>(<phase>): <what changed>` — imperative, lowercase, no trailing period.

```
feat(p0): convert to workspaces and scaffold the convex backend
feat(p4b): blog index and post pages with markdown rendering
fix(p3): keep hero stats rendering when settings query returns null
docs(p1): freeze the schema contract
```

One phase per commit where possible. Never commit `.env.local`, Convex deploy keys, or the
Resend key.
