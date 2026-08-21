import Reveal from './Reveal'

export default function SectionHeading({ kicker, title, accent, align = 'left', light = false }) {
  return (
    <Reveal className={align === 'center' ? 'text-center' : ''}>
      {kicker && (
        <p className="flex items-center gap-3 mb-3 text-[11px] font-mono uppercase tracking-[0.25em] text-accent-orange">
          {align !== 'center' && <span className="h-px w-8 bg-gradient-to-r from-accent-orange to-transparent" />}
          {kicker}
        </p>
      )}
      <h2
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight ${
          light ? 'text-black' : 'text-white'
        }`}
      >
        {title}
        {accent && <span className="gradient-text-anim"> {accent}</span>}
      </h2>
    </Reveal>
  )
}
