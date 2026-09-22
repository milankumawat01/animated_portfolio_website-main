# Architecture

> Read this before writing any code in any phase. §7 in particular — Next.js 16 removed
> APIs that every tutorial still uses, and `AGENTS.md` warns about exactly this.

---

## 1. Topology

```
animated_portfolio_website-main/
├── apps/
│   ├── web/                     → milankumawat.in
│   │   ├── app/                    (moved from repo root in P0)
│   │   ├── components/
│   │   ├── lib/convex.ts           server-side Convex helpers
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── admin/                   → admin.milankumawat.in
│       ├── app/
│       ├── components/
│       ├── next.config.mjs
│       └── package.json
│
├── packages/
│   └── backend/
│       ├── convex/
│       │   ├── schema.ts            ← the contract (02-DATA-MODEL.md)
│       │   ├── projects.ts
│       │   ├── blog.ts
│       │   ├── leads.ts
│       │   ├── experience.ts
│       │   ├── skills.ts
│       │   ├── siteSettings.ts
│       │   ├── media.ts
│       │   ├── auth.ts
│       │   ├── lib/auth.ts          requireAdmin()
│       │   ├── internal/            actions: notify, revalidate, seed
│       │   └── _generated/          ← generated here, imported by both apps
│       ├── convex.json
│       └── package.json             name: "@portfolio/backend"
│
├── docs/
├── .claude/skills/portfolio/SKILL.md
└── package.json                     workspaces: ["apps/*", "packages/*"]
```

**Why a monorepo.** Convex generates its typed API (`_generated/api.d.ts`) from wherever the
function source lives. One repo means both apps import the *same* generated types, so a
renamed field is a compile error in the admin instead of a runtime crash in production.
Two separate repos would force the admin to call functions by untyped string reference.

**Why separate deploys.** `apps/admin` is its own Vercel project with its own domain. No
admin code, no admin dependency, and no admin route ever ships inside the public bundle.
The separation Milan asked for is a deployment boundary, which is the one that actually
matters, rather than a repository boundary.

### Workspace rules

- **`npx convex dev` runs once, from `packages/backend`.** Never per app. Running it from an
  app directory creates a second deployment and a very confusing afternoon.
- **`convex.json` sits beside `packages/backend/package.json`**, not at the repo root. The
  CLI resolves it relative to its working directory.
- Both apps depend on `"@portfolio/backend": "workspace:*"` and import
  `import { api } from "@portfolio/backend/convex/_generated/api"`.
- `packages/backend` ships **TypeScript source**, not a build output. Turbopack transpiles
  workspace packages without extra config; no TS project references are needed.
- `_generated/` **is committed**. It is the shared contract, and CI needs it to typecheck
  without running the Convex CLI.

---

## 2. Data flow

### Public read path (content pages)

```
Convex DB
   │  fetchQuery(api.blog.bySlug, { slug })
   ▼
Server Component (cached)          ← 'use cache' + cacheTag(`post:${slug}`)
   │  props
   ▼
Client section components          ← existing markup, unchanged
   │
   ▼
HTML delivered with content already in it   → indexable, fast
```

### Admin write path

```
Admin UI (client)
   │  useMutation(api.blog.update)
   ▼
Convex mutation
   ├─ requireAdmin(ctx)            ← throws if not Milan
   ├─ patch the document
   └─ scheduler.runAfter(0, internal.revalidate.ping, { tags })
                                      │
                                      ▼
                        POST /api/revalidate  (shared secret)
                                      │
                                      ▼
                        revalidateTag('post:slug', 'max')
```

The public site is statically cached, so a publish must actively tell Next to drop the
stale page. Convex has no built-in Next revalidation hook — this scheduler → action →
route-handler chain is ours, and it is specified in `03-ROUTES-AND-PAGES.md §Revalidation`.

### Lead capture

```
Contact form (client)
   │  useMutation(api.leads.submit)
   ▼
Convex mutation
   ├─ validate + honeypot check
   ├─ rate limit by hashed IP        ← never store a raw IP
   ├─ INSERT lead                    ← storage first, always
   └─ scheduler.runAfter(0, internal.notify.newLead)
                                      │
                                      ▼
                              Resend → Milan's inbox
```

