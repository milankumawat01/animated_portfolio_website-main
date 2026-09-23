'use client';

import React from 'react';
import { X, Download, FileText, Briefcase, GraduationCap, Code2, MapPin, Mail, Globe } from 'lucide-react';
import { PORTFOLIO_DATA } from '@/data/portfolioData';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrintDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-surface-overlay backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-surface-elevated rounded-2xl shadow-2xl border border-border overflow-hidden transform transition-all my-8 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-soft/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Curriculum Vitae • Milan Kumawat
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue hover:bg-blue-dark text-text-on-dark font-medium text-xs transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-soft transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Resume Content */}
        <div className="p-6 sm:p-10 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none">
          {/* Header */}
          <div className="border-b border-border pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
                  Milan Kumawat
                </h1>
                <p className="text-blue font-semibold text-sm sm:text-base mt-0.5">
                  AI Engineer & Backend Developer
                </p>
              </div>
              <div className="text-xs text-text-secondary space-y-1 sm:text-right">
                <div className="flex items-center sm:justify-end gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" />
                  <span>Jaipur, Rajasthan, India</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span>hey@milankumawat.in</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-text-muted" />
                  <span>milankumawat.in</span>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-4 leading-relaxed">
              {PORTFOLIO_DATA.personal.bio}
            </p>
          </div>

          {/* Work Experience */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 border-b border-border pb-1.5">
              <Briefcase className="w-4 h-4 text-blue" />
              Work Experience
            </h3>

            <div className="space-y-4">
              {PORTFOLIO_DATA.experience.map((exp) => (
                <div key={exp.id} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <h4 className="font-bold text-text-primary text-sm sm:text-base">
                      {exp.role}{' '}
                      <span className="font-medium text-text-muted">@ {exp.company}</span>
                    </h4>
                    <span className="text-xs font-semibold text-blue bg-blue-light px-2 py-0.5 rounded">
                      {exp.badge}
                    </span>
                  </div>
                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs sm:text-sm text-text-secondary">
                    {exp.points.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Core Skills */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 border-b border-border pb-1.5">
              <Code2 className="w-4 h-4 text-blue" />
              Technical Stack & Competencies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="font-bold text-text-primary">Languages & AI: </span>
                <span className="text-text-secondary">Python, JavaScript, TypeScript, OpenAI API, LangChain, RAG, Claude, Gemini</span>
              </div>
              <div>
                <span className="font-bold text-text-primary">Backend & DB: </span>
                <span className="text-text-secondary">FastAPI, Node.js, Express, PostgreSQL, MongoDB, Redis, Supabase</span>
              </div>
              <div>
                <span className="font-bold text-text-primary">Frontend: </span>
                <span className="text-text-secondary">Next.js, React, Tailwind CSS, HTML5, CSS3</span>
              </div>
              <div>
                <span className="font-bold text-text-primary">DevOps & Cloud: </span>
                <span className="text-text-secondary">Docker, Nginx, Vercel, DigitalOcean, Cloudflare R2, Linux/Ubuntu</span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 border-b border-border pb-1.5">
              <GraduationCap className="w-4 h-4 text-blue" />
              Education
            </h3>
            <div className="flex justify-between items-start text-xs sm:text-sm">
              <div>
                <div className="font-bold text-text-primary">Bachelor of Computer Applications / CS</div>
                <div className="text-text-muted">University of Rajasthan • Jaipur, India</div>
              </div>
              <span className="text-xs text-text-muted font-medium">2021 – 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
