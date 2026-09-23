import { MutationCtx } from '../_generated/server'
import { internal } from '../_generated/api'

/**
 * Schedules an on-demand revalidation of the public site.
 * Tag fan-out per docs/03-ROUTES-AND-PAGES.md §6.2 — the mutation knows what changed.
 * Runs after the mutation commits, so a failed ping never rolls back a write.
 */
export async function scheduleRevalidate(ctx: MutationCtx, tags: string[]) {
  await ctx.scheduler.runAfter(0, internal.internal.revalidate.ping, {
    tags: [...new Set(tags)],
  })
}
