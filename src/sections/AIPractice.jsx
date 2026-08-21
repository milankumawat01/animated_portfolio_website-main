import { FaCheck } from 'react-icons/fa'
import { aiPractice } from '../data/content'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'

export default function AIPractice() {
  return (
    <section id="ai" className="relative overflow-hidden bg-dark-deep py-24 sm:py-28">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute left-1/2 top-0 h-[30rem] w-[45rem] -translate-x-1/2 rounded-full bg-accent-purple/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <div className="max-w-3xl">
          <SectionHeading kicker={aiPractice.kicker} title="AI-ASSISTED" accent="ENGINEERING" />
          <Reveal delay={0.08}>
            <p className="mt-5 text-base leading-relaxed text-white/55 sm:text-lg">{aiPractice.intro}</p>
          </Reveal>
        </div>

        {/* Pillars */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {aiPractice.pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07}>
              <article className="group relative h-full overflow-hidden rounded-2xl glass glass-hover gradient-border p-6 sm:p-7">
                <span className="font-mono text-xs text-accent-orange/70">
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-accent-pink/80">
                  {p.tools}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/50">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Principles */}
        <Reveal delay={0.1}>
          <div className="mt-8 rounded-2xl border border-line bg-white/[0.02] p-6 sm:p-8">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-accent-purple">
              Working principles
            </p>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {aiPractice.principles.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-white/60">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-bg">
                    <FaCheck size={9} className="text-white" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
