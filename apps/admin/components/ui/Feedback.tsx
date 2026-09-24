'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type Request = { title: string; description: string; confirmLabel: string; danger: boolean; resolve: (accepted: boolean) => void }
type Feedback = { confirm: (options: { title: string; description: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>; toast: (message: string) => void }
const Context = createContext<Feedback | null>(null)
export function useFeedback() { const value = useContext(Context); if (!value) throw new Error('Feedback provider missing'); return value }
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null)
  const [message, setMessage] = useState('')
  const closeButton = useRef<HTMLButtonElement>(null)
  const confirm = useCallback((options: { title: string; description: string; confirmLabel?: string; danger?: boolean }) => new Promise<boolean>(resolve => setRequest({ ...options, confirmLabel: options.confirmLabel ?? 'Confirm', danger: options.danger ?? false, resolve })), [])
  const toast = useCallback((text: string) => setMessage(text), [])
  const dismiss = useCallback((accepted: boolean) => { request?.resolve(accepted); setRequest(null) }, [request])
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(''), 3500); return () => clearTimeout(timer) }, [message])
  useEffect(() => { if (!request) return; const previous = document.activeElement as HTMLElement | null; closeButton.current?.focus(); const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); dismiss(false) } if (event.key === 'Tab') { const dialog = document.querySelector<HTMLElement>('.confirm-dialog'); const focusable = [...(dialog?.querySelectorAll<HTMLElement>('button') ?? [])]; if (!focusable.length) return; const current = focusable.indexOf(document.activeElement as HTMLElement); if (event.shiftKey && current <= 0) { event.preventDefault(); focusable.at(-1)?.focus() } else if (!event.shiftKey && current === focusable.length - 1) { event.preventDefault(); focusable[0]?.focus() } } }; window.addEventListener('keydown', key); return () => { window.removeEventListener('keydown', key); previous?.focus() } }, [request, dismiss])
  return <Context.Provider value={{ confirm, toast }}>{children}{request && <div className="confirm-overlay" onMouseDown={e => { if (e.target === e.currentTarget) dismiss(false) }}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><h2 id="confirm-title">{request.title}</h2><p id="confirm-description">{request.description}</p><div className="confirm-actions"><button ref={closeButton} onClick={() => dismiss(false)}>Cancel</button><button className={request.danger ? 'danger' : 'primary'} onClick={() => dismiss(true)}>{request.confirmLabel}</button></div></section></div>}{message && <div className="admin-toast" role="status">{message}</div>}</Context.Provider>
}
