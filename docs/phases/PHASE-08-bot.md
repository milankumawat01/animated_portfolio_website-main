# P8 — AI Assistant Bot

| | |
|---|---|
| **Status** | **FUTURE — designed, not scheduled.** Do not start without Milan asking. |
| **Depends on** | P7 (content and site stable in production) |

## Goal

A chat widget on the public site that answers questions about Milan's work, grounded in the
site's own content — projects, posts, experience, site copy. Not a general-purpose chatbot.

The full design lives in **`docs/07-FUTURE-BOT.md`**. This brief exists so the phase board
has a row for it, and so nobody builds a fragment of it early.

## Before any code

Resolve the open questions listed in `07-FUTURE-BOT.md`:

1. **Which embedding model and provider**, and its dimension count. `02-DATA-MODEL.md`
   sketches `contentChunks` with `dimensions: 1536` — that is an assumption and must be
   confirmed against the chosen model before the vector index is created, because changing
   it later means re-embedding everything.
2. **Whether Convex's `@convex-dev/rag` / Agent components are mature enough** to use instead
   of hand-rolling the pipeline. This was explicitly **not verified** during planning. Check
   it first — it may remove most of this phase.
3. Streaming transport, and whether conversations persist between visits.

## Constraints already verified

Convex vector search: **actions only**, 2–4096 dimensions, ≤16 filter fields, ≤4 vector
indexes per table, `limit` ≤256 (default 10), returns `{_id, _score}` so documents are
re-fetched in a follow-up query. Embeddings cannot be generated inside a query or mutation.

With roughly 50 documents, retrieval quality will be dominated by chunking strategy, not by
the vector index. Spend the effort there.

## Non-negotiables

- **Never invent facts about Milan.** Every answer is grounded in retrieved chunks, and the
  bot says it does not know rather than guessing.
- Cite the source page so a visitor can verify.
- Rate-limit per visitor using the hashed-IP pattern already in `rateLimits`.
- Hard token cap per session. An unbounded LLM endpoint on a public site is a bill waiting
  to happen.
- The site must work perfectly with the bot disabled.

## Commit

`feat(p8): grounded ai assistant over site content`
