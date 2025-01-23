'use client'

import { Message, Ticket } from '@autocrm/core'
import { useState } from 'react'
import { sendMessage } from '../actions'

interface TicketDetailClientProps {
  ticket: Ticket
  initialMessages: Message[]
}

export function TicketDetailClient({ ticket, initialMessages }: TicketDetailClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSendMessage = async () => {
    const content = messageContent.trim()
    if (!content || isLoading) return

    try {
      setIsLoading(true)
      setError(null)
      const updatedMessages = await sendMessage(ticket.ticket_id, content)
      setMessages(updatedMessages)
      setMessageContent('')
    } catch (err) {
      console.error('Client error:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-start">
          <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {ticket.title}
        </h3>
            <p className="mt-1 text-sm text-gray-500">
          Status: {ticket.status} | Priority: {ticket.priority}
        </p>
            <p className="mt-1 text-sm text-gray-500">
              Customer: {ticket.customer_email}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Created: {formatDate(ticket.created_at)}</p>
            <p>Last Activity: {formatDate(ticket.last_activity_at)}</p>
          </div>
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
                  {formatDate(message.created_at)}
                  {message.edited_at && (
                    <span className="ml-1">(edited)</span>
                  )}
              </div>
              </div>
              <p className="text-sm text-gray-900">{message.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            rows={3}
            placeholder="Type your message..."
            disabled={isLoading}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
          />
          <div className="mt-2 flex flex-col space-y-2">
            {error && (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Press Enter to send. Use Shift + Enter for a new line.
              </p>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={isLoading || !messageContent.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 