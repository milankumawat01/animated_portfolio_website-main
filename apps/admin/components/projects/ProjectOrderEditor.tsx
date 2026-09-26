'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { AdminModal } from '@/components/editor/AdminModal'
import { errorMessage } from '@/lib/errors'
import { useFeedback } from '@/components/ui/Feedback'

type OrderedProject = { _id: Id<'projects'>; title: string; order: number; status: string }

export function ProjectOrderEditor({ projects, onClose }: { projects: OrderedProject[]; onClose: () => void }) {
  const [items, setItems] = useState(() => [...projects].sort((a, b) => a.order - b.order))
  const [dragging, setDragging] = useState<Id<'projects'> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const reorder = useMutation(api.projects.reorder)
  const { toast } = useFeedback()
  const move = (from: number, to: number) => setItems(current => {
    const next = [...current]
    if (from < 0 || to < 0 || from >= next.length || to >= next.length) return current
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
  })
  const save = async () => {
    setSaving(true); setError('')
    try { await reorder({ ids: items.map(item => item._id) }); toast('Project order saved'); onClose() }
    catch (err) { setError(errorMessage(err, 'Could not save order')); setSaving(false) }
  }
  return <AdminModal title="Arrange projects" onClose={() => { if (!saving) onClose() }}>
    <p className="project-order-hint">Drag rows or use the arrows. This order applies to the homepage slider and project pages. Draft and archived projects stay hidden until published.</p>
    <ol className="project-order-list">{items.map((item, index) => <li key={item._id} className={dragging === item._id ? 'dragging' : ''} onDragOver={event => { if (!saving && dragging) event.preventDefault() }} onDrop={event => {
      event.preventDefault()
      if (saving || !dragging) return
      move(items.findIndex(project => project._id === dragging), index)
      setDragging(null)
    }}>
      <span draggable={!saving} onDragStart={event => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', item._id); setDragging(item._id) }} onDragEnd={() => setDragging(null)} className="project-order-handle" title="Drag to arrange"><GripVertical size={18} /></span>
      <span className="project-order-rank">{String(index + 1).padStart(2, '0')}</span>
      <div className="project-order-title"><strong>{item.title}</strong><small>{item.status}</small></div>
      <div className="project-order-buttons"><button type="button" disabled={saving || index === 0} aria-label={`Move ${item.title} up`} onClick={() => move(index, index - 1)}><ArrowUp size={16} /></button><button type="button" disabled={saving || index === items.length - 1} aria-label={`Move ${item.title} down`} onClick={() => move(index, index + 1)}><ArrowDown size={16} /></button></div>
    </li>)}</ol>
    {error && <p role="alert" className="cms-error">{error}</p>}
    <div className="project-order-actions"><button type="button" disabled={saving} onClick={onClose}>Cancel</button><button type="button" disabled={saving} onClick={() => void save()}>{saving ? 'Saving…' : 'Save order'}</button></div>
  </AdminModal>
}
