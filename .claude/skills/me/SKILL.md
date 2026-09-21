---
name: me
description: Build Milan Kumawat's 3D scroll-driven portfolio. Reads the phase plan in docs/, figures out what to build next, and runs one phase or dispatches several phases in parallel as subagents. Use when the user types /me, or asks to start, continue, or check the status of the portfolio build.
---

# /me — Portfolio Build Driver

You are driving the build of Milan Kumawat's 3D portfolio. The entire plan already
exists in `docs/`. Your job is to figure out what comes next and execute it well.

**You are explicitly authorized to use the Agent tool** to dispatch phases as
subagents, including several in parallel. That is the intended way to run Wave 4.

---

## Step 1 — Always orient first

Read these two, every time, before doing anything else:

1. `docs/STATUS.md` — the phase board, asset checklist, and log
2. `docs/00-MASTER-PLAN.md` — the phase map and wave structure

Do not read every phase doc up front. Read only the ones you are about to run.

---

## Step 2 — Route on the argument

| User typed | Do this |
|---|---|
| `/me` | Report status, then **recommend the next action and ask for a go-ahead** |
| `/me next` | Run the next unblocked phase immediately, no confirmation |
| `/me p1` · `/me phase 3c` · `/me 3C` | Run that specific phase |
| `/me parallel 3a 3c 3e` | Dispatch those phases as concurrent subagents |
| `/me wave 4` | Dispatch the recommended batch for that wave |
| `/me status` | Print the board, blockers, measured budgets. Do not build. |
| `/me assets` | Report which assets are still missing and what they block |
| `/me plan` | Summarize the plan. Do not build. |
| anything else | Interpret it against the plan and act sensibly |

Phase ids are case-insensitive: `p3a`, `3a`, `3A`, `P3A` all mean the same phase.

---

## Step 3 — Running a single phase yourself

1. Verify its dependencies are `✅ Done` in `docs/STATUS.md`. If not, say so and offer
   to run the blocker instead.
2. Read, in order: `docs/02-ARCHITECTURE.md`, `docs/01-DESIGN-SYSTEM.md`, the relevant
   part of `docs/03-SCENE-BIBLE.md`, the phase's own doc in `docs/phases/`.
3. Set the phase row to `🟦 In progress` in `docs/STATUS.md`.
4. Build it. **Only touch the files the phase doc says you own.**
5. Run `pnpm build` and `pnpm lint`. Fix what breaks.
6. Check the acceptance criteria one by one. Do not claim a checkbox you did not verify.
7. Set the row to `✅ Done`, fill in measured budgets, append a log line.
8. Commit: `feat(p3a): hero station — particle monogram and dissolve`.

---

## Step 4 — Dispatching phases in parallel

Use this for Wave 4 (the eight stations) and for P5 + P6.

**Send all the Agent calls in a single message** so they run concurrently.

Read `docs/05-PARALLEL-PLAYBOOK.md` §3 and use its brief template. The essential parts
of every brief:

- The exact list of files that agent owns, copied from its phase doc
- The mandatory reading list, in order
- **"You may read anything. You may write nothing else."**
- The instruction to file cross-phase requests in `STATUS.md` rather than editing files
  it does not own
- The acceptance criteria and the budget it must verify with `?debug=1`

Recommended batches (from the playbook):

- Batch 1: **3A, 3C, 3E**
- Batch 2: **3B, 3D, 3F**
- Batch 3: **3G, 3H** — 3H must be last, it imports from 3A and 3B

Default to **three agents at a time**. If the user asks for all eight, do it, but say
once that reviewing eight parallel station implementations is hard and three is better.

After a batch returns:
1. Run `pnpm build`. If it fails, **fix it yourself** — do not re-dispatch the agent.
2. Open the site and scroll the whole page.
3. Update `docs/STATUS.md` with each agent's reported budgets.
4. Commit.
5. Only then start the next batch.

---

## Step 5 — Reporting back

Keep it short. After any run, tell the user:

- What phase completed, in one line
- Anything that got stubbed or substituted, and why
- Any **blocking asset** that is still missing (from `docs/04-ASSET-MANIFEST.md`)
- The single next recommended action

Do not paste file listings or full diffs. The user wants to know where the build is,
not to re-read the code.

---

## Rules

- **Never edit `src/scenes/index.ts` or `src/sections/index.ts` after P1.** They are
  permanently frozen. The registry entries already exist.
- **Never skip P1.** Every parallel phase depends on its contracts. A rushed P1 costs
  more than it saves.
- **Never mark a phase done without running the build.** "It should work" is not done.
- **Missing assets do not block a phase.** Every phase doc states its fallback. Build
  with the fallback, note it in `STATUS.md`, and move on.
- **Copy is verbatim** from `docs/06-CONTENT.md`. Never paraphrase Milan's words.
- If the user asks for something outside the plan, do it — then note in `STATUS.md`
  that the plan and the code have diverged, so the next session is not surprised.

---

## Quick reference

```
docs/00-MASTER-PLAN.md       vision, phase map, waves
docs/01-DESIGN-SYSTEM.md     tokens, type, motion
docs/02-ARCHITECTURE.md      contracts — the important one
docs/03-SCENE-BIBLE.md       the eight 3D stations
docs/04-ASSET-MANIFEST.md    what Milan must supply
docs/05-PARALLEL-PLAYBOOK.md file ownership, agent briefs
docs/06-CONTENT.md           every string
docs/STATUS.md               the board
docs/phases/PHASE-*.md       per-phase briefs
```

Dev URLs: `?debug=1` for the stats HUD, `?q=low|medium|high` to force a quality tier.
