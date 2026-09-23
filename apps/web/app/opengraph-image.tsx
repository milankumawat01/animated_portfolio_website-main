import { OG_SIZE, ogCard } from '@/lib/og'

export const alt = 'Milan Kumawat — AI Engineer & Backend Developer'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return ogCard({
    eyebrow: 'Portfolio',
    title: 'AI Engineer & Backend Developer',
    subtitle: 'Building AI-powered products and scalable systems for a better tomorrow.',
  })
}
