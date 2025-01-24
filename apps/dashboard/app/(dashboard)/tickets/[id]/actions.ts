'use server'

import { createServerSupabaseClient } from '@/utils/supabase-server'
import { redirect } from 'next/navigation'
import { Message, TicketStatus, TicketPriority } from '@autocrm/core'
import type { TicketActions } from './types'

export const sendMessage: TicketActions['sendMessage'] = async (
  ticket_id, 
  content,
  visibility = 'public'
) => {
  try {
    const supabase = await createServerSupabaseClient()
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
    const supabase = await createServerSupabaseClient()
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
    const supabase = await createServerSupabaseClient()
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
      // Agents can only assign themselves
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

    // Add a system message about the assignment change
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id,
        user_id: user.id,
        content: agent_id 
          ? `Ticket assigned to ${agent_id === user.id ? 'self' : 'another agent'}`
          : 'Ticket unassigned',
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

    // If user is an agent, only return themselves
    if (currentUser.role === 'agent') {
      const { data: agent, error: agentError } = await supabase
        .from('users')
        .select('user_id, name, email, role')
        .eq('user_id', user.id)
        .single()

      if (agentError) {
        throw agentError
      }

      return [agent]
    }

    // If user is an admin, return all agents and admins
    const { data: agents, error: agentsError } = await supabase
      .from('users')
      .select('user_id, name, email, role')
      .in('role', ['agent', 'admin'])
      .order('name')

    if (agentsError) {
      throw agentsError
    }

    return agents || []
  } catch (error) {
    console.error('Server action error:', error)
    throw error
  }
} 