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
            supabaseResponse.cookies.set(name, value, options)
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
    const response = NextResponse.redirect(redirectUrl)
    
    // Copy cookies from supabaseResponse to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        domain: cookie.domain,
        httpOnly: cookie.httpOnly,
        maxAge: cookie.maxAge,
        path: cookie.path,
        sameSite: cookie.sameSite,
        secure: cookie.secure
      })
    })
    
    return response
  }

  // If user is logged in, check role-based access
  if (user) {
    // First check user_metadata for role
    let role = user.user_metadata?.role as UserRole

    // If no role in metadata, fetch from database
    if (!role) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', user.id)
        .single()
      
      if (userData) {
        role = userData.role as UserRole
        // Update user metadata with role from database
        await supabase.auth.updateUser({
          data: { role: role }
        })
      } else {
        role = UserRole.CUSTOMER // Default to customer if no role found
      }
    }

    const allowedPathsForRole = config.roleBasedPaths?.[role] || []

    // If user has no allowed paths for their role, or the current path isn't in their allowed paths
    if (
      !request.nextUrl.pathname.startsWith(config.redirects.signIn) &&
      !request.nextUrl.pathname.startsWith('/auth') &&
      !request.nextUrl.pathname.startsWith(config.redirects.unauthorized) &&
      (allowedPathsForRole.length === 0 ||
        !allowedPathsForRole.some(allowedPath => request.nextUrl.pathname.startsWith(allowedPath)))
    ) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = config.redirects.unauthorized
      const response = NextResponse.redirect(redirectUrl)
      
      // Copy cookies from supabaseResponse to the redirect response
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, {
          domain: cookie.domain,
          httpOnly: cookie.httpOnly,
          maxAge: cookie.maxAge,
          path: cookie.path,
          sameSite: cookie.sameSite,
          secure: cookie.secure
        })
      })
      
      return response
    }
  }

  return supabaseResponse
} 