import { AwsClient } from 'aws4fetch'

/**
 * Media uploads live in Cloudflare R2 (no egress fees) under R2_PREFIX of a
 * private bucket. The public site serves them through its own /media/* route,
 * so the bucket never needs public access.
 */
export const R2_PREFIX = 'portfolio/media/'

function config() {
  const accountId = process.env.R2_ACCOUNT_ID
  const bucket = process.env.R2_BUCKET
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 is not configured (R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).')
  }
  return {
    client: new AwsClient({ accessKeyId, secretAccessKey, service: 's3', region: 'auto' }),
    base: `https://${accountId}.r2.cloudflarestorage.com/${bucket}/`,
  }
}

export function isR2Key(key: string) {
  return key.startsWith(R2_PREFIX) && /^[A-Za-z0-9._-]+$/.test(key.slice(R2_PREFIX.length))
}

/** Public URL on the site's /media/* proxy (apps/web/app/media/[...path]/route.ts). */
export function r2PublicUrl(key: string) {
  const siteUrl = (process.env.SITE_URL ?? '').replace(/\/$/, '')
  return `${siteUrl}/media/${key.slice(R2_PREFIX.length)}`
}

export async function presignPut(key: string, contentType: string, expiresSeconds = 300) {
  const { client, base } = config()
  const url = new URL(base + key)
  url.searchParams.set('X-Amz-Expires', String(expiresSeconds))
  const signed = await client.sign(new Request(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
  }), { aws: { signQuery: true } })
  return signed.url
}

export async function deleteObject(key: string) {
  const { client, base } = config()
  const res = await client.fetch(base + key, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) throw new Error(`R2 delete failed: ${res.status}`)
}
