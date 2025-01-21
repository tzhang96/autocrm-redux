import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import NewTicketForm from './NewTicketForm'
import { User } from '@/types'

export default async function NewTicketPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()
  const userRole = user?.user_metadata?.role || 'customer'
  const userName = user?.user_metadata?.name || user?.email || ''

  // If agent/admin, fetch customer list
  let customers: { user_id: string; name: string; email: string }[] = []
  if (userRole === 'agent' || userRole === 'admin') {
    const { data } = await supabase
      .from('users')
      .select('id, email, user_metadata')
      .eq('role', 'customer')
    
    customers = data?.map(user => ({
      user_id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email
    })) || []
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Create New Ticket</h1>
      <NewTicketForm 
        userRole={userRole} 
        customers={customers} 
        userName={userName}
      />
    </div>
  )
} 