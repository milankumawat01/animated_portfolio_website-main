'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, CheckCircle2, Layers, Cpu, BarChart2 } from 'lucide-react';
import { GithubIcon } from '../icons/SocialIcons';
import type { ProjectDoc } from '@/lib/convex';
import { TechBadge } from '../ui/TechBadge';

interface ProjectModalProps {
  project: ProjectDoc | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-surface-overlay backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-surface-elevated rounded-2xl shadow-2xl border border-border overflow-hidden transform transition-all my-8 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-soft/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue bg-blue-light px-2.5 py-1 rounded-md border border-blue/20">
              Case Study
            </span>
            <span className="text-sm font-semibold text-text-secondary">{project.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-soft transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Banner Image Preview */}
          <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden border border-border bg-surface-well shadow-inner group">
            {project.imageUrl && <Image
              src={project.imageUrl}
              alt={project.title}
              fill sizes="(max-width: 767px) 90vw, 704px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-feature/80 via-transparent to-transparent flex items-end p-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-text-on-dark tracking-tight">
                  {project.title}
                </h3>
                <p className="text-text-on-dark/80 font-medium text-sm sm:text-base">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Overview
            </h4>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              {project.longDescription}
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue" />
              Key Features & Capabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-bg-soft border border-border text-xs sm:text-sm text-text-secondary"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue mt-2 shrink-0"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Architecture */}
          {project.architecture && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue" />
                Technical Architecture
              </h4>
              <ul className="space-y-2">
                {project.architecture.map((arch, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary"
                  >
                    <Cpu className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
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
                  className="p-4 rounded-xl bg-blue-light/50 border border-blue/20 text-center"
                >
                  <div className="text-xl sm:text-2xl font-black text-blue">
                    {s.value}
                  </div>
                  <div className="text-2xs sm:text-xs font-medium text-text-secondary mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue hover:bg-blue-dark text-text-on-dark font-semibold text-sm transition shadow-sm shadow-blue/20"
              >
                <span>Live Preview</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-soft hover:bg-border text-text-primary font-semibold text-sm transition"
              >
                <GithubIcon className="w-4 h-4" />
                <span>Source Repository</span>
              </a>
            )}
            <Link
              href={`/projects/${project.slug}`}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-border hover:border-blue/40 text-text-secondary hover:text-blue font-semibold text-sm transition"
              onClick={onClose}
            >
              Full case study →
            </Link>
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
