# Future — AI Assistant Bot (P8)

> ## ⚠ DESIGNED, NOT BUILT
>
> **Nothing in this document exists in the codebase.** There is no `contentChunks` table, no
> embedding job, no chat widget, no API key, and no line of bot code anywhere in this repo.
>
> P8 is **unscheduled**. It is not in any wave, it has no start date, and it is not a
> dependency of P7 or of launch (`00-MASTER-PLAN.md §5`). The site ships, and is finished,
> without it.
>
> This file exists for one reason: so that the decisions P1 froze — Markdown bodies,
> structured content in Convex, the sketched `contentChunks` shape — are decisions someone
> made on purpose rather than accidents we later have to undo. **Do not implement any of
> this because you read it here.** It runs when Milan says it runs, against a written phase
> brief at `docs/phases/PHASE-08-bot.md`, which also does not exist yet.
>
> Everything below §6 is unresolved. Read §6 before costing or scheduling anything.

---

## 1. What it is

A small chat widget on the public site that answers questions about Milan's work, grounded
in the site's own content.

**In scope:**

- "What has Milan built with FastAPI?"
- "Does he have experience with vector databases?"
- "Summarise the Hiro project."
- "What did he write about AI-powered APIs?"
- "How do I get in touch?"

**Out of scope, explicitly:**

- General-purpose chat. It is not a ChatGPT box wearing Milan's colours.
- Anything not present in `projects`, `blogPosts`, `experience`, `skillCategories` or
  `siteSettings`. If the content does not say it, the bot does not know it.
- Speaking *as* Milan in the first person. It speaks *about* him, in the third person, like
  a knowledgeable assistant — a recruiter must never be able to quote a commitment "Milan"
  made in a chat window.
- Taking actions. It does not book calls, send email, or write leads. It can point at the
  contact form; the contact form does the rest.

The audience is recruiters, hiring managers and collaborators who land on the site and have
one specific question. The success condition is a correct, cited, short answer — or an
honest "that is not on the site, here is the contact form".

---

## 2. Why Convex makes this cheap

**Vector search is built into Convex.** No Pinecone, no Weaviate, no pgvector instance, no
second database to sync, no extra bill. This was one of the reasons Convex was chosen
(`00-MASTER-PLAN.md §3`) — the bot phase needs **no new infrastructure service**, only an
embeddings provider and the Claude API.

### Verified constraints

These are properties of `ctx.vectorSearch`, and they shape the design rather than the other
way round.

| Constraint | Value | Consequence |
|---|---|---|
| Callable from | **Actions only** | Not in a query, not in a mutation. The whole retrieval path is an action. |
| Dimensions | **2 – 4096** | 1536 fits. Confirm against the chosen model — §6. |
| Filter fields | **≤ 16** per vector index | We use one (`sourceType`). Ample. |
| Vector indexes | **≤ 4 per table** | We use one. |
| `limit` | **≤ 256**, default **10** | Pass it explicitly; the default is not a design choice. |
| Return shape | **`{ _id, _score }` only** | The text is *not* returned. Documents must be re-fetched. |

Call shape:

```ts
const results = await ctx.vectorSearch("contentChunks", "by_embedding", {
  vector: questionEmbedding,
  limit: 8,
  filter: (q) => q.eq("sourceType", "post"),   // optional
});
// results: { _id: Id<"contentChunks">, _score: number }[]
```

**The return shape is the one that surprises people.** `vectorSearch` gives back ids and
cosine scores, nothing else. The action then calls a normal `internal.query` that loads
those ids and returns the chunk text. Two hops, always. Any design that assumes the text
comes back from the vector search is wrong and will be rewritten.

### The table

`contentChunks` and its `by_embedding` vector index are **already sketched in
`02-DATA-MODEL.md §Future — P8, not created yet`**. That sketch is the reference. Do not
redefine the shape here, in a phase brief, or in `schema.ts` with different fields — if the
shape needs to change, change it in `02-DATA-MODEL.md` first, in the same commit, per
`00-MASTER-PLAN.md §8`.

For orientation only: `sourceType` (`"project" | "post" | "settings"`), `sourceId`,
`chunkIndex`, `text`, `embedding`, with `by_source` for sync and `by_embedding` for
retrieval. The only field P8 is likely to *want* to add is a denormalised `title` and `url`
so citations do not need a third fetch — that is a schema change, and it goes through the
contract.

---

## 3. Ingestion pipeline

