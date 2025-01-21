import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.signInWithPassword({
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

  // Get user role from metadata
  const role = user?.user_metadata?.role || 'customer'

  // Redirect based on role
  const redirectPath = role === 'customer' ? '/tickets' : '/dashboard'
  
  return NextResponse.redirect(new URL(redirectPath, request.url), {
    status: 303, // See Other
  })
} 