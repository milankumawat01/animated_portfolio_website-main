import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { requireAdmin } from './lib/auth'
import { scheduleRevalidate } from './lib/revalidate'

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('siteSettings')
      .withIndex('by_key', (q) => q.eq('key', 'main'))
      .unique()
  },
})

export const update = mutation({
  args: {
    personal: v.optional(v.object({
      name: v.string(), role: v.string(), location: v.string(),
      headline: v.string(), subheadline: v.string(),
      email: v.string(), bio: v.string(),
      linkedin: v.string(), linkedinUrl: v.string(),
      github: v.string(), githubUrl: v.string(),
      twitterUrl: v.string(), resumeUrl: v.string(),
    })),
    stats:            v.optional(v.array(v.object({ value: v.string(), label: v.string() }))),
    heroTechStack:    v.optional(v.array(v.object({ name: v.string(), iconKey: v.string() }))),
    aboutPillars:     v.optional(v.array(v.object({ title: v.string(), description: v.string(), icon: v.string() }))),
    whatIWorkOn:      v.optional(v.array(v.object({ title: v.string(), description: v.string(), icon: v.string() }))),
    quotes:           v.optional(v.object({
                        about: v.string(), skills: v.string(), howIBuild: v.string(),
                        experience: v.string(), writing: v.string(), contact: v.string(),
                      })),
    handwriting:      v.optional(v.object({
                        aboutPhoto: v.string(), aboutBottom: v.string(), projects: v.string(),
                        skillsPhoto: v.string(), skillsBottom: v.string(),
                        experienceLeft: v.string(), experienceRight: v.string(),
                        howIBuildTop: v.string(), howIBuildBottom: v.string(),
                        writingTop: v.string(), contactTop: v.string(), footer: v.string(),
                      })),
    howIBuildSteps:   v.optional(v.array(v.object({
                        step: v.string(), title: v.string(), icon: v.string(),
                        description: v.string(), items: v.array(v.string()),
                      }))),
    howIBuildPillars: v.optional(v.array(v.object({
                        title: v.string(), subtitle: v.string(), icon: v.string(),
                      }))),
    contactCards:     v.optional(v.array(v.object({
                        id: v.string(), title: v.string(), value: v.string(), hint: v.string(),
                        icon: v.string(), action: v.string(), copyable: v.boolean(),
                      }))),
  },
  handler: async (ctx, patch) => {
    await requireAdmin(ctx)
    const existing = await ctx.db
      .query('siteSettings')
      .withIndex('by_key', (q) => q.eq('key', 'main'))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { ...patch, updatedAt: Date.now() })
      await scheduleRevalidate(ctx, ['home'])
    } else {
      // Should never happen after the seed runs, but guards against a missing row.
      throw new Error('siteSettings not initialised. Run the seed first.')
    }
  },
})