Content is embedded when it changes, not on a schedule and never on read.

```
admin mutation (blog.update / projects.setStatus / siteSettings.update …)
   ├─ requireAdmin(ctx)
   ├─ patch the document
   ├─ scheduler.runAfter(0, internal.revalidate.ping, { tags })    ← already exists
   └─ scheduler.runAfter(0, internal.embeddings.reindex,           ← P8 adds this
        { sourceType, sourceId })
                    │
                    ▼
          internal action: reindex
            1. fetch the source document (internal query)
            2. if unpublished or deleted → delete its chunks, stop
            3. chunk the text
            4. embed every chunk (batched, one API call)
            5. replace this source's chunks (internal mutation)
```

**Why an action, and why scheduled.** Embeddings come from an HTTP API, and **Convex
queries and mutations cannot make network calls** — only actions can. The mutation therefore
schedules; it does not await. That also keeps the admin's Save fast and keeps a flaky
embeddings provider from ever failing a content save. Same discipline as the lead pipeline:
**store first, side-effect second** (`00-MASTER-PLAN.md §8`).

### Chunking

Markdown is chunked by structure, not by a blind character window.

- Split on headings first, then on paragraph boundaries within an over-long section.
- Target roughly 400–800 tokens per chunk with a small overlap (~15%) so a sentence spanning
  a boundary is still retrievable.
- **Never split a fenced code block.** Keep it whole and attached to the prose above it; a
  half-function retrieved out of context is worse than no chunk.
- Prepend a breadcrumb to every chunk's `text` — `"Blog post: <title> — <heading>"`,
  `"Project: <title> — Key features"`. It embeds the chunk's provenance into the vector and
  it gives the prompt something to cite without a second lookup.

Per source type:

| Source | What gets chunked |
|---|---|
| `project` | `title`, `subtitle`, `description`, `longDescription`, `keyFeatures`, `architecture`, `tags`, `stats` — flattened into readable prose, not JSON |
| `post` | `title`, `excerpt`, `body` (the Markdown), `tags` |
| `settings` | `personal.bio`, `aboutPillars`, `whatIWorkOn`, `howIBuildSteps`, `howIBuildPillars`, plus `experience` and `skillCategories` rows |

`settings` is one logical source made of several tables. Give it stable synthetic
`sourceId`s (`"bio"`, `"how-i-build"`, `"experience:<id>"`) so the delete-and-replace below
stays surgical.

Handwriting strings, quotes and contact cards are **not** embedded. They are decoration and
navigation; embedding them only adds noise a retriever will occasionally prefer.

### Keeping chunks in sync

The rule is **delete-then-insert per source, inside one mutation**. Never patch chunks in
place, and never try to diff them — chunk boundaries move when a paragraph is edited, so
`chunkIndex` 3 after an edit is not the same text as `chunkIndex` 3 before it.

```
reindex(sourceType, sourceId):
  chunks = await chunk(document)
  vectors = await embedBatch(chunks)          ← in the action, before the mutation
  await ctx.runMutation(internal.embeddings.replace, {
    sourceType, sourceId, rows: chunks.zip(vectors)
  })

replace():                                    ← one transaction
  for old of db.query("contentChunks").withIndex("by_source", …)  → db.delete(old)
  for row of rows                                                 → db.insert(row)
```

Embedding happens in the **action**; the delete-and-reinsert happens in a **single
mutation** so the table is never observed half-empty. Convex mutations are transactional —
use that.

Triggers, exhaustively:

| Event | Effect |
|---|---|
| Post/project created or updated while `published` | reindex that source |
| Post/project published (`setStatus → published`) | reindex that source |
| Post/project unpublished (`setStatus → draft`) | **delete** its chunks — a draft must never be retrievable, same rule as `01-ARCHITECTURE.md §6` |
| Post/project deleted (`remove`) | delete its chunks |
| Experience / skills / settings updated | reindex the affected synthetic source |
| Visibility toggled off (`visible: false`) | delete its chunks |
| Embedding model or chunking strategy changed | **full rebuild** — a one-shot internal action; vectors from two different models are not comparable and mixing them silently degrades every result |

Deleting chunks on unpublish is not optional. A bot that will happily summarise an
unpublished draft is a content leak that does not show up in any HTML.

---

## 4. Query pipeline

One action, start to finish, because `ctx.vectorSearch` is actions-only.

