'use client'
/* eslint-disable @next/next/no-img-element -- Media management previews original uploaded files. */
import { useRef, useState } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { AdminModal } from './AdminModal'
import { errorMessage } from '@/lib/errors'

type Item = NonNullable<ReturnType<typeof useQuery<typeof api.media.list>>>[number]
const types = ['All', 'Images', 'Videos', 'Documents', 'Project Media', 'Blog Media'] as const
const PAGE_SIZE = 12
const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const fileKind = (type: string) => type.startsWith('image/') ? 'Images' : type.startsWith('video/') ? 'Videos' : 'Documents'
const sizeText = (size: number) => `${(size / 1024 / 1024).toFixed(1)} MB`

function AssetPreview({ item }: { item: Item }) {
  if (!item.url) return <p>Preview unavailable.</p>
  if (item.contentType.startsWith('image/')) return <img src={item.url} alt={item.alt} style={{ width: '100%', maxHeight: 450, objectFit: 'contain' }} />
  if (item.contentType.startsWith('video/')) return <video src={item.url} controls style={{ width: '100%', maxHeight: 450 }} />
  if (item.contentType === 'application/pdf') return <iframe src={item.url} title={item.filename} style={{ width: '100%', height: 420, border: 0 }} />
  return <p>Download to view this document.</p>
}

function MediaDetails({ item, onClose, onReplace }: { item: Item; onClose: () => void; onReplace: () => void }) {
  const usage = useQuery(api.media.usage, { id: item._id }) ?? []
  const update = useMutation(api.media.updateMetadata)
  const remove = useMutation(api.media.remove)
  const [alt, setAlt] = useState(item.alt)
  const [caption, setCaption] = useState(item.caption ?? '')
  const [collection, setCollection] = useState(item.collection ?? '')
  const [error, setError] = useState('')
  const act = async (run: () => Promise<unknown>) => { try { setError(''); await run() } catch (err) { setError(errorMessage(err, 'Action failed')) } }
  return <AdminModal title="Media preview" onClose={onClose}><AssetPreview item={item} />
    <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}><dt>Filename</dt><dd>{item.filename}</dd><dt>Type</dt><dd>{item.contentType}</dd><dt>Size</dt><dd>{sizeText(item.size)}</dd><dt>Dimensions</dt><dd>{item.width && item.height ? `${item.width} × ${item.height}` : '—'}</dd><dt>Uploaded</dt><dd>{new Date(item.uploadedAt).toLocaleString()}</dd><dt>Used in</dt><dd>{usage.length ? usage.map(u => `${u.kind}: ${u.title}`).join(', ') : 'Not used'}</dd></dl>
    <div style={{ display: 'grid', gap: 9 }}><label>Alt text<input value={alt} onChange={e => setAlt(e.target.value)} style={{ width: '100%' }} /></label><label>Caption<input value={caption} onChange={e => setCaption(e.target.value)} style={{ width: '100%' }} /></label><label>Folder / collection<input value={collection} onChange={e => setCollection(e.target.value)} style={{ width: '100%' }} /></label></div>
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}><button onClick={() => void act(async () => { await update({ id: item._id, alt, caption, collection }); onClose() })}>Save details</button><button disabled={!item.url} onClick={() => item.url && void navigator.clipboard.writeText(item.url)}>Copy URL</button><button onClick={onReplace}>Replace</button>{item.url && <a href={item.url} download={item.filename} target="_blank" rel="noreferrer">Download</a>}<button disabled={usage.length > 0} title={usage.length ? 'Asset is in use' : ''} onClick={() => { if (confirm(`Delete ${item.filename}?`)) void act(async () => { await remove({ id: item._id }); onClose() }) }}>Delete</button></div>
  </AdminModal>
}

