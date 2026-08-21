import { FaArrowRight } from 'react-icons/fa'
import { freelance } from '../data/content'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Freelance() {
  return (
    <section id="freelance" className="relative overflow-hidden bg-dark-deep py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-accent-pink/12 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading kicker={freelance.kicker} title="FREELANCE &" accent="CLIENT WORK" />
            <Reveal delay={0.08}>
              <p className="mt-5 text-base leading-relaxed text-white/55 sm:text-lg">{freelance.intro}</p>
            </Reveal>

            <Reveal delay={0.15}>
              <button
                onClick={() => scrollTo('contact')}
                className="group mt-8 flex items-center gap-3 rounded-full border border-white/15 py-3 pl-6 pr-3 text-sm font-semibold text-white transition-colors hover:border-white/40"
              >
                {freelance.cta}
                <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-bg transition-transform group-hover:translate-x-1">
                  <FaArrowRight size={11} />
                </span>
              </button>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {freelance.capabilities.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.07} dir="right">
                <div className="h-full rounded-2xl glass glass-hover p-5">
                  <span className="font-mono text-xs text-accent-purple">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-white">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/45">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
