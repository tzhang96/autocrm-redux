import { CustomerAPI } from '@autocrm/api-client'
import TicketList from '@/components/TicketList'
import { createServerSupabaseClient } from '@/utils/supabase'

async function getCustomerTickets() {
  const supabase = createServerSupabaseClient()
  const customerApi = new CustomerAPI(supabase)
  return await customerApi.listMyTickets()
}

export default async function TicketsPage() {
  const tickets = await getCustomerTickets()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
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