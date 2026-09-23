'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowUp } from 'lucide-react';

export const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'subscribed'>('idle');

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

  return (
    <form onSubmit={handleSubscribe} className="pt-1">
      <div className="relative flex items-center bg-surface-well border border-text-on-dark/15 rounded-full p-1.5 focus-within:border-blue transition-colors max-w-md shadow-inner">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="bg-transparent text-sm text-text-on-dark placeholder-text-on-dark/40 px-3.5 py-1.5 focus:outline-none flex-1 min-w-0"
          required
        />
        <button
          type="submit"
          disabled={status === 'subscribed'}
          className="px-5 py-2.5 rounded-full bg-blue hover:bg-blue/90 text-text-on-dark font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue/25 transition-all shrink-0 active:scale-95 disabled:opacity-90"
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
  );
};

export const BackToTopButton: React.FC = () => (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="flex items-center gap-2 text-text-on-dark/80 hover:text-text-on-dark transition-colors group cursor-pointer"
  >
      <div className="w-7 h-7 rounded-full bg-surface-well border border-text-on-dark/15 flex items-center justify-center group-hover:border-text-on-dark/40 transition-colors">
        <ArrowUp className="w-3.5 h-3.5 text-text-on-dark/80 group-hover:text-text-on-dark group-hover:-translate-y-0.5 transition-transform" />
    </div>
    <span className="text-xs font-medium">Back to top</span>
  </button>
);
