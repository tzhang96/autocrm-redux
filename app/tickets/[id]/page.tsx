import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TicketPriority, TicketStatus, Ticket } from '@/lib/core/types'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

interface TicketWithUsers extends Ticket {
  created_by_user: {
    email: string
    name: string
  }
  assigned_to_user?: {
    email: string
    name: string
  }
}

export default async function TicketPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch ticket details
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by_user:users!tickets_created_by_fkey(email, name),
      assigned_to_user:users!tickets_assigned_to_fkey(email, name)
    `)
    .eq('ticket_id', params.id)
    .single()

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="bg-red-50 text-red-800 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Error Loading Ticket</h3>
              <p>The ticket you're looking for could not be found or you don't have permission to view it.</p>
              <div className="mt-4">
                <Link
                  href="/tickets"
                  className="text-red-800 font-medium hover:text-red-900"
                >
                  ← Back to Tickets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const typedTicket = ticket as TicketWithUsers

  const statusColors: Record<TicketStatus, { bg: string; text: string }> = {
    open: { bg: 'bg-green-100', text: 'text-green-800' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    resolved: { bg: 'bg-gray-100', text: 'text-gray-800' },
    closed: { bg: 'bg-red-100', text: 'text-red-800' }
  }

  const priorityColors: Record<TicketPriority, { bg: string; text: string }> = {
    low: { bg: 'bg-blue-100', text: 'text-blue-800' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    high: { bg: 'bg-red-100', text: 'text-red-800' }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Ticket #{typedTicket.ticket_id}
            </h1>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[typedTicket.status].bg} ${statusColors[typedTicket.status].text}`}>
                {typedTicket.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[typedTicket.priority].bg} ${priorityColors[typedTicket.priority].text}`}>
                {typedTicket.priority.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {typedTicket.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Created by {typedTicket.created_by_user.name}
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: typedTicket.description }} />
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(typedTicket.created_at).toLocaleString()}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(typedTicket.updated_at).toLocaleString()}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Customer Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typedTicket.customer_email}
                  </dd>
                </div>
                {typedTicket.assigned_to && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {typedTicket.assigned_to_user?.name}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 