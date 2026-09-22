---
name: portfolio
description: Build and continue Milan Kumawat's portfolio backend — the Convex migration, blog, leads, dark mode, multi-page routing and the separate admin panel. Reads the phase plan in docs/, works out what comes next, and runs one phase or dispatches several in parallel as subagents. Use when the user types /portfolio, or asks to start, continue, resume or check the status of the portfolio build.
---

# /portfolio — Portfolio Build Driver

You are driving the build that turns Milan Kumawat's portfolio from a static single-page site
into a full product: a Convex backend, a real blog, captured leads, dark/light mode, multiple
pages, and a separate admin panel.

**The entire plan already exists in `docs/`.** Your job is to work out what comes next and
execute it well — not to redesign it.

**You are explicitly authorized to use the Agent tool** to dispatch phases as subagents,
including several in parallel. That is the intended way to run Wave 3 and the P6 admin track.

---

## Step 1 — Always orient first

Read these two, every time, before doing anything else:

1. **`docs/STATUS.md`** — the phase board, decisions, open questions, session log
2. **`docs/00-MASTER-PLAN.md`** — the phase map and the non-negotiables

Do not read every phase doc up front. Read only the ones you are about to run.

**If a row says `🟦 In progress`, a previous session stopped mid-phase.** Before touching
anything: read the last session-log line, run `git status` and `git diff` to see what actually
landed, and reconcile. Continue from there or roll back deliberately — never start the phase
over on top of half-finished work.

---

## Step 2 — Route on the argument

| User typed | Do this |
|---|---|
| `/portfolio` | Report status, then **recommend the next action and ask for a go-ahead** |
| `/portfolio next` | Run the next unblocked phase immediately, no confirmation |
| `/portfolio p0` · `/portfolio 4b` · `/portfolio P4B` | Run that specific phase |
| `/portfolio parallel 4a 4b 4c` | Dispatch those phases as concurrent subagents |
| `/portfolio admin` | Work the P6 admin track (P6A → P6B/P6C) |
| `/portfolio status` | Print the board, blockers and open questions. **Do not build.** |
| `/portfolio plan` | Summarize the plan. **Do not build.** |
| `/portfolio docs` | Reconcile the docs with reality after a divergence |
| anything else | Interpret it against the plan and act sensibly |

Phase ids are case-insensitive: `p4a`, `4a`, `4A`, `P4A` all mean the same phase.

---

## Step 3 — Running a single phase yourself

1. **Check dependencies** in `docs/STATUS.md`. If a dependency is not `✅ Done`, say so and
   offer to run the blocker instead.
2. **Read, in order**: `docs/01-ARCHITECTURE.md` (§7 Next.js 16 is not optional),
   `docs/02-DATA-MODEL.md`, the phase's own brief in `docs/phases/`, and any doc that brief
   names.
3. **Read the Next.js docs before writing Next.js code.** `AGENTS.md` says this version
   differs from training data, and it is right — see `01-ARCHITECTURE.md §7` for the traps
   already found. `node_modules/next/dist/docs/` exists once dependencies are installed.
4. Set the phase row to `🟦 In progress` in `docs/STATUS.md`.
5. **Build it. Only touch the files the phase brief says you own.** (`docs/08-PLAYBOOK.md §2`)
6. Run `npm run build` from the repo root and `npx tsc --noEmit` for each app touched. Fix
   what breaks.
7. **Verify each acceptance criterion one by one.** Do not tick a box you did not test. "It
   should work" is not verification.
8. Set the row to `✅ Done` and append a dated line to the session log.
9. Commit with the message at the bottom of the phase brief.

---

## Step 4 — Dispatching phases in parallel

Use this for Wave 3 (P4A/P4B/P4C) and for the P6 admin track.

**Send all the Agent calls in a single message** so they run concurrently.

Use the brief template in `docs/08-PLAYBOOK.md §5`. Every brief must carry:

- The exact list of files that agent owns, copied from its phase doc
- The mandatory reading list, in order
- **"You may read anything. You may write nothing else."**
- The instruction to file cross-phase requests in `STATUS.md` rather than editing files it
  does not own
- The acceptance criteria, verbatim

**Three agents at a time, maximum.** After a batch returns:

1. Run `npm run build`. **If it fails, fix it yourself** — do not re-dispatch the agent.
2. Run `npx tsc --noEmit` per app.
3. Open the site and click through what changed.
4. Update `docs/STATUS.md` with each agent's result.
5. Commit.
6. **Only then** start the next batch.

---

## Step 5 — Reporting back

Keep it short. After any run, tell Milan:

- What phase completed, in one line
- Anything stubbed or substituted, and why
- Any open question from `STATUS.md` that is now blocking
- The single next recommended action

Do not paste file listings or full diffs. He wants to know where the build is, not to re-read
the code.

---

## Rules

- **Never mark a phase done without running the build.** `00-MASTER-PLAN.md §7` is the bar.
- **Never change the Convex schema without updating `docs/02-DATA-MODEL.md` in the same
  commit.** It is the contract the parallel phases compile against.
- **Never change the public site's visual design** except in the phase that owns that change.
  Content moving from a TypeScript file to a database must be invisible to a visitor.
- **Never edit a file the running phase does not own.** File a cross-phase request in
  `STATUS.md` instead (`08-PLAYBOOK.md §4`).
- **Never commit secrets.** Convex deploy keys, the Resend key and the revalidation secret
  live in the Convex and Vercel dashboards. `.env.local` stays gitignored.
- **Never lose a lead.** Storage first, notification second, always.
- **Copy is Milan's.** Migrate his words verbatim; never improve them in passing.
- **Never delete `data/portfolioData.ts`** before P7, and then only if Milan says so.
- If Milan asks for something outside the plan, do it — then note in `STATUS.md` that the
  plan and the code have diverged, so the next session is not surprised.
- **Always leave `STATUS.md` accurate before the session ends.** A session that stops
  mid-phase leaves the row `🟦 In progress` plus a log line saying exactly where it stopped.
  That line is what the next `/portfolio` resumes from. This is the single most important
  habit in this build.

---

## Quick reference

```
docs/00-MASTER-PLAN.md        vision, decisions, phase map, non-negotiables
docs/01-ARCHITECTURE.md       topology, data flow, env, Next 16 traps
docs/02-DATA-MODEL.md         the frozen schema + function contract
docs/03-ROUTES-AND-PAGES.md   the sitemap and per-page specs
docs/04-ADMIN-PANEL.md        apps/admin — auth, screens, editors
docs/05-DESIGN-SYSTEM.md      tokens and the two-way theme model
docs/06-CONTENT-MIGRATION.md  portfolioData.ts → Convex, field by field
docs/07-FUTURE-BOT.md         the AI assistant, designed not built
docs/08-PLAYBOOK.md           file ownership, agent briefs, parallel rules
docs/STATUS.md                THE BOARD — start here, finish here
docs/phases/PHASE-*.md        one brief per phase
```

```bash
npm run build                 # from the repo root — the gate for every phase
npx tsc --noEmit              # per app
npx convex dev                # ONCE, from packages/backend — never from an app
```

**Phase order:** P0 → P1 → P2 → P3 → {P4A ‖ P4B ‖ P4C} → P5 → P7
**In parallel, any time after P1:** P6A → {P6B ‖ P6C}
