import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import type { Root } from 'mdast'

// The article title is the page's H1. Shift Markdown sections together to
// preserve their hierarchy when an author includes a top-level heading.
function articleHeadings() {
  return (tree: Root) => {
    if (!tree.children.some((node) => node.type === 'heading' && node.depth === 1)) return
    for (const node of tree.children) {
      if (node.type === 'heading') node.depth = Math.min(node.depth + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6
    }
  }
}

interface MarkdownRendererProps {
  body: string
}

export async function MarkdownRenderer({ body }: MarkdownRendererProps) {
  const result = await remark()
    .use(remarkGfm)
    .use(articleHeadings)
    .use(remarkHtml)
    .process(body)

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-code:font-mono prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-a:text-blue prose-a:no-underline hover:prose-a:underline prose-strong:text-text-primary"
      dangerouslySetInnerHTML={{ __html: result.toString() }}
    />
  )
}
