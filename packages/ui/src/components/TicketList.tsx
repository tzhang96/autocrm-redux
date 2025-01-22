'use client'

import { Ticket, TicketPriority, TicketStatus } from '@autocrm/core'
import { useRouter } from 'next/navigation'

interface TicketListProps {
  tickets: Ticket[]
  onTicketClick?: (ticketId: string) => void
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

export function TicketList({ tickets, onTicketClick }: TicketListProps) {
  const router = useRouter()

  const handleTicketClick = (ticketId: string) => {
    if (onTicketClick) {
      onTicketClick(ticketId)
    } else {
      router.push(`/tickets/${ticketId}`)
    }
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="cursor-pointer hover:bg-gray-50">
            <div 
              className="px-4 py-4 sm:px-6"
              onClick={() => handleTicketClick(ticket.id)}
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 