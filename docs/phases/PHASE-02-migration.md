# P2 — Content Migration & Seed

| | |
|---|---|
| **Wave** | 2 |
| **Depends on** | P1 (frozen schema) |
| **Runs with** | the P6A admin track, if that has started |

## Goal

Move all 540 lines of `data/portfolioData.ts` into Convex without losing a character, and
prove it. At the end of P2 the database holds the site's content and the site still renders
from the TypeScript file — reading from Convex is P3. Migration and cut-over are deliberately
separate phases so that if something is wrong, only one of the two is suspect.

## Files owned

- `packages/backend/convex/internal/seed.ts` — the real implementation
- `scripts/parity-check.mjs`

**Reads** `apps/web/data/portfolioData.ts`. **Does not edit or delete it.** See §Rollback.

## Read first

1. `docs/06-CONTENT-MIGRATION.md` — the field-by-field map. This phase implements that doc.
2. `docs/02-DATA-MODEL.md` — the destination shapes

## Steps

1. Implement `internal.seed.importLegacy` per `06-CONTENT-MIGRATION.md`, **idempotent on
   `legacyId`** — running it twice must not create duplicates, because it will be run twice.
2. Apply the transforms that are not 1:1, all of them listed in the migration doc:
   `id` → `slug` + `legacyId`; `date: '12 Sep 2026'` → `publishedAt` epoch ms;
   `readTime: '6 min read'` → `readTimeMinutes: 6`; `tag` → `tags: [tag]`;
   `content: string[]` → a single Markdown `body` joined with blank lines;
   `image` paths → `imageUrl` (files stay in `public/` for now).
3. Fill the fields that have no source: `status: "published"` for everything that exists
   today, `featured`, `order` as sparse floats in current array order, `views: 0`,
   `updatedAt`.
4. Seed the `siteSettings` singleton with every key of `PORTFOLIO_DATA.personal` plus
   `howIBuildSteps`, `howIBuildPillars` and `contactCards`.
5. **Migrate the handwriting strings verbatim — and do not try to make them work.** They
   contain literal `\n` escapes (two characters, not newlines). This object is currently
   **dead data**: no component reads it, the visible annotations are hardcoded at their call
   sites, and several stored values have drifted from what renders. Copy it across untouched
   and leave the reconciliation to Milan — `06-CONTENT-MIGRATION.md §Handwriting` has the
   mismatch table.
6. Write `scripts/parity-check.mjs`: read `portfolioData.ts`, read the Convex contents, diff
   field by field, print anything that differs. Pass means **zero** unexplained differences —
   the only acceptable diffs are the documented transforms.
7. Run the seed. Run the parity check. Fix. Repeat until clean.

## Acceptance criteria

- [ ] `npx convex run internal/seed:importLegacy` completes without error
- [ ] Running it a **second** time changes no row count and no document
- [ ] `scripts/parity-check.mjs` reports zero unexplained differences
- [ ] Row counts: 4 projects, 4 blog posts, 3 experience entries, 6 skill categories,
      exactly 1 `siteSettings`
- [ ] Every project slug matches its old id exactly: `hiro`, `salezo`, `autoresumebot`,
      `internal-tools`
- [ ] Every post slug matches: `building-ai-powered-fastapi`,
      `designing-scalable-backend-systems`, `lessons-from-autoresumebot`,
      `from-idea-to-production`
- [ ] Handwriting strings round-trip with their `\n` sequences intact — spot-check
      `aboutPhoto` and `skillsPhoto` character by character
- [ ] `publishedAt` values sort into the same order as the original display dates
- [ ] `data/portfolioData.ts` is **unmodified** — `git diff` on it is empty
- [ ] The site still builds and renders from the TypeScript file, unchanged

## Rollback

`data/portfolioData.ts` stays in the repo through P2, P3 and P7. It is the seed source of
record and the fallback if the read path misbehaves in production. It is safe to delete only
after P7 confirms the live site has been serving from Convex without incident — and deleting
it is a deliberate decision Milan makes, not a cleanup a phase does on its own.

## Open questions for Milan

`06-CONTENT-MIGRATION.md` lists content that looks like placeholder data — `liveUrl` values
pointing at `example.com`, GitHub URLs that may 404. Raise them **before** they become
published database rows, and record the answers in `STATUS.md §Open questions`.

## Commit

`feat(p2): migrate portfolio content into convex with parity checks`