```
visitor question
   │
   ▼  action: internal.bot.ask  (public entry point wraps it with the guardrails in §5)
   │
   ├─ 1. rate-limit check          hashed IP, rateLimits table  (§5)
   ├─ 2. embed the question        same model, same dimensions as ingestion
   ├─ 3. ctx.vectorSearch("contentChunks", "by_embedding", { vector, limit: 8 })
   │                                  → [{ _id, _score }]
   ├─ 4. drop results below a score floor
   ├─ 5. ctx.runQuery(internal.bot.loadChunks, { ids })   ← the re-fetch; see §2
   ├─ 6. if nothing survives → return the grounded refusal, do NOT call Claude
   ├─ 7. build the prompt: system rules + numbered chunks with their source URLs
   ├─ 8. call Claude — model `claude-sonnet-5`
   └─ 9. stream the answer back to the widget
```

**The model is `claude-sonnet-5`.** Grounded question-answering over a handful of retrieved
chunks is exactly the workload Sonnet is priced for — this is a public widget on a personal
site, and the per-answer cost matters more than the last few points of reasoning quality.
Build against the official Anthropic SDK (`@anthropic-ai/sdk`), and keep the model id in one
constant so a swap is one line. Pull the current request shape from the `claude-api` skill
when the phase runs rather than from memory — the API moves, and this document is a plan,
not an API reference.

**Prompt shape** (sketch, to be tuned against real questions):

- **System:** who the assistant is, that it answers only from the provided context, that it
  answers in the third person about Milan, that it cites, that it says "that's not on the
  site" rather than guessing, and that it stays short.
- **Context:** the surviving chunks, numbered, each with its title and public URL.
- **User:** the question, plus the last few turns for follow-ups ("what about the backend?").

**Never put the raw chunks in the user turn and hope.** The system prompt carries the rules;
the context block carries the facts; the retrieved text is **data, not instructions**. A
blog post that happens to contain the words "ignore previous instructions" must not be able
to steer the answer — an explicit instruction to that effect belongs in the system prompt.

**Streaming.** Stream the response so the widget shows text within a second instead of a
long dead pause. Transport is unresolved — §6.

**Cheap win:** the system prompt and the rules block are identical on every request. Put a
cache breakpoint after them; the per-question delta is the context and the question.

---

## 5. Guardrails

This is a public endpoint with a paid API behind it. It gets treated with the same suspicion
as `leads.submit` (`01-ARCHITECTURE.md §6`), plus a spend ceiling.

### Grounding

- **Every claim comes from a retrieved chunk.** No parametric knowledge about Milan. If the
  chunks do not support it, the answer does not contain it.
- **If retrieval returns nothing above the score floor, the model is never called.** Return
  a fixed string — "I can only answer from what's on this site. Try asking about a project,
  or use the contact form." — and save the tokens. Most off-topic questions die here, for
  free, before any API cost is incurred.
- **Cite the source page** on every answer: the project or post title as a link to its
  permalink. Citations are the user's only way to check the bot, and the fastest way for us
  to notice it inventing things.
- **Never invent facts about Milan** — no inferred years of experience, no "he probably", no
  guessed salary expectations, availability, rates, or opinions. Absent information is
  answered as absent.

### Deflection

Off-topic questions get one polite sentence redirecting to what the bot *can* answer. No
lecture, no refusal boilerplate, no attempt to be helpful about the unrelated thing. The
system prompt names the refusal format so it is consistent, and the answer never breaks
character into being a general assistant.

### Rate limiting

**Reuse the `rateLimits` table pattern** already specified for leads
(`02-DATA-MODEL.md §rateLimits`) — same table, same shape, different key prefix:

```
key: `bot:${sha256(ip + IP_HASH_SALT)}`
```

**Never store a raw IP.** Same non-negotiable as the lead pipeline. Suggested opening
numbers, to be tuned: ~10 questions per hashed IP per hour, ~30 per day. Over the limit
returns a friendly message, not an error page, and never reaches Claude.

### Token and spend ceilings

Defence in depth, because a loop or a determined visitor must not be able to run up a bill:

| Cap | Where |
|---|---|
| Question length | ≤ ~500 chars, rejected before embedding |
| Chunks in context | ≤ 8, and each chunk truncated to its stored size |
| `max_tokens` per answer | A hard cap — answers are meant to be short |
| Turns per conversation | ~10, then the widget asks the visitor to start fresh |
| **Total tokens per session** | A hard cap. When it is hit, the session ends with a message pointing at the contact form. |
| Global daily ceiling | A counter in Convex. Past it, the widget degrades to "the assistant is resting — here's the contact form". |

