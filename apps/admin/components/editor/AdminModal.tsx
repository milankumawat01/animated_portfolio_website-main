'use client'
import { useEffect, useRef, type ReactNode } from 'react'

let openModals = 0
export function AdminModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const closeButton = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    openModals += 1
    const level = openModals
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (level !== openModals) return
      if (document.querySelector('.confirm-overlay')) return
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current() }
      if (event.key === 'Tab') {
        const dialog = closeButton.current?.closest('[role="dialog"]')
        const controls = [...(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])') ?? [])]
        if (!controls.length) return
        const current = controls.indexOf(document.activeElement as HTMLElement)
        if (event.shiftKey && current <= 0) { event.preventDefault(); controls.at(-1)?.focus() }
        else if (!event.shiftKey && current === controls.length - 1) { event.preventDefault(); controls[0]?.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); openModals -= 1; document.body.style.overflow = previousOverflow; previous?.focus() }
  }, [])
  return <div role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }} style={{position:'fixed',inset:0,zIndex:900,background:'rgba(15,23,42,.6)',display:'grid',placeItems:'center',padding:16}}>
    <section className="admin-modal-panel" role="dialog" aria-modal="true" aria-label={title} style={{width:'min(900px,100%)',maxHeight:'min(94vh,1000px)',overflowY:'auto',background:'#fff',borderRadius:14,padding:24,boxShadow:'0 20px 80px rgba(0,0,0,.2)'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}><h2 style={{margin:0}}>{title}</h2><button ref={closeButton} type="button" aria-label="Close" onClick={onClose} style={{fontSize:22,border:0,background:'none',cursor:'pointer'}}>×</button></header>{children}
    </section>
  </div>
}
