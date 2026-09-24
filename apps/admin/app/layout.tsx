import type { Metadata } from 'next'
import { ConvexAdminProvider } from '@/components/shell/ConvexAdminProvider'
import './admin.css'

export const metadata: Metadata = {
  title: 'Milan Admin',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <ConvexAdminProvider>{children}</ConvexAdminProvider>
      </body>
    </html>
  )
}
