import { createClient } from '../server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { UserRole } from '../types'

export async function withStaffGuard(redirectPath = '/login') {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(redirectPath)
  }

  const role = user.user_metadata?.role as UserRole

  if (role !== UserRole.AGENT && role !== UserRole.ADMIN) {
    redirect('/unauthorized')
  }

  return { user, role }
} 