If Resend fails, the lead is already saved. The action retries; it never blocks the
visitor's success state.

---

## 3. Rendering strategy

| Route | Rendering | Data | Revalidation |
|---|---|---|---|
| `/` | Static, cached | `fetchQuery` in a Server Component | Tag `home` |
| `/projects` | Static, cached | `fetchQuery` list | Tag `projects` |
| `/projects/[slug]` | Static + `generateStaticParams` | `fetchQuery` by slug | Tag `project:<slug>` |
| `/blog` | Static, cached | `fetchQuery` list | Tag `blog` |
| `/blog/[slug]` | Static + `generateStaticParams` | `fetchQuery` by slug | Tag `post:<slug>` |
| `/api/revalidate` | Route handler, dynamic | — | — |
| Contact form | Client island | `useMutation` | — |
| **All of `apps/admin`** | Client, live | `preloadQuery` + `usePreloadedQuery` | None — reactive |

The public site wants **static and cached**. The admin wants **live and reactive**. They are
opposite requirements, which is another reason they are separate apps.

### The `no-store` trap — read this twice

Everything exported from `convex/nextjs` — `fetchQuery`, `preloadQuery`, `fetchMutation`,
`fetchAction` — routes through `setupClient()`, which calls
`client.setFetchOptions({ cache: "no-store" })`. **A Server Component that awaits
`fetchQuery` is therefore dynamic by default and will not be statically rendered.**

Wrap the call so the *return value* is cached, which makes the inner no-store fetch
irrelevant:

```ts
async function getPost(slug: string) {
  'use cache'
  cacheTag(`post:${slug}`)
  cacheLife('max')
  return fetchQuery(api.blog.bySlug, { slug })
}
```

Do not rely on `export const dynamic = 'force-static'` to coerce a no-store fetch in 16 —
that behaviour is unverified. Use `'use cache'`.

Also: `ConvexHttpClient` is stateless, so two `preloadQuery` calls on one page have **no
cross-query consistency**. If two pieces of data must agree with each other, fetch them in
one query.

---

## 4. Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | web + admin (Vercel & local) | Convex deployment URL. Set automatically by `convex deploy`. |
| `CONVEX_DEPLOY_KEY` | Vercel, both projects | Production deploy key (`deployment:deploy` scope). Separate key for previews. |
| `REVALIDATE_SECRET` | web + Convex env | Shared secret for `/api/revalidate`. Reject any request without it. |
| `SITE_URL` | Convex env | Origin that `internal.revalidate.ping` POSTs to. Convex cannot read the web app's `NEXT_PUBLIC_SITE_URL`, so it needs its own copy. Set it per deployment (prod vs. preview). |
| `NEXT_PUBLIC_SITE_URL` | web | Canonical origin for metadata, sitemap, OG images. |
| `RESEND_API_KEY` | Convex env only | Lead notification email. **Never** `NEXT_PUBLIC_`. |
| `LEAD_NOTIFY_TO` | Convex env | Where lead emails go. |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Convex env | Convex Auth GitHub OAuth. |
| `ADMIN_IDENTITY` | Convex env | The single GitHub identity allowed to write. |
| `IP_HASH_SALT` | Convex env | Salt for hashing IPs in rate limiting. |

Rules: secrets that the backend uses live in the **Convex dashboard**, not in Vercel.
Anything prefixed `NEXT_PUBLIC_` is shipped to browsers — treat it as public, because it is.

---

## 5. Deployment

Two Vercel projects from one repo, distinguished by root directory.

| | `apps/web` | `apps/admin` |
|---|---|---|
| Domain | `milankumawat.in` | `admin.milankumawat.in` |
| Root directory | `apps/web` | `apps/admin` |
| Build command | `npx convex deploy --cmd 'npm run build'` | `npm run build` |
| Env | `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL` | `NEXT_PUBLIC_CONVEX_URL` |

Only **one** project runs `convex deploy` — the web app owns pushing the backend. The admin
consumes the deployment that already exists. Two projects both deploying the same Convex
functions is a race.

---

## 6. Security model

- **`requireAdmin(ctx)` in `packages/backend/convex/lib/auth.ts` is the only authorization
  primitive.** Every mutation and every admin query calls it first. One helper, one place to
  audit, one place to change if auth providers change.
