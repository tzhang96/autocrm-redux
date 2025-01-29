import { Message, Ticket, User, MessageVisibility, MessageType, Metadata } from './index'

// API Types
export interface AIReplyResponse {
  reply: string
  metadata?: {
    confidence?: number
    usedDocs?: string[]
    modelName?: string
  }
}

// Tool Types
export interface TicketContext {
  ticket: Ticket
  customer: {
    name: string | null
    email: string
  }
  agent?: {
    name: string | null
    email: string
  }
}

export interface MessageHistoryEntry {
  role: 'customer' | 'agent' | 'system'
  content: string
  timestamp: string
  visibility: MessageVisibility
  type: MessageType
  metadata?: Metadata
}

export interface HelpDocsResult {
  content: string
  title: string
  relevanceScore: number
  section?: string
  url?: string
}

// Tool Response Types
export interface TicketToolResponse {
  context: TicketContext
  error?: string
}

export interface MessageHistoryToolResponse {
  messages: MessageHistoryEntry[]
  error?: string
}

export interface HelpDocsToolResponse {
  documents: HelpDocsResult[]
  error?: string
}

// Chain Types
export interface AIReplyChainInput {
  ticketId: string
  ticketContext: TicketContext
  messageHistory: MessageHistoryEntry[]
  relevantDocs?: HelpDocsResult[]
}

export interface AIReplyChainOutput {
  reply: string
  confidence: number
  usedDocs: string[]
  modelName: string
} 