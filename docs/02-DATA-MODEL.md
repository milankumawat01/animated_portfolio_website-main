# Data Model — the contract

> **Frozen at P1.** Every phase compiles against this document. Changing a table, a field, an
> index or a function name means updating this file *in the same commit* and logging the
> change in `STATUS.md`. A schema that drifts from this doc silently breaks whatever phase is
> running in parallel.

Lives in `packages/backend/convex/schema.ts`. Field-by-field provenance from the current
`data/portfolioData.ts` is in `06-CONTENT-MIGRATION.md`.

---

## Conventions

- **Timestamps** are `v.number()` — epoch milliseconds, `Date.now()`. Never a formatted
  string. The current data stores `date: '12 Sep 2026'`; that becomes `publishedAt`, and
  formatting is a rendering concern.
- **Images** are `v.optional(v.id("_storage"))` plus an optional `imageUrl` string. During
  migration the existing `/images/*.png` paths live in `imageUrl`; once re-uploaded through
  the admin they move to `storageId`. Readers prefer `storageId` and fall back to `imageUrl`.
- **`status`** is always `v.union(v.literal("draft"), v.literal("published"))`. Drafts are
  filtered **inside the query**, never in a component.
- **`order`** is a sparse float (10, 20, 30…) so a row can be dragged between two others
  without renumbering the table.
- **`legacyId`** preserves the pre-migration `id` for traceability and rollback.
- Every table carries `updatedAt`. Rows that can be published carry `publishedAt`.

---

## Tables

### `projects`

```ts
projects: defineTable({
  slug:            v.string(),              // permalink — frozen, e.g. "hiro"
  legacyId:        v.optional(v.string()),
  title:           v.string(),
  subtitle:        v.string(),
  description:     v.string(),              // card blurb
  longDescription: v.string(),              // detail page intro
  imageStorageId:  v.optional(v.id("_storage")),
  imageUrl:        v.optional(v.string()),
  tags:            v.array(v.string()),
  keyFeatures:     v.array(v.string()),
  architecture:    v.array(v.string()),
  stats:           v.array(v.object({ label: v.string(), value: v.string() })),
  liveUrl:         v.optional(v.string()),
  githubUrl:       v.optional(v.string()),
  status:          v.union(v.literal("draft"), v.literal("published")),
  featured:        v.boolean(),
  order:           v.number(),
  seo:             v.optional(v.object({
                     title:       v.optional(v.string()),
                     description: v.optional(v.string()),
                   })),
  publishedAt:     v.optional(v.number()),
  updatedAt:       v.number(),
})
  .index("by_slug",          ["slug"])
  .index("by_status_order",  ["status", "order"])
  .index("by_status_featured", ["status", "featured"])
```

### `blogPosts`

```ts
blogPosts: defineTable({
  slug:            v.string(),              // permalink — frozen
  legacyId:        v.optional(v.string()),
  title:           v.string(),
  excerpt:         v.string(),
  body:            v.string(),              // Markdown
  imageStorageId:  v.optional(v.id("_storage")),
  imageUrl:        v.optional(v.string()),
  tags:            v.array(v.string()),     // current data has a single `tag` → [tag]
  readTimeMinutes: v.number(),              // derived from body, admin-overridable
  status:          v.union(v.literal("draft"), v.literal("published")),
  featured:        v.boolean(),
  views:           v.number(),              // default 0
  seo:             v.optional(v.object({
                     title:       v.optional(v.string()),
                     description: v.optional(v.string()),
                   })),
  publishedAt:     v.optional(v.number()),
  updatedAt:       v.number(),
})
  .index("by_slug",                ["slug"])
  .index("by_status_publishedAt",  ["status", "publishedAt"])
```

Tag filtering on `/blog?tag=x` filters in the query over the status index — with a post
count this small, a dedicated index is not worth the write cost. Revisit past ~200 posts.

### `leads`

```ts
leads: defineTable({
  name:      v.string(),
  email:     v.string(),
  message:   v.string(),
  source:    v.union(v.literal("contact-modal"), v.literal("contact-page")),
  status:    v.union(
               v.literal("new"), v.literal("read"),
               v.literal("replied"), v.literal("archived"),
             ),
  meta:      v.object({
               userAgent: v.optional(v.string()),
               referrer:  v.optional(v.string()),
               path:      v.optional(v.string()),
             }),
  notes:     v.optional(v.string()),        // Milan's private notes
  notified:  v.boolean(),                   // did the Resend email go out
  repliedAt: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_status_createdAt", ["status", "createdAt"])
  .index("by_createdAt",        ["createdAt"])
  .index("by_email",            ["email"])
```

