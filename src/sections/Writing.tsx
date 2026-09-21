'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLink,
  CarouselNav,
  Card,
  Chip,
  Eyebrow,
  Headline,
  Quote,
  Reveal,
  Script,
  SectionShell,
} from '@/components/ui'
import { copy } from '@/data/copy'
import { articles, writingCopy } from '@/data/articles'
import { clamp } from '@/lib/math'

/**
 * 07 — WRITING & INSIGHTS.
 *
 * THE PIN WINDOW, MEASURED RATHER THAN ASSUMED. Global progress is
 * `scroll / (pageHeight − 100vh)` while this section's top sits at
 * `0.8 × pageHeight`, so the two run at different rates and local progress leads
 * the section's own scroll. At 1440 × 900 the page is 11520px, the scroll limit
 * 10620px and this section runs 9216 → 10483px, which puts `SectionShell`'s
 * sticky child hard against the top of the viewport from local **0.62 to 0.93**.
 * Before 0.62 the block is still rising through the lower part of the frame —
 * top-down, so the eyebrow and headline are what you see first — and after 0.93 it
 * leaves upward.
 *
 * Everything therefore has to be ONE screen, headline first, and the whole block
 * has to survive being half in frame for the first 60% of the station. There is no
 * second beat further down: what happens after 0.93 is the 3D, sheets still
 * falling past a lens that is already on its way to Contact.
 *
 * THE CARDS ARE A `<ul>`. Four articles are a list of articles.
 *
 * THE LINKS GO NOWHERE YET. A9 has not landed, so every `href` in `data/articles`
 * is `'#'`. They are rendered as real anchors — a fake button would be worse — but
 * marked `aria-disabled` and given an explicit title, so a screen reader is told
 * the truth and P6 has something to grep for.
 *
 * ONE BLURRED SURFACE, not four. The design system caps the page at three at once
 * and this station is one of the two where the 3D is supposed to read through the
 * card, so the frosted variant is spent on the single active card — which is also
 * what gives `CarouselNav` something visible to move.
 */

const LAST = articles.length - 1
const CARD_GAP = 20

/**
 * What a link that has no destination yet looks like. It stays an `<a>` — it is
 * markup a crawler and a screen reader should see — but it announces itself as
 * disabled and it does not jump the page to the top, which is all `href="#"` would
 * otherwise do. Delete this the moment A9 supplies real URLs.
 */
const DEAD = {
  'aria-disabled': true,
  onClick: (e: React.MouseEvent) => e.preventDefault(),
} as const

