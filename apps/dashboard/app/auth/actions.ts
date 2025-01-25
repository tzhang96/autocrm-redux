'use server'

import { createServerClient } from '@autocrm/auth'
import { redirect } from 'next/navigation'

export const handleLogout = async () => {
  'use server'
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
} 