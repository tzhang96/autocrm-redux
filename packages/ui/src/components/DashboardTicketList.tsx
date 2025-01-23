'use client'

import { Ticket, TicketPriority, TicketStatus } from '@autocrm/core'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DashboardTicketListProps {
  tickets: Ticket[]
  onTicketClick?: (ticketId: string) => void
  onSelectionChange?: (selectedIds: string[]) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
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

function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000 // years
  if (interval > 1) return Math.floor(interval) + 'y ago'
  
  interval = seconds / 2592000 // months
  if (interval > 1) return Math.floor(interval) + 'mo ago'
  
  interval = seconds / 86400 // days
  if (interval > 1) return Math.floor(interval) + 'd ago'
  
  interval = seconds / 3600 // hours
  if (interval > 1) return Math.floor(interval) + 'h ago'
  
  interval = seconds / 60 // minutes
  if (interval > 1) return Math.floor(interval) + 'm ago'
  
  return Math.floor(seconds) + 's ago'
}

export function DashboardTicketList({ 
  tickets, 
  onTicketClick, 
  onSelectionChange,
  sortBy = 'created_at',
  sortOrder = 'desc'
}: DashboardTicketListProps) {
  const router = useRouter()
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set())

  const handleTicketClick = (ticket: Ticket) => {
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

  const handleCheckboxClick = (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation()
    const newSelected = new Set(selectedTickets)
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId)
    } else {
      newSelected.add(ticketId)
    }
    setSelectedTickets(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = e.target.checked 
      ? new Set(tickets.map(t => t.ticket_id!))
      : new Set<string>()
    setSelectedTickets(newSelected)
    onSelectionChange?.(Array.from(newSelected))
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-12 px-3 py-3.5">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={selectedTickets.size === tickets.length}
                onChange={handleSelectAll}
              />
            </th>
            <th scope="col" className="w-[30%] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Title & ID
            </th>
            <th scope="col" className="w-[20%] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Customer
            </th>
            <th scope="col" className="w-[10%] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="w-[10%] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Priority
            </th>
            <th scope="col" className="w-[10%] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Assigned To
            </th>
            <th scope="col" className="w-[10%] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Created
            </th>
            <th scope="col" className="w-[10%] px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Last Activity
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {tickets.map((ticket) => (
            <tr
              key={ticket.ticket_id}
              onClick={() => handleTicketClick(ticket)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="w-12 px-3 py-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked={selectedTickets.has(ticket.ticket_id!)}
                  onChange={(e) => e.stopPropagation()}
                  onClick={(e) => handleCheckboxClick(e, ticket.ticket_id!)}
                />
              </td>
              <td className="w-[30%] px-3 py-4">
                <div className="font-medium text-gray-900 truncate">{ticket.title}</div>
                <div className="text-gray-500 text-sm truncate">#{ticket.ticket_id}</div>
              </td>
              <td className="w-[20%] px-3 py-4">
                <div className="text-gray-500 text-sm truncate">{ticket.customer_email}</div>
              </td>
              <td className="w-[10%] px-3 py-4">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[ticket.status].bg} ${statusColors[ticket.status].text}`}>
                  {ticket.status}
                </span>
              </td>
              <td className="w-[10%] px-3 py-4">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}>
                  {ticket.priority}
                </span>
              </td>
              <td className="w-[10%] px-3 py-4">
                <div className="text-gray-500 text-sm truncate">
                  {ticket.assigned_to || 'Unassigned'}
                </div>
              </td>
              <td className="w-[10%] px-3 py-4">
                <div className="text-gray-500 text-sm truncate" title={formatDateTime(ticket.created_at)}>
                  {getTimeAgo(ticket.created_at)}
                </div>
              </td>
              <td className="w-[10%] px-3 py-4">
                <div className="text-gray-500 text-sm truncate" title={formatDateTime(ticket.last_activity_at)}>
                  {getTimeAgo(ticket.last_activity_at)}
                </div>
              </td>
            </tr>
          ))}
          {tickets.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-4 text-center text-sm text-gray-500">
                No tickets found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
} 