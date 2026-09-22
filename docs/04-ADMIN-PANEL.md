# Admin Panel — `apps/admin`

> A private, single-user mini-CMS at `admin.milankumawat.in`. Its own Next.js app, its own
> Vercel project, the same Convex deployment as the public site. Built across **P6A / P6B /
> P6C**, which run alongside the public-site waves because they share no files
> (`08-PLAYBOOK.md §2`).

The panel exists so Milan never edits `data/portfolioData.ts` again. Everything a visitor
reads — projects, posts, experience, skills, headline, bio, quotes, handwriting scribbles,
contact cards — is editable here, and every lead the contact form captures is answerable
here.

---

## 1. Auth model

Restated from `00-MASTER-PLAN.md §6`. This is a deliberate, risk-managed choice. Do not
"fix" it by adding middleware.

### What we use

| | |
|---|---|
| Provider | **Convex Auth** (`@convex-dev/auth`, currently **0.0.95**, beta by its own docs) |
| Method | **GitHub OAuth**, one identity |
| Server env | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_IDENTITY` — all in the **Convex dashboard**, never in Vercel |
| Backend files | `packages/backend/convex/auth.ts` (provider config), `packages/backend/convex/lib/auth.ts` (`requireAdmin`) |
| Client | `<ConvexAuthNextjsProvider>` in `apps/admin/app/layout.tsx`, `<Authenticated>` / `<Unauthenticated>` in the dashboard layout |

### What we deliberately do NOT use

**No `middleware.ts`. No `proxy.ts`. Neither file exists in `apps/admin`, in any phase.**

`@convex-dev/auth` pins `next: ^15.2.5` as a devDependency, and issue
[convex-auth#271](https://github.com/get-convex/convex-auth/issues/271) — open since
2025-12-15, no fix — reports that on Next 16, `convexAuthNextjsMiddleware` in `proxy.ts`
makes `isAuthenticated()` always return **false**. We never execute that code path, so the
bug cannot bite us. Next 16 deprecates `middleware.ts` in favour of `proxy.ts` anyway
(`01-ARCHITECTURE.md §7`); we use neither.

A future session that sees an unprotected admin route and reaches for middleware is
reintroducing a known-broken dependency. The protection is elsewhere, on purpose.

### Where the real boundary is

```
Browser  →  <Authenticated> gate          ← UX only. Cosmetic. Not security.
            │
            ▼
         useMutation(api.projects.update)
            │
            ▼
         Convex mutation
            └─ requireAdmin(ctx)          ← THE boundary. Server-side. Non-bypassable.
