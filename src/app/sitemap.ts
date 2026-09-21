import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * One page, so one entry.
 *
 * The eight stations are fragments of that page, not URLs, and a sitemap listing
 * `#about` is a sitemap listing the same document eight times — search engines
 * discard fragments and some treat the repetition as a quality signal against you.
 * `/fallback` is deliberately absent for the same reason: it is the same content at
 * a second URL, and `robots.ts` keeps crawlers off it.
 *
 * The four articles will each earn an entry the moment A9 lands real URLs
 * (`docs/04-ASSET-MANIFEST.md` §A9 — every `href` in `data/articles` is `'#'`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
