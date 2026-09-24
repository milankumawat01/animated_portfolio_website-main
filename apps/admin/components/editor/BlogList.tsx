'use client'
/* eslint-disable @next/next/no-img-element -- Uploaded covers are displayed in the CMS. */
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { AdminModal } from './AdminModal'
import { BlogEditor } from './BlogEditor'
import { useFeedback } from '@/components/ui/Feedback'
import { errorMessage } from '@/lib/errors'

const filters = ['All', 'Published', 'Draft', 'Scheduled', 'Archived'] as const
const PAGE_SIZE = 10
export function BlogList() {
  const result = useQuery(api.blog.listAll)
  const posts = result ?? []
  const setStatus = useMutation(api.blog.setStatus)
  const remove = useMutation(api.blog.remove)
  const create = useMutation(api.blog.create)
  const { confirm, toast } = useFeedback()
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [sort, setSort] = useState('updated')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Id<'blogPosts'> | 'new' | null>(null)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const categories = ['All categories', ...new Set(posts.map(p => p.category).filter((x): x is string => !!x))]
  const filtered = posts.filter(p => (filter === 'All' || p.status === filter.toLowerCase()) && (category === 'All categories' || p.category === category) && `${p.title} ${p.excerpt} ${p.tags.join(' ')} ${p.category ?? ''}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? a.updatedAt-b.updatedAt : b.updatedAt-a.updatedAt)
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const action = async (run: () => Promise<unknown>, message: string) => { try { setError(''); await run(); toast(message) } catch (err) { setError(errorMessage(err, 'Action failed')) } }
  const duplicate = async (post: typeof posts[number]) => {
    const base = `${post.slug}-copy`
    let slug = base; let suffix = 2
    while (posts.some(x => x.slug === slug)) slug = `${base}-${suffix++}`
    await create({ slug, title: `${post.title} (Copy)`, excerpt: post.excerpt, body: post.body, imageStorageId: post.imageStorageId, imageUrl: post.imageStorageId ? undefined : post.imageUrl, category: post.category, tags: post.tags, readTimeMinutes: post.readTimeMinutes, featured: false, seo: post.seo })
  }
  return <div className="cms-list-page"><header className="cms-page-head"><div><h1>Blog</h1><p>Manage technical articles and writing.</p></div><button onClick={() => setEditing('new')}>+ New Post</button></header>
    <div className="cms-toolbar"><label className="sr-only" htmlFor="blog-search">Search posts</label><input id="blog-search" placeholder="Search posts" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}/><select aria-label="Status" value={filter} onChange={e => { setFilter(e.target.value as typeof filter); setPage(1) }}>{filters.map(x => <option key={x}>{x}</option>)}</select><select aria-label="Category" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>{categories.map(x => <option key={x}>{x}</option>)}</select><select aria-label="Sort posts" value={sort} onChange={e => setSort(e.target.value)}><option value="updated">Recently updated</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select></div>
    {error && <p className="cms-error" role="alert">{error}</p>}
    {result === undefined ? <div className="skeleton" style={{height:350}}/> : rows.length ? <div className="cms-table-wrap"><table><thead><tr>{['Post','Category & tags','Read','Status','Date','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(p=><tr key={p._id}><td><div className="cms-title-cell">{p.imageUrl ? <img src={p.imageUrl} alt=""/> : <span className="cms-no-cover">✎</span>}<span><strong>{p.title}</strong><small>{p.excerpt}</small></span></div></td><td>{p.category ?? 'Uncategorized'}<small className="cms-subline">{p.tags.slice(0,3).join(' · ')}</small></td><td>{p.readTimeMinutes} min</td><td><span className={`status-badge ${p.status}`}>{p.status}</span></td><td>{p.scheduledAt || p.publishedAt ? new Date(p.scheduledAt ?? p.publishedAt!).toLocaleDateString() : '—'}</td><td><div className="cms-row-actions"><button onClick={() => setEditing(p._id)}>Edit</button>{p.status === 'published' ? <a href={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev'}/blog/${p.slug}`} target="_blank" rel="noreferrer">Preview</a> : <button onClick={() => setEditing(p._id)}>Preview</button>}<button onClick={() => void action(() => duplicate(p), 'Draft duplicated')}>Duplicate</button>{p.status === 'draft' && <button onClick={() => void (async()=>{ if(await confirm({title:'Publish post?',description:`Make “${p.title}” visible on the public portfolio.`,confirmLabel:'Publish'})) await action(()=>setStatus({id:p._id,status:'published'}),'Post published') })()}>Publish</button>}<button onClick={() => void (async()=>{ if(p.status==='archived' || await confirm({title:'Archive post?',description:`Hide “${p.title}” from the public portfolio.`,confirmLabel:'Archive'})) await action(()=>setStatus({id:p._id,status:p.status==='archived'?'draft':'archived'}),'Post status updated') })()}>{p.status==='archived'?'Restore':'Archive'}</button><button className="danger-text" onClick={() => void (async()=>{ if(await confirm({title:'Delete post?',description:`Permanently delete “${p.title}”? This cannot be undone.`,confirmLabel:'Delete post',danger:true})) await action(()=>remove({id:p._id}),'Post deleted') })()}>Delete</button></div></td></tr>)}</tbody></table></div> : <div className="cms-empty"><span>✎</span><strong>{posts.length ? 'No matching posts' : 'No blog posts yet'}</strong><p>{posts.length ? 'Try another search or filter.' : 'Write your first article and share what you have learned.'}</p><button onClick={() => setEditing('new')}>+ New Post</button></div>}
    {filtered.length > PAGE_SIZE && <nav aria-label="Blog pages" className="cms-pagination"><button disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length/PAGE_SIZE)}</span><button disabled={page*PAGE_SIZE>=filtered.length} onClick={()=>setPage(page+1)}>Next</button></nav>}
    {editing && <AdminModal title={editing==='new'?'New blog post':'Edit blog post'} onClose={()=>void (async()=>{if(!dirty||await confirm({title:'Discard changes?',description:'Your unsaved blog changes will be lost.',confirmLabel:'Discard changes',danger:true})){setEditing(null);setDirty(false)}})()}><BlogEditor key={editing} post={editing==='new'?undefined:posts.find(p=>p._id===editing)} onDirtyChange={setDirty} onCancel={()=>{setEditing(null);setDirty(false)}} onClose={()=>{setEditing(null);setDirty(false);toast('Post saved')}}/></AdminModal>}
  </div>
}
