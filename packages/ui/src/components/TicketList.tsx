'use client'

import { Ticket, TicketPriority, TicketStatus } from '@autocrm/core'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

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

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
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

export function TicketList({ tickets, onTicketClick }: TicketListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null)

  const handleTicketClick = async (ticket: Ticket) => {
    if (loadingTicketId || !ticket.ticket_id) return
    
    setLoadingTicketId(ticket.ticket_id)
    
    try {
      if (onTicketClick) {
        await onTicketClick(ticket.ticket_id)
      } else {
        const path = `/tickets/${ticket.ticket_id}`
        await router.push(path)
      }
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setLoadingTicketId(null)
    }
  }

  return (
    <div className="divide-y divide-gray-200">
      {tickets.map((ticket) => {
        const isLoading = loadingTicketId === ticket.ticket_id
        
        return (
          <div
            key={ticket.ticket_id}
            onClick={() => handleTicketClick(ticket)}
            className={`flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${isLoading ? 'bg-gray-50' : ''}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleTicketClick(ticket)
              }
            }}
            aria-disabled={isLoading}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <p className={`text-sm font-medium truncate ${isLoading ? 'text-gray-500' : 'text-gray-900'}`}>
                  {ticket.title}
                </p>
                <div className="flex space-x-2">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[ticket.status].bg} ${statusColors[ticket.status].text} ${isLoading ? 'opacity-75' : ''}`}>
                    {ticket.status}
                  </span>
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text} ${isLoading ? 'opacity-75' : ''}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
              <div className="mt-1">
                <p className={`text-sm ${isLoading ? 'text-gray-400' : 'text-gray-500'}`}>
                  {ticket.customer_email}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1 ticket-timestamps">
              <div 
                className={`!text-xs ${isLoading ? '!text-gray-300' : '!text-gray-400'} [&]:text-xs [&]:text-gray-400 timestamp`}
                style={{ fontSize: '12px', color: isLoading ? 'rgb(209 213 219)' : 'rgb(156 163 175)' }}
                title={formatDateTime(ticket.created_at)}
              >
                Created {getTimeAgo(ticket.created_at)}
              </div>
              <div 
                className={`!text-xs ${isLoading ? '!text-gray-300' : '!text-gray-400'} [&]:text-xs [&]:text-gray-400 timestamp`}
                style={{ fontSize: '12px', color: isLoading ? 'rgb(209 213 219)' : 'rgb(156 163 175)' }}
                title={formatDateTime(ticket.last_activity_at)}
              >
                Updated {getTimeAgo(ticket.last_activity_at)}
              </div>
            </div>
          </div>
        )
      })}
      {tickets.length === 0 && (
        <div className="py-4 text-center text-sm text-gray-500">
          No tickets found
        </div>
      )}
    </div>
  )
} 