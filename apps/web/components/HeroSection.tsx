'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Download } from 'lucide-react';
import { PORTFOLIO_DATA } from '@/data/portfolioData';
import { TechIcon } from './icons/TechIcons';

interface HeroSectionProps {
  onOpenResume: () => void;
  onOpenContact: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenResume }) => {
  const { personal } = PORTFOLIO_DATA;

  return (
    <section
      id="home"
      className="relative min-h-screen bg-bg-dark text-white pt-24 sm:pt-28 pb-16 flex flex-col justify-between overflow-hidden"
    >
      {/* Background Ambience & Desk Image */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Full-width desk photograph with left gradient */}
        <div className="absolute inset-0 w-full h-full opacity-70 lg:opacity-100">
          <Image
            src="/images/hero-desk.png"
            alt="Milan Kumawat developer workspace"
            fill
            priority
            className="object-cover object-[center_right] xl:object-right"
          />
          {/* Gradients for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/80 to-transparent lg:w-[60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-bg-dark/40" />
        </div>

        {/* Ambient glow */}
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-blue/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 w-full my-auto py-8 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Eyebrow: blue dot + uppercase text */}
            <div className="flex items-center gap-2.5 text-xs font-bold tracking-[0.16em] uppercase text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue inline-block animate-pulse" />
              <span>AI ENGINEER | BACKEND DEVELOPER</span>
            </div>

            {/* Giant Title */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[88px] xl:text-[96px] font-black tracking-[-0.045em] leading-[0.92] select-none">
              <span className="block text-white">Milan</span>
              <span className="block text-blue">Kumawat</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-lg sm:text-xl font-normal max-w-xl leading-relaxed text-balance">
              Building AI-powered products and scalable systems for a better tomorrow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="#projects"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-ink font-bold text-sm sm:text-base hover:bg-slate-100 transition-all duration-200 shadow-lg active:scale-95 group"
              >
                <span>View My Work</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                onClick={onOpenResume}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-black/40 hover:bg-white/10 border border-white/25 text-white font-semibold text-sm sm:text-base transition-all duration-200 backdrop-blur-md active:scale-95 group"
              >
                <span>Download Resume</span>
                <Download className="w-4 h-4 text-slate-300 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Stats Bar with subtle dividers */}
            <div className="pt-6 sm:pt-7 border-t border-white/10">
              <div className="flex items-center gap-8 sm:gap-10">
                {personal.stats.map((stat, idx) => (
                  <React.Fragment key={idx}>
                    <div className="space-y-0.5">
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-400 font-medium">
                        {stat.label}
                      </div>
                    </div>
                    {idx < personal.stats.length - 1 && (
                      <div className="h-9 w-[1px] bg-white/15" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Tech Stack Credibility Strip: direct icons on dark background */}
            <div className="pt-3 space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  TECH STACK I WORK WITH
                </span>
                <div className="h-[1px] bg-white/15 flex-1 max-w-sm" />
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
                {personal.heroTechStack.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                    title={tech.name}
                  >
                    <TechIcon name={tech.iconKey} size={28} className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-medium text-slate-300">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: spacer on desktop so background shows */}
          <div className="lg:col-span-5 hidden lg:block" />
        </div>
      </div>

      {/* Hero Bottom Bar: Jaipur, India | SCROLL | Turning ideas into real products. */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 w-full flex items-center justify-between pt-4 text-xs text-slate-400">
        {/* Left: Location */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <svg className="w-4 h-4 text-blue shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
          </svg>
          <span>Jaipur, India</span>
        </div>

        {/* Center: Scroll */}
        <a
          href="#about"
          className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition-colors group select-none"
        >
          <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 group-hover:text-slate-200">
            SCROLL
          </span>
          <div className="w-4 h-7 rounded-full border border-slate-500 flex items-start justify-center p-1 group-hover:border-blue transition-colors">
            <div className="w-1 h-2 rounded-full bg-blue animate-bounce" />
          </div>
        </a>

        {/* Right: Turning ideas into real products */}
        <div className="hidden sm:flex items-center gap-2.5 text-left">
          <div className="w-[3px] h-8 bg-blue rounded-full shrink-0" />
          <p className="text-xs text-slate-300 font-normal leading-tight">
            Turning ideas<br />into real products.
          </p>
        </div>
      </div>
    </section>
  );
};
