import { updateSession } from '@autocrm/auth'
import { type NextRequest, type NextResponse } from 'next/server'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  return updateSession(request, {
    redirects: {
      signIn: '/login',
      signOut: '/login',
      unauthorized: '/unauthorized'
    },
    allowedPaths: [
      '/login',
      '/auth',
      '/unauthorized'
    ],
    roleBasedPaths: {
      'agent': [
        '/',
        '/tickets',
        '/tickets/list',
        '/tickets/[id]',
        '/profile',
        '/dashboard'
      ],
      'admin': [
        '/',
        '/tickets',
        '/tickets/list',
        '/tickets/[id]',
        '/profile',
        '/dashboard',
        '/settings'
      ]
    }
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 