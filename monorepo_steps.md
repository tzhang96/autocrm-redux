# AutoCRM Monorepo Migration Plan

## Directory Structure
```
autocrm/
├── apps/
│   ├── portal/                    # Customer portal (MVP focus)
│   │   ├── app/
│   │   │   ├── tickets/          # View/create tickets
│   │   │   │   ├── new/         
│   │   │   │   └── [id]/        # View single ticket
│   │   │   └── layout.tsx       # Basic portal layout
│   │   ├── components/           # Portal-specific components
│   │   └── package.json
│   │
│   └── dashboard/                 # Staff dashboard (MVP focus)
│       ├── app/
│       │   ├── tickets/          # Ticket management
│       │   │   ├── list/        # List/filter tickets
│       │   │   └── [id]/        # Handle ticket
│       │   └── layout.tsx       # Basic dashboard layout
│       ├── components/           # Dashboard-specific components
│       └── package.json
│
├── packages/
│   ├── core/                     # Shared core (MVP essential)
│   │   ├── database/            # Database operations
│   │   │   ├── tickets.ts      # Ticket CRUD
│   │   │   └── messages.ts     # Message CRUD
│   │   └── types/              # Shared types
│   │       └── index.ts        # Core type definitions
│   │
│   └── api-client/              # API wrappers (MVP essential)
│       ├── customer.ts         # Customer operations
│       └── staff.ts           # Staff operations
│
└── package.json                  # Root config
```

## Migration Checklist

### 1. Initial Setup (Day 1)
- [x] Initialize monorepo structure
  - [x] Set up root package.json with workspaces
  - [x] Configure Turborepo
  - [x] Set up shared TypeScript config
  - [x] Set up shared ESLint/Prettier

### 2. Core Package Setup (Day 1-2)
- [x] Set up packages/core
  - [x] Move types to core/types
    - [x] Ticket types
    - [x] Message types
    - [x] User types
  - [x] Move database operations to core/database
    - [x] Ticket operations
    - [x] Message operations
    - [x] Basic user operations

### 3. API Client Setup (Day 2)
- [ ] Set up packages/api-client
  - [x] Move CustomerAPI to api-client/customer
  - [ ] Create StaffAPI in api-client/staff
    - [ ] Basic ticket management methods
    - [ ] Basic message handling

### 4. Customer Portal MVP (Day 3-4)
- [ ] Set up apps/portal
  - [ ] Basic Next.js setup
  - [ ] Authentication integration
  - [ ] Core ticket features
    - [ ] View my tickets list
    - [ ] Create new ticket
    - [ ] View single ticket
    - [ ] Add reply to ticket

### 5. Staff Dashboard MVP (Day 4-5)
- [ ] Set up apps/dashboard
  - [ ] Basic Next.js setup
  - [ ] Authentication with role check
  - [ ] Core ticket management
    - [ ] View all tickets list
    - [ ] Basic ticket filtering
    - [ ] Handle single ticket
    - [ ] Reply to tickets

### 6. Testing Essential Flows (Throughout)
- [ ] Core package tests
  - [ ] Database operation tests
  - [ ] API client tests
- [ ] Basic integration tests
  - [ ] Customer ticket creation flow
  - [ ] Staff ticket handling flow
  - [ ] Message threading flow

### 7. MVP Deployment Setup (Day 5)
- [ ] Configure deployment
  - [ ] Environment variables
  - [ ] Build scripts
  - [ ] Basic CI setup
- [ ] Deploy MVP
  - [ ] Deploy portal
  - [ ] Deploy dashboard
  - [ ] Verify core workflows

## Post-MVP Features
- [ ] Enhanced filtering and search
- [ ] Customer profiles
- [ ] Agent management
- [ ] System settings
- [ ] Analytics
- [ ] Shared UI component library
- [ ] Knowledge base integration
- [ ] Email notifications
- [ ] File attachments

## Notes
- Focus on ticket management workflow first
- Keep UI simple but functional for MVP
- Test core functionality throughout
- Only essential features in shared packages
- Delay non-critical features until after MVP 