**No IP address field, by design.** Rate limiting uses a salted hash held in `rateLimits`.

### `rateLimits`

```ts
rateLimits: defineTable({
  key:         v.string(),     // `lead:${sha256(ip + IP_HASH_SALT)}`
  count:       v.number(),
  windowStart: v.number(),
}).index("by_key", ["key"])
```

### `experience`

```ts
experience: defineTable({
  legacyId:  v.optional(v.string()),
  company:   v.string(),
  role:      v.string(),
  period:    v.string(),        // "May 2025 – Present" — display string, kept verbatim
  timeframe: v.string(),        // "2025 – Present"
  badge:     v.string(),
  logo:      v.string(),        // initials or emoji, e.g. "TV"
  logoBg:    v.string(),        // Tailwind classes — see note below
  points:    v.array(v.string()),
  tags:      v.array(v.string()),
  order:     v.number(),
  visible:   v.boolean(),
  updatedAt: v.number(),
}).index("by_visible_order", ["visible", "order"])
```

`logoBg` holds Tailwind utility classes (`"bg-slate-900 text-white"`). Storing class names in
a database is not lovely, but it is what the component consumes today and changing it is a
design decision, not a migration one. **P5 must revisit it** — those hardcoded classes will
not respond to the theme. Noted as a known wart, not a silent one.

### `skillCategories`

```ts
skillCategories: defineTable({
  title:     v.string(),
  subtitle:  v.string(),
  icon:      v.string(),        // iconKey → components/icons/TechIcons.tsx
  skills:    v.array(v.object({ name: v.string(), iconKey: v.string() })),
  order:     v.number(),
  visible:   v.boolean(),
  updatedAt: v.number(),
}).index("by_visible_order", ["visible", "order"])
```

### `siteSettings` — singleton

Everything that is site copy rather than a collection. One row, enforced by a literal key.

```ts
siteSettings: defineTable({
  key: v.literal("main"),

  personal: v.object({
    name: v.string(), role: v.string(), location: v.string(),
    headline: v.string(), subheadline: v.string(),
    email: v.string(), bio: v.string(),
    linkedin: v.string(), linkedinUrl: v.string(),
    github: v.string(),   githubUrl: v.string(),
    twitterUrl: v.string(), resumeUrl: v.string(),
  }),

  stats:         v.array(v.object({ value: v.string(), label: v.string() })),
  heroTechStack: v.array(v.object({ name: v.string(), iconKey: v.string() })),
  aboutPillars:  v.array(v.object({ title: v.string(), description: v.string(), icon: v.string() })),
  whatIWorkOn:   v.array(v.object({ title: v.string(), description: v.string(), icon: v.string() })),

  quotes: v.object({
    about: v.string(), skills: v.string(), howIBuild: v.string(),
    experience: v.string(), writing: v.string(), contact: v.string(),
  }),

  handwriting: v.object({
    aboutPhoto: v.string(), aboutBottom: v.string(), projects: v.string(),
    skillsPhoto: v.string(), skillsBottom: v.string(),
    experienceLeft: v.string(), experienceRight: v.string(),
    howIBuildTop: v.string(), howIBuildBottom: v.string(),
    writingTop: v.string(), contactTop: v.string(), footer: v.string(),
  }),

  howIBuildSteps: v.array(v.object({
    step: v.string(), title: v.string(), icon: v.string(),
    description: v.string(), items: v.array(v.string()),
  })),
  howIBuildPillars: v.array(v.object({
    title: v.string(), subtitle: v.string(), icon: v.string(),
  })),
  contactCards: v.array(v.object({
    id: v.string(), title: v.string(), value: v.string(), hint: v.string(),
    icon: v.string(), action: v.string(), copyable: v.boolean(),
  })),

  updatedAt: v.number(),
}).index("by_key", ["key"])
```

**`handwriting` is currently dead data.** No component reads it — the annotations you see on
the page are hardcoded at their call sites, and `Handwriting.tsx` renders inside
`whitespace-pre-line` rather than splitting on anything. Several stored values have also
drifted from what actually renders. Migrate the object **verbatim** so nothing is lost, but
do not assume it drives the page: see `06-CONTENT-MIGRATION.md §Handwriting` for the
mismatch table and the decision Milan needs to make.

### `media`

```ts
media: defineTable({
  storageId:   v.id("_storage"),
  filename:    v.string(),
  contentType: v.string(),
  size:        v.number(),
  alt:         v.string(),
  width:       v.optional(v.number()),
  height:      v.optional(v.number()),
  uploadedAt:  v.number(),
}).index("by_uploadedAt", ["uploadedAt"])
```

`width`/`height` are stored so `next/image` gets explicit dimensions and the page does not
shift while loading.

