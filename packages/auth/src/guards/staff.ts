import { createClient } from '../server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { UserRole } from '../types'
import { User } from '@supabase/supabase-js'

export async function withStaffGuard(redirectPath: string = '/login'): Promise<{ user: User }> {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || (user.user_metadata.role !== UserRole.AGENT && user.user_metadata.role !== UserRole.ADMIN)) {
    redirect(redirectPath)
  }

  return { user }
} 