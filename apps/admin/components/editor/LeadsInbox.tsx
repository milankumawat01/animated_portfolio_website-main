'use client'
import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { AdminModal } from './AdminModal'
import { useFeedback } from '@/components/ui/Feedback'
import { errorMessage } from '@/lib/errors'

type LeadStatus = 'new'|'contacted'|'in_discussion'|'converted'|'closed'
const statuses: { value:LeadStatus; label:string }[] = [{value:'new',label:'New'},{value:'contacted',label:'Contacted'},{value:'in_discussion',label:'In Discussion'},{value:'converted',label:'Converted'},{value:'closed',label:'Closed'}]
const normalized = (status:string):LeadStatus => status==='replied'?'contacted':status==='archived'?'closed':status==='read'?'new':status as LeadStatus
const pageSize = 12
type Fields = { name:string; email:string; subject:string; phone:string; company:string; message:string }

function LeadForm({ initial, id, onClose }: { initial?:Fields; id?:Id<'leads'>; onClose:()=>void }) {
  const create = useMutation(api.leads.createAdmin)
  const update = useMutation(api.leads.updateAdmin)
  const { toast, confirm } = useFeedback()
  const [fields,setFields] = useState<Fields>(initial??{name:'',email:'',subject:'',phone:'',company:'',message:''})
  const [initialValue] = useState(() => JSON.stringify(initial??{name:'',email:'',subject:'',phone:'',company:'',message:''}))
  const dirty = JSON.stringify(fields)!==initialValue
  const cancel = async () => { if(!dirty||await confirm({title:'Discard lead changes?',description:'Your unsaved lead changes will be lost.',confirmLabel:'Discard changes',danger:true}))onClose() }
  const [saving,setSaving] = useState(false)
  const [error,setError] = useState('')
  const save = async (event:FormEvent) => {event.preventDefault();setSaving(true);setError('');try{const payload={...fields,subject:fields.subject||undefined,phone:fields.phone||undefined,company:fields.company||undefined};if(id)await update({id,...payload});else await create(payload);toast(id?'Lead updated':'Lead created');onClose()}catch(err){setError(errorMessage(err,'Could not save lead'))}finally{setSaving(false)}}
  return <AdminModal title={id?'Edit lead':'Add lead'} onClose={()=>void cancel()}><form className="lead-form" onSubmit={e=>void save(e)}><div className="lead-form-grid">{([['name','Name *','text'],['email','Email *','email'],['subject','Subject','text'],['phone','Phone','tel'],['company','Company','text']] as const).map(([key,label,type])=><label key={key}>{label}<input type={type} value={fields[key]} required={key==='name'||key==='email'} onChange={e=>setFields({...fields,[key]:e.target.value})}/></label>)}</div><label>Message *<textarea rows={5} minLength={10} required value={fields.message} onChange={e=>setFields({...fields,message:e.target.value})}/></label>{error&&<p className="cms-error" role="alert">{error}</p>}<div className="lead-form-actions"><button type="button" onClick={()=>void cancel()}>Cancel</button><button type="submit" disabled={saving}>{saving?'Saving…':id?'Save changes':'Add lead'}</button></div></form></AdminModal>
}

