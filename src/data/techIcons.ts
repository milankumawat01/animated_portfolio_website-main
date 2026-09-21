/**
 * Maps every technology name used on the site to its `simple-icons` export key.
 *
 * Four marks are NOT in simple-icons (verified by scripts/check-icons.mjs against
 * simple-icons@16.32.0) and are listed in MISSING_ICONS. Components render a
 * monogram tile for those until Milan supplies an SVG — see docs/04-ASSET-MANIFEST.md §A5.
 */

export const ICON_SLUGS: Readonly<Record<string, string>> = {
  Python: 'siPython',
  FastAPI: 'siFastapi',
  'Node.js': 'siNodedotjs',
  PostgreSQL: 'siPostgresql',
  MongoDB: 'siMongodb',
  Redis: 'siRedis',
  Claude: 'siClaude',
  Gemini: 'siGooglegemini',
  LangChain: 'siLangchain',
  'Next.js': 'siNextdotjs',
  React: 'siReact',
  TypeScript: 'siTypescript',
  'Tailwind CSS': 'siTailwindcss',
  Tailwind: 'siTailwindcss',
  HTML: 'siHtml5',
  HTML5: 'siHtml5',
  CSS: 'siCss',
  CSS3: 'siCss',
  Supabase: 'siSupabase',
  Convex: 'siConvex',
  Cloudflare: 'siCloudflare',
  'Cloudflare R2': 'siCloudflare',
  Firebase: 'siFirebase',
  Docker: 'siDocker',
  Nginx: 'siNginx',
  Vercel: 'siVercel',
  DigitalOcean: 'siDigitalocean',
  Ubuntu: 'siUbuntu',
  GitHub: 'siGithub',
  Postman: 'siPostman',
  Figma: 'siFigma',
  Resend: 'siResend',
  Notion: 'siNotion',
  Express: 'siExpress',
}

/** Names with no simple-icons mark. Rendered as a monogram tile. */
export const MISSING_ICONS: readonly string[] = [
  'OpenAI',
  'LlamaIndex',
  'VS Code',
  'RAG',
] as const

/** Short label used by the monogram-tile fallback. */
export const ICON_MONOGRAM: Readonly<Record<string, string>> = {
  OpenAI: 'AI',
  LlamaIndex: 'LI',
  'VS Code': 'VS',
  RAG: 'RAG',
}
