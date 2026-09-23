import type { Metadata } from 'next'

type OpenGraph = NonNullable<Metadata['openGraph']>

// Next.js replaces a layout's `openGraph` wholesale when a page sets its own,
// so every page builds it here to keep siteName/locale and a per-page og:url.
export function openGraph(path: string, fields: OpenGraph): OpenGraph {
  return {
    siteName: 'Milan Kumawat',
    locale: 'en_US',
    url: path,
    ...fields,
  }
}

export const RSS_FEED = { 'application/rss+xml': '/feed.xml' }