- Client-side `<Authenticated>` gates are **UX, not security**. Assume an attacker loads
  admin routes directly and calls Convex functions from a script — the mutations must hold
  on their own.
- **Public mutations are a hostile surface.** `leads.submit` is the only one. It validates
  input length and shape, checks a honeypot field, and rate-limits on a salted IP hash.
- **Never store raw IP addresses.** Hash with `IP_HASH_SALT` for rate limiting; that is all.
- `/api/revalidate` verifies `REVALIDATE_SECRET` before doing anything and returns 401
  otherwise.
- Draft content must never leak: `status: "published"` is filtered **inside the Convex
  query**, never in the React component.

---

## 7. Next.js 16 — what changed and what it breaks

Verified against Next.js docs for **16.3.5** on 2026-09-22. The repo's `AGENTS.md` warns
that this version differs from training data. It does.

### Async request APIs — removed, not deprecated

`params` and `searchParams` are Promises in `page`, `layout`, `route`, `default` and
`generateMetadata`, as are `cookies()`, `headers()` and `draftMode()`.

```ts
// every dynamic route in this build
export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params
  …
}
```

`opengraph-image` and `icon` functions receive `params` **and** `id` as Promises.
`sitemap({ id })` receives `id` as a Promise. Run `npx next typegen` to get the
`PageProps<'/route'>` / `LayoutProps` / `RouteContext` helper types.

### Two caching models — pick one deliberately

| | `cacheComponents: false` (default) | `cacheComponents: true` |
|---|---|---|
| `export const revalidate` / `dynamic` / `dynamicParams` / `fetchCache` | Still valid | **Removed** |
| Caching primitive | Segment config | `'use cache'` + `cacheLife()` + `cacheTag()` |
| `generateStaticParams` returning `[]` | Allowed (runtime ISR) | **Build error** — must return ≥1 |

`experimental.dynamicIO` and `experimental.useCache` no longer exist; they became top-level
`cacheComponents`. `experimental_ppr` is gone. **P0 decides this flag once and records it in
`STATUS.md`** — it changes how every subsequent phase writes pages.

### Other removals that will bite

- **`revalidateTag` now requires a second argument**: `revalidateTag('posts', 'max')`.
  Single-argument calls are a TypeScript error. New siblings: `updateTag()` (Server Actions
  only, read-your-writes) and `refresh()`. `revalidatePath(path, type?)` is unchanged.
- **`middleware.ts` → `proxy.ts`** (export `proxy`, Node runtime only, no edge).
  `middleware.ts` still works but is deprecated — **and we are deliberately using neither**
  (`00-MASTER-PLAN.md §6`).
- **`next lint` is removed.** The current `package.json` still has `"lint": "next lint"`,
  which is now a broken script. P0 replaces it with a direct `eslint` invocation.
- **Turbopack is the default for dev *and* build.** A webpack config in `next.config.mjs`
  fails the build.
- **Parallel route slots require `default.js`.** Node ≥20.9, TypeScript ≥5.1.

### `next/image`

- `images.domains` is deprecated → use `remotePatterns`.
- `qualities` defaults to `[75]`; `minimumCacheTTL` moved from 60s to 14400s; `16` was
  removed from `imageSizes`; `maximumRedirects` defaults to 3.
- **The current `next.config.mjs` sets `images.unoptimized: true`.** That must go when images
  start coming from Convex storage, replaced by a `remotePatterns` entry for
  `*.convex.cloud`. Ten components already use `next/image`, so this is a config change, not
  a component change.

---

## 8. Frozen contracts

P1 freezes these. After P1, changing any of them requires updating `02-DATA-MODEL.md` in the
same commit and noting the change in `STATUS.md`, because a phase running in parallel is
compiling against them right now.

1. **Table names, field names and types** — `packages/backend/convex/schema.ts`.
2. **Index names and their field order** — a query that needs a different index needs a new
   index, not a redefined one.
3. **Function names and their argument validators** — `api.projects.bySlug` means what
   `02-DATA-MODEL.md` says it means.
4. **Slugs** — `slug` is the permalink and is stable forever. Changing one breaks a published
   URL.
5. **`requireAdmin()`'s signature** — the authorization primitive.

What is *not* frozen: function bodies, component internals, styling, and anything inside
`apps/admin`.
