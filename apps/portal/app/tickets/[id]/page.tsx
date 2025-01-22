'use client'

import { CustomerAPI } from '@autocrm/api-client'
import { TicketContent } from '@autocrm/ui'
import { createSupabaseClient } from '@/utils/supabase'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Message, Ticket, MessageVisibility } from '@autocrm/core'

export default function TicketPage() {
  const params = useParams()
  if (!params?.id) return null
  
  const ticketId = params.id as string
  const customerApi = new CustomerAPI(createSupabaseClient())
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTicket() {
      try {
        const [ticketData, messagesData] = await Promise.all([
          customerApi.getMyTicket(ticketId),
          customerApi.getTicketMessages(ticketId)
        ])
        setTicket(ticketData)
        setMessages(messagesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket')
      }
    }

    loadTicket()
  }, [ticketId, customerApi])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TicketContent
            ticket={ticket}
            messages={messages}
            onSendMessage={async (content: string, visibility: MessageVisibility) => {
              await customerApi.replyToTicket(ticketId, content)
              const updatedMessages = await customerApi.getTicketMessages(ticketId)
              setMessages(updatedMessages)
            }}
          />
        </div>
      </main>
    </div>
  )
} 