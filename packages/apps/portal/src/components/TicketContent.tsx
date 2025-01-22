'use client'

import { Ticket, TicketPriority, TicketStatus } from '@autocrm/core'

interface TicketContentProps {
  ticket: Ticket
}

const statusColors: Record<TicketStatus, { bg: string; text: string }> = {
  open: { bg: 'bg-green-100', text: 'text-green-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  resolved: { bg: 'bg-blue-100', text: 'text-blue-800' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-800' }
}

const priorityColors: Record<TicketPriority, { bg: string; text: string }> = {
  low: { bg: 'bg-blue-100', text: 'text-blue-800' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  high: { bg: 'bg-red-100', text: 'text-red-800' }
}

export default function TicketContent({ ticket }: TicketContentProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Ticket #{ticket.id}
            </h1>
            <div className="flex space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status].bg} ${statusColors[ticket.status].text}`}>
                {ticket.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority].bg} ${priorityColors[ticket.priority].text}`}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {ticket.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Created on{' '}
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Description</h4>
                  <div className="mt-2 text-sm text-gray-500 prose max-w-none">
                    {ticket.description}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Priority</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {ticket.priority.toUpperCase()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 