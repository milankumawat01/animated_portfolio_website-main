/**
 * Validation rules for data entering Convex.
 * Enforced server-side; the browser form is not a validator.
 */

// Slug must be lowercase alphanumeric with hyphens, no leading/trailing hyphens
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateSlug(slug: string): void {
  if (!SLUG_REGEX.test(slug)) {
    throw new Error(`Invalid slug: "${slug}". Must match ^[a-z0-9]+(?:-[a-z0-9]+)*$`)
  }
}

// Lead field limits
export const LEAD_NAME_MIN = 1
export const LEAD_NAME_MAX = 100
export const LEAD_EMAIL_MIN = 3
export const LEAD_EMAIL_MAX = 254
export const LEAD_MESSAGE_MIN = 10
export const LEAD_MESSAGE_MAX = 5000

// Blog body
export const BLOG_BODY_MAX = 200_000

// Media
export const MEDIA_SIZE_MAX = 10 * 1024 * 1024 // 10 MB

export function validateLead(args: {
  name: string
  email: string
  message: string
}) {
  const name = args.name.trim()
  if (name.length < LEAD_NAME_MIN || name.length > LEAD_NAME_MAX) {
    throw new Error(`Name must be between ${LEAD_NAME_MIN} and ${LEAD_NAME_MAX} characters.`)
  }

  const email = args.email.toLowerCase().trim()
  if (email.length < LEAD_EMAIL_MIN || email.length > LEAD_EMAIL_MAX || !email.includes('@')) {
    throw new Error('Please enter a valid email address.')
  }

  if (args.message.length < LEAD_MESSAGE_MIN || args.message.length > LEAD_MESSAGE_MAX) {
    throw new Error(`Message must be between ${LEAD_MESSAGE_MIN} and ${LEAD_MESSAGE_MAX} characters.`)
  }

  return { name, email }
}

// Rate limit: 3 submissions per hashed IP per hour
export const RATE_LIMIT_MAX = 3
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
