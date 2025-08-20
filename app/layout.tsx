import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bugema University Alumni Dashboard',
  description: 'Connect with fellow alumni, participate in elections, and stay engaged with your university community.'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
