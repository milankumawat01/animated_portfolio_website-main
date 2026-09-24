'use client'
/* eslint-disable @next/next/no-img-element -- Admin thumbnails use uploaded media URLs. */
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import { Icon, type IconName } from '@/components/shell/icons'

const format = (time: number) => new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
function Panel({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) { return <section className="dash-panel"><div className="dash-panel-head"><h2>{title}</h2>{href && <Link href={href}>View all →</Link>}</div>{children}</section> }
function Empty({ icon, title, detail, href, action }: { icon: IconName; title: string; detail: string; href?: string; action?: string }) { return <div className="dash-empty"><span className="dash-empty-icon"><Icon name={icon} size={30} /></span><strong>{title}</strong><p>{detail}</p>{href && <Link href={href}><Icon name="plus" size={14}/>{action}</Link>}</div> }
export default function DashboardPage() {
  const projects = useQuery(api.projects.listAll)
  const posts = useQuery(api.blog.listAll)
  const experience = useQuery(api.experience.listAll)
  const leads = useQuery(api.leads.list, {})
  const events = useQuery(api.leads.recentEvents)
  const media = useQuery(api.media.list)
  const loading = !projects || !posts || !experience || !leads || !events || !media
  const counts = [
    { label: 'Total Projects', value: projects?.length ?? 0, icon: 'projects' as const, color: 'blue', href: '/dashboard/projects', meta: 'Projects in your portfolio' },
    { label: 'Published Posts', value: posts?.filter(p => p.status === 'published').length ?? 0, icon: 'blog' as const, color: 'purple', href: '/dashboard/blog', meta: 'Articles live on site' },
    { label: 'Experiences', value: experience?.length ?? 0, icon: 'experience' as const, color: 'orange', href: '/dashboard/experience', meta: 'Career entries' },
    { label: 'Total Leads', value: leads?.length ?? 0, icon: 'leads' as const, color: 'blue', href: '/dashboard/leads', meta: 'Portfolio enquiries' },
  ]
  const activity = [
    ...(projects ?? []).map(p => ({ id: p._id, title: `Updated project “${p.title}”`, detail: p.status, at: p.updatedAt, icon: 'projects' as const })),
    ...(posts ?? []).map(p => ({ id: p._id, title: `${p.status === 'published' ? 'Published' : 'Updated'} “${p.title}”`, detail: 'Blog post', at: p.updatedAt, icon: 'blog' as const })),
    ...(leads ?? []).map(l => ({ id: l._id, title: `New lead from ${l.name}`, detail: l.subject ?? 'Portfolio enquiry', at: l.createdAt, icon: 'leads' as const })),
    ...(media ?? []).map(m => ({ id: m._id, title: `Uploaded ${m.filename}`, detail: 'Media library', at: m.uploadedAt, icon: 'media' as const })),
    ...(events ?? []).filter(e => e.kind !== 'created').map(e => ({ id: e._id, title: e.text, detail: `Lead ${e.kind}`, at: e.createdAt, icon: 'leads' as const })),
  ].sort((a,b) => b.at-a.at).slice(0,5)
  return <div className="dashboard-page">
    <div className="dashboard-heading"><div><h1>Dashboard <span aria-hidden="true" style={{fontSize:27}}>👋</span></h1><p>Quick overview of your portfolio and recent activity.</p></div><div className="date-card"><span className="date-icon"><Icon name="calendar" /></span><span><strong>{new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata' })}</strong><small>Keep building 🚀</small></span></div></div>
    <div className="stats-grid">{counts.map(item => <Link className="stat-card" href={item.href} key={item.label}><span className={`stat-icon ${item.color}`}><Icon name={item.icon} size={25}/></span><span className="stat-body"><span className="stat-label">{item.label}</span>{loading ? <span className="skeleton" style={{display:'block',width:55,height:28,margin:'8px 0'}}/> : <strong className="stat-value">{item.value}</strong>}<span className="stat-meta">{item.value ? item.meta : 'No entries yet'}</span></span><span className="stat-chevron"><Icon name="chevron" size={15}/></span></Link>)}</div>
    <div className="dashboard-pair">
      <Panel title="Recent Projects" href="/dashboard/projects">{loading ? <div className="skeleton" style={{height:200,marginTop:14}}/> : projects.length ? [...projects].sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,4).map(p => <Link className="dash-row" href={`/dashboard/projects/${p._id}`} key={p._id}>{p.imageUrl ? <img className="dash-thumb" src={p.imageUrl} alt=""/> : <span className="dash-thumb"/>}<span className="dash-row-main"><strong>{p.title}</strong><small>{p.description || p.subtitle}</small></span><span className={`status-badge ${p.status}`}>{p.status}</span><time>{format(p.updatedAt)}</time></Link>) : <Empty icon="projects" title="No projects yet" detail="Add your first project to showcase your work." href="/dashboard/projects/new" action="New Project"/>}</Panel>
      <Panel title="Recent Blog Posts" href="/dashboard/blog">{loading ? <div className="skeleton" style={{height:200,marginTop:14}}/> : posts.length ? [...posts].sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,4).map(p => <Link className="dash-row" href={`/dashboard/blog/${p._id}`} key={p._id}>{p.imageUrl ? <img className="dash-thumb" src={p.imageUrl} alt=""/> : <span className="dash-thumb"/>}<span className="dash-row-main"><strong>{p.title}</strong><small>{p.excerpt}</small></span><span className={`status-badge ${p.status}`}>{p.status}</span><time>{format(p.updatedAt)}</time></Link>) : <Empty icon="blog" title="No blog posts yet" detail="Share a tutorial, build note, or lesson learned." href="/dashboard/blog/new" action="New Blog Post"/>}</Panel>
    </div>
    <div className="dashboard-bottom">
      <Panel title="Recent Leads" href="/dashboard/leads">{loading ? <div className="skeleton" style={{height:180,marginTop:14}}/> : leads.length ? leads.slice(0,4).map(l => <Link className="dash-row" href={`/dashboard/leads/${l._id}`} key={l._id}><span className="lead-avatar">{l.name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</span><span className="dash-row-main"><strong>{l.name}</strong><small>{l.subject || 'Portfolio enquiry'}</small></span><span className={`status-badge ${l.status}`}>{l.status.replace('_',' ')}</span></Link>) : <Empty icon="leads" title="No leads yet" detail="Contact form submissions will appear here." href="/dashboard/leads" action="View Leads"/>}</Panel>
      <Panel title="Quick Actions"><div className="quick-grid">{[{label:'New Project',sub:'Showcase your work',href:'/dashboard/projects/new',icon:'projects' as const},{label:'New Blog Post',sub:'Share your thoughts',href:'/dashboard/blog/new',icon:'blog' as const},{label:'Add Experience',sub:'Update your journey',href:'/dashboard/experience?new=1',icon:'experience' as const},{label:'Manage Skills',sub:'Edit your expertise',href:'/dashboard/skills',icon:'skills' as const}].map(x=><Link className="quick-link" href={x.href} key={x.href}><span><Icon name={x.icon} size={22}/><br/>{x.label}<small>{x.sub}</small></span></Link>)}</div></Panel>
      <Panel title="Recent Activity">{loading ? <div className="skeleton" style={{height:180,marginTop:14}}/> : activity.length ? activity.map(a=><div className="activity-row" key={a.id}><span className="activity-dot"><Icon name={a.icon} size={15}/></span><div><strong>{a.title}</strong><small>{a.detail}</small></div><time>{format(a.at)}</time></div>) : <Empty icon="calendar" title="No recent activity" detail="Your latest updates and enquiries will appear here."/>}</Panel>
    </div>
  </div>
}
