import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

// Tag allowlist — matches the taxonomy in docs/03-ROUTES-AND-PAGES.md §6.1
const TAG =
  /^(home|projects|blog|project:[a-z0-9]+(?:-[a-z0-9]+)*|post:[a-z0-9]+(?:-[a-z0-9]+)*)$/

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { tags?: unknown }
  try {
    body = (await req.json()) as { tags?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { tags } = body
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > 20) {
    return NextResponse.json({ error: 'Bad Request: tags must be a non-empty array of ≤20 strings' }, { status: 400 })
  }

  const valid = tags.filter(
    (t): t is string => typeof t === 'string' && TAG.test(t),
  )

  if (valid.length === 0) {
    return NextResponse.json({ error: 'No valid tags' }, { status: 400 })
  }

  for (const tag of valid) {
    // Second argument 'max' is required in Next.js 16
    revalidateTag(tag, 'max')
  }

  return NextResponse.json({ revalidated: valid, now: Date.now() })
}
