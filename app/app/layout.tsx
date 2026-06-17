import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/nav'

export const metadata: Metadata = {
  title: 'Ferie',
  description: 'Rejseplanlægning',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da" className="h-full antialiased">
      <body className="min-h-full">
        <Nav />
        {children}
      </body>
    </html>
  )
}
