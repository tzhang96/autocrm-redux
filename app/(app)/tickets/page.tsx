import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TicketList from '../components/TicketList'

export default async function TicketsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch tickets with user information
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by_user:users!tickets_created_by_fkey(email, name),
      assigned_to_user:users!tickets_assigned_to_fkey(email, name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tickets:', error)
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          Error loading tickets. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TicketList tickets={tickets} />
        </div>
      </main>
    </div>
  )
} 