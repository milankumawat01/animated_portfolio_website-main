import type { NextRequest } from 'next/server'
import { AwsClient } from 'aws4fetch'

// Serves admin-uploaded images from the private R2 bucket. Only keys under
// portfolio/media/ are reachable; responses are immutable (keys are UUIDs),
// so the CDN caches them and R2 is read roughly once per image.
const PREFIX = 'portfolio/media/'
const NAME = /^[A-Za-z0-9._-]+$/

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  if (path.length !== 1 || !NAME.test(path[0]) || path[0].startsWith('.')) {
    return new Response('Not found', { status: 404 })
  }

  const { R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env
  if (!R2_ACCOUNT_ID || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return new Response('Media storage not configured', { status: 500 })
  }

  const r2 = new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  })
  const res = await r2.fetch(
    `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${PREFIX}${path[0]}`,
    req.headers.get('Range') ? { headers: { Range: req.headers.get('Range')! } } : undefined,
  )
  if (!res.ok) return new Response('Not found', { status: 404 })

  const type = res.headers.get('Content-Type') ?? 'application/octet-stream'
  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': type,
      ...(res.headers.get('Content-Range') ? { 'Content-Range': res.headers.get('Content-Range')! } : {}),
      ...(res.headers.get('Content-Length') ? { 'Content-Length': res.headers.get('Content-Length')! } : {}),
      'Accept-Ranges': 'bytes',
      'Content-Disposition': type.startsWith('application/') && type !== 'application/pdf' ? 'attachment' : 'inline',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
