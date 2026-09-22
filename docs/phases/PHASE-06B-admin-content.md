# P6B — Admin: Blog Editor & Media Library

| | |
|---|---|
| **Wave** | 5 |
| **Depends on** | P6A (shell and auth) |
| **Runs with** | P6C |

## Goal

Milan can write and publish a blog post, and upload the images that go in it, without
touching a repo.

## Files owned

- `apps/admin/app/(dash)/blog/**`
- `apps/admin/app/(dash)/media/**`
- `apps/admin/components/editor/**`

## Read first

1. `docs/04-ADMIN-PANEL.md` — the editor specs
2. `docs/02-DATA-MODEL.md` — `blogPosts`, `media`, and the validation rules

## Steps

1. Blog list: all posts including drafts, status, published date, view count, delete with
   confirmation.
2. Markdown editor with **live preview**. It must render the same way the public site does —
   an editor that lies about the output is worse than no preview. Use the same Markdown
   pipeline P4B chose (recorded in `STATUS.md §Decisions`).
3. Post fields: title, slug, excerpt, body, cover image, tags, `featured`, SEO overrides.
4. **Read time auto-derives from the body** with a manual override, since
   `readTimeMinutes` is a real field and not a guess made at render time.
5. Draft/publish with `publishedAt` set on first publish, and revalidation fired on save.
6. Media library: `media.generateUploadUrl` → upload → `media.create`. Grid view, alt text
   **required** (an empty alt is an accessibility bug, not a blank field), delete with a
   usage warning.
7. **Capture width and height on upload** and store them, so `next/image` gets explicit
   dimensions and the public page does not shift while loading.
8. Enforce the limits from the data model: 10 MB, `image/*` only. Enforce them in the Convex
   mutation, not only in the picker.
9. An image picker usable from the blog and project editors, not only from the media page.

## Acceptance criteria

- [ ] Creating, editing and publishing a post works end to end, and it appears at
      `/blog/[slug]` after revalidation
- [ ] The preview matches the public rendering — including fenced code blocks with
      highlighting. Compare side by side.
- [ ] Read time auto-derives and the manual override sticks
- [ ] Draft posts are invisible on the public site and in `/feed.xml`
- [ ] Uploading an image stores it, records width/height, and it renders through
      `next/image` on the public site with no layout shift
- [ ] Alt text cannot be left empty
- [ ] A 12 MB file is rejected; a PDF is rejected — **tested against the mutation**, not just
      the file picker
- [ ] Deleting a media item warns if something references it
- [ ] Unsaved-change guard works in the post editor
- [ ] `npm run build` and `npx tsc --noEmit` pass for `apps/admin`

## Commit

`feat(p6b): admin blog editor and media library`
