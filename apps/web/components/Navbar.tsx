'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface NavbarProps {
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact }) => {
  const [spySection, setSpySection] = useState('home');
  const [pastHero, setPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Sub-pages have no dark hero behind the header, so it is always solid there,
  // and the active link follows the route instead of the scroll-spy.
  const scrolled = isHome ? pastHero : true;
  const activeSection = isHome
    ? spySection
    : pathname.startsWith('/projects') ? 'projects'
    : pathname.startsWith('/blog') ? 'writing'
    : '';

  const navLinks = [
    { label: 'Home', hash: 'home', id: 'home' },
    { label: 'About', hash: 'about', id: 'about' },
    { label: 'Projects', hash: 'projects', id: 'projects' },
    { label: 'Writing', hash: 'writing', id: 'writing' },
    { label: 'Contact', hash: 'contact', id: 'contact' },
  ];

  const linkHref = (hash: string) => isHome ? `#${hash}` : `/#${hash}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      // Threshold for when scrolled past hero
      const heroEl = document.getElementById('home');
      if (heroEl) {
        const heroBottom = heroEl.getBoundingClientRect().bottom;
        setPastHero(heroBottom <= 80);
      } else {
        setPastHero(window.scrollY > 100);
      }

      // Section spy
      const sections = ['home', 'about', 'projects', 'experience', 'skills', 'how-i-build', 'writing', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setSpySection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-elevated/90 backdrop-blur-md border-b border-border shadow-soft py-3 text-text-primary'
          : 'bg-transparent py-5 text-white'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={isHome ? '#home' : '/'} className="flex items-center gap-2.5 group select-none">
          <div className="flex items-center font-extrabold text-2xl tracking-tighter">
            <span className={`transition-colors ${scrolled ? 'text-text-primary group-hover:text-blue' : 'text-white group-hover:text-blue-300'}`}>
              M
            </span>
            <span className="text-blue transition-colors group-hover:opacity-80">
              K
            </span>
          </div>
          <span className={`font-bold text-sm tracking-tight hidden sm:inline-block ${scrolled ? 'text-text-primary' : 'text-white'}`}>
            Milan Kumawat
          </span>
        </Link>

        {/* Desktop Navigation links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={linkHref(link.hash)}
                className={`relative flex flex-col items-center text-[13px] font-semibold transition-colors py-1 ${
                  scrolled
                    ? isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    : isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-blue shadow-xs" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? 'text-text-secondary hover:text-text-primary hover:bg-bg-soft' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onOpenContact}
            className={`hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 group ${
              scrolled
                ? 'bg-ink text-bg-primary hover:bg-blue hover:text-white shadow-xs'
                : 'border border-white/20 bg-white/5 hover:bg-white/10 text-white hover:border-blue/50'
            }`}
          >
            <span>Let's Talk</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-text-primary hover:bg-bg-soft' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-elevated/98 backdrop-blur-xl border-b border-border px-6 py-6 space-y-4 shadow-xl text-text-primary animate-fadeIn">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={linkHref(link.hash)}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-text-primary hover:text-blue py-1.5 flex items-center justify-between"
              >
                <span>{link.label}</span>
                {activeSection === link.id && (
                  <span className="w-2 h-2 rounded-full bg-blue" />
                )}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-border">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue hover:bg-blue-dark text-white font-semibold text-sm transition shadow-sm"
            >
              <span>Let's Talk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
