'use client'

import Link from 'next/link'
import { TicketPriority, TicketStatus } from '@/lib/core/types'

interface Ticket {
  ticket_id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  customer_email: string
  created_at: string
  created_by_user: {
    email: string
    name: string | null
  } | null
}

interface TicketListProps {
  tickets: Ticket[]
  showHeader?: boolean
}

export default function TicketList({ tickets, showHeader = true }: TicketListProps) {
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
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {showHeader && (
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Tickets</h3>
          <Link
            href="/tickets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Ticket
          </Link>
        </div>
      )}
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr 
                key={ticket.ticket_id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => window.location.href = `/tickets/${ticket.ticket_id}`}
              >
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <span className="text-sm text-gray-500">#{ticket.ticket_id}</span>
                    <br />
                    {ticket.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status].bg} ${statusColors[ticket.status].text}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.created_by_user?.name || ticket.created_by_user?.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.customer_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 