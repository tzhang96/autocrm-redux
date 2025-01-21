import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import NewTicketForm from './NewTicketForm'

interface Customer {
  id: string
  email: string
  name: string | null
}

export default async function NewTicketPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user role from metadata
  const userRole = session.user.user_metadata.role

  // Get list of customers for agents/admins to select from
  let customers: Customer[] = []
  if (userRole === 'agent' || userRole === 'admin') {
    const { data } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('role', 'customer')
    customers = data || []
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <NewTicketForm 
                userRole={userRole} 
                userEmail={session.user.email || ''} 
                customers={customers}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 