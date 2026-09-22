'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Mail, Check, Copy, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMutation } from 'convex/react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { api as _api } from '@portfolio/backend/convex/_generated/api';
const api = _api as any; // eslint-disable-line @typescript-eslint/no-explicit-any

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

// ContactFormInner — only rendered after hydration (see isMounted guard below),
// so useMutation is guaranteed to run inside a live ConvexProvider context.
function ContactFormInner({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const submitLead = useMutation(api.leads.submit);

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
      await submitLead({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
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
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Something went wrong. Please try again or email me directly.');
      }
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
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
        <p className="text-slate-600 max-w-sm mx-auto text-sm leading-relaxed">
          Thanks for reaching out! I typically reply within 24 hours. You can also connect directly on LinkedIn.
        </p>
        <button
          onClick={() => {
            setSubmitState('idle');
            setName('');
            setEmail('');
            setMessage('');
            setErrorMsg('');
            onClose();
          }}
          className="mt-4 inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm"
        >
          Close Window
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-extrabold text-slate-900">
          Let&apos;s build something <span className="text-blue-600">great.</span>
        </h3>
        <p className="text-sm text-slate-600 mt-1.5">
          Fill in the details below or copy my direct email.
        </p>

        {/* Direct email pill */}
        <div className="mt-3 flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">hey@milankumawat.in</span>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 transition text-xs font-semibold shrink-0 shadow-2xs"
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
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Developer"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@company.com"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            What would you like to discuss?
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me about your project, idea or question..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition bg-slate-50/50 resize-none"
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
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-md shadow-blue-600/20 disabled:opacity-70"
        >
          {submitState === 'submitting' ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
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
  // isMounted prevents ContactFormInner (which calls useMutation) from rendering
  // during SSR / static prerender — where there is no live ConvexProvider.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Get In Touch
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — ContactFormInner mounts only after hydration */}
        <div className="p-6 sm:p-8">
          {isMounted && <ContactFormInner onClose={onClose} />}
        </div>
      </div>
    </div>
  );
};
