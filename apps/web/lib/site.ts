// All crawler-facing URLs use the same origin, even if the env has a trailing slash.
const configuredUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://milankumawat.is-a.dev')
if (!['http:', 'https:'].includes(configuredUrl.protocol)) {
  throw new Error('NEXT_PUBLIC_SITE_URL must be an HTTP or HTTPS URL.')
}

export const SITE_URL = configuredUrl.origin
export const absoluteUrl = (path: string) => new URL(path, `${SITE_URL}/`).toString()
