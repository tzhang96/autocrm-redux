import { createServerClient } from '@autocrm/auth'

// Re-export with the local name for backward compatibility
export const createServerSupabaseClient: typeof createServerClient = createServerClient 