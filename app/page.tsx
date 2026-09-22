'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { ExperienceSection } from '@/components/ExperienceSection';
import { SkillsSection } from '@/components/SkillsSection';
import { HowIBuildSection } from '@/components/HowIBuildSection';
import { WritingSection } from '@/components/WritingSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { ContactModal } from '@/components/modals/ContactModal';
import { ProjectModal } from '@/components/modals/ProjectModal';
import { ArticleModal } from '@/components/modals/ArticleModal';
import { ResumeModal } from '@/components/modals/ResumeModal';
import { ProjectItem, ArticleItem } from '@/data/portfolioData';

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary font-sans selection:bg-blue selection:text-white">
      {/* Navigation Header */}
      <Navbar onOpenContact={() => setIsContactOpen(true)} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 01: Hero Section */}
        <HeroSection
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
        />

        {/* 02: About Me Section */}
        <AboutSection />

        {/* 03: Projects Section (Asymmetric) */}
        <ProjectsSection
          onSelectProject={(proj) => setSelectedProject(proj)}
        />

        {/* 04: Experience Section */}
        <ExperienceSection />

        {/* 05: Skills & Stack Section */}
        <SkillsSection />

        {/* 06: How I Build Section */}
        <HowIBuildSection />

        {/* 07: Writing & Insights Section */}
        <WritingSection
          onSelectArticle={(art) => setSelectedArticle(art)}
        />

        {/* 08: Get In Touch Section */}
        <ContactSection
          onOpenContact={() => setIsContactOpen(true)}
          onOpenResume={() => setIsResumeOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenContact={() => setIsContactOpen(true)}
        onOpenResume={() => setIsResumeOpen(true)}
      />

      {/* Modals & Dialogs */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <ProjectModal
        isOpen={!!selectedProject}
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <ArticleModal
        isOpen={!!selectedArticle}
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </div>
  );
}