### Auth tables

Supplied by `@convex-dev/auth` via its schema spread. Do not hand-edit.

### Future — P8, not created yet

Documented here so the shape is agreed; created only when the bot phase runs. See
`07-FUTURE-BOT.md`.

```ts
contentChunks: defineTable({
  sourceType: v.union(v.literal("project"), v.literal("post"), v.literal("settings")),
  sourceId:   v.string(),
  chunkIndex: v.number(),
  text:       v.string(),
  embedding:  v.array(v.float64()),
})
  .index("by_source", ["sourceType", "sourceId"])
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["sourceType"],
  })
```

Convex vector search constraints: **actions only**, 2–4096 dimensions, ≤16 filter fields,
≤4 vector indexes per table, `limit` ≤256 (default 10). It returns `{_id, _score}`, so
documents are re-fetched in a follow-up query.

---

## Function surface

Frozen at P1. `[public]` is callable from the website. `[admin]` calls `requireAdmin(ctx)`
first. `[internal]` is not reachable from any client.

### `projects.ts`

| Function | Kind | Args | Returns |
|---|---|---|---|
| `listPublished` | query `[public]` | `{}` | published, ordered by `order` |
| `listFeatured` | query `[public]` | `{ limit?: number }` | published + featured |
| `bySlug` | query `[public]` | `{ slug }` | one project or `null` (published only) |
| `listAll` | query `[admin]` | `{}` | drafts included |
| `create` · `update` · `remove` | mutation `[admin]` | see below | — |
| `reorder` | mutation `[admin]` | `{ ids: Id<"projects">[] }` | — |
| `setStatus` | mutation `[admin]` | `{ id, status }` | sets `publishedAt` on first publish |

### `blog.ts`

| Function | Kind | Args | Returns |
|---|---|---|---|
| `listPublished` | query `[public]` | `{ tag?, limit?, cursor? }` | paginated, newest first |
| `bySlug` | query `[public]` | `{ slug }` | one post or `null` (published only) |
| `listTags` | query `[public]` | `{}` | distinct tags with counts |
| `listAll` | query `[admin]` | `{}` | drafts included |
| `create` · `update` · `remove` | mutation `[admin]` | — | — |
| `setStatus` | mutation `[admin]` | `{ id, status }` | sets `publishedAt` on first publish |
| `incrementViews` | mutation `[public]` | `{ slug }` | fire-and-forget |

### `leads.ts`

| Function | Kind | Args | Notes |
|---|---|---|---|
| `submit` | mutation `[public]` | `{ name, email, message, source, honeypot?, meta }` | **The only hostile surface.** Validates, honeypot-checks, rate-limits, inserts, then schedules the notification. |
| `list` | query `[admin]` | `{ status? }` | newest first |
| `get` | query `[admin]` | `{ id }` | — |
| `setStatus` · `setNotes` · `remove` | mutation `[admin]` | — | — |
| `unreadCount` | query `[admin]` | `{}` | sidebar badge |

### `experience.ts` · `skills.ts`

`listVisible` query `[public]`; `listAll`, `create`, `update`, `remove`, `reorder`
mutations `[admin]`.

### `siteSettings.ts`

`get` query `[public]` · `update` mutation `[admin]` (accepts a partial patch).

### `media.ts`

`generateUploadUrl` mutation `[admin]` · `create` mutation `[admin]` · `list` query
`[admin]` · `remove` mutation `[admin]` · `urlFor` query `[public]`.

### `internal/`

| Function | Kind | Purpose |
|---|---|---|
| `notify.newLead` | action `[internal]` | Resend email. Retries. Never blocks `leads.submit`. |
| `revalidate.ping` | action `[internal]` | POSTs `/api/revalidate` with `REVALIDATE_SECRET`. |
| `seed.importLegacy` | mutation `[internal]` | One-shot P2 import from `portfolioData.ts`. Idempotent on `legacyId`. |

---

## Validation rules

Enforced in Convex, not only in the form. A browser is not a validator.

| Field | Rule |
|---|---|
| `leads.name` | 1–100 chars, trimmed, non-empty |
| `leads.email` | 3–254 chars, must contain `@`, lowercased |
| `leads.message` | 10–5000 chars |
| honeypot | If present and non-empty → **return success, store nothing** |
| rate limit | 3 submissions per hashed IP per hour → throw a friendly error |
| `slug` | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique per table, checked in the mutation |
| `blogPosts.body` | ≤ 200 000 chars |
| `media.size` | ≤ 10 MB, `contentType` must start with `image/` |

The honeypot returning *success* is deliberate — a bot that gets an error learns to retry,
and a bot that gets a cheerful "Message Sent!" goes away.
