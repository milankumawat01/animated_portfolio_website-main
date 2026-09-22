'use client';

import React from 'react';
import Image from 'next/image';
import { Server, Brain, Monitor, Database, Cloud, Wrench, Activity } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { Handwriting } from './ui/Handwriting';
import { TechIcon } from './icons/TechIcons';
import { PORTFOLIO_DATA } from '@/data/portfolioData';

export const SkillsSection: React.FC = () => {
  const { skillCategories, personal } = PORTFOLIO_DATA;

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'server':
        return <Server className="w-5 h-5 text-blue" />;
      case 'brain':
        return <Brain className="w-5 h-5 text-blue" />;
      case 'monitor':
        return <Monitor className="w-5 h-5 text-blue" />;
      case 'database':
        return <Database className="w-5 h-5 text-blue" />;
      case 'cloud':
        return <Cloud className="w-5 h-5 text-blue" />;
      case 'wrench':
        return <Wrench className="w-5 h-5 text-blue" />;
      default:
        return <Server className="w-5 h-5 text-blue" />;
    }
  };

  return (
    <section id="skills" className="py-20 sm:py-28 lg:py-32 bg-bg-soft relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 space-y-12">
        {/* Section Header */}
        <SectionHeader
          number="05"
          badge="SKILLS & STACK"
          title="Tools I use to"
          highlight="build real solutions."
          description="A carefully chosen stack that helps me build, ship and scale AI-powered products efficiently."
        />

        {/* Two-Column Layout: Left Photo (4 cols) & Right Categories (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Desk Photo with Goku + Annotations */}
          <div className="lg:col-span-4 space-y-4">
            {/* Handwritten note with arrow placed cleanly above photo */}
            <div className="flex flex-col items-center justify-center -mb-2 pr-6">
              <Handwriting
                text={"Same\nCuriosity\nDifferent\nTools"}
                color="slate"
                size="md"
                rotation="-3"
              />
              <svg
                className="w-12 h-8 text-slate-700 -ml-4 mt-0.5"
                viewBox="0 0 50 32"
                fill="none"
              >
                <path
                  d="M36 2 C 28 16, 14 22, 4 26 M4 26 L 12 18 M4 26 L 13 29"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Photo Card Container with Crisp Floating Badge */}
            <div className="relative w-full max-w-[340px] mx-auto lg:mx-0 aspect-[356/438] rounded-2xl overflow-visible shadow-card border-4 border-white bg-slate-900 group">
              <Image
                src="/images/skills-desk.png"
                alt="Coding workspace setup with Goku and laptop"
                fill
                className="object-cover rounded-xl"
              />

              {/* Floating Badge (Now single, crisp, no ghost text) */}
              <div className="absolute bottom-5 -right-3 sm:-right-5 p-3 rounded-xl bg-ink/90 backdrop-blur-md border border-white/10 text-white flex items-center gap-2.5 shadow-xl z-10">
                <div className="w-8 h-8 rounded-lg bg-blue/20 border border-blue/40 flex items-center justify-center text-blue shrink-0">
                  <Activity className="w-4 h-4 text-blue animate-pulse" />
                </div>
                <div className="leading-tight pr-1">
                  <div className="text-xs font-bold text-white">Always learning</div>
                  <div className="text-[10px] text-slate-300 font-medium">Always building</div>
                </div>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="flex items-center gap-3 pt-4">
              <div className="w-[3px] h-8 bg-blue rounded-full shrink-0" />
              <div className="text-[11px] font-bold tracking-label text-text-secondary uppercase leading-snug">
                TECHNOLOGY<br />TURNS IDEAS INTO IMPACT.
              </div>
            </div>
          </div>

          {/* Right Column: 6 Categorized Skill Cards in 2x3 Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {skillCategories.map((cat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-border shadow-soft hover:shadow-card hover:border-blue/30 transition-all duration-300 space-y-3.5 flex flex-col justify-between group"
              >
                {/* Category Header (Icon never vanishes on hover) */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary leading-tight group-hover:text-blue transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                {/* Tech Icons Grid with circular/squircle containers */}
                <div className="grid grid-cols-6 gap-2 pt-2 border-t border-border/70">
                  {cat.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex flex-col items-center gap-1 group/skill cursor-default"
                      title={skill.name}
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/skill:bg-blue-50 group-hover/skill:border-blue/30 group-hover/skill:scale-105 transition-all shadow-xs">
                        <TechIcon
                          name={skill.iconKey}
                          size={24}
                          className="w-6 h-6"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-text-secondary text-center leading-tight truncate w-full group-hover/skill:text-blue">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Quote & Doodle */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 max-w-2xl">
            <span className="text-4xl font-serif text-blue select-none leading-none shrink-0 -mt-1">
              “
            </span>
            <p className="text-sm sm:text-base font-medium italic text-text-primary leading-relaxed">
              {personal.quotes.skills}{' '}
              <span className="not-italic text-xs font-bold text-text-muted ml-2">
                — Milan Kumawat
              </span>
            </p>
          </div>

          <div className="shrink-0">
            <Handwriting
              text="Build Learn Improve Repeat."
              color="blue"
              size="lg"
              rotation="2"
              underline
            />
          </div>
        </div>
      </div>
    </section>
  );
};
