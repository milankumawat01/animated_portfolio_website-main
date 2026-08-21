import { skillGroups } from '../data/content'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'

export default function Stack() {
  return (
    <section id="stack" className="relative bg-dark py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1500px] px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading kicker="Toolkit" title="TECH" accent="STACK" />
          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed text-white/40">
              Everything below is something I&apos;ve shipped with — not a list of tutorials I&apos;ve watched.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {skillGroups.map((group, i) => (
            <Reveal key={group.label} delay={i * 0.05}>
              <div
                className={`h-full rounded-2xl p-6 transition-colors ${
                  group.highlight
                    ? 'border border-accent-pink/25 bg-gradient-to-br from-accent-pink/10 to-accent-purple/5'
                    : 'glass glass-hover'
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white">
                    {group.label}
                  </h3>
                  {group.highlight && (
                    <span className="rounded-full gradient-bg px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white">
                      core
                    </span>
                  )}
                  <span className="h-px flex-1 bg-line" />
                  <span className="font-mono text-[11px] text-white/25">{group.items.length}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-accent-orange/50 hover:text-white"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
