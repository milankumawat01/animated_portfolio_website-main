import { getAuthUserId } from '@convex-dev/auth/server'
import { MutationCtx, QueryCtx } from '../_generated/server'

/**
 * The only authorization primitive in the codebase.
 * Every admin mutation and admin query calls this first.
 *
 * Loads the signed-in user and compares their email with the ADMIN_EMAIL env
 * variable. Fails closed: if ADMIN_EMAIL is unset, nobody is admin.
 * Throws with a generic message so the caller learns nothing about who would pass.
 */
export async function requireAdmin(ctx: MutationCtx | QueryCtx) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const userId = await getAuthUserId(ctx)
  if (!adminEmail || !userId) {
    throw new Error('Unauthorized')
  }

  const user = await ctx.db.get(userId)
  if (!user?.email || user.email.toLowerCase() !== adminEmail) {
    throw new Error('Unauthorized')
  }

  return user
}
