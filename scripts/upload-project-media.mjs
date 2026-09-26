import { readFile, writeFile, readdir } from 'node:fs/promises'
import { randomUUID, createHash } from 'node:crypto'
import { AwsClient } from 'aws4fetch'
const env = Object.fromEntries((await readFile('apps/web/.env.local', 'utf8')).split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0,i), l.slice(i+1).replace(/^"|"$/g, '')] }))
for (const key of ['R2_ACCOUNT_ID','R2_BUCKET','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY']) if (!env[key]) throw new Error(`Missing ${key}`)
const client = new AwsClient({ accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' })
const manifestPath = 'packages/backend/convex/internal/projectMedia.json'
let previous = []
try { previous = JSON.parse(await readFile(manifestPath, 'utf8')) } catch {}
const manifest = []
for (const filename of (await readdir('.project-assets')).filter(n => n.endsWith('.webp')).sort()) {
  const bytes = await readFile(`.project-assets/${filename}`)
  const hash = createHash('sha256').update(bytes).digest('hex')
  const old = previous.find(p => p.filename === filename && p.hash === hash)
  if (old) { manifest.push(old); continue }
  const key = `portfolio/media/${randomUUID()}.webp`
  const result = await client.fetch(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`, { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: bytes })
  if (!result.ok) throw new Error(`Upload failed for ${filename}: ${result.status}`)
  const verify = await client.fetch(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`, { method: 'HEAD' })
  if (!verify.ok || Number(verify.headers.get('content-length')) !== bytes.length) throw new Error(`Upload verification failed for ${filename}`)
  manifest.push({ filename, r2Key: key, size: bytes.length, hash })
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2)+'\n')
  console.log(`Uploaded and verified ${filename}`)
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2)+'\n')
console.log(`${manifest.length} sanitized assets ready in R2`)
