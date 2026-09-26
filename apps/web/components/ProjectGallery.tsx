'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ImageIcon, Maximize2, X } from 'lucide-react'

function ExpandedPreview({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close() }, [])
  return <dialog ref={dialog} className="project-image-expanded" aria-label={`${title} full-size preview`} onCancel={event => { event.stopPropagation(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <button type="button" autoFocus onClick={onClose} aria-label="Close full-size preview" className="project-image-close"><X size={22} /></button>
    <div className="relative h-full w-full"><Image src={url} alt={`${title} full-size preview`} fill sizes="95vw" className="object-contain" /></div>
  </dialog>
}

export function ProjectGallery({ title, urls, variant = 'standard' }: { title: string; urls: string[]; variant?: 'standard' | 'showcase' }) {
  const images = [...new Set(urls.filter(Boolean))]
  const [selected, setSelected] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const strip = useRef<HTMLDivElement>(null)
  const index = Math.min(selected, Math.max(0, images.length - 1))
  const move = (delta: number) => setSelected((index + delta + images.length) % images.length)
  useEffect(() => { const thumbnail = strip.current?.children[index] as HTMLElement | undefined; if (thumbnail && strip.current) strip.current.scrollLeft = thumbnail.offsetLeft - (strip.current.clientWidth - thumbnail.clientWidth) / 2 }, [index])
  return <div className={`project-gallery ${variant === 'showcase' ? 'showcase-gallery' : ''}`} aria-label={`${title} screenshots`} onKeyDown={event => { if (images.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1) } }}>
    <div className="gallery-preview">
      {images.length ? <Image src={images[index]} alt={`${title} screenshot ${index + 1}`} fill sizes="(max-width: 1023px) 90vw, 850px" className="object-contain" /> : <div className="gallery-empty"><ImageIcon size={34} strokeWidth={1.3} /><span>Project preview</span><p>Screenshots will be added soon.</p></div>}
      {images.length > 0 && <button type="button" onClick={() => setExpanded(true)} aria-label="Expand screenshot" className="gallery-expand"><Maximize2 size={18} /></button>}
    </div>
    {images.length > 0 && <div className="gallery-navigation">
      <button type="button" disabled={images.length < 2} onClick={() => move(-1)} aria-label="Previous screenshot" className="gallery-arrow"><ChevronLeft size={22} /></button>
      <div ref={strip} className="gallery-thumbnails no-scrollbar">{images.map((url, i) => <button type="button" key={url} aria-label={`Show screenshot ${i + 1}`} aria-pressed={index === i} onClick={() => setSelected(i)} className={`gallery-thumbnail ${index === i ? 'selected' : ''}`}><Image src={url} alt="" fill sizes="140px" className="object-cover object-top" /></button>)}</div>
      <button type="button" disabled={images.length < 2} onClick={() => move(1)} aria-label="Next screenshot" className="gallery-arrow"><ChevronRight size={22} /></button>
    </div>}
    {images.length > 0 && <span aria-live="polite" className="sr-only">Screenshot {index + 1} of {images.length}</span>}
    {expanded && images[index] && <ExpandedPreview title={title} url={images[index]} onClose={() => setExpanded(false)} />}
  </div>
}
