'use client'

import { Message, TicketWithUsers, TicketPriority, TicketStatus } from '@autocrm/core'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface TicketDetailClientProps {
  ticket: TicketWithUsers
  initialMessages: Message[]
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

export function TicketDetailClient({ ticket, initialMessages }: TicketDetailClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No user found')
      setIsSending(false)
      return
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        ticket_id: ticket.ticket_id,
        user_id: user.id,
        content: newMessage.trim(),
        visibility: 'public',
        message_type: 'text',
        is_ai_generated: false
      })
      .select('*, user:user_id(*)')
      .single()

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setMessages([...messages, message])
      setNewMessage('')
    }

    setIsSending(false)
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {ticket.title}
          </h3>
          <div className="flex space-x-2">
            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[ticket.status].bg} ${statusColors[ticket.status].text}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}>
              {ticket.priority}
            </span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Created by {ticket.created_by_user?.name || ticket.created_by_user?.email || 'Unknown'} on {formatDateTime(ticket.created_at)}
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {ticket.description}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Customer Email</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {ticket.customer_email}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {ticket.assigned_to_user?.name || ticket.assigned_to_user?.email || 'Unassigned'}
            </dd>
          </div>
        </dl>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <h4 className="text-lg font-medium text-gray-900">Messages</h4>
        <div className="mt-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-500">
                  From: {message.user?.name || message.user?.email || message.user_id}
                  {message.is_ai_generated && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      AI Generated
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDateTime(message.created_at)}
                  {message.edited_at && (
                    <span className="ml-1">(edited)</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-900">{message.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <label htmlFor="new-message" className="sr-only">New message</label>
          <div>
            <textarea
              id="new-message"
              name="new-message"
              rows={3}
              className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleSendMessage}
              disabled={isSending || !newMessage.trim()}
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 