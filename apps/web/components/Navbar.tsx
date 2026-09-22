'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenContact }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Projects', href: '#projects', id: 'projects' },
    { label: 'Writing', href: '#writing', id: 'writing' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Threshold for when scrolled past hero
      const heroEl = document.getElementById('home');
      if (heroEl) {
        const heroBottom = heroEl.getBoundingClientRect().bottom;
        setScrolled(heroBottom <= 80);
      } else {
        setScrolled(window.scrollY > 100);
      }

      // Section spy
      const sections = ['home', 'about', 'projects', 'experience', 'skills', 'how-i-build', 'writing', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-[#E4E9F1] shadow-soft py-3 text-ink'
          : 'bg-transparent py-5 text-white'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-2.5 group select-none">
          <div className="flex items-center font-extrabold text-2xl tracking-tighter">
            <span className={`transition-colors ${scrolled ? 'text-ink group-hover:text-blue' : 'text-white group-hover:text-blue-300'}`}>
              M
            </span>
            <span className="text-blue transition-colors group-hover:opacity-80">
              K
            </span>
          </div>
          <span className={`font-bold text-sm tracking-tight hidden sm:inline-block ${scrolled ? 'text-ink' : 'text-white'}`}>
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
                href={link.href}
                className={`relative flex flex-col items-center text-[13px] font-semibold transition-colors py-1 ${
                  scrolled
                    ? isActive ? 'text-ink' : 'text-text-secondary hover:text-ink'
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
          <button
            onClick={onOpenContact}
            className={`hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 group ${
              scrolled
                ? 'bg-ink text-white hover:bg-blue shadow-xs'
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
              scrolled ? 'text-ink hover:bg-slate-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-[#E4E9F1] px-6 py-6 space-y-4 shadow-xl text-ink animate-fadeIn">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-blue py-1.5 flex items-center justify-between"
              >
                <span>{link.label}</span>
                {activeSection === link.id && (
                  <span className="w-2 h-2 rounded-full bg-blue" />
                )}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-100">
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
