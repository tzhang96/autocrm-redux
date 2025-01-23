import { createServerSupabaseClient } from '@/utils/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      {
        status: 303,
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

  // Check if user has staff role
  const role = data.user.user_metadata?.role
  if (role !== 'agent' && role !== 'admin') {
    // Sign out the user if they don't have staff role
    await supabase.auth.signOut()
    return NextResponse.redirect(
      new URL('/login?error=Unauthorized access', request.url),
      {
        status: 303,
      }
    )
  }

  return NextResponse.redirect(new URL('/tickets', request.url), {
    status: 303,
  })
} 