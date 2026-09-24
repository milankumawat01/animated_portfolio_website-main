'use client'
/* eslint-disable @next/next/no-img-element -- CMS covers use uploaded asset URLs. */
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { AdminModal } from '@/components/editor/AdminModal'
import { ProjectEditor } from './ProjectEditor'
import { useFeedback } from '@/components/ui/Feedback'
import { errorMessage } from '@/lib/errors'

const PAGE_SIZE = 9
export function ProjectsList() {
  const result = useQuery(api.projects.listAll)
  const projects = result ?? []
  const setStatus = useMutation(api.projects.setStatus)
  const duplicate = useMutation(api.projects.duplicate)
  const remove = useMutation(api.projects.remove)
  const { confirm, toast } = useFeedback()
  const [status, setFilter] = useState('all')
  const [featured, setFeatured] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('updated')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Id<'projects'> | 'new' | null>(null)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const filtered = projects.filter(p => (status==='all'||p.status===status) && (featured==='all'||p.featured===(featured==='featured')) && `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='title'?a.title.localeCompare(b.title):sort==='oldest'?a.updatedAt-b.updatedAt:b.updatedAt-a.updatedAt)
  const rows = filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)
  const action = async (run:()=>Promise<unknown>, message:string) => { try { setError(''); await run(); toast(message) } catch(err) { setError(errorMessage(err,'Action failed')) } }
  return <div className="cms-list-page"><header className="cms-page-head"><div><h1>Projects</h1><p>Manage projects and showcase work.</p></div><button onClick={()=>setEditing('new')}>+ New Project</button></header>
    <div className="cms-toolbar"><input aria-label="Search projects" placeholder="Search projects" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/><select aria-label="Status" value={status} onChange={e=>{setFilter(e.target.value);setPage(1)}}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select><select aria-label="Featured" value={featured} onChange={e=>{setFeatured(e.target.value);setPage(1)}}><option value="all">All projects</option><option value="featured">Featured</option><option value="standard">Not featured</option></select><select aria-label="Sort projects" value={sort} onChange={e=>setSort(e.target.value)}><option value="updated">Recently updated</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select></div>
    {error && <p role="alert" className="cms-error">{error}</p>}
    {result===undefined ? <div className="skeleton" style={{height:300}}/> : rows.length ? <div className="project-grid">{rows.map(p=><article className="project-card" key={p._id}><div className="project-cover">{p.imageUrl ? <img src={p.imageUrl} alt=""/> : <span>No cover image</span>}<span className={`status-badge ${p.status}`}>{p.status}</span></div><div className="project-card-body"><div className="project-card-title"><h2>{p.title}</h2>{p.featured && <span title="Featured project">★ Featured</span>}</div><p>{p.description || p.subtitle || 'No description yet.'}</p><div className="project-tags">{p.tags.slice(0,4).map(tag=><span key={tag}>{tag}</span>)}</div><div className="project-card-foot"><small>Updated {new Date(p.updatedAt).toLocaleDateString()}</small><div><button onClick={()=>setEditing(p._id)}>Edit</button>{p.status==='published' ? <a href={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev'}/projects/${p.slug}`} target="_blank" rel="noreferrer">Preview</a> : <button onClick={()=>setEditing(p._id)}>Preview</button>}<details><summary aria-label={`More actions for ${p.title}`}>•••</summary><div className="project-menu"><button onClick={()=>void action(()=>duplicate({id:p._id}),'Project duplicated')}>Duplicate</button><button onClick={()=>void (async()=>{if(await confirm({title:p.status==='published'?'Unpublish project?':'Publish project?',description:`Change the visibility of “${p.title}” on your portfolio.`,confirmLabel:p.status==='published'?'Unpublish':'Publish'})) await action(()=>setStatus({id:p._id,status:p.status==='published'?'draft':'published'}),'Project status updated')})()}>{p.status==='published'?'Unpublish':'Publish'}</button><button onClick={()=>void (async()=>{if(p.status==='archived'||await confirm({title:'Archive project?',description:`Hide “${p.title}” from the public portfolio.`,confirmLabel:'Archive'})) await action(()=>setStatus({id:p._id,status:p.status==='archived'?'draft':'archived'}),'Project status updated')})()}>{p.status==='archived'?'Restore':'Archive'}</button><button className="danger-text" onClick={()=>void (async()=>{if(await confirm({title:'Delete project?',description:`Permanently delete “${p.title}”? This cannot be undone.`,confirmLabel:'Delete project',danger:true})) await action(()=>remove({id:p._id}),'Project deleted')})()}>Delete</button></div></details></div></div></div></article>)}</div> : <div className="cms-empty"><span>▣</span><strong>{projects.length ? 'No matching projects' : 'No projects yet'}</strong><p>{projects.length ? 'Try another search or filter.' : 'Add your first project to showcase your work.'}</p><button onClick={()=>setEditing('new')}>+ New Project</button></div>}
    {filtered.length>PAGE_SIZE && <nav className="cms-pagination" aria-label="Project pages"><button disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length/PAGE_SIZE)}</span><button disabled={page*PAGE_SIZE>=filtered.length} onClick={()=>setPage(page+1)}>Next</button></nav>}
    {editing && <AdminModal title={editing==='new'?'New project':'Edit project'} onClose={()=>void (async()=>{if(!dirty||await confirm({title:'Discard changes?',description:'Your unsaved project changes will be lost.',confirmLabel:'Discard changes',danger:true})){setEditing(null);setDirty(false)}})()}><ProjectEditor key={editing} project={editing==='new'?undefined:projects.find(p=>p._id===editing)} onDirtyChange={setDirty} onCancel={()=>void (async()=>{if(!dirty||await confirm({title:'Discard changes?',description:'Your unsaved project changes will be lost.',confirmLabel:'Discard changes',danger:true})){setEditing(null);setDirty(false)}})()} onClose={()=>{setEditing(null);setDirty(false);toast('Project saved')}}/></AdminModal>}
  </div>
}
