/** Infinite horizontal ticker. The list is rendered twice so the loop is seamless. */
export default function Marquee({ items, speed = 'normal', separator = '✦' }) {
  const anim = speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee'

  return (
    <div className="relative overflow-hidden mask-fade-x">
      <div className={`flex w-max ${anim}`}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center shrink-0" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span key={i} className="flex items-center whitespace-nowrap">
                <span className="px-5 text-sm sm:text-base font-mono uppercase tracking-wider text-white/45">
                  {item}
                </span>
                <span className="text-accent-pink/60 text-xs">{separator}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
