import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-feature text-text-on-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-text-on-dark/5 border border-text-on-dark/10 text-xs font-semibold tracking-label uppercase text-text-on-dark/60">
          <span className="w-1.5 h-1.5 rounded-full bg-blue" />
          <span>Error 404</span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-text-on-dark">
          Page not <span className="text-blue">found.</span>
        </h1>

        <p className="text-text-on-dark/60 text-sm sm:text-base leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to the portfolio.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-text-on-dark text-ink font-bold text-sm hover:bg-blue hover:text-text-on-dark transition-all duration-200 shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
