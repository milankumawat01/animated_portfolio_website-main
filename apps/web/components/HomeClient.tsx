'use client'
import React, { useState } from 'react'
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
import { ContactModal } from '@/components/modals/ContactModal'
import { ProjectModal } from '@/components/modals/ProjectModal'
import { ResumeModal } from '@/components/modals/ResumeModal'
import type { SiteSettingsDoc, ProjectDoc, PostDoc, ExperienceDoc, SkillCategoryDoc } from '@/lib/convex'

interface HomeClientProps {
  settings: SiteSettingsDoc | null
  projects: ProjectDoc[]
  posts: PostDoc[]
  experience: ExperienceDoc[]
  skills: SkillCategoryDoc[]
}

export function HomeClient({ settings, projects, posts, experience, skills }: HomeClientProps) {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isResumeOpen, setIsResumeOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectDoc | null>(null)

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans selection:bg-blue selection:text-white">
      <CustomCursor />
      <Navbar onOpenContact={() => setIsContactOpen(true)} />
      <main className="flex-1">
        <HeroSection settings={settings} onOpenResume={() => setIsResumeOpen(true)} onOpenContact={() => setIsContactOpen(true)} />
        <AboutSection settings={settings} />
        <ProjectsSection projects={projects} onSelectProject={setSelectedProject} />
        <ExperienceSection experience={experience} settings={settings} />
        <SkillsSection skills={skills} settings={settings} />
        <HowIBuildSection settings={settings} />
        <WritingSection posts={posts} settings={settings} />
        <ContactSection settings={settings} onOpenContact={() => setIsContactOpen(true)} onOpenResume={() => setIsResumeOpen(true)} />
      </main>
      <Footer settings={settings} onOpenContact={() => setIsContactOpen(true)} onOpenResume={() => setIsResumeOpen(true)} />

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <ProjectModal isOpen={!!selectedProject} project={selectedProject} onClose={() => setSelectedProject(null)} />
      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </div>
  )
}