The global ceiling is the one that actually protects the bill, because it is the only cap an
attacker cannot get around by rotating IPs. It is not optional.

### Secrets

The Anthropic key and the embeddings key live in the **Convex environment**, never in Vercel
and never behind a `NEXT_PUBLIC_` prefix (`01-ARCHITECTURE.md §4`). The browser calls a
Convex function; it never calls a model provider directly.

---

## 6. Open questions — resolve before building

**None of these have been decided. Two of them have not even been checked.** P8 does not
start until every row has an answer written into `docs/phases/PHASE-08-bot.md`.

### 6.1 Embedding model and provider — **and the dimension count**

Unresolved, and it blocks the schema.

`02-DATA-MODEL.md` sketches `dimensions: 1536`. **That number is a placeholder chosen to
match a common default, not a verified property of any model we have selected.** Convex
accepts 2–4096, but the value is **fixed at index creation** — changing it means dropping
and recreating the vector index and re-embedding every chunk.

Before writing `schema.ts`:

1. Choose the provider and model.
2. Read its actual output dimension from its own documentation.
3. Update `02-DATA-MODEL.md` in the same commit if it is not 1536.

Note while choosing: **Anthropic does not ship a first-party embeddings endpoint.** Claude
writes the answer; something else produces the vectors. So this is a second vendor, a second
key and a second bill, and it needs to be picked deliberately rather than assumed. Compare
on: dimension count, cost per million tokens, quality on short technical prose, rate limits,
whether it supports batching (it should — we embed a whole post at once), and whether an
asymmetric query/document variant is available.

### 6.2 `@convex-dev/rag` and the Convex Agent component — **NOT VERIFIED**

Convex publishes first-party components that may already do chunking, embedding, storage and
retrieval — and possibly the chat loop — better than the hand-rolled pipeline in §3 and §4.

**This was not checked. Nothing in this document confirms these components exist, what they
are called, what they cover, or whether they are production-ready.** Everything above is
written as hand-rolled because that is the version we can reason about today, not because
hand-rolling was chosen over them.

**Must-check, first task of P8, before any code:** read the current Convex component
documentation and answer — do they exist and at what version; do they support bring-your-own
embedding provider; do they handle the delete-and-replace sync of §3; do they own their own
tables (and does that conflict with the `contentChunks` shape in `02-DATA-MODEL.md`); are
they stable or beta. If a component covers this properly, **use it** — the `contentChunks`
sketch is a fallback design, not a commitment. We already carry one beta dependency in
`@convex-dev/auth` and know exactly what that costs (`00-MASTER-PLAN.md §6`), so weigh a
second one with open eyes.

### 6.3 Streaming transport

How tokens get from a Convex action to the widget. Options, none evaluated: a Convex HTTP
action streaming the response directly; writing deltas into a Convex table and letting the
existing reactive subscription deliver them (idiomatic, but a row write per delta); or a
Next.js route handler on `apps/web` that proxies the model and calls Convex for retrieval
(familiar, but splits the logic across two runtimes and two deploy targets).

Decide before building the widget — this choice determines where the bot's code lives, and
therefore which phase owns which files.

### 6.4 Conversation persistence

Do conversations survive a reload? Options: none (in-memory only, simplest, zero privacy
surface); `sessionStorage` (survives reload, stays on the device, nothing stored server-side);
or a `conversations` table (enables follow-ups across sessions and lets Milan read what
people asked — genuinely useful signal — but it is a new table, a new privacy consideration,
and a retention policy to write).

If the answer is a table, it is a **new table** and it goes through `02-DATA-MODEL.md` like
everything else. And if visitor questions are stored, the widget says so.

### 6.5 Smaller, still open

| Question | Note |
|---|---|
| Score floor for retrieval | Needs real questions to tune. Too low invents, too high refuses constantly. |
| Widget placement and design | A floating bubble on every page? Only `/`? P5's theme applies either way. |
| Evaluation | A fixed set of ~30 questions with expected sources, run before any prompt or model change. Without it, "improving" the prompt is guesswork. |
| Failure UX | What the widget shows when the provider is down or the daily ceiling is hit. It must degrade to the contact form, never to a stack trace. |
| Analytics | Which questions get asked is the single most useful thing this feature produces for Milan. Overlaps with 6.4. |
