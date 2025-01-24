'use client'

import { Message, Ticket } from '@autocrm/core'
import { useState } from 'react'
import { sendMessage } from '../actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { MessageEditor } from './MessageEditor'

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {ticket.title}
            </h3>
            <div className="mt-2 flex gap-2">
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-gray-500">
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
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 prose prose-sm max-w-none">
              <ReactMarkdown 
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  p: ({node, ...props}) => <p className="my-2" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2" {...props} />,
                  li: ({node, ...props}) => <li className="my-1" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-gray-200 pl-4 my-2 italic" {...props} />
                  ),
                  pre: ({node, ...props}) => (
                    <pre className="bg-gray-100 p-4 rounded-md my-2 overflow-x-auto" {...props} />
                  ),
                  code: ({node, inline, ...props}) => (
                    inline 
                      ? <code className="bg-gray-100 px-1 rounded" {...props} />
                      : <code className="block" {...props} />
                  ),
                }}
              >
                {ticket.description}
              </ReactMarkdown>
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
                    <Badge className="ml-2 bg-purple-100 text-purple-800">
                      AI Generated
                    </Badge>
                  )}
                  {message.visibility === 'internal' && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800">
                      Internal Note
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(message.created_at)}
                  {message.edited_at && (
                    <span className="ml-1">(edited)</span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-900 prose prose-sm max-w-none">
                <ReactMarkdown 
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    p: ({node, ...props}) => <p className="my-2" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="my-1" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-gray-200 pl-4 my-2 italic" {...props} />
                    ),
                    pre: ({node, ...props}) => (
                      <pre className="bg-gray-100 p-4 rounded-md my-2 overflow-x-auto" {...props} />
                    ),
                    code: ({node, inline, ...props}) => (
                      inline 
                        ? <code className="bg-gray-100 px-1 rounded" {...props} />
                        : <code className="block" {...props} />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <MessageEditor
            content={messageContent}
            onChange={setMessageContent}
            onSubmit={handleSendMessage}
            disabled={isLoading}
          />
          {error && (
            <div className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
} 