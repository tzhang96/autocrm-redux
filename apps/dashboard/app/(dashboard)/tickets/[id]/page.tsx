import { createServerSupabaseClient } from '@/utils/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { Message, Ticket } from '@autocrm/core'
import Link from 'next/link'
import { TicketDetailClient } from './_components/TicketDetailClient'

async function getTicketData(ticket_id: string) {
  if (!ticket_id) {
    return { ticket: null, messages: [], error: 'Invalid ticket ID' }
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Fetch ticket details
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_id', ticket_id)
    .single()

  if (ticketError || !ticket) {
    return { ticket: null, messages: [], error: 'Ticket not found' }
  }

  // Fetch messages with user details
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select(`
      *,
      user:users(name, email)
    `)
    .eq('ticket_id', ticket_id)
    .order('created_at', { ascending: true })

  if (messagesError) {
    return { ticket, messages: [], error: 'Failed to load messages' }
  }

  return { ticket, messages: messages || [], error: null }
}

interface PageProps {
  params: { id: string }
}

export default async function TicketPage({ params }: PageProps) {
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