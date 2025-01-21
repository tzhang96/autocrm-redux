'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-sm">
            <div className="h-16 flex items-center px-6 border-b">
              <h1 className="text-xl font-semibold text-gray-800">AutoCRM</h1>
            </div>
            <nav className="px-4 py-4">
              <div className="space-y-1">
                <Link 
                  href="/dashboard"
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === '/dashboard'
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className="mr-3 h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link 
                  href="/tickets"
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname.startsWith('/tickets')
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className="mr-3 h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Tickets
                </Link>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
