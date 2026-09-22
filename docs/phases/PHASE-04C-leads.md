# P4C — Leads Pipeline

| | |
|---|---|
| **Wave** | 3 — parallel with P4A and P4B |
| **Depends on** | P3 (and P1, which already implemented `leads.submit`) |
| **Must not touch** | anything project or blog related |

## Goal

Make the contact form real. Today `components/modals/ContactModal.tsx:22-40` runs an 800ms
`setTimeout`, fires confetti, shows "Message Sent!", and **throws the message away**. Every
enquiry Milan has ever received through this form is gone.

This is the highest-value change in the entire build.

## Files owned

- `apps/web/components/modals/ContactModal.tsx`
- `apps/web/components/ContactSection.tsx`
- `packages/backend/convex/leads.ts`
- `packages/backend/convex/internal/notify.ts`

## Read first

1. `docs/02-DATA-MODEL.md` — `leads.submit` and §Validation rules
2. `docs/01-ARCHITECTURE.md` — §2 lead capture flow, §6 security

## Steps

1. **Replace the fake submit.** The `setTimeout` becomes `useMutation(api.leads.submit)`.
   Keep the existing UI exactly — the same fields, the same success screen, the same
   confetti. Milan's design stays; only the plumbing changes.
2. **Real states.** Submitting, success, and — new — **failure**. The current code has no
   error path at all because it could not fail. Now it can: a network drop, a validation
   throw, a rate limit. Each needs a message a human can act on, and the user's typed
   message must not be lost when an error occurs.
3. Add the honeypot field: visually hidden, not `display:none` (bots read CSS), not
   focusable, `tabindex="-1"`, `autocomplete="off"`.
4. Pass `meta` — `userAgent`, `referrer`, `path` — and `source`.
5. **Storage first, notification second.** `leads.submit` inserts the lead, then schedules
   `internal.notify.newLead`. If Resend is down, the lead is still saved and the visitor
   still sees success. A failed email must never surface as a failed submission.
6. Implement `internal.notify.newLead`: a Resend email to `LEAD_NOTIFY_TO` with the name,
   email, message and a link to the lead in the admin. Set `notified: true` on success. Let
   the action retry on failure.
7. Client-side validation mirrors the server rules for fast feedback — but the server rules
   are the real ones and are already enforced in P1.

## Acceptance criteria

- [ ] Submitting the form creates a `leads` row visible in the Convex dashboard
- [ ] The success screen and confetti behave exactly as before
- [ ] A notification email arrives at `LEAD_NOTIFY_TO`
- [ ] **With Resend deliberately broken** (bad key), the lead is still stored and the visitor
      still sees success — verify this, it is the whole point of ordering the operations
- [ ] Validation errors surface usefully: empty name, 5-character message, malformed email
- [ ] The typed message survives a failed submission — nothing is cleared on error
- [ ] Filling the honeypot returns **success** and stores nothing
- [ ] A 4th submission within an hour is rate-limited with a friendly message
- [ ] No raw IP is stored — check the stored document
- [ ] `RESEND_API_KEY` is in the Convex dashboard, not in any `NEXT_PUBLIC_` variable and not
      in the repo
- [ ] `npm run build` passes; `npx tsc --noEmit` passes
- [ ] Nothing project or blog related is in the diff

## Out of scope — but adjacent

`components/Footer.tsx:27-33` contains a **second fake form**: a newsletter subscribe box
that discards the email exactly the way this phase's contact form used to. **No phase owns
it and no table exists for it.** Do not quietly build a newsletter here — it is an open
question for Milan in `STATUS.md`. If he wants it, it gets its own `subscribers` table, its
own double-opt-in thinking, and its own phase.

## Gotcha

`ContactSection.tsx` also exposes a copyable email and a `mailto:` card. Those keep working
untouched — not every visitor uses the form, and the form is not the only path.

## Commit

`feat(p4c): store contact form leads in convex and notify by email`
