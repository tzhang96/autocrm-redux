export type UserRole = 'customer' | 'agent' | 'admin'
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'
export type MessageVisibility = 'public' | 'internal'
export type MessageType = 'text' | 'status_change' | 'assignment_change' | 'note' | 'system'

// Keep metadata types flexible early in development
export type Metadata = Record<string, unknown>

export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  created_at: string
  metadata: Metadata
}

export interface BaseTicket {
  id: string
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

export interface Ticket extends BaseTicket {
  // Base ticket without user objects
}

export interface TicketWithUsers extends BaseTicket {
  created_by_user?: User
  assigned_to_user?: User
}

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
  metadata: Metadata
}

export interface Attachment {
  id: string
  ticket_id: string
  filename: string
  url: string
  created_at: string
  created_by: string
  created_by_user?: User
}

// Types for database query filters
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
  assignedTo?: string
  createdBy?: string
  search?: string
  tags?: string[]
}

export interface MessageFilters extends PaginationParams {
  visibility?: MessageVisibility
  type?: MessageType
}

export interface Customer {
  id: string
  email: string
  name: string | null
}

export interface Comment {
  id: string
  ticket_id: string
  content: string
  created_at: string
  created_by: string
  created_by_user?: User
}

export interface RichTextEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  readOnly?: boolean
  placeholder?: string
} 