# P1 — Schema & API Contract Freeze

| | |
|---|---|
| **Wave** | 1 — solo, blocking |
| **Depends on** | P0 |
| **Runs with** | nothing |

## Goal

Write `packages/backend/convex/schema.ts` and every function signature exactly as
`02-DATA-MODEL.md` specifies, then **freeze it**. After this phase, P2, P3, P4* and the whole
P6 admin track compile against these names. A field renamed after P1 breaks whatever is
running in parallel.

Function **bodies** may be stubs where a later phase owns the logic. Function **names,
arguments and return shapes** are final.

## Files owned

`packages/backend/convex/**` only:

- `schema.ts` — all nine tables, every index
- `projects.ts`, `blog.ts`, `leads.ts`, `experience.ts`, `skills.ts`, `siteSettings.ts`,
  `media.ts`
- `lib/auth.ts` — `requireAdmin()`
- `lib/validation.ts` — slug regex, lead field limits
- `internal/{notify,revalidate,seed}.ts` — signatures, stub bodies
- `auth.ts` — Convex Auth setup

**Touches no application code.** If `apps/web` needs a change, it is not P1's.

## Read first

1. `docs/02-DATA-MODEL.md` — implement it literally; it is the spec
2. `docs/01-ARCHITECTURE.md` — §6 security, §8 frozen contracts
3. `docs/00-MASTER-PLAN.md` — §6 the auth decision

## Steps

1. Transcribe every table from `02-DATA-MODEL.md` into `schema.ts` — `projects`, `blogPosts`,
   `leads`, `rateLimits`, `experience`, `skillCategories`, `siteSettings`, `media`, plus the
   Convex Auth tables spread. Do **not** create `contentChunks`; that is P8.
2. Every index exactly as named. Index names and field order are part of the contract.
3. `requireAdmin(ctx)` in `lib/auth.ts`: read `ctx.auth.getUserIdentity()`, compare against
   `ADMIN_IDENTITY`, throw otherwise. **This is the only authorization primitive in the
   codebase** — every mutation calls it first.
4. Set up Convex Auth with GitHub OAuth, single identity. **No `middleware.ts`, no
   `proxy.ts`** — see `00-MASTER-PLAN.md §6`.
5. Write every function from the §Function surface table with real argument validators and
   real return types. Public read queries (`listPublished`, `bySlug`) get working bodies now
   — P3 needs them immediately. Admin mutations may `throw new Error("not implemented")` if
   P6 owns the logic, but the signature is final.
6. `leads.submit` gets its **full** implementation now, including validation, honeypot and
   rate limiting — it is the one public write surface and P4C should be wiring a form to a
   finished function, not writing security logic under deadline.
7. Validation rules from `02-DATA-MODEL.md §Validation` go in `lib/validation.ts` and are
   enforced **in Convex**, not in the form.

## Acceptance criteria

- [ ] `npx convex dev` pushes the schema with no errors
- [ ] Every table, field, index and function name matches `02-DATA-MODEL.md` exactly —
      re-read the doc and diff it line by line
- [ ] `npx tsc --noEmit` passes in `packages/backend`
- [ ] `_generated/api.d.ts` is regenerated and committed
- [ ] `apps/web` can import `api` from `@portfolio/backend/convex/_generated/api` and
      autocomplete resolves
- [ ] `requireAdmin()` throws for an anonymous caller — verified from the Convex dashboard,
      not assumed
- [ ] `leads.submit` rejects: empty name, a 5-character message, a malformed email, a filled
      honeypot (which must return **success** while storing nothing), and a 4th submission
      inside an hour
- [ ] Draft filtering is inside the queries — `listPublished` cannot return a draft
- [ ] No raw IP is stored anywhere

## Gotchas

- Convex validators are strict. `v.optional()` and `v.union(..., v.null())` are different
  things; picking the wrong one now means a migration later.
- The `siteSettings` singleton is enforced by `key: v.literal("main")` plus a uniqueness
  check in the update mutation. Convex will not enforce one-row-ness for you.
- `order` is a sparse float (10, 20, 30) so rows can be dragged between each other without
  renumbering the table.

## Commit

`feat(p1): freeze the convex schema and function contract`
