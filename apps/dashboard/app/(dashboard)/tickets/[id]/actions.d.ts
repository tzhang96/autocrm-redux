declare module '@/app/(dashboard)/tickets/[id]/actions' {
  import { Message, TicketStatus, TicketPriority } from '@autocrm/core'

  interface Agent {
    user_id: string
    name: string
    email: string
    role: 'agent' | 'admin'
  }

  export function sendMessage(
    ticket_id: string, 
    content: string,
    visibility?: 'public' | 'internal'
  ): Promise<Message[]>

  export function updateTicketStatus(
    ticket_id: string,
    status: TicketStatus
  ): Promise<void>

  export function updateTicketPriority(
    ticket_id: string,
    priority: TicketPriority
  ): Promise<void>

  export function assignTicket(
    ticket_id: string,
    agent_id: string | null
  ): Promise<void>

  export function getAvailableAgents(): Promise<Agent[]>
} 