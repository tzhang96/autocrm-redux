'use server'

import { createServerSupabaseClient } from '@/utils/supabase-server'
import { TicketFilters, TicketStatus, TicketPriority } from '@autocrm/core'
import { redirect } from 'next/navigation'

export async function fetchTickets(filters: TicketFilters) {
  const supabase = await createServerSupabaseClient()

  try {
    // Get current user and their role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get user's role and user_id from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, user_id')
      .eq('user_id', user.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      throw new Error('Could not fetch user role')
    }
    if (!userData) {
      throw new Error('User not found')
    }

    // First get total count without pagination
    let countQuery = supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })

    // Apply role-based filtering to count query
    if (userData.role === 'agent') {
      countQuery = countQuery.or(`assigned_to.eq.${userData.user_id},assigned_to.is.null`)
        .not('created_by', 'eq', userData.user_id)
    }

    const { count, error: countError } = await countQuery
    if (countError) {
      console.error('Count query error:', countError)
      throw new Error(`Failed to count tickets: ${countError.message}`)
    }

    // Then get paginated results with all fields
    let query = supabase
      .from('tickets')
      .select(`
        *,
        created_by_user:users!tickets_created_by_fkey(user_id, email, name),
        assigned_to_user:users!tickets_assigned_to_fkey(user_id, email, name)
      `)

    // Apply role-based filtering
    if (userData.role === 'agent') {
      // Agents see:
      // 1. Tickets assigned to them
      // 2. Unassigned tickets (except ones they created as a customer)
      query = query.or(`assigned_to.eq.${userData.user_id},assigned_to.is.null`)
        .not('created_by', 'eq', userData.user_id)
    }

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    // Handle assigned_to filter
    if (typeof filters.assignedTo !== 'undefined') {
      if (filters.assignedTo === null) {
        query = query.is('assigned_to', null)
      } else {
        query = query.eq('assigned_to', filters.assignedTo)
      }
    }

    if (filters.createdBy) {
      query = query.eq('created_by', filters.createdBy)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    // Apply sorting
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? true : false
      switch (filters.sortBy) {
        case 'created_at':
          query = query.order('created_at', { ascending: !order })
          break
        case 'updated_at':
          query = query.order('updated_at', { ascending: !order })
          break
        case 'last_activity_at':
          query = query.order('last_activity_at', { ascending: !order })
          break
        case 'priority':
          query = query.order('priority', { ascending: !order })
          break
        case 'status':
          query = query.order('status', { ascending: !order })
          break
      }
    }

    // Apply pagination
    if (typeof filters.offset !== 'undefined' && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1)
    }

    const { data: tickets, error } = await query
    if (error) {
      console.error('Ticket fetch error:', error)
      throw new Error(`Failed to fetch tickets: ${error.message}`)
    }

    return {
      tickets: tickets || [],
      total: count || 0
    }
  } catch (error) {
    console.error('fetchTickets error:', error)
    throw error
  }
}

export async function bulkUpdateTicketStatus(
  ticket_ids: string[],
  status: TicketStatus
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/auth/sign-in')
    }

    // Update tickets status
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        status,
        last_activity_at: new Date().toISOString()
      })
      .in('ticket_id', ticket_ids)

    if (updateError) {
      throw updateError
    }

    // Add system messages for each ticket
    const messages = ticket_ids.map(ticket_id => ({
      ticket_id,
      user_id: user.id,
      content: `Status changed to ${status}`,
      message_type: 'status_change',
      visibility: 'public'
    }))

    const { error: messageError } = await supabase
      .from('messages')
      .insert(messages)

    if (messageError) {
      throw messageError
    }
  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
}

export async function bulkUpdateTicketPriority(
  ticket_ids: string[],
  priority: TicketPriority
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/auth/sign-in')
    }

    // Update tickets priority
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        priority,
        last_activity_at: new Date().toISOString()
      })
      .in('ticket_id', ticket_ids)

    if (updateError) {
      throw updateError
    }

    // Add system messages for each ticket
    const messages = ticket_ids.map(ticket_id => ({
      ticket_id,
      user_id: user.id,
      content: `Priority changed to ${priority}`,
      message_type: 'system',
      visibility: 'public'
    }))

    const { error: messageError } = await supabase
      .from('messages')
      .insert(messages)

    if (messageError) {
      throw messageError
    }
  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
}

export async function bulkAssignTickets(
  ticket_ids: string[],
  agent_id: string | null
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/auth/sign-in')
    }

    // Get the current user's role
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userError) {
      throw userError
    }

    // Check permissions
    if (currentUser.role !== 'admin') {
      // Agents can only assign themselves and cannot unassign
      if (agent_id === null) {
        throw new Error('Only administrators can unassign tickets')
      }
      if (agent_id !== user.id) {
        throw new Error('Agents can only assign tickets to themselves')
      }
    }

    // Update tickets assignment
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        assigned_to: agent_id,
        last_activity_at: new Date().toISOString()
      })
      .in('ticket_id', ticket_ids)

    if (updateError) {
      throw updateError
    }

    // Get agent name if assigning
    let assignmentMessage = 'Ticket unassigned'
    if (agent_id) {
      const { data: agent } = await supabase
        .from('users')
        .select('name, email')
        .eq('user_id', agent_id)
        .single()

      assignmentMessage = `Ticket assigned to ${agent?.name || agent?.email || 'unknown agent'}`
    }

    // Add system messages for each ticket
    const messages = ticket_ids.map(ticket_id => ({
      ticket_id,
      user_id: user.id,
      content: assignmentMessage,
      message_type: 'assignment_change',
      visibility: 'public'
    }))

    const { error: messageError } = await supabase
      .from('messages')
      .insert(messages)

    if (messageError) {
      throw messageError
    }
  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
} 