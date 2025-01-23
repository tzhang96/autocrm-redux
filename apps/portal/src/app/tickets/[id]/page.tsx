import { CustomerAPI } from '@autocrm/api-client'
import { createServerSupabaseClient } from '@/utils/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { Message, Ticket } from '@autocrm/core'
import { TicketDetailClient } from './_components/TicketDetailClient'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'

async function getTicketData(ticket_id: string) {
  if (!ticket_id) {
    return { ticket: null, messages: [], error: 'Invalid ticket ID' }
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) {
    redirect('/login')
  }

  const customerApi = new CustomerAPI(supabase, user.email)
  const ticket = await customerApi.getMyTicket(ticket_id)
  
  if (!ticket) {
    return { ticket: null, messages: [], error: 'Ticket not found' }
  }

  const messages = await customerApi.getTicketMessages(ticket_id)
  return { ticket, messages, error: null }
}

interface PageProps {
  params: { id: string }
}

export default async function TicketPage({ params }: PageProps) {
  // Validate the ID parameter
  if (!params?.id) {
    notFound()
  }

  const { ticket, messages, error } = await getTicketData(params.id)

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
            <Link
              href="/tickets"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Tickets
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TicketDetailClient 
            ticket={ticket} 
            initialMessages={messages}
          />
        </div>
      </main>
    </div>
  )
} 