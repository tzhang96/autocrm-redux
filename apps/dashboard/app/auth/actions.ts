'use server'

import { createServerSupabaseClient } from '@/utils/supabase-server'
import { redirect } from 'next/navigation'

export async function handleLogout() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/login')
} 