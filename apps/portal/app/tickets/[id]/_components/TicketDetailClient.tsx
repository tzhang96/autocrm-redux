'use client'

import { Message, Ticket } from '@autocrm/core'
import { useState, useEffect } from 'react'
import { sendMessage } from '../actions'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { createBrowserClient } from '@supabase/ssr'

interface TicketDetailClientProps {
  ticket: Ticket
  initialMessages: Message[]
}

type MarkdownComponentProps = {
  children?: React.ReactNode
  className?: string
  [key: string]: unknown
}

type CodeComponentProps = MarkdownComponentProps & {
  inline?: boolean
}

const markdownComponents = {
  p: ({children, ...props}: MarkdownComponentProps) => (
    <p className="my-2" {...props}>{children}</p>
  ),
  a: ({children, ...props}: MarkdownComponentProps) => (
    <a className="text-blue-600 hover:underline" {...props}>{children}</a>
  ),
  ul: ({children, ...props}: MarkdownComponentProps) => (
    <ul className="list-disc pl-4 my-2" {...props}>{children}</ul>
  ),
  ol: ({children, ...props}: MarkdownComponentProps) => (
    <ol className="list-decimal pl-4 my-2" {...props}>{children}</ol>
  ),
  li: ({children, ...props}: MarkdownComponentProps) => (
    <li className="my-1" {...props}>{children}</li>
  ),
  h1: ({children, ...props}: MarkdownComponentProps) => (
    <h1 className="text-2xl font-bold my-4" {...props}>{children}</h1>
  ),
  h2: ({children, ...props}: MarkdownComponentProps) => (
    <h2 className="text-xl font-bold my-3" {...props}>{children}</h2>
  ),
  h3: ({children, ...props}: MarkdownComponentProps) => (
    <h3 className="text-lg font-bold my-2" {...props}>{children}</h3>
  ),
  blockquote: ({children, ...props}: MarkdownComponentProps) => (
    <blockquote className="border-l-4 border-gray-200 pl-4 my-2 italic" {...props}>{children}</blockquote>
  ),
  pre: ({children, ...props}: MarkdownComponentProps) => (
    <pre className="bg-gray-100 p-4 rounded-md my-2 overflow-x-auto" {...props}>{children}</pre>
  ),
  code: ({children, inline, ...props}: CodeComponentProps) => (
    inline 
      ? <code className="bg-gray-100 px-1 rounded" {...props}>{children}</code>
      : <code className="block" {...props}>{children}</code>
  ),
}

export function TicketDetailClient({ ticket, initialMessages }: TicketDetailClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
      }
    })
  }, [])

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

  const getMessageSender = (message: Message) => {
    if (!userId) return 'Unknown'
    return message.user_id === userId ? 'You' : 'Help Staff'
  }

  const isOwnMessage = (message: Message) => {
    return message.user_id === userId
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
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 prose prose-sm max-w-none">
              <ReactMarkdown 
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={markdownComponents}
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
          {messages.map((message) => {
            const isOwn = isOwnMessage(message)
            return (
              <div 
                key={message.id} 
                className={`rounded-lg p-4 ${
                  isOwn 
                    ? 'bg-indigo-50 ml-8 border border-indigo-100' 
                    : 'bg-gray-50 mr-8 border border-gray-200'
                }`}
              >
                <div className={`flex justify-between items-start mb-2 ${
                  isOwn ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    {isOwn ? (
                      <>
                        {message.is_ai_generated && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            AI Generated
                          </span>
                        )}
                        <span className="font-medium text-indigo-600">You</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-emerald-600">Help Staff</span>
                        {message.is_ai_generated && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            AI Generated
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(message.created_at)}
                    {message.edited_at && (
                      <span className="ml-1">(edited)</span>
                    )}
                  </div>
                </div>
                <div className={`text-sm prose prose-sm max-w-none ${
                  isOwn ? 'text-indigo-900' : 'text-gray-900'
                }`}>
                  <ReactMarkdown 
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            rows={3}
            placeholder="Type your message... (Markdown and basic HTML supported)"
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
                Press Enter to send. Use Shift + Enter for a new line. Markdown and basic HTML supported.
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