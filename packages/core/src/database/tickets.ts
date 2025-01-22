import { SupabaseClient } from '@supabase/supabase-js'
import { 
  Ticket, 
  TicketWithUsers, 
  CreateTicketData, 
  UpdateTicketData,
  TicketFilters 
} from '../types'
import { DatabaseError, wrapDbError } from './errors'
import { USER_FIELDS, applyPagination } from './utils'

// Constants
const MAX_ACTIVE_TICKETS = 10

// Ticket Operations
export async function createTicket(
  supabase: SupabaseClient,
  data: CreateTicketData
): Promise<Ticket> {
  try {
    // Check active ticket count for customers
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('customer_email', data.customerEmail)
      .in('status', ['open', 'pending'])
      .single()

    if (count && count >= MAX_ACTIVE_TICKETS) {
      throw new DatabaseError(
        `Maximum number of active tickets (${MAX_ACTIVE_TICKETS}) reached`,
        'createTicket'
      )
    }

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        title: data.title,
        description: data.description,
        status: data.status || 'open',
        priority: data.priority || 'medium',
        tags: data.tags || [],
        customer_email: data.customerEmail,
        created_by: data.createdBy,
        custom_fields: data.customFields || {}
      })
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to create ticket', 'createTicket', error)
    if (!ticket) throw new DatabaseError('Failed to create ticket', 'createTicket')
    return ticket
  } catch (error) {
    throw wrapDbError('createTicket', error)
  }
}

export async function getTicket(
  supabase: SupabaseClient,
  ticketId: string
): Promise<TicketWithUsers | null> {
  try {
    console.log('Getting ticket with ID:', ticketId) // Debug log
    const query = supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', ticketId)
      .single()

    console.log('Query:', query) // Debug the query
    const { data, error } = await query

    console.log('Ticket query result:', { data, error }) // Debug log with better formatting
    if (error) {
      console.error('Database error:', error) // Debug the error
      throw new DatabaseError('Failed to get ticket', 'getTicket', error)
    }
    return data
  } catch (error) {
    console.error('Caught error:', error) // Debug any caught errors
    throw wrapDbError('getTicket', error)
  }
}

export async function updateTicket(
  supabase: SupabaseClient,
  ticketId: string,
  data: UpdateTicketData
): Promise<TicketWithUsers> {
  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.assignedTo !== undefined && { assigned_to: data.assignedTo }),
        ...(data.tags && { tags: data.tags }),
        ...(data.customFields && { custom_fields: data.customFields })
      })
      .eq('ticket_id', ticketId)
      .select(`
        *,
        created_by_user:users!created_by_fkey(${USER_FIELDS.select}),
        assigned_to_user:users!assigned_to_fkey(${USER_FIELDS.select})
      `)
      .single()

    if (error) throw new DatabaseError('Failed to update ticket', 'updateTicket', error)
    if (!ticket) throw new DatabaseError('Ticket not found', 'updateTicket')
    return ticket
  } catch (error) {
    throw wrapDbError('updateTicket', error)
  }
}

export async function deleteTicket(
  supabase: SupabaseClient,
  ticketId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('ticket_id', ticketId)

    if (error) throw new DatabaseError('Failed to delete ticket', 'deleteTicket', error)
  } catch (error) {
    throw wrapDbError('deleteTicket', error)
  }
}

export async function listTickets(
  supabase: SupabaseClient,
  filters?: TicketFilters
): Promise<Ticket[]> {
  try {
    let query = supabase
      .from('tickets')
      .select('*')  // Just select all ticket fields, no joins needed
      .order('created_at', { ascending: false })

    // Apply filters if provided
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo)
    }
    if (filters?.createdBy) {
      query = query.eq('created_by', filters.createdBy)
    }
    if (filters?.customerEmail) {
      query = query.eq('customer_email', filters.customerEmail)
    }
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
      )
    }
    if (filters?.tags?.length) {
      query = query.contains('tags', filters.tags)
    }

    query = applyPagination(query, filters)
    const { data, error } = await query
    console.log('Raw ticket data:', JSON.stringify(data, null, 2)) // Debug full ticket data

    if (error) throw new DatabaseError('Failed to list tickets', 'listTickets', error)
    return data || []
  } catch (error) {
    console.error('List tickets error:', error) // Debug any errors
    throw wrapDbError('listTickets', error)
  }
}

export async function assignTicket(
  supabase: SupabaseClient,
  ticketId: string,
  userId?: string
): Promise<TicketWithUsers> {
  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ assigned_to: userId })
      .eq('ticket_id', ticketId)
      .select(`
        *,
        created_by_user:users!created_by_fkey(${USER_FIELDS.select}),
        assigned_to_user:users!assigned_to_fkey(${USER_FIELDS.select})
      `)
      .single()

    if (error) throw new DatabaseError('Failed to assign ticket', 'assignTicket', error)
    if (!ticket) throw new DatabaseError('Ticket not found', 'assignTicket')
    return ticket
  } catch (error) {
    throw wrapDbError('assignTicket', error)
  }
} 