'use client'

import { TicketList } from '@autocrm/ui'
import { Ticket } from '@autocrm/core'
import { useRouter } from 'next/navigation'

interface TicketListWrapperProps {
  tickets: Ticket[]
}

export function TicketListWrapper({ tickets }: TicketListWrapperProps) {
  const router = useRouter()

  // Debug the tickets prop
  console.log('TicketListWrapper received tickets:', tickets.map(t => ({ id: t.ticket_id, title: t.title })))

  const handleTicketClick = (ticketId: string) => {
    console.log('TicketListWrapper: Navigating to ticket:', ticketId, 'Full ticket:', tickets.find(t => t.ticket_id === ticketId))
    if (!ticketId) {
      console.error('Invalid ticket ID in wrapper')
      return
    }
    router.push(`/tickets/${ticketId}`)
  }

  return (
    <TicketList 
      tickets={tickets} 
      showHeader={false}
      onTicketClick={handleTicketClick}
    />
  )
} 