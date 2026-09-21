import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * `next dev` and `next build` both write to `.next`, and running one while the
   * other is live corrupts the manifest — the symptom is a build that compiles
   * cleanly and then dies with `Cannot find module for page: /_not-found`.
   * Setting `NEXT_DIST_DIR` gives a build its own output directory, so bundle
   * analysis can run against a live dev server. Deploys leave it unset and get
   * `.next` exactly as before.
   *
   * Point it at a path that `.gitignore` and `eslint.config.mjs` already ignore —
   * `.probe/next-build` is the obvious one — or `eslint .` will walk the build
   * output and drown in errors from minified vendor code.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  transpilePackages: ['three'],
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vert|frag|vs|fs)$/,
      type: 'asset/source',
    })

    /**
     * `n8ao` was 69 kB gzipped of the initial payload for code this site never
     * calls.
     *
     * `@react-three/postprocessing` ships as one pre-bundled `dist/index.js` with
     * `import { N8AOPostPass } from 'n8ao'` at the top of it. PostFX imports five
     * effects from that barrel; the `<N8AO>` component tree-shakes away, but the
     * import of the package it wraps does not, because `n8ao` does not declare
     * itself side-effect free and webpack will not drop a module that might do
     * something on evaluation. What survived was an ambient-occlusion pass with a
     * base64 int8 neural denoise model embedded in it — which is why that chunk
     * barely compressed.
     *
     * `n8ao`'s dist is a pure module: it declares classes and exports them. Saying
     * so here lets webpack finish the job. This is a statement of fact about the
     * package, not a suppression — if anything ever does render `<N8AO>`, the
     * import is live again and the chunk comes back.
     */
    config.module.rules.push({
      test: /[\\/]node_modules[\\/](\.pnpm[\\/])?n8ao[@\w.\-+]*[\\/]/,
      sideEffects: false,
    })

    return config
  },
  turbopack: {
    rules: {
      '*.glsl': { loaders: ['raw-loader'], as: '*.js' },
      '*.vert': { loaders: ['raw-loader'], as: '*.js' },
      '*.frag': { loaders: ['raw-loader'], as: '*.js' },
    },
  },
}

export default nextConfig
