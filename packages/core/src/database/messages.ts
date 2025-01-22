import { SupabaseClient } from '@supabase/supabase-js'
import { 
  Message, 
  CreateMessageData, 
  UpdateMessageData,
  MessageFilters 
} from '../types'
import { DatabaseError, wrapDbError } from './errors'
import { MESSAGE_FIELDS, applyPagination } from './utils'

// Message Operations
export async function createMessage(
  supabase: SupabaseClient,
  data: CreateMessageData
): Promise<Message> {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        ticket_id: data.ticketId,
        user_id: data.userId,
        content: data.content,
        visibility: data.visibility || 'public',
        message_type: data.messageType || 'text',
        is_ai_generated: data.isAiGenerated || false,
        metadata: data.metadata || {}
      })
      .select(MESSAGE_FIELDS.select)
      .single()

    if (error) throw new DatabaseError('Failed to create message', 'createMessage', error)
    if (!message) throw new DatabaseError('Failed to create message', 'createMessage')
    return message
  } catch (error) {
    throw wrapDbError('createMessage', error)
  }
}

export async function getMessage(
  supabase: SupabaseClient,
  id: string
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(MESSAGE_FIELDS.select)
      .eq('id', id)
      .single()

    if (error) throw new DatabaseError('Failed to get message', 'getMessage', error)
    return data
  } catch (error) {
    throw wrapDbError('getMessage', error)
  }
}

export async function updateMessage(
  supabase: SupabaseClient,
  id: string,
  data: UpdateMessageData
): Promise<Message> {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .update({
        ...(data.content && { content: data.content }),
        ...(data.metadata && { metadata: data.metadata }),
        edited_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(MESSAGE_FIELDS.select)
      .single()

    if (error) throw new DatabaseError('Failed to update message', 'updateMessage', error)
    if (!message) throw new DatabaseError('Message not found', 'updateMessage')
    return message
  } catch (error) {
    throw wrapDbError('updateMessage', error)
  }
}

export async function deleteMessage(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError('Failed to delete message', 'deleteMessage', error)
  } catch (error) {
    throw wrapDbError('deleteMessage', error)
  }
}

export async function getTicketMessages(
  supabase: SupabaseClient,
  ticketId: string,
  filters?: MessageFilters
): Promise<Message[]> {
  try {
    let query = supabase
      .from('messages')
      .select(MESSAGE_FIELDS.select)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility)
    }

    if (filters?.type) {
      query = query.eq('message_type', filters.type)
    }

    query = applyPagination(query, filters)
    const { data, error } = await query

    if (error) throw new DatabaseError('Failed to get ticket messages', 'getTicketMessages', error)
    return data || []
  } catch (error) {
    throw wrapDbError('getTicketMessages', error)
  }
} 