import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AutoCRM Staff Dashboard',
  description: 'Staff dashboard for AutoCRM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
} 