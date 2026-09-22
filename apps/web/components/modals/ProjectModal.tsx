'use client';

import React from 'react';
import Image from 'next/image';
import { X, ExternalLink, CheckCircle2, Layers, Cpu, BarChart2 } from 'lucide-react';
import { GithubIcon } from '../icons/SocialIcons';
import { ProjectItem } from '@/data/portfolioData';
import { TechBadge } from '../ui/TechBadge';

interface ProjectModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              Case Study
            </span>
            <span className="text-sm font-semibold text-slate-700">{project.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Banner Image Preview */}
          <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {project.title}
                </h3>
                <p className="text-blue-300 font-medium text-sm sm:text-base">
                  {project.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <TechBadge key={tag} name={tag} variant="blue" />
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overview
            </h4>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {project.longDescription}
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Key Features & Capabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Architecture */}
          {project.architecture && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Technical Architecture
              </h4>
              <ul className="space-y-2">
                {project.architecture.map((arch, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600"
                  >
                    <Cpu className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{arch}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metrics / Stats */}
          {project.stats && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {project.stats.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/80 text-center"
                >
                  <div className="text-xl sm:text-2xl font-black text-blue-700">
                    {s.value}
                  </div>
                  <div className="text-2xs sm:text-xs font-medium text-slate-600 mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm shadow-blue-600/20"
            >
              <span>Live Preview</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Source Repository</span>
            </a>
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
