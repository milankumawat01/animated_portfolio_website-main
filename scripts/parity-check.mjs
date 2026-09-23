#!/usr/bin/env node
/**
 * P2 parity check — verifies that data seeded into Convex exactly matches
 * what is in apps/web/data/portfolioData.ts (modulo the documented transforms).
 *
 * Usage:
 *   node scripts/parity-check.mjs
 *   CONVEX_URL=<prod-url> node scripts/parity-check.mjs
 *
 * Exits 0 on a clean run (zero unexplained diffs), 1 on any mismatch.
 */

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../packages/backend/convex/_generated/api.js'

// ── Source data ────────────────────────────────────────────────────────────
// Node --experimental-strip-types can handle .ts with only erasable syntax,
// but the safer cross-platform option is the .js api re-export + the TS source.
// We load portfolioData via dynamic import so it works with both ts-node and node.
let PORTFOLIO_DATA
try {
  const mod = await import('../apps/web/data/portfolioData.ts')
  PORTFOLIO_DATA = mod.PORTFOLIO_DATA
} catch {
  // fallback for plain node (strip-types flag)
  const mod = await import('../apps/web/data/portfolioData.js').catch(() => null)
  if (!mod) {
    console.error('Cannot import portfolioData.ts — run with: node --experimental-strip-types scripts/parity-check.mjs')
    process.exit(1)
  }
  PORTFOLIO_DATA = mod.PORTFOLIO_DATA
}

// ── UTC date parser (must match seed.ts exactly) ───────────────────────────
const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 }
function parseLegacyDate(s) {
  const [d, m, y] = s.split(' ')
  return Date.UTC(Number(y), MONTHS[m], Number(d))
}

// ── Expected epoch values (load-bearing constants from 06-CONTENT-MIGRATION.md §2.3) ───────
const EXPECTED_PUBLISHED_AT = {
  'building-ai-powered-fastapi':        1789171200000,
  'designing-scalable-backend-systems': 1788566400000,
  'lessons-from-autoresumebot':         1787875200000,
  'from-idea-to-production':            1787011200000,
}

// ── Convex client ──────────────────────────────────────────────────────────
const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  console.error('Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL (from .env.local) before running.')
  process.exit(1)
}
const client = new ConvexHttpClient(convexUrl)

// ── Helpers ────────────────────────────────────────────────────────────────
let failures = 0
function fail(path, src, got) {
  console.error(`  MISMATCH  ${path}`)
  console.error(`    source: ${JSON.stringify(src)}`)
  console.error(`    convex: ${JSON.stringify(got)}`)
  failures++
}
function eq(path, src, got) {
  if (src !== got) fail(path, src, got)
}
function deepEq(path, src, got) {
  const s = JSON.stringify(src)
  const g = JSON.stringify(got)
  if (s !== g) fail(path, src, got)
}
function checkCount(label, expected, got) {
  if (expected !== got) {
    console.error(`  COUNT     ${label}: expected ${expected}, got ${got}`)
    failures++
  }
}

// ── Fetch from Convex ──────────────────────────────────────────────────────
console.log(`\nConnecting to Convex: ${convexUrl}`)
const [projects, posts, experience, skills, settings] = await Promise.all([
  client.query(api.projects.listPublished, {}),
  client.query(api.blog.listPublished, {}),
  client.query(api.experience.listVisible, {}),
  client.query(api.skills.listVisible, {}),
  client.query(api.siteSettings.get, {}),
])

// ── Row counts ─────────────────────────────────────────────────────────────
console.log('\n── Row counts ───────────────────────────────────────────────')
checkCount('projects', 4, projects.length)
checkCount('blogPosts', 4, posts.length)
checkCount('experience', 3, experience.length)
checkCount('skillCategories', 6, skills.length)
checkCount('siteSettings', 1, settings ? 1 : 0)

// ── Checksums ──────────────────────────────────────────────────────────────
const totalSkills = skills.reduce((n, c) => n + (c.skills?.length ?? 0), 0)
checkCount('skills (total across categories)', 36, totalSkills)

