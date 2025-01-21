import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TicketPriority, TicketStatus } from '@/lib/core/types'
import parse from 'html-react-parser'

interface TicketWithUsers {
  ticket_id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  customer_email: string
  created_at: string
  created_by_user: {
    email: string
    name: string | null
  } | null
  assigned_to_user: {
    email: string
    name: string | null
  } | null
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch ticket with user information
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by_user:users!tickets_created_by_fkey(email, name),
      assigned_to_user:users!tickets_assigned_to_fkey(email, name)
    `)
    .eq('ticket_id', id)
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
            <div className="flex space-x-3">
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
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {typedTicket.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Created by {typedTicket.created_by_user?.name || typedTicket.created_by_user?.email || 'Unknown'} on{' '}
                    {new Date(typedTicket.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Description</h4>
                  <div className="mt-2 text-sm text-gray-500 prose max-w-none">
                    {parse(typedTicket.description)}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Customer Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{typedTicket.customer_email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {typedTicket.assigned_to_user?.name || typedTicket.assigned_to_user?.email || 'Unassigned'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 