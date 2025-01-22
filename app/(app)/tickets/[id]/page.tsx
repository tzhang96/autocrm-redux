import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TicketPriority, TicketStatus, TicketWithUsers } from '@/lib/core/types'
import TicketContent from '@/components/TicketContent'

interface PageProps {
  params: { id: string }
}

function isTicketWithUsers(data: any): data is TicketWithUsers {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.description === 'string' &&
    typeof data.status === 'string' &&
    typeof data.priority === 'string' &&
    Array.isArray(data.tags) &&
    typeof data.customer_email === 'string' &&
    typeof data.created_at === 'string' &&
    (!data.created_by_user || (
      typeof data.created_by_user === 'object' &&
      (data.created_by_user === null || (
        typeof data.created_by_user.email === 'string' &&
        (data.created_by_user.name === null || typeof data.created_by_user.name === 'string')
      ))
    )) &&
    (!data.assigned_to_user || (
      typeof data.assigned_to_user === 'object' &&
      (data.assigned_to_user === null || (
        typeof data.assigned_to_user.email === 'string' &&
        (data.assigned_to_user.name === null || typeof data.assigned_to_user.name === 'string')
      ))
    ))
  )
}

export default async function TicketDetailPage({ params }: PageProps) {
  // Ensure params.id is available
  const ticketId = await Promise.resolve(params.id)
  
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch ticket with user information
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      ticket_id,
      title,
      description,
      status,
      priority,
      tags,
      assigned_to,
      created_by,
      customer_email,
      created_at,
      updated_at,
      last_activity_at,
      custom_fields,
      created_by_user:users!tickets_created_by_fkey(email, name),
      assigned_to_user:users!tickets_assigned_to_fkey(email, name)
    `)
    .eq('ticket_id', ticketId)
    .single()

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 text-red-800 p-4 rounded-md">
              {error ? 'Error loading ticket' : 'Ticket not found'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Transform the data to match our TypeScript interface
  const transformedTicket = {
    ...ticket,
    id: ticket.ticket_id
  }

  if (!isTicketWithUsers(transformedTicket)) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 text-red-800 p-4 rounded-md">
              Invalid ticket data format
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <TicketContent ticket={transformedTicket} />
} 