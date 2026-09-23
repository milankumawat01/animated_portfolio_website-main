import type { MetadataRoute } from 'next'

// The admin domain is never indexed — docs/phases/PHASE-07-launch.md.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  }
}
