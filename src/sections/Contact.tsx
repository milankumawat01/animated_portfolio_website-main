'use client'

import { useCallback } from 'react'
import {
  Button,
  Card,
  Eyebrow,
  Headline,
  Icon,
  IconTile,
  Reveal,
  Script,
  SectionShell,
} from '@/components/ui'
import { Footer } from '@/components/chrome'
import { copy } from '@/data/copy'
import { profile } from '@/data/profile'
import { useTileHover, type ContactTileId } from '@/scenes/contact/useTileHover'

/**
 * 08 — CONTACT, and the footer.
 *
 * COMPOSED FOR THE PIN WINDOW, WHICH IS THE SHORTEST ON THE PAGE, AND MEASURED
 * RATHER THAN ASSUMED. At 1440 × 900 the live numbers are:
 *
 *   section      1036.8px = 115.2vh   (9% of a 1280vh page, from stationVh)
 *   sticky child  900.0px = 100.0vh   (this block — it has to fit, see below)
 *   pin window    136.8px =  15.2vh   (section − child; the theoretical maximum)
 *   footer        336.6px =  37.4vh   (built in P2; nothing here can shrink it)
 *
 * Against global progress, with the page's scroll limit at 1180vh and this
 * section's top at 1164.8vh:
 *
 *   local p   section top      what you can read
 *   0.00      91vh             the eyebrow, just clearing the fold
 *   0.50      38vh             headline, body, the top row of tiles
 *   0.70      17vh             everything but the footer
 *   0.86      0vh              pinned; the footer is on screen, at the bottom
 *   1.00      pinned           unchanged — and the camera has stopped too
 *
 * Two things follow. First, the footer is the LAST 337px of a panel that is only
 * fully on screen once pinned, so this station cannot use the default centred
 * block: the content is a full-height column with `justify-between`, headline at
 * the top, footer sitting on the bottom edge. Second, everything above the footer
 * has to fit inside ONE VIEWPORT — the first build came out at 943px against a
 * 900px viewport, which ate 43px of the pin window and clipped the eyebrow off
 * the top at the very bottom of the page. That is why the tile rows are compact,
 * the rhythm is tight and the headline is capped below `display-lg`; it is not
 * taste, it is 337px of footer and 900px of screen. `min-h-screen` rather than
 * `h-screen` so a short viewport degrades to ordinary scrolling — the pin simply
 * stops happening — instead of clipping the footer off the bottom.
 *
 * The right column is deliberately close to empty. That is the dark bleed the
 * scene bible asks for, where the lamp cone, the distant desk and the reforming
 * monogram show through unobstructed.
 */
export function Contact() {
  const c = copy.contact
  const setHovered = useTileHover((s) => s.setHovered)

  const onEnter = useCallback(
    (id: ContactTileId) => () => setHovered(id),
    [setHovered],
  )
  const onLeave = useCallback(() => setHovered(null), [setHovered])

  return (
    <SectionShell id="contact" theme="dark">
      <div className="flex min-h-screen w-full flex-col justify-between gap-6 pt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.8fr)] lg:gap-14">
          {/* --------------------------------------------------- left column */}
          <div className="flex flex-col gap-3">
            <Reveal>
              <Eyebrow n={c.eyebrowN}>{c.eyebrow}</Eyebrow>
            </Reveal>

            {/**
             * Capped below the `display-lg` ceiling — and only here. The footer
             * alone is 337px of a 900px viewport and the panel has to fit inside
             * one screen or it can never be scrolled to the bottom of. 68px type
             * over two lines costs 139px of that; 46px costs 95px and still reads
             * as the display face. The two-line, second-half-blue rule is
             * untouched, which is the part that carries the identity.
             */}
            <Headline
              lines={c.headline}
              id="contact-heading"
              delay={0.05}
              className="[font-size:clamp(2rem,3.6vw,2.9rem)]"
            />

            <Reveal delay={0.16}>
              <p className="t-body" style={{ maxWidth: '58ch' }}>
                {c.body}
              </p>
            </Reveal>

            {/* Four tiles, 2 × 2 — the 3D panels behind them are laid out in this
                same order, reading left to right then top to bottom. */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {c.tiles.map((tile, i) => {
                const id = tile.icon as ContactTileId
                const isResume = id === 'file'
                const isExternal = id === 'linkedin' || id === 'github'
                return (
                  <Reveal key={tile.title} delay={0.24 + i * 0.05} className="h-full">
                    <a
                      href={tile.href}
                      {...(isResume ? { download: '' } : null)}
                      {...(isExternal
                        ? { target: '_blank', rel: 'noreferrer noopener' }
                        : null)}
                      onMouseEnter={onEnter(id)}
                      onMouseLeave={onLeave}
                      onFocus={onEnter(id)}
                      onBlur={onLeave}
                      className="group block h-full no-underline"
                    >
                      <Card
                        interactive
                        className="flex h-full items-center gap-3.5 px-4 py-2 group-hover:-translate-y-0.5"
                      >
                        <IconTile size={38}>
                          <Icon name={tile.icon} size={18} />
                        </IconTile>
                        <div className="min-w-0">
                          <p
                            className="t-title-sm truncate"
                            style={{ color: 'var(--fg)' }}
                          >
                            {tile.value}
                          </p>
                          <p className="t-meta truncate">
                            {tile.title} — {tile.sub}
                          </p>
                        </div>
                      </Card>
                    </a>
                  </Reveal>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Reveal delay={0.46}>
                <Button href={`mailto:${profile.email}`} icon="→">
                  {c.cta}
                </Button>
              </Reveal>
              <Reveal delay={0.52}>
                <p className="t-meta" style={{ maxWidth: '30ch' }}>
                  {c.ctaAside}
                </p>
              </Reveal>
            </div>
          </div>

          {/**
           * Right column — the dark bleed. Almost nothing in it on purpose: this
           * is where the lamp cone, the distant desk and the reforming monogram
           * show through. `justify-between` pushes the script annotation to the
           * bottom of the row rather than stacking it under the card, which keeps
           * it clear of the monogram in the upper right.
           */}
          <div className="flex flex-col items-start justify-between gap-8 lg:items-end">
            <Reveal delay={0.3} className="w-full lg:max-w-[300px]">
              <Card className="px-5 py-5">
                <span
                  aria-hidden
                  className="mb-3 inline-flex"
                  style={{ color: 'var(--brand)' }}
                >
                  <Icon name="spark" size={20} />
                </span>
                <p
                  className="t-title-md"
                  style={{ color: 'var(--fg)', letterSpacing: '-0.01em' }}
                >
                  {c.floatingCard}
                </p>
              </Card>
            </Reveal>

            <Script rotate={-5} delay={0.56} underline className="lg:self-end">
              {c.scripts[0]}
            </Script>
          </div>
        </div>

        {/* The dark footer bar. Built in P2 and complete — monogram, wordmark,
            role, the `Keep Building.` script, the six nav links wired to scrollTo,
            socials, location and copyright. It lives inside this station's shell so
            it scrolls with Contact and the camera is already at rest behind it. */}
        <Footer />
      </div>
    </SectionShell>
  )
}
