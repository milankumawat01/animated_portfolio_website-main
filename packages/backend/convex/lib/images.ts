import { QueryCtx } from '../_generated/server'
import { Id } from '../_generated/dataModel'

/**
 * Public pages read only `imageUrl`. A cover picked from the media library is
 * stored as `imageStorageId`, so resolve it to a served URL before returning.
 */
export async function withImageUrl<T extends { imageUrl?: string; imageStorageId?: Id<'_storage'> }>(
  ctx: QueryCtx,
  doc: T,
): Promise<T> {
  if (!doc.imageStorageId) return doc
  const url = await ctx.storage.getUrl(doc.imageStorageId)
  return { ...doc, imageUrl: url ?? doc.imageUrl }
}
