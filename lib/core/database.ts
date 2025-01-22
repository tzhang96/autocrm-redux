import { createClient } from '@/utils/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { 
  User, 
  Ticket, 
  TicketWithUsers, 
  Message, 
  Attachment,
  UserRole,
  TicketStatus,
  TicketPriority,
  MessageVisibility,
  MessageType,
  Metadata,
  TicketFilters,
  MessageFilters,
  UserFilters
} from './types'

// Constants
const DEFAULT_PAGE_SIZE = 10

// Error handling
class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Helper Functions
function wrapDbError(operation: string, error: unknown): DatabaseError {
  return new DatabaseError(
    error instanceof DatabaseError ? error.message : `Failed to ${operation}`,
    operation,
    error
  )
}

// Query builders
const USER_FIELDS = {
  select: '*, created_by_user:users!tickets_created_by_fkey(id,email,name,role,created_at), assigned_to_user:users!tickets_assigned_to_fkey(id,email,name,role,created_at)'
} as const

const MESSAGE_FIELDS = {
  select: '*, user:users(id,email,name,role,created_at)'
} as const

function applyPagination(
  query: ReturnType<ReturnType<SupabaseClient['from']>['select']>,
  filters?: { limit?: number; offset?: number }
) {
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || DEFAULT_PAGE_SIZE) - 1
    )
  }
  return query
}

// Types for create/update operations
export interface CreateTicketData {
  title: string
  description: string
  priority: Ticket['priority']
  status?: Ticket['status']
  customerEmail: string
  createdBy: string
  tags?: string[]
  customFields?: Metadata
}

export interface UpdateTicketData {
  title?: string
  description?: string
  status?: Ticket['status']
  priority?: Ticket['priority']
  assignedTo?: string
  tags?: string[]
  customFields?: Metadata
}

export interface CreateMessageData {
  ticketId: string
  userId: string
  content: string
  visibility: Message['visibility']
  messageType: Message['message_type']
  isAiGenerated?: boolean
  metadata?: Metadata
}

export interface UpdateMessageData {
  content?: string
  metadata?: Metadata
}

// User Operations
export async function getUser(supabase: SupabaseClient, userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw new DatabaseError('Failed to get user', 'getUser', error)
    return data
  } catch (error) {
    throw new DatabaseError(
      error instanceof DatabaseError ? error.message : 'Failed to get user',
      'getUser',
      error
    )
  }
}

export async function getUserByEmail(supabase: SupabaseClient, email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) throw new DatabaseError('Failed to get user by email', 'getUserByEmail', error)
    return data
  } catch (error) {
    throw new DatabaseError(
      error instanceof DatabaseError ? error.message : 'Failed to get user by email',
      'getUserByEmail',
      error
    )
  }
}

export async function updateUserRole(supabase: SupabaseClient, userId: string, role: UserRole): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to update user role', 'updateUserRole', error)
    if (!data) throw new DatabaseError('User not found', 'updateUserRole')
    return data
  } catch (error) {
    throw new DatabaseError(
      error instanceof DatabaseError ? error.message : 'Failed to update user role',
      'updateUserRole',
      error
    )
  }
}

