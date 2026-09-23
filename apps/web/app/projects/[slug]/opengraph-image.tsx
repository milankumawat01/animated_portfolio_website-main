import { getProject } from '@/lib/convex'
import { OG_SIZE, ogCard } from '@/lib/og'

export const alt = 'Project by Milan Kumawat'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug).catch(() => null)

  return ogCard({
    eyebrow: 'Project',
    title: project?.title ?? 'Project',
    subtitle: project?.subtitle ?? project?.description,
    footer: project ? project.tags.slice(0, 4).join(' · ') : undefined,
  })
}
