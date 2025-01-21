export type UserRole = 'customer' | 'agent' | 'admin'
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'
export type MessageVisibility = 'public' | 'internal'
export type MessageType = 'text' | 'status_change' | 'assignment_change' | 'note' | 'system'

export interface User {
  user_id: string
  email: string
  name: string
  role: UserRole
  created_at: string
  metadata: Record<string, any>
}

export interface Ticket {
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
  custom_fields: Record<string, any>
}

export interface Message {
  message_id: string
  ticket_id: string
  user_id: string
  content: string
  visibility: MessageVisibility
  message_type: MessageType
  is_ai_generated: boolean
  created_at: string
  edited_at?: string
  metadata: Record<string, any>
}

export interface Attachment {
  attachment_id: string
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  uploaded_at: string
  metadata: Record<string, any>
}

// Types for database query filters
export interface UserFilters {
  role?: UserRole
  search?: string
  limit?: number
  offset?: number
}

export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  assignedTo?: string
  createdBy?: string
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export interface MessageFilters {
  visibility?: MessageVisibility
  type?: MessageType
  limit?: number
  offset?: number
} 