import { createServerClient } from '@autocrm/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = await createServerClient(cookieStore)

  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      {
        status: 303,
      }
    )
  }

  return NextResponse.redirect(new URL('/login', request.url), {
    status: 303,
  })
} 