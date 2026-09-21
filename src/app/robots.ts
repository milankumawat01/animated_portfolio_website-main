import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * Everything is crawlable except `/fallback`, which is the same content at a second
 * URL and would read as duplication. It stays reachable for people — it is the
 * no-script, no-WebGL version — just not indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/fallback'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
