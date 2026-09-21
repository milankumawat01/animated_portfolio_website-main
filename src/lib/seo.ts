import { meta } from '@/data/copy'
import { experience } from '@/data/experience'
import { profile } from '@/data/profile'
import { skills } from '@/data/skills'

/**
 * Everything the crawlers and the social cards read.
 *
 * Two rules govern this file:
 *
 *  1. **Nothing is retyped.** Every string comes from `src/data/*`, which came from
 *     `docs/06-CONTENT.md`. A structured-data blob that drifts from the visible page
 *     is worse than no structured data at all — Google treats the mismatch as spam.
 *  2. **Nothing unverified is asserted.** `docs/04-ASSET-MANIFEST.md` §A9 has three
 *     open questions: the eAdmin/True Value dates overlap by seven months, the
 *     `hey@` address is unconfirmed, and every article href is `'#'`. So the Person
 *     schema below carries no employment *dates*, no `email`, and the sitemap has no
 *     article URLs. Those go in the moment A9 is answered; see the notes inline.
 */

/** Canonical origin. Vercel injects the first; the fallback is the intended domain. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://milankumawat.in')
).replace(/\/$/, '')

export const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${profile.name} — ${profile.role}`,
} as const

/**
 * The eight stations are fragments of one document, not separate pages. They are
 * listed here so the sitemap and the station nav agree on one ordering.
 */
export const STATION_FRAGMENTS = [
  { id: 'hero', label: 'Home', title: profile.name },
  { id: 'about', label: 'About', title: 'About Me' },
  { id: 'projects', label: 'Projects', title: 'Projects' },
  { id: 'experience', label: 'Experience', title: 'Experience' },
  { id: 'skills', label: 'Skills', title: 'Skills & Stack' },
  { id: 'build', label: 'How I Build', title: 'How I Build' },
  { id: 'writing', label: 'Writing', title: 'Writing & Insights' },
  { id: 'contact', label: 'Contact', title: 'Get in Touch' },
] as const

export type StationFragment = (typeof STATION_FRAGMENTS)[number]

/** Every distinct technology named in `data/skills`, de-duplicated, plus the themes. */
export const knowsAbout: readonly string[] = Array.from(
  new Set<string>([
    ...skills.flatMap((c) => [c.title, ...c.items]),
    'Artificial Intelligence',
    'Large Language Models',
    'Backend Engineering',
    'API Design',
    'System Design',
  ]),
)

/**
 * The current employer, read from the data rather than named here. The list is
 * ordered most-recent-first and the top entry is the one whose period runs to
 * "Present", so this stays correct when a role is added.
 *
 * Deliberately no `startDate` / `endDate` anywhere: A9 is open and the two most
 * recent roles overlap by seven months. Publishing the overlap as machine-readable
 * fact would make a data-entry question into a public claim.
 */
const currentRole = experience.find((r) => /present/i.test(r.period)) ?? experience[0]

export interface PersonSchema {
  '@context': 'https://schema.org'
  '@type': 'Person'
  [key: string]: unknown
}

export const personSchema = (): PersonSchema => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: profile.name,
  givenName: profile.firstName,
  familyName: profile.lastName,
  url: SITE_URL,
  image: `${SITE_URL}${OG_IMAGE.url}`,
  description: meta.description,
  jobTitle: profile.role,
  worksFor: {
    '@type': 'Organization',
    name: currentRole.company,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    addressCountry: 'IN',
  },
  // No `email`: hey@milankumawat.in is unconfirmed (A9). Add it here once it is.
  sameAs: [profile.githubUrl, profile.linkedinUrl, profile.xUrl],
  knowsAbout,
})

/**
 * The page itself, tied to the Person. Gives search engines a name for the document
 * that is not just the <title>, and a primary entity to attach the site to.
 */
export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: meta.title,
  description: meta.description,
  inLanguage: 'en',
  author: { '@id': `${SITE_URL}/#person` },
  publisher: { '@id': `${SITE_URL}/#person` },
})

export const profilePageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  name: meta.title,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  mainEntity: { '@id': `${SITE_URL}/#person` },
})

/** One `<script type="application/ld+json">` payload for the whole document. */
export const jsonLdGraph = () =>
  JSON.stringify([personSchema(), websiteSchema(), profilePageSchema()])
