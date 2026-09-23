'use client'
import React, { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ContactModal } from '@/components/modals/ContactModal'
import { ResumeModal } from '@/components/modals/ResumeModal'
import type { SiteSettingsDoc } from '@/lib/convex'

// Chrome for every page that is not `/`: the real Navbar and Footer, plus the
// contact and resume modals they open. The page content stays a server component.
export function SubPageShell({
  settings,
  children,
}: {
  settings: SiteSettingsDoc | null
  children: React.ReactNode
}) {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isResumeOpen, setIsResumeOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans selection:bg-blue selection:text-white">
      <Navbar onOpenContact={() => setIsContactOpen(true)} />
      {/* The navbar is fixed; this offsets content by its solid height. */}
      <main className="flex-1 pt-[65px]">{children}</main>
      <Footer
        settings={settings}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenResume={() => setIsResumeOpen(true)}
      />

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </div>
  )
}
