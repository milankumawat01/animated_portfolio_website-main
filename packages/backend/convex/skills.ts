import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { requireAdmin } from './lib/auth'
import { scheduleRevalidate } from './lib/revalidate'

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('skillCategories')
      .withIndex('by_visible_order', (q) => q.eq('visible', true))
      .order('asc')
      .collect()
  },
})

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.db.query('skillCategories').order('asc').collect()
  },
})

export const create = mutation({
  args: {
    title:    v.string(),
    subtitle: v.string(),
    icon:     v.string(),
    skills:   v.array(v.object({ name: v.string(), iconKey: v.string(), visible: v.optional(v.boolean()) })),
    order:    v.number(),
    visible:  v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const id = await ctx.db.insert('skillCategories', {
      ...args,
      updatedAt: Date.now(),
    })
    await scheduleRevalidate(ctx, ['home'])
    return id
  },
})

export const update = mutation({
  args: {
    id:       v.id('skillCategories'),
    title:    v.optional(v.string()),
    subtitle: v.optional(v.string()),
    icon:     v.optional(v.string()),
    skills:   v.optional(v.array(v.object({ name: v.string(), iconKey: v.string(), visible: v.optional(v.boolean()) }))),
    order:    v.optional(v.number()),
    visible:  v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx)
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() })
    await scheduleRevalidate(ctx, ['home'])
  },
})

export const remove = mutation({
  args: { id: v.id('skillCategories') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx)
    await ctx.db.delete(id)
    await scheduleRevalidate(ctx, ['home'])
  },
})

export const reorder = mutation({
  args: { ids: v.array(v.id('skillCategories')) },
  handler: async (ctx, { ids }) => {
    await requireAdmin(ctx)
    for (let i = 0; i < ids.length; i++) {
      await ctx.db.patch(ids[i], { order: (i + 1) * 10, updatedAt: Date.now() })
    }
    await scheduleRevalidate(ctx, ['home'])
  },
})

export const saveSkill = mutation({
  args: {
    categoryId: v.id('skillCategories'),
    targetId: v.id('skillCategories'),
    index: v.optional(v.number()),
    skill: v.object({ name: v.string(), iconKey: v.string(), visible: v.optional(v.boolean()) }),
  },
  handler: async (ctx, { categoryId, targetId, index, skill }) => {
    await requireAdmin(ctx)
    const source = await ctx.db.get(categoryId)
    const target = await ctx.db.get(targetId)
    if (!source || !target) throw new Error('Skill category not found.')
    if (!skill.name.trim() || !skill.iconKey.trim()) throw new Error('Name and icon are required.')
    if (index !== undefined && (index < 0 || index >= source.skills.length)) throw new Error('Skill not found.')
    const nextSource = source.skills.filter((_, i) => i !== index)
    if (categoryId === targetId) {
      if (index === undefined) nextSource.push(skill)
      else nextSource.splice(index, 0, skill)
      await ctx.db.patch(categoryId, { skills: nextSource, updatedAt: Date.now() })
    } else {
      await ctx.db.patch(categoryId, { skills: nextSource, updatedAt: Date.now() })
      await ctx.db.patch(targetId, { skills: [...target.skills, skill], updatedAt: Date.now() })
    }
    await scheduleRevalidate(ctx, ['home'])
  },
})

export const deleteSkill = mutation({
  args: { categoryId: v.id('skillCategories'), index: v.number() },
  handler: async (ctx, { categoryId, index }) => {
    await requireAdmin(ctx)
    const category = await ctx.db.get(categoryId)
    if (!category || index < 0 || index >= category.skills.length) throw new Error('Skill not found.')
    await ctx.db.patch(categoryId, { skills: category.skills.filter((_, i) => i !== index), updatedAt: Date.now() })
    await scheduleRevalidate(ctx, ['home'])
  },
})
