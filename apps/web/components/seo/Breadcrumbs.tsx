import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { JsonLd } from './JsonLd'
import { absoluteUrl } from '@/lib/site'

export type BreadcrumbItem = { name: string; href: string }

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem', position: index + 1,
          name: item.name, item: absoluteUrl(item.href),
        })),
      }} />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-text-muted font-medium">
          {items.map((item, index) => (
            <li key={item.href} className="flex min-w-0 items-center gap-2">
              {index > 0 && <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />}
              {index === items.length - 1 ? (
                <span aria-current="page" className="text-text-primary font-semibold truncate max-w-[240px]">{item.name}</span>
              ) : (
                <Link href={item.href} className="hover:text-blue transition-colors">{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
