'use client'

import { Message, Ticket, TicketStatus, TicketPriority } from '@autocrm/core'
import { useState, useEffect } from 'react'
import * as ticketActions from '@/app/(dashboard)/tickets/[id]/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ReactMarkdown, { Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { MessageEditor } from './MessageEditor'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface Agent {
  user_id: string
  name: string
  email: string
  role: 'agent' | 'admin'
}

interface TicketDetailClientProps {
  ticket: Ticket
  initialMessages: Message[]
}

const statusOptions: TicketStatus[] = ['open', 'pending', 'resolved', 'closed']
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high']

const MarkdownComponents: Components = {
  p: (props) => <p className="my-2" {...props} />,
  a: (props) => <a className="text-blue-600 hover:underline" {...props} />,
  ul: (props) => <ul className="list-disc pl-4 my-2" {...props} />,
  ol: (props) => <ol className="list-decimal pl-4 my-2" {...props} />,
  li: (props) => <li className="my-1" {...props} />,
  h1: (props) => <h1 className="text-2xl font-bold my-4" {...props} />,
  h2: (props) => <h2 className="text-xl font-bold my-3" {...props} />,
  h3: (props) => <h3 className="text-lg font-bold my-2" {...props} />,
  blockquote: (props) => <blockquote className="border-l-4 border-gray-200 pl-4 my-2 italic" {...props} />,
  pre: (props) => <pre className="bg-gray-100 p-4 rounded-md my-2 overflow-x-auto" {...props} />,
  code: (props) => {
    const isInline = !props.node?.position?.start.line
    return isInline 
      ? <code className="bg-gray-100 px-1 rounded" {...props} />
      : <code className="block" {...props} />
  },
}

export function TicketDetailClient({ ticket: initialTicket, initialMessages }: TicketDetailClientProps) {
  const router = useRouter()
  const [ticket, setTicket] = useState(initialTicket)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])
  const [isGeneratingAIReply, setIsGeneratingAIReply] = useState(false)

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setIsLoading(true)
        console.log('Starting to load agents...')
        const agents = await ticketActions.getAvailableAgents()
        console.log('Server response:', agents)
        if (!Array.isArray(agents)) {
          console.error('Expected array of agents but got:', typeof agents)
          throw new Error('Invalid response format')
        }
        setAvailableAgents(agents)
        console.log('Successfully set agents:', agents.length)
      } catch (err) {
        console.error('Failed to load agents:', err)
        if (err instanceof Error) {
          console.error('Error details:', err.message)
          console.error('Error stack:', err.stack)
        }
        setError('Failed to load available agents. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    loadAgents()
  }, [])

  const handleSendMessage = async (visibility: 'public' | 'internal') => {
    const content = messageContent.trim()
    if (!content || isLoading) return

    try {
      setIsLoading(true)
      setError(null)
      const updatedMessages = await ticketActions.sendMessage(ticket.ticket_id, content, visibility)
      setMessages(updatedMessages)
      setMessageContent('')
    } catch (err) {
      console.error('Client error:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (isLoading || ticket.status === newStatus) return

    try {
      setIsLoading(true)
      setError(null)
      await ticketActions.updateTicketStatus(ticket.ticket_id, newStatus)
      setTicket({ ...ticket, status: newStatus })
      router.refresh() // Refresh the page to get updated messages
    } catch (err) {
      console.error('Client error:', err)
      setError('Failed to update ticket status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (isLoading || ticket.priority === newPriority) return

    try {
      setIsLoading(true)
      setError(null)
      await ticketActions.updateTicketPriority(ticket.ticket_id, newPriority)
      setTicket({ ...ticket, priority: newPriority })
      router.refresh() // Refresh the page to get updated messages
    } catch (err) {
      console.error('Client error:', err)
      setError('Failed to update ticket priority. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignmentChange = async (agentId: string) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const newAssigned_to = agentId === '' ? null : agentId;
      await ticketActions.assignTicket(ticket.ticket_id, newAssigned_to);
      setTicket({ 
        ...ticket, 
        assigned_to: newAssigned_to === null ? undefined : newAssigned_to 
      });
      router.refresh();
      toast.success('Ticket assignment updated successfully');
    } catch (err) {
      console.error('Client error:', err);
      setError('Failed to update ticket assignment. Please try again.');
      toast.error('Failed to update ticket assignment');
    } finally {
      setIsLoading(false);
    }
  };

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

  const getAssignedAgentName = () => {
    if (!ticket.assigned_to) return null
    const agent = availableAgents.find(a => a.user_id === ticket.assigned_to)
    return agent ? agent.name : 'Unknown Agent'
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await ticketActions.updateTicket(ticket.ticket_id, {
        status: ticket.status,
        priority: ticket.priority,
        assigned_to: ticket.assigned_to,
      })
      toast.success('Ticket updated successfully')
    } catch (error) {
      toast.error('Failed to update ticket')
    }
  }

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await ticketActions.addMessage(ticket.ticket_id, messageContent)
      setMessageContent('')
      toast.success('Message sent successfully')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleAIReply = async () => {
    if (isGeneratingAIReply) return;

    try {
      setIsGeneratingAIReply(true);
      const response = await fetch(`/api/tickets/${ticket.ticket_id}/ai-reply`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI reply');
      }

      const { reply } = await response.json();
      setMessageContent(reply);
      toast.success('AI reply generated');
    } catch (error) {
      console.error('Failed to generate AI reply:', error);
      toast.error('Failed to generate AI reply');
    } finally {
      setIsGeneratingAIReply(false);
    }
  };

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
                components={MarkdownComponents}
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
                  From: {message.user?.role === 'customer' 
                    ? `${message.user?.name || 'Customer'} (${message.user?.email})` 
                    : message.user?.name || message.user?.email || message.user_id}
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
                  components={MarkdownComponents}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <div className="flex gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={ticket.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                    disabled={isLoading || ticket.status === status}
                    className={ticket.status === status ? getStatusColor(status) : undefined}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Priority:</span>
              <div className="flex gap-2">
                {priorityOptions.map((priority) => (
                  <Button
                    key={priority}
                    variant={ticket.priority === priority ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePriorityChange(priority)}
                    disabled={isLoading || ticket.priority === priority}
                    className={ticket.priority === priority ? getPriorityColor(priority) : undefined}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Assigned to:</span>
              {availableAgents.length > 0 && availableAgents[0].role === 'agent' ? (
                ticket.assigned_to === availableAgents[0].user_id ? (
                  <span className="text-sm text-gray-700">Assigned to you</span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssignmentChange(availableAgents[0].user_id)}
                    disabled={isLoading}
                  >
                    Assign to Self
                  </Button>
                )
              ) : (
                <select
                  value={ticket.assigned_to ?? ''}
                  onChange={(e) => handleAssignmentChange(e.target.value)}
                  disabled={isLoading || availableAgents.length === 0}
                  className="w-[200px] rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="">Unassigned</option>
                  {availableAgents.map((agent) => (
                    <option key={agent.user_id} value={agent.user_id}>
                      {agent.name ? `${agent.name} (${agent.email})` : agent.email}
                    </option>
                  ))}
                </select>
              )}
              {availableAgents.length === 0 && !isLoading && (
                <span className="text-sm text-gray-500">No agents available</span>
              )}
              {isLoading && (
                <span className="text-sm text-gray-500">Loading...</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <MessageEditor
            content={messageContent}
            onChange={setMessageContent}
            onSubmit={handleSendMessage}
            onAIReply={handleAIReply}
            disabled={isLoading}
            isGeneratingAIReply={isGeneratingAIReply}
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