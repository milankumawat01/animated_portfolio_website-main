import React from 'react';
import { Rocket, Users, Zap, GraduationCap } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { Handwriting } from './ui/Handwriting';
import type { ExperienceDoc, SiteSettingsDoc } from '@/lib/convex';

const logoVariantMap: Record<string, string> = {
  'bg-slate-900 text-white': 'bg-ink text-text-on-dark',
  'bg-blue-600 text-white': 'bg-blue text-text-on-dark',
  'bg-blue-50 text-blue-600 border border-blue-200': 'bg-blue-light text-blue border border-blue/20',
};

const resolveLogoBg = (logoBg: string) => logoVariantMap[logoBg] ?? logoBg;

interface ExperienceSectionProps {
  experience: ExperienceDoc[];
  settings: SiteSettingsDoc | null;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience, settings }) => {
  const quoteExperience = settings?.quotes?.experience ?? '';

  return (
    <section id="experience" className="defer-render py-20 sm:py-28 lg:py-32 bg-bg-primary relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 space-y-10">
        {/* Section Header */}
        <SectionHeader
          number="04"
          badge="EXPERIENCE"
          title="Where I've been"
          highlight="building."
          description="From startups to product teams, I've worked on real-world products, built scalable systems, and helped turn ideas into impactful solutions."
        />

        {/* 3-Column Experience Layout matching reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (3.8 cols): Single Combined Card + Doodle - FIXED IN PLACE */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-bg-soft border border-border space-y-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-light text-blue flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Real Products</h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Worked on products used by clients and real users.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-2 border-t border-border/60">
                <div className="w-10 h-10 rounded-xl bg-blue-light text-blue flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Growing Responsibility</h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    From intern to engineer, with increasing ownership.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-2 border-t border-border/60">
                <div className="w-10 h-10 rounded-xl bg-blue-light text-blue flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Impact Driven</h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Focused on building solutions that create real value.
                  </p>
                </div>
              </div>
            </div>

            {/* Left handwritten annotation */}
            <div className="pt-2 pl-2">
              <Handwriting
                text={"Better\nSystems\nBrighter\nTomorrow."}
                color="slate"
                size="md"
                rotation="-3"
                underline
              />
            </div>
          </div>

          {/* Middle Column (6 cols): Vertical Timeline with company cards */}
          <div className="lg:col-span-6 relative">
            <div className="space-y-6">
              <div className="relative border-l-2 border-blue-200/70 ml-4 sm:ml-16 pl-6 sm:pl-8 space-y-7 pb-2">
                {experience.map((item, idx) => (
                  <div key={item._id} className="relative group">
                    {/* Node Dot with timeframe */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-4 flex items-center">
                      <span className="hidden sm:block absolute right-7 text-xs font-bold text-text-muted whitespace-nowrap text-right w-20 leading-tight">
                        {item.timeframe}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-125 ${
                          idx === 0
                            ? 'bg-blue border-blue-200 ring-4 ring-blue-100'
                            : 'bg-surface-elevated border-blue/30'
                        }`}
                      />
                    </div>

                    {/* Experience Card */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-surface-elevated border border-border shadow-soft hover:shadow-card hover:border-blue/30 transition-all duration-300 space-y-3.5">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-xs shrink-0 ${resolveLogoBg(item.logoBg)}`}
                          >
                            {item.logo === '🎓' ? (
                              <GraduationCap className="w-5 h-5 text-blue" />
                            ) : (
                              item.logo
                            )}
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-text-primary leading-snug">
                              {item.company}
                            </h3>
                            <div className="text-xs font-semibold text-text-secondary">
                              {item.role}
                            </div>
                          </div>
                        </div>

                        {(item.badge || item.current) && <span className="inline-flex items-center self-start sm:self-center px-3 py-0.5 rounded-full text-[11px] font-semibold bg-blue-light text-blue">{item.current ? 'Current' : item.badge}</span>}
                      </div>

                      <p className="text-xs text-text-muted">{item.period}{item.employmentType ? ` · ${item.employmentType}` : ''}{item.location ? ` · ${item.location}` : ''}</p>
                      {item.description && <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>}

                      {/* Bullet Highlights */}
                      <ul className="space-y-1.5 text-xs text-text-secondary pt-1">
                        {item.points.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Tech Badges */}
                      <div className="pt-2 border-t border-border/70 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-bg-soft text-text-secondary border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (2.2 cols): Top Doodle + Bottom Quote - FIXED IN PLACE */}
          <div className="lg:col-span-2 flex flex-col justify-between h-full space-y-12 pt-2">
            {/* Top Doodle */}
            <div className="flex justify-start lg:justify-end">
              <Handwriting
                text={"Good\nPeople\nGreat\nProducts."}
                color="slate"
                size="md"
                rotation="3"
                underline
              />
            </div>

            {/* Bottom Quote matching reference image */}
            <div className="space-y-3 pt-12">
              <span className="text-4xl font-serif text-blue select-none leading-none block">
                &ldquo;
              </span>
              <p className="text-xs sm:text-[13px] font-medium italic text-text-primary leading-relaxed">
                {quoteExperience}
              </p>
              <p className="text-[11px] font-bold text-text-muted">
                — Milan Kumawat
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
