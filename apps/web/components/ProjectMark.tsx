import { Bot, Building2, Car, ClipboardCheck, ClipboardList, Code2, Compass, FileSearch, Flame, Leaf, Mail, MapPinned, MessagesSquare, Music2, Newspaper, ReceiptText, Send, ShieldCheck, ShoppingBag, Sprout, Stethoscope, Sun, Tv, UsersRound, UtensilsCrossed, Wallet, MonitorPlay, Wrench } from 'lucide-react'

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
    adiveda: { icon: Sun, color: '#f0883e' },
    'yolo-trips': { icon: Compass, color: '#58c1e9' },
    'sanatan-vishwa': { icon: Flame, color: '#fb9943' },
    'internal-tools': { icon: UsersRound, color: '#4d9dff' },
    infumarket: { icon: MonitorPlay, color: '#ff4d5e' },
    zeni: { icon: Wallet, color: '#5b6cff' },
    agrivia: { icon: Sprout, color: '#2fb26b' },
    'the-soul-root': { icon: MapPinned, color: '#c9a46a' },
    'sj-visitor': { icon: ShieldCheck, color: '#3f8cff' },
    'amity-compliance': { icon: ClipboardCheck, color: '#f2b233' },
    'yamato-docs': { icon: FileSearch, color: '#e2524a' },
    hisaab: { icon: ReceiptText, color: '#2f7cf6' },
    'bhoomi-rakshak': { icon: Stethoscope, color: '#21b5a6' },
    kairos: { icon: Newspaper, color: '#9b7bff' },
    'shiv-hotel': { icon: UtensilsCrossed, color: '#f2b84b' },
    'khatu-cab-service': { icon: Car, color: '#f08a2c' },
    'rajasthan-tours': { icon: Compass, color: '#e0a03a' },
    tooljar: { icon: Wrench, color: '#ff7a45' },
    dekko: { icon: Tv, color: '#e6556f' },
    'starting-core-mailer': { icon: Mail, color: '#4aa3ff' },
    'sc-media-discord': { icon: MessagesSquare, color: '#7c83ff' },
  }
  const { icon: Icon, color } = marks[slug] ?? { icon: Code2, color: '#699eff' }
  return <span aria-hidden="true" className={`project-mark ${className}`} style={{ color }}><Icon strokeWidth={1.6} /></span>
}
