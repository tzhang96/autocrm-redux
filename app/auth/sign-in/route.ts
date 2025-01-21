import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const cookieStore = cookies()

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.redirect(`${request.url}?error=${error.message}`, {
      status: 301,
    })
  }

  return NextResponse.redirect(new URL('/', request.url), {
    status: 301,
  })
} 