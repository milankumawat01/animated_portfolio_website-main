import React from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ModalProvider } from '@/components/modals/ModalProvider'
import type { SiteSettingsDoc } from '@/lib/convex'

// Chrome for every page that is not `/`: the real Navbar and Footer, plus the
// contact and resume modals they open. The page content stays a server component.
export function SubPageShell({
  settings,
  children,
  appearance,
}: {
  settings: SiteSettingsDoc | null
  children: React.ReactNode
  appearance?: 'dark'
}) {
  return (
    <ModalProvider>
      <div className={`${appearance === 'dark' ? 'case-study-theme ' : ''}min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans selection:bg-blue selection:text-white`}>
        <Navbar />
        {/* The navbar is fixed; this offsets content by its solid height. */}
        <main className="flex-1 pt-[65px]">{children}</main>
        <Footer settings={settings} isHome={false} caseStudy={appearance === 'dark'} />
      </div>
    </ModalProvider>
  )
}
