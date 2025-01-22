import { User, Ticket, Message, Attachment } from './index'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      tickets: {
        Row: Ticket
        Insert: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'last_activity_at'>
        Update: Partial<Omit<Ticket, 'id' | 'created_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at' | 'edited_at'>
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
      message_attachments: {
        Row: Attachment
        Insert: Omit<Attachment, 'id' | 'created_at'>
        Update: Partial<Omit<Attachment, 'id' | 'created_at'>>
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      user_role: 'customer' | 'agent' | 'admin'
      ticket_status: 'open' | 'pending' | 'resolved' | 'closed'
      ticket_priority: 'low' | 'medium' | 'high'
      message_visibility: 'public' | 'internal'
      message_type: 'text' | 'status_change' | 'assignment_change' | 'note' | 'system'
    }
  }
} 