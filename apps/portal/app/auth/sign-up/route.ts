import { createServerClient } from '@autocrm/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = await createServerClient(cookieStore)

  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const name = String(formData.get('name'))

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'customer'
      }
    }
  })

  if (error) {
    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent(error.message)}`, request.url),
      {
        status: 303,
      }
    )
  }

  // Automatically sign in after successful signup
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(signInError.message)}`, request.url),
      {
        status: 303,
      }
    )
  }

  return NextResponse.redirect(new URL('/tickets', request.url), {
    status: 303,
  })
} 