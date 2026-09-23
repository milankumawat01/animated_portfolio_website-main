import { ConvexHttpClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'

// One-shot HTTP calls for the public site's only two writes (contact form,
// blog view counter). Unlike ConvexReactClient this opens no WebSocket and
// keeps no subscription alive, so a visit costs Convex exactly one request.
let client: ConvexHttpClient | null = null

export function convexMutation<M extends FunctionReference<'mutation'>>(
  mutation: M,
  args: M['_args'],
): Promise<M['_returnType']> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return Promise.reject(new Error('Convex is not configured.'))
  client ??= new ConvexHttpClient(url)
  return client.mutation(mutation, args)
}
