// Re-export all types
export * from './database'

// User types
export type UserRole = 'customer' | 'agent' | 'admin'

export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  created_at: string
  metadata: Record<string, unknown>
}

// Ticket types
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'

export interface Ticket {
  ticket_id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  tags: string[]
  assigned_to?: string
  created_by: string
  customer_email: string
  created_at: string
  updated_at: string
  last_activity_at: string
  custom_fields: Record<string, unknown>
}

// Message types
export type MessageVisibility = 'public' | 'internal'
export type MessageType = 'text' | 'status_change' | 'assignment_change' | 'note' | 'system'

export interface Message {
  id: string
  ticket_id: string
  user_id: string
  content: string
  visibility: MessageVisibility
  message_type: MessageType
  is_ai_generated: boolean
  created_at: string
  edited_at?: string
  metadata: Record<string, unknown>
  user?: User
}

// Attachment types
export interface Attachment {
  id: string
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  created_at: string
  created_by: string
  metadata: Record<string, unknown>
}

// Flexible metadata type for extensibility
export type Metadata = Record<string, unknown>

// Core entity interfaces
export interface BaseTicket {
  ticket_id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  tags: string[]
  assigned_to?: string  // user_id
  created_by: string    // user_id
  customer_email: string
  created_at: string
  updated_at: string
  last_activity_at: string
  custom_fields: Metadata
}

export interface TicketWithUsers extends BaseTicket {
  created_by_user?: User
  assigned_to_user?: User
}

// Query filter types
export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface UserFilters extends PaginationParams {
  role?: UserRole
  search?: string
}

export interface TicketFilters extends PaginationParams {
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: string | null
  createdBy?: string
  customerEmail?: string
  search?: string
  tags?: string[]
  sortBy?: 'created_at' | 'updated_at' | 'last_activity_at' | 'priority' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface MessageFilters extends PaginationParams {
  visibility?: MessageVisibility
  type?: MessageType
}

// Operation input types
export interface CreateTicketData {
  title: string
  description: string
  priority: TicketPriority
  status?: TicketStatus
  customerEmail?: string
  createdBy: string
  tags?: string[]
  customFields?: Metadata
}

export interface UpdateTicketData {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: string | null
  tags?: string[]
  customFields?: Metadata
}

export interface CreateMessageData {
  ticketId: string
  userId: string
  content: string
  visibility: MessageVisibility
  messageType: MessageType
  isAiGenerated?: boolean
  metadata?: Metadata
}

export interface UpdateMessageData {
  content?: string
  metadata?: Metadata
} 