# P0 — Foundation & Scaffold

**Mode:** solo, blocking · **Depends on:** nothing · **Est:** 2h

The repo currently contains only `.git`, `.gitignore`, `.old/`, `references/`, `docs/`.
The old Vite portfolio is staged as moved into `.old/`. This phase creates the new app
from scratch alongside it.

---

## Files you own

```
package.json  pnpm-lock.yaml  next.config.ts  tsconfig.json
postcss.config.mjs  eslint.config.mjs  .prettierrc  .env.example
src/app/layout.tsx
src/app/page.tsx            (temporary placeholder; P1 replaces it)
src/data/profile.ts  projects.ts  experience.ts  skills.ts  process.ts  articles.ts
public/fonts/**
README.md
```

---

## Tasks

1. **Scaffold.** `pnpm create next-app@latest . --ts --tailwind --eslint --app
   --src-dir --import-alias "@/*" --no-turbopack` into the repo root. Keep `.old/`
   and `references/` untouched — add both to `.gitignore`? **No** — keep `references/`
   tracked, it is the design source. Add `.old/` to `.gitignore` only if it is not
   already staged; it currently is, so leave it.

2. **Dependencies.**
   ```
   three @types/three @react-three/fiber @react-three/drei
   @react-three/postprocessing postprocessing
   gsap @studio-freight/lenis   (or the current `lenis` package)
   motion zustand clsx tailwind-merge
   simple-icons
   -D  glslify-loader raw-loader  (or use next.config's webpack rule for .glsl)
   ```
   Pin Three to a version R3F v9 supports. Verify the R3F/drei/three triple is
   mutually compatible before moving on — this is the single most common source of
   wasted time in this stack.

3. **`next.config.ts`** — add a webpack rule so `*.glsl` / `*.vert` / `*.frag` import
   as raw strings, and set `images.formats = ['image/avif','image/webp']`.

4. **Fonts in `layout.tsx`.**
   - Inter, Caveat, JetBrains Mono via `next/font/google`, each with a CSS variable.
   - Satoshi via `next/font/local` from `public/fonts/` **if** the woff2 files are in
     `assets/incoming/`. If not, use **Sora** from `next/font/google` and record the
     fallback in `STATUS.md`.
   - Expose all four as `--font-display`, `--font-body`, `--font-script`, `--font-mono`.

5. **Data files.** Transcribe `docs/06-CONTENT.md` into typed modules under
   `src/data/`. Every array is `as const` where practical, with an exported type.
   Example shape:
   ```ts
   export interface Project {
     id: string; name: string; description: string
     tags: readonly string[]; href: string; image: string
   }
   export const projects: readonly Project[] = [...]
   ```
   Content is verbatim. Do not paraphrase, do not shorten.

6. **`simple-icons` gap list.** Write a throwaway script that checks which of the 28
   marks in `docs/04-ASSET-MANIFEST.md` §A5 resolve in `simple-icons`. Write the
   missing ones into `STATUS.md` under Cross-phase requests so Milan can supply them.

7. **Placeholder page.** `src/app/page.tsx` renders a bare "P0 complete" screen. P1
   throws it away.

8. **Scripts** in `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`.

---

## Acceptance criteria

- [ ] `pnpm dev` serves a page with no console errors
- [ ] `pnpm build` and `pnpm typecheck` pass clean
- [ ] All four font variables resolve — verify in DevTools computed styles
- [ ] Importing a `.glsl` file returns a string (add a scratch test, then delete it)
- [ ] All six data files typecheck and match `docs/06-CONTENT.md` exactly
- [ ] `STATUS.md`: P0 marked ✅, font fallback noted, icon gap list filed

---

## Assets

None blocking. If `assets/incoming/` already has Satoshi woff2 or the resume PDF,
copy them into `public/` now.
