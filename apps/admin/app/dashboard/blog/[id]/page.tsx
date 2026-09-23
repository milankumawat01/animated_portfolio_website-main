'use client'
import { useQuery } from 'convex/react'
import { api } from '@portfolio/backend/convex/_generated/api'
import { BlogEditor } from '@/components/editor/BlogEditor'
import { use } from 'react'
import type { Id } from '@portfolio/backend/convex/_generated/dataModel'

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const posts = useQuery(api.blog.listAll) ?? []
  const post = posts.find((p) => p._id === (id as Id<'blogPosts'>))

  if (!post && posts.length > 0) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#374151' }}>
        Post not found.
      </div>
    )
  }

  return (
    <div>
      {post ? (
        <BlogEditor post={post} />
      ) : (
        <div style={{ color: '#6b7280', fontFamily: 'system-ui, sans-serif' }}>
          Loading…
        </div>
      )}
    </div>
  )
}
