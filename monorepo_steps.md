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
│   ├── auth/                    # Shared auth package (MVP essential)
│   │   ├── src/
│   │   │   ├── middleware.ts   # Shared middleware with role checks
│   │   │   ├── server.ts      # Server-side utils
│   │   │   ├── client.ts      # Client-side utils
│   │   │   ├── types.ts       # Auth types + role enum
│   │   │   └── guards/        # Role-based auth guards
│   │   │       ├── staff.ts   # Staff-specific guards
│   │   │       └── customer.ts # Customer-specific guards
│   │   └── package.json
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

### 3. Auth Package Setup (Day 2-3)
- [ ] Set up packages/auth
  - [ ] Core auth utilities
    - [ ] Create auth types and role enum
    - [ ] Implement createBrowserClient utility
    - [ ] Implement createServerClient utility
    - [ ] Set up cookie handling per Supabase guidelines
  - [ ] Middleware implementation
    - [ ] Base updateSession middleware
    - [ ] Role-based route protection
    - [ ] Configurable redirect paths
  - [ ] Auth guards
    - [ ] Staff role guard
    - [ ] Customer role guard
    - [ ] Admin role guard
  - [ ] Tests
    - [ ] Unit tests for utilities
    - [ ] Integration tests for middleware
    - [ ] Role guard tests

### 4. API Client Setup (Day 3)
- [ ] Set up packages/api-client
  - [x] Move CustomerAPI to api-client/customer
  - [ ] Create StaffAPI in api-client/staff
    - [ ] Basic ticket management methods
    - [ ] Basic message handling
  - [ ] Integrate with auth package
    - [ ] Add auth headers to requests
    - [ ] Handle auth errors
    - [ ] Role-based API access

### 5. Customer Portal MVP (Day 4)
- [x] Set up apps/portal
  - [x] Basic Next.js setup
  - [x] Authentication integration
    - [x] Import and configure auth package
    - [x] Set up login/signup pages
    - [x] Implement customer-specific routes
    - [x] Add auth middleware
  - [x] Core ticket features
    - [x] View my tickets list
    - [x] Create new ticket
    - [x] View single ticket
    - [x] Add reply to ticket

### 6. Staff Dashboard MVP (Day 4-5)
- [x] Set up apps/dashboard
  - [x] Basic Next.js setup
  - [x] Authentication with role check
    - [x] Import and configure auth package
    - [x] Set up staff login page
    - [x] Implement staff-only routes
    - [x] Add role-based middleware
  - [ ] Core ticket management
    - [ ] View all tickets list
    - [ ] Basic ticket filtering
    - [ ] Handle single ticket
    - [ ] Reply to tickets

### 7. Testing Essential Flows (Post-MVP)
- [ ] Core package tests
  - [ ] Database operation tests (deferred)
  - [ ] API client tests (deferred)
  - [ ] Auth flow tests (deferred)
- [ ] Basic integration tests
  - [ ] Customer ticket creation flow
  - [ ] Staff ticket handling flow
  - [ ] Message threading flow
  - [ ] Role-based access tests

### 8. MVP Deployment Setup (Day 5)
- [x] Configure deployment
  - [x] Environment variables
    - [x] Supabase configuration
    - [x] Auth configuration
    - [x] API endpoints
  - [x] Build scripts
    - [x] Update core package dependencies
    - [x] Configure Turborepo build pipeline
    - [x] Add TypeScript configurations
  - [ ] Basic CI setup
- [ ] Deploy MVP
  - [ ] Deploy portal
    - [x] Configure Vercel project
    - [ ] Set environment variables
    - [ ] Deploy and verify build
  - [ ] Deploy dashboard
  - [ ] Verify core workflows
  - [ ] Test auth flows in production

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
- [ ] Enhanced auth features
  - [ ] Password reset flow
  - [ ] Email verification
  - [ ] OAuth providers
  - [ ] Session management
  - [ ] Rate limiting

## Notes
- Focus on ticket management workflow first
- Keep UI simple but functional for MVP
- Test core functionality throughout
- Only essential features in shared packages
- Delay non-critical features until after MVP
- Auth package should be flexible enough to support future features 