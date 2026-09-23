'use client';

import React from 'react';
import Image from 'next/image';
import { Code2, Lightbulb, Users, Brain, Database, Box, BarChart3 } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { Handwriting } from './ui/Handwriting';
import type { SiteSettingsDoc } from '@/lib/convex';

interface AboutSectionProps {
  settings: SiteSettingsDoc | null;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
  const bio = settings?.personal?.bio ?? '';
  const aboutPillars = settings?.aboutPillars ?? [];
  const whatIWorkOn = settings?.whatIWorkOn ?? [];
  const quoteAbout = settings?.quotes?.about ?? '';

  const getPillarIcon = (icon: string) => {
    switch (icon) {
      case 'code':
        return <Code2 className="w-5 h-5 text-blue" />;
      case 'lightbulb':
        return <Lightbulb className="w-5 h-5 text-blue" />;
      case 'users':
        return <Users className="w-5 h-5 text-blue" />;
      default:
        return <Code2 className="w-5 h-5 text-blue" />;
    }
  };

  const getWorkIcon = (icon: string) => {
    switch (icon) {
      case 'brain':
        return <Brain className="w-5 h-5 text-blue" />;
      case 'database':
        return <Database className="w-5 h-5 text-blue" />;
      case 'box':
        return <Box className="w-5 h-5 text-blue" />;
      case 'chart':
        return <BarChart3 className="w-5 h-5 text-blue" />;
      default:
        return <Brain className="w-5 h-5 text-blue" />;
    }
  };

  return (
    <section id="about" className="py-20 sm:py-28 lg:py-32 bg-bg-primary relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
        {/* Main Grid: 3 columns (Left 5 cols, Center 4 cols, Right 3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column (5 cols): Heading, Bio, and 3 Pillars */}
          <div className="lg:col-span-5 space-y-7">
            <SectionHeader
              number="02"
              badge="ABOUT ME"
              title="Turning ideas"
              highlight="into real solutions."
              breakBeforeHighlight={true}
              description={bio}
            />

            {/* 3 Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              {aboutPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-bg-soft border border-border flex flex-col justify-between hover:shadow-soft hover:border-blue/30 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-light/80 border border-blue/15 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    {getPillarIcon(pillar.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-text-primary leading-snug">
                      {pillar.title}
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1 leading-normal">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column (4 cols): Milan's Real Photograph from IMG_8956 with Doodles */}
          <div className="lg:col-span-4 flex justify-center relative pt-4 sm:pt-6">
            {/* Top-Left Doodle: "_Same Curiosity Different Problems" + curved arrow */}
            <div className="absolute -top-10 -left-8 sm:-top-14 sm:-left-12 z-20 hidden sm:block pointer-events-none">
              <div className="relative flex flex-col items-end">
                <div               className="font-handwriting text-text-muted text-lg sm:text-xl leading-tight text-right -rotate-[4deg] select-none">
                  <div>_Same</div>
                  <div>Curiosity</div>
                  <div>Different</div>
                  <div>Problems</div>
                </div>
                <svg
                  className="w-12 h-8 -mr-3 text-text-secondary mt-1 select-none"
                  viewBox="0 0 60 36"
                  fill="none"
                >
                  <path
                    d="M6 8 C 24 8, 44 14, 54 30 M54 30 L 44 26 M54 30 L 52 18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Outer Light-Blue Backdrop */}
            <div className="relative w-full max-w-[380px] bg-blue-light rounded-[32px] p-3 pb-6 shadow-sm">
              {/* Photo Image Frame */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
                <Image
                  src="/images/milan-profile.jpg"
                  alt="Milan Kumawat - AI Engineer & Backend Developer"
                  fill
                  priority
                  className="object-cover object-center"
                />

                {/* Location Badge (bottom-left) */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-feature/80 backdrop-blur-md text-text-on-dark text-xs font-semibold shadow-lg border border-text-on-dark/10 select-none">
                  <span className="text-red-400 text-sm leading-none">📍</span>
                  <span>Jaipur, India</span>
                </div>
              </div>

              {/* Bottom-Right Sticky Note (Good Code Better Products) */}
              <div className="absolute -bottom-4 -right-3 sm:-right-4 z-20 bg-surface-well text-text-on-dark p-3.5 sm:p-4 rounded-xl shadow-2xl border border-text-on-dark/10 rotate-6 select-none max-w-[130px]">
                <div className="font-handwriting text-text-on-dark/90 text-lg sm:text-xl leading-tight">
                  <div>Good</div>
                  <div>Code</div>
                  <div>Better</div>
                  <div className="relative inline-block text-text-on-dark font-bold">
                    Products
                    <svg className="w-full h-2 mt-0.5 text-blue" viewBox="0 0 70 8" fill="none">
                      <path d="M2 5 C 20 2, 45 6, 68 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (3 cols): "WHAT I WORK ON" + Quote + Doodle */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-3">
              <div className="text-[11px] font-bold tracking-label uppercase text-text-muted pb-1">
                WHAT I WORK ON
              </div>

              <div className="space-y-3">
                {whatIWorkOn.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-elevated border border-border shadow-soft hover:border-blue/30 hover:translate-x-1 transition-all duration-300 group cursor-default"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-light/80 border border-blue/15 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-blue/40 transition-all duration-200">
                      {getWorkIcon(item.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-blue transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote placed in right column as shown in design */}
            <div className="pt-4 border-t border-border/80 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl font-serif text-blue select-none leading-none shrink-0 mt-0.5">
                  "
                </span>
                <div>
                  <p className="text-xs sm:text-[13px] font-medium italic text-text-primary leading-relaxed">
                    {quoteAbout}
                  </p>
                  <p className="text-[11px] font-bold text-text-muted mt-1.5">
                    — Milan Kumawat
                  </p>
                </div>
              </div>

              {/* Bottom Right Doodle */}
              <div className="flex justify-end pt-1">
                <Handwriting
                  text={"Let's\nBuild\nWhat's\nNext."}
                  color="blue"
                  size="md"
                  rotation="-3"
                  underline
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
