'use server'

import { createServerSupabaseClient } from '@/utils/supabase-server'
import { redirect } from 'next/navigation'
import { Message } from '@autocrm/core'

export async function sendMessage(ticket_id: string, content: string): Promise<Message[]> {
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
        visibility: 'public' // Can be extended to support internal notes
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