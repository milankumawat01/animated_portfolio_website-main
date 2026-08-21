import { useState } from 'react'
import { FaTelegram, FaWhatsapp, FaInstagram, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { personalInfo, socialLinks } from '../data/content'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'

const socials = [
  { key: 'linkedin', label: 'LinkedIn', Icon: FaLinkedin },
  { key: 'github', label: 'GitHub', Icon: FaGithub },
  { key: 'telegram', label: 'Telegram', Icon: FaTelegram },
  { key: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp },
  { key: 'instagram', label: 'Instagram', Icon: FaInstagram },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  // No backend on this site — hand the message to the visitor's mail client.
  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio enquiry from ${form.name || 'someone'}`)
    const body = encodeURIComponent(`${form.message}\n\n—\n${form.name}\n${form.email}`)
    window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-dark py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute bottom-0 left-1/2 h-[26rem] w-[40rem] -translate-x-1/2 translate-y-1/3 rounded-full bg-accent-purple/18 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading kicker="Contact" title="LET'S BUILD" accent="SOMETHING" />

            <Reveal delay={0.08}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/50">
                Hiring for an AI or backend role, or need something built? Fastest reply is on email or WhatsApp.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-8 space-y-3">
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-4 rounded-xl glass glass-hover p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-bg">
                    <FaEnvelope size={14} className="text-white" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-white/35">Email</span>
                    <span className="block truncate text-sm font-semibold text-white sm:text-base">{personalInfo.email}</span>
                  </span>
                </a>

                <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-4 rounded-xl glass glass-hover p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-bg">
                    <FaPhone size={13} className="text-white" />
                  </span>
                  <span>
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-white/35">Phone</span>
                    <span className="block text-sm font-semibold text-white sm:text-base">{personalInfo.phone}</span>
                  </span>
                </a>

                <div className="flex items-center gap-4 rounded-xl glass p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-bg">
                    <FaMapMarkerAlt size={14} className="text-white" />
                  </span>
                  <span>
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-white/35">Location</span>
                    <span className="block text-sm font-semibold text-white sm:text-base">{personalInfo.address}</span>
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-2">
                {socials.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={socialLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-white/60 transition-colors hover:border-accent-orange/60 hover:text-white"
                  >
                    <Icon size={13} /> {label}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal dir="right" delay={0.1}>
            <form onSubmit={handleSubmit} className="rounded-3xl gradient-bg p-6 sm:p-8 md:p-10">
              <h3 className="text-2xl font-black text-white sm:text-3xl">SEND A MESSAGE</h3>
              <p className="mt-2 text-sm text-white/70">Opens in your mail app, pre-filled.</p>

              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={update('name')}
                    placeholder="NAME"
                    className="w-full border-b border-white/40 bg-transparent py-2 text-sm tracking-wider text-white outline-none transition-colors placeholder:text-white/60 focus:border-white"
                  />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update('email')}
                    placeholder="EMAIL"
                    className="w-full border-b border-white/40 bg-transparent py-2 text-sm tracking-wider text-white outline-none transition-colors placeholder:text-white/60 focus:border-white"
                  />
                </div>

                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={update('message')}
                  placeholder="MESSAGE"
                  className="w-full resize-none border-b border-white/40 bg-transparent py-2 text-sm tracking-wider text-white outline-none transition-colors placeholder:text-white/60 focus:border-white"
                />

                <button
                  type="submit"
                  className="group rounded-full bg-dark-deep px-7 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Send message
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">&#8599;</span>
                </button>
              </div>
            </form>
          </Reveal>
        </div>

        <footer className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            &copy; 2026 {personalInfo.name}. Built with React, Tailwind &amp; Framer Motion.
          </p>
          <a
            href={personalInfo.resume}
            download
            className="font-mono text-xs uppercase tracking-widest text-white/45 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Download resume
          </a>
        </footer>
      </div>
    </section>
  )
}
