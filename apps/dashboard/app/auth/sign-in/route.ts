import { createServerSupabaseClient } from '@/utils/supabase-server'
import { NextResponse } from 'next/server'
import { Database } from '@autocrm/core'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  const supabase = await createServerSupabaseClient()

  // Sign in the user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Sign in error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      {
        status: 303,
      }
    )
  }

  if (!data.user?.email) {
    return NextResponse.redirect(
      new URL('/login?error=Unable to sign in', request.url),
      {
        status: 303,
      }
    )
  }

  // Check if user exists in the users table
  let userRecord = null
  const { data: existingUser, error: userError } = await supabase
    .from('users')
    .select('user_id, email, name, role')
    .eq('user_id', data.user.id)
    .single()

  console.log('User data query result:', { existingUser, userError })

  // If user doesn't exist in the users table, create them
  if (userError?.code === 'PGRST116') { // PostgreSQL "not found" error
    console.log('Creating new user record for:', data.user.email)
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          user_id: data.user.id,
          email: data.user.email,
          name: data.user.email.split('@')[0], // Default name from email
          role: 'customer', // Default role
          created_at: new Date().toISOString()
        }
      ])
      .select('user_id, email, name, role')
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      await supabase.auth.signOut()
      return NextResponse.redirect(
        new URL('/login?error=Error creating user profile', request.url),
        {
          status: 303,
        }
      )
    }

    console.log('Created new user:', newUser)
    userRecord = newUser
  } else if (userError) {
    console.error('Error fetching user:', userError)
    await supabase.auth.signOut()
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(userError.message)}`, request.url),
      {
        status: 303,
      }
    )
  } else {
    userRecord = existingUser
  }

  // Check if user has staff role
  if (!userRecord || (userRecord.role !== 'agent' && userRecord.role !== 'admin')) {
    console.log('Unauthorized access attempt:', { email, role: userRecord?.role })
    await supabase.auth.signOut()
    return NextResponse.redirect(
      new URL('/login?error=Unauthorized access - Staff only', request.url),
      {
        status: 303,
      }
    )
  }

  // Update user metadata with role from database
  await supabase.auth.updateUser({
    data: { role: userRecord.role }
  })

  console.log('Successful staff login:', { email, role: userRecord.role })
  if (userRecord.role === 'agent' || userRecord.role === 'admin') {
    return NextResponse.redirect(new URL('/tickets/list', request.url))
  }
  return NextResponse.redirect(new URL('/tickets/list', request.url), {
    status: 303,
  })
} 