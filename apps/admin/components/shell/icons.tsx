export type IconName = 'dashboard' | 'projects' | 'blog' | 'experience' | 'skills' | 'media' | 'leads' | 'settings' | 'logout' | 'search' | 'menu' | 'chevron' | 'calendar' | 'plus' | 'bell' | 'close'
const paths: Record<IconName, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  projects: <><path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7V5a2 2 0 0 1 2-2h5"/></>,
  blog: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
  experience: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18M10 12v3h4v-3"/></>,
  skills: <><path d="M12 2 9 8l-6 1 4 5-1 7 6-3 6 3-1-7 4-5-6-1z"/></>,
  media: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m4 18 5-5 3 3 4-5 4 5"/></>,
  leads: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 8h5M18.5 5.5v5M16 18h5"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M20 12a8 8 0 0 0-.2-1.7l1.3-1.5-2-3.4-1.9.5a8 8 0 0 0-2.9-1.7L14 2h-4l-.3 2.2a8 8 0 0 0-2.9 1.7l-1.9-.5-2 3.4 1.3 1.5a8 8 0 0 0 0 3.4l-1.3 1.5 2 3.4 1.9-.5a8 8 0 0 0 2.9 1.7L10 22h4l.3-2.2a8 8 0 0 0 2.9-1.7l1.9.5 2-3.4-1.3-1.5A8 8 0 0 0 20 12z"/></>,
  logout: <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 7l5 5-5 5M19 12H9"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  close: <path d="M5 5l14 14M19 5 5 19"/>,
}
export function Icon({ name, size = 19 }: { name: IconName; size?: number }) { return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg> }
