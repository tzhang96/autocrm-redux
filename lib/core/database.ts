import { createClient } from '@/utils/supabase/server'
import { 
  User, 
  Ticket, 
  Message, 
  Attachment,
  UserRole,
  TicketStatus,
  TicketPriority,
  MessageVisibility,
  MessageType
} from './types'

// Types for create/update operations
export interface CreateTicketData {
  title: string
  description: string
  priority?: TicketPriority
  tags?: string[]
  createdBy: string
  customFields?: Record<string, any>
}

export interface UpdateTicketData {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  tags?: string[]
  assignedTo?: string
  customFields?: Record<string, any>
}

export interface CreateMessageData {
  ticketId: string
  userId: string
  content: string
  visibility?: MessageVisibility
  type?: MessageType
  isAiGenerated?: boolean
  metadata?: Record<string, any>
}

export interface UpdateMessageData {
  content?: string
  visibility?: MessageVisibility
  metadata?: Record<string, any>
}

// User Operations
export async function getUser(userId: string): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) throw error
  return data
}

export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listUsers(filters?: {
  role?: UserRole
  search?: string
  limit?: number
  offset?: number
}): Promise<User[]> {
  const supabase = await createClient()
  let query = supabase.from('users').select('*')

  if (filters?.role) {
    query = query.eq('role', filters.role)
  }

  if (filters?.search) {
    query = query.or(`email.ilike.%${filters.search}%,name.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Ticket Operations
export async function createTicket(data: CreateTicketData): Promise<Ticket> {
  const supabase = await createClient()
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      tags: data.tags || [],
      created_by: data.createdBy,
      custom_fields: data.customFields || {}
    })
    .select()
    .single()

  if (error) throw error
  return ticket
}

export async function getTicket(ticketId: string): Promise<Ticket | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*, assigned_to:users!assigned_to(*), created_by:users!created_by(*)')
    .eq('ticket_id', ticketId)
    .single()

  if (error) throw error
  return data
}

export async function updateTicket(ticketId: string, data: UpdateTicketData): Promise<Ticket> {
  const supabase = await createClient()
  const { data: ticket, error } = await supabase
    .from('tickets')
    .update({
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.tags && { tags: data.tags }),
      ...(data.assignedTo !== undefined && { assigned_to: data.assignedTo }),
      ...(data.customFields && { custom_fields: data.customFields })
    })
    .eq('ticket_id', ticketId)
    .select()
    .single()

  if (error) throw error
  return ticket
}

export async function deleteTicket(ticketId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('ticket_id', ticketId)

  if (error) throw error
}

export async function listTickets(filters?: {
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: string
  createdBy?: string
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
}): Promise<Ticket[]> {
  const supabase = await createClient()
  let query = supabase
    .from('tickets')
    .select('*, assigned_to:users!assigned_to(*), created_by:users!created_by(*)')

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

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function assignTicket(ticketId: string, userId?: string): Promise<Ticket> {
  const supabase = await createClient()
  const { data: ticket, error } = await supabase
    .from('tickets')
    .update({ assigned_to: userId })
    .eq('ticket_id', ticketId)
    .select()
    .single()

  if (error) throw error
  return ticket
}

// Message Operations
export async function createMessage(data: CreateMessageData): Promise<Message> {
  const supabase = await createClient()
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      ticket_id: data.ticketId,
      user_id: data.userId,
      content: data.content,
      visibility: data.visibility || 'public',
      message_type: data.type || 'text',
      is_ai_generated: data.isAiGenerated || false,
      metadata: data.metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return message
}

export async function getMessage(messageId: string): Promise<Message | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*, user:users(*)')
    .eq('message_id', messageId)
    .single()

  if (error) throw error
  return data
}

export async function updateMessage(messageId: string, data: UpdateMessageData): Promise<Message> {
  const supabase = await createClient()
  const { data: message, error } = await supabase
    .from('messages')
    .update({
      ...(data.content && { content: data.content }),
      ...(data.visibility && { visibility: data.visibility }),
      ...(data.metadata && { metadata: data.metadata }),
      edited_at: new Date().toISOString()
    })
    .eq('message_id', messageId)
    .select()
    .single()

  if (error) throw error
  return message
}

export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('message_id', messageId)

  if (error) throw error
}

export async function listMessages(
  ticketId: string,
  filters?: {
    visibility?: MessageVisibility
    type?: MessageType
    limit?: number
    offset?: number
  }
): Promise<Message[]> {
  const supabase = await createClient()
  let query = supabase
    .from('messages')
    .select('*, user:users(*)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (filters?.visibility) {
    query = query.eq('visibility', filters.visibility)
  }

  if (filters?.type) {
    query = query.eq('message_type', filters.type)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Attachment Operations
export async function createAttachment(data: {
  messageId: string
  fileName: string
  fileType: string
  fileSize: number
  storagePath: string
  metadata?: Record<string, any>
}): Promise<Attachment> {
  const supabase = await createClient()
  const { data: attachment, error } = await supabase
    .from('message_attachments')
    .insert({
      message_id: data.messageId,
      file_name: data.fileName,
      file_type: data.fileType,
      file_size: data.fileSize,
      storage_path: data.storagePath,
      metadata: data.metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return attachment
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('message_attachments')
    .delete()
    .eq('attachment_id', attachmentId)

  if (error) throw error
}

export async function listAttachments(messageId: string): Promise<Attachment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('message_attachments')
    .select('*')
    .eq('message_id', messageId)

  if (error) throw error
  return data
} 