import type { Metadata } from 'next';
import './globals.css';
import { ConvexClientProvider } from '@/lib/convex-client-provider';
import { ThemeProvider } from '@/components/ThemeProvider';

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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
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
