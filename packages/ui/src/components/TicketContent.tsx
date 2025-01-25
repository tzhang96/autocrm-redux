'use client'

import { Message, Ticket, TicketPriority, TicketStatus } from '@autocrm/core'
import { useState } from 'react'

interface TicketContentProps {
  ticket: Ticket
  messages: Message[]
  // Allow customizing message submission (e.g. different APIs for customer vs staff)
  onSendMessage: (content: string, visibility: 'public' | 'internal') => Promise<void>
  // Staff can send internal messages, customers cannot
  canSendInternalMessages?: boolean
  // Staff can update ticket status, customers cannot
  canUpdateStatus?: boolean
  onUpdateStatus?: (status: TicketStatus) => Promise<void>
}

const statusColors: Record<TicketStatus, { bg: string; text: string }> = {
  open: { bg: 'bg-green-100', text: 'text-green-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  resolved: { bg: 'bg-gray-100', text: 'text-gray-800' },
  closed: { bg: 'bg-red-100', text: 'text-red-800' },
}

const priorityColors: Record<TicketPriority, { bg: string; text: string }> = {
  low: { bg: 'bg-gray-100', text: 'text-gray-800' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  high: { bg: 'bg-red-100', text: 'text-red-800' }
}

export function TicketContent({
  ticket,
  messages,
  onSendMessage,
  canSendInternalMessages = false,
  canUpdateStatus = false,
  onUpdateStatus
}: TicketContentProps) {
  const [newMessage, setNewMessage] = useState('')
  const [messageVisibility, setMessageVisibility] = useState<'public' | 'internal'>('public')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setError(null)
    setIsSubmitting(true)

    try {
      await onSendMessage(newMessage, messageVisibility)
      setNewMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = async (status: TicketStatus) => {
    if (!canUpdateStatus || !onUpdateStatus) return

    try {
      await onUpdateStatus(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
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
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Created {new Date(ticket.created_at).toLocaleDateString()}
            </p>
            <p className="mt-2 text-sm text-gray-700">{ticket.description}</p>
          </div>
          {canUpdateStatus && (
            <div className="mt-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Update Status
              </label>
              <select
                id="status"
                value={ticket.status}
                onChange={(e) => handleStatusUpdate(e.target.value as TicketStatus)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Messages</h3>
          <div className="mt-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`rounded-lg p-4 ${message.visibility === 'internal' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {message.user_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-700">{message.content}</p>
                {message.visibility === 'internal' && (
                  <p className="mt-1 text-xs text-yellow-800">Internal Note</p>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            {canSendInternalMessages && (
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="public"
                    checked={messageVisibility === 'public'}
                    onChange={(e) => setMessageVisibility('public')}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Public Reply</span>
                </label>
                <label className="inline-flex items-center ml-6">
                  <input
                    type="radio"
                    value="internal"
                    checked={messageVisibility === 'internal'}
                    onChange={(e) => setMessageVisibility('internal')}
                    className="form-radio h-4 w-4 text-yellow-600"
                  />
                  <span className="ml-2">Internal Note</span>
                </label>
              </div>
            )}

            <div>
              <label htmlFor="message" className="sr-only">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Type your message..."
                required
              />
            </div>

            {error && (
              <div className="mt-2 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
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