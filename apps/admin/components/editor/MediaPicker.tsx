'use client'
/* eslint-disable @next/next/no-img-element -- Uploaded assets are previewed directly. */
import { useRef, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import { errorMessage } from '@/lib/errors'
import { useUploadMedia } from '@/lib/uploadMedia'
import { useFeedback } from '@/components/ui/Feedback'
import { AdminModal } from './AdminModal'

type Props = { onSelect: (url: string) => void; onClose: () => void; multiple?: boolean; onSelectMany?: (urls: string[]) => void }
export function MediaPicker({ onSelect, onClose, multiple = false, onSelectMany }: Props) {
  const query = useQuery(api.media.list)
  const items = (query ?? []).filter(x => x.contentType.startsWith('image/') && x.url)
  const uploadMedia = useUploadMedia()
  const { toast } = useFeedback()
  const input = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [collection, setCollection] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const collections = ['all', ...new Set(items.map(x => x.collection).filter((x): x is string => !!x))]
  const filtered = items.filter(x => (collection === 'all' || x.collection === collection) && `${x.filename} ${x.alt}`.toLowerCase().includes(search.toLowerCase()))
  const toggle = (url: string) => setSelected(current => multiple ? current.includes(url) ? current.filter(x => x !== url) : [...current, url] : [url])
  const upload = async () => {
    if (!file || !alt.trim()) { setError('Choose an image and add alt text.'); return }
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) { setError('Choose an image under 10 MB.'); return }
    setUploading(true); setError('')
    try { const dims = await new Promise<{ w: number; h: number } | null>(resolve => { const image = new Image(); const url = URL.createObjectURL(file); image.onload = () => { resolve({ w: image.naturalWidth, h: image.naturalHeight }); URL.revokeObjectURL(url) }; image.onerror = () => { resolve(null); URL.revokeObjectURL(url) }; image.src = url }); await uploadMedia(file, alt.trim(), dims); setFile(null); setAlt(''); if (input.current) input.current.value = ''; toast('Image added to library') } catch (err) { setError(errorMessage(err, 'Upload failed')) } finally { setUploading(false) }
  }
  const apply = () => { if (!selected.length) return; if (multiple && onSelectMany) onSelectMany(selected); else selected.forEach(onSelect); onClose() }
  return <AdminModal title="Select media" onClose={onClose}><div className="picker-toolbar"><input aria-label="Search media" placeholder="Search images" value={search} onChange={e => setSearch(e.target.value)}/><select aria-label="Collection" value={collection} onChange={e => setCollection(e.target.value)}>{collections.map(x=><option key={x} value={x}>{x==='all'?'All collections':x}</option>)}</select></div>
    <div className="picker-grid">{query === undefined ? <div className="skeleton" style={{height:180,gridColumn:'1/-1'}}/> : filtered.length ? filtered.map(item=><div className={`picker-item${selected.includes(item.url!) ? ' selected' : ''}`} key={item._id}><button className="picker-select" onClick={()=>toggle(item.url!)} aria-pressed={selected.includes(item.url!)} aria-label={`Select ${item.filename}`}><img src={item.url!} alt={item.alt}/><span>{item.filename}</span><small>{item.width && item.height ? `${item.width} × ${item.height}` : 'Image'}</small><span className="picker-check" aria-hidden="true">{selected.includes(item.url!) ? '✓' : ''}</span></button><button className="picker-preview" onClick={()=>setPreview(item.url!)} aria-label={`Preview ${item.filename}`}>Preview</button></div>) : <p className="picker-empty">No images match. Upload an image below.</p>}</div>
    {preview && <div className="picker-lightbox" role="presentation" onClick={()=>setPreview(null)}><img src={preview} alt="Selected media preview"/><button onClick={()=>setPreview(null)}>Close preview</button></div>}
    <div className="picker-upload"><strong>Upload a new image</strong><div><input ref={input} type="file" accept="image/*" aria-label="Choose image" onChange={e=>setFile(e.target.files?.[0]??null)}/><input aria-label="Alt text" placeholder="Alt text (required)" value={alt} onChange={e=>setAlt(e.target.value)}/><button disabled={!file||uploading} onClick={()=>void upload()}>{uploading?'Uploading…':'Upload'}</button></div>{error && <p role="alert" className="cms-error">{error}</p>}</div>
    <div className="picker-actions"><span>{selected.length} selected</span><button onClick={onClose}>Cancel</button><button disabled={!selected.length} onClick={apply}>Use {multiple ? 'images' : 'image'}</button></div>
  </AdminModal>
}
