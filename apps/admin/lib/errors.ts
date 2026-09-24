import { ConvexError } from 'convex/values'

// User-facing text from a failed Convex call. Production Convex replaces plain
// Error messages with "Server Error"; only ConvexError data reaches the client.
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ConvexError && typeof err.data === 'string') return err.data
  if (err instanceof Error && /^(Choose |Only |File |Image |Name |Category |Company |End date |Replacement |Storage upload failed|Upload to storage failed|.*: (unsupported file type|file too large))/.test(err.message)) return err.message
  return fallback
}
