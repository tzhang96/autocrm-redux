import { CustomerAPI } from '@autocrm/api-client'
import { createServerSupabaseClient } from '@/utils/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { Message, Ticket } from '@autocrm/core'
import { TicketDetailClient } from './_components/TicketDetailClient'

async function getTicketData(ticketId: string) {
  if (!ticketId) {
    return { ticket: null, messages: [], error: 'Invalid ticket ID' }
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) {
    redirect('/login')
  }

  const customerApi = new CustomerAPI(supabase, user.email)
  const ticket = await customerApi.getMyTicket(ticketId)
  
  if (!ticket) {
    return { ticket: null, messages: [], error: 'Ticket not found' }
  }

  const messages = await customerApi.getTicketMessages(ticketId)
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
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