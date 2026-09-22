# P4B — Blog Pages

| | |
|---|---|
| **Wave** | 3 — parallel with P4A and P4C |
| **Depends on** | P3 |
| **Must not touch** | anything project or contact related |

## Goal

Turn four hardcoded article objects into an actual blog: an index, real post pages, Markdown
with code blocks, tags, and a feed. Unlike projects, **the blog is full-page only** — long-form
writing in a modal cannot be linked, indexed or comfortably read.

## Files owned

- `apps/web/app/blog/page.tsx` — the index
- `apps/web/app/blog/[slug]/page.tsx` — the post
- `apps/web/app/blog/[slug]/opengraph-image.tsx`
- `apps/web/app/feed.xml/route.ts`
- `apps/web/components/markdown/**` — new
- `apps/web/components/WritingSection.tsx`
- **Deletes** `apps/web/components/modals/ArticleModal.tsx`

## Read first

1. `docs/03-ROUTES-AND-PAGES.md`
2. `docs/01-ARCHITECTURE.md` §3, §7
3. `docs/02-DATA-MODEL.md` — `blog.listPublished`, `blog.bySlug`, `blog.listTags`

## Steps

1. Choose the Markdown stack and **record the choice in `STATUS.md §Decisions`**. It must
   render server-side, support fenced code blocks with syntax highlighting (Milan writes
   about FastAPI and system design — code blocks are the point), and must not ship a large
   client bundle. Sanitize: the body is admin-authored, but treat it as untrusted anyway.
2. `/blog` — the index: cover image, title, excerpt, tag, read time, date. Newest first, via
   `by_status_publishedAt`. Reuse the card design from `WritingSection`.
3. Tag filtering at `/blog?tag=engineering`. `searchParams` is a Promise in Next 16.
4. `/blog/[slug]` — the post page: cover, title, date, read time, tags, rendered Markdown
   body, and a "back to all posts" link. Typographic width capped for readability.
5. `generateStaticParams` + `generateMetadata` (title, description from `excerpt`, OG image,
   canonical, `article:published_time`). `notFound()` when `bySlug` returns null.
6. **Delete `ArticleModal.tsx`.** P3 already removed its usage from the home page, so this is
   a clean delete. Confirm no import survives.
7. **Fix a live bug.** `WritingSection.tsx:69` has a "View all articles" button wired to
   `onSelectArticle(articles[0])` — it opens the *first article's modal* instead of a
   listing. It becomes a link to `/blog`. Article cards become links to `/blog/[slug]`.
8. `/feed.xml` — RSS for published posts.
9. Call `blog.incrementViews` from the post page, fire-and-forget. It must never block
   render or break the page if it fails.
10. Cache tags: `blog` for the index, `post:<slug>` per post.

## Acceptance criteria

- [ ] `/blog` lists all 4 published posts, newest first
- [ ] All four slugs render: `building-ai-powered-fastapi`,
      `designing-scalable-backend-systems`, `lessons-from-autoresumebot`,
      `from-idea-to-production`
- [ ] Markdown renders headings, lists, links, **and fenced code blocks with highlighting** —
      test with a real code block, not a paragraph
- [ ] Migrated posts (paragraph arrays joined into Markdown) render with correct paragraph
      breaks
- [ ] A draft post 404s; `/blog/nope` renders the 404 page
- [ ] `/blog?tag=Engineering` filters correctly
- [ ] `view-source` contains the post body
- [ ] `/feed.xml` validates as RSS and lists only published posts
- [ ] `ArticleModal.tsx` is deleted and nothing imports it — `grep -r ArticleModal` is clean
- [ ] "View all articles" goes to `/blog` instead of opening a modal
- [ ] `npm run build` prerenders the post routes; `npx tsc --noEmit` passes
- [ ] Nothing project or contact related is in the diff

## Commit

`feat(p4b): blog index, post pages and markdown rendering`
