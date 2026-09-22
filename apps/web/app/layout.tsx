import type { Metadata } from 'next';
import './globals.css';
import { ConvexClientProvider } from '@/lib/convex-client-provider';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.in'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Milan Kumawat | AI Engineer & Backend Developer',
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
    images: [
      {
        url: '/images/hero-desk.png',
        width: 1200,
        height: 630,
        alt: 'Milan Kumawat Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Milan Kumawat | AI Engineer & Backend Developer',
    description: 'Building AI-powered products and scalable systems for a better tomorrow.',
    creator: '@milankumawat',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