export async function listUsers(supabase: SupabaseClient, filters?: UserFilters): Promise<User[]> {
  try {
    let query = supabase.from('users').select('*')

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }

    if (filters?.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,name.ilike.%${filters.search}%`
      ).not('email', 'is', null)  // Ensure we don't match null values
    }

    query = applyPagination(query, filters)
    const { data, error } = await query

    if (error) throw new DatabaseError('Failed to list users', 'listUsers', error)
    return data || []
  } catch (error) {
    throw wrapDbError('listUsers', error)
  }
}

// Ticket Operations
export async function createTicket(supabase: SupabaseClient, data: CreateTicketData): Promise<Ticket> {
  try {
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

export async function getTicket(supabase: SupabaseClient, id: string): Promise<TicketWithUsers | null> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(USER_FIELDS.select)
      .eq('id', id)
      .single()

    if (error) throw new DatabaseError('Failed to get ticket', 'getTicket', error)
    return data
  } catch (error) {
    throw wrapDbError('getTicket', error)
  }
}

export async function updateTicket(
  supabase: SupabaseClient,
  id: string,
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
      .eq('id', id)
      .select(USER_FIELDS.select)
      .single()

    if (error) throw new DatabaseError('Failed to update ticket', 'updateTicket', error)
    if (!ticket) throw new DatabaseError('Ticket not found', 'updateTicket')
    return ticket
  } catch (error) {
    throw wrapDbError('updateTicket', error)
  }
}

export async function deleteTicket(supabase: SupabaseClient, id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError('Failed to delete ticket', 'deleteTicket', error)
  } catch (error) {
    throw wrapDbError('deleteTicket', error)
  }
}

export async function assignTicket(
  supabase: SupabaseClient,
  id: string,
  userId?: string
): Promise<TicketWithUsers> {
  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ assigned_to: userId })
      .eq('id', id)
      .select(USER_FIELDS.select)
      .single()

    if (error) throw new DatabaseError('Failed to assign ticket', 'assignTicket', error)
    if (!ticket) throw new DatabaseError('Ticket not found', 'assignTicket')
    return ticket
  } catch (error) {
    throw wrapDbError('assignTicket', error)
  }
}

export async function listTickets(
  supabase: SupabaseClient,
  filters?: TicketFilters
): Promise<Ticket[]> {
  try {
    let query = supabase
      .from('tickets')
      .select(`
        ticket_id,
        title,
        description,
        status,
        priority,
        tags,
        assigned_to,
        created_by,
        customer_email,
        created_at,
        updated_at,
        last_activity_at,
        custom_fields,
        created_by_user:users!tickets_created_by_fkey(email, name),
        assigned_to_user:users!tickets_assigned_to_fkey(email, name)
      `)
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
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
      )
    }

    query = applyPagination(query, filters)
    const { data, error } = await query

    if (error) throw new DatabaseError('Failed to list tickets', 'listTickets', error)
    
    // Transform the data to match our TypeScript interface
    return (data || []).map(ticket => ({
      ...ticket,
      id: ticket.ticket_id
    }))
  } catch (error) {
    throw wrapDbError('listTickets', error)
  }
}

// Message Operations
export async function createMessage(supabase: SupabaseClient, data: CreateMessageData): Promise<Message> {
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

export async function getMessage(supabase: SupabaseClient, id: string): Promise<Message | null> {
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

export async function deleteMessage(supabase: SupabaseClient, id: string): Promise<void> {
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

// Attachment Operations
export async function createAttachment(
  supabase: SupabaseClient,
  data: {
    messageId: string
    fileName: string
    fileType: string
    fileSize: number
    storagePath: string
    metadata?: Metadata
  }
): Promise<Attachment> {
  try {
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
      .select('*, created_by_user:users(*)')
      .single()

    if (error) throw new DatabaseError('Failed to create attachment', 'createAttachment', error)
    if (!attachment) throw new DatabaseError('Failed to create attachment', 'createAttachment')
    return attachment
  } catch (error) {
    throw wrapDbError('createAttachment', error)
  }
}

export async function deleteAttachment(supabase: SupabaseClient, id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('message_attachments')
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError('Failed to delete attachment', 'deleteAttachment', error)
  } catch (error) {
    throw wrapDbError('deleteAttachment', error)
  }
}

export async function listAttachments(supabase: SupabaseClient, messageId: string): Promise<Attachment[]> {
  try {
    const { data, error } = await supabase
      .from('message_attachments')
      .select('*, created_by_user:users(*)')
      .eq('message_id', messageId)

    if (error) throw new DatabaseError('Failed to list attachments', 'listAttachments', error)
    return data || []
  } catch (error) {
    throw wrapDbError('listAttachments', error)
  }
} 