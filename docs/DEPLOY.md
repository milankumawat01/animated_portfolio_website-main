# Deploy runbook

**Deployed 2026-09-23.** Production is live — this file records how, and what is still open.

| | Public site | Admin |
|---|---|---|
| Vercel project | `animated-portfolio-website-main` (root `apps/web`) | `milan-portfolio-admin` (root `apps/admin`) |
| URL | `https://milankumawat.is-a.dev` (+ `milankumawat.vercel.app`, `milankumawat.eu.org`) | `https://milan-portfolio-admin.vercel.app` |
| Deploys on | push to `main` on GitHub | push to `main` on GitHub |
| Convex | prod `polite-hornet-484` — functions pushed with `npx convex deploy` from `packages/backend` | same |

**`milankumawat.is-a.dev` does not exist** (no DNS). Every older doc that says it means `milankumawat.is-a.dev`.
Convex functions are deployed from a laptop (`npx convex deploy -y`), **not** on Vercel — there is
no `CONVEX_DEPLOY_KEY` in Vercel. After changing anything in `packages/backend/convex`, run it
before or right after pushing.

Still open: `RESEND_API_KEY` + `LEAD_NOTIFY_TO` (lead emails; leads are stored regardless).

Architecture reference: `01-ARCHITECTURE.md §5`. Two Vercel projects, one repo, one Convex
backend. **Only `apps/web` deploys Convex** — two projects deploying the same backend is a race.

---

## 1. Convex — production deployment

1. Convex dashboard → project `milan-portfolio` → create/open the **production** deployment.
2. Settings → **Generate production deploy key**. Keep it for step 3.
3. Set the production env vars (dashboard → Settings → Environment Variables, or
   `npx convex env set --prod NAME value` from `packages/backend`):

| Variable | Value | Used by |
|---|---|---|
| `SITE_URL` | `https://milankumawat.is-a.dev` | `internal/revalidate.ping` — where to POST |
| `REVALIDATE_SECRET` | long random string, **same** as on Vercel | `internal/revalidate.ping` |
| `ADMIN_EMAIL` | `milankumawat01@gmail.com` | Password sign-in and `requireAdmin` — only this address can sign up or sign in. Fails closed: unset means nobody is admin. |
| `JWT_PRIVATE_KEY`, `JWKS` | a fresh RS256 pair — `npx @convex-dev/auth --prod` generates and sets both | Convex Auth token signing |
| `RESEND_API_KEY` | Resend dashboard | lead notification email |
| `LEAD_NOTIFY_TO` | `hey@milankumawat.in` (or wherever) | lead notification email |

> Dev (`sincere-duck-662`) already has `ADMIN_EMAIL`, `JWT_PRIVATE_KEY` and `JWKS`, and the
> admin account exists there. Dev still lacks `REVALIDATE_SECRET`, `SITE_URL`, `RESEND_API_KEY`
> and `LEAD_NOTIFY_TO`, so revalidation pings and lead emails are inert in dev.

4. **Create the prod admin account** once the admin app is live: open
   `https://milan-portfolio-admin.vercel.app/login` → "First time? Create the admin account" → your
   email and password (10+ characters). Accounts live per deployment, so the dev account
   does not carry over. After that, only "Sign in" is needed.

## 2. Seed production

The dev deployment is seeded and passes parity. Seed prod once:

```bash
cd packages/backend
npx convex run --prod internal/seed:importLegacy
cd ../..
CONVEX_URL=https://<prod-deployment>.convex.cloud node --experimental-strip-types scripts/parity-check.mjs
```

Never pass `{"overwrite": true}` in production — it resets admin edits back to the legacy text.

## 3. Vercel — `apps/web` (public site)

| Setting | Value |
|---|---|
| Root directory | `apps/web` |
| Build command | `cd ../../packages/backend && npx convex deploy --cmd 'cd ../../apps/web && npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL` |
| Env | `CONVEX_DEPLOY_KEY` (prod key from 1.2), `REVALIDATE_SECRET` (same as Convex), `NEXT_PUBLIC_SITE_URL=https://milankumawat.is-a.dev` |
| Domain | `milankumawat.is-a.dev` |

`convex deploy` injects `NEXT_PUBLIC_CONVEX_URL` itself. Preview deploys: either give them a
Preview deploy key or set `NEXT_PUBLIC_SITE_URL` per environment so canonical URLs are right.

## 4. Vercel — `apps/admin`

| Setting | Value |
|---|---|
| Root directory | `apps/admin` |
| Build command | `npm run build` (**no** `convex deploy`) |
| Env | `NEXT_PUBLIC_CONVEX_URL=https://<prod-deployment>.convex.cloud` |
| Domain | `milan-portfolio-admin.vercel.app` |

The admin serves `robots.txt` with `Disallow: /` and a `noindex` meta on every page.

## 5. Post-deploy verification (P7 acceptance)

- [ ] `curl -X POST https://milankumawat.is-a.dev/api/revalidate` → **401**
- [ ] Edit a project title in the admin → public page updates within seconds
      (Convex dashboard → Logs should show no `Revalidation failed` lines)
- [ ] `https://milankumawat.is-a.dev/sitemap.xml` — 11 URLs, no drafts
- [ ] `https://milan-portfolio-admin.vercel.app/robots.txt` → `Disallow: /`
- [ ] OG previews: paste home, `/projects/hiro`, `/blog/building-ai-powered-fastapi` into
      opengraph.xyz or the LinkedIn Post Inspector
- [ ] JSON-LD: same three URLs through search.google.com/test/rich-results
- [ ] Lighthouse ≥ 90 on all four categories for the same three pages
- [ ] Submit a real lead on production → appears in admin inbox **and** in email
- [ ] Click through both themes on desktop and mobile
- [ ] No secret in the client bundle: `grep -r "REVALIDATE_SECRET\|re_" apps/web/.next/static` is empty
