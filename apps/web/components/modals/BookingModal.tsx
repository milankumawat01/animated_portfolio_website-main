'use client';

import React, { useMemo, useState } from 'react';
import { X, ArrowLeft, Check, AlertCircle, CalendarDays, Clock } from 'lucide-react';
import { api as _api } from '@portfolio/backend/convex/_generated/api';
import { convexMutation } from '@/lib/convex-http';
const api = _api as any;

const HERMES_CONTACT_URL = 'https://hermes.rovezi.tech/contact';
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const SERVICES = ['Website', 'Booking system', 'WhatsApp automation', 'Online catalogue', 'AI voice bot', 'Other'];

type Day = { key: string; label: string; weekday: string; day: number; slots: string[] };

// Mon–Sat, 11:00–19:00 IST, 15-min slots, next 14 days. Computed in IST whatever the visitor's timezone.
export function buildDays(nowMs = Date.now()): Day[] {
  const istNow = new Date(nowMs + IST_OFFSET_MS); // read with getUTC* = IST wall clock
  const minutesNow = istNow.getUTCHours() * 60 + istNow.getUTCMinutes();
  const days: Day[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + i));
    if (d.getUTCDay() === 0) continue; // Sunday closed
    const slots: string[] = [];
    for (let m = 11 * 60; m < 19 * 60; m += 15) {
      if (i === 0 && m <= minutesNow + 60) continue; // today: at least an hour's notice
      slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    }
    if (!slots.length) continue;
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }),
      day: d.getUTCDate(),
      slots,
    });
  }
  return days;
}

const to12h = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

const inputCls = 'mt-1.5 w-full px-4 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition bg-bg-soft text-text-primary';
const labelCls = 'block text-xs font-semibold text-text-secondary';

type State = 'idle' | 'submitting' | 'success' | 'error' | 'ratelimited';

