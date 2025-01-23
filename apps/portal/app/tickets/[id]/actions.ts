'use server'

import { CustomerAPI } from '@autocrm/api-client'
import { createServerSupabaseClient } from '@/utils/supabase-server'
import { redirect } from 'next/navigation'
import { Message } from '@autocrm/core'

export async function sendMessage(ticketId: string, content: string): Promise<Message[]> {
  try {
    console.log('Server action: Sending message to ticket:', ticketId)
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.email) {
      console.error('Server action: No authenticated user')
      redirect('/login')
    }

    console.log('Server action: Creating CustomerAPI for user:', user.email)
    const customerApi = new CustomerAPI(supabase, user.email)
    
    console.log('Server action: Sending reply...')
    const reply = await customerApi.replyToTicket(ticketId, content)
    if (!reply) {
      throw new Error('Failed to send reply')
    }

    console.log('Server action: Getting updated messages...')
    const messages = await customerApi.getTicketMessages(ticketId)
    console.log('Server action: Returning', messages.length, 'messages')
    return messages
  } catch (error) {
    console.error('Server action error:', error)
    throw error // Re-throw to be caught by the client
  }
} 