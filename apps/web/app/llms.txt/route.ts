import { getPosts, getProjects, getSiteSettings } from '@/lib/convex'
import { absoluteUrl } from '@/lib/site'

// Content comes from the same published queries as the website; drafts stay private.
export async function GET() {
  const [settings, projects, posts] = await Promise.all([
    getSiteSettings(), getProjects(), getPosts(),
  ])
  const text = (value: string) => value.replace(/[\r\n\[\]]/g, ' ').trim()
  const link = (name: string, path: string, description: string) =>
    `- [${text(name)}](${absoluteUrl(path)}): ${text(description)}`

  const body = [
    `# ${settings.personal.name}`,
    `> ${settings.personal.subheadline}`,
    settings.personal.bio,
    '## Main pages',
    link('Home', '/', 'Biography, experience, skills and contact information.'),
    link('Projects', '/projects', 'Published projects and technical case studies.'),
    link('Blog', '/blog', 'Articles about AI engineering, backend systems and building products.'),
    '## Projects',
    ...projects.map((p) => link(p.title, `/projects/${p.slug}`, p.description)),
    '## Articles',
    ...posts.map((p) => link(p.title, `/blog/${p.slug}`, p.excerpt)),
    '## Optional',
    link('RSS feed', '/feed.xml', 'Recent published articles.'),
    link('Sitemap', '/sitemap.xml', 'Canonical public URLs.'),
  ].join('\n\n') + '\n'

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
