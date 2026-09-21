import type { Metadata, Viewport } from 'next'
import { Inter, Caveat, JetBrains_Mono, Sora } from 'next/font/google'
import { meta } from '@/data/copy'
import { profile } from '@/data/profile'
import { A11yLayer } from '@/components/a11y'
import { SITE_URL, jsonLdGraph } from '@/lib/seo'
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

/**
 * Metadata — docs/06-CONTENT.md § Metadata, via `data/copy`. Nothing is retyped
 * here and nothing unverified is asserted: `docs/04-ASSET-MANIFEST.md` §A9 is still
 * open on the contact address and the article URLs, so neither appears in any card
 * or structured-data payload. See `src/lib/seo.ts`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: meta.title,
    template: `%s — ${profile.name}`,
  },
  description: meta.description,
  keywords: [...meta.keywords],
  applicationName: profile.name,
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  publisher: profile.name,
  category: 'technology',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: 'milankumawat',
    url: SITE_URL,
    siteName: meta.title,
    title: meta.title,
    description: meta.description,
    locale: 'en_US',
    /**
     * No `images` here on purpose. `app/opengraph-image.tsx` is a file-convention
     * image: Next generates the og:image/width/height/type/alt tags from it, with a
     * cache-busting hash, and uses the same image for the Twitter card when
     * `twitter.images` is unset. Declaring it a second time here produces a second,
     * hash-less og:image that some scrapers pick instead.
     */
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    creator: '@milankumawat',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  formatDetection: { email: false, address: false, telephone: false },
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
      <head>
        {/*
          Hero-critical: `sampleMonogram` fetches this the instant the hero mounts
          and every particle position depends on it. Sora is preloaded already by
          next/font/google.
        */}
        <link rel="preload" as="image" href="/monogram.svg" type="image/svg+xml" />
      </head>
      <body>
        {/*
          Person / WebSite / ProfilePage, built from src/data. Inlined here rather
          than injected client-side so it is in the first byte of HTML a crawler
          sees. Content is machine-generated from typed data, never hand-written.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdGraph() }}
        />
        {/*
          The a11y layer must come before the page's own content: the skip link and
          the station nav are the first two stops in the tab order. See
          src/components/a11y/A11yLayer.tsx.
        */}
        <A11yLayer />
        {children}
      </body>
    </html>
  )
}
