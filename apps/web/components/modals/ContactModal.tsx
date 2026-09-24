'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Mail, Check, Copy, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api as _api } from '@portfolio/backend/convex/_generated/api';
import { errorMessage } from '@/lib/errors';
import { convexMutation } from '@/lib/convex-http';
const api = _api as any;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

// ContactFormInner — only rendered after hydration (see isMounted guard below).
// Submits with a single HTTP request; no Convex WebSocket is opened.
function ContactFormInner({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);


  // Client-side validation (mirrors server for fast feedback)
  function validate(): string | null {
    if (!name.trim()) return 'Please enter your name.';
    if (name.trim().length > 100) return 'Name must be 100 characters or fewer.';
    if (!email.includes('@')) return 'Please enter a valid email address.';
    if (email.length > 254) return 'Email address is too long.';
    if (message.trim().length < 10) return 'Message must be at least 10 characters.';
    if (message.length > 5000) return 'Message must be 5,000 characters or fewer.';
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      setSubmitState('error');
      return;
    }

    setSubmitState('submitting');
    setErrorMsg('');

    try {
      await convexMutation(api.leads.submit, {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        subject: subject.trim() || undefined,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        source: 'contact-modal',
        honeypot,
        meta: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          path: window.location.pathname,
        },
      });

      setSubmitState('success');
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Fallback if canvas is unavailable
      }
    } catch (err: unknown) {
      setSubmitState('error');
      setErrorMsg(errorMessage(err, 'Something went wrong. Please try again or email me directly.'));
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('hey@milankumawat.in');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitState === 'success') {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-blue-light text-blue rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-light/50">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary">Message Sent!</h3>
        <p className="text-text-secondary max-w-sm mx-auto text-sm leading-relaxed">
          Thanks for reaching out! I typically reply within 24 hours. You can also connect directly on LinkedIn.
        </p>
        <button
          onClick={() => {
            setSubmitState('idle');
            setName('');
            setEmail('');
            setMessage('');
            setSubject(''); setPhone(''); setCompany('');
            setErrorMsg('');
            onClose();
          }}
          className="mt-4 inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-blue text-text-on-dark font-medium hover:bg-blue-dark transition shadow-sm"
        >
          Close Window
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-extrabold text-text-primary">
          Let&apos;s build something <span className="text-blue">great.</span>
        </h3>
        <p className="text-sm text-text-secondary mt-1.5">
          Fill in the details below or copy my direct email.
        </p>

        {/* Direct email pill */}
        <div className="mt-3 flex items-center justify-between p-2.5 bg-bg-soft rounded-xl border border-border text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-text-secondary font-medium truncate">
            <Mail className="w-4 h-4 text-blue shrink-0" />
            <span className="truncate">hey@milankumawat.in</span>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="flex items-center gap-1 px-3 py-1 bg-surface-elevated border border-border rounded-lg text-text-secondary hover:text-blue hover:border-blue/50 transition text-xs font-semibold shrink-0 shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot — hidden from humans, visible to bots */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}
          aria-hidden="true"
        />

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Developer"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition bg-bg-soft"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@company.com"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition bg-bg-soft"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-text-secondary">Phone (optional)
            <input type="tel" maxLength={40} value={phone} onChange={e => setPhone(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-bg-soft" />
          </label>
          <label className="text-xs font-semibold text-text-secondary">Company (optional)
            <input maxLength={120} value={company} onChange={e => setCompany(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-bg-soft" />
          </label>
        </div>
        <label className="block text-xs font-semibold text-text-secondary">Subject (optional)
          <input maxLength={150} value={subject} onChange={e => setSubject(e.target.value)} className="mt-1.5 w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-bg-soft" />
        </label>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            What would you like to discuss?
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me about your project, idea or question..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition bg-bg-soft resize-none"
          />
        </div>

        {/* Error message */}
        {submitState === 'error' && errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue hover:bg-blue-dark text-text-on-dark font-semibold text-sm transition-colors shadow-md shadow-blue/20 disabled:opacity-70"
        >
          {submitState === 'submitting' ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-text-on-dark" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            <>
              <span>Send Message</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  // isMounted keeps ContactFormInner (which reads navigator/document on submit)
  // out of SSR / static prerender.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setIsMounted(true), 0); return () => window.clearTimeout(timer); }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-overlay backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-surface-elevated rounded-2xl shadow-2xl border border-border overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-soft/70">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Get In Touch
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-soft transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — ContactFormInner mounts only after hydration */}
        <div className="p-6 sm:p-8">
          {isMounted && (
            <ContactFormInner onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
};
