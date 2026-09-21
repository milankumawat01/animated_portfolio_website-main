/**
 * The simple-icons gap list, verified by `scripts/check-icons.mjs` against
 * simple-icons@16.32.0.
 *
 * The name-to-mark map itself lives in `components/ui/TechLogo.tsx`, where it has to
 * be a static map of explicit imports so the bundler can tree-shake the other ~3,300
 * icons out of the client bundle.
 */

/**
 * Names with no simple-icons mark, rendered as a monogram tile.
 * LinkedIn is also absent from simple-icons but is not listed here — we draw our
 * own stroke glyph for it in `components/ui/Icon.tsx`.
 */
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