if (settings) {
  checkCount('stats', 3, settings.stats?.length)
  checkCount('heroTechStack', 8, settings.heroTechStack?.length)
  checkCount('aboutPillars', 3, settings.aboutPillars?.length)
  checkCount('whatIWorkOn', 4, settings.whatIWorkOn?.length)
  checkCount('quotes keys', 6, Object.keys(settings.quotes ?? {}).length)
  checkCount('handwriting keys', 12, Object.keys(settings.handwriting ?? {}).length)
  checkCount('howIBuildSteps', 5, settings.howIBuildSteps?.length)
  checkCount('howIBuildPillars', 4, settings.howIBuildPillars?.length)
  checkCount('contactCards', 4, settings.contactCards?.length)

  const totalKeyFeatures = projects.reduce((n, p) => n + (p.keyFeatures?.length ?? 0), 0)
  const totalArchitecture = projects.reduce((n, p) => n + (p.architecture?.length ?? 0), 0)
  const totalProjectStats = projects.reduce((n, p) => n + (p.stats?.length ?? 0), 0)
  checkCount('project keyFeatures (total)', 20, totalKeyFeatures)
  checkCount('project architecture (total)', 17, totalArchitecture)
  checkCount('project stats (total)', 12, totalProjectStats)

  const totalExpPoints = experience.reduce((n, e) => n + (e.points?.length ?? 0), 0)
  const totalExpTags   = experience.reduce((n, e) => n + (e.tags?.length ?? 0), 0)
  checkCount('experience points (total)', 12, totalExpPoints)
  checkCount('experience tags (total)', 15, totalExpTags)

  const paragraphCounts = posts.map(p => (p.body ?? '').split('\n\n').filter(Boolean).length)
  const expectedParagraphs = [4, 4, 4, 3]
  const sortedPosts = [...posts].sort((a, b) => b.publishedAt - a.publishedAt)
  for (let i = 0; i < sortedPosts.length; i++) {
    checkCount(
      `article "${sortedPosts[i].slug}" body paragraphs`,
      expectedParagraphs[i],
      paragraphCounts[posts.indexOf(sortedPosts[i])],
    )
  }
}

// ── Projects field-by-field ────────────────────────────────────────────────
console.log('\n── Projects ─────────────────────────────────────────────────')
const srcProjects = PORTFOLIO_DATA.projects
const slugOrder = ['hiro', 'salezo', 'autoresumebot', 'internal-tools']
for (const srcSlug of slugOrder) {
  const src = srcProjects.find(p => p.id === srcSlug)
  const got = projects.find(p => p.slug === srcSlug)
  if (!got) { console.error(`  MISSING   project slug="${srcSlug}"`); failures++; continue }
  const pre = `projects/${srcSlug}`
  eq(`${pre}/slug`, srcSlug, got.slug)
  eq(`${pre}/legacyId`, srcSlug, got.legacyId)
  eq(`${pre}/title`, src.title, got.title)
  eq(`${pre}/subtitle`, src.subtitle, got.subtitle)
  eq(`${pre}/description`, src.description, got.description)
  eq(`${pre}/longDescription`, src.longDescription, got.longDescription)
  eq(`${pre}/imageUrl`, src.image, got.imageUrl)
  deepEq(`${pre}/tags`, src.tags, got.tags)
  deepEq(`${pre}/keyFeatures`, src.keyFeatures, got.keyFeatures)
  deepEq(`${pre}/architecture`, src.architecture, got.architecture)
  deepEq(`${pre}/stats`, src.stats ?? [], got.stats ?? [])
  eq(`${pre}/liveUrl`, src.liveUrl, got.liveUrl)
  eq(`${pre}/githubUrl`, src.githubUrl, got.githubUrl)
  eq(`${pre}/status`, 'published', got.status)
  eq(`${pre}/featured`, true, got.featured)
}
const expectedOrders = { hiro: 10, salezo: 20, autoresumebot: 30, 'internal-tools': 40 }
for (const p of projects) {
  eq(`projects/${p.slug}/order`, expectedOrders[p.slug], p.order)
}

// ── Blog posts field-by-field ──────────────────────────────────────────────
console.log('\n── Blog posts ───────────────────────────────────────────────')
const srcArticles = PORTFOLIO_DATA.articles
for (const srcArt of srcArticles) {
  const got = posts.find(p => p.slug === srcArt.id)
  if (!got) { console.error(`  MISSING   post slug="${srcArt.id}"`); failures++; continue }
  const pre = `blogPosts/${srcArt.id}`
  eq(`${pre}/slug`, srcArt.id, got.slug)
  eq(`${pre}/legacyId`, srcArt.id, got.legacyId)
  eq(`${pre}/title`, srcArt.title, got.title)
  eq(`${pre}/excerpt`, srcArt.excerpt, got.excerpt)
  eq(`${pre}/imageUrl`, srcArt.image, got.imageUrl)
  deepEq(`${pre}/tags`, [srcArt.tag], got.tags)
  eq(`${pre}/readTimeMinutes`, Number(srcArt.readTime.match(/^(\d+)/)[1]), got.readTimeMinutes)
  eq(`${pre}/featured`, false, got.featured)
  eq(`${pre}/status`, 'published', got.status)
  eq(`${pre}/views`, 0, got.views)

  // body: paragraphs joined with \n\n, no heading injected
  const expectedBody = srcArt.content.join('\n\n')
  eq(`${pre}/body`, expectedBody, got.body)

  // publishedAt: UTC midnight, asserted against constants
  const expectedTs = EXPECTED_PUBLISHED_AT[srcArt.id]
  eq(`${pre}/publishedAt`, expectedTs, got.publishedAt)
  // cross-check parseLegacyDate agrees with the constant
  const parsed = parseLegacyDate(srcArt.date)
  if (parsed !== expectedTs) {
    console.error(`  WARNING   parseLegacyDate("${srcArt.date}") = ${parsed} ≠ expected ${expectedTs}`)
    failures++
  }
}

