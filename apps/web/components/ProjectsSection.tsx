'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { Handwriting } from './ui/Handwriting';
import { PORTFOLIO_DATA, ProjectItem } from '@/data/portfolioData';

interface ProjectsSectionProps {
  onSelectProject: (project: ProjectItem) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onSelectProject }) => {
  const { projects, personal } = PORTFOLIO_DATA;
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="projects" className="py-20 sm:py-28 lg:py-32 bg-bg-soft relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 space-y-12">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <SectionHeader
            number="03"
            badge="PROJECTS"
            title="Projects that"
            highlight="create real impact."
            description="A showcase of the systems, products, and ideas I've built — from AI-powered platforms to scalable backend services."
          />

          <div className="flex flex-col items-start lg:items-end gap-3 lg:self-end">
            <Handwriting
              text="Build Ship Improve Repeat."
              color="slate"
              size="md"
              rotation="3"
              underline
            />

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-semibold text-text-muted">
                Featured Work
              </span>
              <button
                onClick={() => handleScroll('left')}
                className="w-10 h-10 rounded-full bg-surface-elevated border border-border hover:bg-bg-soft flex items-center justify-center text-text-primary transition shadow-xs active:scale-95"
                aria-label="Previous project"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-10 h-10 rounded-full bg-blue hover:bg-blue-dark flex items-center justify-center text-white transition shadow-sm active:scale-95"
                aria-label="Next project"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Cards in 4-column layout */}
        <div
          ref={scrollRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto pb-4 snap-x no-scrollbar"
        >
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-surface-elevated rounded-2xl border border-border shadow-soft hover:shadow-card hover:border-blue/30 transition-all duration-300 flex flex-col justify-between group snap-start cursor-pointer overflow-hidden"
            >
              {/* Preview Mockup */}
              <div className="relative w-full h-48 sm:h-52 bg-surface-well overflow-hidden border-b border-border/60">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-text-primary group-hover:text-blue transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-bg-soft text-text-secondary border border-border/80 group-hover:border-blue/20 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* View Project Link */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue group-hover:text-blue-dark transition-colors">
                      <span>View Project</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Status Bar matching reference */}
        <div className="pt-6 border-t border-border flex items-center justify-between gap-6 text-xs text-text-muted">
          <span className="font-bold tracking-wider uppercase text-[11px] shrink-0">
            MORE PROJECTS COMING SOON...
          </span>

          <div className="h-[1px] bg-border flex-1" />

          <div className="flex items-center gap-2 text-text-primary font-semibold shrink-0">
            <span>Always building</span>
            <span className="w-2 h-2 rounded-full bg-blue inline-block" />
          </div>
        </div>
      </div>
    </section>
  );
};
