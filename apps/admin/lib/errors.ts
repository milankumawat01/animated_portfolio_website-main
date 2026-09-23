import { ConvexError } from 'convex/values'

// User-facing text from a failed Convex call. Production Convex replaces plain
// Error messages with "Server Error"; only ConvexError data reaches the client.
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ConvexError && typeof err.data === 'string') return err.data
  return err instanceof Error ? err.message : fallback
}
