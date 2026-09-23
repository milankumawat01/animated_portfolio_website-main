import { NextResponse } from 'next/server'
import { getPosts, type PostDoc } from '@/lib/convex'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatRfc822(epochMs: number): string {
  return new Date(epochMs).toUTCString()
}

export async function GET(): Promise<NextResponse> {
  let posts: PostDoc[] = []
  try {
    posts = await getPosts({ limit: 20 })
  } catch {
    posts = []
  }

  const items = posts
    .filter((p) => p.status === 'published')
    .map((p) => {
      const pubDate = p.publishedAt ? formatRfc822(p.publishedAt) : formatRfc822(p.updatedAt)
      const link = `${SITE_URL}/blog/${escapeXml(p.slug)}`
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      ${p.tags.map((t: string) => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Milan Kumawat — Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Thoughts on AI engineering, backend systems, and things I learn by building.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
