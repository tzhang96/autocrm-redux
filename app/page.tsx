import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user role from metadata
  const role = session.user.user_metadata?.role

  // Redirect based on role
  if (role === 'customer') {
    redirect('/tickets')
  } else {
    redirect('/dashboard')
  }
}
