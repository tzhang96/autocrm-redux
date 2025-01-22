'use server'

import { CustomerAPI } from '@autocrm/api-client'
import { createServerSupabaseClient } from '@/utils/supabase-server'
import { redirect } from 'next/navigation'
import { Message } from '@autocrm/core'

export async function sendMessage(ticketId: string, content: string): Promise<Message[]> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) {
    redirect('/login')
  }

  const customerApi = new CustomerAPI(supabase, user.email)
  await customerApi.replyToTicket(ticketId, content)
  return customerApi.getTicketMessages(ticketId)
} 