export function MediaLibrary() {
  const items = useQuery(api.media.list) ?? []
  const generate = useAction(api.media.generateUploadUrl)
  const create = useMutation(api.media.create)
  const replace = useMutation(api.media.replace)
  const input = useRef<HTMLInputElement>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [collection, setCollection] = useState('')
  const [replaceId, setReplaceId] = useState<Id<'media'> | null>(null)
  const [selected, setSelected] = useState<Id<'media'> | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<(typeof types)[number]>('All')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const filtered = items.filter(item => item.filename.toLowerCase().includes(search.toLowerCase()) && (filter === 'All' || (filter === 'Project Media' ? item.usedIn.includes('projects') || item.collection === 'projects' : filter === 'Blog Media' ? item.usedIn.includes('blog') || item.collection === 'blog' : fileKind(item.contentType) === filter)))
  const chosen = items.find(item => item._id === selected)
  const upload = async () => {
    if (!files.length) return
    setBusy(true); setError(''); setProgress(0)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!allowed.includes(file.type)) throw new Error(`${file.name}: unsupported file type`)
        const replacing = replaceId ? items.find(item => item._id === replaceId) : null
        if (replacing && fileKind(replacing.contentType) !== fileKind(file.type)) throw new Error('Replacement must be the same media type.')
        if (file.size > (file.type.startsWith('image/') ? 10 : 50) * 1024 * 1024) throw new Error(`${file.name}: file too large`)
        const { uploadUrl, key } = await generate({ contentType: file.type })
        await new Promise<void>((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.open('PUT', uploadUrl); xhr.setRequestHeader('Content-Type', file.type); xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(((i + e.loaded / e.total) / files.length) * 100)) }; xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Storage upload failed')); xhr.onerror = () => reject(new Error('Storage upload failed')); xhr.send(file) })
        const dims = file.type.startsWith('image/') ? await new Promise<{ width: number; height: number } | null>(resolve => { const image = new Image(); const url = URL.createObjectURL(file); image.onload = () => { resolve({ width: image.naturalWidth, height: image.naturalHeight }); URL.revokeObjectURL(url) }; image.onerror = () => { resolve(null); URL.revokeObjectURL(url) }; image.src = url }) : null
        if (replaceId) await replace({ id: replaceId, r2Key: key, filename: file.name, contentType: file.type, size: file.size, width: dims?.width, height: dims?.height })
        else await create({ r2Key: key, filename: file.name, contentType: file.type, size: file.size, alt: alt || file.name, caption: caption || undefined, collection: collection || undefined, width: dims?.width, height: dims?.height })
      }
      setProgress(100); setFiles([]); setUploadOpen(false); setReplaceId(null)
    } catch (err) { setError(errorMessage(err, 'Upload failed')) } finally { setBusy(false) }
  }
  return <div style={{ fontFamily: 'system-ui, sans-serif' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><h1>Media Library</h1><p style={{ color: '#6b7280' }}>{items.length} assets</p></div><button onClick={() => setUploadOpen(true)} style={{ background: '#111827', color: '#fff', padding: '10px 16px', border: 0, borderRadius: 8 }}>Upload files</button></header>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>{types.map(type => <button key={type} onClick={() => { setFilter(type); setPage(1) }} style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 20, background: type === filter ? '#111827' : '#fff', color: type === filter ? '#fff' : '#374151' }}>{type}</button>)}</div>
    <input aria-label="Search media" placeholder="Search media" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ padding: 10, border: '1px solid #d1d5db', borderRadius: 8, marginBottom: 20 }} />
    {filtered.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14 }}>{filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(item => <button key={item._id} onClick={() => setSelected(item._id)} style={{ textAlign: 'left', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', padding: 0, cursor: 'pointer' }}><div style={{ height: 130, display: 'grid', placeItems: 'center', background: '#f3f4f6' }}>{item.contentType.startsWith('image/') && item.url ? <img src={item.url} alt={item.alt} style={{ width: '100%', height: 130, objectFit: 'cover' }} /> : <span>{fileKind(item.contentType)}</span>}</div><div style={{ padding: 12 }}><strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.filename}</strong><small>{sizeText(item.size)} · {item.collection ?? 'Unsorted'}</small></div></button>)}</div> : <div style={{ padding: 40, textAlign: 'center', background: '#fff' }}>No media matches this view.</div>}
    {filtered.length > PAGE_SIZE && <nav aria-label="Media pages" style={{ display: 'flex', gap: 8, marginTop: 18 }}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length / PAGE_SIZE)}</span><button disabled={page * PAGE_SIZE >= filtered.length} onClick={() => setPage(page + 1)}>Next</button></nav>}
    {chosen && <MediaDetails item={chosen} onClose={() => setSelected(null)} onReplace={() => { setSelected(null); setReplaceId(chosen._id); setUploadOpen(true) }} />}
    {uploadOpen && <AdminModal title={replaceId ? 'Replace asset' : 'Upload media'} onClose={() => { if (!busy) { setUploadOpen(false); setReplaceId(null) } }}><div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); setFiles(Array.from(e.dataTransfer.files).slice(0, replaceId ? 1 : undefined)) }} style={{ border: '2px dashed #cbd5e1', borderRadius: 12, padding: 30, textAlign: 'center' }}>Drop files here or <button onClick={() => input.current?.click()}>Browse files</button><input ref={input} type="file" multiple={!replaceId} accept={allowed.join(',')} hidden onChange={e => setFiles(Array.from(e.target.files ?? []))} /></div><p>{files.map(f => f.name).join(', ') || 'Images up to 10 MB; videos and documents up to 50 MB.'}</p>{!replaceId && <div style={{ display: 'grid', gap: 10 }}><label>Alt text<input value={alt} onChange={e => setAlt(e.target.value)} style={{ width: '100%' }} /></label><label>Caption<input value={caption} onChange={e => setCaption(e.target.value)} style={{ width: '100%' }} /></label><label>Folder / collection<select value={collection} onChange={e => setCollection(e.target.value)} style={{ width: '100%' }}><option value="">Unsorted</option><option value="projects">Projects</option><option value="blog">Blog</option></select></label></div>}{busy && <progress max={100} value={progress} style={{ width: '100%' }} />}{error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}<button disabled={!files.length || busy} onClick={() => void upload()} style={{ marginTop: 14 }}>Upload</button></AdminModal>}
  </div>
}
