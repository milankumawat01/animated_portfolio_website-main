import { query } from './_generated/server'

// Legacy read only query retained for export and migration. Public pages use source controlled copy.
export const get = query({
  args: {},
  handler: async ctx => ctx.db.query('siteSettings').withIndex('by_key', q => q.eq('key', 'main')).unique(),
})