```

`requireAdmin(ctx)` is called as the **first statement** of every mutation and every
`[admin]` query. It reads `ctx.auth.getUserIdentity()`, compares against `ADMIN_IDENTITY`,
and throws otherwise. It holds when someone loads an admin route with JavaScript disabled,
when someone hits the Convex HTTP API from `curl`, and when a client bundle is tampered
with. One helper, one file, one place to audit.

A mutation that does not call `requireAdmin(ctx)` first is a security bug, not a style
preference. `leads.submit`, `blog.incrementViews`, `siteSettings.get`, `media.urlFor` and
the `listPublished` / `bySlug` / `listVisible` family are the **only** exceptions, and they
are enumerated in §4.

### Sign-in flow

1. Visitor hits any admin URL. The dashboard layout renders `<Unauthenticated>`, which
   redirects to `/(auth)/sign-in`.
2. `/sign-in` shows one button: **Continue with GitHub**. No email/password, no sign-up
   link, no "forgot password" — there is one account and it is not ours to reset.
3. `signIn("github")` from `@convex-dev/auth/react` starts the OAuth round trip.
4. GitHub returns to the Convex Auth callback; the session cookie is set.
5. The layout flips to `<Authenticated>` and the dashboard renders.
6. If the returning identity is not `ADMIN_IDENTITY`, the session exists but **every query
   and mutation throws**. The shell renders a flat "Not authorised" state rather than a
   broken dashboard. Signing in is not the same as being allowed.

### Sign-out flow

`signOut()` from the shell's user menu, then a client redirect to `/sign-in`. No server
round trip of our own, no session table to clean up.

### What an unauthenticated visitor sees

The admin domain is not secret, so assume it gets crawled and poked.

| Situation | Result |
|---|---|
| `admin.milankumawat.in/` with no session | Brief shell flash, then `/sign-in` |
| A deep link, e.g. `/blog/abc123/edit` | Same — flash, then `/sign-in`. The editor never receives data, because its query throws. |
| JavaScript disabled | Static shell, no content. Every query is client-side and unauthenticated. |
| `curl` against the Convex HTTP API | `requireAdmin` throws. Nothing leaks. |
| Any public route of the *web* app | Unaffected — separate app, separate bundle, separate domain |

**Accepted cost: the shell flash.** Client-side gating cannot avoid rendering before the
auth state resolves. For a private single-user panel that is cosmetic, and the alternative
is a middleware path that is currently broken. Keep the skeleton visually quiet (no counts,
no names, no lead previews in the pre-auth render) so the flash reveals nothing.

### The Clerk escape hatch

If Convex Auth's beta status becomes a real problem mid-build, swap to **Clerk** — verified
working on Next 16 with Convex. Because authorization funnels through one helper, the swap
is small and enumerable:

| Change | File |
|---|---|
| Rewrite the identity check | `packages/backend/convex/lib/auth.ts` — `requireAdmin()` |
| Swap the auth config | `packages/backend/convex/auth.ts` → `auth.config.ts` with the Clerk issuer |
| Swap the provider component | `apps/admin/app/layout.tsx` |
| Swap the sign-in screen | `apps/admin/app/(auth)/sign-in/page.tsx` |

**Not touched:** any mutation body, any query body, any editor screen. `requireAdmin()`'s
signature is a frozen contract (`01-ARCHITECTURE.md §8`) precisely so this stays true. That
is the whole reason for the helper — if a session ever inlines an identity check into a
mutation "just this once", the escape hatch closes.

---

## 2. Screen inventory

Routes live under `apps/admin/app/(dash)/`. The phase column is binding — see
`08-PLAYBOOK.md §2`. **P6A must land before P6B and P6C**, because they mount inside its
shell and rely on its auth gate.

| Screen | Route | Phase |
|---|---|---|
| Sign in | `/(auth)/sign-in` | P6A |
| Dashboard | `/` | P6A |
| Projects list | `/projects` | P6A |
| Project editor | `/projects/[id]`, `/projects/new` | P6A |
| Blog list | `/blog` | P6B |
| Blog editor | `/blog/[id]`, `/blog/new` | P6B |
| Media library | `/media` | P6B |
| Leads inbox | `/leads`, `/leads/[id]` | P6C |
| Experience editor | `/experience` | P6C |
| Skills editor | `/skills` | P6C |
| Site settings | `/settings` | P6C |

### 2.0 Shell (P6A)

`apps/admin/components/shell/**`. A persistent left sidebar — Dashboard, Projects, Blog,
Media, Leads, Experience, Skills, Settings — with the unread-lead badge on Leads
(`api.leads.unreadCount`), a user menu with sign-out, and the `<Authenticated>` gate. P6B
and P6C add their nav entries as data in the shell's link list; they do not restructure it.

All admin data is fetched with `preloadQuery` in the server component plus
`usePreloadedQuery` in the client (`01-ARCHITECTURE.md §3`). The admin wants live and
reactive; there is no `'use cache'` anywhere in this app.

### 2.1 Sign in — P6A

`/(auth)/sign-in`. One card, one button, the site wordmark. Renders standalone — it is
outside `(dash)` so it does not inherit the sidebar or the auth gate that would bounce it
back to itself. Shows an inline error if OAuth fails or the identity is not the admin.

### 2.2 Dashboard — P6A

The landing screen. Four counts and a recent-activity list. Nothing editable.

| Tile | Source |
|---|---|
| Published projects | `api.projects.listAll` — count `status === "published"` |
| Published posts | `api.blog.listAll` — count `status === "published"` |
| Drafts | Both tables, `status === "draft"`, summed |
| Unread leads | `api.leads.unreadCount` |

Recent activity is the last ~10 rows across `projects`, `blogPosts` and `leads` ordered by
`updatedAt` / `createdAt`, each linking to its editor or detail view. It is a convenience
list, not an audit log — see §5.

Each tile links to its list screen with the matching filter pre-applied.

### 2.3 Projects list + editor — P6A

**List** (`/projects`) — `api.projects.listAll`, drafts included. Columns: drag handle,
title, slug, status pill, `featured` star, `updatedAt`. Row actions: edit, duplicate,
delete (confirm dialog naming the project).

**Reordering.** Drag-and-drop writes through `api.projects.reorder({ ids })`. `order` is a
**sparse float** (10, 20, 30…) so a row dropped between two others takes the midpoint and
no other row is rewritten. Do not renumber the table on every drag — that is what the
sparse scheme exists to avoid. Renumber only when two neighbours converge past float
precision, which for this table will not happen.

**Editor** (`/projects/[id]`) — every field from the `projects` table
(`02-DATA-MODEL.md`), grouped:

| Group | Fields | Control |
|---|---|---|
| Identity | `title`, `subtitle`, `slug` | Text. Slug rules below. |
| Copy | `description` (card blurb), `longDescription` (detail page intro) | Textareas, character counters |
| Media | `imageStorageId` / `imageUrl` | Media library picker (P6B) with a URL fallback until it lands |
| Lists | `tags`, `keyFeatures`, `architecture` | Repeatable string rows, add / remove / reorder |
| Stats | `stats: { label, value }[]` | Repeatable pair rows |
| Links | `liveUrl`, `githubUrl` | Optional URL inputs |
| Flags | `status`, `featured` | Toggles |
| SEO | `seo.title`, `seo.description` | Optional; placeholder shows the fallback that would be used |
| Read-only | `legacyId`, `publishedAt`, `updatedAt` | Displayed in a footer strip, never editable |

**Slug rules.** `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique within the `projects` table, checked
**in the mutation** against the `by_slug` index — not only in the form. On a new project the
slug auto-derives from the title until the field is touched; after that it stays put.

> **Changing the slug of a published project breaks a live URL.** The editor shows a
> persistent warning beside the field whenever `status === "published"` and the slug is
> dirty, naming the URL that will 404. Slugs are a frozen contract
> (`01-ARCHITECTURE.md §8`). v1 does **not** write redirects; if Milan changes a slug, the
> old URL is gone. Say so in the warning, plainly.

**Publishing.** The status toggle calls `api.projects.setStatus`, which stamps `publishedAt`
on the first publish only. Publishing shows the confirmation described in §3.

### 2.4 Blog list + editor — P6B

**List** (`/blog`) — `api.blog.listAll`. Columns: title, slug, tags, status, `readTimeMinutes`,
`views`, `publishedAt`. Filter by status and tag. Sorted newest first; no drag-reorder —
blog order is `publishedAt`, not a field.

**Editor** (`/blog/[id]`) — a two-pane Markdown editor.

| Pane | Contents |
|---|---|
| Left | Raw Markdown textarea for `body`, monospace, tab-indent captured |
| Right | Live preview, rendered with the **same** pipeline the public site uses in P4B |

Rendering the preview with a different Markdown library than `apps/web` is how a post looks
right in the admin and wrong in production. Import the shared renderer; if P4B has not
landed yet, stub the preview and file a cross-phase request rather than picking a second
library.

Fields:

| Field | Control |
|---|---|
| `title`, `slug` | Same slug rules and the same published-slug warning as §2.3 |
| `excerpt` | Textarea with a counter; used on cards and as the SEO description fallback |
| `body` | Markdown editor. Enforce ≤ 200 000 chars — the mutation does too. |
| `imageStorageId` / `imageUrl` | Cover image, via the media picker |
| `tags` | Token input with autocomplete from `api.blog.listTags` |
| `readTimeMinutes` | **Auto-derived** — see below |
| `featured`, `status` | Toggles |
| `seo.title`, `seo.description` | Optional, with placeholders showing the fallbacks |
| `views` | Read-only |

**Read time.** Derived from `body` on every keystroke (debounced) at ~200 words per minute,
rounded up, minimum 1. The field shows the derived number greyed out with a **Override**
link; clicking it makes the number editable and pins it. A pinned override survives body
edits, and a **Reset to auto** link puts it back. The migration seeds this from the legacy
`readTime` string (`06-CONTENT-MIGRATION.md`), so existing posts start pinned to their
original value.

**Deleting a post** removes the `blogPosts` row. Its uploaded images stay in the media
library — media is a shared pool, not a per-post attachment.

### 2.5 Media library — P6B

`/media`. A grid of everything in the `media` table, newest first (`by_uploadedAt`), with a
picker mode that the project and blog editors open in a dialog.

**Upload sequence** — three steps, in this order:

1. `api.media.generateUploadUrl` (mutation, `[admin]`) → a short-lived Convex upload URL.
2. `POST` the file **directly** to that URL from the browser. The file never passes through
   a Next.js route; do not proxy it.
3. `api.media.create` with the returned `storageId` plus `filename`, `contentType`, `size`,
   `alt`, `width`, `height`.

**Rules enforced in the mutation, not just the form** (`02-DATA-MODEL.md §Validation`):

- `size` ≤ **10 MB**
- `contentType` must start with `image/`

The browser check exists to give a fast error; the mutation check exists because a browser
is not a validator.

**Alt text is required.** The upload dialog will not submit without it. This is an
accessibility floor and an SEO one, and it is far easier to demand at upload time than to
backfill.

**Width and height are captured at upload** by reading the decoded `Image` before the POST,
and stored on the row. `next/image` needs explicit dimensions or the public page shifts
while the image loads. A row without dimensions is a layout-shift bug waiting to ship.

Detail panel: preview, filename, dimensions, size, content type, upload date, an editable
`alt`, a copy-storage-id action, and **Delete**. Delete removes the `media` row *and* the
underlying `_storage` blob. There is no reference counting in v1 — the confirm dialog says
so and lists nothing; if a project still points at that `storageId`, its reader falls back
to `imageUrl` or renders no image. Deliberate: reference counting across five tables is not
worth it for a single-user panel.

### 2.6 Leads inbox — P6C

`/leads`. The reason the whole build exists — `components/modals/ContactModal.tsx` currently
runs an 800 ms `setTimeout`, fires confetti, and throws the message away. P4C makes it real;
this screen is where the messages land.

**List** — `api.leads.list({ status? })`, newest first via `by_status_createdAt`. Status
tabs across the top with counts:

| Status | Meaning |
|---|---|
| `new` | Arrived, never opened. Drives the sidebar badge. |
| `read` | Opened. Set automatically on first open of the detail view. |
| `replied` | Milan answered. Set manually; stamps `repliedAt`. |
| `archived` | Done, or spam that got through. Hidden from the default view. |

Each row: name, email, first line of the message, relative time, a `notified` indicator
(did the Resend email actually go out), and an unread dot.

**Detail** (`/leads/[id]`) — `api.leads.get`. Full message in a readable block, `meta.path`,
`meta.referrer` and `meta.userAgent` in a collapsed technical strip, and `createdAt`.

Actions:

- **Reply** — a `mailto:` link, pre-filled with `To`, a `Re:` subject, and the original
  message quoted below a blank line. v1 does not send mail from the panel; Milan replies
  from his own client so the thread lives in his inbox where he can find it later.
- **Mark replied** — `api.leads.setStatus`, stamps `repliedAt`.
- **Notes** — `api.leads.setNotes`. A private textarea, autosaved on blur. Never rendered
  anywhere public; the `leads` table is `[admin]` end to end.
- **Archive** / **Delete** — `setStatus` and `remove`. Delete confirms and is permanent.

**Unread badge.** `api.leads.unreadCount` in the shell. It is a live Convex query, so a lead
arriving while the panel is open updates the badge without a refresh — a free win from not
caching the admin.

### 2.7 Experience editor — P6C

`/experience`. A single ordered list screen; rows expand in place instead of navigating to a
separate editor — there are four of them, not four hundred.

Fields per row, all from the `experience` table: `company`, `role`, `period` (display string,
e.g. `"May 2025 – Present"`), `timeframe`, `badge`, `logo` (initials or emoji), `logoBg`,
`points[]`, `tags[]`. Plus `order` (drag handle, sparse float, `api.experience.reorder`) and
`visible` (toggle — hidden rows stay in the list, greyed, and never reach
`api.experience.listVisible`).

`period` and `timeframe` are **free text kept verbatim**, not dates. They render exactly as
typed. Do not add a date picker that reformats Milan's strings.

`logoBg` holds raw Tailwind classes (`"bg-slate-900 text-white"`). `02-DATA-MODEL.md` flags
this as a known wart that **P5 must revisit** for theme support. Until then the field is a
plain text input with the existing values as a datalist. Do not build a colour picker on top
of it and do not silently rewrite the classes.

### 2.8 Skills editor — P6C

`/skills`. Same shape as Experience, over `skillCategories`: `title`, `subtitle`, `icon`
(icon key), and a nested repeatable list of `skills: { name, iconKey }[]`, plus `order` and
`visible`.

`icon` and `iconKey` are **keys into `components/icons/TechIcons.tsx`**, not URLs and not
emoji. The input is a select populated from the known key list with a live glyph preview
beside it. A typo here renders a hole on the public site, so free text is not acceptable.

### 2.9 Site settings — P6C

`/settings`. The big one. The entire `siteSettings` singleton — one row, `key: "main"` —
read with `api.siteSettings.get` and written with `api.siteSettings.update`, which accepts a
**partial patch**. A tab saves only its own subtree; it never round-trips the whole document
and never clobbers a sibling group.

Seven tabs:

| Tab | Fields |
|---|---|
| **Personal** | `personal.{ name, role, location, headline, subheadline, email, bio, linkedin, linkedinUrl, github, githubUrl, twitterUrl, resumeUrl }` |
| **Stats & Tech** | `stats[] { value, label }` · `heroTechStack[] { name, iconKey }` |
| **About** | `aboutPillars[] { title, description, icon }` · `whatIWorkOn[] { title, description, icon }` |
| **Quotes** | `quotes.{ about, skills, howIBuild, experience, writing, contact }` |
| **Handwriting** | `handwriting.{ aboutPhoto, aboutBottom, projects, skillsPhoto, skillsBottom, experienceLeft, experienceRight, howIBuildTop, howIBuildBottom, writingTop, contactTop, footer }` |
| **How I Build** | `howIBuildSteps[] { step, title, icon, description, items[] }` · `howIBuildPillars[] { title, subtitle, icon }` |
| **Contact Cards** | `contactCards[] { id, title, value, hint, icon, action, copyable }` |

Notes per tab:

- **Personal.** `linkedin` / `github` are display strings (`linkedin.com/in/milankumawat`)
  and `linkedinUrl` / `githubUrl` are hrefs. Two fields, on purpose; label them so nobody
  pastes a full URL into the display field. `resumeUrl` may be a site-relative path
  (`/documents/…`) — do not validate it as an absolute URL.
- **Stats & Tech.** `stats.value` is a string (`"5K+"`, `"2+"`), never a number. `iconKey`
  uses the same select as §2.8.
- **About / How I Build.** `icon` is an icon key; same select.
- **Quotes.** Six short textareas, each labelled with the section it appears in, with a
  one-line reminder of where it renders.

> ### Handwriting — the escape trap
>
> Handwriting values contain **literal backslash-n escapes**, e.g.
> `'_Same Curiosity\nDifferent Problems'` and `'Same\nCuriosity\nDifferent\nTools'`.
> They are **not** real newlines. `components/ui/Handwriting.tsx` does **not** split on them —
> it renders inside `whitespace-pre-line`, which breaks on real newlines only, so a stored
> value fed in unchanged would print a literal `\n` on screen. Note also that this object is
> currently dead data (`06-CONTENT-MIGRATION.md §Handwriting`).
>
> - The editor must round-trip the string **byte for byte**. A plain `<textarea>` that
>   converts a typed Enter into an actual newline, or that helpfully "unescapes" the
>   backslash, silently destroys the layout of six sections.
> - Use a single-line input per value plus an explicit **Insert line break** button that
>   injects the literal two characters, and render a small live preview showing how the
>   string will break on the site.
> - Never `JSON.parse`, `String.raw`, trim, or normalise these values on the way in or out.
> - `06-CONTENT-MIGRATION.md` says the same thing about the migration. The admin is the
>   second place this can go wrong.

- **Contact Cards.** `id` is a stable key the component keys off — editable but flagged as
  "changing this may break a section". `action` is the click behaviour string and `copyable`
  is a toggle. `value` is what the visitor sees and what gets copied.

Settings changes revalidate the `home` tag (§3), because almost every field on this screen
renders on `/`.

---

## 3. Editor UX rules

These are app-wide. An editor that invents its own save semantics is a bug report waiting to
happen.

### Saves are confirmed, not optimistic

**Every content edit is an explicit Save.** No autosave on content, no optimistic UI, no
"saved ✓" before the server has agreed. The button goes `Save → Saving… → Saved`, driven by
the mutation's actual promise, and the form stays disabled while in flight.

Rationale: Convex mutations are transactional and fast, the admin is a single user on a good
connection, and the failure mode of optimistic UI here — believing a publish went through
when it did not — is worse than a 200 ms wait. The *reactive* query still means a second
open tab updates itself the moment the mutation lands; that is not the same as optimism.

Three narrow exceptions, all non-content, all cheap to lose:

| Action | Behaviour |
|---|---|
| Drag-to-reorder | Optimistic. The list reorders immediately; `reorder` follows. On failure, snap back and toast. |
| Lead status (`read` / `replied` / `archived`) | Optimistic. Wrong status is recoverable in one click. |
| Lead notes | Autosaved on blur, with a quiet "saved" tick. |

### Unsaved-change guard

Any form with a dirty field guards against navigation: in-app route changes through a
confirm dialog (**Discard changes?** / **Keep editing**), and browser close/reload through
`beforeunload`. The guard clears the instant a save resolves. Closing a picker dialog or
switching a settings tab with unsaved edits triggers the same dialog — settings tabs are
separate save scopes, and silently dropping a tab's edits is the single easiest way to lose
work in this app.

### Validation errors from Convex

Validation lives in the mutation (`02-DATA-MODEL.md §Validation rules`), so the admin's job
is to surface a thrown error usefully, not to duplicate the rules.

1. Mirror the cheap checks client-side (required, length, slug pattern, image size/type) for
   instant feedback. Never treat that as sufficient.
2. On a thrown `ConvexError`, keep the form **exactly as the user left it** — no reset, no
   clear, no navigation.
3. Map known messages to the offending field and render the error inline there; scroll it
   into view and focus it.
4. Anything unmapped goes to a dismissible banner at the top of the form with the raw
   message. A raw message the user can read and quote beats a friendly one that hides what
   happened.
5. Re-enable the Save button. A failed save must always be retryable without a reload.

The two errors that will actually be hit: **slug already taken** (field-level, on the slug
input) and **image too large / wrong type** (dialog-level, in the upload dialog).

### The publish confirmation

Publishing is the one action that changes what the world sees, so it is the one action that
asks.

Toggling `status` from `draft` to `published` opens a dialog naming the exact public URL
(`milankumawat.in/blog/<slug>`), warning that it becomes indexable, and, for a first
publish, noting that `publishedAt` is being stamped now and will not move on later edits.
Confirm calls `setStatus`.

**Publishing triggers public-site revalidation.** The mutation schedules
`internal.revalidate.ping` (`01-ARCHITECTURE.md §2`), which POSTs `/api/revalidate` with
`REVALIDATE_SECRET`, which calls `revalidateTag(tag, 'max')`. Tags by screen:

| Screen | Tags revalidated |
|---|---|
| Project | `project:<slug>`, `projects`, `home` |
| Blog post | `post:<slug>`, `blog`, `home` |
| Experience / Skills | `home` |
| Site settings | `home` (plus `projects` / `blog` if a shared setting renders there) |

After a successful publish the panel shows a toast with a **View live** link. Note the
ordering caveat: `/api/revalidate` is owned by **P7** (`08-PLAYBOOK.md §2`). Until P7 lands,
the public site runs a short `cacheLife` and the change appears within that window instead
of instantly. Build the confirmation dialog anyway — the copy does not change, only the
latency.

Unpublishing (`published → draft`) asks the same way and revalidates the same tags, with
copy that says the URL will start returning 404.

---

## 4. Permissions

Every function in the frozen surface (`02-DATA-MODEL.md §Function surface`), and what
guards it. `[admin]` means **`requireAdmin(ctx)` is the first statement of the function
body**.

| Module | Function | Kind | Access |
|---|---|---|---|
| `projects` | `listPublished` | query | public |
| | `listFeatured` | query | public |
| | `bySlug` | query | public |
| | `listAll` | query | **admin** |
| | `create` · `update` · `remove` | mutation | **admin** |
| | `reorder` | mutation | **admin** |
| | `setStatus` | mutation | **admin** |
| `blog` | `listPublished` | query | public |
| | `bySlug` | query | public |
| | `listTags` | query | public |
| | `listAll` | query | **admin** |
| | `create` · `update` · `remove` | mutation | **admin** |
| | `setStatus` | mutation | **admin** |
| | `incrementViews` | mutation | public (fire-and-forget) |
| `leads` | `submit` | mutation | public — **the only hostile surface** |
| | `list` · `get` | query | **admin** |
| | `setStatus` · `setNotes` · `remove` | mutation | **admin** |
| | `unreadCount` | query | **admin** |
| `experience` | `listVisible` | query | public |
| | `listAll` | query | **admin** |
| | `create` · `update` · `remove` · `reorder` | mutation | **admin** |
| `skills` | `listVisible` | query | public |
| | `listAll` | query | **admin** |
| | `create` · `update` · `remove` · `reorder` | mutation | **admin** |
| `siteSettings` | `get` | query | public |
| | `update` | mutation | **admin** |
| `media` | `urlFor` | query | public |
| | `list` | query | **admin** |
| | `generateUploadUrl` · `create` · `remove` | mutation | **admin** |
| `internal/notify` | `newLead` | action | internal |
| `internal/revalidate` | `ping` | action | internal |
| `internal/seed` | `importLegacy` | mutation | internal |

Three rules that follow from the table:

1. **Every mutation in this build is `[admin]` except `leads.submit` and
   `blog.incrementViews`.** If a new mutation is neither of those and does not call
   `requireAdmin`, it is a bug.
2. **Drafts are filtered inside the query, never in a component.**
   `projects.listPublished`, `projects.bySlug`, `blog.listPublished` and `blog.bySlug`
   apply `status === "published"` server-side; `bySlug` returns `null` for a draft rather
   than a document the component is trusted to hide. Same for `visible` on
   `experience.listVisible` and `skills.listVisible`. A component that receives a draft has
   already leaked it — the HTML is on the wire and in the cache.
3. **`listAll` is the admin-only twin** of each public list. The admin never calls a
   `listPublished` and filters client-side, and the public site never calls a `listAll`.

---

## 5. What the admin deliberately does NOT do

Scoped out of v1 on purpose. A future session that adds one of these without being asked is
adding unrequested surface to a single-user panel. If one becomes genuinely necessary, it
gets a phase and a line in `STATUS.md` first.

| Not built | Why |
|---|---|
| **Multi-user accounts** | One identity: `ADMIN_IDENTITY`. No user table, no invites, no user management screen. |
| **Roles and permissions** | There is one role. `requireAdmin()` returns a yes or throws. No `isEditor`, no permission matrix, no per-table grants. |
| **Audit log** | Nothing records who changed what and when beyond `updatedAt`. With one user the answer is always "Milan". The dashboard's recent-activity list is an `updatedAt` sort, not a log — it cannot show history and must not be extended into one. |
| **Content versioning / revisions / rollback** | No `revisions` table, no diffs, no "restore previous version". An edit overwrites. Publishing is a status flip on the same row, not a draft copy promoted over a live one. |
| **Scheduled publishing** | `publishedAt` is stamped when Milan publishes. No future-dated queue, no cron. |
| **Preview of unpublished content on the public site** | No draft mode, no preview tokens, no `draftMode()`. The blog editor's live preview is the preview. |
| **Rich-text WYSIWYG** | Markdown is the format (`00-MASTER-PLAN.md §3`) because it is portable, diff-able and chunks cleanly for the P8 bot. A WYSIWYG that emits HTML breaks all three. |
| **Comments, reactions, or any visitor-generated content** | No moderation queue exists because no such content exists. |
| **Analytics dashboards** | `blogPosts.views` is a counter shown in the list. Real analytics belong in P7's analytics wiring, not here. |
| **Bulk import/export, CSV, backups** | Convex owns durability. `internal/seed.importLegacy` is a one-shot P2 migration, not a general import tool. |
| **Sending email from the panel** | Replies go out through `mailto:` and Milan's own client. The only mail this system sends is the lead notification from `internal/notify.newLead`. |
| **Media reference counting** | §2.5. Delete is delete. |
| **Slug redirects** | §2.3. Changing a published slug breaks the URL, and the editor says so. |
