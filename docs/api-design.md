# API Design Documentation

## Core API Design

The core API provides the fundamental operations that power all role-based APIs. Each role-based API (Customer, Agent, Admin) will be built on top of these core operations, with appropriate access controls and business logic.

### Core Types

```typescript
type UserRole = 'customer' | 'agent' | 'admin'
type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high'
type MessageVisibility = 'public' | 'internal'
type MessageType = 'text' | 'status_change' | 'assignment_change' | 'note' | 'system'

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  metadata: Record<string, any>
}

interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  tags: string[]
  assignedTo?: string  // user_id
  createdBy: string    // user_id
  createdAt: Date
  updatedAt: Date
  lastActivityAt: Date
  customFields: Record<string, any>
}

interface Message {
  id: string
  ticketId: string
  userId: string
  content: string
  visibility: MessageVisibility
  type: MessageType
  isAiGenerated: boolean
  createdAt: Date
  editedAt?: Date
  metadata: Record<string, any>
}

interface Attachment {
  id: string
  messageId: string
  fileName: string
  fileType: string
  fileSize: number
  storagePath: string
  uploadedAt: Date
  metadata: Record<string, any>
}
```

### Core Database Operations

These operations form the foundation for all API endpoints:

```typescript
// User Operations
async function getUser(userId: string): Promise<User>
async function getUserByEmail(email: string): Promise<User>
async function updateUserRole(userId: string, role: UserRole): Promise<User>
async function listUsers(filters?: UserFilters): Promise<User[]>

// Ticket Operations
async function createTicket(data: CreateTicketData): Promise<Ticket>
async function getTicket(ticketId: string): Promise<Ticket>
async function updateTicket(ticketId: string, data: UpdateTicketData): Promise<Ticket>
async function deleteTicket(ticketId: string): Promise<void>
async function listTickets(filters?: TicketFilters): Promise<Ticket[]>
async function assignTicket(ticketId: string, userId?: string): Promise<Ticket>

// Message Operations
async function createMessage(data: CreateMessageData): Promise<Message>
async function getMessage(messageId: string): Promise<Message>
async function updateMessage(messageId: string, data: UpdateMessageData): Promise<Message>
async function deleteMessage(messageId: string): Promise<void>
async function listMessages(ticketId: string, filters?: MessageFilters): Promise<Message[]>

// Attachment Operations
async function createAttachment(data: CreateAttachmentData): Promise<Attachment>
async function deleteAttachment(attachmentId: string): Promise<void>
async function listAttachments(messageId: string): Promise<Attachment[]>
```

### Access Control Layer

The core API includes a permission system that enforces access rules:

```typescript
interface Permission {
  action: 'create' | 'read' | 'update' | 'delete'
  resource: 'ticket' | 'message' | 'user' | 'attachment'
  conditions?: Record<string, any>
}

interface AccessControl {
  // Check if user has permission to perform action
  async canAccess(userId: string, permission: Permission): Promise<boolean>
  
  // Get filtered data based on user's permissions
  async applyAccessFilters(userId: string, resource: string, query: any): Promise<any>
}
```

### Role-Based Access Rules

```typescript
const accessRules = {
  customer: {
    tickets: {
      create: {
        allowed: true,
        restrictions: {
          createdFor: 'self-only',    // Can only create tickets for themselves
          maxActive: 10               // Maximum number of active tickets
        }
      },
      read: (ticket) => ticket.createdBy === userId,
      update: false,
      delete: false
    },
    messages: {
      create: (ticket) => ticket.createdBy === userId,
      read: (message) => message.visibility === 'public',
      update: (message) => message.userId === userId && message.createdAt > (Date.now() - 5 * 60 * 1000),
      delete: false
    }
  },
  agent: {
    tickets: {
      create: {
        allowed: true,
        restrictions: {
          createdFor: 'any-customer'  // Can create tickets for any customer
        }
      },
      read: true,
      update: true,
      delete: false
    },
    messages: {
      create: true,
      read: true,
      update: (message) => message.userId === userId,
      delete: false
    }
  },
  admin: {
    tickets: {
      create: {
        allowed: true,
        restrictions: {
          createdFor: 'any'          // Can create tickets for anyone, including system tickets
        }
      },
      read: true,
      update: true,
      delete: true
    },
    messages: {
      create: true,
      read: true,
      update: true,
      delete: true
    }
  }
}

// Additional ticket creation validation
interface TicketCreationRules {
  onBehalfOf?: {
    allowed: boolean;
    requiredFields: string[];  // e.g., customer email, phone, etc.
  };
  systemTicket?: {
    allowed: boolean;
    requiredFields: string[];  // e.g., system component, impact level
  };
  validation: {
    maxTitleLength: number;
    maxDescriptionLength: number;
    requiredFields: string[];
    allowedPriorities: TicketPriority[];
  };
}
```

### Error Handling

Standard error responses:

```typescript
interface ApiError {
  code: string          // Machine-readable error code
  message: string       // Human-readable error message
  details?: any         // Additional error details
  status: number        // HTTP status code
}

const ErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const
```

### Validation Layer

Core validation rules that apply across all role-based APIs:

```typescript
interface ValidationRule {
  field: string
  rules: Array<{
    type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
    value?: any
    message: string
    validate?: (value: any) => boolean | Promise<boolean>
  }>
}

const validationRules = {
  ticket: {
    title: [
      { type: 'required', message: 'Title is required' },
      { type: 'minLength', value: 3, message: 'Title must be at least 3 characters' },
      { type: 'maxLength', value: 200, message: 'Title must be at most 200 characters' }
    ],
    description: [
      { type: 'required', message: 'Description is required' }
    ]
  },
  message: {
    content: [
      { type: 'required', message: 'Content is required' },
      { type: 'maxLength', value: 10000, message: 'Content must be at most 10000 characters' }
    ]
  }
}
```

This core API design provides a solid foundation for building role-specific APIs while ensuring consistent data access, validation, and error handling across the application. 