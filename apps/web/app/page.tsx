// apps/web/app/page.tsx — async Server Component, NO 'use client'
// The sections render on the server; only the Navbar, cursor, modal triggers
// and carousel arrows hydrate as client islands.
import { getProjects, getPosts, getSiteSettings, getExperience, getSkillCategories } from '@/lib/convex'
import { Navbar } from '@/components/Navbar'
import { HeroSection } from '@/components/HeroSection'
import { AboutSection } from '@/components/AboutSection'
import { ProjectsSection } from '@/components/ProjectsSection'
import { ExperienceSection } from '@/components/ExperienceSection'
import { SkillsSection } from '@/components/SkillsSection'
import { HowIBuildSection } from '@/components/HowIBuildSection'
import { WritingSection } from '@/components/WritingSection'
import { ContactSection } from '@/components/ContactSection'
import { Footer } from '@/components/Footer'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { DeferRenderGuard } from '@/components/ui/DeferRenderGuard'
import { ModalProvider } from '@/components/modals/ModalProvider'
import { JsonLd, personSchema, websiteSchema } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'
import { RSS_FEED } from '@/lib/seo'

// Same site is also served on milankumawat.vercel.app and .eu.org; the
// canonical points search engines at the primary domain (metadataBase).
export const metadata: Metadata = {
  alternates: { canonical: '/', types: RSS_FEED },
}

export default async function Home() {
  const [settings, projects, posts, experience, skills] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getPosts(),
    getExperience(),
    getSkillCategories(),
  ])

  const liveSettings = { ...settings, stats: settings.stats.map(stat => stat.label === 'Projects Built' ? { ...stat, value: String(projects.length) } : stat) }

  return (
    <>
      <JsonLd data={personSchema(settings)} />
      <JsonLd data={websiteSchema()} />
      <ModalProvider>
        <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans selection:bg-blue selection:text-white">
          <CustomCursor />
          <DeferRenderGuard />
          <Navbar />
          <main className="flex-1">
            <HeroSection settings={liveSettings} />
            <AboutSection settings={settings} />
            <ProjectsSection projects={projects ?? []} />
            <ExperienceSection experience={experience ?? []} settings={settings} />
            <SkillsSection skills={skills ?? []} settings={settings} />
            <HowIBuildSection settings={settings} />
            <WritingSection posts={posts ?? []} settings={settings} />
            <ContactSection settings={settings} />
          </main>
          <Footer settings={settings} isHome />
        </div>
      </ModalProvider>
    </>
  )
}
