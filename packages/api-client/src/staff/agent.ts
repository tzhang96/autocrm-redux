import { SupabaseClient } from '@supabase/supabase-js'
import { Ticket } from '@autocrm/core'
import { listTickets, assignTicket } from '@autocrm/core'
import { BaseStaffAPI } from './base'

/**
 * AgentAPI provides agent-specific functionality:
 * - View unassigned tickets
 * - View tickets assigned to themselves
 * - Self-assign tickets
 */
export class AgentAPI extends BaseStaffAPI {
  constructor(
    supabase: SupabaseClient,
    staffEmail: string,
    staffId: string
  ) {
    super(supabase, staffEmail, staffId)
  }

  /**
   * List tickets assigned to this agent
   */
  async listAssignedTickets(): Promise<Ticket[]> {
    return listTickets(this.supabase, {
      assignedTo: this.staffId
    })
  }

  /**
   * List all unassigned tickets
   */
  async listUnassignedTickets(): Promise<Ticket[]> {
    return listTickets(this.supabase, {
      assignedTo: null
    })
  }

  /**
   * Assign a ticket to this agent
   */
  async assignTicketToSelf(id: string): Promise<Ticket> {
    return assignTicket(this.supabase, id, this.staffId)
  }
} 