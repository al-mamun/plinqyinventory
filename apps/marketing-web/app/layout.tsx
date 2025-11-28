import { Footer } from '@/components/footer'
import { Navigation } from '@/components/navigation'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plinqy - Local Search Made Easy',
  description: 'Find local stores and products near you with Plinqy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}
