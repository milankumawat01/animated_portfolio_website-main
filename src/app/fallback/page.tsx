import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLink,
  Button,
  Card,
  Chip,
  Eyebrow,
  Icon,
  IconTile,
  Monogram,
  Quote,
  StatBlock,
} from '@/components/ui'
import { articles, writingCopy } from '@/data/articles'
import { copy, meta } from '@/data/copy'
import { experience } from '@/data/experience'
import { buildScript, pillars, process as buildProcess } from '@/data/process'
import { profile, socials, stats } from '@/data/profile'
import { projects, projectsCopy } from '@/data/projects'
import { skills } from '@/data/skills'
import { STATION_FRAGMENTS } from '@/lib/seo'

/**
 * THE STATIC PORTFOLIO.
 *
 * Not a warning, not an apology, and not the 3D site with the 3D removed. Same
 * copy, same tokens, same components — laid out as a document instead of a flight
 * path. It needs no WebGL, no Lenis, no GSAP, no canvas and no JavaScript at all:
 * every element here renders from the server and is legible with scripting off.
 *
 * It exists for three visitors:
 *   - the locked-down corporate laptop with WebGL blocked,
 *   - the reader with JavaScript disabled,
 *   - anyone who just wants to read the thing and print it.
 *
 * Note what is *not* used from `components/ui`: `SectionShell`, `Reveal`,
 * `Headline` and `Script` all read scroll progress, and outside a running Lenis
 * their server-rendered state is `opacity: 0`. Bringing them in would make a static
 * page that only appears once JavaScript has run, which is the one thing this page
 * must not do. Everything presentational — `Card`, `Chip`, `Quote`, `StatBlock`,
 * `Eyebrow`, `IconTile`, `ArrowLink`, `Button`, `Icon`, `Monogram` — is reused
 * verbatim, so the page is the design system, not a copy of it.
 *
 * `robots.ts` keeps this URL out of the index: it is the same content as `/`, and
 * two indexed copies of one portfolio is worse than one.
 */

export const metadata: Metadata = {
  title: 'Plain version',
  description: meta.description,
  robots: { index: false, follow: true },
  alternates: { canonical: '/' },
}

/**
 * The headline rule, statically. `components/ui/Headline` enforces it for the 3D
 * site but animates, and animation means JavaScript. Same bracket grammar, same
 * two-line shape, same brand colour on the second half.
 */
function Headline({ lines, as: Tag = 'h2', id }: { lines: readonly string[]; as?: 'h1' | 'h2'; id: string }) {
  return (
    <Tag id={id} className={Tag === 'h1' ? 't-display-xl' : 't-display-lg'}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: 'block' }}>
          {line.split(/(\[[^\]]*\])/).map((part, pi) =>
            part.startsWith('[') ? (
              <span key={pi} style={{ color: 'var(--brand)' }}>
                {part.slice(1, -1)}
              </span>
            ) : (
              <span key={pi}>{part}</span>
            ),
          )}
        </span>
      ))}
    </Tag>
  )
}

function Section({
  id,
  tone,
  children,
}: {
  id: string
  tone: 'dark' | 'light'
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      data-station={id}
      aria-labelledby={`${id}-heading`}
      className={tone === 'dark' ? 'fb-dark' : 'fb-light'}
    >
      <div className="fb-inner">{children}</div>
    </section>
  )
}

/**
 * The semantic aliases, re-declared per band.
 *
 * `globals.css` puts the light values on `:root` and the dark values on
 * `:root[data-theme='dark']`, and `app/layout.tsx` hard-codes `data-theme="dark"`.
 * Only `SceneDirector` ever flips that attribute, and `SceneDirector` lives inside
 * the canvas — so on a page with no canvas and no script, the whole document would
 * be stuck dark. Restating both sets as classes is what gives this page the light
 * and dark movements the design has, with no JavaScript involved.
 */
