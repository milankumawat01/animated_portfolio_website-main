'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ProjectDoc } from '@/lib/convex'

// The modals (and the Convex client + confetti the contact form needs) are
// fetched on first open, so they add nothing to the page's startup JS.
const ContactModal = dynamic(() => import('./ContactModal').then((m) => m.ContactModal), { ssr: false })
const ResumeModal = dynamic(() => import('./ResumeModal').then((m) => m.ResumeModal), { ssr: false })
const BookingModal = dynamic(() => import('./BookingModal').then((m) => m.BookingModal), { ssr: false })
const ProjectModal = dynamic(() => import('./ProjectModal').then((m) => m.ProjectModal), { ssr: false })

interface ModalActions {
  openContact: () => void
  openResume: () => void
  openBooking: () => void
  openProject: (project: ProjectDoc) => void
}

const ModalContext = createContext<ModalActions | null>(null)

export function useModals(): ModalActions {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModals must be used inside <ModalProvider>')
  return ctx
}

// Owns which modal is open. The page content passes through as server-rendered
// children; only the small trigger buttons are client components.
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectDoc | null>(null)

  const actions = useMemo<ModalActions>(() => ({
    openContact: () => setIsContactOpen(true),
    openResume: () => setIsResumeOpen(true),
    openBooking: () => { setIsContactOpen(false); setIsBookingOpen(true) },
    openProject: setSelectedProject,
  }), [])

  // Shareable link: any page URL ending in #book (and /book, which redirects here) opens the booking popup.
  useEffect(() => {
    const sync = () => { if (window.location.hash === '#book') setIsBookingOpen(true) }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const closeBooking = () => {
    setIsBookingOpen(false)
    if (window.location.hash === '#book') history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  return (
    <ModalContext.Provider value={actions}>
      {children}
      {isContactOpen && <ContactModal isOpen onClose={() => setIsContactOpen(false)} />}
      {isResumeOpen && <ResumeModal isOpen onClose={() => setIsResumeOpen(false)} />}
      {isBookingOpen && <BookingModal onClose={closeBooking} />}
      {selectedProject && <ProjectModal isOpen project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </ModalContext.Provider>
  )
}
