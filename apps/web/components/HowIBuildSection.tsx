import React from 'react';
import {
  Lightbulb,
  FileText,
  Code2,
  Rocket,
  BarChart3,
  CheckCircle2,
  Zap,
  Users
} from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { Handwriting } from './ui/Handwriting';
import type { SiteSettingsDoc } from '@/lib/convex';

interface HowIBuildSectionProps {
  settings: SiteSettingsDoc | null;
}

export const HowIBuildSection: React.FC<HowIBuildSectionProps> = ({ settings }) => {
  const howIBuildSteps = settings?.howIBuildSteps ?? [];
  const howIBuildPillars = settings?.howIBuildPillars ?? [];

  const getStepIcon = (icon: string) => {
    switch (icon) {
      case 'lightbulb':
        return <Lightbulb className="w-5 h-5 text-blue" />;
      case 'fileText':
        return <FileText className="w-5 h-5 text-blue" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-blue" />;
      case 'rocket':
        return <Rocket className="w-5 h-5 text-blue" />;
      case 'chart':
        return <BarChart3 className="w-5 h-5 text-blue" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue" />;
    }
  };

  const getPillarIcon = (icon: string) => {
    switch (icon) {
      case 'users':
        return <Users className="w-5 h-5 text-blue" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-blue" />;
      case 'rocket':
        return <Rocket className="w-5 h-5 text-blue" />;
      case 'chart':
        return <BarChart3 className="w-5 h-5 text-blue" />;
      default:
        return <Zap className="w-5 h-5 text-blue" />;
    }
  };

  return (
    <section id="how-i-build" className="defer-render py-20 sm:py-28 lg:py-32 bg-bg-primary relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 space-y-12">
        {/* Top Header & Quote Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="max-w-xl">
            <SectionHeader
              number="06"
              badge="HOW I BUILD"
              title="From idea to"
              highlight="real impact."
              description="A structured, hands-on approach to building scalable products — with a focus on clean code, real users, and continuous improvement."
            />
          </div>

          {/* Center/Right Container */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:self-end">
            <Handwriting
              text={"Ideas\nCode\nDeploy\nImpact"}
              color="slate"
              size="md"
              rotation="-3"
              underline
            />

            <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border shadow-soft max-w-sm w-full">
              <div className="flex items-start gap-3">
                <span className="text-3xl font-serif text-blue select-none leading-none shrink-0 mt-0.5">
                  "
                </span>
                <div>
                  <p className="text-xs sm:text-[13px] font-medium italic text-text-primary leading-relaxed">
                    I don't just write code,<br />I build solutions that solve real problems.
                  </p>
                  <p className="text-[11px] font-bold text-text-muted mt-1.5">
                    — Milan Kumawat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Terminal Window + 5 Process Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Terminal Window on Left (~4 cols) */}
          <div className="lg:col-span-4 relative flex flex-col justify-between">
            <div className="rounded-2xl bg-surface-well border border-border-dark p-5 sm:p-6 shadow-card font-mono-code text-xs text-text-on-dark/80 relative overflow-hidden flex-1 flex flex-col justify-between min-h-[350px]">
              <div>
                  <div className="flex items-center justify-between border-b border-border-dark pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-text-on-dark/40 text-[11px] font-semibold">build.sh</span>
                  <div className="w-10" />
                </div>

                {/* Code snippet */}
                <div className="space-y-2 py-1 leading-relaxed">
                  <p className="text-text-on-dark/30"># turn ideas into products</p>
                  <p className="pt-2">
                    <span className="text-blue-400 font-bold">while</span> (
                    <span className="text-emerald-400">curiosity</span>) &#123;
                  </p>
                  <div className="pl-5 space-y-1 text-text-on-dark/90">
                    <p className="text-cyan-400">learn();</p>
                    <p className="text-blue-400">build();</p>
                    <p className="text-emerald-400">ship();</p>
                    <p className="text-purple-400">improve();</p>
                  </div>
                  <p>&#125;</p>
                  <p className="text-text-on-dark/30 pt-3">// better products, brighter tomorrow</p>
                </div>
              </div>

              {/* Floating Pill Badge */}
              <div className="mt-6 p-3 rounded-xl bg-text-on-dark/10 backdrop-blur-md border border-text-on-dark/10 flex items-center gap-2.5 text-text-on-dark max-w-[200px]">
                <Zap className="w-4 h-4 text-blue fill-blue shrink-0" />
                <div className="text-xs font-bold leading-tight">
                  Small steps.<br />Big products.
                </div>
              </div>
            </div>
          </div>

          {/* 5-Step Process Flow (~8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {howIBuildSteps.map((step, idx) => (
              <div
                key={step.step}
                className="p-4 rounded-2xl bg-bg-soft border border-border hover:border-blue/40 hover:shadow-card transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      {getStepIcon(step.icon)}
                    </div>
                    {idx < howIBuildSteps.length - 1 && (
                      <span className="hidden lg:inline-block text-xs font-bold text-text-muted select-none">
                        →
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-extrabold text-blue tracking-wider block">
                      {step.step}
                    </span>
                    <h4 className="text-sm font-bold text-text-primary leading-snug group-hover:text-blue transition-colors">
                      {step.title}
                    </h4>
                  </div>

                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Checklist Card */}
                <div className="pt-3 mt-3 border-t border-border/70 space-y-1.5">
                  {step.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Bottom Summary Items + Bottom Right Doodle */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
            {howIBuildPillars.map((pillar, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue/20 flex items-center justify-center text-blue shrink-0">
                  {getPillarIcon(pillar.icon)}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-text-primary leading-snug">
                    {pillar.title}
                  </div>
                  <div className="text-[11px] text-text-secondary mt-0.5">
                    {pillar.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Right Doodle */}
          <div className="shrink-0 self-end">
            <Handwriting
              text={"Build\nLearn\nImprove\nRepeat."}
              color="blue"
              size="md"
              rotation="-3"
              underline
            />
          </div>
        </div>
      </div>
    </section>
  );
};
