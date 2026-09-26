import { internalMutation } from '../_generated/server'
import { projectCatalog } from './projectCatalog'
import { scheduleRevalidate } from '../lib/revalidate'

// One-time owner-confirmed content migration. Run explicitly on dev and prod.
// The duplicate stays archived for recovery; the old public URL redirects to Hiro.
export const applyConfirmedDetails = internalMutation({
  args: {},
  handler: async ctx => {
    const all = await ctx.db.query('projects').collect()
    const auto = all.find(project => project.slug === 'autoresumebot')
    const hiro = all.find(project => project.slug === 'hiro')
    if (!hiro) throw new Error('Hiro must exist before merging AutoResumeBot.')
    const now = Date.now()
    if (auto) await ctx.db.patch(auto._id, { status: 'archived', featured: false, order: 99990, updatedAt: now })
    for (const project of all) {
      if (project.slug === 'autoresumebot') continue
      const copy = projectCatalog.find(item => item.slug === project.slug)
      if (!copy) continue
      const company = ['hiro', 'salezo', 'employee-portal'].includes(project.slug)
      await ctx.db.patch(project._id, {
        workType: company ? 'company' : 'freelance',
        company: company ? 'True Value Infosoft' : copy.company,
        contribution: copy.contribution,
        ...(project.slug === 'hiro' || project.slug === 'salezo' || project.slug === 'employee-portal' || project.slug === 'kontent-ops' ? {
          subtitle: copy.subtitle, description: copy.description, longDescription: copy.longDescription,
          keyFeatures: [...copy.keyFeatures],
        } : {}),
        ...(project.slug === 'internal-tools' ? {
          title: copy.title, subtitle: copy.subtitle, description: copy.description, longDescription: copy.longDescription,
          imageUrl: '', imageStorageId: undefined, galleryUrls: [], tags: [], architecture: [], stats: [], liveUrl: '', githubUrl: '',
          keyFeatures: [...copy.keyFeatures],
          seo: { title: copy.title, description: copy.description },
        } : {}),
        updatedAt: now,
      })
    }
    // Normalize the initial order only during the merge. Future admin orders survive reruns.
    if (auto?.status !== 'archived') {
      const active = all.filter(project => project.slug !== 'autoresumebot').sort((a, b) => a.order - b.order)
      for (let index = 0; index < active.length; index++) await ctx.db.patch(active[index]._id, { order: (index + 1) * 10 })
    }
    await scheduleRevalidate(ctx, ['home', 'projects', ...all.map(project => `project:${project.slug}`)])
    return { published: (await ctx.db.query('projects').withIndex('by_status_order', q => q.eq('status', 'published')).collect()).length, merged: 'autoresumebot -> hiro', employer: 'True Value Infosoft' }
  },
})
