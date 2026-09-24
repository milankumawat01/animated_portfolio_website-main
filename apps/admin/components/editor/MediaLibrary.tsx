'use client'
/* eslint-disable @next/next/no-img-element -- Media previews show uploaded files. */
import { useRef, useState } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { AdminModal } from './AdminModal'
import { useFeedback } from '@/components/ui/Feedback'
import { errorMessage } from '@/lib/errors'

type Item = NonNullable<ReturnType<typeof useQuery<typeof api.media.list>>>[number]
const types = ['All','Images','Videos','Documents','Project Media','Blog Media'] as const
const allowed = ['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const PAGE_SIZE = 12
const kind = (type:string) => type.startsWith('image/') ? 'Images' : type.startsWith('video/') ? 'Videos' : 'Documents'
const size = (bytes:number) => `${(bytes/1024/1024).toFixed(1)} MB`

function Preview({ item }: { item: Item }) { if(!item.url) return <p>Preview unavailable.</p>; if(item.contentType.startsWith('image/')) return <img className="media-detail-preview" src={item.url} alt={item.alt}/>; if(item.contentType.startsWith('video/')) return <video className="media-detail-preview" src={item.url} controls/>; if(item.contentType==='application/pdf') return <iframe className="media-detail-preview" src={item.url} title={item.filename}/>; return <p>Download to view this document.</p> }
function MediaDetails({ item, onClose, onReplace }: { item: Item; onClose:()=>void; onReplace:()=>void }) {
  const usageResult = useQuery(api.media.usage,{id:item._id})
  const usage = usageResult ?? []
  const update = useMutation(api.media.updateMetadata)
  const remove = useMutation(api.media.remove)
  const { confirm, toast } = useFeedback()
  const [alt,setAlt] = useState(item.alt)
  const [caption,setCaption] = useState(item.caption ?? '')
  const [collection,setCollection] = useState(item.collection ?? '')
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  const save = async () => { setBusy(true);setError('');try{await update({id:item._id,alt,caption,collection});toast('Media details saved');onClose()}catch(err){setError(errorMessage(err,'Could not save media'))}finally{setBusy(false)} }
  const deleteItem = async () => { if(!await confirm({title:'Delete media?',description:`Permanently delete ${item.filename}?`,confirmLabel:'Delete file',danger:true}))return;setBusy(true);setError('');try{await remove({id:item._id});toast('Media deleted');onClose()}catch(err){setError(errorMessage(err,'Could not delete media'))}finally{setBusy(false)} }
  return <AdminModal title="Media preview" onClose={onClose}><Preview item={item}/><dl className="media-details"><dt>Filename</dt><dd>{item.filename}</dd><dt>Type</dt><dd>{item.contentType}</dd><dt>Size</dt><dd>{size(item.size)}</dd><dt>Dimensions</dt><dd>{item.width&&item.height?`${item.width} × ${item.height}`:'—'}</dd><dt>Uploaded</dt><dd>{new Date(item.uploadedAt).toLocaleString()}</dd><dt>Used in</dt><dd>{usageResult===undefined?'Checking usage…':usage.length?usage.map(x=>`${x.kind}: ${x.title}`).join(', '):'Not used'}</dd></dl><div className="media-metadata"><label>Alt text<input value={alt} onChange={e=>setAlt(e.target.value)}/></label><label>Caption<input value={caption} onChange={e=>setCaption(e.target.value)}/></label><label>Collection<input value={collection} onChange={e=>setCollection(e.target.value)}/></label></div>{error&&<p className="cms-error" role="alert">{error}</p>}<div className="media-detail-actions"><button disabled={busy} onClick={()=>void save()}>Save details</button><button disabled={!item.url} onClick={()=>item.url&&void navigator.clipboard.writeText(item.url).then(()=>toast('URL copied'))}>Copy URL</button><button onClick={onReplace}>Replace</button>{item.url&&<a href={item.url} download={item.filename} target="_blank" rel="noreferrer">Download</a>}<button disabled={busy||usageResult===undefined||usage.length>0} title={usage.length?'Asset is in use':''} onClick={()=>void deleteItem()}>Delete</button></div></AdminModal>
}
export function MediaLibrary() {
  const query = useQuery(api.media.list)
  const items = query ?? []
  const generate = useAction(api.media.generateUploadUrl)
  const create = useMutation(api.media.create)
  const replace = useMutation(api.media.replace)
  const { toast } = useFeedback()
  const input = useRef<HTMLInputElement>(null)
  const [selected,setSelected] = useState<Id<'media'>|null>(null)
  const [uploadOpen,setUploadOpen] = useState(false)
  const [replaceId,setReplaceId] = useState<Id<'media'>|null>(null)
  const [files,setFiles] = useState<File[]>([])
  const [progress,setProgress] = useState(0)
  const [alt,setAlt] = useState('')
  const [caption,setCaption] = useState('')
  const [collection,setCollection] = useState('')
  const [search,setSearch] = useState('')
  const [filter,setFilter] = useState<(typeof types)[number]>('All')
  const [sort,setSort] = useState('newest')
  const [view,setView] = useState<'grid'|'list'>('grid')
  const [page,setPage] = useState(1)
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  const filtered = items.filter(x=>x.filename.toLowerCase().includes(search.toLowerCase())&&(filter==='All'||(filter==='Project Media'?x.usedIn.includes('projects')||x.collection==='projects':filter==='Blog Media'?x.usedIn.includes('blog')||x.collection==='blog':kind(x.contentType)===filter))).sort((a,b)=>sort==='name'?a.filename.localeCompare(b.filename):sort==='oldest'?a.uploadedAt-b.uploadedAt:b.uploadedAt-a.uploadedAt)
  const chosen = items.find(x=>x._id===selected)
  const closeUpload = () => {if(!busy){setUploadOpen(false);setReplaceId(null);setFiles([]);setError('')}}
  const upload = async () => {if(!files.length)return;setBusy(true);setError('');setProgress(0);try{for(let i=0;i<files.length;i++){const file=files[i];if(!allowed.includes(file.type))throw new Error(`${file.name}: unsupported file type`);const replacing=replaceId?items.find(x=>x._id===replaceId):null;if(replacing&&kind(replacing.contentType)!==kind(file.type))throw new Error('Replacement must use the same media type.');if(file.size>(file.type.startsWith('image/')?10:50)*1024*1024)throw new Error(`${file.name}: file too large`);const {uploadUrl,key}=await generate({contentType:file.type});await new Promise<void>((resolve,reject)=>{const xhr=new XMLHttpRequest();xhr.open('PUT',uploadUrl);xhr.setRequestHeader('Content-Type',file.type);xhr.upload.onprogress=e=>{if(e.lengthComputable)setProgress(Math.round(((i+e.loaded/e.total)/files.length)*100))};xhr.onload=()=>xhr.status>=200&&xhr.status<300?resolve():reject(new Error('Storage upload failed'));xhr.onerror=()=>reject(new Error('Storage upload failed'));xhr.send(file)});const dims=file.type.startsWith('image/')?await new Promise<{width:number;height:number}|null>(resolve=>{const image=new Image();const url=URL.createObjectURL(file);image.onload=()=>{resolve({width:image.naturalWidth,height:image.naturalHeight});URL.revokeObjectURL(url)};image.onerror=()=>{resolve(null);URL.revokeObjectURL(url)};image.src=url}):null;if(replaceId)await replace({id:replaceId,r2Key:key,filename:file.name,contentType:file.type,size:file.size,width:dims?.width,height:dims?.height});else await create({r2Key:key,filename:file.name,contentType:file.type,size:file.size,alt:alt||file.name,caption:caption||undefined,collection:collection||undefined,width:dims?.width,height:dims?.height})}setProgress(100);setFiles([]);setUploadOpen(false);setReplaceId(null);toast(replaceId?'Media replaced':'Files uploaded')}catch(err){setError(errorMessage(err,'Upload failed'))}finally{setBusy(false)}}
  return <div className="cms-list-page"><header className="cms-page-head"><div><h1>Media Library</h1><p>Manage images, videos, documents and portfolio assets.</p></div><button onClick={()=>setUploadOpen(true)}>Upload Files</button></header><div className="media-filters">{types.map(x=><button className={filter===x?'active':''} key={x} onClick={()=>{setFilter(x);setPage(1)}}>{x}</button>)}</div><div className="cms-toolbar"><input aria-label="Search media" placeholder="Search files" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/><select aria-label="Sort media" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Filename A–Z</option></select><select aria-label="Media view" value={view} onChange={e=>setView(e.target.value as 'grid'|'list')}><option value="grid">Grid view</option><option value="list">List view</option></select></div>
    {query===undefined?<div className="skeleton" style={{height:300}}/>:filtered.length?<div className={view==='grid'?'media-grid':'media-list'}>{filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(item=><button className="media-tile" key={item._id} onClick={()=>setSelected(item._id)}><span className="media-tile-preview">{item.contentType.startsWith('image/')&&item.url?<img src={item.url} alt={item.alt}/>:<span>{kind(item.contentType)}</span>}</span><span className="media-tile-meta"><strong>{item.filename}</strong><small>{kind(item.contentType)} · {size(item.size)} · {item.width&&item.height?`${item.width} × ${item.height}`:'—'}</small><small>{new Date(item.uploadedAt).toLocaleDateString()}</small></span></button>)}</div>:<div className="cms-empty"><span>▧</span><strong>{items.length?'No matching files':'No media uploaded'}</strong><p>{items.length?'Try another search or file type.':'Upload an asset to use it across your portfolio.'}</p><button onClick={()=>setUploadOpen(true)}>Upload Files</button></div>}
    {filtered.length>PAGE_SIZE&&<nav className="cms-pagination" aria-label="Media pages"><button disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length/PAGE_SIZE)}</span><button disabled={page*PAGE_SIZE>=filtered.length} onClick={()=>setPage(page+1)}>Next</button></nav>}
    {chosen&&<MediaDetails item={chosen} onClose={()=>setSelected(null)} onReplace={()=>{setSelected(null);setReplaceId(chosen._id);setUploadOpen(true)}}/>}
    {uploadOpen&&<AdminModal title={replaceId?'Replace asset':'Upload media'} onClose={closeUpload}><div className="media-dropzone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();setFiles(Array.from(e.dataTransfer.files).slice(0,replaceId?1:undefined))}}>Drop files here or <button onClick={()=>input.current?.click()}>browse files</button><input ref={input} type="file" multiple={!replaceId} accept={allowed.join(',')} hidden onChange={e=>setFiles(Array.from(e.target.files??[]))}/></div><p className="media-upload-hint">{files.map(x=>x.name).join(', ')||'Images up to 10 MB; videos and documents up to 50 MB.'}</p>{!replaceId&&<div className="media-metadata"><label>Alt text<input value={alt} onChange={e=>setAlt(e.target.value)}/></label><label>Caption<input value={caption} onChange={e=>setCaption(e.target.value)}/></label><label>Collection<select value={collection} onChange={e=>setCollection(e.target.value)}><option value="">Unsorted</option><option value="projects">Projects</option><option value="blog">Blog</option></select></label></div>}{busy&&<progress max={100} value={progress} style={{width:'100%'}}/>}{error&&<p className="cms-error" role="alert">{error}</p>}<div className="media-detail-actions"><button onClick={closeUpload} disabled={busy}>Cancel</button><button disabled={!files.length||busy} onClick={()=>void upload()}>{busy?'Uploading…':replaceId?'Replace file':'Upload files'}</button></div></AdminModal>}
  </div>
}