export function Writing() {
  const c = copy.writing
  const [index, setIndex] = useState(0)
  const track = useRef<HTMLUListElement>(null)
  /** Ignore scroll events until this timestamp — see the note on `go`. */
  const driving = useRef(0)

  /** Distance from one card's left edge to the next, measured rather than assumed. */
  const cardStep = (el: HTMLElement): number => {
    const first = el.children[0] as HTMLElement | undefined
    if (!first) return 0
    const second = el.children[1] as HTMLElement | undefined
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth + CARD_GAP
  }

  /**
   * The arrows move the HIGHLIGHT, and nudge the track to keep that card in view.
   * Those are two different things at 1440px, where the four cards overflow by only
   * about a hundred pixels: asking the track to scroll to card three puts it
   * against its own end stop, and a naive `round(scrollLeft / step)` then reads the
   * position back as card zero and undoes the click. So the buttons own the index
   * outright for 700ms, and the scroll listener only claims it when the track has
   * enough room to actually mean something — which is the narrow layout, where the
   * gesture is the real control and the arrows are the affordance.
   */
  const go = useCallback(
    (delta: number) => {
      const next = clamp(index + delta, 0, LAST)
      setIndex(next)
      const el = track.current
      if (!el) return
      driving.current = Date.now() + 700
      const step = cardStep(el)
      if (step > 0) el.scrollTo({ left: step * next, behavior: 'smooth' })
    },
    [index],
  )

  /** Keep the highlight honest when the track is swiped instead of clicked. */
  useEffect(() => {
    const el = track.current
    if (!el) return
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        if (Date.now() < driving.current) return
        const step = cardStep(el)
        if (step <= 0) return
        // Not a real carousel at this width; leave the highlight to the arrows.
        if (el.scrollWidth - el.clientWidth < step * 0.6) return
        setIndex(clamp(Math.round(el.scrollLeft / step), 0, LAST))
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <SectionShell id="writing" theme="light">
      <div className="flex flex-col gap-7 lg:gap-9">
        {/* ------------------------------------------------ header band */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-end lg:gap-14">
          <div>
            <Reveal>
              <Eyebrow n={c.eyebrowN}>{c.eyebrow}</Eyebrow>
            </Reveal>
            <Headline lines={c.headline} id="writing-heading" className="mt-4" delay={0.05} />
          </div>

          <div className="flex flex-col items-start gap-4">
            <Reveal delay={0.18}>
              <p className="t-body-lg" style={{ maxWidth: '54ch' }}>
                {c.intro}
              </p>
            </Reveal>

            <div className="flex w-full flex-wrap items-end justify-between gap-4">
              <div className="flex min-w-0 flex-col items-start gap-3">
                <Script rotate={-4} delay={0.34} underline>
                  {c.scripts[0]}
                </Script>
                <Reveal delay={0.42}>
                  <ArrowLink href="#" {...DEAD}>
                    {writingCopy.cta}
                  </ArrowLink>
                </Reveal>
              </div>

              <Reveal delay={0.46} className="shrink-0">
                <CarouselNav
                  label="article"
                  onPrev={() => go(-1)}
                  onNext={() => go(1)}
                  disabledPrev={index === 0}
                  disabledNext={index === LAST}
                />
              </Reveal>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------ the four articles */}
        <ul
          ref={track}
          className="flex snap-x snap-proximity overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          /* Bleeds to the viewport edge so the fourth card peeks rather than being
             clipped flush against the gutter — that peek is the carousel's only
             honest affordance on a desktop, where all the arrows do is nudge. */
          style={{
            gap: CARD_GAP,
            marginLeft: 'calc(var(--gutter) * -1)',
            marginRight: 'calc(var(--gutter) * -1)',
            paddingLeft: 'var(--gutter)',
            paddingRight: 'var(--gutter)',
            // Without this the snap points land on the container's BORDER edge and
            // the resting position eats the whole left gutter: the first card sits
            // flush against the side of the screen while every other thing in the
            // station starts at the gutter.
            scrollPaddingLeft: 'var(--gutter)',
          }}
        >
          {articles.map((article, i) => {
            const dead = article.href === '#'
            return (
              <Reveal
                as="li"
                key={article.id}
                delay={0.24 + i * 0.06}
                className="min-w-0 shrink-0 snap-start"
                style={{ flexBasis: 'clamp(255px, 26vw, 340px)' }}
              >
                <Card
                  blur={i === index}
                  interactive
                  className="flex h-full flex-col gap-3 px-5 py-5"
                  style={{
                    transform: i === index ? 'translateY(-4px)' : undefined,
                    boxShadow:
                      i === index
                        ? '0 2px 4px rgba(10,18,32,.05), 0 18px 40px rgba(10,18,32,.09)'
                        : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Chip>{article.category}</Chip>
                    <span className="t-meta">{article.date}</span>
                  </div>

                  <h3 className="t-title-sm" style={{ color: 'var(--fg)' }}>
                    {article.title}
                  </h3>

                  <p className="t-body" style={{ margin: 0 }}>
                    {article.excerpt}
                  </p>

                  <ArrowLink
                    href={article.href}
                    className="mt-auto pt-1"
                    {...(dead ? { ...DEAD, title: `${article.title} — not published yet` } : null)}
                  >
                    {writingCopy.cardCta}
                  </ArrowLink>
                </Card>
              </Reveal>
            )
          })}
        </ul>

        {/* ------------------------------------------------ closing band */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <Reveal delay={0.58}>
            <Quote by={c.quote.by} className="max-w-[46ch]">
              {c.quote.text}
            </Quote>
          </Reveal>

          <Reveal delay={0.66} className="lg:max-w-[42ch]">
            <p className="t-meta">{writingCopy.sideNote}</p>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  )
}
