import { CustomerAPI } from '@/lib/api/customer'
import { createServerSupabaseClient } from '@/utils/supabase-server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TicketListWrapper } from './_components/TicketListWrapper'
import { Navigation } from '@/components/Navigation'
import { revalidatePath } from 'next/cache'

// Disable caching for this page to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TicketsPage() {
  // Ensure we revalidate this path when accessed
  revalidatePath('/tickets')

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) {
    redirect('/login')
  }

  const customerApi = new CustomerAPI(supabase, user.email)
  const tickets = await customerApi.listMyTickets()

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
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