# P6C — Admin: Leads, Experience, Skills & Site Settings

| | |
|---|---|
| **Wave** | 5 |
| **Depends on** | P6A (shell and auth) |
| **Runs with** | P6B |

## Goal

The rest of the admin: the leads inbox, and editors for every remaining piece of content —
experience, skills, and the whole `siteSettings` singleton. When this lands, **nothing on the
public site requires a code change to edit**, which was the point of the build.

## Files owned

- `apps/admin/app/(dash)/leads/**`
- `apps/admin/app/(dash)/experience/**`
- `apps/admin/app/(dash)/skills/**`
- `apps/admin/app/(dash)/settings/**`

## Read first

1. `docs/04-ADMIN-PANEL.md`
2. `docs/02-DATA-MODEL.md` — `leads`, `experience`, `skillCategories`, and the full
   `siteSettings` shape

## Steps

1. **Leads inbox**: list filtered by status (new / read / replied / archived), newest first,
   unread badge in the sidebar, detail view with the full message and `meta`, private notes,
   a `mailto:` reply link, and status transitions. Opening a lead marks it read.
2. Experience editor: ordered list, drag-to-reorder, visible toggle, all fields including
   `points[]` and `tags[]` as list editors.
3. Skills editor: categories with nested `skills[]`, each with a `name` and an `iconKey`. The
   `iconKey` must map to something real in `components/icons/TechIcons.tsx` — surface the
   valid keys in the UI rather than letting a typo silently render nothing.
4. **Site settings**, grouped into tabs so a 60-field form is navigable: Personal, Stats &
   Tech, About, Quotes, Handwriting, How I Build, Contact Cards.
5. **The handwriting fields need care.** They contain literal `\n` escapes — two characters,
   not newlines — and the editor must round-trip them exactly rather than helpfully
   "unescaping" them or turning a typed Enter into a real newline. Note that this object is
   currently dead data that no component reads (`06-CONTENT-MIGRATION.md §Handwriting`), so
   editing it changes nothing on the public site until someone wires it up. Surface that in
   the UI instead of implying the field is live.
6. Every save fires revalidation for the affected cache tags.

## Acceptance criteria

- [ ] A lead submitted from the public contact form appears in the inbox
- [ ] Status transitions persist; the unread badge is accurate; opening marks read
- [ ] Private notes save and are never exposed on the public site
- [ ] Experience edits appear on the public home page after revalidation; reordering holds
- [ ] Skills edits appear, and an invalid `iconKey` cannot be saved silently
- [ ] Every `siteSettings` field is editable — walk the whole form against
      `02-DATA-MODEL.md` and confirm nothing is missing
- [ ] **Handwriting strings round-trip byte-for-byte**, `\n` sequences intact, and still
      line-break correctly on the public site after an edit-and-save cycle
- [ ] Editing the headline in settings changes the public hero after revalidation
- [ ] All mutations reject an unauthenticated caller
- [ ] `npm run build` and `npx tsc --noEmit` pass for `apps/admin`

## Commit

`feat(p6c): admin leads inbox and site content editors`