export function LeadDetailsModal({ id, onClose }: { id:Id<'leads'>; onClose:()=>void }) {
  const lead = useQuery(api.leads.get,{id})
  const events = useQuery(api.leads.events,{id}) ?? []
  const setStatus = useMutation(api.leads.setStatus)
  const addNote = useMutation(api.leads.addNote)
  const remove = useMutation(api.leads.remove)
  const { confirm,toast } = useFeedback()
  const [note,setNote] = useState('')
  const [editing,setEditing] = useState(false)
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  if(lead===undefined)return <AdminModal title="Lead details" onClose={onClose}><div className="skeleton" style={{height:260}}/></AdminModal>
  if(lead===null)return <AdminModal title="Lead details" onClose={onClose}><p>Lead not found.</p></AdminModal>
  const activity = events.length?events:[...(lead.notes?[{_id:'legacy-note',kind:'note' as const,text:lead.notes,author:'Imported',createdAt:lead.createdAt}]:[]),{_id:'legacy-created',kind:'created' as const,text:'Lead received',author:'Website',createdAt:lead.createdAt}]
  const act = async (run:()=>Promise<unknown>,message:string) => {setBusy(true);setError('');try{await run();toast(message)}catch(err){setError(errorMessage(err,'Action failed'))}finally{setBusy(false)}}
  return <AdminModal title={`Lead · ${lead.name}`} onClose={onClose}><div className="lead-detail-actions"><a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.subject??'Your enquiry'}`)}`}>Email {lead.email}</a>{lead.phone&&<a href={`tel:${lead.phone}`}>Call {lead.phone}</a>}<button onClick={()=>setEditing(true)}>Edit contact</button><button onClick={()=>void (async()=>{if(await confirm({title:'Archive lead?',description:`Move ${lead.name} out of active opportunities?`,confirmLabel:'Archive'}))await act(()=>setStatus({id,status:'archived'}),'Lead archived')})()}>Archive</button></div><div className="lead-detail-grid"><section><h3>Contact</h3><dl className="lead-contact"><dt>Name</dt><dd>{lead.name}</dd><dt>Email</dt><dd>{lead.email}</dd><dt>Phone</dt><dd>{lead.phone??'—'}</dd><dt>Company</dt><dd>{lead.company??'—'}</dd><dt>Subject</dt><dd>{lead.subject??'—'}</dd><dt>Source</dt><dd>{lead.source.replace('-',' ')}</dd><dt>Created</dt><dd>{new Date(lead.createdAt).toLocaleString()}</dd><dt>Last contact</dt><dd>{lead.lastContactAt?new Date(lead.lastContactAt).toLocaleString():'—'}</dd></dl><h3>Message</h3><p className="lead-message">{lead.message}</p><label className="lead-status-label">Status<select value={normalized(lead.status)} disabled={busy} onChange={e=>void (async()=>{const next=e.target.value as LeadStatus;if(await confirm({title:'Change lead status?',description:`Move ${lead.name} to ${next.replace('_',' ')}?`,confirmLabel:'Change status'}))await act(()=>setStatus({id,status:next}),'Lead status updated')})()}>{statuses.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label></section><section><h3>Notes</h3>{activity.filter(x=>x.kind==='note'&&x.text!=='Contact details updated').map(x=><div className="lead-note" key={x._id}><p>{x.text}</p><small>{x.author} · {new Date(x.createdAt).toLocaleString()}</small></div>)}<label className="lead-note-input">New note<textarea rows={3} value={note} onChange={e=>setNote(e.target.value)}/></label><button disabled={!note.trim()||busy} onClick={()=>void act(async()=>{await addNote({id,text:note});setNote('')},'Note added')}>Add note</button><h3>Activity</h3><ol className="lead-timeline">{activity.map(x=><li key={x._id}><strong>{x.kind==='note'&&x.text!=='Contact details updated'?'Note added':x.text}</strong><small>{new Date(x.createdAt).toLocaleString()} · {x.author}</small></li>)}</ol></section></div>{error&&<p className="cms-error" role="alert">{error}</p>}<button className="lead-delete" disabled={busy} onClick={()=>void (async()=>{if(await confirm({title:'Delete lead?',description:`Permanently delete ${lead.name}'s enquiry and activity?`,confirmLabel:'Delete lead',danger:true}))await act(async()=>{await remove({id});onClose()},'Lead deleted')})()}>Delete lead</button>{editing&&<LeadForm id={id} initial={{name:lead.name,email:lead.email,subject:lead.subject??'',phone:lead.phone??'',company:lead.company??'',message:lead.message}} onClose={()=>setEditing(false)}/>}</AdminModal>
}

