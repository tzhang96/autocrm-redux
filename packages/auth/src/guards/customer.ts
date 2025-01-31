import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '../server'
import { UserRole } from '../types'
import { User } from '@supabase/supabase-js'

export async function withCustomerGuard(redirectPath: string = '/login'): Promise<{ user: User }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.user_metadata.role !== UserRole.CUSTOMER) {
    redirect(redirectPath)
  }

  return { user }
} 