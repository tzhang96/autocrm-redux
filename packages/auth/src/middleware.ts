import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AuthConfig, UserRole } from './types'

export async function updateSession(request: NextRequest, config: AuthConfig) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.delete({ name, ...options })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.delete({ name, ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if path is in allowed paths
  const path = request.nextUrl.pathname
  if (config.allowedPaths?.includes(path)) {
    return supabaseResponse
  }

  // Handle unauthenticated users
  if (!user) {
    if (
      !path.startsWith(config.redirects.signIn) &&
      !path.startsWith('/auth')
    ) {
      const redirectUrl = new URL(config.redirects.signIn, request.url)
      return NextResponse.redirect(redirectUrl)
    }
    return supabaseResponse
  }

  // Get user role and check role-based access
  const role = user.user_metadata?.role as UserRole || UserRole.CUSTOMER
  const allowedPathsForRole = config.roleBasedPaths?.[role] || []

  if (!allowedPathsForRole.some(allowedPath => path.startsWith(allowedPath))) {
    const redirectUrl = new URL(config.redirects.unauthorized, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
} 