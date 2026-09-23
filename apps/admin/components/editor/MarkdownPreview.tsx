'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface MarkdownPreviewProps {
  markdown: string
}

// Renders markdown using remark + remark-gfm + remark-html,
// matching the public site's pipeline.
export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const [html, setHtml] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const render = useCallback(async (md: string) => {
    if (!md.trim()) {
      setHtml('<p style="color:#9ca3af;font-style:italic">Nothing to preview yet.</p>')
      return
    }
    try {
      const { unified } = await import('unified')
      const { default: remarkParse } = await import('remark-parse')
      const { default: remarkGfm } = await import('remark-gfm')
      const { default: remarkHtml } = await import('remark-html')
      const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkHtml, { sanitize: false })
        .process(md)
      setHtml(String(result))
    } catch {
      setHtml('<p style="color:#dc2626">Preview error</p>')
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void render(markdown)
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [markdown, render])

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.9rem',
        lineHeight: 1.7,
        color: '#111827',
        padding: '1rem',
        height: '100%',
        overflowY: 'auto',
      }}
    />
  )
}