const CSS = `
  .fb-page { background: var(--night-900); }

  .fb-light {
    --fg: #0A1220;
    --fg-body: #47586F;
    --fg-muted: #5A6B83;
    --fg-strong: #1B2A41;
    --bg: #F5F8FC;
    --card-bg: #FFFFFF;
    --card-sunk: #EEF3FA;
    --border: #E3EAF3;
    --brand: #2563EB;
    --brand-soft: #EFF5FF;
    --on-brand: #FFFFFF;
    --card-shadow: var(--shadow-card);
    background: var(--bg);
    color: var(--fg-body);
  }

  .fb-dark {
    --fg: #F2F6FC;
    --fg-body: #B9C6D8;
    --fg-muted: #94A3B8;
    --fg-strong: #F2F6FC;
    --bg: #05080E;
    --card-bg: rgba(255,255,255,0.045);
    --card-sunk: rgba(255,255,255,0.07);
    --border: rgba(255,255,255,0.11);
    --brand: #3B82F6;
    --brand-soft: rgba(59,130,246,0.14);
    --on-brand: #05080E;
    --card-shadow: 0 1px 2px rgba(0,0,0,.3), 0 12px 40px rgba(0,0,0,.45);
    background: var(--bg);
    color: var(--fg-body);
  }

  .fb-inner {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: clamp(64px, 9vh, 112px) var(--gutter);
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .fb-nav { position: sticky; top: 0; z-index: 20; background: #05080E;
            border-bottom: 1px solid rgba(255,255,255,.11); }
  .fb-nav-inner { max-width: var(--content-max); margin: 0 auto;
                  padding: 14px var(--gutter); display: flex; flex-wrap: wrap;
                  align-items: center; gap: 8px 22px; }
  .fb-nav a { color: #B9C6D8; font-size: .875rem; font-weight: 500; }
  .fb-nav a:hover { color: #F2F6FC; }

  .fb-grid { display: grid; gap: 16px; }
  @media (min-width: 720px)  { .fb-grid-2 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1080px) { .fb-grid-3 { grid-template-columns: repeat(3, 1fr); }
                               .fb-grid-4 { grid-template-columns: repeat(4, 1fr); } }

  .fb-list { list-style: none; margin: 0; padding: 0; }
  /* Tailwind's preflight strips list markers; the bullets want them back. */
  .fb-bullets { margin: 12px 0 0; padding-left: 20px; list-style: disc outside; }
  .fb-bullets li { margin-bottom: 6px; }
  .fb-tags { display: flex; flex-wrap: wrap; gap: 8px; list-style: none;
             margin: 16px 0 0; padding: 0; }
  .fb-pre { font-family: var(--font-mono), monospace; font-size: .8125rem;
            line-height: 1.7; background: var(--card-sunk); color: var(--fg-strong);
            border: 1px solid var(--border); border-radius: var(--r-lg);
            padding: 20px 24px; overflow-x: auto; margin: 0; }
`

