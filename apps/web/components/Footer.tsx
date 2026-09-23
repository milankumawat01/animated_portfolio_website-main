import React from 'react';
import { GithubIcon, LinkedinIcon, XIcon, MailIcon, ResumeIcon } from './icons/SocialIcons';
import { OpenContactButton, OpenResumeButton } from './modals/ModalTriggers';
import { BackToTopButton, NewsletterForm } from './FooterIslands';
import type { SiteSettingsDoc } from '@/lib/convex';

interface FooterProps {
  settings: SiteSettingsDoc | null;
  // On `/` the nav links are in-page anchors; elsewhere they go back to `/`.
  isHome: boolean;
}

export const Footer: React.FC<FooterProps> = ({ settings, isHome }) => {
  const navLinks = [
    { label: 'Home', href: isHome ? '#home' : '/#home' },
    { label: 'About', href: isHome ? '#about' : '/#about' },
    { label: 'Projects', href: isHome ? '#projects' : '/#projects' },
    { label: 'Experience', href: isHome ? '#experience' : '/#experience' },
    { label: 'Writing', href: isHome ? '#writing' : '/#writing' },
    { label: 'Contact', href: isHome ? '#contact' : '/#contact' },
  ];

  const githubUrl = settings?.personal?.githubUrl ?? 'https://github.com/milankumawat';
  const linkedinUrl = settings?.personal?.linkedinUrl ?? 'https://linkedin.com/in/milankumawat';
  const twitterUrl = settings?.personal?.twitterUrl ?? 'https://x.com/milankumawat';

  return (
    <footer className="bg-surface-feature text-text-on-dark border-t border-border-dark pt-10 pb-6 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
        {/* Top Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-text-on-dark/5">
            <div className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-text-on-dark/40 uppercase select-none">
            BUILD &nbsp;·&nbsp; SOLVE &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; REPEAT
          </div>
            <div className="flex items-center gap-2 text-xs text-text-on-dark/80 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available for new opportunities</span>
          </div>
        </div>

        {/* Giant Watermark Headline */}
        <div className="w-full overflow-hidden select-none py-6 sm:py-8 lg:py-10 text-center">
          <div className="text-[8.8vw] xl:text-[138px] font-black tracking-[-0.035em] leading-none uppercase whitespace-nowrap bg-gradient-to-b from-text-on-dark/[0.12] via-text-on-dark/[0.05] to-transparent bg-clip-text text-transparent">
            MILAN KUMAWAT
          </div>
        </div>

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 sm:pb-16 items-start">
          {/* Column 1: Brand & Tagline (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-black text-text-on-dark tracking-tight leading-[1.18]">
              Turning ideas <br />
              <span className="whitespace-nowrap">into <span className="text-blue">real products.</span></span>
            </h2>
            <div className="space-y-1.5 pt-1">
              <p className="text-sm font-semibold text-text-on-dark/90">
                AI Engineer <span className="text-text-on-dark/40">|</span> Backend Developer
              </p>
              <p className="text-xs sm:text-sm text-text-on-dark/60 leading-relaxed max-w-sm">
                Based in Jaipur, India. Open to exciting projects and opportunities worldwide.
              </p>
            </div>
          </div>

          {/* Column 2: Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-text-on-dark/40">
              NAVIGATION
            </div>
            <ul className="space-y-2.5 text-sm text-text-on-dark/80">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="hover:text-text-on-dark hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social with Right Divider (2.5 cols) */}
          <div className="lg:col-span-2 space-y-4 lg:border-r lg:border-text-on-dark/10 lg:pr-6">
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-text-on-dark/40">
              SOCIAL
            </div>
            <ul className="space-y-3 text-sm text-text-on-dark/80">
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-text-on-dark transition-colors duration-200 group"
                >
                  <GithubIcon className="w-4 h-4 text-text-on-dark/40 group-hover:text-text-on-dark transition-colors" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-text-on-dark transition-colors duration-200 group"
                >
                  <LinkedinIcon className="w-4 h-4 text-text-on-dark/40 group-hover:text-text-on-dark transition-colors" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-text-on-dark transition-colors duration-200 group"
                >
                  <XIcon className="w-4 h-4 text-text-on-dark/40 group-hover:text-text-on-dark transition-colors" />
                  <span>Twitter / X</span>
                </a>
              </li>
              <li>
                <OpenContactButton
                  className="flex items-center gap-2.5 hover:text-text-on-dark transition-colors duration-200 text-left group"
                >
                  <MailIcon className="w-4 h-4 text-text-on-dark/40 group-hover:text-text-on-dark transition-colors" />
                  <span>Email</span>
                </OpenContactButton>
              </li>
              <li>
                <OpenResumeButton
                  className="flex items-center gap-2.5 hover:text-text-on-dark transition-colors duration-200 text-left group"
                >
                  <ResumeIcon className="w-4 h-4 text-text-on-dark/40 group-hover:text-text-on-dark transition-colors" />
                  <span>Resume</span>
                </OpenResumeButton>
              </li>
            </ul>
          </div>

          {/* Column 4: Stay In Touch (3.5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-text-on-dark/40">
              STAY IN TOUCH
            </div>
            <p className="text-xs sm:text-sm text-text-on-dark/80 leading-relaxed">
              Ideas, updates and things I&apos;m building straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-text-on-dark/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-on-dark/40">
          <div>
            © 2026 Milan Kumawat. All rights reserved.
          </div>
          <div className="text-text-on-dark/40 text-center">
            Built with Next.js, Three.js and a lot of ☕
          </div>
          <BackToTopButton />
        </div>
      </div>
    </footer>
  );
};
