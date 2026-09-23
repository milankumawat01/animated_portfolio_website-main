'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Mail, FileText, ArrowRight, Check } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons/SocialIcons';
import { Handwriting } from './ui/Handwriting';
import type { SiteSettingsDoc } from '@/lib/convex';

interface ContactSectionProps {
  settings: SiteSettingsDoc | null;
  onOpenContact: () => void;
  onOpenResume: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  settings,
  onOpenContact,
  onOpenResume,
}) => {
  const contactCards = settings?.contactCards ?? [];
  const email = settings?.personal?.email ?? 'hey@milankumawat.in';
  const linkedinUrl = settings?.personal?.linkedinUrl ?? 'https://linkedin.com/in/milankumawat';
  const [copiedEmail, setCopiedEmail] = useState(false);

  const getContactIcon = (icon: string) => {
    switch (icon) {
      case 'mail':
        return <Mail className="w-5 h-5 text-blue" />;
      case 'linkedin':
        return <LinkedinIcon className="w-5 h-5 text-blue" />;
      case 'github':
        return <GithubIcon className="w-5 h-5 text-blue" />;
      case 'fileText':
        return <FileText className="w-5 h-5 text-blue" />;
      default:
        return <Mail className="w-5 h-5 text-blue" />;
    }
  };

  const handleCardClick = (card: typeof contactCards[0]) => {
    if (card.id === 'email') {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } else if (card.id === 'resume') {
      onOpenResume();
    } else {
      window.open(card.action, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="contact" className="relative bg-bg-primary pt-20 sm:pt-28 pb-16 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Form & Info (6.5 cols) */}
          <div className="lg:col-span-7 space-y-7">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-3.5 max-w-lg">
                {/* Eyebrow */}
                <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-label uppercase">
                  <span className="w-6 h-[2px] bg-blue rounded-full inline-block" />
                  <span className="text-blue">08</span>
                  <span className="text-text-muted">GET IN TOUCH</span>
                </div>

                {/* Main Heading */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-black tracking-heading leading-[1.12] pt-1 pb-1 text-text-primary">
                  Have an idea<br />worth <span className="text-blue">building?</span>
                </h2>

                {/* Subtitle */}
                <p className="text-base sm:text-lg max-w-xl leading-[1.6] text-text-secondary">
                  I'm always open to discussing new opportunities, interesting projects or just tech conversations. Whether it's an AI product, backend system or a crazy idea — let's talk.
                </p>
              </div>

              {/* Doodle */}
              <div className="hidden sm:flex shrink-0 pt-8 pr-2">
                <Handwriting
                  text={"Good\nIdeas\nLead to\nGreat\nThings."}
                  color="slate"
                  size="md"
                  rotation="-4"
                  underline
                />
              </div>
            </div>

            {/* 4 Contact Cards (2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {contactCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border shadow-soft hover:shadow-card hover:border-blue/30 transition-all duration-300 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                      {getContactIcon(card.icon)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-blue transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-xs text-text-secondary font-medium truncate mt-0.5">
                        {card.value}
                      </p>
                      <p className="text-[11px] text-text-muted truncate">
                        {card.id === 'email' && copiedEmail ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copied to clipboard!
                          </span>
                        ) : (
                          card.hint
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted group-hover:text-blue group-hover:bg-blue-50 transition-colors shrink-0 ml-2">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button & Quick Chat text */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={onOpenContact}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue hover:bg-blue-dark text-text-on-dark font-bold text-sm transition-all duration-200 shadow-md shadow-blue/25 active:scale-95 group shrink-0"
              >
                <span>Let's Talk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-xs sm:text-sm text-text-secondary">
                Prefer a quick chat? I'm usually active on{' '}
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue font-semibold hover:underline"
                >
                  LinkedIn.
                </a>
              </p>
            </div>
          </div>

          {/* Right Column: Desk Photo Card with High-Res Asset & Quote Card (5.5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-card border-4 border-surface-elevated bg-surface-feature group">
              <Image
                src="/images/contact-clean.png"
                alt="Milan Kumawat developer setup"
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Floating Quote Card matching screenshot */}
              <div className="absolute top-5 right-5 sm:top-6 sm:right-6 p-4 sm:p-5 rounded-2xl bg-surface-feature/80 backdrop-blur-md border border-text-on-dark/15 text-text-on-dark shadow-2xl max-w-[190px] sm:max-w-[210px] z-10">
                <span className="text-3xl font-serif text-blue block leading-none select-none">"</span>
                <p className="text-xs sm:text-[13px] font-semibold text-text-on-dark/90 leading-snug mt-1">
                  Same Developer.<br />Bigger Things Ahead.
                </p>
                <div className="w-8 h-0.5 bg-blue mt-2 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
