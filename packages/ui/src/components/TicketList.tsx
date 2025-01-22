'use client'

import { Ticket, TicketPriority, TicketStatus } from '@autocrm/core'
import { useRouter } from 'next/navigation'

export interface TicketListProps {
  tickets: Ticket[]
  onTicketClick?: (ticketId: string) => void
  showHeader?: boolean
}

const statusColors: Record<TicketStatus, { bg: string; text: string }> = {
  open: { bg: 'bg-green-100', text: 'text-green-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  resolved: { bg: 'bg-gray-100', text: 'text-gray-800' },
  closed: { bg: 'bg-red-100', text: 'text-red-800' }
}

const priorityColors: Record<TicketPriority, { bg: string; text: string }> = {
  low: { bg: 'bg-gray-100', text: 'text-gray-800' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  high: { bg: 'bg-red-100', text: 'text-red-800' }
}

export function TicketList({ tickets, onTicketClick, showHeader = true }: TicketListProps) {
  const router = useRouter()

  // Debug the tickets prop
  console.log('TicketList received tickets:', tickets.map(t => ({ id: t.ticket_id, title: t.title })))

  const handleTicketClick = (ticket: Ticket) => {
    console.log('TicketList: Handling click for ticket:', ticket.ticket_id, 'Full ticket:', ticket)
    if (!ticket.ticket_id) {
      console.error('Invalid ticket ID')
      return
    }
    
    if (onTicketClick) {
      onTicketClick(ticket.ticket_id)
    } else {
      router.push(`/tickets/${ticket.ticket_id}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, ticket: Ticket) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTicketClick(ticket)
    }
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      {showHeader && (
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">My Tickets</h3>
        </div>
      )}
      <ul role="list" className="divide-y divide-gray-200">
        {tickets.length === 0 && (
          <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">
            No tickets found
          </li>
        )}
        {tickets.map((ticket) => (
          <li 
            key={ticket.ticket_id} 
            className="cursor-pointer hover:bg-gray-50 px-4 py-4 sm:px-6"
            onClick={() => handleTicketClick(ticket)}
            onKeyDown={(e) => handleKeyDown(e, ticket)}
            role="button"
            tabIndex={0}
            aria-label={`View ticket: ${ticket.title}`}
          >
            <div className="flex items-center justify-between">
              <div className="truncate text-sm font-medium text-indigo-600">
                {ticket.title}
              </div>
              <div className="flex flex-shrink-0 space-x-2">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[ticket.status].bg} ${statusColors[ticket.status].text}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="sm:flex">
                <div className="flex items-center text-sm text-gray-500">
                  Created {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 