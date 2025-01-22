# Database Schema

## Tables

### Users
- `user_id` UUID PRIMARY KEY (default: uuid_generate_v4())
- `email` TEXT UNIQUE NOT NULL
- `name` TEXT NOT NULL
- `role` user_role NOT NULL (default: 'customer')
- `created_at` TIMESTAMP WITH TIME ZONE (default: NOW())
- `metadata` JSONB (default: '{}')

### Tickets
- `ticket_id` UUID PRIMARY KEY (default: uuid_generate_v4())
- `created_at` TIMESTAMP WITH TIME ZONE (default: NOW())
- `updated_at` TIMESTAMP WITH TIME ZONE (default: NOW())
- `last_activity_at` TIMESTAMP WITH TIME ZONE (default: NOW())
- `title` TEXT NOT NULL
- `description` TEXT NOT NULL
- `status` ticket_status NOT NULL (default: 'open')
- `priority` ticket_priority NOT NULL (default: 'medium')
- `tags` TEXT[] (default: [])
- `assigned_to` UUID REFERENCES users(user_id)
- `created_by` UUID NOT NULL REFERENCES users(user_id)
- `customer_email` TEXT NOT NULL
- `custom_fields` JSONB (default: '{}')

### Messages
- `message_id` UUID PRIMARY KEY (default: uuid_generate_v4())
- `ticket_id` UUID NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE
- `user_id` UUID NOT NULL REFERENCES users(user_id)
- `content` TEXT NOT NULL
- `visibility` message_visibility NOT NULL (default: 'public')
- `message_type` message_type NOT NULL (default: 'text')
- `is_ai_generated` BOOLEAN NOT NULL (default: false)
- `created_at` TIMESTAMP WITH TIME ZONE (default: NOW())
- `edited_at` TIMESTAMP WITH TIME ZONE
- `metadata` JSONB (default: '{}')

### Message Attachments
- `attachment_id` UUID PRIMARY KEY (default: uuid_generate_v4())
- `message_id` UUID NOT NULL REFERENCES messages(message_id) ON DELETE CASCADE
- `file_name` TEXT NOT NULL
- `file_type` TEXT NOT NULL
- `file_size` INTEGER NOT NULL
- `storage_path` TEXT NOT NULL
- `uploaded_at` TIMESTAMP WITH TIME ZONE (default: NOW())
- `metadata` JSONB (default: '{}')

## Enums

### user_role
- 'customer'
- 'agent'
- 'admin'

### ticket_status
- 'open'
- 'pending'
- 'resolved'
- 'closed'

### ticket_priority
- 'low'
- 'medium'
- 'high'

### message_visibility
- 'public'
- 'internal'

### message_type
- 'text'
- 'status_change'
- 'assignment_change'
- 'note'
- 'system'

## Indexes
- `idx_tickets_created_by` ON tickets(created_by)
- `idx_tickets_assigned_to` ON tickets(assigned_to)
- `idx_tickets_status` ON tickets(status)
- `idx_tickets_last_activity` ON tickets(last_activity_at DESC)
- `idx_tickets_customer_email` ON tickets(customer_email)
- `idx_messages_ticket_id` ON messages(ticket_id)
- `idx_message_attachments_message_id` ON message_attachments(message_id)

## Triggers
1. `update_tickets_updated_at`: Updates `updated_at` column before any update on tickets
2. `update_ticket_last_activity`: Updates `last_activity_at` after insert/update on messages 