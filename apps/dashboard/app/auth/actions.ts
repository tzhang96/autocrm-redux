'use server'

import { createServerClient } from '@autocrm/auth'
import { redirect } from 'next/navigation'

export async function handleLogout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
} 