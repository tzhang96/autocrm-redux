import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AuthConfig, UserRole } from './types'

export async function updateSession(request: NextRequest, config: AuthConfig) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If there's no user and the path isn't login or auth, redirect to login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith(config.redirects.signIn) &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = config.redirects.signIn
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in, check role-based access
  if (user) {
    const role = user.user_metadata?.role as UserRole || UserRole.CUSTOMER
    const allowedPathsForRole = config.roleBasedPaths?.[role] || []

    // If user has no allowed paths for their role, or the current path isn't in their allowed paths
    if (
      allowedPathsForRole.length === 0 ||
      !allowedPathsForRole.some(allowedPath => request.nextUrl.pathname.startsWith(allowedPath))
    ) {
      // If they're logged in but unauthorized, sign them out and redirect to login
      await supabase.auth.signOut()
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = config.redirects.signIn
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
} 