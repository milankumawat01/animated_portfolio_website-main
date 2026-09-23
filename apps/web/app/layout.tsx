import type { Metadata } from 'next';
import { Caveat, Instrument_Serif, JetBrains_Mono, Manrope } from 'next/font/google';
import './globals.css';
import { ConvexClientProvider } from '@/lib/convex-client-provider';
import { ThemeProvider } from '@/components/ThemeProvider';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev'

// Self-hosted at build time. A CSS @import of Google Fonts blocked first paint
// for ~2.5s on mobile (Lighthouse). globals.css maps these onto --font-* tokens.
// Only the body font is preloaded; the accent fonts swap in when needed.
const manrope = Manrope({ subsets: ['latin'], display: 'swap', variable: '--nf-manrope' });
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'], weight: '400', style: ['normal', 'italic'],
  display: 'swap', preload: false, variable: '--nf-instrument-serif',
});
const caveat = Caveat({ subsets: ['latin'], display: 'swap', preload: false, variable: '--nf-caveat' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', preload: false, variable: '--nf-mono' });
const fontVars = [manrope, instrumentSerif, caveat, jetbrainsMono].map((f) => f.variable).join(' ');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Milan Kumawat | AI Engineer & Backend Developer',
    template: '%s | Milan Kumawat',
  },
  description: 'Portfolio of Milan Kumawat - AI Engineer and Backend Developer building AI-powered products and scalable systems for a better tomorrow.',
  keywords: [
    'Milan Kumawat',
    'AI Engineer',
    'Backend Developer',
    'FastAPI',
    'Python',
    'Next.js',
    'OpenAI',
    'LLMs',
    'Jaipur India'
  ],
  authors: [{ name: 'Milan Kumawat' }],
  creator: 'Milan Kumawat',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Milan Kumawat | AI Engineer & Backend Developer',
    description: 'Building AI-powered products and scalable systems for a better tomorrow.',
    siteName: 'Milan Kumawat Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Milan Kumawat | AI Engineer & Backend Developer',
    description: 'Building AI-powered products and scalable systems for a better tomorrow.',
    creator: '@milankumawat',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${fontVars}`} suppressHydrationWarning>
      <body className="bg-bg-primary text-text-primary antialiased selection:bg-blue selection:text-white">
        <ThemeProvider>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
