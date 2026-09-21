import type { Metadata, Viewport } from 'next'
import { Inter, Caveat, JetBrains_Mono, Sora } from 'next/font/google'
import { meta } from '@/data/copy'
import './globals.css'

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

/**
 * Display face. The design system asks for Satoshi (Fontshare, self-hosted); no woff2
 * was supplied in assets/incoming, so we use the approved fallback — Sora.
 * See docs/04-ASSET-MANIFEST.md §A6.
 */
const display = Sora({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const script = Caveat({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-script',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.in'),
  title: meta.title,
  description: meta.description,
  keywords: [...meta.keywords],
}

export const viewport: Viewport = {
  themeColor: '#05080E',
  colorScheme: 'dark light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${display.variable} ${body.variable} ${script.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}
