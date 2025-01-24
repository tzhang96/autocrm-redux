import { Message, TicketStatus, TicketPriority } from '@autocrm/core'

interface Agent {
  user_id: string
  name: string
  email: string
  role: 'agent' | 'admin'
}

export interface TicketActions {
  sendMessage: (
    ticket_id: string, 
    content: string,
    visibility?: 'public' | 'internal'
  ) => Promise<Message[]>

  updateTicketStatus: (
    ticket_id: string,
    status: TicketStatus
  ) => Promise<void>

  updateTicketPriority: (
    ticket_id: string,
    priority: TicketPriority
  ) => Promise<void>

  assignTicket: (
    ticket_id: string,
    agent_id: string | null
  ) => Promise<void>

  getAvailableAgents: () => Promise<Agent[]>
} 