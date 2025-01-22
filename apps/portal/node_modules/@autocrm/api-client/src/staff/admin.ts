import { SupabaseClient } from '@supabase/supabase-js'
import { 
  Ticket,
  User,
  UserRole,
  TicketFilters
} from '@autocrm/core'
import { 
  listTickets,
  assignTicket,
  deleteTicket,
  updateUserRole,
  listUsers
} from '@autocrm/core'
import { BaseStaffAPI } from './base'

/**
 * AdminAPI provides admin-specific functionality:
 * - Full ticket management
 * - User role management
 * - System-wide access
 */
export class AdminAPI extends BaseStaffAPI {
  constructor(
    supabase: SupabaseClient,
    staffEmail: string,
    staffId: string
  ) {
    super(supabase, staffEmail, staffId)
  }

  /**
   * List all tickets with optional filters
   */
  async listAllTickets(filters?: TicketFilters): Promise<Ticket[]> {
    return listTickets(this.supabase, filters)
  }

  /**
   * Assign a ticket to a specific agent
   */
  async assignTicketToAgent(id: string, agentId: string): Promise<Ticket> {
    return assignTicket(this.supabase, id, agentId)
  }

  /**
   * Delete a ticket
   */
  async deleteTicket(id: string): Promise<void> {
    return deleteTicket(this.supabase, id)
  }

  /**
   * List all users
   */
  async listUsers(): Promise<User[]> {
    return listUsers(this.supabase)
  }

  /**
   * Update a user's role
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return updateUserRole(this.supabase, userId, role)
  }
} 