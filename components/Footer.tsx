'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { GithubIcon, LinkedinIcon, XIcon, MailIcon, ResumeIcon } from './icons/SocialIcons';
import { PORTFOLIO_DATA } from '@/data/portfolioData';

interface FooterProps {
  onOpenContact: () => void;
  onOpenResume?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact, onOpenResume }) => {
  const { personal } = PORTFOLIO_DATA;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'subscribed'>('idle');

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Writing', href: '#writing' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStatus('subscribed');
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
      }, 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070A0F] text-white border-t border-slate-800/80 pt-10 pb-6 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-slate-400 uppercase select-none">
            BUILD &nbsp;·&nbsp; SOLVE &nbsp;·&nbsp; LEARN &nbsp;·&nbsp; REPEAT
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available for new opportunities</span>
          </div>
        </div>

        {/* Giant Watermark Headline */}
        <div className="w-full overflow-hidden select-none py-6 sm:py-8 lg:py-10 text-center">
          <div className="text-[8.8vw] xl:text-[138px] font-black tracking-[-0.035em] leading-none uppercase whitespace-nowrap bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-transparent bg-clip-text text-transparent">
            MILAN KUMAWAT
          </div>
        </div>

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 sm:pb-16 items-start">
          {/* Column 1: Brand & Tagline (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-black text-white tracking-tight leading-[1.18]">
              Turning ideas <br />
              <span className="whitespace-nowrap">into <span className="text-blue">real products.</span></span>
            </h2>
            <div className="space-y-1.5 pt-1">
              <p className="text-sm font-semibold text-slate-200">
                AI Engineer <span className="text-slate-500">|</span> Backend Developer
              </p>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                Based in Jaipur, India. Open to exciting projects and opportunities worldwide.
              </p>
            </div>
          </div>

          {/* Column 2: Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400">
              NAVIGATION
            </div>
            <ul className="space-y-2.5 text-sm text-slate-300">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social with Right Divider (2.5 cols) */}
          <div className="lg:col-span-2 space-y-4 lg:border-r lg:border-white/10 lg:pr-6">
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400">
              SOCIAL
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <a
                  href={personal.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition-colors duration-200 group"
                >
                  <GithubIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href={personal.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition-colors duration-200 group"
                >
                  <LinkedinIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href={personal.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition-colors duration-200 group"
                >
                  <XIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span>Twitter / X</span>
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="flex items-center gap-2.5 hover:text-white transition-colors duration-200 text-left group"
                >
                  <MailIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span>Email</span>
                </button>
              </li>
              {onOpenResume && (
                <li>
                  <button
                    onClick={onOpenResume}
                    className="flex items-center gap-2.5 hover:text-white transition-colors duration-200 text-left group"
                  >
                    <ResumeIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    <span>Resume</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Stay In Touch (3.5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400">
              STAY IN TOUCH
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ideas, updates and things I&apos;m building straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="pt-1">
              <div className="relative flex items-center bg-[#101622] border border-white/15 rounded-full p-1.5 focus-within:border-blue transition-colors max-w-md shadow-inner">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-transparent text-sm text-white placeholder-slate-500 px-3.5 py-1.5 focus:outline-none flex-1 min-w-0"
                  required
                />
                <button
                  type="submit"
                  disabled={status === 'subscribed'}
                  className="px-5 py-2.5 rounded-full bg-blue hover:bg-blue/90 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue/25 transition-all shrink-0 active:scale-95 disabled:opacity-90"
                >
                  <span>{status === 'subscribed' ? 'Subscribed!' : 'Subscribe'}</span>
                  {status !== 'subscribed' && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
              {status === 'subscribed' && (
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                  Thanks for subscribing! Check your inbox soon.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 Milan Kumawat. All rights reserved.
          </div>
          <div className="text-slate-400 text-center">
            Built with Next.js, Three.js and a lot of ☕
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#131926] border border-white/15 flex items-center justify-center group-hover:border-white/40 transition-colors">
              <ArrowUp className="w-3.5 h-3.5 text-slate-300 group-hover:text-white group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <span className="text-xs font-medium">Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