export default function FallbackPage() {
  const c = copy

  return (
    <div className="fb-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav aria-label="Primary" className="fb-nav">
        <div className="fb-nav-inner">
          <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Monogram size={22} color="#3B82F6" />
            <span style={{ color: '#F2F6FC', fontWeight: 700 }}>{profile.name}</span>
          </a>
          <ul role="list"
            className="fb-list"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', marginLeft: 'auto' }}
          >
            {STATION_FRAGMENTS.slice(1).map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main id="content">
        {/* ------------------------------------------------------ 01 hero */}
        <Section id="hero" tone="dark">
          <Eyebrow>{c.hero.eyebrow}</Eyebrow>
          <Headline lines={c.hero.headline} as="h1" id="hero-heading" />
          <p className="t-body-lg" style={{ maxWidth: '46ch' }}>
            {c.hero.sub}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <Button href="#projects" variant="primary">
              {c.hero.primaryCta}
            </Button>
            <Button href={profile.resume} variant="ghost" download="Milan_Kumawat_Resume.pdf">
              {c.hero.ghostCta}
            </Button>
          </div>
          <StatBlock stats={stats} />
          <div>
            <p className="t-eyebrow">{c.hero.stripLabel}</p>
            <ul role="list" className="fb-tags">
              {['Python', 'FastAPI', 'Next.js', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'OpenAI'].map(
                (t) => (
                  <li key={t}>
                    <Chip>{t}</Chip>
                  </li>
                ),
              )}
            </ul>
          </div>
        </Section>

        {/* ----------------------------------------------------- 02 about */}
        <Section id="about" tone="light">
          <Eyebrow n={c.about.eyebrowN}>{c.about.eyebrow}</Eyebrow>
          <Headline lines={c.about.headline} id="about-heading" />
          <p className="t-body-lg" style={{ maxWidth: '62ch' }}>
            {c.about.body}
          </p>

          <ul role="list" className="fb-grid fb-grid-3 fb-list">
            {c.about.traits.map((t) => (
              <li key={t.title}>
                <Card style={{ padding: 20, height: '100%' }}>
                  <IconTile>
                    <Icon name={t.icon} size={20} />
                  </IconTile>
                  <h3 className="t-title-sm" style={{ marginTop: 12 }}>
                    {t.title}
                  </h3>
                  <p className="t-meta">{t.sub}</p>
                </Card>
              </li>
            ))}
          </ul>

          <div>
            <p className="t-eyebrow">{c.about.railHeading}</p>
            <ul role="list" className="fb-grid fb-grid-4 fb-list" style={{ marginTop: 12 }}>
              {c.about.rail.map((r) => (
                <li key={r.title}>
                  <Card style={{ padding: 18, height: '100%' }}>
                    <h3 className="t-title-sm">{r.title}</h3>
                    <p className="t-meta">{r.sub}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>

          <Quote by={c.about.quote.by}>{c.about.quote.text}</Quote>
        </Section>

        {/* -------------------------------------------------- 03 projects */}
        <Section id="projects" tone="light">
          <Eyebrow n={c.projects.eyebrowN}>{c.projects.eyebrow}</Eyebrow>
          <Headline lines={c.projects.headline} id="projects-heading" />
          <p className="t-body-lg" style={{ maxWidth: '58ch' }}>
            {c.projects.intro}
          </p>

          <ul role="list" className="fb-grid fb-grid-2 fb-list">
            {projects.map((p) => (
              <li key={p.id}>
                <Card style={{ padding: 22, height: '100%' }}>
                  <h3 className="t-title-md">{p.name}</h3>
                  <p className="t-body" style={{ marginTop: 8 }}>
                    {p.description}
                  </p>
                  <ul role="list" className="fb-tags">
                    {p.tags.map((t) => (
                      <li key={t}>
                        <Chip>{t}</Chip>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ul>
          <p className="t-meta">{projectsCopy.footerLine}</p>
        </Section>

        {/* ------------------------------------------------ 04 experience */}
        <Section id="experience" tone="light">
          <Eyebrow n={c.experience.eyebrowN}>{c.experience.eyebrow}</Eyebrow>
          <Headline lines={c.experience.headline} id="experience-heading" />
          <p className="t-body-lg" style={{ maxWidth: '58ch' }}>
            {c.experience.intro}
          </p>

          {/* A list of jobs in order is an <ol role="list">, here as much as in the 3D site. */}
          <ol role="list" className="fb-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {experience.map((role) => (
              <li key={role.id}>
                <Card style={{ padding: 24 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                    }}
                  >
                    <h3 className="t-title-md">{role.title}</h3>
                    <p className="t-meta">{role.period}</p>
                  </div>
                  <p className="t-body" style={{ color: 'var(--brand)', marginTop: 4 }}>
                    {role.company}
                  </p>
                  <ul role="list" className="fb-bullets t-body">
                    {role.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <ul role="list" className="fb-tags">
                    {role.tags.map((t) => (
                      <li key={t}>
                        <Chip>{t}</Chip>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ol>
          <Quote by={c.experience.quote.by}>{c.experience.quote.text}</Quote>
        </Section>

        {/* ---------------------------------------------------- 05 skills */}
        <Section id="skills" tone="light">
          <Eyebrow n={c.skills.eyebrowN}>{c.skills.eyebrow}</Eyebrow>
          <Headline lines={c.skills.headline} id="skills-heading" />
          <p className="t-body-lg" style={{ maxWidth: '58ch' }}>
            {c.skills.intro}
          </p>

          <ul role="list" className="fb-grid fb-grid-3 fb-list">
            {skills.map((cat) => (
              <li key={cat.id}>
                <Card style={{ padding: 20, height: '100%' }}>
                  <h3 className="t-title-sm">{cat.title}</h3>
                  <p className="t-meta">{cat.sub}</p>
                  <ul role="list" className="fb-tags">
                    {cat.items.map((item) => (
                      <li key={item}>
                        <Chip>{item}</Chip>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ul>
          <Quote by={c.skills.quote.by}>{c.skills.quote.text}</Quote>
        </Section>

        {/* ----------------------------------------------------- 06 build */}
        <Section id="build" tone="light">
          <Eyebrow n={c.build.eyebrowN}>{c.build.eyebrow}</Eyebrow>
          <Headline lines={c.build.headline} id="build-heading" />
          <p className="t-body-lg" style={{ maxWidth: '58ch' }}>
            {c.build.intro}
          </p>

          <pre className="fb-pre">
            <code>{buildScript.code}</code>
          </pre>

          <ol role="list" className="fb-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {buildProcess.map((step) => (
              <li key={step.n}>
                <Card style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                    <span
                      className="t-meta tabular-nums"
                      style={{ color: 'var(--brand)', fontWeight: 700 }}
                    >
                      {step.n}
                    </span>
                    <h3 className="t-title-sm">{step.title}</h3>
                  </div>
                  <p className="t-body" style={{ marginTop: 6 }}>
                    {step.description}
                  </p>
                  <ul role="list" className="fb-tags">
                    {step.checklist.map((item) => (
                      <li key={item}>
                        <Chip>{item}</Chip>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ol>
          <ul role="list" className="fb-grid fb-grid-4 fb-list">
            {pillars.map((p) => (
              <li key={p.title}>
                <Card style={{ padding: 16, height: '100%' }}>
                  <h3 className="t-title-sm">{p.title}</h3>
                  <p className="t-meta">{p.sub}</p>
                </Card>
              </li>
            ))}
          </ul>

          <Quote by={c.build.quote.by}>{c.build.quote.text}</Quote>
        </Section>

        {/* --------------------------------------------------- 07 writing */}
        <Section id="writing" tone="light">
          <Eyebrow n={c.writing.eyebrowN}>{c.writing.eyebrow}</Eyebrow>
          <Headline lines={c.writing.headline} id="writing-heading" />
          <p className="t-body-lg" style={{ maxWidth: '58ch' }}>
            {c.writing.intro}
          </p>

          {/*
            Every href in data/articles is still '#' — asset question A9. A link that
            goes nowhere is worse than no link, so the titles are plain text and the
            state is stated once, in words, rather than implied by a dead anchor.
          */}
          <ul role="list" className="fb-grid fb-grid-2 fb-list">
            {articles.map((a) => (
              <li key={a.id}>
                <Card style={{ padding: 22, height: '100%' }}>
                  <p className="t-meta">
                    {a.category} · {a.date}
                  </p>
                  <h3 className="t-title-sm" style={{ marginTop: 8 }}>
                    {a.title}
                  </h3>
                  <p className="t-body" style={{ marginTop: 8 }}>
                    {a.excerpt}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
          <p className="t-meta">{writingCopy.sideNote}</p>
          <p className="t-meta">These pieces are not published yet.</p>
          <Quote by={c.writing.quote.by}>{c.writing.quote.text}</Quote>
        </Section>

        {/* --------------------------------------------------- 08 contact */}
        <Section id="contact" tone="dark">
          <Eyebrow n={c.contact.eyebrowN}>{c.contact.eyebrow}</Eyebrow>
          <Headline lines={c.contact.headline} id="contact-heading" />
          <p className="t-body-lg" style={{ maxWidth: '58ch' }}>
            {c.contact.body}
          </p>

          <ul role="list" className="fb-grid fb-grid-2 fb-list">
            {c.contact.tiles.map((tile) => (
              <li key={tile.title}>
                <Card style={{ padding: 20, height: '100%' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <IconTile>
                      <Icon name={tile.icon} size={20} />
                    </IconTile>
                    <div>
                      <h3 className="t-title-sm">{tile.title}</h3>
                      <p className="t-meta">{tile.sub}</p>
                      <ArrowLink
                        href={tile.href}
                        external={tile.href.startsWith('http')}
                        className="mt-2"
                      >
                        {tile.value}
                      </ArrowLink>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <p className="t-meta">{c.contact.ctaAside}</p>
        </Section>
      </main>

      <footer className="fb-dark">
        <div className="fb-inner" style={{ gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Monogram size={28} color="#3B82F6" />
            <span
              style={{
                fontFamily: 'var(--font-display), sans-serif',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--fg)',
              }}
            >
              {profile.name}
            </span>
          </div>
          <p className="t-meta">{profile.role}</p>
          <ul role="list" className="fb-tags">
            {socials.map((s) => (
              <li key={s.id}>
                <ArrowLink href={s.href} external={s.href.startsWith('http')}>
                  {s.label}
                </ArrowLink>
              </li>
            ))}
          </ul>
          <p className="t-meta">
            {profile.location} · {profile.copyright}
          </p>
          <p className="t-meta">
            <Link href="/" style={{ color: 'var(--brand)' }}>
              Open the full interactive version →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
