import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TicketDetailClient } from './_components/TicketDetailClient'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface PageProps {
  params: {
    id: string
  }
}

async function getTicketData(ticketId: string) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Fetch the ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by_user:created_by(id, email, name),
      assigned_to_user:assigned_to(id, email, name)
    `)
    .eq('ticket_id', ticketId)
    .single()

  if (ticketError) {
    return { error: 'Error fetching ticket: ' + ticketError.message }
  }

  // Fetch the messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select(`
      *,
      user:user_id(id, email, name)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (messagesError) {
    return { error: 'Error fetching messages: ' + messagesError.message }
  }

  return { ticket, messages, error: null }
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
            <Link
              href="/tickets/list"
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