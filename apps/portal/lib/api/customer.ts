import { SupabaseClient } from '@supabase/supabase-js'
import {
  Ticket,
  Message,
  TicketFilters,
  MessageFilters,
  TicketPriority,
  CreateTicketData,
  CreateMessageData
} from '@autocrm/core'
import {
  createTicket,
  getTicket,
  listTickets,
  createMessage,
  getTicketMessages
} from '@autocrm/core'

/**
 * CustomerAPI provides a restricted interface for customer operations.
 * It ensures customers can only:
 * - View their own tickets
 * - Create tickets for themselves
 * - Send public messages on their tickets
 */
export class CustomerAPI {
  private userId: string | null = null

  constructor(
    private supabase: SupabaseClient,
    private customerEmail: string
  ) {}

  private async ensureUserId(): Promise<string> {
    if (!this.userId) {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }
      this.userId = user.id
    }
    return this.userId
  }

  /**
   * List tickets created by the customer
   */
  async listMyTickets(filters?: Omit<TicketFilters, 'customerEmail'>): Promise<Ticket[]> {
    return listTickets(this.supabase, {
      ...filters,
      customerEmail: this.customerEmail
    })
  }

  /**
   * Get a specific ticket if owned by the customer
   */
  async getMyTicket(ticketId: string): Promise<Ticket | null> {
    const ticket = await getTicket(this.supabase, ticketId)
    if (!ticket || ticket.customer_email !== this.customerEmail) {
      return null
    }
    return ticket
  }

  /**
   * Create a new ticket for the customer
   */
  async createTicket(data: {
    title: string
    description: string
    priority: TicketPriority
  }): Promise<Ticket> {
    const userId = await this.ensureUserId()
    return createTicket(this.supabase, {
      ...data,
      customerEmail: this.customerEmail,
      createdBy: userId
    })
  }

  /**
   * Reply to a ticket (public messages only)
   */
  async replyToTicket(ticketId: string, content: string): Promise<Message | null> {
    // First verify the customer owns this ticket
    const ticket = await this.getMyTicket(ticketId)
    if (!ticket) {
      return null
    }

    const userId = await this.ensureUserId()
    return createMessage(this.supabase, {
      ticketId,
      userId,
      content,
      visibility: 'public',
      messageType: 'text',
      isAiGenerated: false
    })
  }

  /**
   * Get messages for a ticket (public messages only)
   */
  async getTicketMessages(
    ticketId: string,
    filters?: Omit<MessageFilters, 'visibility'>
  ): Promise<Message[]> {
    // First verify the customer owns this ticket
    const ticket = await this.getMyTicket(ticketId)
    if (!ticket) {
      return []
    }

    return getTicketMessages(this.supabase, ticketId, {
      ...filters,
      visibility: 'public'
    })
  }
} 