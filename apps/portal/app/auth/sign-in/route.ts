import { createServerClient } from '@autocrm/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  const cookieStore = cookies()
  const supabase = await createServerClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      {
        status: 303, // See Other
      }
    )
  }

  if (!data.user) {
    return NextResponse.redirect(
      new URL('/login?error=Unable to sign in', request.url),
      {
        status: 303,
      }
    )
  }

  // Set role metadata if not set
  if (!data.user.user_metadata?.role) {
    await supabase.auth.updateUser({
      data: { role: 'customer' }
    })
    // Redirect back to login to pick up the new role
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 303,
    })
  }

  // If we have a role, redirect to appropriate page
  if (data.user.user_metadata.role === 'customer') {
    return NextResponse.redirect(new URL('/tickets', request.url), {
      status: 303,
    })
  }

  // Unauthorized role for portal
  return NextResponse.redirect(
    new URL('/login?error=Unauthorized account type', request.url),
    {
      status: 303,
    }
  )
} 