// ── Experience field-by-field ──────────────────────────────────────────────
console.log('\n── Experience ───────────────────────────────────────────────')
const srcExp = PORTFOLIO_DATA.experience
const expOrder = { 'tv-infosoft': 10, eadmin: 20, freelance: 30 }
for (const src of srcExp) {
  const got = experience.find(e => e.legacyId === src.id)
  if (!got) { console.error(`  MISSING   experience legacyId="${src.id}"`); failures++; continue }
  const pre = `experience/${src.id}`
  eq(`${pre}/company`, src.company, got.company)
  eq(`${pre}/role`, src.role, got.role)
  eq(`${pre}/period`, src.period, got.period)
  eq(`${pre}/timeframe`, src.timeframe, got.timeframe)
  eq(`${pre}/badge`, src.badge, got.badge)
  eq(`${pre}/logo`, src.logo, got.logo)
  eq(`${pre}/logoBg`, src.logoBg, got.logoBg)
  deepEq(`${pre}/points`, src.points, got.points)
  deepEq(`${pre}/tags`, src.tags, got.tags)
  eq(`${pre}/order`, expOrder[src.id], got.order)
  eq(`${pre}/visible`, true, got.visible)
}

// ── Skills field-by-field ─────────────────────────────────────────────────
console.log('\n── Skill categories ─────────────────────────────────────────')
const srcSkills = PORTFOLIO_DATA.skillCategories
for (const src of srcSkills) {
  const got = skills.find(s => s.title === src.title)
  if (!got) { console.error(`  MISSING   skillCategory title="${src.title}"`); failures++; continue }
  const pre = `skillCategories/${src.title}`
  eq(`${pre}/subtitle`, src.subtitle, got.subtitle)
  eq(`${pre}/icon`, src.icon, got.icon)
  deepEq(`${pre}/skills`, src.skills, got.skills)
  eq(`${pre}/visible`, true, got.visible)
}

// ── siteSettings field-by-field ───────────────────────────────────────────
console.log('\n── siteSettings ─────────────────────────────────────────────')
if (!settings) {
  console.error('  MISSING   siteSettings singleton')
  failures++
} else {
  const p = PORTFOLIO_DATA.personal
  const pre = 'siteSettings/personal'
  eq(`${pre}/name`, p.name, settings.personal?.name)
  eq(`${pre}/role`, p.role, settings.personal?.role)
  eq(`${pre}/location`, p.location, settings.personal?.location)
  eq(`${pre}/headline`, p.headline, settings.personal?.headline)
  eq(`${pre}/subheadline`, p.subheadline, settings.personal?.subheadline)
  eq(`${pre}/email`, p.email, settings.personal?.email)
  eq(`${pre}/bio`, p.bio, settings.personal?.bio)
  eq(`${pre}/linkedin`, p.linkedin, settings.personal?.linkedin)
  eq(`${pre}/linkedinUrl`, p.linkedinUrl, settings.personal?.linkedinUrl)
  eq(`${pre}/github`, p.github, settings.personal?.github)
  eq(`${pre}/githubUrl`, p.githubUrl, settings.personal?.githubUrl)
  eq(`${pre}/twitterUrl`, p.twitterUrl, settings.personal?.twitterUrl)
  eq(`${pre}/resumeUrl`, p.resumeUrl, settings.personal?.resumeUrl)

  // hoisted fields
  deepEq('siteSettings/stats', p.stats, settings.stats)
  deepEq('siteSettings/heroTechStack', p.heroTechStack, settings.heroTechStack)
  deepEq('siteSettings/aboutPillars', p.aboutPillars, settings.aboutPillars)
  deepEq('siteSettings/whatIWorkOn', p.whatIWorkOn, settings.whatIWorkOn)
  deepEq('siteSettings/quotes', p.quotes, settings.quotes)
  deepEq('siteSettings/handwriting', p.handwriting, settings.handwriting)
  deepEq('siteSettings/howIBuildSteps', PORTFOLIO_DATA.howIBuildSteps, settings.howIBuildSteps)
  deepEq('siteSettings/howIBuildPillars', PORTFOLIO_DATA.howIBuildPillars, settings.howIBuildPillars)
  deepEq('siteSettings/contactCards', PORTFOLIO_DATA.contactCards, settings.contactCards)

  eq('siteSettings/key', 'main', settings.key)
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────────────────────')
if (failures === 0) {
  console.log(`✅  Parity check passed. All fields match.\n`)
  console.log(`    ${projects.length} projects · ${posts.length} posts · ${experience.length} experience · ${skills.length} skill categories · 1 siteSettings\n`)
  process.exit(0)
} else {
  console.error(`\n❌  ${failures} mismatch${failures === 1 ? '' : 'es'} found.\n`)
  process.exit(1)
}