export function LeadsList() {
  const result = useQuery(api.leads.list,{})
  const leads = result??[]
  const migrateLegacy = useMutation(api.leads.migrateLegacy)
  useEffect(()=>{if(localStorage.getItem('milan-lead-migration-v1'))return;void migrateLegacy({}).then(()=>localStorage.setItem('milan-lead-migration-v1','done')).catch(()=>{})},[migrateLegacy])
  const [selected,setSelected] = useState<Id<'leads'>|null>(null)
  const [creating,setCreating] = useState(false)
  const [search,setSearch] = useState('')
  const [filter,setFilter] = useState<LeadStatus|'all'>('all')
  const [source,setSource] = useState('all')
  const [sort,setSort] = useState('newest')
  const [fromDate,setFromDate] = useState('')
  const [page,setPage] = useState(1)
  const filtered = leads.filter(x=>(filter==='all'||normalized(x.status)===filter)&&(source==='all'||x.source===source)&&(!fromDate||x.createdAt>=new Date(`${fromDate}T00:00:00`).getTime())&&`${x.name} ${x.email} ${x.subject??''} ${x.company??''} ${x.message}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='oldest'?a.createdAt-b.createdAt:sort==='name'?a.name.localeCompare(b.name):b.createdAt-a.createdAt)
  return <div className="cms-list-page"><header className="cms-page-head"><div><h1>Leads</h1><p>Manage portfolio inquiries and opportunities.</p></div><button onClick={()=>setCreating(true)}>+ Add Lead</button></header><div className="lead-stats">{statuses.map(x=><button className={filter===x.value?'active':''} key={x.value} onClick={()=>{setFilter(filter===x.value?'all':x.value);setPage(1)}}><strong>{leads.filter(l=>normalized(l.status)===x.value).length}</strong><span>{x.label}</span></button>)}</div><div className="cms-toolbar"><input aria-label="Search leads" placeholder="Search name, email or subject" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/><select aria-label="Status" value={filter} onChange={e=>{setFilter(e.target.value as LeadStatus|'all');setPage(1)}}><option value="all">All statuses</option>{statuses.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select><select aria-label="Source" value={source} onChange={e=>{setSource(e.target.value);setPage(1)}}><option value="all">All sources</option><option value="contact-modal">Contact modal</option><option value="contact-page">Contact page</option><option value="admin">Added in admin</option></select><label className="cms-date-filter">From <input aria-label="Created from" type="date" value={fromDate} onChange={e=>{setFromDate(e.target.value);setPage(1)}}/></label><select aria-label="Sort leads" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option></select></div>
    {result===undefined?<div className="skeleton" style={{height:320}}/>:filtered.length?<div className="cms-table-wrap"><table><thead><tr>{['Name','Email','Subject','Source','Status','Created','Last contact','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.slice((page-1)*pageSize,page*pageSize).map(l=><tr key={l._id}><td><strong>{l.name}</strong></td><td>{l.email}</td><td>{l.subject??'—'}</td><td>{l.source.replace('-',' ')}</td><td><span className={`status-badge ${normalized(l.status)}`}>{normalized(l.status).replace('_',' ')}</span></td><td>{new Date(l.createdAt).toLocaleDateString()}</td><td>{l.lastContactAt?new Date(l.lastContactAt).toLocaleDateString():'—'}</td><td><button onClick={()=>setSelected(l._id)}>Open</button></td></tr>)}</tbody></table></div>:<div className="cms-empty"><span>◉</span><strong>{leads.length?'No matching leads':'No leads yet'}</strong><p>{leads.length?'Try another search or filter.':'Contact form submissions and manual opportunities appear here.'}</p><button onClick={()=>setCreating(true)}>+ Add Lead</button></div>}
    {filtered.length>pageSize&&<nav className="cms-pagination" aria-label="Lead pages"><button disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length/pageSize)}</span><button disabled={page*pageSize>=filtered.length} onClick={()=>setPage(page+1)}>Next</button></nav>}{selected&&<LeadDetailsModal id={selected} onClose={()=>setSelected(null)}/>} {creating&&<LeadForm onClose={()=>setCreating(false)}/>}</div>
}
export function LeadDetail({id}:{id:Id<'leads'>}){const router=useRouter();return <LeadDetailsModal id={id} onClose={()=>router.push('/dashboard/leads')}/>}
