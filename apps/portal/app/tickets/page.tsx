import { CustomerAPI } from '@autocrm/api-client'
import { createServerSupabaseClient } from '@/utils/supabase-server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TicketListWrapper } from './_components/TicketListWrapper'

async function getCustomerTickets() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) {
    redirect('/login')
  }

  console.log('Fetching tickets for user:', user.email) // Debug user

  try {
    const customerApi = new CustomerAPI(supabase, user.email)
    const tickets = await customerApi.listMyTickets()
    console.log('Retrieved tickets:', tickets.map(t => ({ id: t.id, title: t.title }))) // Debug tickets
    return tickets
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return []
  }
}

export default async function TicketsPage() {
  const tickets = await getCustomerTickets()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
            <Link
              href="/tickets/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              New Ticket
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TicketListWrapper tickets={tickets} />
        </div>
      </main>
    </div>
  )
} 