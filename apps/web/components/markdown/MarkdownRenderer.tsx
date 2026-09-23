import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

interface MarkdownRendererProps {
  body: string
}

export async function MarkdownRenderer({ body }: MarkdownRendererProps) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(body)

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-code:font-mono prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-a:text-blue prose-a:no-underline hover:prose-a:underline prose-strong:text-text-primary"
      dangerouslySetInnerHTML={{ __html: result.toString() }}
    />
  )
}
