'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ticket, TicketPriority, TicketStatus } from '@autocrm/core'

interface TicketListProps {
  tickets: Ticket[] | null
  showHeader?: boolean
}

const statusColors: Record<TicketStatus, { bg: string; text: string }> = {
  open: { bg: 'bg-green-100', text: 'text-green-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  resolved: { bg: 'bg-blue-100', text: 'text-blue-800' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-800' }
}

const priorityColors: Record<TicketPriority, { bg: string; text: string }> = {
  low: { bg: 'bg-blue-100', text: 'text-blue-800' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  high: { bg: 'bg-red-100', text: 'text-red-800' }
}

export default function TicketList({ tickets = [], showHeader = true }: TicketListProps) {
  const router = useRouter()
  const ticketList = tickets || []

  const handleTicketClick = (ticket: Ticket) => {
    router.push(`/tickets/${ticket.ticket_id}`)
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {showHeader && (
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">My Tickets</h3>
          <Link
            href="/tickets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Ticket
          </Link>
        </div>
      )}
      <ul role="list" className="divide-y divide-gray-200">
        {ticketList.length === 0 && (
          <li key="no-tickets" className="px-4 py-4 sm:px-6 text-gray-500 text-center">
            No tickets found
          </li>
        )}
        {ticketList.map((ticket) => (
          <li
            key={`ticket-${ticket.ticket_id}`}
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => handleTicketClick(ticket)}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">#{ticket.ticket_id}</span>
                  <p className="ml-2 text-sm font-medium text-blue-600 truncate">
                    {ticket.title}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status].bg} ${statusColors[ticket.status].text}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    Created{' '}
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 