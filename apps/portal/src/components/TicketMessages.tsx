'use client'

import { useState } from 'react'
import { CustomerAPI } from '@autocrm/api-client'
import { Message } from '@autocrm/core'

interface TicketMessagesProps {
  ticket_id: string
  messages: Message[]
  customerApi: CustomerAPI
}

export default function TicketMessages({ ticket_id, messages, customerApi }: TicketMessagesProps) {
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setError(null)
    setIsSubmitting(true)

    try {
      await customerApi.replyToTicket(ticket_id, newMessage)
      setNewMessage('')
      window.location.reload() // Refresh to show new message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending the message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Messages</h3>
          
          <div className="space-y-4 mb-6">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">
                      {message.user_id}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {message.is_ai_generated && (
                    <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      AI Generated
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Reply
              </label>
              <textarea
                id="message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Type your message here..."
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !newMessage.trim()}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 