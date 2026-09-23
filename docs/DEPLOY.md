# Deploy runbook

The code is ready to ship. Everything below needs Milan's accounts (Convex, Vercel, GitHub,
Resend, DNS), so it cannot be done from a coding session. Work top to bottom.

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
| `SITE_URL` | `https://milankumawat.in` | `internal/revalidate.ping` — where to POST |
| `REVALIDATE_SECRET` | long random string, **same** as on Vercel | `internal/revalidate.ping` |
| `ADMIN_IDENTITY` | your `tokenIdentifier` — sign in once, then read it from the `users`/auth tables or a log | `requireAdmin` — ⚠️ **unset means ANY GitHub user who signs in is admin.** It fails open; nothing warns you. Set it before sharing the admin URL. |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth app (step 4) | Convex Auth |
| `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL` for auth | generate with `npx @convex-dev/auth --prod` | Convex Auth |
| `RESEND_API_KEY` | Resend dashboard | lead notification email |
| `LEAD_NOTIFY_TO` | `hey@milankumawat.in` (or wherever) | lead notification email |

> The dev deployment (`sincere-duck-662`) currently has **no** env vars set, so admin login,
> lead emails and revalidation pings are inert in dev too. Set the same list there with
> `npx convex env set NAME value` (no `--prod`) to test locally.

4. **GitHub OAuth app** (github.com → Settings → Developer settings → OAuth Apps):
   callback URL `https://<prod-deployment>.convex.site/api/auth/callback/github`.

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
| Env | `CONVEX_DEPLOY_KEY` (prod key from 1.2), `REVALIDATE_SECRET` (same as Convex), `NEXT_PUBLIC_SITE_URL=https://milankumawat.in` |
| Domain | `milankumawat.in` |

`convex deploy` injects `NEXT_PUBLIC_CONVEX_URL` itself. Preview deploys: either give them a
Preview deploy key or set `NEXT_PUBLIC_SITE_URL` per environment so canonical URLs are right.

## 4. Vercel — `apps/admin`

| Setting | Value |
|---|---|
| Root directory | `apps/admin` |
| Build command | `npm run build` (**no** `convex deploy`) |
| Env | `NEXT_PUBLIC_CONVEX_URL=https://<prod-deployment>.convex.cloud` |
| Domain | `admin.milankumawat.in` |

The admin serves `robots.txt` with `Disallow: /` and a `noindex` meta on every page.

## 5. Post-deploy verification (P7 acceptance)

- [ ] `curl -X POST https://milankumawat.in/api/revalidate` → **401**
- [ ] Edit a project title in the admin → public page updates within seconds
      (Convex dashboard → Logs should show no `Revalidation failed` lines)
- [ ] `https://milankumawat.in/sitemap.xml` — 11 URLs, no drafts
- [ ] `https://admin.milankumawat.in/robots.txt` → `Disallow: /`
- [ ] OG previews: paste home, `/projects/hiro`, `/blog/building-ai-powered-fastapi` into
      opengraph.xyz or the LinkedIn Post Inspector
- [ ] JSON-LD: same three URLs through search.google.com/test/rich-results
- [ ] Lighthouse ≥ 90 on all four categories for the same three pages
- [ ] Submit a real lead on production → appears in admin inbox **and** in email
- [ ] Click through both themes on desktop and mobile
- [ ] No secret in the client bundle: `grep -r "REVALIDATE_SECRET\|re_" apps/web/.next/static` is empty
