import { motion } from 'framer-motion'
import { FaPhone, FaEnvelope, FaArrowDown, FaFileDownload } from 'react-icons/fa'
import { personalInfo, heroMarquee } from '../data/content'
import Aurora from '../components/Aurora'
import Marquee from '../components/Marquee'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Home() {
  return (
    <section id="home" className="relative min-h-screen bg-dark-deep flex flex-col justify-between overflow-hidden">
      <Aurora />

      <div className="relative flex-1 flex items-center px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 pt-24 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-10 lg:gap-16 w-full items-center max-w-[1500px] mx-auto">
          {/* Left — headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2.5 mb-6 rounded-full border border-white/12 bg-white/5 px-4 py-1.5 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/70">
                {personalInfo.availability}
              </span>
            </div>

            <h1 className="text-white text-[2.6rem] sm:text-6xl md:text-7xl xl:text-[5.5rem] font-black leading-[0.95] tracking-tight mb-6">
              <span className="block text-glow">MILAN</span>
              <span className="block gradient-text-anim">KUMAWAT</span>
            </h1>

            <p className="font-mono text-sm sm:text-base text-white/60 mb-4">
              <span className="text-accent-orange">$</span> {personalInfo.roleLine}
              <span className="ml-1 inline-block h-4 w-[2px] translate-y-0.5 bg-accent-pink animate-blink" />
            </p>

            <p className="max-w-xl text-base sm:text-lg text-white/50 leading-relaxed mb-8">
              {personalInfo.tagline} Currently at{' '}
              <span className="font-semibold text-white/85">True Value Infosoft</span>, building LLM agents and
              production backends — with AI in the loop, and my own review on every line.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <button
                onClick={() => scrollTo('contact')}
                className="group gradient-bg rounded-full px-7 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.03] active:scale-95"
              >
                Let&apos;s work together
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">&#8599;</span>
              </button>
              <a
                href={personalInfo.resume}
                download
                className="flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/85 transition-colors hover:border-white/40 hover:text-white"
              >
                <FaFileDownload size={13} /> Resume
              </a>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-8 text-sm text-white/45">
              <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-2 transition-colors hover:text-white">
                <FaPhone className="text-accent-orange" size={12} />
                {personalInfo.phone}
              </a>
              <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 transition-colors hover:text-white">
                <FaEnvelope className="text-accent-orange" size={12} />
                {personalInfo.email}
              </a>
            </div>
          </motion.div>

          {/* Right — portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 flex justify-center lg:order-2"
          >
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-accent-orange via-accent-pink to-accent-purple opacity-25 blur-3xl" />

              <div className="relative w-52 sm:w-64 md:w-72 lg:w-full lg:max-w-sm aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10">
                <img
                  src={personalInfo.photo}
                  alt={personalInfo.name}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-deep via-dark-deep/10 to-transparent" />
              </div>

              {/* Floating credential chips */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-4 top-10 hidden rounded-xl glass px-3.5 py-2 sm:block"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent-orange">Now</p>
                <p className="text-xs font-semibold text-white">AI Engineer</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-4 bottom-16 hidden rounded-xl glass px-3.5 py-2 sm:block"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent-purple">Studying</p>
                <p className="text-xs font-semibold text-white">M.Tech AI/ML · BITS</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="relative border-y border-line bg-white/[0.02] py-4">
        <Marquee items={heroMarquee} />
      </div>

      <button
        onClick={() => scrollTo('about')}
        className="relative mx-auto flex items-center gap-2 py-5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/35 transition-colors hover:text-white"
      >
        Scroll <FaArrowDown className="animate-bounce" size={10} />
      </button>
    </section>
  )
}
