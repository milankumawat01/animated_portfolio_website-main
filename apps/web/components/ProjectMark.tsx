import { Bot, Building2, ClipboardList, Code2, Compass, Flame, Leaf, Music2, Send, ShoppingBag, UsersRound, UtensilsCrossed } from 'lucide-react'

export function ProjectMark({ slug, className = '' }: { slug: string; className?: string }) {
  const marks: Record<string, { icon: typeof Send; color: string }> = {
    salezo: { icon: Send, color: '#00d7a7' },
    hiro: { icon: Bot, color: '#338bff' },
    'employee-portal': { icon: UsersRound, color: '#bf64f5' },
    'kontent-ops': { icon: ClipboardList, color: '#a172ff' },
    aspire: { icon: Building2, color: '#d2b384' },
    'raas-rang': { icon: Music2, color: '#43d7ba' },
    'minaxi-marketing': { icon: ShoppingBag, color: '#e4bd42' },
    'aep-engineering': { icon: Leaf, color: '#43c5aa' },
    daamji: { icon: ShoppingBag, color: '#f2a542' },
    'banarsi-cafe': { icon: UtensilsCrossed, color: '#f5c247' },
    'yolo-trips': { icon: Compass, color: '#58c1e9' },
    'sanatan-vishwa': { icon: Flame, color: '#fb9943' },
    'internal-tools': { icon: UsersRound, color: '#4d9dff' },
  }
  const { icon: Icon, color } = marks[slug] ?? { icon: Code2, color: '#699eff' }
  return <span aria-hidden="true" className={`project-mark ${className}`} style={{ color }}><Icon strokeWidth={1.6} /></span>
}
