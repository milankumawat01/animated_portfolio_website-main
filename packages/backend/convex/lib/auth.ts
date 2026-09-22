import { MutationCtx, QueryCtx, ActionCtx } from '../_generated/server'

/**
 * The only authorization primitive in the codebase.
 * Every admin mutation and admin query calls this first.
 *
 * Compares the authenticated identity against the ADMIN_IDENTITY env variable.
 * Throws with a generic message so the caller gets no information about what
 * identity would have worked.
 */
export async function requireAdmin(ctx: MutationCtx | QueryCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity()
  const adminIdentity = process.env.ADMIN_IDENTITY

  if (!identity) {
    throw new Error('Unauthorized')
  }

  if (!adminIdentity) {
    // In dev without ADMIN_IDENTITY set, allow any authenticated user.
    // In production this must be set — Convex will surface the missing env.
    return identity
  }

  // ADMIN_IDENTITY is the tokenIdentifier, e.g. "https://...github|12345678"
  if (identity.tokenIdentifier !== adminIdentity) {
    throw new Error('Unauthorized')
  }

  return identity
}