export function BookingModal({ onClose }: { onClose: () => void }) {
  const days = useMemo(() => buildDays(), []);
  const [dayKey, setDayKey] = useState(days[0]?.key ?? '');
  const [time, setTime] = useState('');
  const [step, setStep] = useState<'slot' | 'details'>('slot');
  const [form, setForm] = useState({ name: '', phone: '', email: '', business: '', service: SERVICES[0], message: '', website: '' });
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const day = days.find((d) => d.key === dayKey);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.includes('@')) {
      setErrorMsg('Naam, phone aur email zaroori hai. / Name, phone and email are required.');
      setState('error');
      return;
    }
    setState('submitting');
    setErrorMsg('');

    const business = form.business.trim();
    const subject = `📅 Booking: ${day?.label} ${to12h(time)} IST${business ? ` — ${business}` : ''}`.slice(0, 150);
    const message = [
      `Meeting: ${day?.label} ${dayKey}, ${to12h(time)} IST (15 min)`,
      `Service: ${form.service}`,
      business && `Business: ${business}`,
      form.message.trim() && `\n${form.message.trim()}`,
    ].filter(Boolean).join('\n');

    // Admin Leads (Convex) and Telegram (Hermes) are independent: either one landing means the request is safe.
    const [saved, hermes] = await Promise.allSettled([
      convexMutation(api.leads.submit, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: business || undefined,
        subject,
        message,
        source: 'contact-modal',
        honeypot: form.website,
        meta: { userAgent: navigator.userAgent, referrer: document.referrer, path: '/book' },
      }),
      fetch(HERMES_CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), subject, message, website: form.website }),
      }),
    ]);

    const hermesOk = hermes.status === 'fulfilled' && hermes.value.ok;
    if (saved.status === 'fulfilled' || hermesOk) return setState('success');
    if (hermes.status === 'fulfilled' && hermes.value.status === 429) return setState('ratelimited');
    setErrorMsg(saved.status === 'rejected' && saved.reason instanceof Error ? saved.reason.message : '');
    setState('error');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-surface-overlay backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Book a free 15-min call"
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-2">
            {step === 'details' && state !== 'success' && (
              <button onClick={() => setStep('slot')} className="p-1 -ml-1 rounded-full text-text-muted hover:text-text-primary" aria-label="Back to slots">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Book a meeting</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-soft transition-colors" aria-label="Close dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7">
          {state === 'success' ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-blue-light text-blue rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-light/50">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary">Request mil gayi!</h3>
              <p className="text-text-secondary text-sm">
                {day?.label}, {to12h(time)} IST. Milan aapko WhatsApp pe confirm karenge.
              </p>
              <button onClick={onClose} className="mt-2 px-6 py-2.5 rounded-full bg-blue text-text-on-dark font-medium hover:bg-blue-dark transition">
                Close
              </button>
            </div>
          ) : step === 'slot' ? (
            <div>
              <h3 className="text-2xl font-extrabold text-text-primary">Book a free 15-min call with <span className="text-blue">Milan</span></h3>
              <p className="text-sm text-text-secondary mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue" />15 min · Google Meet / WhatsApp</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-blue" />Mon–Sat, 11 AM–7 PM IST</span>
              </p>

              <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Date chuniye / Pick a date</p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {days.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => { setDayKey(d.key); setTime(''); }}
                    className={`shrink-0 w-16 py-2.5 rounded-xl border text-center transition ${d.key === dayKey ? 'bg-blue text-text-on-dark border-blue' : 'border-border bg-bg-soft text-text-primary hover:border-blue/60'}`}
                  >
                    <span className="block text-[11px] font-semibold uppercase opacity-80">{d.weekday}</span>
                    <span className="block text-lg font-bold leading-tight">{d.day}</span>
                  </button>
                ))}
              </div>

              <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Time (IST) · {day?.label}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {day?.slots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`py-2 rounded-lg border text-sm font-semibold transition ${t === time ? 'bg-blue text-text-on-dark border-blue' : 'border-border text-text-primary hover:border-blue hover:text-blue'}`}
                  >
                    {to12h(t)}
                  </button>
                ))}
              </div>

              <button
                disabled={!time}
                onClick={() => setStep('details')}
                className="mt-6 w-full py-3 rounded-xl bg-blue hover:bg-blue-dark text-text-on-dark font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {time ? `Continue — ${day?.label}, ${to12h(time)}` : 'Select a time'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-bg-soft border border-border text-sm font-semibold text-text-primary flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue" /> {day?.label}, {to12h(time)} IST · 15 min
              </div>

              {/* Honeypot: hidden from humans, always empty for real visitors */}
              <input type="text" name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true"
                style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1 }} />

              <label className={labelCls}>Naam / Name *
                <input required maxLength={100} value={form.name} onChange={set('name')} className={inputCls} autoComplete="name" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={labelCls}>Phone / WhatsApp *
                  <input required type="tel" maxLength={40} value={form.phone} onChange={set('phone')} placeholder="+91 98xxxxxxxx" className={inputCls} autoComplete="tel" />
                </label>
                <label className={labelCls}>Email *
                  <input required type="email" maxLength={254} value={form.email} onChange={set('email')} className={inputCls} autoComplete="email" />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={labelCls}>Business ka naam
                  <input maxLength={120} value={form.business} onChange={set('business')} className={inputCls} autoComplete="organization" />
                </label>
                <label className={labelCls}>Kis cheez mein help chahiye?
                  <select value={form.service} onChange={set('service')} className={inputCls}>
                    {SERVICES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <label className={labelCls}>Message
                <textarea rows={3} maxLength={4000} value={form.message} onChange={set('message')} placeholder="Apne kaam ke baare mein thoda batayein…" className={`${inputCls} resize-none`} />
              </label>

              {state === 'ratelimited' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> Thodi der baad try karein. / Please try again in a little while.
                </div>
              )}
              {state === 'error' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {errorMsg || 'Request nahi ja payi.'} Seedha message karein:{' '}
                    <a className="underline" href={`mailto:milankumawat01@gmail.com?subject=${encodeURIComponent(`Booking: ${day?.label} ${to12h(time)} IST`)}`}>milankumawat01@gmail.com</a>
                    {' '}ya <a className="underline" href="https://linkedin.com/in/milankumawat" target="_blank" rel="noopener noreferrer">LinkedIn</a>.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={state === 'submitting'}
                className="w-full py-3 rounded-xl bg-blue hover:bg-blue-dark text-text-on-dark font-semibold text-sm transition shadow-md shadow-blue/20 disabled:opacity-70"
              >
                {state === 'submitting' ? 'Booking…' : 'Confirm booking request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
