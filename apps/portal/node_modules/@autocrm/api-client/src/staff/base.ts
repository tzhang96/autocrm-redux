import { SupabaseClient } from '@supabase/supabase-js'
import {
  Ticket,
  Message,
  TicketStatus,
  MessageVisibility,
  CreateTicketData,
  User
} from '@autocrm/core'
import {
  createTicket,
  getTicket,
  updateTicket,
  createMessage,
  getTicketMessages
} from '@autocrm/core'

/**
 * Base interface for staff operations (shared between agents and admins)
 */
export interface StaffAPI {
  getTicket(id: string): Promise<Ticket | null>;
  createTicketForCustomer(customerEmail: string, data: CreateTicketData): Promise<Ticket>;
  updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket>;
  addMessage(ticketId: string, content: string, visibility: MessageVisibility): Promise<Message>;
  getTicketMessages(ticketId: string): Promise<Message[]>;
}

/**
 * Base class implementing shared staff functionality
 */
export abstract class BaseStaffAPI implements StaffAPI {
  constructor(
    protected supabase: SupabaseClient,
    protected staffEmail: string,
    protected staffId: string
  ) {}

  async getTicket(id: string): Promise<Ticket | null> {
    return getTicket(this.supabase, id)
  }

  async createTicketForCustomer(
    customerEmail: string,
    data: Omit<CreateTicketData, 'customerEmail' | 'createdBy'>
  ): Promise<Ticket> {
    return createTicket(this.supabase, {
      ...data,
      customerEmail,
      createdBy: this.staffId
    })
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
    return updateTicket(this.supabase, id, { status })
  }

  async addMessage(
    ticketId: string,
    content: string,
    visibility: MessageVisibility
  ): Promise<Message> {
    return createMessage(this.supabase, {
      ticketId,
      userId: this.staffId,
      content,
      visibility,
      messageType: 'text',
      isAiGenerated: false
    })
  }

  async getTicketMessages(ticketId: string): Promise<Message[]> {
    return getTicketMessages(this.supabase, ticketId)
  }
} 