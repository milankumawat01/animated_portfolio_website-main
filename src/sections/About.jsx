import { FaGraduationCap, FaBriefcase } from 'react-icons/fa'
import {
  personalInfo, stats, aboutIntro, aboutApproach, quote, experience, education,
} from '../data/content'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import Counter from '../components/Counter'
import Aurora from '../components/Aurora'

export default function About() {
  return (
    <section id="about" className="relative bg-dark py-24 sm:py-28">
      <Aurora variant="soft" />

      <div className="relative mx-auto max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <SectionHeading kicker="About" title="WHO I" accent="AM" />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <Reveal delay={0.05}>
              <p className="text-base sm:text-lg leading-relaxed text-white/60">{aboutIntro}</p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/60">{aboutApproach}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl glass glass-hover p-4">
                    <p className="text-3xl font-black gradient-text sm:text-4xl">
                      <Counter value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{s.label}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/40">{s.sub}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <blockquote className="relative mt-8 overflow-hidden rounded-2xl gradient-bg p-6 sm:p-7">
                <span className="absolute -top-2 left-4 font-serif text-7xl leading-none text-white/25">&ldquo;</span>
                <p className="relative text-sm italic leading-relaxed text-white sm:text-base">{quote}</p>
              </blockquote>
            </Reveal>
          </div>

          {/* Right rail — quick facts */}
          <Reveal dir="right" delay={0.1}>
            <div className="rounded-2xl glass p-6 sm:p-7">
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-accent-orange">
                Quick facts
              </p>
              <dl className="space-y-4 text-sm">
                {[
                  ['Name', personalInfo.name],
                  ['Role', personalInfo.title],
                  ['Based in', personalInfo.address],
                  ['Email', personalInfo.email],
                  ['Phone', personalInfo.phone],
                  ['Studying', 'M.Tech AI/ML — BITS Pilani'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0">
                    <dt className="shrink-0 text-white/40">{k}</dt>
                    <dd className="text-right font-medium text-white/90 break-all">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7">
                <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent-purple">
                  <FaGraduationCap size={12} /> Education
                </p>
                {education.map((e) => (
                  <div key={e.degree} className="mb-4 border-l-2 border-accent-purple/40 pl-4 last:mb-0">
                    <p className="font-mono text-[11px] text-white/40">{e.period}</p>
                    <p className="text-sm font-semibold text-white">{e.degree}</p>
                    <p className="text-xs text-white/55">{e.institution}</p>
                    {e.details && <p className="mt-0.5 text-[11px] text-white/35">{e.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Experience timeline */}
        <div className="mt-20">
          <Reveal>
            <p className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent-orange">
              <FaBriefcase size={12} /> Experience
            </p>
          </Reveal>

          <div className="relative border-l border-line pl-6 sm:pl-10">
            {experience.map((exp, i) => (
              <Reveal key={exp.role + exp.period} delay={i * 0.06} className="group relative pb-10 last:pb-0">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full gradient-bg ring-4 ring-dark sm:-left-[47px]" />

                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-lg font-black tracking-tight text-white sm:text-xl md:text-2xl">
                    {exp.role}
                  </h3>
                  <span className="font-mono text-xs text-accent-orange">{exp.period}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-white/70">{exp.company}</p>
                <p className="text-xs italic text-white/35">{exp.description}</p>

                {exp.points && (
                  <ul className="mt-3 space-y-1.5">
                    {exp.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-white/50">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-pink" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
