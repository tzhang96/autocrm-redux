'use server'

import { createServerClient } from '@autocrm/auth'
import { redirect } from 'next/navigation'
import { Message, TicketStatus, TicketPriority } from '@autocrm/core'
import type { TicketActions } from './types'
import { Database } from '@autocrm/core'

type Ticket = Database['public']['Tables']['tickets']['Row']

export const sendMessage: TicketActions['sendMessage'] = async (
  ticket_id, 
  content,
  visibility = 'public'
) => {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/auth/sign-in')
    }

    // Send message directly using Supabase since we're in the admin dashboard
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id,
        content,
        user_id: user.id,
        visibility
      })
      .select()
      .single()

    if (messageError) {
      throw messageError
    }

    // Update ticket's last activity
    await supabase
      .from('tickets')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('ticket_id', ticket_id)

    // Fetch all messages for the ticket
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(name, email)
      `)
      .eq('ticket_id', ticket_id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw messagesError
    }

    return messages || []
  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
}

export const updateTicketStatus: TicketActions['updateTicketStatus'] = async (
  ticket_id,
  status
) => {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/auth/sign-in')
    }

    // Update ticket status
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        status,
        last_activity_at: new Date().toISOString()
      })
      .eq('ticket_id', ticket_id)

    if (updateError) {
      throw updateError
    }

    // Add a system message about the status change
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id,
        user_id: user.id,
        content: `Status changed to ${status}`,
        message_type: 'status_change',
        visibility: 'public'
      })

    if (messageError) {
      throw messageError
    }
  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
}

export const updateTicketPriority: TicketActions['updateTicketPriority'] = async (
  ticket_id,
  priority
) => {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/auth/sign-in')
    }

    // Update ticket priority
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        priority,
        last_activity_at: new Date().toISOString()
      })
      .eq('ticket_id', ticket_id)

    if (updateError) {
      throw updateError
    }

    // Add a system message about the priority change
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id,
        user_id: user.id,
        content: `Priority changed to ${priority}`,
        message_type: 'system',
        visibility: 'public'
      })

    if (messageError) {
      throw messageError
    }
  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
}

export const assignTicket: TicketActions['assignTicket'] = async (
  ticket_id: string,
  agent_id: string | null
) => {
  try {
    const supabase = await createServerClient()
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

    // Update ticket assignment
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        assigned_to: agent_id,
        last_activity_at: new Date().toISOString()
      })
      .eq('ticket_id', ticket_id)

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

    // Add a system message about the assignment change
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id,
        user_id: user.id,
        content: assignmentMessage,
        message_type: 'assignment_change',
        visibility: 'public'
      })

    if (messageError) {
      throw messageError
    }
  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
}

export const getAvailableAgents: TicketActions['getAvailableAgents'] = async () => {
  'use server'
  try {
    console.log('=== Starting getAvailableAgents ===')
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('No authenticated user found')
      throw new Error('Not authenticated')
    }

    console.log('Current auth user:', user.id)

    // Get the current user's role
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role, user_id')
      .eq('user_id', user.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      throw new Error('Could not fetch user role')
    }

    if (!currentUser) {
      console.error('No user found in database')
      throw new Error('User not found in database')
    }

    console.log('Current user role:', currentUser.role)

    // If user is an agent, only return themselves
    if (currentUser.role === 'agent') {
      console.log('User is an agent, fetching their own details')
      const { data: agent, error: agentError } = await supabase
        .from('users')
        .select('user_id, name, email, role')
        .eq('user_id', user.id)
        .single()

      if (agentError) {
        console.error('Agent fetch error:', agentError)
        throw new Error('Could not fetch agent details')
      }

      console.log('Agent details:', agent)
      return agent ? [agent] : []
    }

    // If user is an admin, return all agents and admins
    console.log('User is an admin, fetching all agents and admins')
    
    // Get both agents and admins
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, name, email, role')
      .or('role.eq.agent,role.eq.admin')
      .order('role', { ascending: false }) // admins first, then agents

    if (usersError) {
      console.error('Users fetch error:', usersError)
      throw new Error('Could not fetch users')
    }

    console.log('Available users:', users)
    return users || []
  } catch (error) {
    console.error('getAvailableAgents error:', error)
    throw error
  }
}

export async function getTicket(ticketId: string) {
  try {
    const supabase = await createServerClient()
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', ticketId)
      .single()

    if (error) throw error
    return ticket
  } catch (error) {
    throw error
  }
}

export async function updateTicket(ticketId: string, updates: Partial<Ticket>) {
  try {
    const supabase = await createServerClient()
    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('ticket_id', ticketId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    throw error
  }
}

export async function addMessage(ticketId: string, content: string) {
  try {
    const supabase = await createServerClient()
    const { error } = await supabase
      .from('messages')
      .insert({
        ticket_id: ticketId,
        content,
      })

    if (error) throw error
    return { success: true }
  } catch (error) {
    throw error
  }
} 