/** Ambient gradient blobs + dot grid used behind dark sections. */
export default function Aurora({ variant = 'default' }) {
  const blobs =
    variant === 'soft'
      ? [
          { c: 'bg-accent-purple/15', s: 'w-[38rem] h-[38rem]', p: '-top-40 -right-40', d: '' },
          { c: 'bg-accent-orange/10', s: 'w-[30rem] h-[30rem]', p: '-bottom-40 -left-32', d: 'animation-delay-2000' },
        ]
      : [
          { c: 'bg-accent-orange/25', s: 'w-[34rem] h-[34rem]', p: 'top-[-10%] left-[-8%]', d: '' },
          { c: 'bg-accent-pink/20', s: 'w-[30rem] h-[30rem]', p: 'bottom-[-15%] right-[-5%]', d: '' },
          { c: 'bg-accent-purple/20', s: 'w-[26rem] h-[26rem]', p: 'top-[35%] right-[25%]', d: '' },
        ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 grid-bg opacity-60" />
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-[110px] animate-float ${b.c} ${b.s} ${b.p}`}
          style={{ animationDelay: `${i * -6}s` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-deep" />
    </div>
  )
}
