'use client'
import React from 'react'
import { useModals } from './ModalProvider'
import type { ProjectDoc } from '@/lib/convex'

// Client islands that open a modal. Their children stay server-rendered.

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'>

export function OpenContactButton(props: ButtonProps) {
  const { openContact } = useModals()
  return <button type="button" {...props} onClick={openContact} />
}

export function OpenResumeButton(props: ButtonProps) {
  const { openResume } = useModals()
  return <button type="button" {...props} onClick={openResume} />
}

export function ProjectCardTrigger({
  project,
  className,
  children,
}: {
  project: ProjectDoc
  className?: string
  children: React.ReactNode
}) {
  const { openProject } = useModals()
  return (
    <div onClick={() => openProject(project)} className={className}>
      {children}
    </div>
  )
}
