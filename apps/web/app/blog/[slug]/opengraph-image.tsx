import { getPost, formatLegacyDate } from '@/lib/convex'
import { OG_SIZE, ogCard } from '@/lib/og'

export const alt = 'Article by Milan Kumawat'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug).catch(() => null)

  return ogCard({
    eyebrow: 'Writing',
    title: post?.title ?? 'Article',
    subtitle: post?.excerpt,
    footer: post?.publishedAt
      ? `${formatLegacyDate(post.publishedAt)} · ${post.readTimeMinutes} min read`
      : undefined,
  })
}
