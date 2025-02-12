import { updateSession } from '@autocrm/auth'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return updateSession(request, {
    redirects: {
      signIn: '/login',
      signOut: '/login',
      unauthorized: '/unauthorized'
    },
    allowedPaths: [
      '/login',
      '/signup',
      '/auth',
      '/unauthorized'
    ],
    roleBasedPaths: {
      'customer': ['/tickets', '/profile']
    }
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 