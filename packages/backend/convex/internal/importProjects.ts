import { internalMutation } from '../_generated/server'
import { projectCatalog } from './projectCatalog'
import projectMedia from './projectMedia.json'
import { r2PublicUrl } from '../lib/r2'
import { scheduleRevalidate } from '../lib/revalidate'

// Run once with `npx convex run internal/importProjects:importCatalog`.
// Existing admin edits survive reruns; only the two legacy placeholders are replaced.
export const importCatalog = internalMutation({
  args: {},
  handler: async ctx => {
    let inserted = 0, updated = 0, skipped = 0
    const media = await ctx.db.query('media').collect()
    for (const asset of projectMedia) {
      if (!media.some(row => row.r2Key === asset.r2Key)) await ctx.db.insert('media', {
        r2Key: asset.r2Key, filename: asset.filename, contentType: 'image/webp', size: asset.size,
        alt: asset.filename === 'about-milan.webp' ? 'Milan Kumawat at his workspace' : `${asset.filename.replace(/-\d+\.webp$/, '').replace(/-/g, ' ')} project preview`,
        caption: asset.filename === 'about-milan.webp' ? 'Portrait supplied by Milan Kumawat' : asset.filename.startsWith('aep-') ? 'Company brand imagery' : 'Project screenshot; private data blurred where present',
        collection: asset.filename === 'about-milan.webp' ? 'Portraits' : 'Project portfolio', width: asset.width, height: asset.height, uploadedAt: Date.now(),
      })
    }
    // Link improved blurred copies when the upload gets a new immutable R2 key.
    for (const oldAsset of media) {
      const latest = projectMedia.find(asset => asset.filename === oldAsset.filename)
      if (!latest || !oldAsset.r2Key || latest.r2Key === oldAsset.r2Key || oldAsset.collection !== 'Project portfolio') continue
      const oldUrl = r2PublicUrl(oldAsset.r2Key), newUrl = r2PublicUrl(latest.r2Key)
      for (const project of await ctx.db.query('projects').collect()) {
        if (project.imageUrl === oldUrl || project.galleryUrls?.includes(oldUrl)) await ctx.db.patch(project._id, {
          imageUrl: project.imageUrl === oldUrl ? newUrl : project.imageUrl,
          galleryUrls: project.galleryUrls?.map(url => url === oldUrl ? newUrl : url), updatedAt: Date.now(),
        })
      }
    }
    const mediaUrl = (path: string) => {
      const asset = projectMedia.find(a => a.filename === path.split('/').pop())
      if (!asset) throw new Error(`Project media not uploaded: ${path}`)
      return r2PublicUrl(asset.r2Key)
    }
    for (const item of projectCatalog) {
      const existing = await ctx.db.query('projects').withIndex('by_slug', q => q.eq('slug', item.slug)).unique()
      if (existing && !(existing.legacyId && existing.liveUrl?.includes('.example.com'))) {
        // Migrate only the local images from this import; preserve later admin edits.
        const patch: { imageUrl?: string; galleryUrls?: string[]; updatedAt?: number } = {}
        if (existing.imageUrl?.startsWith('/images/projects/')) patch.imageUrl = mediaUrl(existing.imageUrl)
        if (existing.galleryUrls?.some(url => url.startsWith('/images/projects/'))) patch.galleryUrls = existing.galleryUrls.map(url => url.startsWith('/images/projects/') ? mediaUrl(url) : url)
        if (Object.keys(patch).length) await ctx.db.patch(existing._id, { ...patch, updatedAt: Date.now() })
        skipped++; continue
      }
      const data = { ...item, imageUrl: item.imageUrl ? mediaUrl(item.imageUrl) : '', tags: [...item.tags], keyFeatures: [...item.keyFeatures], architecture: [...item.architecture], stats: [...item.stats], galleryUrls: item.galleryUrls.map(mediaUrl), status: 'published' as const, publishedAt: existing?.publishedAt ?? Date.now(), updatedAt: Date.now() }
      if (existing) { await ctx.db.patch(existing._id, data); updated++ }
      else { await ctx.db.insert('projects', data); inserted++ }
    }
    // Remove broken demo URLs from other legacy projects without replacing their copy.
    for (const project of await ctx.db.query('projects').collect()) {
      if (project.legacyId && !projectCatalog.some(item => item.slug === project.slug)) {
        const patch: { liveUrl?: string; githubUrl?: string } = {}
        if (project.liveUrl?.includes('.example.com')) patch.liveUrl = ''
        if (project.githubUrl?.startsWith('https://github.com/milankumawat/')) patch.githubUrl = ''
        if (Object.keys(patch).length) await ctx.db.patch(project._id, patch)
      }
    }
    await scheduleRevalidate(ctx, ['projects', 'home', ...projectCatalog.map(p => `project:${p.slug}`)])
    return { inserted, updated, skipped, published: (await ctx.db.query('projects').withIndex('by_status_order', q => q.eq('status', 'published')).collect()).length }
  },
})
